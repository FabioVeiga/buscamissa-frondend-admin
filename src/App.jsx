import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from "./Context/AuthContext";
import LoginPage from './LoginPage';
import Home from './Home';
import Igreja from './Igreja/Igreja';
import Usuario from './Usuario';
import IgrejaNovo from './Igreja/IgrejaNovo';
import IgrejaEdita from './Igreja/IgrejaEdita';
import SolicitacoesPage from './Solicitacoes';
import Contribuidores from './Contribuidores';
import PrivateRoute from './PrivateRoute'


const App = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/igreja"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Igreja />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuario"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Usuario />
            </PrivateRoute>
          }
        />
        <Route
          path="/igrejaNovo"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <IgrejaNovo />
            </PrivateRoute>
          }
        />
        <Route
          path="/igrejaEditar"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <IgrejaEdita />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitacoes"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <SolicitacoesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/contribuidores"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Contribuidores />
            </PrivateRoute>
          }
        />
      </Routes>
      
    </Router>
  );
};

export default App;
