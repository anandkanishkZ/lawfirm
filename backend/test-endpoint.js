const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGetAllClients() {
  try {
    console.log('🔍 Testing getAllClients endpoint logic...\n');
    
    const page = 1;
    const limit = 100;
    const isActive = true;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause (simulating what the controller does)
    const whereClause = {
      isActive: isActive === true || isActive === 'true'
    };
    
    console.log('📝 Where clause:', JSON.stringify(whereClause, null, 2));
    
    // Get clients with pagination
    const [clients, totalCount] = await Promise.all([
      prisma.client.findMany({
        where: whereClause,
        include: {
          assignedLawyer: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.client.count({ where: whereClause })
    ]);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;
    
    const response = {
      status: 'success',
      data: {
        clients,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      }
    };
    
    console.log('\n📊 Response structure:');
    console.log('Status:', response.status);
    console.log('Data keys:', Object.keys(response.data));
    console.log('Clients count:', response.data.clients.length);
    console.log('Total count:', response.data.pagination.totalCount);
    
    console.log('\n📋 Full response:');
    console.log(JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGetAllClients();
