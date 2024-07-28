// IMPORTANT: Make sure to import `instrument.js` at the top of your file.
// If you're using ECMAScript Modules (ESM) syntax, use `import "./instrument.js";`
require("../instrument.js");

// All other imports below
// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node";

// ts-ignore
import bodyParser from "body-parser";
import dotenv from "dotenv";
// ts-ignore
import express, { Response } from "express";
import mongoose from "mongoose";
import path from "path";

import { cannonCronJob } from "./cannon";
import { setupCronJobs } from "./cronjobs";
import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { nominationsRouter } from "./api/nominations/nominationsRouter";
import { helpersRouter } from "@/api/helpers/helpersRouter";
import { roundsRouter } from "./api/rounds/roundsRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";

import pino from "pino";
import { historyRouter } from "./api/history/historyRoute";
import { signersRouter } from "./api/signers/signersRoute";
import { votesRouter } from "./api/votes/votesRouter";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const logger = pino({ name: "server start" });

app.use(bodyParser.json());

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/signers", signersRouter);
app.use("/history", historyRouter);
app.use("/round", roundsRouter);
app.use("/votes", votesRouter);
app.use("/nominations", nominationsRouter);
// app.use('/history', historyRoutes);
app.use("/helpers", helpersRouter);

// Swagger UI
app.use(openAPIRouter);

// MongoDB connection
mongoose.connect(process.env.DB_INSTANCE ?? "").then(async () => {
  if (process.env.NODE_ENV === "staging") {
    return;
  }
  try {
    await setupCronJobs();
    await cannonCronJob();
  } catch (error) {
    Sentry.captureException(error);
  }
});

const db = mongoose.connection;
db.on("error", logger.error.bind(console, "connection error:"));
db.once("open", function () {
  logger.info("Connected successfully to MongoDB");
});

Sentry.setupExpressErrorHandler(app);

// Optional fallthrough error handler
app.use(function onError(err: unknown, res: Response) {
  res.statusCode = 500;
  res.end(`${err}\n`);
});

export { app, logger };
