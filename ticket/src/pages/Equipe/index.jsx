import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../services/firebaseConnection";
import './style.css';
import Header from "../../components/Header";
import Title from "../../components/Title";
import { FiUser } from "react-icons/fi";

export default function Equipe() {
    const [equipeMembers, setEquipeMembers] = useState([]);

    useEffect(() => {
        async function fetchMembersAndChamados() {
            const result = await getDocs(collection(db, "users"));
            let listaMembros = [];

            // Adiciona todos os membros à lista, incluindo os ocultos
            for (const docUser of result.docs) {
                let member = { id: docUser.id, ...docUser.data(), chamados: [] };
                listaMembros.push(member); // Adiciona o membro à lista, independente do estado de ocultação
            }

            // Pega os chamados e faz a atribuição
            const chamadosSnapshot = await getDocs(collection(db, "chamados"));
            chamadosSnapshot.forEach((chamadoDoc) => {
                const chamadoData = chamadoDoc.data();
                const tecnicoAtb = chamadoData.tecnicoAtb;

                // Encontra o membro correspondente comparando o nome do técnico
                const membroCorrespondente = listaMembros.find(member => member.nome === tecnicoAtb);

                if (membroCorrespondente) {
                    membroCorrespondente.chamados.push({ id: chamadoDoc.id, ...chamadoData });
                }
            });

            setEquipeMembers(listaMembros);
        }

        fetchMembersAndChamados();
    }, []);

    async function toggleHideUser(memberId, isCurrentlyHidden) {
        try {
            const memberRef = doc(db, "users", memberId);
            await updateDoc(memberRef, {
                isHidden: !isCurrentlyHidden  // Alterna entre ocultar e desocultar
            });

            // Atualiza a lista localmente
            setEquipeMembers(equipeMembers.map(member =>
                member.id === memberId ? { ...member, isHidden: !isCurrentlyHidden } : member
            ));
            alert(`Usuário ${isCurrentlyHidden ? 'desocultado' : 'ocultado'} com sucesso.`);
        } catch (error) {
            console.error("Erro ao ocultar/desocultar usuário: ", error);
        }
    }

    return (
        <div>
            <Header />
            <div className="content">
                <Title name="Equipe">
                    <FiUser size={25} />
                </Title>

                <div className="container container-block">
                    <div className="membros-cadastrados">
                        <ul className="listaUser">
                            {equipeMembers.map((member) => (
                                <li className="memberCard" key={member.id}>
                                    {member.avatarUrl ? (
                                        <img src={member.avatarUrl} alt={`${member.nome}'s avatar`} />
                                    ) : (
                                        <p>Sem imagem</p>
                                    )}
                                    <h3>{member.nome}</h3>
                                    <p><strong>Cargo:</strong> {member.role}</p>
                                    {Array.isArray(member.chamados) && member.chamados.length > 0 ? (
                                        <div className="chamadosList">
                                            <h4>Chamados Atribuídos:</h4>
                                            <ul>
                                                {member.chamados.map(chamado => (
                                                    <li key={chamado.id}>
                                                        <p><strong>Cliente:</strong> {chamado.cliente}</p>
                                                        <p><strong>Assunto:</strong> {chamado.assunto}</p>
                                                        <p><strong>Status:</strong> {chamado.status}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p>Nenhum chamado atribuído.</p>
                                    )}

                                    {/* Botão para ocultar/desocultar */}
                                    <button className="toggleButton" onClick={() => toggleHideUser(member.id, member.isHidden)}>
                                        {member.isHidden ? 'Desocultar' : 'Ocultar'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
