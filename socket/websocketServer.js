const WebSocket = require("ws");

class WebSocketManager {
  constructor() {
    this.clients = []; // Array to store active WebSocket clients
  }

  initialize(httpServer) {
    this.wss = new WebSocket.Server({ server: httpServer });

    this.wss.on("connection", (ws) => {
      this.clients.push(ws);

      ws.on("close", () => {
        this.clients = this.clients.filter((client) => client !== ws);
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
