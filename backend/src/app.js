require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { authrouter } = require("./routes/auth.router");
const { interviewRouter } = require("./routes/interview.router");

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authrouter);
app.use("/api/interview", interviewRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app;
