# 📊 Admin Tarieven Pagina 2026 - Update Voorstel

## 🔍 Huidige Situatie

De admin pagina toont momenteel alleen 2025 tarieven. Per 1 januari 2026 zijn de overheidstarieven gewijzigd.

## 📋 2026 Tarieven (Bevestigd)

### ⚠️ **BELANGRIJK: BTW Omrekening**
**Gaslicht.com toont tarieven INCLUSIEF BTW, maar onze database slaat tarieven op als EXCLUSIEF BTW.**

Daarom moeten we de tarieven omrekenen: `tarief_incl_btw / 1.21 = tarief_excl_btw`

### **Energiebelasting Elektriciteit:**
- **2025 (incl. BTW):** €0.1228 per kWh → **Excl. BTW:** €0.1015 per kWh
- **2026 (incl. BTW):** €0.1108 per kWh → **Excl. BTW:** €0.0915 per kWh
- **Verschil:** -€0.0120 per kWh (-9.8%)

**Schijven (vermoedelijk gelijk aan 2025):**
- Schijf 1: 0-2.900 kWh → **€0.0915/kWh** (excl. BTW, was €0.1108 incl. BTW)
- Schijf 2: 2.901-10.000 kWh → **€0.0915/kWh** (excl. BTW, was €0.1108 incl. BTW)
- Schijf 3: 10.001-50.000 kWh → **€0.0915/kWh** (excl. BTW, was €0.1108 incl. BTW)
- Schijf 4: >50.000 kWh → **€0.0915/kWh** (excl. BTW, was €0.1108 incl. BTW)

**⚠️ Opmerking:** In 2026 lijken alle schijven hetzelfde tarief te hebben (€0.1108 incl. BTW = €0.0915 excl. BTW), in tegenstelling tot 2025 waar schijf 3 en 4 lagere tarieven hadden.

### **Energiebelasting Gas:**
- **2025 (incl. BTW):** €0.6996 per m³ → **Excl. BTW:** €0.5782 per m³
- **2026 (incl. BTW):** €0.7267 per m³ → **Excl. BTW:** €0.6006 per m³
- **Verschil:** +€0.0271 per m³ (+3.9%)

**Schijven:**
- Schijf 1: 0-1.000 m³ → **€0.6006/m³** (excl. BTW, was €0.7267 incl. BTW)
- Schijf 2: >1.000 m³ → **€0.6006/m³** (excl. BTW, was €0.7267 incl. BTW)

### **Vermindering Energiebelasting:**
- **2025:** €635.19 per jaar
- **2026:** €628.96 per jaar
- **Verschil:** -€6.23 per jaar

### **BTW:**
- **2025:** 21%
- **2026:** 21% (ongewijzigd)

### **ODE (Opslag Duurzame Energie):**
- **Status:** Nog te verifiëren voor 2026
- **Voorstel:** Voorlopig zelfde als 2025, later bijwerken indien nodig

---

## 🎯 Voorstel: Admin Pagina Updates

### **1. Automatische Jaar Selectie**

**Huidige situatie:** Pagina toont alle jaren, maar geen duidelijke indicatie welk jaar actief is.

**Voorstel:**
- Toon **2026** als primair jaar (groot, prominent)
- Toon **2025** als historisch jaar (kleiner, grijzer)
- Duidelijke badge: "Actief 2026" vs "Historisch 2025"
- Automatisch 2026 selecteren als default bij laden

**Implementatie:**
```typescript
// In tarieven/page.tsx
const currentYear = new Date().getFullYear() // 2026
const [selectedYear, setSelectedYear] = useState(currentYear)

// Filter en sorteer tarieven
const sortedTarieven = overheidTarieven.sort((a, b) => {
  if (a.jaar === currentYear) return -1
  if (b.jaar === currentYear) return 1
  return b.jaar - a.jaar
})
```

### **2. Wijzigingen Indicator**

**Voorstel:**
- Toon een **"Nieuw in 2026"** badge bij 2026 tarieven
- Toon **wijzigingen t.o.v. 2025** in een tooltip of expandable sectie
- Kleurcode: groen voor daling, rood voor stijging

**Voorbeeld:**
```
2026 (Nieuw)
├─ EB Stroom: €0.1108/kWh (-9.8% t.o.v. 2025)
├─ EB Gas: €0.7267/m³ (+3.9% t.o.v. 2025)
└─ Vermindering: €628.96 (-€6.23 t.o.v. 2025)
```

### **3. Vergelijkingstabel**

**Voorstel:**
- Optionele **"Vergelijk met 2025"** toggle
- Side-by-side vergelijking van tarieven
- Duidelijke highlighting van wijzigingen

### **4. Actief/Historisch Status**

**Voorstel:**
- **2026:** Groene badge "Actief" + "Huidig jaar"
- **2025:** Grijze badge "Historisch" + "Tot 31-12-2025"
- Automatisch 2025 deactiveren bij activatie 2026 (optioneel)

