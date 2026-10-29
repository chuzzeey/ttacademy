// Script to reset admin user password in Supabase Auth
// Run this with: node scripts/reset-admin-password.js

async function resetAdminPassword() {
  const email = 'amahchibu@gmail.com';
  const newPassword = process.env.ADMIN_PASSWORD;
  const sessionCookie = process.env.ADMIN_SESSION_COOKIE;
  const baseUrl = process.env.ADMIN_BASE_URL || 'http://localhost:3001';

  if (!newPassword || !sessionCookie) {
    console.error('Set ADMIN_PASSWORD and ADMIN_SESSION_COOKIE in your local environment.');
    process.exit(1);
  }

  console.log('Resetting admin password...');
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
        password: newPassword,
        name: 'Admin User',
        update: true,
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Admin password reset successfully!');
    } else {
      console.error('❌ Error resetting admin password:');
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

resetAdminPassword();