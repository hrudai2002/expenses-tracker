import express from 'express';
import type { Request, Response } from 'express';

const app = express();

app.use(express.json());

app.get('/health', (_request: Request, response: Response) => {
  response.status(200).json({
    message: 'Expenses tracker backend is running.'
  });
});

export default app;

