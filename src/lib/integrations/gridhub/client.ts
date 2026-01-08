/**
 * GridHub API Client
 * 
 * Handles all communication with GridHub External API
 * Documentation: https://gridhub.stoplight.io/docs/gridhub-external
 */

import { gridHubLogger } from './logger'

export interface GridHubConfig {
  apiUrl: string // https://energiek.gridhub.cloud/api/external/v1
  username: string
  password: string
  environment: 'test' | 'production'
}

export interface GridHubRelation {
  type: 'CONSUMER' | 'BUSINESS'
  firstName: string
  middleName?: string
  lastName: string
  gender: 'MALE' | 'FEMALE'
  birthDate?: string // YYYY-MM-DD (optioneel in voorbeeld)
  phoneNumber: string
  email: string // In voorbeeld: "email" niet "emailAddress"
  street: string
  houseNumber: string // In voorbeeld: string ("400") niet number
  houseNumberAddition?: string
  postalCode: string
  city: string
  country: string // 'NL'
  companyName?: string // Verplicht voor BUSINESS
  companyCoCNumber?: string // Verplicht voor BUSINESS
  bankAccountType: 'IBAN' | 'BIC'
  bankAccountNumber: string
  debtorName?: string // In voorbeeld aanwezig
  paymentMethod: 'AUTOMATICCOLLECTION' | 'MANUAL'
  mandateDate: string // YYYY-MM-DD
  mandateReference?: string
}

export interface GridHubRequestedConnection {
  postalCode: string
  houseNumber: string // In voorbeeld: string ("144") niet number
  houseNumberAddition?: string
  hasElectricity: boolean
  hasGas: boolean
  meterType?: 'DOUBLE' | 'SINGLE' | 'SMART' | 'CONVENTIONAL' | 'UNKNOWN' // In voorbeeld: "DOUBLE"
  capacityCodeElectricity?: string // CapTar code (bijv. "10211")
  capacityCodeGas?: string
  usageElectricityHigh?: string // kWh per jaar
  usageElectricityLow?: string
  usageElectricitySingle?: string
  usageGas?: string // m³ per jaar
  returnElectricityHigh?: string
  returnElectricityLow?: string
  returnElectricitySingle?: string
  startDateElectricity?: string // YYYY-MM-DD (in voorbeeld aanwezig)
  startDateGas?: string // YYYY-MM-DD (in voorbeeld aanwezig)
  switchTypeElectricity?: 'SWITCH' | 'NEW' | 'MOVE' | 'UNKNOWN'
  switchTypeGas?: 'SWITCH' | 'NEW' | 'MOVE' | 'UNKNOWN'
  isResidenceFunction?: boolean // In voorbeeld: true
  hasP1Data?: boolean
  expectedAdvancePaymentAmountElectricity?: string
  expectedAdvancePaymentAmountGas?: string
  agreedAdvancePaymentAmountElectricity?: number // In voorbeeld: number (40.09) niet string!
  agreedAdvancePaymentAmountGas?: number // In voorbeeld: number (117.61) niet string!
  customerApprovalLEDs?: boolean // In voorbeeld niet aanwezig, maar was verplicht
  billingIDs?: string[]
}

export interface GridHubCreateOrderRequestPayload {
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
  requestedConnections: GridHubRequestedConnection | GridHubRequestedConnection[] // In voorbeeld: object, niet array!
  productID: string // "2" in voorbeeld (niet "1")
  tariffID: string // "34" in voorbeeld (niet "37")
  customerApprovalIDs: number[] // [1,2] in voorbeeld (niet [1,2,3])
  signTimestamp: string // Y-m-d H:i:s format (niet ISO)
  signType: 'DIRECT' | 'SIGNATURE' | 'ESIGNATURE' // In voorbeeld: "DIRECT" (niet "ESIGNATURE")
  signSource?: string // In voorbeeld: "DIRECT" (optioneel?)
  signIP?: string // In voorbeeld niet aanwezig (optioneel?)
  signData?: string // In voorbeeld niet aanwezig (optioneel voor DIRECT?)
  externalReference?: string // In voorbeeld op root level
  originalCreateTimestamp: string // Verplicht, Y-m-d H:i:s format
  flowQuestion?: any[] // In voorbeeld: lege array
  agreedAdvancePaymentAmount: number // In voorbeeld: number (157.70) niet string!
}

export interface GridHubCreateOrderRequestResponse {
  orderRequestId: string
}

export interface GridHubStatusFeedEntry {
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

export interface GridHubStatusFeedResponse {
  data: GridHubStatusFeedEntry[]
}

export class GridHubClient {
  private config: GridHubConfig

