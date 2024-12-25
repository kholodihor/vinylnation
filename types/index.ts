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
