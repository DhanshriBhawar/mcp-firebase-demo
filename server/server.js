import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Server Running Successfully' });
});

app.use('/api', notificationRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
