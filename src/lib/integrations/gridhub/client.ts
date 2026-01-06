/**
 * GridHub API Client
 * 
 * Handles all communication with GridHub External API
 * Documentation: https://gridhub.stoplight.io/docs/gridhub-external
 */

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
  paymentMethod: 'AUTOMATICCOLLECTION' | 'MANUAL'
  mandateDate: string // YYYY-MM-DD
  mandateReference?: string
}

export interface GridHubRequestedConnection {
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
  agreedAdvancePaymentAmountElectricity?: string // Verplicht veld (blijkt toch nodig te zijn)
  agreedAdvancePaymentAmountGas?: string // Verplicht veld (blijkt toch nodig te zijn)
  customerApprovalLEDs: boolean // Verplicht: true
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
  requestedConnections: GridHubRequestedConnection[]
  productID: string // "1" voor particulier, "5" voor zakelijk
  tariffID: string // "11" voor test, "37" voor productie
  customerApprovalIDs: number[] // [1,2,3]
  signTimestamp: string // ISO date-time
  signType: 'DIRECT' | 'SIGNATURE' | 'ESIGNATURE' // DIRECT: Website order, SIGNATURE: Natte handtekening, ESIGNATURE: Digitale handtekening per mail/SMS
  signSource: string // 'DIRECT_DEBIT_MANDATE', 'EMAIL', etc.
  signIP: string // Client IP address
  signData: string // Base64 encoded signature data
  originalCreateTimestamp: string // Verplicht, Y-m-d H:i:s format
  agreedAdvancePaymentAmount: string // Verplicht, string met 2 decimalen
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
    this.config = config
  }

  /**
   * Get Bearer token for GridHub API
   * GridHub uses Bearer Auth with the password directly as the token
   * (No separate login endpoint required)
   */
  private async getAuthToken(): Promise<string> {
    // GridHub uses the password directly as the Bearer token
    // No login endpoint needed - just use the password as-is
    return this.config.password
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
        'Authorization': `Bearer ${authToken}`, // Bearer Auth volgens documentatie
      },
      body: JSON.stringify(payload),
    })

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

    const data = await response.json()
    return data
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

