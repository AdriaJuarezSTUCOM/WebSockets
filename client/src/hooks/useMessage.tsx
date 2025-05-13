export default function useMessage(setRoomMessages: (roomMessages: any[]) => void) {
  return async (roomId: string) => {
    try {
      // Llamada al backend con la petición
      const res = await fetch(`http://localhost:4000/api/getRoomMessages?roomId=${roomId}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.roomMessages)) {
        // Se setean los mensajes de la sala en función de la respuesta del backend
        setRoomMessages(data.roomMessages);
      } else {
        // Se setean como vacíos los mensajes de la sala debido a un error en el backend
        setRoomMessages([]);
        console.warn("Respuesta inesperada del servidor:", data);
      }
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
      // Se setean como vacíos los mensajes de la sala debido a un error en el backend
      setRoomMessages([]);
    }
  };
}
