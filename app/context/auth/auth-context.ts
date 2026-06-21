import { createContext } from "react"

 export type User = {
    id: string
    email: string
    created_at: string
  }

  type AuthContextType = {
    user: User | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
  }

  export const AuthContext = createContext<AuthContextType | null>(null)

