import Header from "../../components/Header";
import Title from "../../components/Title";
import { FiMessageSquare } from "react-icons/fi";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/auth";
import { db } from "../../services/firebaseConnection";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import './index.css';  // Importando o arquivo CSS

export default function Monitoramento ()  {
  const { user } = useContext(AuthContext);
  const [chamadosAbertos, setChamadosAbertos] = useState([]);
  const [chamadosResolvidosHoje, setChamadosResolvidosHoje] = useState([]);
  const [chamadosAbertosMais24h, setChamadosAbertosMais24h] = useState([]);

  useEffect(() => {
    async function loadChamados() {
      try {
        const chamadosCollection = collection(db, "chamados");

        // Chamados abertos
        const abertosQuery = query(chamadosCollection, where("status", "==", "Aberto"));
        const abertosSnapshot = await getDocs(abertosQuery);
        setChamadosAbertos(abertosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Chamados resolvidos hoje
        const atendidosQuery = query(chamadosCollection, where("status", "==", "Atendido"));
        const atendidosSnapshot = await getDocs(atendidosQuery);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Define o início do dia de hoje (meia-noite)
        
        // Filtra chamados resolvidos hoje
        const resolvidosHoje = atendidosSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(chamado => {
            // Verifica se há um item no histórico com field "status" e newValue "Atendido" com timestamp de hoje
            return chamado.history && chamado.history.some(entry => {
              return entry.field === "status" && entry.newValue === "Atendido" && entry.timestamp.toDate() >= hoje;
            });
          });
          
        setChamadosResolvidosHoje(resolvidosHoje);

        // Chamados abertos há mais de 24h
        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);
        ontem.setHours(0, 0, 0, 0);
        const abertosMais24h = abertosSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(chamado => chamado.created && chamado.created.toDate() <= ontem);
        setChamadosAbertosMais24h(abertosMais24h);
      } catch (error) {
        console.error("Erro ao carregar chamados:", error);
        toast.error("Erro ao carregar chamados.");
      }
    }

    loadChamados();
  }, []);

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Monitoramento">
          <FiMessageSquare size={25} />
        </Title>
        <div className="container dashboard">
          <div className="section">
            <h2>Chamados Abertos</h2>
            {chamadosAbertos.length === 0 ? (
              <p>Nenhum chamado aberto.</p>
            ) : (
              <ul>
                {chamadosAbertos.map(chamado => (
                  <li key={chamado.id}>
                    <strong>Cliente:</strong> {chamado.cliente} <br />
                    <strong>Assunto:</strong> {chamado.assunto} <br />
                    <strong>Prioridade:</strong> {chamado.prioridade} <br />
                    <strong>Técnico:</strong> {chamado.tecnicoAtb}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="section">
            <h2>Chamados Resolvidos Hoje</h2>
            {chamadosResolvidosHoje.length === 0 ? (
              <p>Nenhum chamado resolvido hoje.</p>
            ) : (
              <ul>
                {chamadosResolvidosHoje.map(chamado => (
                  <li key={chamado.id}>
                    <strong>Cliente:</strong> {chamado.cliente} <br />
                    <strong>Assunto:</strong> {chamado.assunto} <br />
                    <strong>Prioridade:</strong> {chamado.prioridade} <br />
                    <strong>Técnico:</strong> {chamado.tecnicoAtb}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="section">
            <h2>Chamados Abertos há mais de 24h</h2>
            {chamadosAbertosMais24h.length === 0 ? (
              <p>Nenhum chamado aberto há mais de 24h.</p>
            ) : (
              <ul>
                {chamadosAbertosMais24h.map(chamado => (
                  <li key={chamado.id}>
                    <strong>Cliente:</strong> {chamado.cliente} <br />
                    <strong>Assunto:</strong> {chamado.assunto} <br />
                    <strong>Prioridade:</strong> {chamado.prioridade} <br />
                    <strong>Técnico:</strong> {chamado.tecnicoAtb}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
