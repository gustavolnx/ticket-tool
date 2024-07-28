import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../services/firebaseConnection";
import "./solutionmodal.css";
import { toast } from "react-toastify";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const SolutionModal = ({ ticketId, onClose, updateSolution }) => {
  const [selectedSolution, setSelectedSolution] = useState("Não solucionado");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "image/jpeg" || file.type === "image/png") {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        alert("Envie uma imagem do tipo PNG ou JPEG");
        setImageFile(null);
        setImagePreview(null);
      }
    }
  };

  const handleSaveSolution = async () => {
    try {
      const ticketRef = doc(db, "chamados", ticketId);

      if (imageFile) {
        const imageRef = ref(
          storage,
          `images/tickets/${ticketId}/${imageFile.name}`
        );
        await uploadBytes(imageRef, imageFile);
        const imageUrl = await getDownloadURL(imageRef);

        await updateDoc(ticketRef, {
          solucaoChamado: selectedSolution,
          dataSolucao:
            selectedSolution !== "Não solucionado" ? new Date() : null,
          status:
            selectedSolution !== "Não solucionado" ? "Atendido" : "Aberto",
          imagemSolucao: imageUrl,
        });
      } else {
        await updateDoc(ticketRef, {
          solucaoChamado: selectedSolution,
          dataSolucao:
            selectedSolution !== "Não solucionado" ? new Date() : null,
          status:
            selectedSolution !== "Não solucionado" ? "Atendido" : "Aberto",
        });
      }

      updateSolution(ticketId, selectedSolution, "Atendido");
      toast.success("Chamado atualizado com sucesso");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Erro ao salvar solução:", error);
      toast.error("Erro ao atualizar chamado");
    }
  };

  return (
    <div className="solution-modal">
      <div className="solution-modal-content">
        <h2>Alterar Solução</h2>
        <select
          value={selectedSolution}
          onChange={(e) => setSelectedSolution(e.target.value)}
        >
          <option value="Não solucionado">Não solucionado</option>
          <option value="Troca do aparelho">Troca do aparelho</option>
          <option value="Reiniciar aparelho">Reiniciar rede/aparelho</option>
          <option value="Outros">Outros</option>
        </select>

        <label className="label-avatar">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Pré-visualização da imagem"
              width="100"
              height="100"
            />
          )}
        </label>

        <button onClick={handleSaveSolution}>OK</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};

export default SolutionModal;
