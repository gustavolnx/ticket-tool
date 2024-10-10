import { useState, useEffect, useContext } from "react";
import "./modal.css";
import { FiX, FiTrash, FiEdit, FiCheck } from "react-icons/fi";
import { db } from "../../services/firebaseConnection";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { AuthContext } from "../../contexts/auth";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";

export default function Modal({ conteudo, close }) {
  const [expandedImage, setExpandedImage] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editField, setEditField] = useState(null);
  const [editableContent, setEditableContent] = useState(conteudo);
  const [tecnicos, setTecnicos] = useState([]);
  const [loadingTecnicos, setLoadingTecnicos] = useState(true);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const q = query(
          collection(db, "comments"),
          where("ticketId", "==", conteudo.id)
        );
        const querySnapshot = await getDocs(q);
        const commentsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsList);
      } catch (error) {
        console.error("Erro ao carregar os comentários: ", error);
      }
    };

    loadComments();
  }, [conteudo.id]);

  useEffect(() => {
    async function loadTecnicos() {
      try {
        const usersCollection = collection(db, "users");
        const querySnapshot = await getDocs(usersCollection);
        const tecnicosData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            nome: doc.data().nome,
            oculto: doc.data().isHidden || false, // Verifica se o técnico está oculto
          }))
          .filter((tec) => !tec.oculto); // Filtra os técnicos ocultos

        setTecnicos(tecnicosData);
      } catch (error) {
        console.error("Erro ao carregar técnicos:", error);
        toast.error("Erro ao carregar técnicos.");
      } finally {
        setLoadingTecnicos(false);
      }
    }

    loadTecnicos();
  }, []);

  const handleImageClick = (url) => {
    setExpandedImage(url);
  };

  const closeExpandedImage = () => {
    setExpandedImage(null);
  };

  const handleCommentSubmit = async () => {
    if (commentText.trim() === "") return;

    const newComment = {
      ticketId: conteudo.id,
      userName: user.nome,
      userRole: user.role || "Usuário",
      text: commentText,
      dateTime: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(collection(db, "comments"), newComment);
      setComments([...comments, { id: docRef.id, ...newComment }]);
      setCommentText("");
    } catch (error) {
      console.error("Erro ao enviar o comentário: ", error);
    }
  };

  const handleDeleteComment = (commentId) => {
    confirmAlert({
      title: "Confirmação de Exclusão",
      message: "Você tem certeza que deseja deletar este comentário?",
      buttons: [
        {
          label: "Sim",
          onClick: async () => {
            try {
              await deleteDoc(doc(db, "comments", commentId));
              setComments(
                comments.filter((comment) => comment.id !== commentId)
              );
            } catch (error) {
              console.error("Erro ao deletar o comentário: ", error);
            }
          },
        },
        {
          label: "Não",
          onClick: () => {},
        },
      ],
    });
  };

  const toggleEditField = (field) => {
    setEditField(editField === field ? null : field);
  };

  const handleSaveField = async (field) => {
    try {
      const ticketRef = doc(db, "chamados", conteudo.id);
      await updateDoc(ticketRef, {
        [field]: editableContent[field],
      });

      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} editado com sucesso!`);
      setEditField(null); // Sai do modo de edição
    } catch (error) {
      toast.error("Erro ao editar o campo, tente novamente!");
      console.error("Erro ao editar o campo: ", error);
    }
  };

  return (
    <div className="modal">
      <div className="container">
        <button className="close" onClick={close}>
          <FiX size={16} color="#fff" />
        </button>

        <div className="information-section">
          <h2>Detalhes do chamado</h2>

          {/* Cliente */}
          <div className="row">
            <span>
              Cliente: <i>{editableContent.cliente}</i>
            </span>
          </div>

          {/* Assunto */}
          <div className="row">
            <span>
              Assunto:{" "}
              {editField === "assunto" ? (
                <>
                  <select
                    value={editableContent.assunto}
                    onChange={(e) =>
                      setEditableContent({ ...editableContent, assunto: e.target.value })
                    }
                  >
                    <option value="Não informado">Não informado</option>
                    <option value="Acesso remoto">Acesso remoto</option>
                    <option value="Visita técnica">Visita técnica</option>
                    <option value="Troca de aparelho">Troca de aparelho</option>
                  </select>
                  <FiCheck
                    size={18}
                    color="green"
                    onClick={() => handleSaveField("assunto")}
                    className="icon-edit"
                  />
                </>
              ) : (
                <>
                  <i>{editableContent.assunto}</i>
                  <FiEdit
                    size={18}
                    color="blue"
                    onClick={() => toggleEditField("assunto")}
                    className="icon-edit"
                  />
                </>
              )}
            </span>
          </div>

          {/* Cadastrado em */}
          <div className="row">
            <span>
              Cadastrado em: <i>{editableContent.createdFormat}</i>
            </span>
          </div>

          {/* Status */}
          <div className="row">
            <span>
              Status:{" "}
              {editField === "status" ? (
                <>
                  <select
                    value={editableContent.status}
                    onChange={(e) =>
                      setEditableContent({ ...editableContent, status: e.target.value })
                    }
                  >
                    <option value="Aberto">Aberto</option>
                    <option value="Progresso">Em progresso</option>
                    <option value="Atendido">Atendido</option>
                  </select>
                  <FiCheck
                    size={18}
                    color="green"
                    onClick={() => handleSaveField("status")}
                    className="icon-edit"
                  />
                </>
              ) : (
                <>
                  <i>{editableContent.status}</i>
                  <FiEdit
                    size={18}
                    color="blue"
                    onClick={() => toggleEditField("status")}
                    className="icon-edit"
                  />
                </>
              )}
            </span>
          </div>

          {/* A caminho */}
          <div className="row">
            <span>
              A caminho:{" "}
              <i>
                {editableContent.playChamado && editableContent.playChamado.timestamp
                  ? editableContent.playChamado.timestamp.replace(/ UTC.*$/, "")
                  : "Não disponível"}
              </i>
            </span>
          </div>

          {/* Chegada Local */}
          <div className="row">
            <span>
              Chegada Local:{" "}
              <i>
                {editableContent.chegadaLocal && editableContent.chegadaLocal.timestamp
                  ? editableContent.chegadaLocal.timestamp.replace(/ UTC.*$/, "")
                  : "Não disponível"}
              </i>
            </span>
          </div>

          {/* Prioridade */}
          <div className="row">
            <span>
              Prioridade:{" "}
              {editField === "prioridade" ? (
                <>
                  <select
                    value={editableContent.prioridade}
                    onChange={(e) =>
                      setEditableContent({ ...editableContent, prioridade: e.target.value })
                    }
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                    <option value="Critica">Crítica</option>
                  </select>
                  <FiCheck
                    size={18}
                    color="green"
                    onClick={() => handleSaveField("prioridade")}
                    className="icon-edit"
                  />
                </>
              ) : (
                <>
                  <i>{editableContent.prioridade}</i>
                  <FiEdit
                    size={18}
                    color="blue"
                    onClick={() => toggleEditField("prioridade")}
                    className="icon-edit"
                  />
                </>
              )}
            </span>
          </div>

          {/* Técnico */}
          <div className="row">
            <span>
              Técnico:{" "}
              {editField === "tecnicoAtb" ? (
                <>
                  <select
                    value={editableContent.tecnicoAtb}
                    onChange={(e) =>
                      setEditableContent({ ...editableContent, tecnicoAtb: e.target.value })
                    }
                  >
                    <option value="Não atribuído">Não atribuído</option>
                    {tecnicos.map((tec) => (
                      <option key={tec.id} value={tec.nome}>
                        {tec.nome}
                      </option>
                    ))}
                  </select>
                  <FiCheck
                    size={18}
                    color="green"
                    onClick={() => handleSaveField("tecnicoAtb")}
                    className="icon-edit"
                  />
                </>
              ) : (
                <>
                  <i>{editableContent.tecnicoAtb}</i>
                  <FiEdit
                    size={18}
                    color="blue"
                    onClick={() => toggleEditField("tecnicoAtb")}
                    className="icon-edit"
                  />
                </>
              )}
            </span>
          </div>

          {/* Complemento */}
          <div className="row">
            <span>
              Complemento:{" "}
              {editField === "complemento" ? (
                <>
                  <textarea
                    value={editableContent.complemento}
                    onChange={(e) =>
                      setEditableContent({ ...editableContent, complemento: e.target.value })
                    }
                  />
                  <FiCheck
                    size={18}
                    color="green"
                    onClick={() => handleSaveField("complemento")}
                    className="icon-edit"
                  />
                </>
              ) : (
                <>
                  <i>{editableContent.complemento}</i>
                  <FiEdit
                    size={18}
                    color="blue"
                    onClick={() => toggleEditField("complemento")}
                    className="icon-edit"
                  />
                </>
              )}
            </span>
          </div>

          {/* Solução */}
          <div className="row">
            <span>
              Solução:{" "}
              {editField === "solucaoChamado" ? (
                <>
                  <input
                    type="text"
                    value={editableContent.solucaoChamado}
                    onChange={(e) =>
                      setEditableContent({ ...editableContent, solucaoChamado: e.target.value })
                    }
                  />
                  <FiCheck
                    size={18}
                    color="green"
                    onClick={() => handleSaveField("solucaoChamado")}
                    className="icon-edit"
                  />
                </>
              ) : (
                <>
                  <i>{editableContent.solucaoChamado}</i>
                  <FiEdit
                    size={18}
                    color="blue"
                    onClick={() => toggleEditField("solucaoChamado")}
                    className="icon-edit"
                  />
                </>
              )}
            </span>
          </div>

          {/* Imagens de abertura */}
          <div className="row">
            <h3>Imagens de abertura</h3>
            {editableContent.imageUrls.length > 0 ? (
              editableContent.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Imagem de abertura ${index + 1}`}
                  className="round-image"
                  onClick={() => handleImageClick(url)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/100";
                  }}
                />
              ))
            ) : (
              <p>Sem imagem</p>
            )}
          </div>

          {/* Imagem de solução */}
          <div className="row">
            <h3>Imagem de solução</h3>
            {editableContent.imagemSolucao ? (
              <img
                src={editableContent.imagemSolucao}
                alt="Imagem da solução"
                className="round-image"
                onClick={() => handleImageClick(editableContent.imagemSolucao)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/100";
                }}
              />
            ) : (
              <p>Sem imagem</p>
            )}
          </div>
        </div>

        <div className="comments-tab">
          <h3>Comentários</h3>
          <div id="comments-list">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className="comment">
                  <div className="comment-header">
                    <p>
                      <strong>
                        {comment.userName} ({comment.userRole})
                      </strong>
                    </p>
                    <button
                      className="delete-comment"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <FiTrash size={14} />
                    </button>
                  </div>
                  <p>{comment.text}</p>
                  <p>
                    <em>{new Date(comment.dateTime).toLocaleString()}</em>
                  </p>
                </div>
              ))
            ) : (
              <p>Sem comentários</p>
            )}
          </div>
          <div className="comment-box">
            <textarea
              id="comment-input"
              placeholder="Digite seu comentário"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            ></textarea>
            <button id="submit-comment" onClick={handleCommentSubmit}>
              Enviar
            </button>
          </div>
        </div>
      </div>

      {expandedImage && (
        <div className="expanded-image-modal" onClick={closeExpandedImage}>
          <div className="expanded-image-container">
            <img src={expandedImage} alt="Imagem expandida" />
            <button className="close-expanded" onClick={closeExpandedImage}>
              <FiX size={25} color="#fff" />
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
