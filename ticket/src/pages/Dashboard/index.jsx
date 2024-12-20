import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/auth";
import Header from "../../components/Header";
import "./dashboard.css";
import Title from "../../components/Title";
import { toast } from "react-toastify";
import axios from "axios";
import {
  FiPlus,
  FiMessageSquare,
  FiSearch,
  FiEdit2,
  FiCrosshair,
  FiUserPlus,
  FiMapPin,
  FiPlay,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import {
  collection,
  getDocs,
  orderBy,
  limit,
  startAfter,
  query,
  updateDoc,
  doc,
  GeoPoint,
} from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import SolutionModal from "../../components/SolutionModal";
import Modal from "../../components/Modal";

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
  const [avatars, setAvatars] = useState({});

  useEffect(() => {
    async function loadChamados() {
      const q = query(listRef, orderBy("created", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      let lista = [];
      let statusSet = new Set();
      let prioridadeSet = new Set();

      async function loadAvatars() {
        const usersSnapshot = await getDocs(collection(db, "users"));
        let avatarsMap = {};

        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          avatarsMap[userData.nome] = userData.avatarUrl;
        });

        setAvatars(avatarsMap);
      }

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
          tecnicosAtb: doc.data().tecnicosAtb || [], // Atualizado para tecnicosAtb
          imageUrls: doc.data().imageUrls || [],
          imagemSolucao: doc.data().imagemSolucao,
          equipamento: doc.data().equipamento,
          playChamado: doc.data().playChamado || null,
          chegadaLocal: doc.data().chegadaLocal || null,
        });

        statusSet.add(doc.data().status);
        loadAvatars();
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
          tecnicosAtb: doc.data().tecnicosAtb || [], // Atualizado para tecnicosAtb
          imageUrls: doc.data().imageUrls || [],
          imagemSolucao: doc.data().imagemSolucao,
          playChamado: doc.data().playChamado || null,
          chegadaLocal: doc.data().chegadaLocal || null,
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
          chamado.tecnicosAtb.some((tec) =>
            tec.toLowerCase().includes(tecnico.toLowerCase())
          )) &&
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
      setSortOrder(column === "tecnicosAtb" ? "asc" : "desc"); // Ordem inicial para técnico é ascendente
    }

    if (column === "status") {
      setChamados((prevChamados) => sortTicketsByStatus([...prevChamados]));
    } else if (column === "tecnicosAtb") {
      setChamados((prevChamados) => sortTicketsByTecnico([...prevChamados])); // Nova função de ordenação
    } else {
      setChamados((prevChamados) => sortTickets([...prevChamados]));
    }
  }

  function sortTicketsByTecnico(tickets) {
    return [...tickets].sort((a, b) => {
      const tecnicoA = a.tecnicosAtb.join(", ") || ""; // Lidar com casos em que não há técnico atribuído
      const tecnicoB = b.tecnicosAtb.join(", ") || "";

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
        tecnicosAtb: [...(chamados.find(chamado => chamado.id === ticketId).tecnicosAtb || []), userName],
      });

      setChamados((prevChamados) =>
        prevChamados.map((chamado) =>
          chamado.id === ticketId
            ? { ...chamado, tecnicosAtb: [...chamado.tecnicosAtb, userName] }
            : chamado
        )
      );

      toast.success("Chamado atribuído a você com sucesso!");
    } catch (error) {
      console.error("Erro ao atribuir o chamado:", error);
      toast.error("Erro ao atribuir o chamado.");
    }
  }

  const getAddressFromCoordinates = async (latitude, longitude, apiKey) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      console.log(response.data); // Log detalhado da resposta
      if (response.data.status === "OK") {
        const address = response.data.results[0].formatted_address;
        return address;
      } else {
        throw new Error(`Geocode error: ${response.data.status}`);
      }
    } catch (error) {
      console.error("Erro ao obter o endereço:", error);
      return null;
    }
  };

  const confirmAction = (title, message, onConfirm) => {
    confirmAlert({
      title: title,
      message: message,
      buttons: [
        {
          label: "Sim",
          onClick: onConfirm,
        },
        {
          label: "Não",
        },
      ],
    });
  };

  const handlePlayClick = async (id, ponto) => {
    const chamado = chamados.find((chamado) => chamado.id === id);
    if (chamado.playChamado) {
      toast.error("Você já sinalizou que está a caminho do chamado!");
      return;
    }

    confirmAction(
      "Confirmação",
      "Você deseja sinalizar que está a caminho?",
      async () => {
        if (!navigator.geolocation) {
          toast.error("Geolocalização não é suportada pelo seu navegador.");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const timestamp = new Date().toISOString();
            const { latitude, longitude } = position.coords;
            const address = await getAddressFromCoordinates(
              latitude,
              longitude,
              "AIzaSyBCANKDqKej6Ek8Hzodf2G92MeSEqH1x6w"
            );

            if (!address) {
              toast.error("Erro ao obter o endereço.");
              return;
            }

            const formattedTimestamp = format(
              new Date(timestamp),
              "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss 'UTC'xxx",
              { locale: ptBR }
            );

            try {
              const ticketRef = doc(db, "chamados", id);
              await updateDoc(ticketRef, {
                playChamado: {
                  timestamp: formattedTimestamp,
                  location: new GeoPoint(latitude, longitude),
                  address,
                },
              });
              setChamados((prevChamados) =>
                prevChamados.map((chamado) =>
                  chamado.id === id
                    ? {
                      ...chamado,
                      playChamado: {
                        timestamp: formattedTimestamp,
                        location: new GeoPoint(latitude, longitude),
                        address,
                      },
                    }
                    : chamado
                )
              );
              toast.success(`Você sinalizou que está a caminho de ${ponto}`);
            } catch (error) {
              console.error("Erro ao registrar o play:", error);
              toast.error("Erro ao registrar o play.");
            }
          },
          (error) => {
            console.error("Erro ao obter a geolocalização:", error);
            toast.error("Erro ao obter a geolocalização.");
          }
        );
      }
    );
  };

  const handleChegadaClick = async (id) => {
    const chamado = chamados.find((chamado) => chamado.id === id);
    if (chamado.chegadaLocal) {
      toast.error("Você já sinalizou que chegou no local!");
      return;
    }

    confirmAction(
      "Confirmação",
      "Você deseja sinalizar que chegou ao local?",
      async () => {
        if (!chamado.playChamado) {
          toast.error(
            "Você precisa ativar 'Play Chamado' antes de registrar a chegada."
          );
          return;
        }

        if (!navigator.geolocation) {
          toast.error("Geolocalização não é suportada pelo seu navegador.");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const timestamp = new Date().toISOString();
            const { latitude, longitude } = position.coords;
            const address = await getAddressFromCoordinates(
              latitude,
              longitude,
              "AIzaSyBCANKDqKej6Ek8Hzodf2G92MeSEqH1x6w"
            );

            if (!address) {
              toast.error("Erro ao obter o endereço.");
              return;
            }

            const formattedTimestamp = format(
              new Date(timestamp),
              "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss 'UTC'xxx",
              { locale: ptBR }
            );

            try {
              const ticketRef = doc(db, "chamados", id);
              await updateDoc(ticketRef, {
                chegadaLocal: {
                  timestamp: formattedTimestamp,
                  location: new GeoPoint(latitude, longitude),
                  address,
                },
              });
              setChamados((prevChamados) =>
                prevChamados.map((chamado) =>
                  chamado.id === id
                    ? {
                      ...chamado,
                      chegadaLocal: {
                        timestamp: formattedTimestamp,
                        location: new GeoPoint(latitude, longitude),
                        address,
                      },
                    }
                    : chamado
                )
              );
              toast.success("Chegada registrada com sucesso!");
            } catch (error) {
              console.error("Erro ao registrar a chegada:", error);
              toast.error("Erro ao registrar a chegada.");
            }
          },
          (error) => {
            console.error("Erro ao obter a geolocalização:", error);
            toast.error("Erro ao obter a geolocalização.");
          }
        );
      }
    );
  };

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
              item.tecnicosAtb.includes(userName) ||
              item.tecnicosAtb.length === 0
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
                    <th scope="col" onClick={() => handleSort("tecnicosAtb")}>
                      Técnicos
                      {sortBy === "tecnicosAtb" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th scope="col">#</th>
                  </tr>
                </thead>
                <tbody>
                  {chamados
                    .filter(
                      (item) =>
                        isAdmin ||
                        item.tecnicosAtb.includes(userName) ||
                        item.tecnicosAtb.length === 0
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
                        <td data-label="Técnicos">
                          {item.tecnicosAtb.slice(0, 2).map((tecnico, idx) => (
                            <span key={idx} style={{ display: "inline-block", marginRight: "5px" }}>
                              {avatars[tecnico] ? (
                                <img
                                  src={avatars[tecnico]}
                                  alt={tecnico}
                                  style={{ width: "30px", borderRadius: "50%" }}
                                />
                              ) : (
                                <p style={{ display: "inline", margin: 0 }}>{tecnico}</p>
                              )}
                            </span>
                          ))}
                        </td>

                        <td data-label="#">
                          <button
                            className="action"
                            style={{
                              backgroundColor: item.playChamado
                                ? "#088F8F"
                                : "#5bc0de",
                            }}
                            onClick={() =>
                              handlePlayClick(item.id, item.cliente)
                            }
                            disabled={item.playChamado}
                          >
                            <FiPlay color="#fff" size={17} />
                          </button>
                          <button
                            className="action"
                            style={{ backgroundColor: "#088F8F" }}
                            onClick={() => handleChegadaClick(item.id)}
                            disabled={!item.playChamado}
                          >
                            <FiMapPin color="#fff" size={17} />
                          </button>
                          <button
                            className="action"
                            style={{ backgroundColor: "#f6a935" }}
                            onClick={() => assignTicketToSelf(item.id)}
                            disabled={
                              item.status === "Atendido" ||
                              item.tecnicosAtb.includes(userName)
                            }
                          >
                            <FiUserPlus color="#fff" size={15} />
                          </button>
                          <button
                            className="action"
                            style={{ backgroundColor: "purple" }}
                            onClick={() => handleOpenSolutionModal(item.id)}
                          >
                            <FiCrosshair color="#fff" size={15} />
                          </button>
                          <button
                            className="action"
                            style={{ backgroundColor: "#3583f6" }}
                            onClick={() => toggleModal(item)}
                          >
                            <FiSearch color="#fff" size={15} />
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
                            <FiEdit2 color="#fff" size={15} />
                          </Link>
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
      <footer>
        <h2>Para garantir sua segurança e bem-estar, é indispensável o uso correto dos Equipamentos de Proteção Individual (EPI) durante todas as atividades.</h2>
      </footer>
    </div>
  );
}
