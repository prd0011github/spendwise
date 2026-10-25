const dns = require("dns");

dns.setServers(["1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const healthRoutes = require("./routes/healthRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const budgetRoutes = require("./routes/budgetRoute");
const authRoutes = require("./routes/authRoutes");
const connectDatabase = require("./config/database");
const subscriptionRoutes = require("./routes/subscriptionRoutes");

const app = express();

app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

app.get("/.well-known/assetlinks.json", (req, res) => {
  res.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.pradeepsingh.spendwise",
        sha256_cert_fingerprints: [
          "14:7A:4E:85:34:53:3A:79:95:CA:2E:DB:E4:CA:1D:D6:0C:AE:80:82:12:A9:84:91:90:0D:9F:46:D5:E8:D7:A1",
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
