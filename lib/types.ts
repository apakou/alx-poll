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

// Types for EditPollForm component
export interface EditPollData {
  id: string
  title: string
  description: string | null
  category: string | null
  is_active: boolean
  allow_multiple_votes: boolean
  is_anonymous: boolean
  expires_at: string | null
  poll_options: EditPollOption[]
  created_at: string
  updated_at: string
  created_by: string
  total_votes: number
}

export interface EditPollOption {
  id: string
  option_text: string
  option_order: number
  votes_count: number
}

// Form data type for editing polls (what the form will submit)
export interface EditPollFormData {
  title: string
  description: string
  category: string
  is_active: boolean
  allow_multiple_votes: boolean
  is_anonymous: boolean
  expires_at: Date | null
  options: EditPollOptionFormData[]
}

export interface EditPollOptionFormData {
  id?: string // Optional for new options
  option_text: string
  option_order: number
  _isNew?: boolean // Flag to indicate if this is a new option
  _isDeleted?: boolean // Flag to indicate if this option should be deleted
}

// Update payload type for API calls
export interface UpdatePollData {
  title?: string
  description?: string | null
  category?: string | null
  is_active?: boolean
  allow_multiple_votes?: boolean
  is_anonymous?: boolean
  expires_at?: string | null
}

// Utility type to convert database poll to edit form data
export type PollToEditForm = (poll: EditPollData) => EditPollFormData

// Utility type to convert edit form data to update payload
export type EditFormToUpdate = (formData: EditPollFormData) => {
  pollUpdate: UpdatePollData
  optionUpdates: {
    toCreate: Omit<EditPollOptionFormData, 'id' | '_isNew' | '_isDeleted'>[]
    toUpdate: { id: string; option_text: string; option_order: number }[]
    toDelete: string[]
  }
}
