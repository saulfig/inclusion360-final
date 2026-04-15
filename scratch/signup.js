
const signup = async () => {
  const url = 'https://mcqvdvqmapipfodakpoh.supabase.co/auth/v1/signup';
  const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jcXZkdnFtYXBpcGZvZGFrcG9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzgyNjQsImV4cCI6MjA5MTg1NDI2NH0.aAjPj8Ghkvd4v5BrUp0BinSSV0u0StVAmmaqv4am6JA';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@inclusion360.com',
      password: 'Password123!',
      data: {
        full_name: 'Administrador'
      }
    })
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
};

signup();
