// Example API route for polls
// This file shows how to integrate the database schema with Next.js API routes

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { pollService } from '@/lib/database'
import type { PollFilters } from '@/lib/types/database'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const filters: PollFilters = {
      category: searchParams.get('category') || undefined,
      is_active: searchParams.get('is_active') === 'true',
      created_by: searchParams.get('created_by') || undefined,
      search: searchParams.get('search') || undefined,
      sort_by: (searchParams.get('sort_by') as any) || 'created_at',
      sort_order: (searchParams.get('sort_order') as any) || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      per_page: parseInt(searchParams.get('per_page') || '10')
    }

    // Get polls using the service
    const result = await pollService.getPolls(filters)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching polls:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.options || body.options.length < 2) {
      return NextResponse.json(
        { error: 'Title and at least 2 options are required' },
        { status: 400 }
      )
    }

    // Create poll data
    const pollData = {
      title: body.title,
      description: body.description,
      category: body.category,
      expires_at: body.expires_at,
      is_anonymous: body.is_anonymous || false,
      allow_multiple_votes: body.allow_multiple_votes || false,
      options: body.options.map((text: string, index: number) => ({
        option_text: text,
        option_order: index + 1
      }))
    }

    // Create poll using the service
    const poll = await pollService.createPoll(pollData, user.id)

    return NextResponse.json({ data: poll }, { status: 201 })

  } catch (error) {
    console.error('Error creating poll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/*
Usage Examples:

1. Get all active polls:
   GET /api/polls?is_active=true

2. Get polls by category:
   GET /api/polls?category=Technology

3. Search polls:
   GET /api/polls?search=programming

4. Get user's polls:
   GET /api/polls?created_by=user-id

5. Create a new poll:
   POST /api/polls
   {
     "title": "Favorite Programming Language",
     "description": "Which language do you prefer?",
     "category": "Technology",
     "expires_at": "2024-12-31T23:59:59Z",
     "is_anonymous": false,
     "allow_multiple_votes": false,
     "options": ["JavaScript", "Python", "TypeScript", "Go"]
   }
*/
