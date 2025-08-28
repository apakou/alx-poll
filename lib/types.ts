export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
}

export interface Poll {
  id: string
  title: string
  description?: string
  options: PollOption[]
  createdBy: string
  createdAt: Date
  endDate?: Date
  isActive: boolean
  allowMultipleVotes: boolean
  isAnonymous: boolean
  totalVotes: number
}

export interface PollOption {
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
