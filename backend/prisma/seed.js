const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Disable foreign key checks
  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);

  // Truncate tables
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE User;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE Role;`);

  // Re-enable foreign key checks
  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);

  console.log('Tables truncated.');

  // Seed roles
  const roles = ['Admin', 'User', 'Manager'];

  for (const roleName of roles) {
    await prisma.role.create({
      data: { name: roleName },
    });
  }

  console.log('Roles seeded.');

  // Fetch roles
  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
  const userRole = await prisma.role.findUnique({ where: { name: 'User' } });
  const managerRole = await prisma.role.findUnique({ where: { name: 'Manager' } });

  // Seed users with hashed passwords
  const users = [
    { username: 'admin1', password: 'admin123', roleId: adminRole.id },
    { username: 'admin2', password: 'admin456', roleId: adminRole.id },
    { username: 'user1', password: 'user123', roleId: userRole.id },
    { username: 'user2', password: 'user456', roleId: userRole.id },
    { username: 'user3', password: 'user789', roleId: userRole.id },
    { username: 'user4', password: 'user101', roleId: userRole.id },
    { username: 'user5', password: 'user202', roleId: userRole.id },
    { username: 'manager1', password: 'manager123', roleId: managerRole.id },
    { username: 'manager2', password: 'manager456', roleId: managerRole.id },
    { username: 'manager3', password: 'manager789', roleId: managerRole.id },
    { username: 'manager4', password: 'manager101', roleId: managerRole.id },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: { username: user.username, password: hashedPassword, roleId: user.roleId },
    });
    console.log(`User "${user.username}" created.`);
  }

  console.log('Users seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
