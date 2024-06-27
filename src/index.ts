// ts-ignore
import bodyParser from "body-parser";
import dotenv from "dotenv";
// ts-ignore
import express from "express";
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
mongoose.connect(process.env.DB_INSTANCE ?? "").then(() => {
  setupCronJobs();
  cannonCronJob();
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected successfully to MongoDB");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
