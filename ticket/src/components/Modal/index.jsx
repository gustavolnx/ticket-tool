import { useState, useEffect, useContext } from "react";
import "./modal.css";
import { FiX, FiTrash } from "react-icons/fi";
import { db } from "../../services/firebaseConnection";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { AuthContext } from "../../contexts/auth";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

export default function Modal({ conteudo, close }) {
  const [expandedImage, setExpandedImage] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

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

  return (
    <div className="modal">
      <div className="container">
        <button className="close" onClick={close}>
          <FiX size={16} color="#fff" />
        </button>

        <div className="information-section">
          <h2>Detalhes do chamado</h2>
          <div className="row" style={{ marginTop: "1rem" }}>
            <span>
              Cliente: <i>{conteudo.cliente}</i>
            </span>
          </div>
          <div className="row">
            <span>
              Assunto: <i>{conteudo.assunto}</i>
            </span>
            <div className="row" style={{ marginTop: "1rem" }}>
              <span>
                Cadastrado em : <i>{conteudo.createdFormat}</i>
              </span>
            </div>
          </div>
          <div className="row">
            <span>
              Status: <i>{conteudo.status}</i>
            </span>

            <div className="row" style={{ marginTop: "1rem" }}>
              <span>
                A caminho :{" "}
                <i>
                  {conteudo.playChamado && conteudo.playChamado.timestamp
                    ? conteudo.playChamado.timestamp.replace(/ UTC.*$/, "")
                    : "Não disponível"}
                </i>
              </span>
            </div>
            <div className="row" style={{ marginTop: "1rem" }}>
              <span>
                Chegada Local:{" "}
                <i>
                  {conteudo.chegadaLocal && conteudo.chegadaLocal.timestamp
                    ? conteudo.chegadaLocal.timestamp.replace(/ UTC.*$/, "")
                    : "Não disponível"}
                </i>
              </span>
            </div>
          </div>
          <div className="row">
            <span>
              Prioridade: <i>{conteudo.prioridade}</i>
            </span>
          </div>
          <div className="row">
            <span>
              Técnico: <i>{conteudo.tecnicoAtb}</i>
            </span>
          </div>

          {conteudo.equipamento && (
            <div className="row">
              <span>
                Equipamento: <i>{conteudo.equipamento}</i>
              </span>
            </div>
          )}

          {conteudo.complemento !== "" && (
            <>
              <h3>Complemento</h3>
              <p>{conteudo.complemento}</p>
            </>
          )}

          <div className="row">
            <h3>Imagens de abertura</h3>
            {conteudo.imageUrls.length > 0 ? (
              conteudo.imageUrls.map((url, index) => (
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

          <div className="row">
            <h3>Imagem de solução</h3>
            {conteudo.imagemSolucao ? (
              <img
                src={conteudo.imagemSolucao}
                alt="Imagem da solução"
                className="round-image"
                onClick={() => handleImageClick(conteudo.imagemSolucao)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/100";
                }}
              />
            ) : (
              <p>Sem imagem</p>
            )}
          </div>

          <div className="row solution">
            <span>
              Solução: <i>{conteudo.solucaoChamado}</i>
            </span>
          </div>
          {conteudo.dataSolucao && (
            <div className="row">
              <span>Data solução: </span>
              <i>
                {new Date(
                  conteudo.dataSolucao.seconds * 1000
                ).toLocaleDateString()}
              </i>
            </div>
          )}
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
