import { useEffect, useState } from "react";
import useUpdateDocument from "../hooks/useUpdateDocument";
import "./Document.css";

// Se define el tipado de los props del componente
export type documentProps = {
  id: string;
  salaId: string;
  titulo: string;
  contenido: string;
  lastModified: Date;
  refreshDocuments: () => void;
};

export default function Document(document: documentProps) {
  // UseStates para guardar datos
  const [contenido, setContenido] = useState(document.contenido);

  const updateDocument = useUpdateDocument(); // Instancia de hook useUpdateDocument para actualizar documentos

  // Función para guardar el contenido del documento
  const handleSave = async () => {
    const result = await updateDocument(document, contenido);
    if (result) {
      document.refreshDocuments(); // Callback del componente anterior (App) para recargar el documento
    }
  };

  // Recarga el documento al acceder al componente por primera vez
  useEffect(()=>{
    document.refreshDocuments();
  },[])

  // Contenido que devuelve el componente
  return (
    <div className="document-container">
      <h1>{document.titulo}</h1>
      <textarea
        className="document-textarea"
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
      />
      <button onClick={handleSave}>Guardar</button>
    </div>
  );
}
