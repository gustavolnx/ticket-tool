import Header from "../../components/Header";
import Title from "../../components/Title";
import { FiUser } from "react-icons/fi";
import { useState } from "react";
import { db } from "../../services/firebaseConnection";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "react-toastify";

export default function Customers() {
  const [ponto, setPonto] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [endereco, setEndereco] = useState("");

  async function handleRegister(e) {
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
        })
        .catch((error) => {
          console.log(error);
          toast.error("Erro ao cadastrar cliente");
        });
    } else {
      toast.error("Preencha todos os campos");
    }
  }

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Clientes">
          <FiUser size={25} />
        </Title>

        <div className="container">
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
        </div>
      </div>
    </div>
  );
}
