import { listTools, registerTool, removeTool, executeToolAuthorization } from './tools.mjs';

export function registerToolRoutes(app) {
  app.get('/api/tools', (_req, res) => res.json({ tools: listTools() }));

  app.post('/api/tools', (req, res) => {
    try {
      return res.status(201).json({ tool: registerTool(req.body || {}) });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });

  app.put('/api/tools/:id', (req, res) => {
    try {
      return res.json({ tool: registerTool({ ...(req.body || {}), id: req.params.id }) });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/tools/:id', (req, res) => {
    try {
      return res.json(removeTool(req.params.id));
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  });

  app.post('/api/tools/:id/authorize', (req, res) => {
    try {
      const result = executeToolAuthorization(req.params.id, req.body?.action, { confirmed: req.body?.confirmed === true });
      if (result.requiresConfirmation) return res.status(409).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(403).json({ error: error.message });
    }
  });
}
