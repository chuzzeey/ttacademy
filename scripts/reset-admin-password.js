// Script to reset admin user password in Supabase Auth
// Run this with: node scripts/reset-admin-password.js

async function resetAdminPassword() {
  const email = 'amahchibu@gmail.com';
  const newPassword = 'Brilly123';

  console.log('Resetting admin password...');
  console.log('Email:', email);
  console.log('New Password:', newPassword);
  console.log('');

  try {
    const response = await fetch('http://localhost:3000/api/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: newPassword,
        name: 'Admin User'
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Admin password reset successfully!');
      console.log('');
      console.log('You can now login at: /admin-login');
      console.log('Email:', email);
      console.log('Password:', newPassword);
    } else if (result.error && result.error.includes('already been registered')) {
      console.log('⚠️  User already exists. Updating password...');
      
      // Try to update the user using the admin API directly
      const updateResponse = await fetch('http://localhost:3000/api/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: newPassword,
          name: 'Admin User',
          update: true
        })
      });
      
      const updateResult = await updateResponse.json();
      
      if (updateResponse.ok) {
        console.log('✅ Admin password updated successfully!');
        console.log('');
        console.log('You can now login at: /admin-login');
        console.log('Email:', email);
        console.log('Password:', newPassword);
      } else {
        console.error('❌ Error updating admin password:');
        console.error(updateResult.error);
        console.log('');
        console.log('Note: The user exists but we need to update the password.');
        console.log('Please use the Supabase dashboard to reset the password manually.');
      }
    } else {
      console.error('❌ Error:');
      console.error(result.error);
    }
  } catch (error) {
    console.error('❌ Failed to connect to server:');
    console.error(error.message);
    console.error('');
    console.error('Make sure your Next.js server is running on http://localhost:3000');
    process.exit(1);
  }
}

resetAdminPassword();