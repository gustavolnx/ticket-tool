import logo from "../../assets/logo.png";
import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import "./signup.css";

import { AuthContext } from "../../contexts/auth";

export default function SigIn() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("tecnico"); // Default role is 'tecnico'
  // const [isAdmin, setIsAdmin] = useState(false);
  const { signUp, loadingAuth } = useContext(AuthContext);

  async function handleSubmit(e) {
    e.preventDefault();
    const isAdmin = role === "admin"; // Determine isAdmin based on role

    if (name !== "" && email !== "" && password !== "") {
      await signUp(email, password, name, isAdmin);
    }
  }

  return (
    <div className="container-center">
      <div className="login">
        <div className="login-area">
          <img src={logo} alt="logo" />
        </div>

        <form onSubmit={handleSubmit}>
          <h1>Cadastrar-se</h1>
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="email@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label htmlFor="role"></label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="tecnico">Técnico</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit">
            {loadingAuth ? "Carregando" : "Cadastrar"}
          </button>
        </form>

        <Link to="/dashboard">Voltar ao dashboard</Link>
      </div>
    </div>
  );
}
