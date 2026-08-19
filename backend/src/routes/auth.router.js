const express = require("express");
const authrouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const tokenBlacklistModal = require("../models/blacklist.model");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

function toUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
}

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 60 * 60 * 1000,
  });
}

authrouter.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const displayName = String(name || username || "").trim();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!displayName || !normalizedEmail || typeof password !== "string") {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: displayName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    setAuthCookie(res, token);

    res.status(201).json({
      message: "User registered successfully",
      user: toUserResponse(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

authrouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || typeof password !== "string") {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    setAuthCookie(res, token);

    res.json({
      message: "Login successful",
      user: toUserResponse(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const isBlacklisted = await tokenBlacklistModal.findOne({ token });
    if (isBlacklisted) {
      return res
        .status(401)
        .json({ message: "Token has been logged out, please login again" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

authrouter.post("/logout", async (req, res) => {
  try {
    const token = req.cookies.token;

    if (token) {
      await tokenBlacklistModal.create({ token });
    }

    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

authrouter.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: toUserResponse(user) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = { authrouter, authMiddleware };
