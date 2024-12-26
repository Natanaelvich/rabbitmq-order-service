import express from 'express';
import 'express-async-errors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Order Service is running!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 