// Database types for the polling application
// These types correspond to the Supabase database schema

export interface Database {
  public: {
    Tables: {
      polls: {
        Row: {
          id: string
          title: string
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
          expires_at: string | null
          is_active: boolean
          is_anonymous: boolean
          allow_multiple_votes: boolean
          category: string | null
          image_url: string | null
          total_votes: number
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          expires_at?: string | null
          is_active?: boolean
          is_anonymous?: boolean
          allow_multiple_votes?: boolean
          category?: string | null
          image_url?: string | null
          total_votes?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          expires_at?: string | null
          is_active?: boolean
          is_anonymous?: boolean
          allow_multiple_votes?: boolean
          category?: string | null
          image_url?: string | null
          total_votes?: number
        }
      }
      poll_options: {
        Row: {
          id: string
          poll_id: string
          option_text: string
          option_order: number
          votes_count: number
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_text: string
          option_order: number
          votes_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          option_text?: string
          option_order?: number
          votes_count?: number
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          poll_id: string
          poll_option_id: string
          user_id: string | null
          voter_ip: string | null
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          poll_option_id: string
          user_id?: string | null
          voter_ip?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          poll_option_id?: string
          user_id?: string | null
          voter_ip?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      poll_statistics: {
        Row: {
          id: string
          title: string
          description: string | null
          created_by: string
          created_at: string
          expires_at: string | null
          is_active: boolean
          category: string | null
          total_votes: number
          unique_voters: number
          status: 'active' | 'inactive' | 'expired'
        }
      }
      poll_results: {
        Row: {
          option_id: string
          poll_id: string
          option_text: string
          option_order: number
          votes_count: number
          total_votes: number
          percentage: number
        }
      }
    }
    Functions: {
      cleanup_expired_polls: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
  }
}

// Application-specific types
export interface Poll {
  id: string
  title: string
  description?: string
  created_by: string
  created_at: string
  updated_at: string
  expires_at?: string
  is_active: boolean
  is_anonymous: boolean
  allow_multiple_votes: boolean
  category?: string
  image_url?: string
  total_votes: number
  options?: PollOption[]
  creator?: {
    email: string
    full_name?: string
  }
}

export interface PollOption {
  id: string
  poll_id: string
  option_text: string
  option_order: number
  votes_count: number
  created_at: string
}

export interface Vote {
  id: string
  poll_id: string
  poll_option_id: string
  user_id?: string
  voter_ip?: string
  created_at: string
  poll?: Poll
  poll_option?: PollOption
}

export interface PollStatistics {
  id: string
  title: string
  description?: string
  created_by: string
  created_at: string
  expires_at?: string
  is_active: boolean
  category?: string
  total_votes: number
  unique_voters: number
  status: 'active' | 'inactive' | 'expired'
}

export interface PollResult {
  option_id: string
  poll_id: string
  option_text: string
  option_order: number
  votes_count: number
  total_votes: number
  percentage: number
}

// Form types for creating/updating polls
export interface CreatePollData {
  title: string
  description?: string
  category?: string
  expires_at?: string
  is_anonymous?: boolean
  allow_multiple_votes?: boolean
  options: {
    option_text: string
    option_order: number
  }[]
}

export interface UpdatePollData {
  title?: string
  description?: string
  category?: string
  expires_at?: string
  is_active?: boolean
  is_anonymous?: boolean
  allow_multiple_votes?: boolean
}

export interface CreateVoteData {
  poll_id: string
  poll_option_id: string
  user_id?: string
  voter_ip?: string
}

// API response types
export interface PollsResponse {
  data: Poll[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

export interface PollResponse {
  data: Poll
}

export interface VoteResponse {
  data: Vote
  poll_updated: Poll
}

// Query parameters for filtering polls
export interface PollFilters {
  category?: string
  is_active?: boolean
  created_by?: string
  search?: string
  sort_by?: 'created_at' | 'total_votes' | 'title'
  sort_order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

// Enum-like constants
export const POLL_CATEGORIES = [
  'Technology',
  'Work',
  'Food',
  'Entertainment',
  'Sports',
  'Education',
  'Health',
  'Travel',
  'Lifestyle',
  'Other'
] as const

export const POLL_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired'
} as const

export type PollCategory = typeof POLL_CATEGORIES[number]
export type PollStatusType = typeof POLL_STATUS[keyof typeof POLL_STATUS]
