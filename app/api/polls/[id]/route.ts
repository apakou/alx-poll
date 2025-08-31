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

// GET - Fetch a specific poll by ID
export async function GET(
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

    // Fetch the poll with its options
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

    // Check if user has already voted in this poll
    const { data: existingVotes, error: voteError } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', id)
      .eq('user_id', user.id)

    if (voteError) {
      console.error('Error checking votes:', voteError)
      // Continue without vote check - it's not critical
    }

    const hasVoted = existingVotes && existingVotes.length > 0

    return NextResponse.json({ 
      poll,
      hasVoted: hasVoted || false
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update a poll (only by creator)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServer()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Check if user is the creator of the poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('created_by')
      .eq('id', params.id)
      .single()

    if (pollError) {
      console.error('Error fetching poll:', pollError)
      if (pollError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch poll' }, { status: 500 })
    }

    if (poll.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden - You can only edit your own polls' }, { status: 403 })
    }

    // Update the poll
    const { data: updatedPoll, error: updateError } = await supabase
      .from('polls')
      .update({
        title: body.title?.trim(),
        description: body.description?.trim() || null,
        expires_at: body.expires_at || null,
        is_active: body.is_active,
        is_anonymous: body.is_anonymous,
        allow_multiple_votes: body.allow_multiple_votes,
        category: body.category?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        poll_options(*)
      `)
      .single()

    if (updateError) {
      console.error('Error updating poll:', updateError)
      return NextResponse.json({ error: 'Failed to update poll' }, { status: 500 })
    }

    return NextResponse.json({ 
      poll: updatedPoll,
      message: 'Poll updated successfully' 
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a poll (only by creator)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServer()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is the creator of the poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('created_by')
      .eq('id', params.id)
      .single()

    if (pollError) {
      console.error('Error fetching poll:', pollError)
      if (pollError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch poll' }, { status: 500 })
    }

    if (poll.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden - You can only delete your own polls' }, { status: 403 })
    }

    // Delete the poll (this will cascade delete options and votes due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('polls')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting poll:', deleteError)
      return NextResponse.json({ error: 'Failed to delete poll' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Poll deleted successfully' 
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
