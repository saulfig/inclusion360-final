
import { createClient } from '@supabase/supabase-client';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function createTestUser() {
  const email = 'testuser@inclusion360.com';
  const password = 'Password123!';
  const fullName = 'Test User';

  console.log(`Intentando crear usuario: ${email}`);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('El usuario ya existe.');
    } else {
      console.error('Error al crear usuario:', error.message);
    }
  } else {
    console.log('Usuario creado exitosamente (o ya existía).');
  }
}

createTestUser();
