import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import fileRoutes from "./routes/fileRoutes.js";
import { PORT } from "./config/config.js";
import { keycloak } from "./middleware/keycloak.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(keycloak.middleware())

app.use("/api", fileRoutes);

app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});
