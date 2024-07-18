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

import "./new.css";

const listRef = collection(db, "customers");

export default function New() {
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  const { id } = useParams();
  const [file, setFile] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [loadCustomer, setLoadCustomer] = useState(true);
  const [customerSelected, setCustomerSelected] = useState(0);

  const [complemento, setComplemento] = useState("");
  const [assunto, setAssunto] = useState("Acesso remoto");
  const [status, setStatus] = useState("Aberto");
  const [prioridade, setPrioridade] = useState("Baixa");
  const [idCustomer, setIdCustomer] = useState(false);
  const [solucaoChamado, setSolucaoChamado] = useState("Não solucionado");
  const [tecnicoAtb, setTecnicoAtb] = useState("Não atribuído");
  const [TecnicosCadastrados, setTecnicosCadastrados] = useState([]); // State for TecnicosCadastrados
  const [loadingTecnicosCadastrados, setLoadingTecnicosCadastrados] =
    useState(true); // Loading state

  useEffect(() => {
    async function loadTecnicosCadastrados() {
      try {
        const usersCollection = collection(db, "users");
        const querySnapshot = await getDocs(usersCollection);
        const TecnicosCadastradosData = querySnapshot.docs
          .map((doc) => ({ id: doc.id, nome: doc.data().nome })) // Extract id and name
          .filter((user) => user.nome !== ""); // Filter out empty names

        setTecnicosCadastrados(TecnicosCadastradosData);
      } catch (error) {
        console.error("Erro ao carregar técnicos:", error);
        toast.error("Erro ao carregar técnicos."); // Display an error toast
      } finally {
        setLoadingTecnicosCadastrados(false); // Always set loading to false, even on error
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

        let index = lista.findIndex(
          (item) => item.id === snapshot.data().clienteId
        );
        setCustomerSelected(index);
        setIdCustomer(true);
      })

      .catch((error) => {
        console.log("Deu erro", error);
        setIdCustomer(false);
      });
  }

  function handleOptionChange(e) {
    setStatus(e.target.value);
    console.log(e.target.value);
  }

  function handleChangePrioridadeSelect(e) {
    setPrioridade(e.target.value);
    console.log(e.target.value);
  }

  function handleChangeTecnicoSelect(e) {
    setTecnicoAtb(e.target.value);
    console.log(e.target.value);
  }
  function handleFileChange(e) {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }

  function handleChangeSelect(e) {
    setAssunto(e.target.value);
  }

  function handleChangeCustomer(e) {
    setCustomerSelected(e.target.value);
  }

  function handleChangeSolucaoSelect(e) {
    setSolucaoChamado(e.target.value);
  }

  async function handleRegister(e) {
    e.preventDefault();

    let imageUrl = "";

    if (file) {
      const storageRef = ref(storage, `images/${file.name}`);
      const uploadTask = await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(uploadTask.ref);
    }

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
      imageUrl: imageUrl, // Adiciona a URL da imagem
      created: new Date(),
    };

    if (idCustomer) {
      // Atualizando chamado
      const docRef = doc(db, "chamados", id);
      await updateDoc(docRef, chamadoData)
        .then(() => {
          toast.info("Chamado editado com sucesso!");
          setComplemento("");
          setCustomerSelected(0);
          navigate("/dashboard");
        })
        .catch((error) => {
          toast.error("Erro ao editar chamado, tente novamente!");
          console.log(error);
        });
    } else {
      // Registrando chamado
      await addDoc(collection(db, "chamados"), chamadoData)
        .then(() => {
          toast.success("Chamado registrado com sucesso!");
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
              <option value="Acesso remoto">Acesso remoto</option>
              <option value="Visita Tecnica">Visita tecnica</option>
              <option value="Troca de aparelho">Troca de aparelho</option>
            </select>
            <label>Status</label>
            <select
              name="status"
              value={status}
              onChange={handleOptionChange}
              className="select-status"
            >
              <option value="Aberto">Em aberto</option>
              <option value="Progresso">Em progresso</option>
              <option value="Atendido">Atendido</option>
            </select>
            <label>Prioridade</label>
            <select value={prioridade} onChange={handleChangePrioridadeSelect}>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
              <option value="Critica">Critica</option>
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
            <input type="file" onChange={handleFileChange} />

            {/* <label>Solução</label>
            <select value={solucaoChamado} onChange={handleChangeSolucaoSelect}>
              <option value="Não solucionado">Não solucionado</option>
              <option value="Troca do aparelho">Troca do aparelho</option>
              <option value="Reiniciar aparelho">
                Reiniciar rede/aparelho
              </option>
              <option value="Outros">Outros</option>
            </select> */}
            <button type="submit">Registrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
