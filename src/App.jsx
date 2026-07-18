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
import EmailEventoPage from './EmailEvento/EmailEvento';
import Indicadores from './Indicadores/Indicadores';
import Aprovacoes from './Aprovacoes/Aprovacoes';
import ReportarProblemaPage from './ReportarProblema/ReportarProblema';
import MesclarMetricas from './Igreja/MesclarMetricas';
import FeatureTogglesPage from './FeatureToggles';
import DiocesesPage from './Dioceses';
import ResponsaveisPage from './Responsaveis';
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
            <Route
                path="/email-evento"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                        <EmailEventoPage />
                    </PrivateRoute>
                }
            />
            <Route
                path="/indicadores"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                        <Indicadores />
                    </PrivateRoute>
                }
            />
            <Route
                path="/aprovacoes"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                        <Aprovacoes />
                    </PrivateRoute>
                }
            />
            <Route
                path="/reportar-problema"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                        <ReportarProblemaPage />
                    </PrivateRoute>
                }
            />
            <Route
                path="/mesclar-metricas"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                        <MesclarMetricas />
                    </PrivateRoute>
                }
            />
            <Route
                path="/feature-toggles"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                        <FeatureTogglesPage />
                    </PrivateRoute>
                }
            />
            <Route
                path="/responsaveis"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                        <ResponsaveisPage />
                    </PrivateRoute>
                }
            />
            <Route
                path="/dioceses"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                        <DiocesesPage />
                    </PrivateRoute>
                }
            />
        </Routes>
    );
};

export default App;
