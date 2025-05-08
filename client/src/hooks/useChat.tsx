export default function useChat(setRooms: (rooms: any[]) => void) {
  return async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/getRooms?userId=${userId}`);
      const data = await res.json();
      console.log("Respuesta de salas:", data);

      if (data.success && Array.isArray(data.rooms)) {
        setRooms(data.rooms);
      } else {
        setRooms([]);
        console.warn("Respuesta inesperada del servidor:", data);
      }
    } catch (error) {
      console.error("Error al obtener salas:", error);
      setRooms([]);
    }
  };
}
