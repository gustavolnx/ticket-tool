import './modal.css'
import {FiX} from 'react-icons/fi'
export default function Modal ({conteudo, close}){
    return(
        <div className='modal'>
          
        <div className='container'>
            <button className='close' onClick={close}>
        <FiX size={25} color='#fff'/>
        Fechar
            </button>

            <main>
                <h2>Detalhes do chamado</h2>
                <div className='row'>
                <span>Cliente: <i>{conteudo.cliente}</i></span>
          
                </div>
                <div className='row'>
                <span>Assunto: <i>{conteudo.assunto}</i></span>
                <span>Cadastrado em : <i>{conteudo.createdFormat}</i></span>
                </div>

                <div className='row'>
                <span>Status: 
                    <i className='status-badge' style={{color:"fff", backgroundColor: conteudo.status === "Aberto" ? 'rgb(53, 131, 246)' : conteudo.status === "Atendido" ? '#5cb85c' : '#ffcc00', textShadow: '1px 2px 0px #000',}}>{conteudo.status}</i>
                    </span>
                    <span>Prioridade: 
                    <i className='prioridade-badge' style={{color:"#ffffff", backgroundColor:
                              conteudo.prioridade === 'Urgente'
                                ? '#ff0000'
                                : conteudo.prioridade === 'Moderada'
                                ? '#FFCC00'
                                : '#5cb85c',
                            textShadow: '1px 2px 0px #000',
                            }}>{conteudo.prioridade}</i>
                    </span>
          
                </div>
                <div className="row">
                <span>Solução: <i>{conteudo.solucaoChamado}</i></span>

                </div>
                
                {conteudo.complemento !== '' &&(
                    <>
                
                    <h3>Complemento</h3>
                    <p>
                    {conteudo.complemento}
                    </p>
    
                    </>
                )}
              
              
            </main>
        </div>

        </div>
    )
}