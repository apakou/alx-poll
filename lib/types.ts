// Re-export database types for convenience
export * from './types/database'

// Application-specific UI types that extend database types
export interface UIUser {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
}

export interface UIPoll {
  id: string
  title: string
  description?: string
  options: UIPollOption[]
  createdBy: string
  createdAt: Date
  endDate?: Date
  isActive: boolean
  allowMultipleVotes: boolean
  isAnonymous: boolean
  totalVotes: number
}

export interface UIPollOption {
  id: string
  text: string
  votes: number
  percentage: number
}

export interface Vote {
  id: string
  pollId: string
  optionId: string
  userId?: string
  createdAt: Date
}

export interface CreatePollData {
  title: string
  description?: string
  options: string[]
  endDate?: Date
  allowMultipleVotes?: boolean
  isAnonymous?: boolean
}
