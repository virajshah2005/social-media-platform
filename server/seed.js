const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');

const seedUsers = async () => {
  try {
    console.log('🌱 Seeding database with demo users...');

    // Clear existing users and recreate them
    await pool.execute('DELETE FROM users');
    console.log('🗑️ Cleared existing users');

    // Demo users data
    const demoUsers = [
      {
        username: 'ronaldo',
        email: 'ronaldo@social.com',
        password: 'password123',
        full_name: 'Cristiano Ronaldo',
        bio: 'Professional footballer and global icon',
        profile_picture: null,
        is_verified: true
      },
      {
        username: 'virat',
        email: 'virat@social.com',
        password: 'password123',
        full_name: 'Virat Kohli',
        bio: 'Indian cricket team captain',
        profile_picture: null,
        is_verified: true
      },
      {
        username: 'viraj_linkedin25',
        email: 'viraj@social.com',
        password: 'password123',
        full_name: 'Viraj',
        bio: 'Software developer and tech enthusiast',
        profile_picture: null,
        is_verified: false
      }
    ];

    // Hash passwords and insert users
    for (const user of demoUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      
      await pool.execute(
        'INSERT INTO users (username, email, password, full_name, bio, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
        [user.username, user.email, hashedPassword, user.full_name, user.bio, user.is_verified]
      );
      
      console.log(`✅ Created user: ${user.username}`);
    }

    console.log('🎉 Database seeded successfully!');
    console.log('\nDemo accounts:');
    console.log('- Email: ronaldo@social.com, Password: password123');
    console.log('- Email: virat@social.com, Password: password123');
    console.log('- Email: viraj@social.com, Password: password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit(0);
  }
};

// Run the seed function
seedUsers(); 