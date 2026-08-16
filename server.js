const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Database simulation
let glamStats = {
  totalInteractions: 0,
  smiles: 0,
  kisses: 0,
  taps: 0,
  recentLog: [],
};

// Endpoint for Lens Studio
app.post("/api/glam-data", (req, res) => {
  const { action } = req.body;

  glamStats.totalInteractions++;
  if (action === "Smile") glamStats.smiles++;
  if (action === "Kiss") glamStats.kisses++;
  if (action === "Screen Tap") glamStats.taps++;

  const logEntry = { action, time: new Date().toLocaleTimeString() };
  glamStats.recentLog.unshift(logEntry);
  if (glamStats.recentLog.length > 15) glamStats.recentLog.pop();

  // Broadcast to React
  io.emit("dashboardUpdate", glamStats);
  res.status(200).json({ success: true });
});

io.on("connection", (socket) => {
  socket.emit("dashboardUpdate", glamStats); // Send current stats on load
});

server.listen(3001, () => console.log("Glam API running on port 3001"));
