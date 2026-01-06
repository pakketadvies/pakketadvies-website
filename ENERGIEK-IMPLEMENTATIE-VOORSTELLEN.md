# 🚀 Energiek.nl GridHub API Integratie - 3 Implementatie Voorstellen

## 📋 Context

**Energiek.nl** wil hun dynamische contracten toevoegen aan onze vergelijker via **GridHub API**.

**Belangrijke informatie:**
- **API:** GridHub (test + productie omgevingen)
- **Contract type:** Dynamisch (consument + zakelijk, zelfde tarieven)
- **Product IDs:** Consument=1, Zakelijk=5
- **Tarief IDs:** Test=11, Productie=37
- **Customer Approvals:** [1,2,3] (Algemene Voorwaarden, Privacy, Meterstand uitlezen)
- **Startdatum:** Minimaal 20 dagen (behalve inhuizing: 3 dagen)
- **Automatische incasso:** Verplicht
- **API Docs:** https://gridhub.stoplight.io/docs/gridhub-external/55a5f677023d9-create-order-request

---

## 🎯 VOORSTEL 1: Volledige Automatische Integratie (Aanbevolen) ⭐

### **Concept:**
Volledig geautomatiseerde flow waarbij aanvragen direct naar GridHub API worden gestuurd en real-time status updates ontvangen.

### **Architectuur:**

```
Klant vult formulier in
    ↓
Aanvraag opgeslagen in database (status: 'nieuw')
    ↓
Automatisch naar GridHub API (status: 'verzonden')
    ↓
GridHub bevestigt ontvangst (status: 'in_behandeling')
    ↓
GridHub verwerkt aanvraag (status: 'afgehandeld' of 'geannuleerd')
    ↓
Klant ontvangt bevestiging email
```

### **Implementatie Details:**

#### **1. Database Uitbreidingen:**

```sql
-- Nieuwe kolommen in contractaanvragen tabel
ALTER TABLE contractaanvragen ADD COLUMN IF NOT EXISTS external_api_provider VARCHAR(50); -- 'GRIDHUB', 'MANUAL', etc.
ALTER TABLE contractaanvragen ADD COLUMN IF NOT EXISTS external_order_id VARCHAR(100); -- GridHub order ID
ALTER TABLE contractaanvragen ADD COLUMN IF NOT EXISTS external_status VARCHAR(50); -- GridHub status
ALTER TABLE contractaanvragen ADD COLUMN IF NOT EXISTS external_response JSONB; -- Volledige GridHub response
ALTER TABLE contractaanvragen ADD COLUMN IF NOT EXISTS external_errors JSONB; -- Eventuele errors van API

-- Nieuwe tabel voor API configuratie per leverancier
CREATE TABLE IF NOT EXISTS leverancier_api_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leverancier_id UUID NOT NULL REFERENCES leveranciers(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'GRIDHUB', etc.
  environment VARCHAR(20) NOT NULL CHECK (environment IN ('test', 'production')),
  api_url TEXT NOT NULL,
  api_username TEXT NOT NULL,
  api_password_encrypted TEXT NOT NULL, -- Encrypted wachtwoord
  product_ids JSONB NOT NULL, -- {particulier: "1", zakelijk: "5"}
  tarief_ids JSONB NOT NULL, -- {test: "11", production: "37"}
  customer_approval_ids INTEGER[] NOT NULL, -- [1,2,3]
  min_startdatum_dagen INTEGER DEFAULT 20, -- Minimaal 20 dagen
  min_startdatum_inhuizing_dagen INTEGER DEFAULT 3, -- Minimaal 3 dagen bij inhuizing
  automatische_incasso_verplicht BOOLEAN DEFAULT true,
  actief BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **2. GridHub API Client:**

**`src/lib/integrations/gridhub/client.ts`**
```typescript
interface GridHubConfig {
  apiUrl: string
  username: string
  password: string
  environment: 'test' | 'production'
}

interface GridHubOrderRequest {
  productId: string
  tariefId: string
  customerApprovalIDs: number[]
  startDate: string // YYYY-MM-DD, minimaal 20 dagen in toekomst
  // ... andere velden volgens API docs
}

