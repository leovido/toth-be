import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";

import signersRoutes from "./routes/signers";
import nominationsRoutes from "./routes/nominations";
import votesRoutes from "./routes/votes";
import roundRoutes from "./routes/rounds";
import historyRoutes from "./routes/history";
import helperRoutes from "./routes/helpers";

import { setupCronJobs } from "./cronjobs";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

app.use(signersRoutes);
app.use(roundRoutes);
app.use(votesRoutes);
app.use(nominationsRoutes);
app.use(historyRoutes);
app.use(helperRoutes);

const port = process.env.PORT || 3011;

// Body parser middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.DB_INSTANCE ?? "").then(() => {
  setupCronJobs();
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected successfully to MongoDB");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
