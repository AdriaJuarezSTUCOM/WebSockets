const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const data = require("./private/data.json");
const salas = data.salas;
const usuarios = data.usuarios;
const mensajes = data.mensajes;

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
  const { contenido, salaId, emisorId } = req.body;

  if (!contenido || !salaId || !emisorId) {
    return res.status(400).json({ error: "Faltan datos del mensaje" });
  }

  const nuevoMensaje = {
    id: `m${mensajes.length + 1}`,
    salaId,
    emisorId,
    contenido,
    timestamp: new Date().toISOString(),
  };

  mensajes.push(nuevoMensaje);

  // Emitir a todos los clientes
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(nuevoMensaje));
    }
  });

  res.json({ sent: true });
});

// OBTENER SALAS
app.get("/api/getRooms", (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ success: false, error: "Falta userId" });

  const salasUsuario = salas
    .filter((sala) => sala.participantes.includes(userId))
    .map((sala) => ({
      id: sala.id,
      name: sala.nombre,
    }));

  res.json({ success: true, rooms: salasUsuario });
});

app.post("/api/message", (req, res) => {
  const { contenido, salaId, emisorId } = req.body;

  if (!contenido || !salaId || !emisorId) {
    return res.status(400).json({ error: "Faltan datos del mensaje" });
  }

  // Broadcast a todos los clientes conectados
  const message = {
    contenido,
    salaId,
    emisorId,
    timestamp: new Date().toISOString(),
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });

  res.json({ sent: true });
});


// INICIAR SERVIDOR
server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
