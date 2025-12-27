const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', productRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      database: 'MongoDB',
      storage: 'Cloudinary',
      status: 'operational'
    }
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Distributor Management System API',
    version: '2.0.0',
    endpoints: {
      products: {
        getAll: 'GET /api/products?page=1&limit=10&category=Daily&status=active&search=name',
        getOne: 'GET /api/products/:id',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id',
        options: 'GET /api/products/options',
        byCategory: 'GET /api/products/category/:category?page=1&limit=10',
        stats: 'GET /api/products/stats/summary'
      },
      system: {
        health: 'GET /health'
      }
    },
    features: {
      pagination: 'All GET endpoints support pagination with ?page=1&limit=10',
      filters: 'Filter by category, status, and search by name',
      enums: 'Category and UOM as dropdown enums',
      imageUpload: 'Cloudinary integration'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    suggestion: 'Try GET /api/products or GET /health'
  });
});

app.use(errorHandler);

module.exports = app;