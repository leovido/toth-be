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

import signersRoutes from "./routes/signersRoute";
import nominationsRoutes from "./routes/nominationsRoute";
import votesRoutes from "./routes/votesRoute";
import roundRoutes from "./routes/roundsRoute";
import historyRoutes from "./routes/historyRoute";
import helperRoutes from "./routes/helpersRoute";

import { setupCronJobs } from "./cronjobs";
import { cannonCronJob } from "./cannon";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

app.use(bodyParser.json());

app.use(signersRoutes);
app.use(roundRoutes);
app.use(votesRoutes);
app.use(nominationsRoutes);
app.use(historyRoutes);
app.use(helperRoutes);

const port = process.env.PORT || 3011;

// MongoDB connection
mongoose.connect(process.env.DB_INSTANCE ?? "").then(async () => {
  await setupCronJobs();
  await cannonCronJob();
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected successfully to MongoDB");
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
