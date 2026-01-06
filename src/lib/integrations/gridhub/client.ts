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
  paymentMethod: 'DIRECT_DEBIT' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'IDEAL' | 'PAYPAL'
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
  customerApprovalLEDs: boolean // Verplicht: true
  billingIDs?: string[]
  originalCreateTimestamp?: string // ISO date-time
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
  signType: string // 'EMAIL', 'SMS', 'DIGITAL', etc.
  signSource: string // 'DIRECT_DEBIT_MANDATE', 'EMAIL', etc.
  signIP: string // Client IP address
  signData: string // Base64 encoded signature data
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
   * Get Bearer token (Basic Auth -> Bearer token)
   * GridHub gebruikt Bearer Auth volgens documentatie
   */
  private async getAuthToken(): Promise<string> {
    // GridHub gebruikt Bearer Auth
    // In de praktijk: credentials worden waarschijnlijk via Basic Auth geauthenticeerd
    // en dan krijgen we een Bearer token terug, of we gebruiken username/password direct
    // Voor nu: gebruik Basic Auth credentials als Bearer token placeholder
    // Dit moet worden aangepast zodra we de exacte auth flow weten
    
    // Option 1: Direct Bearer token (als we token krijgen)
    // return this.config.password // Als password al een token is
    
    // Option 2: Basic Auth (als GridHub Basic Auth gebruikt voor auth, dan Bearer voor requests)
    // Voor nu: gebruik Basic Auth encoding als placeholder
    const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')
    return credentials
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
}

