import { addDoc, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../services/firebaseConnection";
import './style.css'
import Header from "../../components/Header";
import Title from "../../components/Title";
import { FiUser } from "react-icons/fi";


export default function Equipe() {
    const [equipeMembers, setEquipeMembers] = useState([]);

    useEffect(() => {
        async function fetchMembers() {
            const result = await getDocs(collection(db, "users"));
            let lista = [];
            result.forEach((doc) => {
                lista.push({ id: doc.id, ...doc.data() });
            });
            setEquipeMembers(lista);
        }
        fetchMembers();
    }, []);

    function deleteUser() {
        
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
                        <p>{member.role}</p>
                    </li>
                ))}
            </ul>
              </div>
            </div>
          </div>
        </div>
      );
}