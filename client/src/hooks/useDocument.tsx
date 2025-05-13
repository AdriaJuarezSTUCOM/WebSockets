export default function useDocument(setRoomDocuments: (roomDocuments: any[]) => void) {
  return async (roomId: string) => {
    try {
      // Llamada al backend con la petición
      const res = await fetch(`http://localhost:4000/api/getRoomDocuments?roomId=${roomId}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.roomDocuments)) {
        // Se setean los documentos de la sala con la respuesta del backend
        setRoomDocuments(data.roomDocuments);
      } else {
        // Se setean los documentos vacíos porque no ha devuelto nada el backend
        setRoomDocuments([]);
        console.warn("Respuesta inesperada del servidor:", data);
      }
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
      // Se setean los documentos vacíos porque no ha devuelto nada el backend
      setRoomDocuments([]);
    }
  };
}
