import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import "./solutionmodal.css";
import { toast } from "react-toastify";

const SolutionModal = ({ ticketId, onClose, updateSolution }) => {
  const [selectedSolution, setSelectedSolution] = useState("Não solucionado");

  const handleSaveSolution = async () => {
    try {
      const ticketRef = doc(db, "chamados", ticketId);

      await updateDoc(ticketRef, {
        solucaoChamado: selectedSolution,
        dataSolucao: selectedSolution !== "Não solucionado" ? new Date() : null,
        status: selectedSolution !== "Não solucionado" ? "Atendido" : "Aberto",
      });

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

        <button onClick={handleSaveSolution}>OK</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};

export default SolutionModal;
