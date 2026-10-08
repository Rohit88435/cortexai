import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getCurrentUser } from "./controller/user.controller.js";
import protect from "./middleware/auth.middleware.js";
import { proxyWithHeader } from "./utils/proxyWithHeader.js";
import morgan from "morgan";

dotenv.config();
const port = process.env.PORT || 5000;

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    credentials: true,
  }),
);

app.use(morgan("dev"));

app.use(cookieParser());
app.use("/api/auth", proxy(process.env.AUTH_SERVICES));
app.use("/api/chat", protect, proxyWithHeader(process.env.CHAT_SERVICES));
app.use("/api/agent", protect, proxyWithHeader(process.env.AGENT_SERVICES));
app.use("/api/billing", protect, proxyWithHeader(process.env.BILLING_SERVICES));
app.get("/api/me", protect, getCurrentUser);

app.get("/", (req, res) => {
  res.json({ message: "gateway is running" });
});

app.listen(port, () => {
  console.log(`gateway started at ${port}`);
});
