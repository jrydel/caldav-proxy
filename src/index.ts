import express, { Request, Response } from 'express';
import cors from 'cors';

import { deleteEvent, getEventByUid, getEvents, getEventsBetween } from './fetcher.js';

const app = express();

const corsMiddleware = cors({ origin: 'http://localhost:3000', optionsSuccessStatus: 200 });
app.use(corsMiddleware);

app.get('/getEvent', async (req: Request, res: Response) => {
  const { url, auth, id } = req.query;
  if (!id) {
    res.status(500).json({ 'message': 'Query params "id" must be valid UID.' });
  }

  try {
    const event = await getEventByUid({ url: url as string, auth: auth as string }, id as string);
    res.status(200).json(event);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

app.get('/getEvents', async (req: Request, res: Response) => {
  const { url, auth } = req.query;
  try {
    const events = await getEvents({ url: url as string, auth: auth as string });
    res.status(200).json(events);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

app.get('/getEventsBetween', async (req: Request, res: Response) => {
  const { url, auth, start, end } = req.query;
  if (!start || !end) {
    res.status(500).json({ 'message': 'Query params "start", "end" must be valid dates.' });
  }

  try {
    const events = await getEventsBetween({ url: url as string, auth: auth as string }, new Date(start as string), new Date(end as string));
    res.status(200).json(events);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

app.get('/deleteEvent', async (req: Request, res: Response) => {
  const { url, auth, id } = req.query;
  if (!id) {
    res.status(500).json({ 'message': 'Query params "id" must be valid UID.' });
  }

  try {
    await deleteEvent({ url: url as string, auth: auth as string }, id as string);
    res.status(200).send();
  } catch (e) {
    res.status(500).json(e.message);
  }
});

app.listen(4000, 'localhost', () => {
  console.log('Proxy CORS web server listening on port 4000');
});