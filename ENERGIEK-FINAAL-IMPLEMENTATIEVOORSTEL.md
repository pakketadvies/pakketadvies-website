# 🚀 Energiek.nl GridHub API - Finaal Implementatievoorstel

## 📋 Executive Summary

**Doel:** Volledige automatische integratie van Energiek.nl dynamische contracten via GridHub API.

**Aanpak:** Gebruik "Create Order Request" endpoint (voor incomplete orders zonder EAN) met automatische status polling via status feed API.

**Tijdsinvestering:** ~1 week (5-7 werkdagen)

---

## 🎯 Architectuur Overzicht

```
┌─────────────────────────────────────────────────────────────┐
│  Klant vult aanvraag formulier in                          │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Aanvraag opgeslagen in database (status: 'nieuw')         │
│  - contractaanvragen tabel                                  │
│  - external_api_provider: null                             │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  GridHub API Call (Create Order Request)                   │
│  - POST /api/external/v1/orderrequests                     │
│  - Bearer Auth                                             │
│  - Relation object + requestedConnections                  │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  GridHub Response                                           │
│  - orderRequestId                                           │
│  - Status: NEW                                              │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Database Update                                            │
│  - external_api_provider: 'GRIDHUB'                         │
│  - external_order_id: orderRequestId                        │
│  - external_status: 'NEW'                                  │
│  - status: 'verzonden'                                      │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Status Polling (elke 5 minuten)                           │
│  - GET /api/external/v1/orderrequests/statusfeed            │
│  - timestampFrom: laatste check                            │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Status Updates                                             │
│  - NEW → NEEDSATTENTION → CREATED → (order status)         │
│  - Database update + email naar klant                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema Uitbreidingen

### **1. Contractaanvragen Tabel Uitbreiding**

```sql
-- Migration: Add GridHub API integration fields
ALTER TABLE contractaanvragen 
  ADD COLUMN IF NOT EXISTS external_api_provider VARCHAR(50), -- 'GRIDHUB', 'MANUAL', null
  ADD COLUMN IF NOT EXISTS external_order_id VARCHAR(100), -- GridHub orderRequestId
  ADD COLUMN IF NOT EXISTS external_order_request_id VARCHAR(100), -- GridHub orderRequestId (same as above, maar expliciet)
  ADD COLUMN IF NOT EXISTS external_status VARCHAR(50), -- GridHub status (NEW, CREATED, CANCELLED, etc.)
  ADD COLUMN IF NOT EXISTS external_sub_status_id VARCHAR(50), -- GridHub subStatusID
  ADD COLUMN IF NOT EXISTS external_status_reason TEXT, -- GridHub statusReason
  ADD COLUMN IF NOT EXISTS external_response JSONB, -- Volledige GridHub API response
  ADD COLUMN IF NOT EXISTS external_errors JSONB, -- Eventuele API errors
  ADD COLUMN IF NOT EXISTS external_last_sync TIMESTAMP WITH TIME ZONE; -- Laatste status sync

-- Indexes voor snelle queries
CREATE INDEX IF NOT EXISTS idx_contractaanvragen_external_order_id 
  ON contractaanvragen(external_order_id) 
  WHERE external_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contractaanvragen_external_status 
  ON contractaanvragen(external_status) 
  WHERE external_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contractaanvragen_external_api_provider 
  ON contractaanvragen(external_api_provider) 
  WHERE external_api_provider IS NOT NULL;
```

### **2. Leverancier API Configuratie Tabel**

```sql
-- Migration: Create leverancier_api_config table
CREATE TABLE IF NOT EXISTS leverancier_api_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leverancier_id UUID NOT NULL REFERENCES leveranciers(id) ON DELETE CASCADE,
  
  -- Provider info
  provider VARCHAR(50) NOT NULL, -- 'GRIDHUB'
  environment VARCHAR(20) NOT NULL CHECK (environment IN ('test', 'production')),
  
  -- API credentials
  api_url TEXT NOT NULL, -- https://energiek.gridhub.cloud/api/external/v1
  api_username TEXT NOT NULL, -- API gebruiker van GridHub
  api_password_encrypted TEXT NOT NULL, -- Encrypted wachtwoord (gebruik Supabase Vault of encryptie)
  
  -- Product & Tariff IDs
  product_ids JSONB NOT NULL, -- {"particulier": "1", "zakelijk": "5"}
  tarief_ids JSONB NOT NULL, -- {"test": "11", "production": "37"}
  
  -- Customer approvals
  customer_approval_ids INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3], -- [1,2,3]
  
  -- Startdatum regels
  min_startdatum_dagen INTEGER NOT NULL DEFAULT 20, -- Minimaal 20 dagen
  min_startdatum_inhuizing_dagen INTEGER NOT NULL DEFAULT 3, -- Minimaal 3 dagen bij inhuizing
  
  -- Automatische incasso
  automatische_incasso_verplicht BOOLEAN NOT NULL DEFAULT true,
  
  -- Status polling config
  status_polling_enabled BOOLEAN NOT NULL DEFAULT true,
  status_polling_interval_minuten INTEGER NOT NULL DEFAULT 5, -- Elke 5 minuten
  
  -- Actief
  actief BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: één config per leverancier per environment
  CONSTRAINT unique_leverancier_api_config UNIQUE (leverancier_id, provider, environment)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leverancier_api_config_leverancier 
  ON leverancier_api_config(leverancier_id);
  
