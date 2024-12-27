import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

export const app = express();

app.use(express.json());

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
  });
});

app.use(routes);
