// Script to create admin user in Supabase Auth
// Run this with: node scripts/create-admin.js

async function createAdmin() {
  const email = 'adminb@atomic.io';
  const password = process.env.ADMIN_PASSWORD;
  const sessionCookie = process.env.ADMIN_SESSION_COOKIE;
  const baseUrl = process.env.ADMIN_BASE_URL || 'http://localhost:3001';
  const name = 'Admin User';

  if (!password || !sessionCookie) {
    console.error('Set ADMIN_PASSWORD and ADMIN_SESSION_COOKIE in your local environment.');
    process.exit(1);
  }

  console.log('Creating admin user...');
  console.log('Email:', email);
  console.log('');

  try {
    const response = await fetch(`${baseUrl}/api/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        email: email,
        password: password,
        name: name
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Admin user created successfully!');
      console.log('User ID:', result.user.id);
      console.log('Email:', result.user.email);
      console.log('Role:', result.user.role);
      console.log('');
      console.log('You can now login at: /admin-login');
      console.log('Email:', email);
    } else {
      console.error('❌ Error creating admin user:');
      console.error(result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to connect to server:');
    console.error(error.message);
    console.error('');
    console.error(`Make sure your Next.js server is running at ${baseUrl}`);
    process.exit(1);
  }
}

createAdmin();