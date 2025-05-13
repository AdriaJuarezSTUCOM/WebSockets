import { documentProps } from "../Components/Document";

export default function useUpdateDocument() {
  return async (document : documentProps, content : string) => {
    try {
      // Llamada al backend con la petición
      const res = await fetch(`http://localhost:4000/api/updateDocument`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: document.id,
          contenido: content,
          lastModified: new Date().toISOString(),
        }),
      });

      // Guardado y formateo de la respuesta
      const data = await res.json();

      return data.success;
    } catch (error) {
      return false;
    }
  };
}
