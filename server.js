const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

// Load env vars
dotenv.config();

const app = express();

// Connect to database (async, but don't block server startup)
// The connection will be established in the background
connectDB().catch((err) => {
  // Don't exit immediately - let the server start and show the error
});

// Trust proxy (important for correct protocol detection)
app.set('trust proxy', true);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS - Allow all origins for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or Swagger UI)
    if (!origin) return callback(null, true);
    // Allow all origins for development
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: false, // Set to false when using wildcard origin
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Additional CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  next();
});

// Swagger UI - Setup with swagger spec
// Create a function to get swagger spec with dynamic server URL
const getSwaggerSpec = (req) => {
  const protocol = req.protocol || 'http';
  const host = req.get('host') || `localhost:${process.env.PORT || 3000}`;
  const baseUrl = `${protocol}://${host}`;
  
  // Ensure URL is valid
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    return {
      ...swaggerSpec,
      servers: [
        { 
          url: 'http://localhost:3000', 
          description: 'Local Development Server' 
        },
      ],
    };
  }
  
  return {
    ...swaggerSpec,
    servers: [
      { 
        url: baseUrl, 
        description: 'Current Server' 
      },
      { 
        url: 'http://localhost:3000', 
        description: 'Local Development Server' 
      },
    ],
  };
};

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', (req, res, next) => {
  const spec = getSwaggerSpec(req);
  const swaggerUiHandler = swaggerUi.setup(spec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Site Snap API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
      validatorUrl: null, // Disable validator to avoid external requests
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    },
  });
  swaggerUiHandler(req, res, next);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/sellers', require('./routes/sellers'));
app.use('/api/businesses', require('./routes/businesses'));
app.use('/api/site-details', require('./routes/siteDetails'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/attributes', require('./routes/attributes'));
app.use('/api/hero-slides', require('./routes/heroSlides'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/story-cards', require('./routes/storyCards'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/uploads', require('./routes/uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

