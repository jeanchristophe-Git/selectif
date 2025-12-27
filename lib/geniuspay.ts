// GeniusPay API Client
// Documentation: https://pay.genius.ci/docs/api

const GENIUSPAY_BASE_URL = "https://pay.genius.ci/api/v1/merchant"

interface GeniusPayConfig {
  apiKey: string
  apiSecret: string
}

interface CreatePaymentParams {
  amount: number // Minimum 100 XOF
  description?: string
  customer_email?: string
  customer_name?: string
  customer_phone?: string
  success_url?: string
  error_url?: string
  payment_method?: "wave" | "orange_money" | "mtn_money" | "card"
  metadata?: Record<string, any>
}

interface PaymentResponse {
  reference: string
  status: "pending" | "success" | "failed" | "cancelled"
  amount: number
  checkout_url?: string
  payment_url?: string
  created_at: string
}

class GeniusPayClient {
  private config: GeniusPayConfig

  constructor(config: GeniusPayConfig) {
    this.config = config
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${GENIUSPAY_BASE_URL}${endpoint}`

    const headers = {
      "Content-Type": "application/json",
      "X-API-Key": this.config.apiKey,
      "X-API-Secret": this.config.apiSecret,
      ...options.headers,
    }

    console.log(`[GeniusPay] ${options.method || "GET"} ${url}`)

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[GeniusPay] Error:", data)
      throw new Error(data.message || "GeniusPay API error")
    }

    console.log("[GeniusPay] Success:", data)
    return data
  }

  /**
   * Create a new payment
   * Returns a checkout URL for the customer to complete payment
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
    return this.request("/payments", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Get payment details by reference
   */
  async getPayment(reference: string): Promise<PaymentResponse> {
    return this.request(`/payments/${reference}`)
  }

  /**
   * List all payments with optional filters
   */
  async listPayments(filters?: {
    status?: string
    start_date?: string
    end_date?: string
    page?: number
  }): Promise<{ data: PaymentResponse[]; meta: any }> {
    const params = new URLSearchParams(filters as any)
    return this.request(`/payments?${params}`)
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<{
    available: number
    pending: number
    total: number
  }> {
    return this.request("/account/balance")
  }

  /**
   * Verify webhook signature
   * Returns true if signature is valid
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // GeniusPay uses HMAC-SHA256 for webhook signatures
    const crypto = require("crypto")
    const computedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex")

    return computedSignature === signature
  }
}

// Export singleton instance
export const geniuspay = new GeniusPayClient({
  apiKey: process.env.GENIUSPAY_API_KEY || "",
  apiSecret: process.env.GENIUSPAY_API_SECRET || "",
})

// Export types
export type { CreatePaymentParams, PaymentResponse, GeniusPayConfig }
