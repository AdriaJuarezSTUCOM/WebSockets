import { useEffect, useState } from "react";
import useUpdateDocument from "../hooks/useUpdateDocument";
import "./Document.css";

export type documentProps = {
  id: string;
  salaId: string;
  titulo: string;
  contenido: string;
  lastModified: Date;
  refreshDocuments: () => void;
};

export default function Document(document: documentProps) {
  const [contenido, setContenido] = useState(document.contenido);
  const updateDocument = useUpdateDocument();

  const handleSave = async () => {
    const result = await updateDocument(document, contenido);
    if (result) {
      document.refreshDocuments();
    }
  };

  useEffect(()=>{
    document.refreshDocuments();
  },[])

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
