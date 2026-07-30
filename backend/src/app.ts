import cors from 'cors';
import express from 'express';
import type { Request, Response } from 'express';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { notFoundMiddleware } from './middlewares/not-found.middleware.js';
import { buildApiRouter } from './routes/index.js';

const app = express();

app.use(
  cors({
    origin: true
  })
);
app.use(express.json());
app.use('/api', buildApiRouter());

app.get('/health', (_request: Request, response: Response) => {
  response.status(200).json({
    message: 'Expenses tracker backend is running.'
  });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
