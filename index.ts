import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { fetchAvailableEventsList, addAvailableEvent, cleanEvents } from "./fetch-functions";
import bodyParser from "body-parser";
import express from 'express';
import { env } from 'process';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
const port = 3002;

console.log(env.ACCESS_KEY_ID, env.SECRET_ACCESS_KEY);

const config: S3ClientConfig = {
  region: "eu-north-1",
  credentials: {
    accessKeyId: env.ACCESS_KEY_ID as string,
    secretAccessKey: env.SECRET_ACCESS_KEY as string
  }
}

const awsClient = new S3Client(config);

app.get('/', (req: any, res: any) => {
  res.send({ message: 'Welcome to available events API for NFTickets!' });
})

app.get('/events', async (req: any, res: any) => {
  const events = await fetchAvailableEventsList(awsClient);
  res.send({events: events});
});

app.get('/clean', async (req: any, res: any) => {
  await cleanEvents(awsClient);
  res.send({message: 'Successfuly cleaned the bucket'});
});

app.get('/event', async (req: any, res: any) => {
  const events = await fetchAvailableEventsList(awsClient);
  res.send({exists: req.body.publicKey in events});
});

app.put('/event', async (req: any, res: any) => {
  const events = await fetchAvailableEventsList(awsClient);

  if (req.body.publicKey in events.eventPublicKeys) {
    res.send({message: `Event with public key ${req.body.publicKey} already exists`});
    return;
  }

  await addAvailableEvent(awsClient, req.body.publicKey);
  res.send({message: `Event with public key ${req.body.publicKey} is successfuly added`});
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});