CREATE INDEX IF NOT EXISTS idx_leverancier_api_config_actief 
  ON leverancier_api_config(actief) 
  WHERE actief = true;

-- RLS Policies
ALTER TABLE leverancier_api_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access leverancier_api_config" 
  ON leverancier_api_config FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Comments
COMMENT ON TABLE leverancier_api_config IS 'API configuratie per leverancier voor externe integraties (GridHub, etc.)';
COMMENT ON COLUMN leverancier_api_config.api_password_encrypted IS 'Encrypted API wachtwoord - gebruik Supabase Vault of encryptie library';
COMMENT ON COLUMN leverancier_api_config.product_ids IS 'JSONB: {"particulier": "1", "zakelijk": "5"}';
COMMENT ON COLUMN leverancier_api_config.tarief_ids IS 'JSONB: {"test": "11", "production": "37"}';
```

---

## 🔧 Code Implementatie

### **1. GridHub API Client**

**`src/lib/integrations/gridhub/client.ts`**

```typescript
/**
 * GridHub API Client
 * 
 * Handles all communication with GridHub External API
 * Documentation: https://gridhub.stoplight.io/docs/gridhub-external
 */

interface GridHubConfig {
  apiUrl: string // https://energiek.gridhub.cloud/api/external/v1
  username: string
  password: string
  environment: 'test' | 'production'
}

interface GridHubRelation {
  type: 'CONSUMER' | 'BUSINESS'
  firstName: string
  middleName?: string
  lastName: string
  gender: 'MALE' | 'FEMALE'
  birthDate: string // YYYY-MM-DD
  phoneNumber: string
  emailAddress: string
  street: string
  houseNumber: number
  houseNumberAddition?: string
  postalCode: string
  city: string
  country: string // 'NL'
  companyName?: string // Verplicht voor BUSINESS
  companyCoCNumber?: string // Verplicht voor BUSINESS
  bankAccountType: 'IBAN' | 'BIC'
  bankAccountNumber: string
  paymentMethod: 'DIRECT_DEBIT' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'IDEAL' | 'PAYPAL'
  mandateDate: string // YYYY-MM-DD
  mandateReference?: string
}

interface GridHubRequestedConnection {
  postalCode: string
  houseNumber: number
  houseNumberAddition?: string
  hasElectricity: boolean
  hasGas: boolean
  meterType?: 'SMART' | 'CONVENTIONAL' | 'UNKNOWN'
  capacityCodeElectricity?: string // CapTar code (bijv. "10211")
  capacityCodeGas?: string
  usageElectricityHigh?: string // kWh per jaar
  usageElectricityLow?: string
  usageElectricitySingle?: string
  usageGas?: string // m³ per jaar
  returnElectricityHigh?: string
  returnElectricityLow?: string
  returnElectricitySingle?: string
  switchTypeElectricity?: 'SWITCH' | 'NEW' | 'MOVE' | 'UNKNOWN'
  switchTypeGas?: 'SWITCH' | 'NEW' | 'MOVE' | 'UNKNOWN'
  hasP1Data?: boolean
  expectedAdvancePaymentAmountElectricity?: string
  expectedAdvancePaymentAmountGas?: string
  customerApprovalLEDs: boolean // Verplicht: true
  billingIDs?: string[]
  originalCreateTimestamp?: string // ISO date-time
}

interface GridHubCreateOrderRequestPayload {
  relation: GridHubRelation
  externalUser?: {
    firstName?: string
    middleName?: string
    lastName?: string
    externalReference?: string
  }
  externalOrganization?: {
    name?: string
    externalReference?: string
  }
  requestedConnections: GridHubRequestedConnection[]
  productID: string // "1" voor particulier, "5" voor zakelijk
  tariffID: string // "11" voor test, "37" voor productie
  customerApprovalIDs: number[] // [1,2,3]
  signTimestamp: string // ISO date-time
  signType: string // 'EMAIL', 'SMS', 'DIGITAL', etc.
  signSource: string // 'DIRECT_DEBIT_MANDATE', 'EMAIL', etc.
  signIP: string // Client IP address
  signData: string // Base64 encoded signature data
}

interface GridHubCreateOrderRequestResponse {
  orderRequestId: string
  // ... andere response velden
}

