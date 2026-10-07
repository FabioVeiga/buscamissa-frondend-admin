/* Itens de navegação compartilhados entre o menu lateral e a busca global. */
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ChurchIcon from "@mui/icons-material/Church";
import BuildIcon from "@mui/icons-material/Build";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import EmailIcon from "@mui/icons-material/Email";
import InsightsIcon from "@mui/icons-material/Insights";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import MergeTypeIcon from "@mui/icons-material/MergeType";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import NotificationsIcon from "@mui/icons-material/Notifications";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

export const navSections = [
  {
    title: "Operação",
    items: [
      { path: "/home", label: "Dashboard", icon: HomeIcon },
      { path: "/igreja", label: "Igrejas", icon: ChurchIcon },
      { path: "/aprovacoes", label: "Aprovações Pendentes", icon: FactCheckIcon, badgeKey: "aprovacoes" },
      { path: "/responsaveis", label: "Responsáveis Verificados", icon: VerifiedUserIcon, badgeKey: "responsaveis" },
      { path: "/reportar-problema", label: "Problemas Reportados", icon: AnnouncementIcon, badgeKey: "problemas" },
      { path: "/solicitacoes", label: "Solicitações", icon: BuildIcon, badgeKey: "solicitacoes" },
      { path: "/solicitacoes-vinculo-capela", label: "Vínculos de Capela", icon: AccountBalanceIcon },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      { path: "/email-evento", label: "Divulgação", icon: EmailIcon },
      { path: "/notificacoes", label: "Notificações", icon: NotificationsIcon },
      { path: "/dioceses", label: "Dioceses", icon: AccountBalanceIcon },
      { path: "/candidatos-tipo-igreja", label: "Candidatas a Reclassificação", icon: AccountBalanceIcon },
      { path: "/mesclar-metricas", label: "Mesclar Métricas", icon: MergeTypeIcon },
    ],
  },
  {
    title: "Relatórios",
    items: [
      { path: "/indicadores", label: "Indicadores", icon: InsightsIcon },
      { path: "/contribuidores", label: "Contribuidores", icon: CurrencyExchangeIcon },
    ],
  },
  {
    title: "Sistema",
    items: [
      { path: "/usuario", label: "Usuários", icon: AccountCircleIcon },
      { path: "/feature-toggles", label: "Feature Toggles", icon: ToggleOnIcon },
    ],
  },
];
