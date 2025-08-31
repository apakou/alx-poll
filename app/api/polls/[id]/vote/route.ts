import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Create Supabase client for server-side operations
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

// POST - Submit a vote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer()
    const { id } = await params
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const { optionIds }: { optionIds: string[] } = await request.json()

    if (!optionIds || optionIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one option must be selected' }, 
        { status: 400 }
      )
    }

    // Fetch the poll to validate voting rules
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

    // Validate poll is active and not expired
    if (!poll.is_active) {
      return NextResponse.json({ error: 'Poll is not active' }, { status: 400 })
    }

    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Poll has expired' }, { status: 400 })
    }

    // Check if user has already voted
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

    // Validate option IDs belong to this poll
    const pollOptionIds = poll.poll_options.map((option: any) => option.id)
    const invalidOptions = optionIds.filter(id => !pollOptionIds.includes(id))
    
    if (invalidOptions.length > 0) {
      return NextResponse.json({ error: 'Invalid option selected' }, { status: 400 })
    }

    // Check multiple votes rule
    if (!poll.allow_multiple_votes && optionIds.length > 1) {
      return NextResponse.json({ error: 'This poll only allows one vote per user' }, { status: 400 })
    }

    // Create vote records
    const voteData = optionIds.map(optionId => ({
      poll_id: id,
      poll_option_id: optionId,
      user_id: poll.is_anonymous ? null : user.id,
      voter_ip: poll.is_anonymous ? request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') : null
    }))

    const { error: voteError } = await supabase
      .from('votes')
      .insert(voteData)

    if (voteError) {
      console.error('Error creating votes:', voteError)
      return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 })
    }

    // Update vote counts for poll options
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

    // Update total votes for the poll
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

    // Fetch updated poll with new vote counts
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
