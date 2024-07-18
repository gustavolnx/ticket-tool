import "./modal.css";
import { FiX } from "react-icons/fi";

export default function Modal({ conteudo, close }) {
  console.log("Conteúdo do modal:", conteudo); // Log para verificar o conteúdo

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
              {" "}
              Técnico: <i>{conteudo.tecnicoAtb}</i>
            </span>
          </div>

          {conteudo.complemento !== "" && (
            <>
              <h3>Complemento</h3>
              <p>{conteudo.complemento}</p>
            </>
          )}

          <div className="row">
            <h3>Imagem</h3>
            <img
              src={
                "https://firebasestorage.googleapis.com/v0/b/gestaocombo-93bb4.appspot.com/o/images%2Fdesign-a-creative-innovative-and-modern-logo-for-a-H75BbSE1RJKODujjCD1mYg-K1y2n2dSTget3_zeLOVKCg.jpeg?alt=media&token=36bc7f25-828e-4048-9e47-cf1af661a308"
              }
              alt="Imagem do chamado"
              className="chamado-image"
            />
          </div>

          <div className="row solution">
            <span>
              Solução: <i>{conteudo.solucaoChamado}</i>
            </span>
          </div>
          {conteudo.dataSolucao && ( // Renderiza apenas se dataSolucao existir
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
    </div>
  );
}
