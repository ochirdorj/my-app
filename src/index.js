// src/index.js
const express = require('express');
const healthRouter = require('./health');

const dbPassword = process.env.DB_PASSWORD;
const apiKey = process.env.API_KEY;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/', healthRouter);

// Your actual app routes
app.get('/api/v1/burn-cpu', (req, res) => {
  const start = Date.now();
  while (Date.now() - start < 500) {
    Math.sqrt(Math.random());
  }
  res.json({ done: true });
});

// Graceful shutdown — critical for Kubernetes rolling deploys
// When K8s sends SIGTERM, finish in-flight requests, then exit
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});