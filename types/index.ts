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
  price: number
}

export interface IAddress {
  id: number
  name: string
  address: string
  zipCode: string
  city: string
  country: string
}

export interface IOrder {
  id: number
  userId: string
  stripeId: string
  name: string
  address: string
  zipCode: string
  city: string
  country: string
  createdAt: string
  orderItem: IProduct[]
}

// Vapi API Response Types
export interface VapiErrorResponse {
  error: string
  details?: string
}

export interface VapiSuccessResponse {
  success: boolean
  data: {
    query: string
    results: any[]
    summary: {
      message: string
      albums?: any[]
      suggestions?: string[]
    }
  }
  message: string
}

export interface VapiCatchResponse {
  error: string
}

export type VapiSearchResponse = VapiErrorResponse | VapiSuccessResponse | VapiCatchResponse
