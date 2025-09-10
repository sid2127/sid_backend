// controllers/health.controller.js
import mongoose from "mongoose";

const healthCheck = (req, res) => {
  const dbState = mongoose.connection.readyState; 
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),     // how long server has been running
    timestamp: new Date(),
    database: dbState === 1 ? "Connected" : "Not Connected"
  });
};

export { healthCheck };
