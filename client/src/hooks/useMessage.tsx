export default function useMessage(setRoomMessages: (roomMessages: any[]) => void) {
  return async (roomId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/getRoomMessages?roomId=${roomId}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.roomMessages)) {
        setRoomMessages(data.roomMessages);
      } else {
        setRoomMessages([]);
        console.warn("Respuesta inesperada del servidor:", data);
      }
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
      setRoomMessages([]);
    }
  };
}
