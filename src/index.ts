import express, { Request, Response } from 'express';
import cors from 'cors';

import { DefaultCalDavClient } from './fetcher.js';

const app = express();

const corsMiddleware = cors({ origin: 'http://localhost:3000', optionsSuccessStatus: 200 });
app.use(corsMiddleware);

const caldavClient = new DefaultCalDavClient({ url: 'https://mail.uan.cz/SOGo/dav/balon/Calendar/personal/', username: 'balon', password: 'Sk89cp' });

app.get('/getEvents', async (_req: Request, res: Response) => {
  try {
    const events = await caldavClient.getEvents();
    res.json(events);
  } catch (e) {
    res.json(e.message);
  }
})

app.get('/getEventsBetween', async (req: Request, res: Response) => {
  console.log(req.query);
  try {
    const events = await caldavClient.getEvents();
    res.json(events);
  } catch (e) {
    res.json(e.message);
  }
})

app.listen(4000, 'localhost', () => {
  console.log('Proxy CORS web server listening on port 4000');
})