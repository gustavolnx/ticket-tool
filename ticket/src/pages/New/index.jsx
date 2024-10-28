import Header from "../../components/Header";
import Title from "../../components/Title";
import { FiPlusCircle } from "react-icons/fi";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/auth";
import { db, storage } from "../../services/firebaseConnection";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import "./new.css";

const listRef = collection(db, "customers");

export default function New() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [files, setFiles] = useState([]); // Suporte a múltiplos arquivos

  const [customers, setCustomers] = useState([]);
  const [loadCustomer, setLoadCustomer] = useState(true);
  const [customerSelected, setCustomerSelected] = useState(0);

  const [complemento, setComplemento] = useState("");
  const [assunto, setAssunto] = useState("Não informado");
  const [status, setStatus] = useState("Aberto");
  const [prioridade, setPrioridade] = useState("Baixa");
  const [idCustomer, setIdCustomer] = useState(false);
  const [solucaoChamado, setSolucaoChamado] = useState("Não solucionado");
  const [tecnicoAtb, setTecnicoAtb] = useState("Não atribuído");
  const [TecnicosCadastrados, setTecnicosCadastrados] = useState([]);
  const [loadingTecnicosCadastrados, setLoadingTecnicosCadastrados] =
    useState(true);
  const [equipamentos, setEquipamentos] = useState([]);
  const [imageUrls, setImageUrls] = useState([]); // URLs das imagens existentes
  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState("Não informado");

  useEffect(() => {
    async function loadTecnicosCadastrados() {
      try {
        const usersCollection = collection(db, "users");
        const querySnapshot = await getDocs(usersCollection);
        const TecnicosCadastradosData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            nome: doc.data().nome,
            oculto: doc.data().isHidden || false, // Verifica se o técnico está oculto
          }))
          .filter((user) => !user.oculto); // Filtra os técnicos ocultos

        setTecnicosCadastrados(TecnicosCadastradosData);
      } catch (error) {
        console.error("Erro ao carregar técnicos:", error);
        toast.error("Erro ao carregar técnicos.");
      } finally {
        setLoadingTecnicosCadastrados(false);
      }
    }

    loadTecnicosCadastrados();
  }, []);

  useEffect(() => {
    async function loadCustomers() {
      const querySnapshot = await getDocs(listRef)
        .then((snapshot) => {
          let lista = [];
          snapshot.forEach((doc) => {
            lista.push({
              id: doc.id,
              pontoLocal: doc.data().pontoLocal,
            });
          });

          if (snapshot.docs.size === 0) {
            console.log("Nenhum dado encontrado");
            setLoadCustomer(false);
            setCustomers([{ id: 1, pontoLocal: "Nenhum cliente encontrado" }]);
            return;
          }

          setCustomers(lista);
          setLoadCustomer(false);

          if (id) {
            loadId(lista);
          }
        })
        .catch((error) => {
          console.log("Deu erro", error);
          setLoadCustomer(false);
          setCustomers([{ id: 1, pontoLocal: "Fulano de tal" }]);
        });
    }
    loadCustomers();
  }, [id]);

  useEffect(() => {
    if (customers.length > 0) {
      loadEquipamentos();
    }
  }, [customerSelected, customers]);

  async function loadEquipamentos() {
    if (customers[customerSelected]) {
      const q = query(
        collection(db, "equipamentos"),
        where("clienteId", "==", customers[customerSelected].id)
      );
      const querySnapshot = await getDocs(q);
      const equipamentosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        categoria: doc.data().categoria,
        patrimonio: doc.data().patrimonio,
      }));
      setEquipamentos(equipamentosData);
    }
  }

  async function loadId(lista) {
    const docRef = doc(db, "chamados", id);
    await getDoc(docRef)
      .then((snapshot) => {
        setAssunto(snapshot.data().assunto);
        setStatus(snapshot.data().status);
        setPrioridade(snapshot.data().prioridade);
        setComplemento(snapshot.data().complemento);
        setSolucaoChamado(snapshot.data().solucaoChamado);
        setTecnicoAtb(snapshot.data().tecnicoAtb);
        setImageUrls(snapshot.data().imageUrls || []); // Carregar as URLs das imagens existentes

        let index = lista.findIndex(
          (item) => item.id === snapshot.data().clienteId
        );
        setCustomerSelected(index);
        setEquipamentoSelecionado(
          snapshot.data().equipamento || "Não informado"
        );
        setIdCustomer(true);
        loadEquipamentos(); // Load equipamentos when editing a chamado
      })
      .catch((error) => {
        console.log("Deu erro", error);
        setIdCustomer(false);
      });
  }

  function handleOptionChange(e) {
    setStatus(e.target.value);
  }

  function handleChangePrioridadeSelect(e) {
    setPrioridade(e.target.value);
  }

  function handleChangeTecnicoSelect(e) {
    setTecnicoAtb(e.target.value);
  }

  function handleFileChange(e) {
    if (e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  }

  function handleChangeSelect(e) {
    setAssunto(e.target.value);
  }

  function handleChangeCustomer(e) {
    setCustomerSelected(e.target.value);
    loadEquipamentos(); // Load equipamentos when changing customer
  }

  function handleChangeEquipamentoSelect(e) {
    setEquipamentoSelecionado(e.target.value);
  }

  function handleChangeSolucaoSelect(e) {
    setSolucaoChamado(e.target.value);
  }

  const handleRemoveImage = (index) => {
    setImageUrls((prevImageUrls) =>
      prevImageUrls.filter((_, i) => i !== index)
    );
  };

  async function addHistoryEntry(chamadoId, field, newValue, userId) {
    const docRef = doc(db, "chamados", chamadoId);
    const chamadoSnapshot = await getDoc(docRef);
    
    if (chamadoSnapshot.exists()) {
      const chamadoData = chamadoSnapshot.data();
      const history = chamadoData.history || [];
      
      const newEntry = {
        field: field,
        newValue: newValue,
        changedBy: userId,
        timestamp: new Date(),
      };
      
      history.push(newEntry);
      
      await updateDoc(docRef, { history });
    }
  }

  async function handleRegister(e) {
    e.preventDefault();

    let newImageUrls = [...imageUrls]; // Manter as URLs das imagens existentes

    if (files.length > 0) {
      const uploadPromises = files.map((file) => {
        const storageRef = ref(storage, `images/${file.name}`);
        return uploadBytes(storageRef, file).then((snapshot) =>
          getDownloadURL(snapshot.ref)
        );
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      newImageUrls = [...newImageUrls, ...uploadedUrls];
    }

    const equipamentoInfo =
      equipamentoSelecionado === "Não informado" ? "" : equipamentoSelecionado;

    const chamadoData = {
      cliente: customers[customerSelected].pontoLocal,
      clienteId: customers[customerSelected].id,
      assunto: assunto,
      status: status,
      prioridade: prioridade,
      complemento: complemento,
      solucaoChamado: solucaoChamado,
      userId: user.uid,
      tecnicoAtb: tecnicoAtb,
      equipamento: equipamentoInfo,
      imageUrls: newImageUrls,
      created: new Date(),
    };

    if (idCustomer) {
      // Atualizando chamado
      const docRef = doc(db, "chamados", id);
      const prevSnapshot = await getDoc(docRef);
      const prevData = prevSnapshot.data();

      await updateDoc(docRef, chamadoData)
        .then(async () => {
          toast.info("Chamado editado com sucesso!");
          
          // Registro de alterações
          if (prevData.status !== status) {
            await addHistoryEntry(id, "status", status, user.uid);
          }
          if (prevData.solucaoChamado !== solucaoChamado) {
            await addHistoryEntry(id, "solucaoChamado", solucaoChamado, user.uid);
          }
          if (prevData.complemento !== complemento) {
            await addHistoryEntry(id, "complemento", complemento, user.uid);
          }
          if (prevData.tecnicoAtb !== tecnicoAtb) {
            await addHistoryEntry(id, "tecnicoAtb", tecnicoAtb, user.uid);
          }

          setComplemento("");
          setCustomerSelected(0);
          navigate("/dashboard");
        })
        .catch((error) => {
          toast.error("Erro ao editar chamado, tente novamente!");
          console.log(error);
        });
    } else {
      await addDoc(collection(db, "chamados"), chamadoData)
        .then((docRef) => {
          toast.success("Chamado registrado com sucesso!", {
            onClose: () => {
              navigate("/dashboard");
            },
            autoClose: 3000
          });

          // Registro inicial de criação
          addHistoryEntry(docRef.id, "criação", "Chamado criado", user.uid);

          setComplemento("");
          setCustomerSelected(0);
        })
        .catch((error) => {
          toast.error("Erro ao registrar chamado, tente novamente!");
          console.log(error);
        });
    }
  }

  return (
    <div>
      <Header />
      <div className="content">
        <Title name={id ? "Editando chamado" : "Novo chamado"}>
          {" "}
          <FiPlusCircle size={25} />
        </Title>
        <div className="container">
          <form className="form-profile" onSubmit={handleRegister}>
            <label>Cliente</label>
            {loadCustomer ? (
              <input type="text" disabled={true} value={"Carregando..."} />
            ) : (
              <select value={customerSelected} onChange={handleChangeCustomer}>
                {customers.map((item, index) => {
                  return (
                    <option key={item.id} value={index}>
                      {item.pontoLocal}
                    </option>
                  );
                })}
              </select>
            )}
            <label>Assunto</label>
            <select value={assunto} onChange={handleChangeSelect}>
              <option value="Não informado">Não informado</option>
              <option value="Acesso remoto">Acesso remoto</option>
              <option value="Visita Tecnica">Visita técnica</option>
              <option value="Troca de aparelho">Troca de aparelho</option>
            </select>
            <label>Equipamento</label>
            <select
              value={equipamentoSelecionado}
              onChange={handleChangeEquipamentoSelect}
            >
              <option value="Não informado">Não informado</option>
              {equipamentos.length > 0 ? (
                equipamentos.map((equipamento) => (
                  <option
                    key={equipamento.id}
                    value={`${equipamento.categoria} - ${equipamento.patrimonio}`}
                  >{`${equipamento.categoria} - ${equipamento.patrimonio}`}</option>
                ))
              ) : (
                <option value="">Nenhum equipamento encontrado</option>
              )}
            </select>
            <label>Status</label>
            <select
              name="status"
              value={status}
              onChange={handleOptionChange}
              className="select-status"
            >
              <option value="Aberto">Aberto</option>
              <option value="Progresso">Em progresso</option>
              <option value="Atendido">Atendido</option>
            </select>
            <label>Prioridade</label>
            <select value={prioridade} onChange={handleChangePrioridadeSelect}>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
              <option value="Critica">Crítica</option>
            </select>
            <label>Técnico</label>
            <select value={tecnicoAtb} onChange={handleChangeTecnicoSelect}>
              {loadingTecnicosCadastrados ? (
                <option value="">Carregando...</option>
              ) : (
                <>
                  <option value="Não atribuído">Não atribuído</option>
                  {TecnicosCadastrados.map((tecnicosList) => (
                    <option key={tecnicosList.id} value={tecnicosList.nome}>
                      {tecnicosList.nome}
                    </option>
                  ))}
                </>
              )}
            </select>

            <label>Descrição do problema</label>
            <textarea
              type="text"
              placeholder="Descreva o problema"
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
            />
            <input type="file" onChange={handleFileChange} multiple />

            {imageUrls.length > 0 && (
              <div className="image-preview-container">
                {imageUrls.map((url, index) => (
                  <div key={index} className="image-preview">
                    <img
                      src={url}
                      alt={`Imagem ${index + 1}`}
                      width="100"
                      height="100"
                    />
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={() => handleRemoveImage(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button type="submit">Registrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
