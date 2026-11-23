const mongoose = require("mongoose");

const googleRtdnEventSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["processing", "completed"],
      default: "processing",
      required: true,
    },
    lockToken: {
      type: String,
      default: null,
    },
    leaseUntil: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

googleRtdnEventSchema.index(
  { completedAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: {
      status: "completed",
      completedAt: { $type: "date" },
    },
    name: "google_rtdn_completed_events_ttl",
  },
);

module.exports = mongoose.model("GoogleRtdnEvent", googleRtdnEventSchema);
