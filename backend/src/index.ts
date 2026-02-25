import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRouter from './routes/analyze';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use('/analyze', analyzeRouter);

app.get('/', (req, res) => {
  res.json({
    message: "Fish Pish Backend is Running",
    endpoints: {
      health: "/health",
      analyze: "POST /analyze"
    },
    version: "1.0.0"
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Fish Pish Backend' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
