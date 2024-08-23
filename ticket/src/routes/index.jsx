import { Routes, Route } from "react-router-dom";

import SigIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Private from "./Private";
import Costumers from "../pages/Customers";
import New from "../pages/New";
import Atendidos from "../pages/Atendidos";
import Equipamentos from "../pages/Equipamentos";
import Newchecking from "../pages/Newchecking";
import Checking from "../pages/Checking";

function RoutesApp() {
  return (
    <Routes>
      <Route path="/" element={<SigIn />} />
      <Route
        path="/register"
        element={
          <Private>
            <SignUp />
          </Private>
        }
      />

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
        path="/newchecking/"
        element={
          <Private>
            <Newchecking />
          </Private>
        }
      />
      <Route
        path="/newchecking/:id"
        element={
          <Private>
            <Newchecking />
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
      <Route
        path="/equipamentos"
        element={
          <Private>
            <Equipamentos />
          </Private>
        }
      />
      <Route
        path="/checking"
        element={
          <Private>
            <Checking />
          </Private>
        }
      />
    </Routes>
  );
}

export default RoutesApp;
