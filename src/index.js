// src/index.js
const express = require('express');
const healthRouter = require('./health');
const { version } = require('react');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/', healthRouter);

// Your actual app routes
app.get('/api/v1/items', (req, res) => {
  res.json({ items: [], version: 'v2' });
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