  constructor(config: GridHubConfig) {
    // Trim newlines and whitespace from config values to prevent API errors
    // Environment variables in Vercel can sometimes have trailing newlines
    this.config = {
      ...config,
      apiUrl: config.apiUrl?.trim() || '',
      username: config.username?.trim() || '',
      password: config.password?.trim() || '',
      environment: config.environment,
    }
  }

  /**
   * Get Bearer token for GridHub API
   * GridHub uses Bearer Auth with the password directly as the token
   * (No separate login endpoint required)
   */
  private async getAuthToken(): Promise<string> {
    // GridHub uses the password directly as the Bearer token
    // No login endpoint needed - just use the password as-is
    // Trim again for safety (should already be trimmed in constructor)
    return this.config.password.trim()
  }

  /**
   * Create Order Request
   * POST /api/external/v1/orderrequests
   */
  async createOrderRequest(
    payload: GridHubCreateOrderRequestPayload
  ): Promise<GridHubCreateOrderRequestResponse> {
    const authToken = await this.getAuthToken()
    
    // Uitgebreide payload logging voor debugging
    const payloadForLogging = {
      ...payload,
      relation: {
        ...payload.relation,
        bankAccountNumber: payload.relation.bankAccountNumber ? '***REDACTED***' : undefined,
      },
    }
    
    // Uitgebreide payload logging voor debugging
    console.log('📤 [GridHub] ========== API REQUEST DETAILS ==========')
    console.log('📤 [GridHub] Request URL:', `${this.config.apiUrl}/orderrequests`)
    console.log('📤 [GridHub] Request method: POST')
    console.log('📤 [GridHub] Environment:', this.config.environment)
    console.log('📤 [GridHub] Username:', this.config.username)
    console.log('📤 [GridHub] Password length:', this.config.password.length)
    console.log('📤 [GridHub] Password has newline:', this.config.password.includes('\n'))
    console.log('📤 [GridHub] Full payload being sent:', JSON.stringify(payloadForLogging, null, 2))
    console.log('🔍 [GridHub] requestedConnections details:', JSON.stringify(payload.requestedConnections, null, 2))
    
    // Specifieke logging voor CapTar codes
    const requestedConnections = payload.requestedConnections as any
    let connectionDetails: any
    
    if (Array.isArray(requestedConnections)) {
      connectionDetails = requestedConnections.map((conn, index) => ({
        index,
        hasElectricity: conn.hasElectricity,
        hasGas: conn.hasGas,
        capacityCodeElectricity: conn.capacityCodeElectricity || 'NOT SET',
        capacityCodeGas: conn.capacityCodeGas || 'NOT SET',
        agreedAdvancePaymentAmountElectricity: conn.agreedAdvancePaymentAmountElectricity,
        agreedAdvancePaymentAmountGas: conn.agreedAdvancePaymentAmountGas,
      }))
      requestedConnections.forEach((conn, index) => {
        console.log(`🔍 [GridHub] requestedConnections[${index}]:`, connectionDetails[index])
      })
    } else {
      connectionDetails = {
        hasElectricity: requestedConnections.hasElectricity,
        hasGas: requestedConnections.hasGas,
        capacityCodeElectricity: requestedConnections.capacityCodeElectricity || 'NOT SET',
        capacityCodeGas: requestedConnections.capacityCodeGas || 'NOT SET',
        agreedAdvancePaymentAmountElectricity: requestedConnections.agreedAdvancePaymentAmountElectricity,
        agreedAdvancePaymentAmountGas: requestedConnections.agreedAdvancePaymentAmountGas,
        allKeys: Object.keys(requestedConnections).sort(),
      }
      console.log('🔍 [GridHub] requestedConnections (single object):', connectionDetails)
    }
    
    // Log naar database (non-blocking)
    // Extract aanvraagId from externalReference (format: PA-2026-000018)
    // We'll need to look it up, but for now use externalReference as context
    const logContext: any = {
      externalReference: payload.externalReference,
    }
    
    // Try to extract aanvraagId from context if available in payload
    if ((payload as any).__aanvraagId) {
      logContext.aanvraagId = (payload as any).__aanvraagId
    }
    if ((payload as any).__aanvraagnummer) {
      logContext.aanvraagnummer = (payload as any).__aanvraagnummer
    }
    
    gridHubLogger.info('GridHub API Request', {
      url: `${this.config.apiUrl}/orderrequests`,
      method: 'POST',
      environment: this.config.environment,
      payload: payloadForLogging,
      requestedConnections: payload.requestedConnections,
      connectionDetails,
    }, logContext)
    
    console.log('📤 [GridHub] ==========================================')
    
    const response = await fetch(`${this.config.apiUrl}/orderrequests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`, // Bearer Auth volgens documentatie
      },
      body: JSON.stringify(payload),
    })
    
