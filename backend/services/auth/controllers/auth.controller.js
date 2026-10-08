import { randomUUID } from "crypto";
import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import User from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";

export const login = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const decoded = await getAuth(app).verifyIdToken(token);

    let user = await User.findOne({
      firebaseUid: decoded.uid,
    });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.picture,
      });
    }

    const sessionId = randomUUID();

    await redis.set(
      `user-session-${user?._id}`,

      sessionId,

      "EX",
      7 * 24 * 60 * 60,
    );

    await redis.set(
      `session-${sessionId}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpiresAt: user.planExpiresAt,
      }),
      "EX",
      7 * 24 * 60 * 60,
    );

    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error("login error", error);
    return res
      .status(500)
      .json({ message: `login error ${error.message || error}` });
  }
};

export const logOut = async (req, res) => {
  try {
    const sessionId = req.cookies?.session;

    await redis.del("session-${sessionId}");

    res.clearCookie("session");

    return res.status(200).json({ message: "logout successfully" });
  } catch (error) {
    return res.status(400).json({ message: `logout error ${error}` });
  }
};

export const updateUserPayment = async (req, res) => {
  try {
    const { plan, credits, userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }

    user.plan = plan;
    user.credits += credits;
    user.totalCredits += credits;
    user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await user.save();

    const sessionKey = `user-session-${user?._id}`;
    const sessionId = (await redis.get(sessionKey)) || randomUUID();

    await redis.set(sessionKey, sessionId, "EX", 7 * 24 * 60 * 60);

    await redis.set(
      `session-${sessionId}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpiresAt: user.planExpiresAt,
      }),
      "EX",
      7 * 24 * 60 * 60,
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `update user payment error  : ${error}` });
  }
};

export const deductCredits = async (req, res) => {
  try {
    const { userId, agent } = req.body;
    const COST = {
      chat: 1,
      search: 5,
      coding: 10,
      pdf: 15,
      ppt: 15,
      image: 10,
    };

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const requiredCredit = COST[agent] || 1;
    if (user.credits < requiredCredit) {
      return res.status(400).json({ message: "Not enough credits" });
    }

    user.credits -= requiredCredit;
    await user.save();

    const sessionKey = `user-session-${user?._id}`;
    const sessionId = (await redis.get(sessionKey)) || randomUUID();

    await redis.set(sessionKey, sessionId, "EX", 7 * 24 * 60 * 60);

    await redis.set(
      `session-${sessionId}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpiresAt: user.planExpiresAt,
      }),
      "EX",
      7 * 24 * 60 * 60,
    );

    return res.status(200).json({ success: true, credits: user.credits });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `deduct credit user payment error  : ${error}` });
  }
};