class GridHubClient {
  async createOrder(request: GridHubOrderRequest): Promise<GridHubOrderResponse>
  async getOrderStatus(orderId: string): Promise<GridHubOrderStatus>
  async cancelOrder(orderId: string): Promise<void>
}
```

#### **3. Aanvraag Verwerking:**

**`src/app/api/aanvragen/create/route.ts`** (uitbreiden):
```typescript
// Na opslaan in database:
if (leverancier heeft GridHub config) {
  const gridhubClient = new GridHubClient(config)
  const orderResponse = await gridhubClient.createOrder({
    productId: aanvraag_type === 'particulier' ? '1' : '5',
    tariefId: environment === 'production' ? '37' : '11',
    customerApprovalIDs: [1, 2, 3],
    startDate: berekenStartdatum(gaatVerhuizen),
    // ... andere velden
  })
  
  // Update aanvraag met GridHub response
  await supabase
    .from('contractaanvragen')
    .update({
      external_api_provider: 'GRIDHUB',
      external_order_id: orderResponse.orderId,
      external_status: orderResponse.status,
      external_response: orderResponse,
      status: 'verzonden'
    })
    .eq('id', aanvraagId)
}
```

#### **4. Webhook Handler (voor status updates):**

**`src/app/api/webhooks/gridhub/route.ts`**
```typescript
// GridHub stuurt webhook bij status wijziging
export async function POST(request: Request) {
  const webhook = await request.json()
  
  // Verifieer webhook signature
  // Update aanvraag status in database
  // Stuur email naar klant bij status wijziging
}
```

#### **5. Admin Dashboard:**

- **Status kolom:** Toont GridHub status
- **Order ID:** Klikbaar link naar GridHub dashboard
- **Retry knop:** Als API call faalt, kan admin retry
- **Logs:** Volledige API request/response logging

### **Voordelen:**
✅ **Volledig geautomatiseerd** - Geen handmatige stappen  
✅ **Real-time status** - Klant ziet direct status  
✅ **Schaalbaar** - Werkt voor meerdere leveranciers  
✅ **Betrouwbaar** - Webhooks voor status updates  
✅ **Traceerbaar** - Volledige logging van alle API calls  

### **Nadelen:**
❌ **Complexer** - Meer code en onderhoud  
❌ **API afhankelijkheid** - Als GridHub down is, werkt het niet  
❌ **Error handling** - Moet goed omgaan met API failures  

### **Tijdsinvestering:**
- **Setup:** 2-3 dagen
- **Testing:** 1-2 dagen
- **Totaal:** ~1 week

---

## 🎯 VOORSTEL 2: Semi-Automatisch (Handmatige Goedkeuring) ⚖️

### **Concept:**
Aanvragen worden automatisch naar GridHub API gestuurd, maar admin moet eerst goedkeuren voordat de order definitief wordt aangemaakt.

### **Architectuur:**

```
Klant vult formulier in
    ↓
Aanvraag opgeslagen (status: 'nieuw')
    ↓
Admin krijgt notificatie email
    ↓
Admin controleert aanvraag in dashboard
    ↓
Admin klikt "Goedkeuren" → GridHub API call
    ↓
GridHub bevestigt → Status: 'verzonden'
    ↓
