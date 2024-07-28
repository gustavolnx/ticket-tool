import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/auth";
import Header from "../../components/Header";
import "./atendidos.css";
import Title from "../../components/Title";
import {
  FiPlus,
  FiMessageSquare,
  FiSearch,
  FiEdit2,
  FiCrosshair,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  orderBy,
  limit,
  startAfter,
  query,
} from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import Modal from "../../components/Modal";
import { format } from "date-fns";
import SolutionModal from "../../components/SolutionModal";

const listRef = collection(db, "chamados");

export default function Atendidos() {
  const { logout, user } = useContext(AuthContext);

  const isAdmin = user ? user.isAdmin : false;
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [lastDocs, setLastDocs] = useState();
  const [loadingMore, setLoadingMore] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [detail, setDetail] = useState();
  const [sortBy, setSortBy] = useState("prioridade");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  useEffect(() => {
    async function loadChamados() {
      const q = query(listRef, orderBy("created", "desc"), limit(5));
      const querySnapshot = await getDocs(q);
      let lista = [];

      querySnapshot.forEach((doc) => {
        lista.push({
          id: doc.id,
          assunto: doc.data().assunto,
          prioridade: doc.data().prioridade,
          solucaoChamado: doc.data().solucaoChamado,
          cliente: doc.data().cliente,
          clienteId: doc.data().clienteId,
          created: doc.data().created,
          createdFormat: format(doc.data().created.toDate(), "dd/MM/yyyy"),
          status: doc.data().status,
          complemento: doc.data().complemento,
          dataSolucao: doc.data().dataSolucao,
          horaSolucao: doc.data().horaSolucao,
          tecnicoAtb: doc.data().tecnicoAtb,
          imagemSolucao: doc.data().imagemSolucao, // Adicionar este campo
          imageUrls: doc.data().imageUrls || [], // Adicionar este campo
        });
      });

      lista = lista.filter((chamado) => chamado.status == "Atendido");

      setChamados(sortTickets(lista)); // Atualizar estado com a lista filtrada
      setLastDocs(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setLoading(false);

      if (lista.length === 0) {
        // Verificar se a lista filtrada está vazia
        setIsEmpty(true);
      }
    }

    loadChamados();
  }, []);

  function sortTickets(tickets) {
    const priorityOrder = { Urgente: 3, Moderada: 2, Normal: 1 };

    return [...tickets].sort((a, b) => {
      const priorityA = priorityOrder[a.prioridade] || 0;
      const priorityB = priorityOrder[b.prioridade] || 0;

      return sortOrder === "asc"
        ? priorityA - priorityB
        : priorityB - priorityA;
    });
  }

  async function updateState(querySnapshot) {
    const isCollectionEmpty = querySnapshot.size === 0;

    if (!isCollectionEmpty) {
      let lista = [];

      querySnapshot.forEach((doc) => {
        lista.push({
          id: doc.id,
          assunto: doc.data().assunto,
          prioridade: doc.data().prioridade,
          solucaoChamado: doc.data().solucaoChamado,
          cliente: doc.data().cliente,
          clienteId: doc.data().clienteId,
          created: doc.data().created,
          createdFormat: format(doc.data().created.toDate(), "dd/MM/yyyy"),
          status: doc.data().status,
          complemento: doc.data().complemento,
          dataSolucao: doc.data().dataSolucao,
          horaSolucao: doc.data().horaSolucao,
          tecnicoAtb: doc.data().tecnicoAtb,
          imagemSolucao: doc.data().imagemSolucao, // Adicionar este campo
          imageUrls: doc.data().imageUrls || [], // Adicionar este campo
        });
      });

      lista = lista.filter((chamado) => chamado.status == "Atendido");

      if (lista.length === 0) {
        setIsEmpty(true);
      } else {
        setChamados((prevChamados) => sortTickets([...prevChamados, ...lista]));
        setLastDocs(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
    } else {
      setIsEmpty(true);
    }

    setLoadingMore(false);
  }

  const handleOpenSolutionModal = (ticketId) => {
    setSelectedTicketId(ticketId);
    setShowSolutionModal(true);
  };

  const updateSolution = (ticketId, newSolution) => {
    setChamados((prevChamados) =>
      prevChamados.map((chamado) => {
        if (chamado.id === ticketId) {
          return { ...chamado, solucaoChamado: newSolution };
        }
        return chamado;
      })
    );
  };

  async function handleMore() {
    setLoadingMore(true);
    const q = query(
      listRef,
      orderBy("created", "desc"),
      startAfter(lastDocs),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    await updateState(querySnapshot);
  }

  function toggleModal(item) {
    setShowPostModal(!showPostModal);
    setDetail(item);
  }

  function handleSort(column) {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder(column === "tecnicoAtb" ? "asc" : "desc"); // Ordem inicial para técnico é ascendente
    }

    if (column === "status") {
      setChamados((prevChamados) => sortTicketsByStatus([...prevChamados]));
    } else if (column === "tecnicoAtb") {
      setChamados((prevChamados) => sortTicketsByTecnico([...prevChamados])); // Nova função de ordenação
    } else {
      setChamados((prevChamados) => sortTickets([...prevChamados]));
    }
  }

  function sortTicketsByTecnico(tickets) {
    return [...tickets].sort((a, b) => {
      const tecnicoA = a.tecnicoAtb || ""; // Lidar com casos em que não há técnico atribuído
      const tecnicoB = b.tecnicoAtb || "";

      return sortOrder === "asc"
        ? tecnicoA.localeCompare(tecnicoB) // Ordenação alfabética ascendente
        : tecnicoB.localeCompare(tecnicoA); // Ordenação alfabética descendente
    });
  }

  function sortTicketsByStatus(tickets) {
    const statusOrder = { Atendido: 3, Progresso: 2, Aberto: 1 };

    return [...tickets].sort((a, b) => {
      const statusA = statusOrder[a.status] || 0;
      const statusB = statusOrder[b.status] || 0;

      return sortOrder === "asc" ? statusA - statusB : statusB - statusA;
    });
  }

  if (loading) {
    return (
      <div>
        <Header />
        <div className="content">
          <Title name="Tickets">
            <FiMessageSquare size={25} />
          </Title>
          <div className="container dashboard">
            <span>Buscando chamados...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Tickets">
          <FiMessageSquare size={25} />
        </Title>

        <>
          {chamados.length === 0 ? (
            <div className="container dashboard">
              <span>Nenhum chamado atendido está atribuído a você...</span>
            </div>
          ) : (
            <>
              <Link to="/new" className="new">
                <FiPlus color="#fff" size={25} />
                Novo chamado
              </Link>

              <table>
                <thead>
                  <tr>
                    <th scope="col">Cliente</th>
                    <th scope="col">Assunto</th>
                    <th scope="col" onClick={() => handleSort("status")}>
                      Status{" "}
                      {sortBy === "status" && (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th scope="col" onClick={() => handleSort("prioridade")}>
                      Prioridade{" "}
                      {sortBy === "prioridade" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th scope="col">Cadastrado em</th>
                    <th scope="col" onClick={() => handleSort("tecnicoAtb")}>
                      Técnico
                      {sortBy === "tecnicoAtb" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th scope="col">#</th>
                  </tr>
                </thead>
                <tbody>
                  {chamados.map((item, index) => (
                    <tr key={index}>
                      <td data-label="Cliente">{item.cliente}</td>
                      <td data-label="Assunto">{item.assunto}</td>
                      <td data-label="Status">
                        <span
                          className="badge"
                          style={{
                            backgroundColor:
                              item.status === "Aberto"
                                ? "rgb(53, 131, 246)"
                                : item.status === "Atendido"
                                ? "#5cb85c"
                                : "#ffcc00",
                            textShadow: "1px 2px 0px #000",
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td data-label="Prioridade">
                        <span
                          className="badge"
                          style={{
                            backgroundColor:
                              item.prioridade === "Urgente" ||
                              item.prioridade === "Critica"
                                ? "#ff0000"
                                : item.prioridade === "Média" ||
                                  item.prioridade === "Alta"
                                ? "#FFCC00"
                                : "#5cb85c",
                            textShadow: "1px 2px 0px #000",
                          }}
                        >
                          {item.prioridade}
                        </span>
                      </td>

                      <td data-label="Cadastrado">{item.createdFormat}</td>
                      <td data-label="Cadastrado">
                        {item.tecnicoAtb ? item.tecnicoAtb : "Não atribuído"}
                      </td>
                      <td data-label="#">
                        <button
                          className="action"
                          style={{ backgroundColor: "#3583f6" }}
                          onClick={() => toggleModal(item)}
                        >
                          <FiSearch color="#fff" size={17} />
                        </button>

                        {showSolutionModal && (
                          <SolutionModal
                            ticketId={selectedTicketId}
                            onClose={() => setShowSolutionModal(false)}
                            updateSolution={updateSolution}
                          />
                        )}

                        {isAdmin && (
                          <Link
                            to={`/new/${item.id}`}
                            className="action"
                            style={{ backgroundColor: "#f6a935" }}
                          >
                            <FiEdit2 color="#fff" size={17} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {loadingMore && <h3>Buscando mais chamados...</h3>}
              {!loadingMore && !isEmpty && (
                <button className="btn-more" onClick={handleMore}>
                  Buscar mais
                </button>
              )}
            </>
          )}
        </>
      </div>

      {showPostModal && (
        <Modal
          conteudo={detail}
          close={() => setShowPostModal(!showPostModal)}
        />
      )}
    </div>
  );
}
