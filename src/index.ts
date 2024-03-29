import express, { Request, Response } from 'express';
import cors from 'cors';
import moment from 'moment';

import { getEventByUid, getEvents, getEventsBetween, createUpdateEvent, deleteEvent } from './fetcher.js';

const app = express();

const corsMiddleware = cors({ origin: 'http://localhost:3000', optionsSuccessStatus: 200 });
app.use(corsMiddleware);
app.use(express.json());
app.use((req: Request, _res: Response, next: () => void) => {
  console.log('########################################################');
  console.log("INCOMMING", { timestamp: new Date(), url: req.originalUrl });
  next();
});

app.post('/getEvent', async (req: Request, res: Response) => {
  const { config, id } = req.body;
  if (!id) {
    res.status(500).json({ 'message': 'Query params "id" must be valid UID.' });
  }

  try {
    const event = await getEventByUid(config, id);
    res.status(200).json(event);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

app.post('/getNearestEvent', async (req: Request, res: Response) => {
  const { config } = req.body;
  try {
    const events = await getEvents(config);
    const now = moment();
    const event = events.filter(item => !moment(item.end).isBefore(now)).sort((a, b) => moment(a.start).diff(moment(b.start))).find(item => item);
    res.status(200).json(event);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

app.post('/getEvents', async (req: Request, res: Response) => {
  const { config } = req.body;
  try {
    const events = await getEvents(config);
    res.status(200).json(events);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

app.post('/getEventsBetween', async (req: Request, res: Response) => {
  const { config, start, end } = req.body;
  if (!start || !end) {
    res.status(500).json({ 'message': 'Query params "start", "end" must be valid dates.' });
  }

  try {
    const events = await getEventsBetween(config, start, end);
    res.status(200).json(events);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

app.post('/createUpdateEvent', async (req: Request, res: Response) => {
  const { config, event } = req.body;
  if (!event) {
    res.status(500).json({ 'message': 'Query params "event" must be valid Event.' });
  }

  try {
    await createUpdateEvent(config, event);
    res.status(200).send();
  } catch (e) {
    res.status(500).json(e.message);
  }
});

app.post('/deleteEvent', async (req: Request, res: Response) => {
  const { config, id } = req.body;
  if (!id) {
    res.status(500).json({ 'message': 'Query params "id" must be valid UID.' });
  }

  try {
    await deleteEvent(config, id as string);
    res.status(200).send();
  } catch (e) {
    res.status(500).json(e.message);
  }
});

app.listen(4000, 'localhost', () => {
  console.log('Proxy CORS web server listening on port 4000');
});