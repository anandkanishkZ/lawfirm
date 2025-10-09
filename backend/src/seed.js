const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('./utils/auth');

const prisma = new PrismaClient();

const seedUsers = async () => {
  console.log('🌱 Seeding database with initial users...');

  const defaultPassword = await hashPassword('password');

  const users = [
    {
      email: 'admin@lawfirm.com',
      password: defaultPassword,
      name: 'Admin User',
      role: 'ADMIN',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    },
    {
      email: 'lawyer@lawfirm.com',
      password: defaultPassword,
      name: 'Sarah Johnson',
      role: 'LAWYER',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    },
    {
      email: 'staff@lawfirm.com',
      password: defaultPassword,
      name: 'Michael Chen',
      role: 'STAFF',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    },
    {
      email: 'client@example.com',
      password: defaultPassword,
      name: 'Emma Wilson',
      role: 'CLIENT',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    },
  ];

  try {
    for (const userData of users) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const user = await prisma.user.create({
          data: userData,
        });
        console.log(`✅ Created user: ${user.name} (${user.email})`);
      } else {
        console.log(`⏭️  User already exists: ${userData.email}`);
      }
    }
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await seedUsers();
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Default Users Created:');
    console.log('  Admin: admin@lawfirm.com / password');
    console.log('  Lawyer: lawyer@lawfirm.com / password');
    console.log('  Staff: staff@lawfirm.com / password');
    console.log('  Client: client@example.com / password');
    console.log('\n🔒 Please change these default passwords in production!\n');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

// Run the seeder
if (require.main === module) {
  main();
}

module.exports = { seedUsers };