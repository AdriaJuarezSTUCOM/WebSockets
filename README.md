# Chat colaborativo con documentos en tiempo real

Este proyecto es una aplicación de chat colaborativo con soporte para documentos compartidos por sala. Está construida con un frontend en **React** y un backend en **Node.js** con soporte para **WebSocket** y API RESTful.

---

## Índice

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estructura relevante del proyecto](#estructura-relevante-del-proyecto)
- [Instalación](#instalación)
- [Funcionamiento](#funcionamiento)
  - [Login y autenticación](#login-y-autenticación)
  - [WebSocket](#websocket)
  - [Hooks personalizados](#hooks-personalizados)
  - [Documentos compartidos](#documentos-compartidos)
  - [Exportar chat](#exportar-chat)
- [Resolución de problemas](#resolución-de-problemas)
- [Autor](#autor)

---

## Características

- Login de usuarios.
- Carga dinámica de salas asociadas al usuario.
- Envío de mensajes en tiempo real con WebSocket.
- Soporte para múltiples salas de chat.
- Visualización y edición de documentos por sala.
- Sincronización automática de documentos actualizados desde el backend.
- Exportación de mensajes en formato `.json`.

---

## Tecnologías

- **Frontend**: React + TypeScript
- **Backend**: Node.js + WebSocket
- **Estilo**: CSS personalizado
- **Comunicación**: WebSocket para mensajes en tiempo real + REST para documentos
- **Hooks personalizados**: `useChat`, `useMessage`, `useDocument`, `useUpdateDocument`, `useUser`

---

## Estructura relevante del proyecto

```
/client
  ├── Public/
  ├── Routes/
  │     └── Rutas.tsx
  ├── src/
  │     ├── assets/
  │     ├── Components/
  │     │     ├── Document.css
  │     │     └── Document.tsx
  │     ├── hooks/
  │     │     ├── useChat.css
  │     │     ├── useMessage.css
  │     │     ├── useUpdateDocument.css
  │     │     ├── useUser.css
  │     │     └── useDocument.tsx
  │     ├── Views/
  │     │     ├── LoginPage.css
  │     │     └── LoginPage.tsx
  │     ├── App.css
  │     ├── App.tsx
  │     ├── Index.css
  │     └── Main.tsx
  └── Index.html

/server
  ├── private/
  │     └── data.json
  └── index.js
```

---

## Instalación

1. **Clonar el repositorio**:

```bash
git clone https://github.com/AdriaJuarezSTUCOM/WebSockets.git
```

2. **Instalar dependencias**:

- Frontend:

```bash
cd client
npm install
npm run dev
```

- Backend:

```bash
cd server
npm install
node index.js
```

3. **Ejecutar ambos servidores**:

- Frontend: corre en `http://localhost:5173`
- Backend + WebSocket: corre en `http://localhost:4000`

---

## Funcionamiento

### Login y autenticación

La aplicación cuenta con una vista de **Login**:

- Se accede a través de `/`.
- El formulario envía credenciales mediante `useUser` al backend.
- Al hacer login exitoso, el usuario es redirigido al componente principal `App.tsx` usando `react-router`.
- El usuario se carga mediante setter, y se usa para obtener las salas asociadas (`useChat`).

Ejemplo de navegación tras login:
```tsx
navigate("/app", { state: { user } });
```

El usuario autenticado se usa para:
- Filtrar mensajes por usuario y sala.
- Obtener las salas que le pertenecen.
- Asociar los mensajes y documentos creados a su `userId`.

---

### WebSocket

- Se conecta a `ws://localhost:4000`.
- Escucha nuevos mensajes entrantes y los agrega en tiempo real al chat si coinciden con la sala activa.
- Se usa `useRef` para mantener siempre la sala actual (`currentRoomRef`) sincronizada dentro del `onmessage`.

### Hooks personalizados

- `useChat(setRooms)` – Carga las salas del usuario.
- `useMessage(setRoomMessages)` – Carga los mensajes de una sala.
- `useDocument(setRoomDocuments)` – Carga los documentos asociados a una sala.
- `useUser(setUser)` – Hace login del usuario y carga sus datos asociados.
- `useUpdateDocument()` – Hook para guardar cambios en documentos.

### Documentos compartidos

Cada sala puede tener uno o más documentos. Estos documentos:

- Se cargan al seleccionar la sala.
- Se muestran como botones (título y fecha de última modificación).
- Se pueden abrir para ver y editar.
- Se actualizan en el backend mediante el hook `useUpdateDocument`.

### Exportar chat

Botón `Exportar chat` genera un archivo `.json` con todos los mensajes de la sala activa.

