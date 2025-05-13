// Dependencias
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

// Carga datos iniciales de JSON
const salas = require("./private/data.json").salas;
const usuarios = require("./private/data.json").usuarios;

// Inicialización de Express y puerto de escucha
const app = express();
const port = 4000;

app.use(cors()); // Permite solicitudes desde todos los orígenes
app.use(express.json()); // Habilita JSON en peticiones

// Servidor HTTP y WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Módulos del sistema de archivos
const fs = require("fs");
const path = require("path");

// Ruta del archivo del JSON
const dataPath = path.join(__dirname, "./private/data.json");

// Función para leer los datos del JSON
function readData() {
  const jsonData = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(jsonData);
}

// Función para escribir los datos al JSON
function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf-8");
}

// WebSocket: conexión cliente
wss.on("connection", (ws) => {
  console.log("Cliente conectado");
  ws.on("close", () => {
    console.log("Cliente desconectado");
  });
});

// Endpoint de login: hace login de usuario según mail y devuelve sus datos
app.post("/api/login", (req, res) => {
  const { email } = req.body;
  const usuario = usuarios.find((u) => u.email === email);

  if (usuario) {
    res.json({ success: true, userId: usuario.id, userName: usuario.nombre });
  } else {
    res.status(401).json({ success: false, error: "Usuario no encontrado" });
  }
});

// Endpoint para enviar un mensaje nuevo
app.post("/api/message", (req, res) => {
  const { message, roomId, userId } = req.body;

  // Validaciones principales
  if (!message) return res.status(400).json({ error: "Mensaje vacío" });
  if (!roomId) return res.status(400).json({ error: "No hay sala" });

  const data = readData(); // Leer datos actuales del JSON

  // Crear el objeto de mensaje en funcion a lo que llega
  const msgObj = {
    id: crypto.randomUUID(),
    salaId: roomId,
    emisorId: userId,
    contenido: message,
    timestamp: new Date().toISOString(),
  };

  // Añadir mensaje al JSON
  data.mensajes.push(msgObj);
  writeData(data);

  // Formato del objeto para enviar por WebSocket
  const formattedMessage = {
    id: msgObj.id,
    roomId: msgObj.salaId,
    userId: msgObj.emisorId,
    content: msgObj.contenido,
    timestamp: msgObj.timestamp,
  };

  // Enviar a todos los clientes conectados
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(formattedMessage));
    }
  });

  res.json({ sent: true });
});

// Endpoint para obtener las salas asociadas a un usuario
app.get("/api/getRooms", (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ success: false, error: "Falta userId" });
  }

  // Recupera las salas donde esté el usuario y sus datos
  const salasUsuario = salas
    .filter((sala) => sala.participantes.includes(userId))
    .map((sala) => ({
      id: sala.id,
      name: sala.nombre,
      type: sala.tipo,
      users: sala.participantes,
    }));

  if (salasUsuario.length === 0) {
    return res.status(404).json({ success: false, error: "No se encontraron salas para este usuario" });
  }

  res.json({ success: true, rooms: salasUsuario });
});

// Endpoint para obtener los mensajes de una sala
app.get("/api/getRoomMessages", (req, res) => {
  const roomId = req.query.roomId;
  const data = readData();

  if (!roomId) {
    return res.status(400).json({ success: false, error: "Falta roomId" });
  }

  // Buscar mensajes que correspondan al id de sala recibido
  const roomMessages = data.mensajes
    .filter((mensaje) => mensaje.salaId.includes(roomId))
    .map((mensaje) => ({
      id: mensaje.id,
      roomId: mensaje.salaId,
      userId: mensaje.emisorId,
      content: mensaje.contenido,
      timestamp: mensaje.timestamp,
    }));

  console.log("MENSAJES", roomMessages);

  if (roomMessages.length === 0) {
    return res.status(404).json({ success: false, error: "No se encontraron mensajes en esta sala" });
  }

  res.json({ success: true, roomMessages: roomMessages });
});

// Endpoint para obtener los documentos de una sala
app.get("/api/getRoomDocuments", (req, res) => {
  const roomId = req.query.roomId;
  const data = readData();

  if (!roomId) {
    return res.status(400).json({ success: false, error: "Falta roomId" });
  }

  // Buscar documentos vinculados al id de sala
  const roomDocuments = data.documentos
    .filter((documento) => documento.salaId.includes(roomId))
    .map((documento) => ({
      id: documento.id,
      roomId: documento.salaId,
      title: documento.titulo,
      content: documento.contenido,
      timestamp: documento.lastModified,
    }));

  if (roomDocuments.length === 0) {
    return res.status(404).json({ success: false, error: "No se encontraron documentos en esta sala" });
  }

  res.json({ success: true, roomDocuments: roomDocuments });
});

// Endpoint para actualizar el contenido de un documento
app.put("/api/updateDocument", (req, res) => {
  const { id, contenido, lastModified } = req.body;

  // Validaciones
  if (!id || !contenido || !lastModified) {
    return res.status(400).json({ success: false, error: "Datos incompletos" });
  }

  try {
    const data = JSON.parse(fs.readFileSync("./private/data.json", "utf-8"));

    const doc = data.documentos.find((d) => d.id === id);
    if (!doc) {
      return res.status(404).json({ success: false, error: "Documento no encontrado" });
    }

    // Actualizar campos del documento
    doc.contenido = contenido;
    doc.lastModified = lastModified;

    // Guardar cambios en el JSON
    fs.writeFileSync("./private/data.json", JSON.stringify(data, null, 2));
    console.log("Documento actualizado:", doc);

    res.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar documento:", error);
    res.status(500).json({ success: false, error: "Error interno" });
  }
});

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
