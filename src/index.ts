require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import router from './routers';

const PORT = process.env.PORT || 9999;
const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use('/api', router);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
