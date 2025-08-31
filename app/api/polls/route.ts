import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CreatePollData } from '@/lib/types'

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

// GET - Fetch all polls
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const isActive = searchParams.get('is_active')
    const createdBy = searchParams.get('created_by')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    // Build query
    let query = supabase
      .from('polls')
      .select(`
        *,
        poll_options(*)
      `)

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    if (createdBy) {
      query = query.eq('created_by', createdBy)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    const { data: polls, error } = await query

    if (error) {
      console.error('Error fetching polls:', error)
      return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 })
    }

    return NextResponse.json({ polls })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new poll
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body: CreatePollData = await request.json()
    
    console.log('Received poll data:', body)
    
    // Validate required fields
    if (!body.title || !body.options || body.options.length < 2) {
      console.log('Validation failed:', { title: body.title, optionsLength: body.options?.length })
      return NextResponse.json(
        { error: 'Title and at least 2 options are required' }, 
        { status: 400 }
      )
    }

    // Validate options (they're strings in this type)
    const validOptions = body.options.filter(option => typeof option === 'string' && option.trim().length > 0)
    if (validOptions.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 non-empty options are required' }, 
        { status: 400 }
      )
    }

    // Convert endDate to expires_at
    const expiresAt = body.endDate ? new Date(body.endDate).toISOString() : null

    // Create poll
    console.log('Creating poll with user ID:', user.id)
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        created_by: user.id,
        expires_at: expiresAt,
        is_anonymous: body.isAnonymous ?? true,
        allow_multiple_votes: body.allowMultipleVotes ?? false,
        category: null, // Not in the UI CreatePollData type
        image_url: null, // Not in the UI CreatePollData type
        is_active: true,
        total_votes: 0
      })
      .select()
      .single()

    if (pollError) {
      console.error('Error creating poll:', pollError)
      return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 })
    }

    console.log('Poll created successfully:', poll.id)

    // Create poll options
    const optionsData = validOptions.map((option, index) => ({
      poll_id: poll.id,
      option_text: option.trim(),
      option_order: index + 1, // Start from 1, not 0
      votes_count: 0 // Correct column name
    }))

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsData)

    if (optionsError) {
      console.error('Error creating poll options:', optionsError)
      console.error('Options data:', optionsData)
      // Clean up the poll if options creation failed
      await supabase.from('polls').delete().eq('id', poll.id)
      return NextResponse.json({ 
        error: 'Failed to create poll options',
        details: optionsError.message 
      }, { status: 500 })
    }

    // Fetch the complete poll with options
    const { data: completePoll, error: fetchError } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options(*)
      `)
      .eq('id', poll.id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete poll:', fetchError)
      return NextResponse.json({ error: 'Poll created but failed to fetch complete data' }, { status: 500 })
    }

    return NextResponse.json({ 
      poll: completePoll,
      message: 'Poll created successfully' 
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
