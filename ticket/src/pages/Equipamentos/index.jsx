import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/auth";
import { db } from "../../services/firebaseConnection";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Title from "../../components/Title";
import { FiPlusCircle } from "react-icons/fi";
import "./equipamentos.css";

// Componente Modal
function Modal({ isOpen, onClose, onSave, equipamento }) {
  const [localTipo, setLocalTipo] = useState(equipamento.tipo);
  const [localModelo, setLocalModelo] = useState(equipamento.modelo);

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Editar Equipamento</h2>
        <label>Tipo</label>
        <input
          type="text"
          value={localTipo}
          onChange={(e) => setLocalTipo(e.target.value)}
        />
        <label>Modelo</label>
        <input
          type="text"
          value={localModelo}
          onChange={(e) => setLocalModelo(e.target.value)}
        />
        <button onClick={() => onSave({ tipo: localTipo, modelo: localModelo })}>Salvar</button>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

const listRef = collection(db, "customers");

export default function Equipamentos() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loadCustomer, setLoadCustomer] = useState(true);
  const [customerSelected, setCustomerSelected] = useState(0);
  const [patrimonio, setPatrimonio] = useState("");
  const [categoria, setCategoria] = useState("Não selecionada");
  const [status, setStatus] = useState("Em uso");
  const [prioridade, setPrioridade] = useState("Baixa");
  const [idCustomer, setIdCustomer] = useState(false);
  const [compartilhado, setCompartilhado] = useState("Não");
  const [equipamentosPC, setEquipamentosPC] = useState([]);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState("");

  // New fields
  const [tipo, setTipo] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [processador, setProcessador] = useState("");
  const [memoriaRam, setMemoriaRam] = useState("");
  const [outrasCaracteristicas, setOutrasCaracteristicas] = useState("");
  const [dataCompra, setDataCompra] = useState("");
  const [ultimoResponsavel, setUltimoResponsavel] = useState("");

  // Equipment list state
  const [equipamentos, setEquipamentos] = useState([]);
  const [filteredEquipamentos, setFilteredEquipamentos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEquipamento, setEditingEquipamento] = useState(null);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const snapshot = await getDocs(listRef);
        let lista = [];
        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            pontoLocal: doc.data().pontoLocal,
          });
        });

        if (snapshot.docs.length === 0) {
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
      } catch (error) {
        console.log("Deu erro", error);
        setLoadCustomer(false);
        setCustomers([{ id: 1, pontoLocal: "Fulano de tal" }]);
      }
    }

    loadCustomers();
    loadEquipamentos();
  }, [id]);

  useEffect(() => {
    if (compartilhado === "Sim" && customers[customerSelected]) {
      const q = query(
        collection(db, "equipamentos"),
        where("clienteId", "==", customers[customerSelected].id)
      );
      getDocs(q).then((snapshot) => {
        let lista = [];
        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            patrimonio: doc.data().patrimonio,
            categoria: doc.data().categoria,
          });
        });
        setEquipamentosPC(lista);
      });
    }
  }, [compartilhado, customerSelected, customers]);

  async function loadEquipamentos() {
    const q = query(collection(db, "equipamentos"));
    const snapshot = await getDocs(q);
    const lista = [];
    snapshot.forEach((doc) => {
      lista.push({
        id: doc.id,
        pontoLocal: doc.data().cliente,
        patrimonio: doc.data().patrimonio,
        tipo: doc.data().tipo,
        modelo: doc.data().modelo,
      });
    });
    setEquipamentos(lista);
    setFilteredEquipamentos(lista);
  }

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
    if (e.target.value === "") {
      setFilteredEquipamentos(equipamentos);
    } else {
      setFilteredEquipamentos(
        equipamentos.filter((equip) =>
          equip.patrimonio.toLowerCase().includes(e.target.value.toLowerCase())
        )
      );
    }
  }

  function handleChangeSelect(e) {
    setCategoria(e.target.value);
  }

  function handleChangeCustomer(e) {
    setCustomerSelected(e.target.value);
    setCompartilhado("Não");
    setEquipamentoSelecionado("");
  }

  function handleChangeCompartilhado(e) {
    setCompartilhado(e.target.value);
  }

  function handleChangeEquipamentoSelecionado(e) {
    setEquipamentoSelecionado(e.target.value);
  }

  async function handleRegister(e) {
    e.preventDefault();

    // Check for duplicate patrimonio
    const patrimonioQuery = query(
      collection(db, "equipamentos"),
      where("patrimonio", "==", patrimonio)
    );
    const patrimonioSnapshot = await getDocs(patrimonioQuery);
    if (!idCustomer && !patrimonioSnapshot.empty) {
      toast.error("Número de patrimônio já existe!");
      return;
    }

    let equipamentoPai = null;
    if (compartilhado === "Sim") {
      const equipamentoPaiData = equipamentosPC.find(
        (equip) => equip.id === equipamentoSelecionado
      );
      equipamentoPai = equipamentoPaiData
        ? equipamentoPaiData.patrimonio
        : null;
    }

    const equipamentoData = {
      cliente: customers[customerSelected].pontoLocal,
      clienteId: customers[customerSelected].id,
      categoria: categoria,
      userId: user.uid,
      patrimonio: patrimonio,
      status: status,
      prioridade: prioridade,
      compartilhado: compartilhado === "Sim",
      equipamentoPai: equipamentoPai,
      created: new Date(),
      // New fields
      tipo: tipo,
      marca: marca,
      modelo: modelo,
      tamanho: tamanho,
      processador: processador,
      memoriaRam: memoriaRam,
      outrasCaracteristicas: outrasCaracteristicas,
      dataCompra: dataCompra,
      ultimoResponsavel: ultimoResponsavel,
    };

    if (idCustomer) {
      // Atualizando chamado
      const docRef = doc(db, "equipamentos", id);
      await updateDoc(docRef, equipamentoData)
        .then(() => {
          toast.info("Equipamento editado com sucesso!");
          setPatrimonio("");
          setCustomerSelected(0);
          navigate("/dashboard");
        })
        .catch((error) => {
          toast.error("Erro ao editar Equipamento, tente novamente!");
          console.log(error);
        });
    } else {
      // Registrando chamado
      await addDoc(collection(db, "equipamentos"), equipamentoData)
        .then(() => {
          toast.success("Chamado registrado com sucesso!");
          setPatrimonio("");
          setCustomerSelected(0);
        })
        .catch((error) => {
          toast.error("Erro ao registrar chamado, tente novamente!");
          console.log(error);
        });
    }
  }

  async function handleRetirada(equipamentoId) {
    const docRef = doc(db, "equipamentos", equipamentoId);
    await updateDoc(docRef, {
      ultimoResponsavel: user.uid,
      retiradaTimestamp: new Date(),
    })
      .then(() => {
        toast.success("Equipamento retirado com sucesso!");
        loadEquipamentos();
      })
      .catch((error) => {
        toast.error("Erro ao retirar equipamento, tente novamente!");
        console.log(error);
      });
  }

  function handleEdit(equipamentoId) {
    const equipamento = equipamentos.find((equip) => equip.id === equipamentoId);
    setEditingEquipamento(equipamento);
    setModalOpen(true);
  }

  async function handleModalSave(updatedData) {
    const docRef = doc(db, "equipamentos", editingEquipamento.id);
    await updateDoc(docRef, updatedData)
      .then(() => {
        toast.success("Equipamento atualizado com sucesso!");
        loadEquipamentos();
        setModalOpen(false);
      })
      .catch((error) => {
        toast.error("Erro ao atualizar equipamento, tente novamente!");
        console.log(error);
      });
  }

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Equipamentos">
          <FiPlusCircle size={25} />
        </Title>
        <div className="container">
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            Adicionar Equipamento
          </button>
          {showForm && (
            <form className="form-profile" onSubmit={handleRegister}>
              <label>Ponto</label>
              {loadCustomer ? (
                <input type="text" disabled={true} value={"Carregando..."} />
              ) : (
                <select
                  value={customerSelected}
                  onChange={handleChangeCustomer}
                >
                  {customers.map((item, index) => {
                    return (
                      <option key={item.id} value={index}>
                        {item.pontoLocal}
                      </option>
                    );
                  })}
                </select>
              )}
              <label>Patrimônio</label>
              <input
                type="text"
                placeholder="Digite o número do patrimônio"
                value={patrimonio}
                onChange={(e) => setPatrimonio(e.target.value)}
              />
              <label>Categoria</label>
              <select value={categoria} onChange={handleChangeSelect}>
                <option value="Não selecionada">Não selecionada</option>
                <option value="Computador">Computador</option>
                <option value="B-LINK">B-LINK</option>
                <option value="Tela/TV">Tela/TV</option>
              </select>

              {/* New fields */}
              <label>Tipo</label>
              <input
                type="text"
                placeholder="Digite o tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              />
              <label>Marca</label>
              <input
                type="text"
                placeholder="Digite a marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
              />
              <label>Modelo</label>
              <input
                type="text"
                placeholder="Digite o modelo"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
              />
              <label>Tamanho</label>
              <input
                type="text"
                placeholder="Digite o tamanho"
                value={tamanho}
                onChange={(e) => setTamanho(e.target.value)}
              />
              <label>Processador</label>
              <input
                type="text"
                placeholder="Digite o processador"
                value={processador}
                onChange={(e) => setProcessador(e.target.value)}
              />
              <label>Memória RAM</label>
              <input
                type="text"
                placeholder="Digite a memória RAM"
                value={memoriaRam}
                onChange={(e) => setMemoriaRam(e.target.value)}
              />
              <label>Outras Características</label>
              <textarea
                placeholder="Descreva outras características"
                value={outrasCaracteristicas}
                onChange={(e) => setOutrasCaracteristicas(e.target.value)}
              />
              <label>Data de Compra</label>
              <input
                type="date"
                value={dataCompra}
                onChange={(e) => setDataCompra(e.target.value)}
              />
              <label>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Em uso">Em uso</option>
                <option value="Estoque">Estoque</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Inativo">Inativo</option>
              </select>
              <label>Último Responsável</label>
              <input
                type="text"
                placeholder="Digite o último responsável"
                value={ultimoResponsavel}
                onChange={(e) => setUltimoResponsavel(e.target.value)}
              />

              {categoria !== "Não selecionada" && (
                <>
                  <div>
                    <label>Compartilhado?</label>
                    <div>
                      <select
                        value={compartilhado}
                        onChange={handleChangeCompartilhado}
                      >
                        <option value="Não">Não</option>
                        <option value="Sim">Sim</option>
                      </select>
                    </div>
                  </div>
                  {compartilhado === "Sim" && (
                    <div>
                      <label>Selecionar equipamento pai</label>
                      <div>
                        {equipamentosPC.length > 0 ? (
                          <select
                            value={equipamentoSelecionado}
                            onChange={handleChangeEquipamentoSelecionado}
                          >
                            {equipamentosPC.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.patrimonio} - {item.categoria}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p>Nenhum equipamento encontrado para esse cliente</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
              <button type="submit" className="btn-register">Registrar</button>
            </form>
          )}

          <div className="equipment-list">
            <input
              type="text"
              placeholder="Buscar por patrimônio"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <table>
              <thead>
                <tr>
                  <th>Ponto</th>
                  <th>Patrimônio</th>
                  <th>Tipo</th>
                  <th>Modelo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipamentos.map((equip) => (
                  <tr key={equip.id}>
                    <td>{equip.pontoLocal}</td>
                    <td>{equip.patrimonio}</td>
                    <td>{equip.tipo}</td>
                    <td>{equip.modelo}</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEdit(equip.id)}>Editar</button>
                      <button className="btn-retirar" onClick={() => handleRetirada(equip.id)}>Retirar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingEquipamento && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleModalSave}
          equipamento={editingEquipamento}
        />
      )}
    </div>
  );
}
