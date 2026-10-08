import express from "express";
import {
  deductCredits,
  login,
  logOut,
  updateUserPayment,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.get("/logout", logOut);
router.post("/updatePlan", updateUserPayment);
router.post("/deductcredit", deductCredits);

export default router;
