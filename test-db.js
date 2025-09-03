// Test database connection and schema
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  try {
    console.log('Testing database connection...')
    
    // Test polls table
    const { data: polls, error: pollsError } = await supabase
      .from('polls')
      .select('*')
      .limit(1)
    
    if (pollsError) {
      console.error('Error accessing polls table:', pollsError)
    } else {
      console.log('✓ Polls table accessible')
    }
    
    // Test poll_options table
    const { data: options, error: optionsError } = await supabase
      .from('poll_options')
      .select('*')
      .limit(1)
    
    if (optionsError) {
      console.error('Error accessing poll_options table:', optionsError)
    } else {
      console.log('✓ Poll_options table accessible')
    }
    
    // Test votes table
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .limit(1)
    
    if (votesError) {
      console.error('Error accessing votes table:', votesError)
    } else {
      console.log('✓ Votes table accessible')
    }
    
    console.log('Database test completed')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testDatabase()
