/**
 * The Vercel entry point.
 *
 * Vercel serves the built front end from its CDN and rewrites /api/* here,
 * where the same Express app that runs locally handles the request. There is
 * no second copy of the routes to keep in step: this file only hands the app
 * over.
 *
 * Requires GEMINI_API_KEY as an environment variable in the Vercel project.
 * Without it the site loads and the interface works, and only the AI and
 * text-to-speech endpoints return 500.
 */
import app from '../server';

export default app;