Klant ontvangt bevestiging
```

### **Implementatie Details:**

#### **1. Database:**

Zelfde als Voorstel 1, maar met extra status:
```sql
-- Status workflow:
-- 'nieuw' → 'goedgekeurd' → 'verzonden' → 'in_behandeling' → 'afgehandeld'
ALTER TABLE contractaanvragen ADD COLUMN IF NOT EXISTS goedgekeurd_door UUID REFERENCES auth.users(id);
ALTER TABLE contractaanvragen ADD COLUMN IF NOT EXISTS goedgekeurd_op TIMESTAMP WITH TIME ZONE;
```

#### **2. Admin Dashboard:**

**`src/app/admin/aanvragen/[id]/page.tsx`**
- **"Goedkeuren" knop** - Verzendt naar GridHub API
- **Preview** - Toont wat er naar GridHub wordt gestuurd
- **Validatie** - Checkt of alle velden correct zijn

#### **3. API Route voor Goedkeuring:**

**`src/app/api/admin/aanvragen/[id]/goedkeuren/route.ts`**
```typescript
export async function POST(request: Request, { params }: { params: { id: string } }) {
  // 1. Haal aanvraag op
  // 2. Valideer aanvraag
  // 3. Roep GridHub API aan
  // 4. Update status naar 'verzonden'
  // 5. Stuur bevestiging email naar klant
}
```

### **Voordelen:**
✅ **Controle** - Admin kan aanvragen controleren voor verzending  
✅ **Minder complex** - Geen webhooks nodig  
✅ **Veiliger** - Dubbele check voordat order wordt aangemaakt  
✅ **Flexibeler** - Admin kan aanvraag aanpassen voor verzending  

### **Nadelen:**
❌ **Handmatige stap** - Admin moet elke aanvraag goedkeuren  
❌ **Vertraging** - Klant moet wachten op goedkeuring  
❌ **Niet schaalbaar** - Bij veel aanvragen wordt dit onhandelbaar  

### **Tijdsinvestering:**
- **Setup:** 1-2 dagen
- **Testing:** 1 dag
- **Totaal:** ~3 dagen

---

## 🎯 VOORSTEL 3: Handmatig (Geen API Integratie) 📝

### **Concept:**
Energiek contracten worden toegevoegd aan de vergelijker, maar aanvragen worden handmatig verwerkt (zoals nu met andere leveranciers).

### **Architectuur:**

```
Klant vult formulier in
    ↓
Aanvraag opgeslagen (status: 'nieuw')
    ↓
Admin krijgt notificatie email
    ↓
Admin opent aanvraag in dashboard
    ↓
Admin kopieert gegevens naar GridHub dashboard (handmatig)
    ↓
