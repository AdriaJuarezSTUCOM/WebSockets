const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const salas = require("./private/data.json").salas;
const usuarios = require("./private/data.json").usuarios;

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Cliente conectado");
  ws.on("close", () => {
    console.log("Cliente desconectado");
  });
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { email } = req.body;
  const usuario = usuarios.find((u) => u.email === email);

  if (usuario) {
    res.json({ success: true, userId: usuario.id });
  } else {
    res.status(401).json({ success: false, error: "Usuario no encontrado" });
  }
});

// ENVIAR MENSAJE
app.post("/api/message", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Mensaje vacío" });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  res.json({ sent: true });
});

app.get("/api/getRooms", (req, res) => {
  console.log("REQ", req)
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ success: false, error: "Falta userId" });
  }

  // Buscar salas donde el usuario participa
  const salasUsuario = salas.filter((sala) =>
    sala.participantes.includes(userId)
  ).map((sala) => ({
    id: sala.id,
    name: sala.nombre
  }));

  if (salasUsuario.length === 0) {
    return res.status(404).json({ success: false, error: "No se encontraron salas para este usuario" });
  }

  res.json({ success: true, rooms: salasUsuario });
});


server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
