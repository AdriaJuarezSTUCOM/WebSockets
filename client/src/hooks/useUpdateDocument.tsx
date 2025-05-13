import { documentProps } from "../Components/Document";

export default function useUpdateDocument() {
  return async (document : documentProps, content : string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/updateDocument`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: document.id,              // id del documento
          contenido: content,           // nuevo contenido
          lastModified: new Date().toISOString(),  // fecha de modificación
        }),
      });

      const data = await res.json();

      console.log("LLEGA DESDE EL BACK", data)

      return data.success;
    } catch (error) {
      console.error("Error al guardar documento:", error);
      return false;
    }
  };
}
