export default function useChat(setRooms: (rooms: any[]) => void) {
  return async (userId: string) => {
    try {
      // Llamada al backend con la petición
      const res = await fetch(`http://localhost:4000/api/getRooms?userId=${userId}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.rooms)) {
        // Se setean las salas del usuario en función de los datos devueltos del backend
        setRooms(data.rooms);
      } else {
        // Se setean en vacío las salas del usuario debido a un error del backend
        setRooms([]);
        console.warn("Respuesta inesperada del servidor:", data);
      }
    } catch (error) {
      console.error("Error al obtener salas:", error);
      // Se setean en vacío las salas del usuario debido a un error del backend
      setRooms([]);
    }
  };
}
