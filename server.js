const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
let interval = null;
let bpm = 120;

app.use(express.static("public"));

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

function startMetronome() {
  const beatInterval = (60 / bpm) * 1000;
  broadcast({ type: "start", bpm });

  interval = setInterval(() => {
    broadcast({ type: "tick", timestamp: Date.now() });
  }, beatInterval);
}

function stopMetronome() {
  clearInterval(interval);
  interval = null;
  broadcast({ type: "stop" });
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.send(JSON.stringify({ type: interval ? "start" : "stop", bpm }));

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "start") {
      bpm = data.bpm || 120;
      if (!interval) startMetronome();
    } else if (data.type === "stop") {
      stopMetronome();
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
