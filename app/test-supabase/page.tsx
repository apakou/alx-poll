"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function TestSupabasePage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const testConnection = async () => {
    setLoading(true)
    try {
      // Test basic connection
      const { data, error } = await supabase.auth.getSession()
      setResult(`Connection test: ${error ? `Error: ${error.message}` : 'Success'}`)
    } catch (err) {
      setResult(`Connection failed: ${err}`)
    }
    setLoading(false)
  }

  const testSignup = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123',
        options: {
          data: {
            full_name: 'Test User',
          },
        },
      })
      setResult(`Signup test: ${error ? `Error: ${error.message}` : `Success: ${JSON.stringify(data, null, 2)}`}`)
    } catch (err) {
      setResult(`Signup failed: ${err}`)
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <Button onClick={testConnection} disabled={loading}>
          Test Connection
        </Button>
        
        <Button onClick={testSignup} disabled={loading}>
          Test Signup
        </Button>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
