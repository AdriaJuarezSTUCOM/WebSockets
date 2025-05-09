export default function useDocument(setRoomDocuments: (roomDocuments: any[]) => void) {
  return async (roomId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/getRoomDocuments?roomId=${roomId}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.roomDocuments)) {
        setRoomDocuments(data.roomDocuments);
      } else {
        setRoomDocuments([]);
        console.warn("Respuesta inesperada del servidor:", data);
      }
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
      setRoomDocuments([]);
    }
  };
}
