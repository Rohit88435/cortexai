import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import router from "./route/agent.route.js";

const app = express();
const port = process.env.PORT || 5003;

app.use(express.json());
app.use("/", router);
app.use((err, req, res, next) => {
  console.log(err);

  if (err.status) {
    return res.status(err.status).json(err.data);
  }

  return res
    .status(500)
    .json({ message: `agent controller error ${err.message || err}` });
});

app.get("/", (req, res) => {
  res.json({ message: "agent service is running" });
});

app.listen(port, () => {
  console.log(`agent server started at ${port}`);
  connectDB();
});
