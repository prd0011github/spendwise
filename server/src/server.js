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
          "71:AC:D9:9C:C5:40:EF:78:A4:E0:6C:0E:69:07:41:91:61:72:3F:64:D6:1E:BD:58:45:4D:06:4E:6A:A2:BA:1E",
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
