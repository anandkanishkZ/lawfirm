// Quick API Test Script
// Open browser console and paste this to test the API

async function testAPI() {
  const token = localStorage.getItem('auth-token');
  console.log('Token:', token ? 'Found' : 'Not found');
  
  try {
    const response = await fetch('http://localhost:5000/api/clients?page=1&limit=100', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Full Response:', data);
    console.log('Status:', data.status);
    console.log('Data property:', data.data);
    console.log('Clients array:', data.data?.clients);
    console.log('Clients count:', data.data?.clients?.length || 0);
    console.log('Pagination:', data.data?.pagination);
    
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testAPI();
