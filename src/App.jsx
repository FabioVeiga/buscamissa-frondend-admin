import { lazy } from 'react';
const Home = lazy(() => ('./Home'));
const LoginPage = lazy(() => ('./LoginPage'));
const Igreja = lazy(() => ('./Igreja/Igreja'));
const Usuario = lazy(() => ('./Usuario'));
const IgrejaNovo = lazy(() => ('./Igreja/IgrejaNovo'));
const IgrejaEditar = lazy(() => ('./Igreja/IgrejaEditar'));
const PrivateRoute = lazy(() => ('./PrivateRoute'));
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from "./Context/AuthContext";

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
              <IgrejaEditar />
            </PrivateRoute>
          }
        />
      </Routes>
      
    </Router>
  );
};

export default App;
