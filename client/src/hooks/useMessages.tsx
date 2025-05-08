import { useState } from "react";
import axios from "axios";

export default function useMessages() {
  const [messages, setMessages] = useState<any[]>([]);

  async function loadMessages(salaId: string) {
    try {
      const response = await axios.get(`http://localhost:4000/api/messages?salaId=${salaId}`);
      console.log("Respuesta del backend:", response.data);

      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
    }
  }

  return { messages, loadMessages };
}
