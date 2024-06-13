import { Routes, Route } from "react-router-dom";

import SigIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Private from "./Private";
import Costumers from "../pages/Customers";
import New from "../pages/New";
import Atendidos from "../pages/Atendidos";

function RoutesApp() {
  return (
    <Routes>
      <Route path="/" element={<SigIn />} />
      <Route path="/register" element={<SignUp />} />

      <Route
        path="/dashboard"
        element={
          <Private>
            <Dashboard />
          </Private>
        }
      />
      <Route
        path="/profile"
        element={
          <Private>
            <Profile />
          </Private>
        }
      />
      <Route
        path="/customers"
        element={
          <Private>
            <Costumers />
          </Private>
        }
      />
      <Route
        path="/new"
        element={
          <Private>
            <New />
          </Private>
        }
      />
      <Route
        path="/new/:id"
        element={
          <Private>
            <New />
          </Private>
        }
      />
      <Route
        path="/atendidos"
        element={
          <Private>
            <Atendidos />
          </Private>
        }
      />
    </Routes>
  );
}

export default RoutesApp;
