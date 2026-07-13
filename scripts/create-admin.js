// Script to create admin user in Supabase Auth
// Run this with: node scripts/create-admin.js

async function createAdmin() {
  const email = 'amahchibu@gmail.com';
  const password = 'Brilly123';
  const name = 'Admin User';

  console.log('Creating admin user...');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('');

  try {
    const response = await fetch('http://localhost:3000/api/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      console.log('Password:', password);
    } else {
      console.error('❌ Error creating admin user:');
      console.error(result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to connect to server:');
    console.error(error.message);
    console.error('');
    console.error('Make sure your Next.js server is running on http://localhost:3000');
    process.exit(1);
  }
}

createAdmin();