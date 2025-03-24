// Типы данных для страницы управления автобусным парком

export interface User {
    id: string
    name: string
    email: string
    role: string
    position?: string
    avatar?: string
    convoyId?: string
    convoyNumber?: number
  }
  
  export interface BusDepot {
    id: string
    name: string
    city: string
    address: string
    logo?: string
  }
  
  export interface Convoy {
    id: string
    number: number
    busDepotId: string
    chiefId?: string
    mechanicId?: string
    busIds: string[]
  }
  
  export interface UserFormData {
    name: string
    email: string
    login: string
    password: string
    role: string
    position: string
    convoyId: string
  }
  
  export interface ConvoyFormData {
    number: string
    chiefId: string
    mechanicId: string
  }
  
  