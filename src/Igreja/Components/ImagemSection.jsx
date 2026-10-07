/* eslint-disable react/prop-types */
import { Box, Button, TextField, Typography } from "@mui/material";
import SectionCard from "./SectionCard";

/**
 * Upload/colagem/URL de imagem da igreja. Os dados (base64, mime, nome) e as
 * conversões ficam na página; aqui só a apresentação e os handlers de entrada.
 */
const ImagemSection = ({
  base64,
  fileName,
  imagemMimeType,
  imagemUrl,
  urlInput,
  setUrlInput,
  onFileChange,
  blobToBase64,
  onError,
  onRemove,
}) => {
  const handlePaste = async (e) => {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.kind === "file" && item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) {
          try {
            await blobToBase64(blob, blob.name || "pasted-image.png");
          } catch {
            onError("Erro ao processar imagem colada.");
          }
          e.preventDefault();
          return;
        }
      }

      // Alguns navegadores fornecem a imagem como HTML via clipboard
      if (item.kind === "string" && item.type === "text/html") {
        item.getAsString(async (html) => {
          const srcMatch = html.match(/src="([^"]+)"/i);
          if (srcMatch && srcMatch[1]) {
            try {
              const resp = await fetch(srcMatch[1]);
              const blob = await resp.blob();
              await blobToBase64(blob, "pasted-from-html.png");
            } catch {
              onError("Erro ao processar imagem colada do HTML.");
            }
          }
        });
      }
    }
  };

  const handleConverterUrl = async () => {
    if (!urlInput) return;
    try {
      const resp = await fetch(urlInput);
      if (!resp.ok) throw new Error("Falha ao buscar a imagem");
      const blob = await resp.blob();
      await blobToBase64(blob, urlInput);
    } catch {
      onError("Não foi possível converter a URL.");
    }
  };

  const previewSrc = base64 ? `data:${imagemMimeType};base64,${base64}` : imagemUrl;

  return (
    <SectionCard title="Imagem" subtitle="Faça upload, cole uma imagem ou converta por URL.">
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="flex-start">
          <Button variant="outlined" component="label" sx={{ whiteSpace: "nowrap" }}>
            Selecionar imagem
            <input type="file" hidden accept="image/*" onChange={onFileChange} />
          </Button>
          <TextField
            label="Cole uma imagem (Ctrl/Cmd+V)"
            placeholder="Cole aqui uma imagem"
            onPaste={handlePaste}
            sx={{ flex: 1, minWidth: 240 }}
          />
        </Box>

        <Box display="flex" gap={1.5} alignItems="center">
          <TextField
            label="Converter a partir de URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Cole a URL da imagem aqui"
            fullWidth
          />
          <Button variant="outlined" onClick={handleConverterUrl} sx={{ whiteSpace: "nowrap" }}>
            Converter
          </Button>
        </Box>

        {fileName && <Typography variant="body2">Arquivo selecionado: {fileName}</Typography>}

        <TextField
          label="Base64 da imagem"
          value={base64}
          multiline
          rows={3}
          slotProps={{ input: { readOnly: true } }}
          fullWidth
          disabled
        />

        {previewSrc && (
          <Box display="flex" flexDirection="column" gap={1} alignItems="center">
            <Box
              component="img"
              src={previewSrc}
              alt="Pré-visualização da imagem da igreja"
              sx={{
                maxWidth: "100%",
                maxHeight: 200,
                objectFit: "contain",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            />
            {onRemove && (
              <Button variant="outlined" color="error" onClick={onRemove}>
                Remover imagem
              </Button>
            )}
          </Box>
        )}
      </Box>
    </SectionCard>
  );
};

export default ImagemSection;
