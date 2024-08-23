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
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import "./newchecking.css";

const listRef = collection(db, "customers");
const campaignRef = collection(db, "campaigns");

export default function Newchecking() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [files, setFiles] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [loadCustomer, setLoadCustomer] = useState(true);
  const [customerSelected, setCustomerSelected] = useState(0);

  const [ponto, setPonto] = useState("");
  const [status, setStatus] = useState("Aberto");
  const [prioridade, setPrioridade] = useState("Baixa");
  const [idCustomer, setIdCustomer] = useState(false);
  const [solucaoChamado, setSolucaoChamado] = useState("Não solucionado");
  const [tecnicoAtb, setTecnicoAtb] = useState("Não atribuído");
  const [TecnicosCadastrados, setTecnicosCadastrados] = useState([]);
  const [loadingTecnicosCadastrados, setLoadingTecnicosCadastrados] =
    useState(true);
  const [imageUrls, setImageUrls] = useState([]);

  const [campaigns, setCampaigns] = useState([]);
  const [loadCampaigns, setLoadCampaigns] = useState(true);
  const [imageCampaignSelections, setImageCampaignSelections] = useState({});
  const [imageNames, setImageNames] = useState({});
  const [imageCount, setImageCount] = useState(1);

  const [creatingNewCampaign, setCreatingNewCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [multiCampaigns, setMultiCampaigns] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState("Não atribuída");

  useEffect(() => {
    async function loadTecnicosCadastrados() {
      try {
        const usersCollection = collection(db, "users");
        const querySnapshot = await getDocs(usersCollection);
        const TecnicosCadastradosData = querySnapshot.docs
          .map((doc) => ({ id: doc.id, nome: doc.data().nome }))
          .filter((user) => user.nome !== "");

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
      try {
        const querySnapshot = await getDocs(listRef);
        let lista = [];
        querySnapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            cliente: doc.data().nomeFantasia,
            pontoLocal: doc.data().pontoLocal,
          });
        });

        if (querySnapshot.size === 0) {
          console.log("Nenhum dado encontrado");
          setLoadCustomer(false);
          setCustomers([{ id: 1, cliente: "Nenhum cliente encontrado" }]);
          return;
        }

        setCustomers(lista);
        setLoadCustomer(false);

        if (id) {
          loadId(lista);
        }
      } catch (error) {
        console.log("Erro ao carregar clientes", error);
        setLoadCustomer(false);
        setCustomers([{ id: 1, cliente: "Erro ao carregar clientes" }]);
      }
    }
    loadCustomers();
  }, [id]);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const querySnapshot = await getDocs(campaignRef);
        let lista = [{ id: "nao_atribuida", nome: "Não atribuída" }];
        querySnapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            nome: doc.data().nome,
          });
        });

        setCampaigns(lista);
        setLoadCampaigns(false);
      } catch (error) {
        console.log("Erro ao carregar campanhas", error);
        setLoadCampaigns(false);
        setCampaigns([{ id: "nao_atribuida", nome: "Não atribuída" }]);
      }
    }
    loadCampaigns();
  }, []);

  async function loadId(lista) {
    const docRef = doc(db, "checking", id);
    try {
      const snapshot = await getDoc(docRef);

      // Setar o ponto e outras propriedades carregadas do chamado
      setPonto(snapshot.data().pontoLocal);
      setStatus(snapshot.data().status);
      setPrioridade(snapshot.data().prioridade);
      setSolucaoChamado(snapshot.data().solucaoChamado);
      setTecnicoAtb(snapshot.data().tecnicoAtb);
      setImageUrls(snapshot.data().imageUrls || []);

      let index = lista.findIndex(
        (item) => item.id === snapshot.data().clienteId
      );
      setCustomerSelected(index);

      // Aqui estamos setando a campanha selecionada ou múltiplas campanhas, caso existam
      const savedCampaignSelections = snapshot.data().campaignSelections;
      const isMultiCampaign = typeof savedCampaignSelections === "object";

      if (isMultiCampaign) {
        setMultiCampaigns(true);
        setImageCampaignSelections(savedCampaignSelections);
      } else {
        setMultiCampaigns(false);
        setSelectedCampaign(savedCampaignSelections || "Não atribuída");
      }

      setIdCustomer(true);
    } catch (error) {
      console.log("Erro ao carregar chamado", error);
    }
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

  function handleChangeCustomer(e) {
    setCustomerSelected(e.target.value);
  }

  // Função para o select de campanha principal
  function handleMainCampaignChange(e) {
    const selectedCampaign = e.target.value;
    setSelectedCampaign(selectedCampaign);

    // Ativar selects independentes para cada imagem se a opção "MULTIPLAS CAMPANHAS" for escolhida
    if (selectedCampaign === "multiplas_campanhas") {
      setMultiCampaigns(true);
    } else {
      setMultiCampaigns(false);
    }

    // Se "Nova campanha" for selecionado, exibir o campo para criação de uma nova campanha
    if (selectedCampaign === "nova_campanha") {
      setCreatingNewCampaign(true);
    } else {
      setCreatingNewCampaign(false);
    }
  }

  // Função para os selects abaixo das imagens
  async function handleImageCampaignChange(e, index) {
    const selectedCampaign = e.target.value;

    const newCampaignSelections = {
      ...imageCampaignSelections,
      [index]: selectedCampaign,
    };

    setImageCampaignSelections(newCampaignSelections);

    const imageUrl = imageUrls[index];
    const imageName = imageNames[index] || imageCount;

    setImageNames({ ...imageNames, [index]: imageName });

    // Salvar no Firebase as informações da imagem e campanha associada
    try {
      await addDoc(collection(db, "images"), {
        imageUrl,
        campaign: selectedCampaign,
        imageName: imageName,
        addedAt: new Date(),
      });

      toast.success("Imagem e campanha salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar imagem e campanha:", error);
      toast.error("Erro ao salvar imagem e campanha.");
    }

    // Incrementar o contador para o próximo nome de imagem
    setImageCount(imageCount + 1);
  }

  async function handleCreateCampaign() {
    if (newCampaignName.trim() === "") {
      toast.error("Por favor, insira um nome válido para a campanha.");
      return;
    }

    try {
      const docRef = await addDoc(campaignRef, {
        nome: newCampaignName,
      });

      // Adiciona a nova campanha à lista de campanhas e atualiza o estado
      setCampaigns((prev) => [
        ...prev,
        { id: docRef.id, nome: newCampaignName },
      ]);
      setCreatingNewCampaign(false);
      setSelectedCampaign(newCampaignName); // Selecionar a nova campanha criada
      setNewCampaignName("");
      toast.success("Nova campanha criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar nova campanha:", error);
      toast.error("Erro ao criar nova campanha.");
    }
  }

  function handleCancelNewCampaign() {
    setCreatingNewCampaign(false);
    setNewCampaignName("");
  }

  function handleRemoveImage(index) {
    setImageUrls((prevImageUrls) =>
      prevImageUrls.filter((_, i) => i !== index)
    );
    setImageCampaignSelections((prev) => {
      const newSelections = { ...prev };
      delete newSelections[index];
      return newSelections;
    });
    setImageNames((prev) => {
      const newNames = { ...prev };
      delete newNames[index];
      return newNames;
    });
  }

  async function handleRegister(e) {
    e.preventDefault();

    let newImageUrls = [...imageUrls];

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

    const chamadoData = {
      cliente: customers[customerSelected].cliente,
      clienteId: customers[customerSelected].id,
      pontoLocal: customers[customerSelected].pontoLocal,
      status: status,
      prioridade: prioridade,
      solucaoChamado: solucaoChamado,
      userId: user.uid,
      tecnicoAtb: tecnicoAtb,
      imageUrls: newImageUrls,
      campaignSelections: multiCampaigns
        ? imageCampaignSelections
        : selectedCampaign,
      imageNames: imageNames,
      created: new Date(),
    };

    try {
      if (idCustomer) {
        const docRef = doc(db, "checking", id);
        await updateDoc(docRef, chamadoData);
        toast.info("Chamado editado com sucesso!");
        setCustomerSelected(0);
        navigate("/dashboard");
      } else {
        await addDoc(collection(db, "checking"), chamadoData);
        toast.success("Chamado registrado com sucesso!");
        setCustomerSelected(0);
      }
    } catch (error) {
      toast.error("Erro ao registrar chamado, tente novamente!");
      console.log("Erro ao registrar chamado:", error);
    }
  }

  return (
    <div>
      <Header />
      <div className="content">
        <Title name={id ? "Editando chamado" : "Novo chamado"}>
          <FiPlusCircle size={25} />
        </Title>
        <div className="container">
          <form className="form-profile" onSubmit={handleRegister}>
            <label>Cliente</label>
            {loadCustomer ? (
              <input type="text" disabled={true} value={"Carregando..."} />
            ) : (
              <select value={customerSelected} onChange={handleChangeCustomer}>
                {customers.map((item, index) => (
                  <option key={item.id} value={index}>
                    {item.cliente}
                  </option>
                ))}
              </select>
            )}
            <label>Ponto</label>
            {loadCustomer ? (
              <input type="text" disabled={true} value={"Carregando..."} />
            ) : (
              <select value={customerSelected} onChange={handleChangeCustomer}>
                {customers.map((item, index) => (
                  <option key={item.id} value={index}>
                    {item.pontoLocal}
                  </option>
                ))}
              </select>
            )}

            <label>Campanha Principal</label>
            {loadCampaigns ? (
              <input type="text" disabled={true} value={"Carregando..."} />
            ) : (
              <select
                value={selectedCampaign || "Não atribuída"}
                onChange={handleMainCampaignChange}
              >
                {campaigns.map((item) => (
                  <option key={item.id} value={item.nome}>
                    {item.nome}
                  </option>
                ))}
                <option value="multiplas_campanhas">MULTIPLAS CAMPANHAS</option>
                <option value="nova_campanha">Nova campanha</option>
              </select>
            )}

            {creatingNewCampaign && (
              <div>
                <input
                  type="text"
                  placeholder="Nome da nova campanha"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                />
                <button type="button" onClick={handleCreateCampaign}>
                  OK
                </button>
                <button type="button" onClick={handleCancelNewCampaign}>
                  Cancelar
                </button>
              </div>
            )}

            <label>Status</label>
            <select
              name="status"
              value={status}
              onChange={handleOptionChange}
              className="select-status"
            >
              <option value="Aberto">Aberto</option>
              <option value="Progresso">Em progresso</option>
              <option value="Finalizado">Finalizado</option>
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
                    {multiCampaigns && (
                      <select
                        value={
                          imageCampaignSelections[index] || "Não atribuída"
                        }
                        onChange={(e) => handleImageCampaignChange(e, index)}
                      >
                        {campaigns.map((item) => (
                          <option key={item.id} value={item.nome}>
                            {item.nome}
                          </option>
                        ))}
                        <option value="nova_campanha">Nova campanha</option>
                      </select>
                    )}
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