Admin update status naar 'afgehandeld'
```

### **Implementatie Details:**

#### **1. Contract Toevoegen:**

**Admin Dashboard → Contracten → Nieuw Contract**
- **Leverancier:** Energiek.nl
- **Type:** Dynamisch
- **Tarieven:**
  - Elektriciteit opslag: €0,01490/kWh
  - Gas opslag: €0,04959/m³
  - Vaste leveringskosten: €59,40/jaar
  - Teruglevering opslag: €0,01490/kWh

#### **2. Aanvraag Formulier:**

- **Extra veld:** "Automatische incasso verplicht" (checkbox, altijd aangevinkt)
- **Startdatum validatie:** Minimaal 20 dagen (behalve inhuizing: 3 dagen)

#### **3. Admin Dashboard:**

**`src/app/admin/aanvragen/[id]/page.tsx`**
- **"Export naar GridHub" knop** - Genereert JSON volgens GridHub format
- **Copy-to-clipboard** - Admin kan JSON kopiëren en in GridHub plakken
- **Preview** - Toont hoe de order eruit ziet in GridHub

#### **4. Helper Script:**

**`src/lib/integrations/gridhub/export-helper.ts`**
```typescript
export function exportToGridHubFormat(aanvraag: ContractAanvraag): GridHubOrderRequest {
  return {
    productId: aanvraag.aanvraag_type === 'particulier' ? '1' : '5',
    tariefId: '37', // Production
    customerApprovalIDs: [1, 2, 3],
    startDate: berekenStartdatum(aanvraag),
    // ... andere velden
  }
}
```

### **Voordelen:**
✅ **Simpel** - Geen API integratie nodig  
✅ **Geen afhankelijkheden** - Werkt altijd  
✅ **Flexibel** - Admin kan aanpassingen maken  
✅ **Snel te implementeren** - Alleen contract toevoegen  

### **Nadelen:**
❌ **Handmatig werk** - Elke aanvraag moet handmatig worden verwerkt  
❌ **Foutgevoelig** - Handmatig kopiëren kan fouten bevatten  
❌ **Niet schaalbaar** - Bij veel aanvragen wordt dit onhandelbaar  
❌ **Geen real-time status** - Klant ziet geen updates  

### **Tijdsinvestering:**
- **Setup:** 0.5 dag
- **Testing:** 0.5 dag
- **Totaal:** ~1 dag

---

## 📊 Vergelijking

| Feature | Voorstel 1 (Automatisch) | Voorstel 2 (Semi) | Voorstel 3 (Handmatig) |
|---------|-------------------------|-------------------|------------------------|
| **Automatisering** | ✅ Volledig | ⚠️ Gedeeltelijk | ❌ Handmatig |
| **Schaalbaarheid** | ✅ Excellent | ⚠️ Beperkt | ❌ Slecht |
| **Complexiteit** | ❌ Hoog | ⚠️ Medium | ✅ Laag |
| **Tijdsinvestering** | ❌ ~1 week | ⚠️ ~3 dagen | ✅ ~1 dag |
| **Betrouwbaarheid** | ⚠️ API afhankelijk | ✅ Goed | ✅ Excellent |
| **Klant ervaring** | ✅ Real-time | ⚠️ Vertraging | ❌ Geen updates |
| **Admin werk** | ✅ Minimaal | ⚠️ Goedkeuring | ❌ Veel werk |

---

## 🎯 Aanbeveling

### **Voor Korte Termijn (Direct):**
**Voorstel 3 (Handmatig)** - Snel te implementeren, werkt direct, geen risico's.

### **Voor Middellange Termijn (1-2 maanden):**
**Voorstel 2 (Semi-Automatisch)** - Goede balans tussen automatisering en controle.

### **Voor Lange Termijn (3-6 maanden):**
**Voorstel 1 (Volledig Automatisch)** - Beste klant ervaring, volledig schaalbaar, maar vereist meer ontwikkeling.

---

## 🚀 Volgende Stappen (Als Voorstel 1 wordt gekozen)

1. **GridHub API Credentials** - Vraag test + productie credentials aan
2. **API Documentatie** - Bestudeer volledige API docs
3. **Test Omgeving** - Implementeer eerst in test omgeving
4. **Database Migratie** - Voeg nieuwe kolommen toe
5. **GridHub Client** - Implementeer API client
6. **Aanvraag Flow** - Integreer in bestaande aanvraag flow
7. **Webhook Handler** - Implementeer status updates
8. **Admin Dashboard** - Voeg GridHub status toe
9. **Testing** - Uitgebreide testing met echte aanvragen
10. **Production Deploy** - Deploy naar productie

---

## 📝 Belangrijke Aandachtspunten

### **Startdatum Validatie:**
```typescript
function berekenStartdatum(gaatVerhuizen: boolean, huidigeDatum: Date): Date {
  const minDagen = gaatVerhuizen ? 3 : 20
  const startdatum = new Date(huidigeDatum)
  startdatum.setDate(startdatum.getDate() + minDagen)
  return startdatum
}
```

### **Automatische Incasso:**
- Altijd verplicht voor Energiek contracten
- Checkbox moet altijd aangevinkt zijn (disabled)
- Validatie in formulier: als unchecked → error

### **Customer Approvals:**
- [1,2,3] altijd vereist voor dynamische contracten
- Toon in formulier wat klant goedkeurt
- Link naar Algemene Voorwaarden en Privacyverklaring

### **Error Handling:**
- Als GridHub API faalt → status 'fout', admin krijgt notificatie
- Retry mechanisme voor tijdelijke failures
- Fallback naar handmatige verwerking bij persistente errors

---

## ❓ Vragen voor Energiek

1. **Webhook URL:** Kunnen we een webhook URL instellen voor status updates?
2. **Test Credentials:** Wanneer krijgen we test credentials?
3. **Error Handling:** Hoe moeten we omgaan met API errors?
4. **Order Cancellation:** Kunnen we orders annuleren via API?
5. **Status Polling:** Als geen webhooks, kunnen we status pollen?
6. **Rate Limiting:** Zijn er rate limits op de API?

---

**Gemaakt op:** 2026-01-05  
**Door:** AI Assistant  
**Voor:** PakketAdvies.nl

