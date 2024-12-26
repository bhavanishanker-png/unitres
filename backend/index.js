const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001; // Use a different port

// Middleware
// Configure CORS
app.use(cors({
  origin: '*', // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // If using cookies or authentication
}));

// OR (Allow all origins, less secure)
// app.use(cors());

app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Authentication Middleware
const auth = async (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// API Routes
// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, roleId: user.roleId }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Menu Items by Role
app.get('/api/menu', auth, async (req, res) => {
  try {
    const { roleId } = req.user;

    const menus = await prisma.menu.findMany({
      where: { roleId },
    });

    res.json(menus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get User Permissions
app.get('/api/user/permissions', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const permissions = {
      canView: true,
      canEdit: ['Admin', 'Manager'].includes(user.role.name),
      canDelete: user.role.name === 'Admin',
    };

    res.json(permissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Sync Database and Seed Data
async function main() {
  await prisma.$connect();

  // Create roles
  const roles = await prisma.role.createMany({
    data: [
      { name: 'Admin' },
      { name: 'Manager' },
      { name: 'User' },
    ],
    skipDuplicates: true,
  });

  // Create users
  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
  const managerRole = await prisma.role.findUnique({ where: { name: 'Manager' } });
  const userRole = await prisma.role.findUnique({ where: { name: 'User' } });

  const hashedPassword = await bcrypt.hash('password', 10);
  await prisma.user.createMany({
    data: [
      { username: 'admin', password: hashedPassword, roleId: adminRole.id },
      { username: 'manager', password: hashedPassword, roleId: managerRole.id },
      { username: 'user', password: hashedPassword, roleId: userRole.id },
    ],
    skipDuplicates: true,
  });

  // Create menu items
  await prisma.menu.createMany({
    data: [
      { title: 'Dashboard', path: '/dashboard', roleId: adminRole.id },
      { title: 'User Management', path: '/user-management', roleId: adminRole.id },
      { title: 'Role Management', path: '/role-management', roleId: adminRole.id },
      { title: 'Reports', path: '/reports', roleId: managerRole.id },
      { title: 'Help', path: '/help', roleId: userRole.id },
    ],
    skipDuplicates: true,
  });

  console.log('Database synced and seeded.');
}

// Start Server
main()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Error starting server:', err);
    process.exit(1);
  });
