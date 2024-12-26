const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Seed roles
  const roles = ['Admin', 'User'];

  for (const roleName of roles) {
    const existingRole = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!existingRole) {
      await prisma.role.create({
        data: { name: roleName },
      });
    } else {
      console.log(`Role "${roleName}" already exists.`);
    }
  }

  // Seed users
  const adminRole = await prisma.role.findUnique({
    where: { name: 'Admin' },
  });

  const userRole = await prisma.role.findUnique({
    where: { name: 'User' },
  });

  const users = [
    { username: 'admin', password: 'admin123', roleId: adminRole.id },
    { username: 'user', password: 'user123', roleId: userRole.id },
  ];

  for (const user of users) {
    const existingUser = await prisma.user.findUnique({
      where: { username: user.username },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: user,
      });
      console.log(`User "${user.username}" created.`);
    } else {
      console.log(`User "${user.username}" already exists.`);
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
