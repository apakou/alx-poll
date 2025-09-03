// Simple test to check API endpoint
async function testAPI() {
  try {
    console.log('Testing /api/polls endpoint...')
    const response = await fetch('http://localhost:3000/api/polls')
    console.log('Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Success:', data)
    } else {
      const errorText = await response.text()
      console.log('Error response:', errorText)
    }
  } catch (error) {
    console.error('Network error:', error)
  }
}

testAPI()
