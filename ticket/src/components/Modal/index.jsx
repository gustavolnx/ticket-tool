import { useState } from "react";
import "./modal.css";
import { FiX } from "react-icons/fi";

export default function Modal({ conteudo, close }) {
  const [expandedImage, setExpandedImage] = useState(null);

  const handleImageClick = (url) => {
    setExpandedImage(url);
  };

  const closeExpandedImage = () => {
    setExpandedImage(null);
  };

  return (
    <div className="modal">
      <div className="container">
        <button className="close" onClick={close}>
          <FiX size={25} color="#fff" />
          Fechar
        </button>

        <main>
          <h2>Detalhes do chamado</h2>
          <div className="row">
            <span>
              Cliente: <i>{conteudo.cliente}</i>
            </span>
          </div>
          <div className="row">
            <span>
              Assunto: <i>{conteudo.assunto}</i>
            </span>
            <span>
              Cadastrado em : <i>{conteudo.createdFormat}</i>
            </span>
          </div>

          <div className="row">
            <span>
              Status:
              <i
                className="status-badge"
                style={{
                  color: "#fff",
                  backgroundColor:
                    conteudo.status === "Aberto"
                      ? "rgb(53, 131, 246)"
                      : conteudo.status === "Atendido"
                      ? "#5cb85c"
                      : "#ffcc00",
                  textShadow: "1px 2px 0px #000",
                }}
              >
                {conteudo.status}
              </i>
            </span>
            <span>
              Prioridade:
              <i
                className="prioridade-badge"
                style={{
                  color: "#ffffff",
                  backgroundColor:
                    conteudo.prioridade === "Urgente"
                      ? "#ff0000"
                      : conteudo.prioridade === "Moderada"
                      ? "#FFCC00"
                      : "#5cb85c",
                  textShadow: "1px 2px 0px #000",
                }}
              >
                {conteudo.prioridade}
              </i>
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
        </main>
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
