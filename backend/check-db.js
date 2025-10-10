const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...\n');
    
    // Get all clients
    const allClients = await prisma.client.findMany();
    console.log('📊 Total clients in database:', allClients.length);
    
    // Get active clients
    const activeClients = await prisma.client.findMany({
      where: { isActive: true }
    });
    console.log('✅ Active clients:', activeClients.length);
    
    // Get inactive clients
    const inactiveClients = await prisma.client.findMany({
      where: { isActive: false }
    });
    console.log('❌ Inactive clients:', inactiveClients.length);
    
    // Display all clients
    if (allClients.length > 0) {
      console.log('\n📋 Client Details:');
      allClients.forEach((client, index) => {
        console.log(`\n${index + 1}. ${client.name}`);
        console.log(`   ID: ${client.id}`);
        console.log(`   Client ID: ${client.clientId}`);
        console.log(`   Email: ${client.email || 'N/A'}`);
        console.log(`   Phone: ${client.phone}`);
        console.log(`   Type: ${client.clientType}`);
        console.log(`   KYC Status: ${client.kycStatus}`);
        console.log(`   Active: ${client.isActive}`);
        console.log(`   Created: ${client.createdAt}`);
      });
    } else {
      console.log('\n⚠️ No clients found in database!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
