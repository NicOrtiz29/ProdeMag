import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Parse .env manually if dotenv doesn't find it
const envConfig = dotenv.parse(fs.readFileSync('.env'))
for (const k in envConfig) {
  process.env[k] = envConfig[k]
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createSuperadmin(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: 'Superadmin',
        province: 'CABA',
        avatar: '⚽'
      }
    }
  });

  if (error) {
    console.error(`❌ Error creating ${email}:`, error.message);
  } else {
    console.log(`✅ Created ${email} successfully!`);
  }
}

async function main() {
  await createSuperadmin('nicolaso@magnetico.dev', 'Abcd1234!', 'Nicolás O.');
  await createSuperadmin('santiagob@magnetico.dev', 'Abcd1234!', 'Santiago B.');
}

main();
