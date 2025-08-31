// Database utility functions for polls
import { createClient } from '@/lib/supabase/client'
import type { 
  Poll, 
  PollOption, 
  Vote, 
  CreatePollData, 
  CreateVoteData,
  PollFilters,
  Database 
} from '@/lib/types/database'

// Poll operations
export class PollService {
  private supabase = createClient()

  constructor() {
    this.supabase = createClient()
  }

  // Get all polls with filters
  async getPolls(filters: PollFilters = {}) {
    let query = this.supabase
      .from('polls')
      .select(`
        *,
        poll_options(*)
      `)

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters.created_by) {
      query = query.eq('created_by', filters.created_by)
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply sorting
    const sortBy = filters.sort_by || 'created_at'
    const sortOrder = filters.sort_order || 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const page = filters.page || 1
    const perPage = filters.per_page || 10
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data || [],
      count: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage)
    }
  }

  // Get single poll by ID
  async getPoll(id: string) {
    const { data, error } = await this.supabase
      .from('polls')
      .select(`
        *,
        poll_options(*),
        votes(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // Create new poll
  async createPoll(pollData: CreatePollData, userId: string) {
    const { data: poll, error: pollError } = await this.supabase
      .from('polls')
      .insert({
        title: pollData.title,
        description: pollData.description,
        category: pollData.category,
        expires_at: pollData.expires_at,
        is_anonymous: pollData.is_anonymous || false,
        allow_multiple_votes: pollData.allow_multiple_votes || false,
        created_by: userId
      })
      .select()
      .single()

    if (pollError) throw pollError

    // Insert poll options
    const { error: optionsError } = await this.supabase
      .from('poll_options')
      .insert(
        pollData.options.map(option => ({
          poll_id: poll.id,
          option_text: option.option_text,
          option_order: option.option_order
        }))
      )

    if (optionsError) throw optionsError

    return poll
  }

  // Update poll
  async updatePoll(id: string, updates: Partial<Poll>) {
    const { data, error } = await this.supabase
      .from('polls')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete poll
  async deletePoll(id: string) {
    const { error } = await this.supabase
      .from('polls')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Cast vote
  async castVote(voteData: CreateVoteData) {
    const { data, error } = await this.supabase
      .from('votes')
      .insert(voteData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Remove vote
  async removeVote(voteId: string) {
    const { error } = await this.supabase
      .from('votes')
      .delete()
      .eq('id', voteId)

    if (error) throw error
  }

  // Get user's vote for a poll
  async getUserVote(pollId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('votes')
      .select('*')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return data
  }

  // Get poll results
  async getPollResults(pollId: string) {
    const { data, error } = await this.supabase
      .from('poll_results')
      .select('*')
      .eq('poll_id', pollId)
      .order('option_order')

    if (error) throw error
    return data || []
  }

  // Get poll statistics
  async getPollStatistics(pollId: string) {
    const { data, error } = await this.supabase
      .from('poll_statistics')
      .select('*')
      .eq('id', pollId)
      .single()

    if (error) throw error
    return data
  }

  // Subscribe to poll changes
  subscribeToPoll(pollId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`poll-${pollId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `poll_id=eq.${pollId}`
        },
        callback
      )
      .subscribe()
  }

  // Cleanup expired polls
  async cleanupExpiredPolls() {
    const { data, error } = await this.supabase
      .rpc('cleanup_expired_polls')

    if (error) throw error
    return data
  }
}

// Export singleton instance
export const pollService = new PollService()

// Helper functions
export function formatPollForUI(poll: any): Poll {
  return {
    ...poll,
    expires_at: poll.expires_at ? new Date(poll.expires_at).toISOString() : null,
    created_at: new Date(poll.created_at).toISOString(),
    updated_at: new Date(poll.updated_at).toISOString()
  }
}

export function isPollExpired(poll: Poll): boolean {
  if (!poll.expires_at) return false
  return new Date(poll.expires_at) < new Date()
}

export function isPollActive(poll: Poll): boolean {
  return poll.is_active && !isPollExpired(poll)
}

export function calculatePercentage(votes: number, total: number): number {
  if (total === 0) return 0
  return Math.round((votes / total) * 100 * 100) / 100 // Round to 2 decimal places
}
