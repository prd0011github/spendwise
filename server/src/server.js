const dns = require("dns");

dns.setServers(["1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const healthRoutes = require("./routes/healthRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const budgetRoutes = require("./routes/budgetRoute");
const authRoutes = require("./routes/authRoutes");
const connectDatabase = require("./config/database");

const app = express();

app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/auth", authRoutes);

app.get("/.well-known/assetlinks.json", (req, res) => {
  res.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.pradeepsingh.spendwise",
        sha256_cert_fingerprints: [
          "F1:2B:59:10:27:EB:82:50:8E:DE:E4:B1:F3:77:43:8E:57:87:B1:D2:91:64:8A:C4:DB:21:8F:99:45:9E:27:BA",
        ],
      },
    },
  ]);
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`SpendWise server running on port ${PORT}`);
  });
};

startServer();
