import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import router from "./routes/chat.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5002;

app.use(express.json());
app.use("/", router);

app.get("/", (req, res) => {
  res.json({ message: "chat service is running" });
});

app.listen(port, () => {
  console.log(`chat server started at ${port}`);
  connectDB();
});
