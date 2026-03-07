import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

import routes from './routes/index.js';
import { swaggerSpec } from './docs/swagger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(
  helmet({
    // API responses do not render HTML documents, so CSP is unnecessary here
    // and can block media loaded by the frontend from a different origin.
    contentSecurityPolicy: false,
    // Allow uploaded images and files to be embedded cross-origin by the frontend.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
