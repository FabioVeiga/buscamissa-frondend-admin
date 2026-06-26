import { Routes, Route } from 'react-router-dom';
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
    const { isAuthenticated, loading } = useAuth();

    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/home"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                        <Home />
                    </PrivateRoute>
                }
            />
            <Route
                path="/igreja"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                        <Igreja />
                    </PrivateRoute>
                }
            />
            <Route
                path="/usuario"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                        <Usuario />
                    </PrivateRoute>
                }
            />
            <Route
                path="/igrejaNovo"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                        <IgrejaNovo />
                    </PrivateRoute>
                }
            />
            <Route
                path="/igrejaEditar"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                        <IgrejaEdita />
                    </PrivateRoute>
                }
            />
            <Route
                path="/solicitacoes"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                        <SolicitacoesPage />
                    </PrivateRoute>
                }
            />
            <Route
                path="/contribuidores"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                        <Contribuidores />
                    </PrivateRoute>
                }
            />
        </Routes>
    );
};

export default App;
