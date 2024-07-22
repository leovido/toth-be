// IMPORTANT: Make sure to import `instrument.js` at the top of your file.
// If you're using ECMAScript Modules (ESM) syntax, use `import "./instrument.js";`
require('../instrument.js');

// All other imports below
// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from '@sentry/node';

// ts-ignore
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
// ts-ignore
import express, { Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';

import { healthCheckRouter } from './api/healthCheck/healthCheckRouter';
import { userRouter } from './api/user/userRouter';
import { helperRouter } from '@/api/helpers/helpersRoute';
import { cannonCronJob } from './cannon';
import { setupCronJobs } from './cronjobs';
import { openAPIRouter } from './api-docs/openAPIRouter';
import pino from 'pino';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const logger = pino({ name: 'server start' });

app.use(bodyParser.json());

// Routes
// app.use('/health-check', healthCheckRouter);
// app.use('/users', userRouter);
// app.use('/signers', signersRoutes);
// app.use('/round', roundRoutes);
// app.use('/votes', votesRoutes);
// app.use('/nominations', nominationsRoutes);
// app.use('/history', historyRoutes);
app.use('/helpers', helperRouter);

// Swagger UI
app.use(openAPIRouter);

// MongoDB connection
mongoose.connect(process.env.DB_INSTANCE ?? '').then(async () => {
  try {
    await setupCronJobs();
    await cannonCronJob();
  } catch (error) {
    Sentry.captureException(error);
  }
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected successfully to MongoDB');
});

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

// Optional fallthrough error handler
app.use(function onError(err: unknown, res: Response) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(`${err}\n`);
});

export { app, logger };
