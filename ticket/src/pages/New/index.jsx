import Header from "../../components/Header";
import Title from "../../components/Title";
import { FiPlusCircle } from "react-icons/fi";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/auth";
import { db } from "../../services/firebaseConnection";
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

import "./new.css";

const listRef = collection(db, "customers");

export default function New() {
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  const { id } = useParams();

  const [customers, setCustomers] = useState([]);
  const [loadCustomer, setLoadCustomer] = useState(true);
  const [customerSelected, setCustomerSelected] = useState(0);

  const [complemento, setComplemento] = useState("");
  const [assunto, setAssunto] = useState("Acesso remoto");
  const [status, setStatus] = useState("Aberto");
  const [prioridade, setPrioridade] = useState("Normal");
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
              nomeFantasia: doc.data().nomeFantasia,
            });
          });

          if (snapshot.docs.size === 0) {
            console.log("Nenhum dado encontrado");
            setLoadCustomer(false);
            setCustomers([
              { id: 1, nomeFantasia: "Nenhum cliente encontrado" },
            ]);
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
          setCustomers([{ id: 1, nomeFantasia: "Fulano de tal" }]);
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

    if (idCustomer) {
      //   atualizando chamado
      const docRef = doc(db, "chamados", id);
      await updateDoc(docRef, {
        cliente: customers[customerSelected].nomeFantasia,
        clienteId: customers[customerSelected].id,
        assunto: assunto,
        status: status,
        prioridade: prioridade,
        complemento: complemento,
        solucaoChamado: solucaoChamado,
        userId: user.uid,
        tecnicoAtb: tecnicoAtb,
      })
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

      return;
    }

    // regist chamado

    await addDoc(collection(db, "chamados"), {
      created: new Date(),
      cliente: customers[customerSelected].nomeFantasia,
      clienteId: customers[customerSelected].id,
      assunto: assunto,
      status: status,
      prioridade: prioridade,
      complemento: complemento,
      solucaoChamado: solucaoChamado,
      userId: user.uid,
      tecnicoAtb: tecnicoAtb,
    })
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
                      {item.nomeFantasia}
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
            <div className="status">
              <input
                type="radio"
                name="radio"
                value="Aberto"
                className="radio"
                onChange={handleOptionChange}
                checked={status === "Aberto"}
              />
              <span>Em aberto</span>
              <input
                type="radio"
                name="radio"
                value="Progresso"
                className="radio"
                onChange={handleOptionChange}
                checked={status === "Progresso"}
              />
              <span>Em progresso</span>
              <input
                type="radio"
                name="radio"
                value="Atendido"
                className="radio"
                onChange={handleOptionChange}
                checked={status === "Atendido"}
              />
              <span>Atendido</span>
            </div>

            <label>Prioridade</label>
            <select value={prioridade} onChange={handleChangePrioridadeSelect}>
              <option value="Normal">Normal</option>
              <option value="Moderada">Moderada</option>
              <option value="Urgente">Urgente</option>
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

            <label>Complementos</label>
            <textarea
              type="text"
              placeholder="Descreva o problema (opcional)"
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
            />

            <label>Solução</label>
            <select value={solucaoChamado} onChange={handleChangeSolucaoSelect}>
              <option value="Não solucionado">Não solucionado</option>
              <option value="Troca do aparelho">Troca do aparelho</option>
              <option value="Reiniciar aparelho">
                Reiniciar rede/aparelho
              </option>
              <option value="Outros">Outros</option>
            </select>

            <button type="submit">Registrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
