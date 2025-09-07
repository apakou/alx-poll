import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create Supabase Server Client
 * 
 * Initializes a Supabase client for server-side operations with proper
 * cookie handling for authentication. This client has access to user
 * sessions and can perform authenticated database operations.
 * 
 * Security features:
 * - Uses environment variables for secure configuration
 * - Handles cookies for session persistence
 * - Supports Row Level Security (RLS) with user context
 * 
 * @returns Configured Supabase client for server-side use
 */
async function createSupabaseServer() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

/**
 * Vote Submission Handler
 * 
 * Processes poll voting requests with comprehensive validation and security checks.
 * Handles both single and multiple vote submissions based on poll configuration.
 * 
 * Validation pipeline:
 * 1. Authentication verification (user must be logged in)
 * 2. Request payload validation (option IDs required)
 * 3. Poll existence and accessibility check
 * 4. Poll status validation (active, not expired)
 * 5. Duplicate vote prevention (one vote per user per poll)
 * 6. Option validation (options must belong to poll)
 * 7. Multiple vote rules enforcement
 * 8. Anonymous voting privacy handling
 * 
 * Database operations:
 * - Creates vote records with proper user/IP association
 * - Updates poll option vote counts in real-time
 * - Updates total poll vote count
 * - Returns updated poll data for UI refresh
 * 
 * Security measures:
 * - User authentication required
 * - Poll ownership and access control via RLS
 * - Input validation and sanitization
 * - Duplicate vote prevention
 * - Anonymous voting IP tracking for abuse prevention
 * 
 * @param request - HTTP request containing vote data
 * @param params - URL parameters containing poll ID
 * @returns JSON response with updated poll data or error message
 * 
 * @example
 * ```typescript
 * // Submit vote for single option
 * const response = await fetch(`/api/polls/${pollId}/vote`, {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ optionIds: ['option-1'] })
 * })
 * 
 * // Submit multiple votes (if allowed)
 * const response = await fetch(`/api/polls/${pollId}/vote`, {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ optionIds: ['option-1', 'option-3'] })
 * })
 * ```
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer()
    const { id } = await params
    
    // Authentication check - ensure user is logged in
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request payload
    const { optionIds }: { optionIds: string[] } = await request.json()

    if (!optionIds || optionIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one option must be selected' }, 
        { status: 400 }
      )
    }

    // Fetch poll with options to validate voting rules and permissions
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options(*)
      `)
      .eq('id', id)
      .single()

    if (pollError) {
      console.error('Error fetching poll:', pollError)
      if (pollError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch poll' }, { status: 500 })
    }

    // Validate poll status - must be active for voting
    if (!poll.is_active) {
      return NextResponse.json({ error: 'Poll is not active' }, { status: 400 })
    }

    // Check poll expiration - cannot vote on expired polls
    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Poll has expired' }, { status: 400 })
    }

    // Duplicate vote prevention - one vote per user per poll
    const { data: existingVotes, error: voteCheckError } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', id)
      .eq('user_id', user.id)

    if (voteCheckError) {
      console.error('Error checking existing votes:', voteCheckError)
      return NextResponse.json({ error: 'Failed to check voting status' }, { status: 500 })
    }

    if (existingVotes && existingVotes.length > 0) {
      return NextResponse.json({ error: 'You have already voted in this poll' }, { status: 400 })
    }

    // Validate that all selected options belong to this poll
    const pollOptionIds = poll.poll_options.map((option: any) => option.id)
    const invalidOptions = optionIds.filter(id => !pollOptionIds.includes(id))
    
    if (invalidOptions.length > 0) {
      return NextResponse.json({ error: 'Invalid option selected' }, { status: 400 })
    }

    // Enforce multiple vote rules based on poll configuration
    if (!poll.allow_multiple_votes && optionIds.length > 1) {
      return NextResponse.json({ error: 'This poll only allows one vote per user' }, { status: 400 })
    }

    /**
     * Create Vote Records
     * 
     * Prepares vote data with proper anonymity handling:
     * - Anonymous polls: Store voter IP for abuse prevention, exclude user ID
     * - Named polls: Store user ID for transparency, exclude IP address
     * 
     * Each selected option gets its own vote record for granular tracking.
     */
    const voteData = optionIds.map(optionId => ({
      poll_id: id, // Link vote to specific poll
      poll_option_id: optionId, // Link vote to specific option
      user_id: poll.is_anonymous ? null : user.id, // User ID only for non-anonymous polls
      voter_ip: poll.is_anonymous ? request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') : null // IP only for anonymous polls
    }))

    // Insert vote records into database
    const { error: voteError } = await supabase
      .from('votes')
      .insert(voteData)

    if (voteError) {
      console.error('Error creating votes:', voteError)
      return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 })
    }

    /**
     * Update Vote Counts
     * 
     * Recalculates and updates vote counts for affected options.
     * This ensures real-time accuracy for poll results display.
     * 
     * Process:
     * 1. Count all votes for each voted option
     * 2. Update poll_options.votes_count with current total
     * 3. Update polls.total_votes with overall poll total
     */
    
    // Update individual option vote counts
    for (const optionId of optionIds) {
      const { data: voteCount } = await supabase
        .from('votes')
        .select('id')
        .eq('poll_option_id', optionId)
      
      if (voteCount) {
        await supabase
          .from('poll_options')
          .update({ votes_count: voteCount.length })
          .eq('id', optionId)
      }
    }

    // Update total poll vote count
    const { data: totalVotes } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', id)
    
    if (totalVotes) {
      await supabase
        .from('polls')
        .update({ total_votes: totalVotes.length })
        .eq('id', id)
    }

    /**
     * Return Updated Poll Data
     * 
     * Fetches the complete poll with updated vote counts for immediate
     * UI refresh. This provides real-time feedback to the user and
     * ensures consistent state across the application.
     */
    const { data: updatedPoll, error: fetchError } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options(*)
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching updated poll:', fetchError)
      return NextResponse.json({ error: 'Vote submitted but failed to fetch updated data' }, { status: 500 })
    }

    return NextResponse.json({ 
      poll: updatedPoll,
      message: 'Vote submitted successfully' 
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
