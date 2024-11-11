require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import v1Router from 'src/routers/v1';

const PORT = process.env.PORT || 9999;
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use('/api/v1', v1Router);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