interface GridHubStatusFeedEntry {
  id: number
  externalReference: string
  timestamp: string
  status: 'NEW' | 'NEEDSATTENTION' | 'CANCELLED' | 'CREATED'
  statusReason?: string
  order?: {
    id: number
    status: string
    statusReason?: string
    subStatusID?: string
  }
}

interface GridHubStatusFeedResponse {
  data: GridHubStatusFeedEntry[]
}

export class GridHubClient {
  private config: GridHubConfig
  private authToken: string | null = null

  constructor(config: GridHubConfig) {
    this.config = config
  }

  /**
   * Get Bearer token (Basic Auth -> Bearer token)
   * GridHub gebruikt Basic Auth voor authenticatie
   */
  private async getAuthToken(): Promise<string> {
    if (this.authToken) {
      return this.authToken
    }

    // GridHub gebruikt Basic Auth
    const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')
    
    // In de praktijk: GridHub gebruikt waarschijnlijk Basic Auth direct in requests
    // Check API docs voor exacte auth methode
    this.authToken = credentials
    return this.authToken
  }

  /**
   * Create Order Request
   * POST /api/external/v1/orderrequests
   */
  async createOrderRequest(
    payload: GridHubCreateOrderRequestPayload
  ): Promise<GridHubCreateOrderRequestResponse> {
    const authToken = await this.getAuthToken()
    
    const response = await fetch(`${this.config.apiUrl}/orderrequests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authToken}`, // Of Bearer, check API docs
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(`GridHub API error: ${response.status} - ${JSON.stringify(error)}`)
    }

    return await response.json()
  }

  /**
   * Get Order Request Status Feed
   * GET /api/external/v1/orderrequests/statusfeed?timestampFrom={date-time}
   */
  async getOrderRequestStatusFeed(
    timestampFrom: Date
  ): Promise<GridHubStatusFeedResponse> {
    const authToken = await this.getAuthToken()
    const timestampFromISO = timestampFrom.toISOString()
    
    const response = await fetch(
      `${this.config.apiUrl}/orderrequests/statusfeed?timestampFrom=${encodeURIComponent(timestampFromISO)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${authToken}`, // Of Bearer
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(`GridHub API error: ${response.status} - ${JSON.stringify(error)}`)
    }

    return await response.json()
  }

