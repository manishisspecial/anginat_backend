const WebSocket = require("ws");

class WebSocketManager {
  constructor() {
    this.clients = []; // Array to store active WebSocket clients
  }

  initialize(httpServer) {
    this.wss = new WebSocket.Server({ server: httpServer });

    this.wss.on("connection", (ws) => {
      console.log("New WebSocket connection");
      this.clients.push(ws);

      ws.on("message", (message) => {
        console.log(`Received: ${message}`);
      });

      ws.on("close", () => {
        this.clients = this.clients.filter((client) => client !== ws);
        console.log("WebSocket client disconnected");
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error.message);
      });
    });
  }

  broadcast(data) {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

module.exports = new WebSocketManager();
