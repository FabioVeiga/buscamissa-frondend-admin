import { useState } from "react";

/**
 * Estado e conversões da imagem da igreja (upload, colagem e URL → base64).
 * `imagemAlterada` indica se o usuário mexeu na imagem (só enviada ao backend quando verdadeiro).
 */
export default function useImagemIgreja() {
  const [base64, setBase64] = useState("");
  const [fileName, setFileName] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [imagemAlterada, setImagemAlterada] = useState(false);
  const [imagemMimeType, setImagemMimeType] = useState("image/png");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      // Remove o cabeçalho 'data:image/jpeg;base64,'
      setBase64(e.target.result.split(",")[1]);
      setFileName(file.name);
      setImagemMimeType(file.type || "image/png");
      setImagemAlterada(true);
    };
    reader.readAsDataURL(file);
  };

  const blobToBase64 = (blob, name) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const base64String = e.target.result.split(",")[1];
          setBase64(base64String);
          setFileName(name || "image");
          setImagemMimeType(blob.type || "image/png");
          setImagemAlterada(true);
          resolve(base64String);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(blob);
    });

  /** Volta ao estado inicial (ao carregar outra igreja). */
  const limparImagem = () => {
    setBase64("");
    setFileName("");
    setUrlInput("");
    setImagemAlterada(false);
  };

  /** Remove a imagem atual: marca como alterada para o backend apagar. */
  const removerImagem = () => {
    setBase64("");
    setFileName("");
    setUrlInput("");
    setImagemMimeType("image/png");
    setImagemAlterada(true);
  };

  return {
    base64,
    fileName,
    urlInput,
    setUrlInput,
    imagemAlterada,
    imagemMimeType,
    handleFileChange,
    blobToBase64,
    limparImagem,
    removerImagem,
  };
}
