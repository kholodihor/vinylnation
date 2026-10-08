export interface IError {
  type: string
  message: string
}

export interface IProduct {
  id: number
  title: string
  description: string
  genre: string
  url: string
  /** Price in cents */
  price: number
  quantity: number
}

export interface IAddress {
  id: number
  name: string
  address: string
  zipcode: string
  city: string
  country: string
}

export interface IOrderItem {
  id: number
  orderId: number
  productId: number
  product: IProduct
}

export interface IOrder {
  id: number
  userId: string
  stripeId: string
  name: string
  address: string
  zipcode: string
  city: string
  country: string
  created_at: string
  orderItem: IOrderItem[]
}

// Vapi API Response Types
export interface IAssistantAlbum {
  title: string
  details: string
  price: string
  availability: string
  description: string
}

export interface IAssistantSummary {
  message: string
  albums: IAssistantAlbum[]
  suggestions: string[]
}

export interface VapiErrorResponse {
  error: string
  details?: string
}

export interface VapiSuccessResponse {
  success: boolean
  data: {
    query: string
    results: unknown[]
    summary: IAssistantSummary
  }
  message: string
}

export type VapiSearchResponse = VapiErrorResponse | VapiSuccessResponse
