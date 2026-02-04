import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const app = express();
const PORT = process.env.API_PORT || 3001;

// Load credentials from environment variables - MUST be set in .env file
const USER_EMAIL = process.env.TEST_USER_EMAIL || '';
const USER_PASSWORD = process.env.TEST_USER_PASSWORD || '';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || '';
const JWT_SECRET = process.env.JWT_SECRET || '';

// Validate required environment variables
if (!USER_EMAIL || !USER_PASSWORD || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ Missing required environment variables:');
  if (!USER_EMAIL) console.error('  - TEST_USER_EMAIL');
  if (!USER_PASSWORD) console.error('  - TEST_USER_PASSWORD');
  if (!ADMIN_EMAIL) console.error('  - TEST_ADMIN_EMAIL');
  if (!ADMIN_PASSWORD) console.error('  - TEST_ADMIN_PASSWORD');
  console.error('Please set these in your .env file');
  process.exit(1);
}

if (!JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET not set, using default (not secure for production)');
}

const jwtSecret = JWT_SECRET || 'test-api-secret-key-change-in-production';

// Types
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthenticatedRequest extends express.Request {
  user?: User;
}

// Mock data
const products: Product[] = [
  {
    id: '1',
    name: 'Laptop Pro',
    description: 'High-performance laptop with 16GB RAM, 512GB SSD, and a stunning 15.6" Retina display.',
    price: 999.99,
    imageUrl: 'https://picsum.photos/seed/laptop/400/300',
  },
  {
    id: '2',
    name: 'Wireless Headphones',
    description: 'Premium noise-canceling wireless headphones with 30-hour battery life.',
    price: 149.99,
    imageUrl: 'https://picsum.photos/seed/headphones/400/300',
  },
  {
    id: '3',
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with health monitoring and GPS tracking.',
    price: 299.99,
    imageUrl: 'https://picsum.photos/seed/watch/400/300',
  },
  {
    id: '4',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with Cherry MX switches.',
    price: 89.99,
    imageUrl: 'https://picsum.photos/seed/keyboard/400/300',
  },
];

// Users loaded from environment variables
const users: Record<string, { password: string; user: User }> = {
  [USER_EMAIL.toLowerCase()]: {
    password: USER_PASSWORD,
    user: { id: '1', email: USER_EMAIL, name: 'Demo User', role: 'user' },
  },
  [ADMIN_EMAIL.toLowerCase()]: {
    password: ADMIN_PASSWORD,
    user: { id: '2', email: ADMIN_EMAIL, name: 'Admin User', role: 'admin' },
  },
};

// Middleware
app.use(cors());
app.use(express.json());

// Response time tracking middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  // Store start time for performance tracking
  res.locals.startTime = startTime;
  
  // Override json to add response time header before sending
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    const duration = Date.now() - startTime;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    return originalJson(body);
  };
  
  next();
});

// Auth middleware
function authenticateToken(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as User;
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Admin middleware
function requireAdmin(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Products endpoints
app.get('/api/products', (_req, res) => {
  res.json({
    data: products,
    total: products.length,
  });
});

// Search products - MUST be before /api/products/:id to avoid route matching issues
app.get('/api/products/search', (req, res) => {
  const query = (req.query.q as string)?.toLowerCase() || '';
  const minPrice = parseFloat(req.query.minPrice as string) || 0;
  const maxPrice = parseFloat(req.query.maxPrice as string) || Infinity;

  const filtered = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
    const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
    return matchesQuery && matchesPrice;
  });

  res.json({
    data: filtered,
    total: filtered.length,
    query: { q: query, minPrice, maxPrice },
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ data: product });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const userRecord = users[email.toLowerCase()];

  if (!userRecord || userRecord.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(userRecord.user, jwtSecret, { expiresIn: '1h' });

  res.json({
    success: true,
    user: userRecord.user,
    token,
    expiresIn: 3600,
  });
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', authenticateToken, (_req, res) => {
  // In a real app, you'd invalidate the token here
  res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/auth/refresh', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  // Create a clean user object without exp/iat claims from the decoded token
  const userPayload: User = {
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
  };
  const newToken = jwt.sign(userPayload, jwtSecret, { expiresIn: '1h' });
  res.json({ token: newToken, expiresIn: 3600 });
});

// Admin-only endpoints
app.post('/api/products', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  const { name, description, price, imageUrl } = req.body;

  if (!name || !description || price === undefined) {
    return res.status(400).json({ error: 'Name, description, and price are required' });
  }

  const newProduct: Product = {
    id: (products.length + 1).toString(),
    name,
    description,
    price: parseFloat(price),
    imageUrl: imageUrl || 'https://picsum.photos/400/300',
  };

  products.push(newProduct);

  res.status(201).json({ data: newProduct, message: 'Product created successfully' });
});

app.put('/api/products/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  const productIndex = products.findIndex((p) => p.id === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const { name, description, price, imageUrl } = req.body;
  products[productIndex] = {
    ...products[productIndex],
    ...(name && { name }),
    ...(description && { description }),
    ...(price !== undefined && { price: parseFloat(price) }),
    ...(imageUrl && { imageUrl }),
  };

  res.json({ data: products[productIndex], message: 'Product updated successfully' });
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  const productIndex = products.findIndex((p) => p.id === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const deleted = products.splice(productIndex, 1)[0];
  res.json({ data: deleted, message: 'Product deleted successfully' });
});

// Performance test endpoint (artificial delay for testing)
app.get('/api/performance/slow', (_req, res) => {
  const delay = Math.random() * 500 + 100; // 100-600ms delay
  setTimeout(() => {
    res.json({ message: 'Slow response', delay: Math.round(delay) });
  }, delay);
});

app.get('/api/performance/fast', (_req, res) => {
  res.json({ message: 'Fast response' });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/products');
  console.log('  GET  /api/products/:id');
  console.log('  GET  /api/products/search?q=&minPrice=&maxPrice=');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/auth/me (auth required)');
  console.log('  POST /api/auth/logout (auth required)');
  console.log('  POST /api/auth/refresh (auth required)');
  console.log('  POST /api/products (admin only)');
  console.log('  PUT  /api/products/:id (admin only)');
  console.log('  DELETE /api/products/:id (admin only)');
  console.log('  GET  /api/performance/slow');
  console.log('  GET  /api/performance/fast');
});

export { app, server };