### **5. "Nieuw Jaar Toevoegen" Functionaliteit**

**Huidige situatie:** Button is disabled met "binnenkort".

**Voorstel:**
- **Enable de button** voor 2027 (volgend jaar)
- Formulier om nieuwe tarieven in te voeren
- Validatie: check of jaar nog niet bestaat
- Copy-from-previous-year functionaliteit

### **6. ODE Tarieven Update**

**Voorstel:**
- Toon **"ODE nog te verifiëren"** badge bij 2026
- Link naar bron voor verificatie
- Update knop zodra ODE tarieven bekend zijn

---

## 🎨 UI/UX Verbeteringen

### **1. Jaar Selector**
```tsx
<div className="flex gap-2 mb-6">
  {[2026, 2025].map(year => (
    <button
      key={year}
      onClick={() => setSelectedYear(year)}
      className={`px-4 py-2 rounded-lg font-semibold ${
        selectedYear === year
          ? 'bg-brand-teal-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {year} {year === currentYear && '• Actief'}
    </button>
  ))}
</div>
```

### **2. Wijzigingen Badge**
```tsx
{tarief.jaar === 2026 && (
  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <h4 className="font-semibold text-blue-900 mb-2">Wijzigingen t.o.v. 2025:</h4>
    <ul className="text-sm space-y-1 text-blue-800">
      <li>⚡ EB Stroom: <span className="text-green-600 font-semibold">-9.8%</span></li>
      <li>🔥 EB Gas: <span className="text-red-600 font-semibold">+3.9%</span></li>
      <li>💰 Vermindering: <span className="text-red-600 font-semibold">-€6.23</span></li>
    </ul>
  </div>
)}
```

### **3. Actief Status Badge**
```tsx
{tarief.jaar === currentYear ? (
  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
    <CheckCircle size={14} weight="fill" />
    Actief • Huidig jaar
  </span>
) : (
  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
    <Clock size={14} weight="fill" />
    Historisch
  </span>
)}
```

---

## 📝 Implementatie Checklist

### **Fase 1: Database Update** ✅
- [x] Migratie script: `045_add_tarieven_overheid_2026.sql` (met BTW omrekening)
- [x] BTW omrekening: €0.1108/kWh → €0.0915/kWh (excl. BTW)
- [x] BTW omrekening: €0.7267/m³ → €0.6006/m³ (excl. BTW)
- [ ] Migratie uitvoeren in Supabase
- [ ] Verificatie: check of 2026 tarieven correct zijn ingevoerd

### **Fase 2: Admin Pagina Updates**
- [ ] Jaar selector toevoegen (2026/2025 toggle)
- [ ] "Nieuw in 2026" badge toevoegen
- [ ] Wijzigingen indicator toevoegen
- [ ] Actief/Historisch status badges verbeteren
- [ ] ODE "nog te verifiëren" badge toevoegen

### **Fase 3: Functionaliteit**
- [ ] "Nieuw Jaar Toevoegen" button enable voor 2027
- [ ] Formulier voor nieuwe tarieven
- [ ] Copy-from-previous-year functionaliteit
- [ ] Validatie: check of jaar al bestaat

### **Fase 4: Testing**
- [ ] Test: 2026 tarieven worden correct getoond
- [ ] Test: Wijzigingen worden correct berekend
- [ ] Test: Jaar selector werkt
- [ ] Test: Berekeningen gebruiken 2026 tarieven

---

## ⚠️ Belangrijke Opmerkingen

1. **ODE Tarieven:** Deze moeten nog worden geverifieerd voor 2026. Voorlopig gebruiken we 2025 waarden.

2. **Schijven Elektriciteit:** In 2026 lijken alle schijven hetzelfde tarief te hebben (€0.1108). Dit is anders dan 2025 waar schijf 3 en 4 lagere tarieven hadden. Dit moet worden bevestigd.

3. **Netbeheertarieven:** Deze moeten ook worden bijgewerkt voor 2026 (gemiddeld +3.38% stijging). Dit is een aparte update.

4. **Modeltarieven:** Eneco modeltarieven moeten mogelijk ook worden bijgewerkt voor 2026, afhankelijk van nieuwe Eneco tarieven.

---

## 🚀 Quick Win: Directe Fix

Voor een snelle update zonder grote UI wijzigingen:

1. **Run migratie** `045_add_tarieven_overheid_2026.sql`
2. **Check admin pagina** - 2026 zou automatisch moeten verschijnen
3. **Verifieer tarieven** - check of alles correct is

De admin pagina zou automatisch 2026 moeten tonen omdat het het hoogste jaar is (sorteert op `jaar DESC`).

---

**Gemaakt op:** 2026-01-05  
**Status:** Klaar voor implementatie  
**Volgende stap:** Migratie uitvoeren + admin pagina verbeteren

