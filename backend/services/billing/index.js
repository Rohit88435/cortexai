import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import router from "./routes/billing.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());

app.use("/", router);

app.get("/", (req, res) => {
  res.json("billing service is running");
});

app.listen(port, () => {
  console.log(`authentication started at ${port}`);
  connectDB();
});
