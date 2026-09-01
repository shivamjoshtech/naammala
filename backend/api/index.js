// Vercel serverless entry point.
// Every request to /api/* is routed here (see vercel.json), and Vercel's
// Node runtime calls this exported Express app directly per-request.

import app from "../server.js";

export default app;