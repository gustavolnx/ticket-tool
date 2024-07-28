import Header from "../../components/Header";
import Title from "../../components/Title";
import { FiUser } from "react-icons/fi";
import { useState, useEffect } from "react";
import { db } from "../../services/firebaseConnection";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import "./customers.css";

export default function Customers() {
  const [ponto, setPonto] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [endereco, setEndereco] = useState("");
  const [showForm, setShowForm] = useState(false); // Estado para controlar a visibilidade do formulário
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFormProd, setShowFormProd] = useState(false);
  const [categoriaEquip, setCategoriaEquip] = useState(false);
  const [checkPc, setCheckPc] = useState(false);
  const [checkCompartilhado, setCheckCompartilhado] = useState(false);

  useEffect(() => {
    async function fetchClientes() {
      const querySnapshot = await getDocs(collection(db, "customers"));
      let lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setClientes(lista);
    }
    fetchClientes();
  }, []);

  async function handleRegisterCliente(e) {
    e.preventDefault();

    if (ponto !== "" && endereco !== "" && nomeFantasia !== "") {
      await addDoc(collection(db, "customers"), {
        pontoLocal: ponto,
        endereco: endereco,
        nomeFantasia: nomeFantasia,
      })
        .then(() => {
          setPonto("");
          setEndereco("");
          setNomeFantasia("");
          toast.success("Cliente cadastrado com sucesso!");
          // Atualizar a lista de clientes após cadastrar um novo cliente
          fetchClientes();
        })
        .catch((error) => {
          console.log(error);
          toast.error("Erro ao cadastrar cliente");
        });
    } else {
      toast.error("Preencha todos os campos");
    }
  }

  async function handleRegisterEquip(e) {
    e.preventDefault();

    if (ponto !== "" && categoriaEquip !== "") {
      await addDoc(collection(db, "equipments"), {
        pontoLocal: ponto,
        categoriaEquip: categoriaEquip,
        checkCompartilhado:
          categoriaEquip === "PC" ? checkCompartilhado : false,
      })
        .then(() => {
          setPonto("");
          setCategoriaEquip("");
          setCheckCompartilhado(false);
          toast.success("Equipamento cadastrado com sucesso!");
          // Atualizar a lista de equipamentos após cadastrar um novo equipamento
          fetchClientes();
        })
        .catch((error) => {
          console.log(error);
          toast.error("Erro ao cadastrar equipamento");
        });
    } else {
      toast.error("Preencha todos os campos");
    }
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (ponto !== "" && endereco !== "" && nomeFantasia !== "") {
      await addDoc(collection(db, "customers"), {
        pontoLocal: ponto,
        endereco: endereco,
        nomeFantasia: nomeFantasia,
        categoriaEquip: categoriaEquip,
        checkPc: checkPc,
        checkCompartilhado:
          categoriaEquip === "PC" ? checkCompartilhado : false,
      })
        .then(() => {
          setPonto("");
          setEndereco("");
          setNomeFantasia("");
          categoriaEquip("");
          checkCompartilhado(""),
            toast.success("Cliente cadastrado com sucesso!");
          // Atualizar a lista de clientes após cadastrar um novo cliente
          fetchClientes();
        })
        .catch((error) => {
          console.log(error);
          toast.error("Erro ao cadastrar cliente");
        });
    } else {
      toast.error("Preencha todos os campos");
    }
  }

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Remove accents
  };

  const filteredClientes = clientes.filter((cliente) =>
    normalizeText(cliente.pontoLocal).includes(normalizeText(searchTerm))
  );

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Clientes">
          <FiUser size={25} />
        </Title>

        <div className="container container-block">
          <input
            type="text"
            placeholder="Pesquisar cliente"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="clientes-cadastrados">
            <ul>
              {filteredClientes.map((cliente) => (
                <li key={cliente.id}>{cliente.pontoLocal}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="container">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="btn-cadastrarCliente"
            >
              Cadastrar cliente
            </button>
          ) : (
            <form className="form-profile" onSubmit={handleRegister}>
              <label>Ponto</label>
              <input
                type="text"
                placeholder="Ponto da empresa"
                value={ponto}
                onChange={(e) => setPonto(e.target.value)}
              />
              <label>Nome empresa</label>
              <input
                type="text"
                placeholder="Nome da empresa"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
              />
              <label>Endereço</label>
              <input
                type="text"
                placeholder="Endereço da empresa"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
              <button type="submit">Cadastrar</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
