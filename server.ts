import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Tally Submission Proxy
  app.post('/api/submit-tally', async (req, res) => {
    try {
      const { formId, answers } = req.body;
      if (!formId) return res.status(400).json({ error: 'formId is required' });

      const response = await fetch(`https://tally.so/api/v1/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        body: JSON.stringify({ formId, answers: answers || [] })
      });

      if (!response.ok) {
        const errorData = await response.text();
        return res.status(response.status).json({ error: 'Tally submission failed', details: errorData });
      }

      const data = await response.json();
      res.json({ success: true, data });
    } catch (error) {
      console.error('[API] Submission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa', // Vite handles SPA fallback automatically
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
