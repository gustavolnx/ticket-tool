import { useContext } from "react";
import avatarImg from "../../assets/avatar.png";
import { Link } from "react-router-dom";

import { AuthContext } from "../../contexts/auth";
import {
  FiHome,
  FiUser,
  FiSettings,
  FiThumbsUp,
  FiTrello,
  FiUserPlus,
} from "react-icons/fi";
import "./header.css";

export default function Header() {
  const { user } = useContext(AuthContext);

  return (
    <div className="sidebar">
      <div>
        <img
          src={user.avatarUrl === null ? avatarImg : user.avatarUrl}
          alt="Foto do usuário"
        />
      </div>
      <Link to="/dashboard">
        <FiTrello color="#fff" size={24} />
        Chamados
      </Link>
      <Link to="/atendidos">
        <FiThumbsUp color="#fff" size={24} />
        Atendidos
      </Link>
      <Link to="/customers">
        <FiUser color="#fff" size={24} />
        Clientes
      </Link>
      <Link to="/register">
        <FiUserPlus color="#fff" size={24} />
        Novo usuário
      </Link>
      <Link to="/profile">
        <FiSettings color="#fff" size={24} />
        Perfil
      </Link>
    </div>
  );
}
