require("dotenv").config();

const express = require("express");
const healthRoutes = require("./routes/healthRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const authRoutes = require("./routes/authRoutes");
const connectDatabase = require("./config/database");

const app = express();

app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`SpendWise server running on port ${PORT}`);
  });
};

startServer();