    // Remove __aanvraagId and __aanvraagnummer from payload before sending (they're only for logging)
    // These were already removed in JSON.stringify, but just to be safe

    if (!response.ok) {
      const errorText = await response.text()
      let error: any
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { message: errorText || 'Unknown error' }
      }
      
      // Log error to database
      gridHubLogger.error('GridHub API Request Failed', {
        url: `${this.config.apiUrl}/orderrequests`,
        status: response.status,
        statusText: response.statusText,
        error,
        errorText,
      }, logContext)
      
      throw new Error(`GridHub API error: ${response.status} - ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    
    // Extract the order request ID from the nested response structure
    // GridHub returns: { data: { id: 416, ... } }
    const orderRequestId = data.data?.id
    
    // Log success
    gridHubLogger.info('GridHub API Request Successful', {
      orderRequestId: orderRequestId,
      response: data,
    }, logContext)
    
    // Return the full response with extracted ID for convenience
    return {
      ...data,
      orderRequestId: orderRequestId,
    }
  }

  /**
   * Get Order Status Feed (voor orders die CREATED zijn)
   * GET /api/external/v1/orders/statusfeed?timestampFrom={date-time}
   * 
   * NOTE: timestampFrom must be in Y-m-d H:i:s format (NOT ISO format!)
   * NOTE: This returns ORDERS (not order requests). Use this to get status updates.
   */
  async getOrderStatusFeed(
    timestampFrom: Date
  ): Promise<GridHubStatusFeedResponse> {
    const authToken = await this.getAuthToken()
    
    // GridHub wants Y-m-d H:i:s format, not ISO!
    // Example: "2025-12-09 10:46:03"
    const timestampFromFormatted = timestampFrom.toISOString()
      .replace('T', ' ')
      .replace(/\.\d{3}Z$/, '') // Remove milliseconds and Z
    
    const response = await fetch(
      `${this.config.apiUrl}/orders/statusfeed?timestampFrom=${encodeURIComponent(timestampFromFormatted)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      let error: any
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { message: errorText || 'Unknown error' }
      }
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
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          subStatusID,
          description,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      let error: any
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { message: errorText || 'Unknown error' }
      }
      throw new Error(`GridHub API error: ${response.status} - ${JSON.stringify(error)}`)
    }
  }

  /**
   * Get Product/Tariff Information
   * Attempts to fetch product and tariff details from GridHub
   * Note: This endpoint may not exist in GridHub API - it's a placeholder
   * If it doesn't exist, we'll need to get pricing info from Energiek.nl directly
   */
  async getProductTariffInfo(productId: string, tariffId: string): Promise<any> {
    const authToken = await this.getAuthToken()
    
    // Try to fetch product/tariff info (this endpoint may not exist)
    try {
      const response = await fetch(
        `${this.config.apiUrl}/products/${productId}/tariffs/${tariffId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }
      )

      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      // Endpoint doesn't exist or error - this is expected
      console.warn('⚠️ [GridHub] Product/Tariff info endpoint not available:', error)
    }

    // Return null if endpoint doesn't exist
    return null
  }
}

/**
 * Helper function to get GridHubClient for a specific leverancier
 * Fetches API config from database and initializes client
 */
export async function getGridHubClientForLeverancier(leverancierId: string): Promise<GridHubClient | null> {
  try {
    // Dynamic import to avoid circular dependencies
    const { createClient } = await import('@/lib/supabase/server')
    const { decryptPassword } = await import('./encryption')
    
    const supabase = await createClient()
    
    // Fetch API config
    const { data: apiConfig, error: configError } = await supabase
      .from('leverancier_api_config')
      .select('*')
      .eq('leverancier_id', leverancierId)
      .eq('provider', 'GRIDHUB')
      .eq('actief', true)
      .single()

    if (configError || !apiConfig) {
      console.warn(`No active GridHub config found for leverancier ${leverancierId}:`, configError?.message)
      return null
    }

    // Decrypt password (decryptPassword gets key from env internally)
    const decryptedPassword = decryptPassword(apiConfig.api_password_encrypted)

    // Create and return client
    return new GridHubClient({
      apiUrl: apiConfig.api_url,
      username: apiConfig.api_username,
      password: decryptedPassword,
      environment: apiConfig.environment as 'test' | 'production',
    })
  } catch (error: any) {
    console.error(`Error creating GridHubClient for leverancier ${leverancierId}:`, error)
    return null
  }
}

