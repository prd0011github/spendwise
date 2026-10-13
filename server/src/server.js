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
        package_name: "com.spendwise.app",
        sha256_cert_fingerprints: [
          "7A:B0:D8:EE:80:A1:D3:FC:D7:9F:D9:AB:C6:97:D0:E3:C7:37:2E:CE:13:36:80:F1:4B:D6:8C:BB:2F:80:E3:B9",
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
