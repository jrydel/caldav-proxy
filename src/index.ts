import express, { Request, Response } from 'express';
import cors from 'cors';

import { DefaultCalDavClient } from './fetcher.js';

const app = express();

const corsMiddleware = cors({ origin: 'http://localhost:3000', optionsSuccessStatus: 200 });
app.use(corsMiddleware);

const caldavClient = new DefaultCalDavClient({ url: 'https://mail.uan.cz/SOGo/dav/jednacka3/Calendar/personal/', username: 'jednacka3', password: 'jednacka' });

app.get('/getEvent', async (req: Request, res: Response) => {
  const { id } = req.query;
  if (!id) {
    res.status(500).json({ 'message': 'Query params "id" must be valid UID.' });
  }

  try {
    const event = await caldavClient.getEventByUid(id as string);
    res.status(200).json(event);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

app.get('/getEvents', async (_req: Request, res: Response) => {
  try {
    const events = await caldavClient.getEvents();
    res.status(200).json(events);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

app.get('/getEventsBetween', async (req: Request, res: Response) => {
  const { start, end } = req.query;
  if (!start || !end) {
    res.status(500).json({ 'message': 'Query params "start", "end" must be valid dates.' });
  }

  try {
    const events = await caldavClient.getEvents();
    res.status(200).json(events);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

app.get('/deleteEvent', async (req: Request, res: Response) => {
  const { id } = req.query;
  if (!id) {
    res.status(500).json({ 'message': 'Query params "id" must be valid UID.' });
  }

  try {
    await caldavClient.deleteEvent(id as string);
    res.status(200).send();
  } catch (e) {
    res.status(500).json(e.message);
  }
});

app.listen(4000, 'localhost', () => {
  console.log('Proxy CORS web server listening on port 4000');
});