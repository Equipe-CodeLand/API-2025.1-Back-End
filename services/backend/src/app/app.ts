import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    return res.send('Backend API is running');
});

app.listen(3000, () => console.log('Server running on port 3000'));
