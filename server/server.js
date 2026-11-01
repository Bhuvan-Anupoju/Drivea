import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { initDB } from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import folderRouter from "./routes/folderRoutes.js";
import fileRouter from "./routes/fileRoutes.js";
import trashRouter from "./routes/trashRoutes.js";
import shareRouter from "./routes/shareRoutes.js";

const app = express();

const allowedOrigins = (
  process.env.ORIGINS ||
  "https://drivea-uf4y-git-main-bhuvan9.vercel.app" ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "100mb" }));

app.get("/", (_req, res) => {
  res.send("Server is Running!!");
});

app.use("/api/auth", authRouter);
app.use("/api/folders", folderRouter);
app.use("/api/files", fileRouter);
app.use("/api/trash", trashRouter);
app.use("/api/shares", shareRouter);

app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({
    error: err.message || "Something went wrong!",
  });
});

const port = process.env.PORT || 3000;

initDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
  });
