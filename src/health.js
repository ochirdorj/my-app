// src/health.js
const express = require('express');
const router = express.Router();

// Liveness probe — "am I running at all?"
// Kubernetes kills the pod and restarts it if this fails
router.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Readiness probe — "am I ready to serve traffic?"
// Kubernetes removes the pod from load balancer if this fails
// This is where you check DB connections, cache warmup, etc.
router.get('/readyz', async (req, res) => {
  try {
    // Example: check DB connectivity
    // await db.ping();
    res.status(200).json({ status: 'ready' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', error: err.message });
  }
});

module.exports = router;