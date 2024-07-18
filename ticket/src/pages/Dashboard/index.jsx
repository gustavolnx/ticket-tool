import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/auth";
import Header from "../../components/Header";
import "./dashboard.css";
import Title from "../../components/Title";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiMessageSquare,
  FiSearch,
  FiEdit2,
  FiCrosshair,
  FiUserPlus,
  FiUserCheck,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  orderBy,
  limit,
  startAfter,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import Modal from "../../components/Modal";
import { format } from "date-fns";
import SolutionModal from "../../components/SolutionModal";

const listRef = collection(db, "chamados");

export default function Dashboard() {
  const { logout, user } = useContext(AuthContext);
  const userName = user ? user.nome : null;
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
  const isAdmin = user ? user.isAdmin : false;
  const [statusOptions, setStatusOptions] = useState([]);
  const [prioridadeOptions, setPrioridadeOptions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilters, setStatusFilters] = useState({});
  const [prioridadeFilters, setPrioridadeFilters] = useState({});
  const [initialChamados, setInitialChamados] = useState([]);
  const [tempStatusFilters, setTempStatusFilters] = useState({});
  const [tempPrioridadeFilters, setTempPrioridadeFilters] = useState({});
  const [searchTecnico, setSearchTecnico] = useState("");
  const [searchPonto, setSearchPonto] = useState("");

  useEffect(() => {
    async function loadChamados() {
      const q = query(listRef, orderBy("created", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      let lista = [];
      let statusSet = new Set();
      let prioridadeSet = new Set();

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
        });

        statusSet.add(doc.data().status);
        prioridadeSet.add(doc.data().prioridade);
      });

      // inicializar filtros
      const initialStatusFilters = Array.from(statusSet).reduce(
        (acc, status) => {
          acc[status] = true;
          return acc;
        },
        {}
      );

      const initialPrioridadeFilters = Array.from(prioridadeSet).reduce(
        (acc, prioridade) => {
          acc[prioridade] = true;
          return acc;
        },
        {}
      );

      setStatusFilters(initialStatusFilters);
      setPrioridadeFilters(initialPrioridadeFilters);
      setTempStatusFilters(initialStatusFilters);
      setTempPrioridadeFilters(initialPrioridadeFilters);

      // primeira renderização da lista
      lista = lista.filter((chamado) => chamado.status !== "Atendido");

      setChamados(sortTickets(lista));
      setInitialChamados(sortTickets(lista));
      setLastDocs(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setLoading(false);
      setStatusOptions(Array.from(statusSet));
      setPrioridadeOptions(Array.from(prioridadeSet));

      if (lista.length === 0) {
        setIsEmpty(true);
      }
    }

    loadChamados();
  }, []);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  function sortTickets(tickets) {
    const priorityOrder = {
      Critica: 5,
      Urgente: 4,
      Alta: 3,
      Média: 2,
      Baixa: 1,
    };

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
        });
      });
      // segunda renderização da lista
      lista = lista.filter((chamado) => chamado.status !== "Atendido");

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
  const handleTempStatusChange = (status) => {
    setTempStatusFilters((prevFilters) => ({
      ...prevFilters,
      [status]: !prevFilters[status],
    }));
  };

  const handleTempPrioridadeChange = (prioridade) => {
    setTempPrioridadeFilters((prevFilters) => ({
      ...prevFilters,
      [prioridade]: !prevFilters[prioridade],
    }));
  };

  const applyFilters = () => {
    setStatusFilters(tempStatusFilters);
    setPrioridadeFilters(tempPrioridadeFilters);
    filterChamados(
      tempStatusFilters,
      tempPrioridadeFilters,
      searchTecnico,
      searchPonto
    );
  };

  const filterChamados = (statusFilters, prioridadeFilters, tecnico, ponto) => {
    const filteredChamados = initialChamados.filter(
      (chamado) =>
        statusFilters[chamado.status] &&
        prioridadeFilters[chamado.prioridade] &&
        (!tecnico ||
          chamado.tecnicoAtb.toLowerCase().includes(tecnico.toLowerCase())) &&
        (!ponto || chamado.cliente.toLowerCase().includes(ponto.toLowerCase()))
    );
    setChamados(filteredChamados);
  };

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
      limit(10)
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
    const statusOrder = { Aberto: 1, "Em andamento": 2, Atendido: 3 };

    return [...tickets].sort((a, b) => {
      const statusA = statusOrder[a.status] || 0;
      const statusB = statusOrder[b.status] || 0;

      return sortOrder === "asc" ? statusA - statusB : statusB - statusA;
    });
  }

  async function assignTicketToSelf(ticketId) {
    if (!userName) {
      toast.error("Você precisa estar logado para se atribuir a um chamado.");
      return;
    }

    try {
      const ticketRef = doc(db, "chamados", ticketId);

      updateDoc(ticketRef, {
        tecnicoAtb: userName,
      });

      setChamados((prevChamados) =>
        prevChamados.map((chamado) =>
          chamado.id === ticketId
            ? { ...chamado, tecnicoAtb: userName }
            : chamado
        )
      );

      toast.success("Chamado atribuído a você com sucesso!");
    } catch (error) {
      console.error("Erro ao atribuir o chamado:", error);
      toast.error("Erro ao atribuir o chamado.");
    }
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
          {chamados.filter(
            (item) =>
              isAdmin ||
              item.tecnicoAtb === userName ||
              item.tecnicoAtb === "Não atribuído"
          ).length === 0 ? (
            <div className="container dashboard">
              <span>Nenhum chamado encontrado...</span>
              <Link to="/new" className="new">
                <FiPlus color="#fff" size={25} />
                Novo chamado
              </Link>
              <button onClick={toggleFilters} className="btn-filtros">
                Filtros
              </button>
              {showFilters && (
                <div className="filter">
                  {statusOptions.map((status, index) => (
                    <div key={index}>
                      <input
                        type="checkbox"
                        id={`status-${index}`}
                        checked={tempStatusFilters[status]}
                        onChange={() => handleTempStatusChange(status)}
                      />
                      <label htmlFor={`status-${index}`}>
                        Status: {status}
                      </label>
                    </div>
                  ))}
                  {prioridadeOptions.map((prioridade, index) => (
                    <div key={index}>
                      <input
                        type="checkbox"
                        id={`prioridade-${index}`}
                        checked={tempPrioridadeFilters[prioridade]}
                        onChange={() => handleTempPrioridadeChange(prioridade)}
                      />
                      <label htmlFor={`prioridade-${index}`}>
                        Prioridade: {prioridade}
                      </label>
                    </div>
                  ))}
                  <div className="searchTecPonto">
                    <input
                      type="text"
                      placeholder="Pesquisar um técnico"
                      value={searchTecnico}
                      onChange={(e) => setSearchTecnico(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Pesquisar um ponto"
                      value={searchPonto}
                      onChange={(e) => setSearchPonto(e.target.value)}
                    />
                  </div>

                  <button onClick={applyFilters} className="btn-filtros">
                    OK
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/new" className="new">
                <FiPlus color="#fff" size={25} />
                Novo chamado
              </Link>
              <button onClick={toggleFilters} className="btn-filtros">
                Filtros
              </button>
              {showFilters && (
                <div className="filter">
                  {statusOptions.map((status, index) => (
                    <div key={index}>
                      <input
                        type="checkbox"
                        id={`status-${index}`}
                        checked={tempStatusFilters[status]}
                        onChange={() => handleTempStatusChange(status)}
                      />
                      <label htmlFor={`status-${index}`}>
                        Status: {status}
                      </label>
                    </div>
                  ))}
                  {prioridadeOptions.map((prioridade, index) => (
                    <div key={index}>
                      <input
                        type="checkbox"
                        id={`prioridade-${index}`}
                        checked={tempPrioridadeFilters[prioridade]}
                        onChange={() => handleTempPrioridadeChange(prioridade)}
                      />
                      <label htmlFor={`prioridade-${index}`}>
                        Prioridade: {prioridade}
                      </label>
                    </div>
                  ))}
                  <div className="searchTecPonto">
                    <input
                      type="text"
                      placeholder="Pesquisar um técnico"
                      value={searchTecnico}
                      onChange={(e) => setSearchTecnico(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Pesquisar um ponto"
                      value={searchPonto}
                      onChange={(e) => setSearchPonto(e.target.value)}
                    />
                  </div>

                  <button onClick={applyFilters} className="btn-filtros">
                    OK
                  </button>
                </div>
              )}
              <table>
                <thead>
                  <tr>
                    <th scope="col">PONTO</th>
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
                  {chamados
                    .filter(
                      (item) =>
                        user.isAdmin ||
                        item.tecnicoAtb === userName ||
                        item.tecnicoAtb === "Não atribuído"
                    )
                    .map((item, index) => (
                      <tr key={index}>
                        <td data-label="Ponto">{item.cliente}</td>
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
                            style={{ backgroundColor: "#f6a935" }}
                            onClick={() => assignTicketToSelf(item.id)}
                            disabled={
                              item.status === "Atendido" ||
                              item.tecnicoAtb === userName
                            }
                          >
                            <FiUserPlus color="#fff" size={17} />
                          </button>
                          <button
                            className="action"
                            style={{ backgroundColor: "purple" }}
                            onClick={() => handleOpenSolutionModal(item.id)}
                          >
                            <FiCrosshair color="#fff" size={17} />
                          </button>
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
                          <Link
                            to={`/new/${item.id}`}
                            className="action"
                            style={{ backgroundColor: "#f6a935" }}
                          >
                            <FiEdit2 color="#fff" size={17} />
                          </Link>
                          {/* atribuir-se */}
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