  /**
   * Get Order Status Feed (voor orders die CREATED zijn)
   * GET /api/external/v1/orders/statusfeed?timestampFrom={date-time}
   */
  async getOrderStatusFeed(
    timestampFrom: Date
  ): Promise<GridHubStatusFeedResponse> {
    const authToken = await this.getAuthToken()
    const timestampFromISO = timestampFrom.toISOString()
    
    const response = await fetch(
      `${this.config.apiUrl}/orders/statusfeed?timestampFrom=${encodeURIComponent(timestampFromISO)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${authToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(`GridHub API error: ${response.status} - ${JSON.stringify(error)}`)
    }

    return await response.json()
  }

  /**
   * Cancel Order Request
   * POST /api/external/v1/orderrequests/{orderRequestId}/cancel
   */
  async cancelOrderRequest(
    orderRequestId: string,
    subStatusID: string,
    description: string
  ): Promise<void> {
    const authToken = await this.getAuthToken()
    
    const response = await fetch(
      `${this.config.apiUrl}/orderrequests/${orderRequestId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${authToken}`,
        },
        body: JSON.stringify({
          subStatusID,
          description,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(`GridHub API error: ${response.status} - ${JSON.stringify(error)}`)
    }
  }
}
```

### **2. Data Mapping Helper**

**`src/lib/integrations/gridhub/mapper.ts`**

```typescript
/**
 * Maps our internal aanvraag data to GridHub API format
 */

import type { ContractAanvraag } from '@/types/aanvragen'
import type { GridHubCreateOrderRequestPayload, GridHubRelation, GridHubRequestedConnection } from './client'

interface MapToGridHubOptions {
  aanvraag: ContractAanvraag
  productId: string
  tariffId: string
  customerApprovalIDs: number[]
  clientIP: string
  signTimestamp: Date
}

export function mapAanvraagToGridHubOrderRequest(
  options: MapToGridHubOptions
): GridHubCreateOrderRequestPayload {
  const { aanvraag, productId, tariffId, customerApprovalIDs, clientIP, signTimestamp } = options
  
  const gegevens = aanvraag.gegevens_data
  const verbruik = aanvraag.verbruik_data
  const leveringsadres = verbruik.leveringsadressen?.[0]

  // Map relation
  const relation: GridHubRelation = {
    type: aanvraag.aanvraag_type === 'particulier' ? 'CONSUMER' : 'BUSINESS',
    firstName: gegevens.voornaam || gegevens.firstName || '',
    middleName: gegevens.tussenvoegsel || gegevens.middleName,
    lastName: gegevens.achternaam || gegevens.lastName || '',
    gender: gegevens.geslacht === 'man' ? 'MALE' : gegevens.geslacht === 'vrouw' ? 'FEMALE' : 'MALE', // Default
    birthDate: gegevens.geboortedatum || gegevens.birthDate || '', // YYYY-MM-DD
    phoneNumber: gegevens.telefoonnummer || gegevens.telefoon || '',
    emailAddress: gegevens.emailadres || gegevens.email || '',
    street: leveringsadres?.straat || '',
    houseNumber: parseInt(leveringsadres?.huisnummer || '0', 10),
    houseNumberAddition: leveringsadres?.toevoeging,
    postalCode: leveringsadres?.postcode?.replace(/\s/g, '').toUpperCase() || '',
    city: leveringsadres?.plaats || '',
    country: 'NL',
    companyName: aanvraag.aanvraag_type === 'zakelijk' ? gegevens.bedrijfsnaam : undefined,
    companyCoCNumber: aanvraag.aanvraag_type === 'zakelijk' ? gegevens.kvkNummer : undefined,
    bankAccountType: 'IBAN',
    bankAccountNumber: aanvraag.iban || '',
    paymentMethod: 'DIRECT_DEBIT', // Altijd verplicht voor Energiek
    mandateDate: new Date().toISOString().split('T')[0], // Vandaag
    mandateReference: undefined, // Optioneel
  }

  // Map requested connection
  const hasElectricity = !verbruik.geenElektriciteitsaansluiting && (verbruik.elektriciteitNormaal > 0 || verbruik.elektriciteitDal > 0)
  const hasGas = !verbruik.geenGasaansluiting && (verbruik.gasJaar > 0)

  // Bereken startdatum (minimaal 20 dagen, behalve inhuizing: 3 dagen)
  const minDagen = aanvraag.gaat_verhuizen ? 3 : 20
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + minDagen)
  const startDateStr = startDate.toISOString().split('T')[0]

  const requestedConnection: GridHubRequestedConnection = {
    postalCode: leveringsadres?.postcode?.replace(/\s/g, '').toUpperCase() || '',
    houseNumber: parseInt(leveringsadres?.huisnummer || '0', 10),
    houseNumberAddition: leveringsadres?.toevoeging,
    hasElectricity,
    hasGas,
    meterType: verbruik.meterType === 'slim' ? 'SMART' : verbruik.meterType === 'enkelvoudig' ? 'CONVENTIONAL' : 'UNKNOWN',
    capacityCodeElectricity: mapAansluitwaardeToCapTar(verbruik.aansluitwaardeElektriciteit),
    capacityCodeGas: mapAansluitwaardeToCapTar(verbruik.aansluitwaardeGas),
    usageElectricityHigh: hasElectricity && verbruik.elektriciteitNormaal ? verbruik.elektriciteitNormaal.toString() : undefined,
    usageElectricityLow: hasElectricity && verbruik.elektriciteitDal ? verbruik.elektriciteitDal.toString() : undefined,
    usageElectricitySingle: hasElectricity && !verbruik.heeftDubbeleMeter && verbruik.elektriciteitNormaal ? verbruik.elektriciteitNormaal.toString() : undefined,
    usageGas: hasGas && verbruik.gasJaar ? verbruik.gasJaar.toString() : undefined,
    returnElectricityHigh: hasElectricity && verbruik.terugleveringJaar && verbruik.heeftDubbeleMeter ? verbruik.terugleveringJaar.toString() : undefined,
    returnElectricityLow: undefined, // Niet beschikbaar in onze data
    returnElectricitySingle: hasElectricity && verbruik.terugleveringJaar && !verbruik.heeftDubbeleMeter ? verbruik.terugleveringJaar.toString() : undefined,
    switchTypeElectricity: aanvraag.gaat_verhuizen ? 'MOVE' : 'SWITCH',
    switchTypeGas: aanvraag.gaat_verhuizen ? 'MOVE' : 'SWITCH',
    hasP1Data: verbruik.meterType === 'slim',
    expectedAdvancePaymentAmountElectricity: undefined, // Wordt door GridHub berekend
    expectedAdvancePaymentAmountGas: undefined, // Wordt door GridHub berekend
    customerApprovalLEDs: true, // Verplicht: true
    billingIDs: undefined, // Optioneel
    originalCreateTimestamp: aanvraag.created_at,
  }

  // Sign data (vereist voor GridHub)
  // In productie: gebruik echte signature data
  // Voor nu: placeholder
  const signData = generateSignData(gegevens, signTimestamp)

  return {
    relation,
    externalUser: {
      firstName: gegevens.voornaam,
      lastName: gegevens.achternaam,
      externalReference: aanvraag.aanvraagnummer, // Ons aanvraagnummer als external reference
    },
    externalOrganization: undefined, // Optioneel
    requestedConnections: [requestedConnection],
    productID: productId,
    tariffID: tariffId,
    customerApprovalIDs: customerApprovalIDs,
    signTimestamp: signTimestamp.toISOString(),
    signType: 'EMAIL', // Of 'DIGITAL', 'SMS', etc. - check met Energiek
    signSource: 'DIRECT_DEBIT_MANDATE', // Of 'EMAIL', etc. - check met Energiek
    signIP: clientIP,
    signData: signData,
  }
}

/**
 * Map aansluitwaarde naar CapTar code
 * Bijv. "3x25A" -> "10211" (vereist korte variant)
 */
function mapAansluitwaardeToCapTar(aansluitwaarde: string | undefined): string | undefined {
  if (!aansluitwaarde) return undefined
  
  // Mapping tabel (vereist volledige lijst van CapTar codes)
  // Voor nu: return aansluitwaarde als-is, GridHub moet dit accepteren
  // TODO: Implementeer volledige mapping
  return aansluitwaarde
}

/**
 * Generate sign data (placeholder - in productie: gebruik echte signature)
 */
function generateSignData(gegevens: any, signTimestamp: Date): string {
  // In productie: dit zou echte signature data moeten zijn
  // Bijv. base64 encoded PDF signature, of hash van formulier data
  // Voor nu: placeholder
  const signDataObj = {
    timestamp: signTimestamp.toISOString(),
    email: gegevens.emailadres || gegevens.email,
    // ... andere sign data
  }
  return Buffer.from(JSON.stringify(signDataObj)).toString('base64')
}
```

### **3. Aanvraag Flow Integratie**

**`src/app/api/aanvragen/create/route.ts`** (uitbreiden)

```typescript
// Na succesvol opslaan in database (rond regel 400+):

// Check of leverancier GridHub integratie heeft
const { data: apiConfig } = await supabase
  .from('leverancier_api_config')
  .select('*')
  .eq('leverancier_id', body.contract_id) // Of leverancier_id uit contract
  .eq('provider', 'GRIDHUB')
  .eq('environment', process.env.NODE_ENV === 'production' ? 'production' : 'test')
  .eq('actief', true)
  .single()

if (apiConfig) {
  try {
    // Import GridHub client en mapper
    const { GridHubClient } = await import('@/lib/integrations/gridhub/client')
    const { mapAanvraagToGridHubOrderRequest } = await import('@/lib/integrations/gridhub/mapper')
    
    // Haal volledige aanvraag op (met alle data)
    const { data: volledigeAanvraag } = await supabase
      .from('contractaanvragen')
      .select('*')
      .eq('id', aanvraagId)
      .single()
    
    if (!volledigeAanvraag) {
      throw new Error('Aanvraag niet gevonden')
    }
    
    // Decrypt API password (gebruik Supabase Vault of encryptie library)
    const apiPassword = decryptPassword(apiConfig.api_password_encrypted)
    
    // Maak GridHub client
    const gridhubClient = new GridHubClient({
      apiUrl: apiConfig.api_url,
      username: apiConfig.api_username,
      password: apiPassword,
      environment: apiConfig.environment,
    })
    
    // Map aanvraag naar GridHub format
    const productId = apiConfig.product_ids[aanvraag.aanvraag_type] // "1" of "5"
    const tariffId = apiConfig.environment === 'production' 
      ? apiConfig.tarief_ids.production 
      : apiConfig.tarief_ids.test
    
    const gridhubPayload = mapAanvraagToGridHubOrderRequest({
      aanvraag: volledigeAanvraag,
      productId,
      tariffId,
      customerApprovalIDs: apiConfig.customer_approval_ids,
      clientIP: clientIP,
      signTimestamp: new Date(),
    })
    
    // Call GridHub API
    const gridhubResponse = await gridhubClient.createOrderRequest(gridhubPayload)
    
    // Update aanvraag met GridHub response
    await supabase
      .from('contractaanvragen')
      .update({
        external_api_provider: 'GRIDHUB',
        external_order_id: gridhubResponse.orderRequestId,
        external_order_request_id: gridhubResponse.orderRequestId,
        external_status: 'NEW',
        external_response: gridhubResponse,
        external_last_sync: new Date().toISOString(),
        status: 'verzonden',
      })
      .eq('id', aanvraagId)
    
    console.log('✅ [GridHub] Order request created:', gridhubResponse.orderRequestId)
    
  } catch (error: any) {
    console.error('❌ [GridHub] Error creating order request:', error)
    
    // Update aanvraag met error (maar status blijft 'nieuw' voor handmatige verwerking)
    await supabase
      .from('contractaanvragen')
      .update({
        external_api_provider: 'GRIDHUB',
        external_errors: {
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        status: 'nieuw', // Blijft nieuw voor handmatige verwerking
      })
      .eq('id', aanvraagId)
    
    // Stuur email naar admin over failed API call
    // (implementeer email notificatie)
  }
}
```

### **4. Status Polling Cron Job**

**`src/app/api/cron/sync-gridhub-status/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { GridHubClient } from '@/lib/integrations/gridhub/client'

/**
 * CRON endpoint: Sync GridHub order statuses
 * 
 * Called by EasyCron every 5 minutes
 * Polls GridHub status feed and updates database
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  // Security check
  const authHeader = request.headers.get('authorization')?.trim()
  const easyCronSecret = process.env.EASYCRON_SECRET?.trim()
  
  if (easyCronSecret) {
    const expectedBearerHeader = `Bearer ${easyCronSecret}`
    if (authHeader !== expectedBearerHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  console.log('🔄 [GridHub Status Sync] Starting...')
  
  const supabase = createServiceRoleClient()
  
  try {
    // Haal alle actieve GridHub configs op
    const { data: apiConfigs, error: configError } = await supabase
      .from('leverancier_api_config')
      .select('*')
      .eq('provider', 'GRIDHUB')
      .eq('actief', true)
      .eq('status_polling_enabled', true)
    
    if (configError || !apiConfigs || apiConfigs.length === 0) {
      console.log('ℹ️ [GridHub Status Sync] No active GridHub configs found')
      return NextResponse.json({ success: true, message: 'No active configs' })
    }
    
    let totalUpdated = 0
    let totalErrors = 0
    
    // Voor elke config: sync statuses
    for (const config of apiConfigs) {
      try {
        // Decrypt password
        const apiPassword = decryptPassword(config.api_password_encrypted)
        
        const gridhubClient = new GridHubClient({
          apiUrl: config.api_url,
          username: config.api_username,
          password: apiPassword,
          environment: config.environment,
        })
        
        // Haal laatste sync timestamp op (of 24 uur geleden als eerste keer)
        const { data: lastSync } = await supabase
          .from('contractaanvragen')
          .select('external_last_sync')
          .eq('external_api_provider', 'GRIDHUB')
          .not('external_last_sync', 'is', null)
          .order('external_last_sync', { ascending: false })
          .limit(1)
          .single()
        
        const timestampFrom = lastSync?.external_last_sync 
          ? new Date(lastSync.external_last_sync)
          : new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 uur geleden
        
        // Poll order request status feed
        const statusFeed = await gridhubClient.getOrderRequestStatusFeed(timestampFrom)
        
        // Update elke aanvraag met nieuwe status
        for (const entry of statusFeed.data) {
          const { error: updateError } = await supabase
            .from('contractaanvragen')
            .update({
              external_status: entry.status,
              external_status_reason: entry.statusReason,
              external_sub_status_id: entry.order?.subStatusID,
              external_last_sync: new Date().toISOString(),
              status: mapGridHubStatusToInternalStatus(entry.status),
              updated_at: new Date().toISOString(),
            })
            .eq('external_order_id', entry.externalReference)
            .or(`external_order_request_id.eq.${entry.externalReference}`)
          
          if (!updateError) {
            totalUpdated++
            
            // Als status CREATED is, start ook order status polling
            if (entry.status === 'CREATED' && entry.order) {
              // Update met order ID en status
              await supabase
                .from('contractaanvragen')
                .update({
                  external_order_id: entry.order.id.toString(),
                  external_status: entry.order.status,
                  external_status_reason: entry.order.statusReason,
                  external_sub_status_id: entry.order.subStatusID,
                })
                .eq('external_order_request_id', entry.externalReference)
            }
            
            // Stuur email naar klant bij belangrijke status wijzigingen
            if (['CREATED', 'NEEDSATTENTION', 'CANCELLED'].includes(entry.status)) {
              // Implementeer email notificatie
              await sendStatusUpdateEmail(entry.externalReference, entry.status)
            }
          } else {
            console.error('❌ [GridHub Status Sync] Update error:', updateError)
            totalErrors++
          }
        }
        
        console.log(`✅ [GridHub Status Sync] Updated ${totalUpdated} orders for config ${config.id}`)
        
      } catch (error: any) {
        console.error(`❌ [GridHub Status Sync] Error for config ${config.id}:`, error)
        totalErrors++
      }
    }
    
    return NextResponse.json({
      success: true,
      updated: totalUpdated,
      errors: totalErrors,
      timestamp: new Date().toISOString(),
    })
    
  } catch (error: any) {
    console.error('❌ [GridHub Status Sync] Fatal error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

function mapGridHubStatusToInternalStatus(gridhubStatus: string): string {
  const mapping: Record<string, string> = {
    'NEW': 'verzonden',
    'NEEDSATTENTION': 'in_behandeling',
    'CREATED': 'in_behandeling',
    'CANCELLED': 'geannuleerd',
  }
  return mapping[gridhubStatus] || 'in_behandeling'
}

async function sendStatusUpdateEmail(externalReference: string, status: string) {
  // Implementeer email notificatie naar klant
  // Gebruik bestaande email template systeem
}
```

### **5. Admin Dashboard Uitbreiding**

**`src/app/admin/aanvragen/[id]/page.tsx`** (uitbreiden)

```typescript
// Toon GridHub status in aanvraag detail pagina
{aanvraag.external_api_provider === 'GRIDHUB' && (
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
    <h3 className="font-bold text-blue-900 mb-2">GridHub Status</h3>
    <div className="space-y-2">
      <div>
        <span className="text-sm text-blue-700">Order ID:</span>
        <span className="ml-2 font-mono text-sm">{aanvraag.external_order_id}</span>
      </div>
      <div>
        <span className="text-sm text-blue-700">Status:</span>
        <span className="ml-2 font-semibold">{aanvraag.external_status}</span>
      </div>
      {aanvraag.external_status_reason && (
        <div>
          <span className="text-sm text-blue-700">Status Reden:</span>
          <span className="ml-2 text-sm">{aanvraag.external_status_reason}</span>
        </div>
      )}
      <div>
        <span className="text-sm text-blue-700">Laatste Sync:</span>
        <span className="ml-2 text-sm">
          {aanvraag.external_last_sync 
            ? new Date(aanvraag.external_last_sync).toLocaleString('nl-NL')
            : 'Nog niet gesynchroniseerd'}
        </span>
      </div>
      <button
        onClick={handleRetryGridHubSync}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        🔄 Sync Status Nu
      </button>
    </div>
  </div>
)}
```

---

## 🔐 Security & Credentials Management

### **Password Encryption**

**`src/lib/integrations/gridhub/encryption.ts`**

```typescript
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.GRIDHUB_ENCRYPTION_KEY! // 32 bytes key
const ALGORITHM = 'aes-256-gcm'

export function encryptPassword(password: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
  
  let encrypted = cipher.update(password, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decryptPassword(encryptedPassword: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedPassword.split(':')
  
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
  
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
```

**Environment Variable:**
```bash
GRIDHUB_ENCRYPTION_KEY=<generate_32_byte_hex_key>
```

---

## 📋 Implementatie Checklist

### **Fase 1: Database Setup** (1 dag)
- [ ] Database migratie: `contractaanvragen` uitbreidingen
- [ ] Database migratie: `leverancier_api_config` tabel
- [ ] Indexes aanmaken
- [ ] RLS policies configureren
- [ ] Test data invoeren

### **Fase 2: GridHub Client** (1-2 dagen)
- [ ] `GridHubClient` class implementeren
- [ ] `createOrderRequest` method
- [ ] `getOrderRequestStatusFeed` method
- [ ] `getOrderStatusFeed` method
- [ ] `cancelOrderRequest` method
- [ ] Error handling & retry logic
- [ ] Unit tests

### **Fase 3: Data Mapping** (1 dag)
- [ ] `mapAanvraagToGridHubOrderRequest` implementeren
- [ ] Relation mapping (particulier + zakelijk)
- [ ] RequestedConnection mapping
- [ ] CapTar code mapping
- [ ] Sign data generatie
- [ ] Validatie & error handling

### **Fase 4: Aanvraag Flow Integratie** (1 dag)
- [ ] Check leverancier API config in `/api/aanvragen/create`
- [ ] GridHub API call na database insert
- [ ] Response handling & database update
- [ ] Error handling & fallback
- [ ] Logging

### **Fase 5: Status Polling** (1 dag)
- [ ] Cron job endpoint: `/api/cron/sync-gridhub-status`
- [ ] Status feed polling logic
- [ ] Database updates
- [ ] Email notificaties
- [ ] EasyCron configuratie

### **Fase 6: Admin Dashboard** (0.5 dag)
- [ ] GridHub status display in aanvraag detail
- [ ] Retry knop
- [ ] API config beheer pagina
- [ ] Logs viewer

### **Fase 7: Testing** (1-2 dagen)
- [ ] Test omgeving setup
- [ ] Test aanvragen (particulier + zakelijk)
- [ ] Status polling test
- [ ] Error scenario's testen
- [ ] End-to-end test

### **Fase 8: Production Deploy** (0.5 dag)
- [ ] Production API credentials configureren
- [ ] Environment variables setten
- [ ] Database migraties uitvoeren
- [ ] Deploy naar Vercel
- [ ] EasyCron job configureren
- [ ] Monitoring setup

---

## 🔑 Belangrijke Aandachtspunten

### **1. Sign Data Generatie**
GridHub vereist `signTimestamp`, `signType`, `signSource`, `signIP`, en `signData`.

**Vraag aan Energiek:**
- Wat moet `signData` bevatten? (Base64 PDF? Hash? JSON?)
- Welke `signType` en `signSource` moeten we gebruiken?
- Is er een signature vereist, of kunnen we placeholder gebruiken?

### **2. CapTar Code Mapping**
GridHub vereist CapTar codes (korte variant, bijv. "10211").

**Vraag aan Energiek:**
- Hebben jullie een mapping tabel van aansluitwaarden naar CapTar codes?
- Of kunnen we de aansluitwaarde direct doorgeven (bijv. "3x25A")?

### **3. EAN Lookup**
GridHub kan EAN's opzoeken via `/api/external/v1/search/meteringpoints`.

**Implementatie:**
- Optioneel: gebruik deze API om EAN's op te halen voor aanvraag
- Of: laat GridHub EAN's automatisch vinden (Create Order Request doet dit)

### **4. Startdatum Validatie**
- Minimaal 20 dagen (behalve inhuizing: 3 dagen)
- Valideer in formulier voordat aanvraag wordt verzonden
- Toon duidelijk aan klant wanneer contract start

### **5. Automatische Incasso**
- Altijd verplicht voor Energiek
- Checkbox in formulier: disabled + altijd checked
- Validatie: als unchecked → error

### **6. Customer Approvals**
- [1,2,3] altijd vereist
- Toon in formulier wat klant goedkeurt:
  - Algemene Voorwaarden
  - Privacyverklaring + Kredietwaardigheidscontrole
  - Toestemming meterstanden uitlezen
- Links naar documenten

### **7. Error Handling**
- Als GridHub API faalt → log error, status blijft 'nieuw'
- Admin krijgt email notificatie
- Retry mechanisme in admin dashboard
- Fallback naar handmatige verwerking

### **8. Status Polling**
- Elke 5 minuten (configurable)
- Poll beide feeds: orderrequests + orders
- Update database + stuur email bij belangrijke wijzigingen
- Rate limiting respecteren

---

## 📧 Email Notificaties

### **Status Update Emails naar Klant:**
- **CREATED:** "Je aanvraag is ontvangen en wordt verwerkt"
- **NEEDSATTENTION:** "Er is actie vereist - check je email"
- **CANCELLED:** "Je aanvraag is geannuleerd - reden: ..."

### **Admin Notificaties:**
- **API Failure:** "GridHub API call gefaald voor aanvraag PA-2026-000001"
- **Status Change:** "Status wijziging voor aanvraag PA-2026-000001: NEW → CREATED"

---

## 🧪 Testing Strategie

### **Test Omgeving:**
1. **Test API credentials** van Energiek
2. **Test product ID:** "1" (particulier)
3. **Test tarief ID:** "11"
4. **Test aanvragen** met verschillende scenario's:
   - Particulier met gas + elektriciteit
   - Particulier met zonnepanelen
   - Zakelijk
   - Inhuizing (3 dagen startdatum)
   - Normale overstap (20 dagen startdatum)

### **Test Cases:**
- ✅ Succesvolle order request
- ✅ Status polling werkt
- ✅ Error handling bij API failure
- ✅ Retry mechanisme
- ✅ Email notificaties
- ✅ Admin dashboard display

---

## 🚀 Deployment Plan

### **Stap 1: Test Omgeving** (Week 1)
1. Database migraties uitvoeren
2. Test API credentials configureren
3. GridHub client implementeren
4. Test aanvragen verzenden
5. Status polling testen

### **Stap 2: Production Setup** (Week 2)
1. Production API credentials configureren
2. Production database migraties
3. EasyCron job configureren (elke 5 minuten)
4. Monitoring setup
5. Go-live

---

## 📞 Vragen voor Energiek (Chrisje)

1. **API Authenticatie:**
   - Gebruikt GridHub Basic Auth of Bearer token?
   - Hoe krijgen we de credentials? (Email met wachtwoord?)

2. **Sign Data:**
   - Wat moet `signData` bevatten?
   - Welke `signType` en `signSource` moeten we gebruiken?
   - Is er een signature vereist, of placeholder?

3. **CapTar Codes:**
   - Hebben jullie een mapping van aansluitwaarden naar CapTar codes?
   - Of kunnen we aansluitwaarden direct doorgeven?

4. **Webhooks:**
   - Kunnen we een webhook URL instellen voor status updates?
   - Of moeten we polling gebruiken?

5. **EAN Lookup:**
   - Moeten we EAN's zelf opzoeken via `/search/meteringpoints`?
   - Of kan GridHub dit automatisch doen?

6. **Rate Limiting:**
   - Zijn er rate limits op de API?
   - Hoe vaak kunnen we status feed pollen?

7. **Error Handling:**
   - Wat gebeurt er bij invalid data?
   - Krijgen we duidelijke error messages?

---

## ✅ Success Criteria

- [ ] Aanvragen worden automatisch naar GridHub gestuurd
- [ ] Status updates worden automatisch gesynchroniseerd
- [ ] Klanten ontvangen email bij status wijzigingen
- [ ] Admin kan status zien in dashboard
- [ ] Retry mechanisme werkt bij failures
- [ ] Alle error scenario's worden correct afgehandeld
- [ ] Test omgeving werkt perfect
- [ ] Production deployment succesvol

---

**Gemaakt op:** 2026-01-05  
**Gebaseerd op:** GridHub API Documentatie + Email van Chrisje Meulendijks  
**Voor:** PakketAdvies.nl

