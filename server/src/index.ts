import mongoose from "mongoose";
import { config } from "./config.js";
import { app } from "./app.js";
import { initializeSports } from "./initialize-sports.js";
await mongoose.connect(config.MONGODB_URI);
await initializeSports();
const server = app.listen(config.PORT, () =>
  console.log(`MOA API listening on port ${config.PORT}`),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () =>
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    }),
  );
