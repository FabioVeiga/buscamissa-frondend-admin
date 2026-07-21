import { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Badge,
  Collapse,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useAuth } from "../Context/AuthContext";
import SessaoCountdown from "./SessaoCountdown";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/apiService";
import logoBM from "../assets/logoBM.svg";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ChurchIcon from "@mui/icons-material/Church";
import LogoutIcon from "@mui/icons-material/Logout";
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
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { SIDEBAR } from "../theme";

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;
const TOP_BAR_HEIGHT = 56;
const TOP_BAR_HEIGHT_SM = 64;

const navItems = [
  { path: "/home", label: "Dashboard", icon: HomeIcon },
  { path: "/usuario", label: "Usuários", icon: AccountCircleIcon },
  {
    path: "/igreja",
    label: "Igrejas",
    icon: ChurchIcon,
    children: [
      { path: "/aprovacoes", label: "Aprovações Pendentes", icon: FactCheckIcon, badgeKey: "aprovacoes" },
      { path: "/responsaveis", label: "Responsáveis Verificados", icon: VerifiedUserIcon, badgeKey: "responsaveis" },
      { path: "/reportar-problema", label: "Problemas Reportados", icon: AnnouncementIcon, badgeKey: "problemas" },
      { path: "/mesclar-metricas", label: "Mesclar Métricas", icon: MergeTypeIcon },
      { path: "/email-evento", label: "Divulgação", icon: EmailIcon },
    ],
  },
  { path: "/dioceses", label: "Dioceses", icon: AccountBalanceIcon },
  { path: "/notificacoes", label: "Notificações", icon: NotificationsIcon },
  { path: "/solicitacoes", label: "Solicitações", icon: BuildIcon, badgeKey: "solicitacoes" },
  { path: "/contribuidores", label: "Contribuidores", icon: CurrencyExchangeIcon },
  { path: "/indicadores", label: "Indicadores", icon: InsightsIcon },
  {
    label: "Configurações",
    icon: SettingsIcon,
    children: [
      { path: "/feature-toggles", label: "Feature Toggles", icon: ToggleOnIcon },
    ],
  },
];

const pageTitles = {
  "/home": "Dashboard",
  "/usuario": "Usuários",
  "/igreja": "Igrejas",
  "/aprovacoes": "Aprovações Pendentes",
  "/reportar-problema": "Problemas Reportados",
  "/mesclar-metricas": "Mesclar Métricas",
  "/solicitacoes": "Solicitações",
  "/contribuidores": "Contribuidores",
  "/igrejaNovo": "Nova Igreja",
  "/igrejaEditar": "Editar Igreja",
  "/email-evento": "Divulgação das Igrejas",
  "/indicadores": "Indicadores",
  "/feature-toggles": "Feature Toggles",
  "/dioceses": "Arquidioceses e Dioceses",
  "/notificacoes": "Notificações",
  "/responsaveis": "Responsáveis Verificados",
};

const Menu = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const drawerWidth = isMobile ? DRAWER_WIDTH : desktopOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED;
  const pageTitle = pageTitles[location.pathname] || "Busca Missa Admin";

  const [openSubmenus, setOpenSubmenus] = useState({});

  useEffect(() => {
    const parentComRotaAtiva = navItems.find((item) =>
      item.children?.some((child) => child.path === location.pathname)
    );
    if (parentComRotaAtiva) {
      setOpenSubmenus((prev) => ({ ...prev, [parentComRotaAtiva.label]: true }));
    }
  }, [location.pathname]);

  const toggleSubmenu = (label) => {
    setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const [pendingCounts, setPendingCounts] = useState({
    aprovacoes: 0,
    problemas: 0,
    solicitacoes: 0,
    responsaveis: 0,
  });

  useEffect(() => {
    const paginacaoUnica = { "Paginacao.PageIndex": 1, "Paginacao.PageSize": 1 };

    api
      .get("/api/v1/Aprovacao/pendentes", { params: paginacaoUnica })
      .then((response) => {
        const data = response.data?.data || response.data;
        setPendingCounts((prev) => ({ ...prev, aprovacoes: data?.totalItems ?? 0 }));
      })
      .catch(() => {});

    api
      .get("/api/v1/Admin/igreja/reportar-problema", {
        params: { Resolvido: false, ...paginacaoUnica },
      })
      .then((response) => {
        const data = response.data?.data || response.data;
        setPendingCounts((prev) => ({ ...prev, problemas: data?.totalItems ?? 0 }));
      })
      .catch(() => {});

    api
      .get("/api/v1/admin/responsaveis/pendentes")
      .then((response) => {
        const total = Array.isArray(response.data?.data) ? response.data.data.length : 0;
        setPendingCounts((prev) => ({ ...prev, responsaveis: total }));
      })
      .catch(() => {});

    api
      .get("/api/v1/Admin/solicitacao", { params: { resolvida: false } })
      .then((response) => {
        const total = Array.isArray(response.data?.data) ? response.data.data.length : 0;
        setPendingCounts((prev) => ({ ...prev, solicitacoes: total }));
      })
      .catch(() => {});
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    if (isMobile) setMobileOpen(false);
  };

  const drawerPaperSx = {
    width: drawerWidth,
    boxSizing: "border-box",
    top: 0,
    left: 0,
    backgroundColor: SIDEBAR.bg,
    color: SIDEBAR.text,
    borderRight: "none",
    boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
  };

  const drawerContent = (
    <>
      <Box
        sx={{
          height: TOP_BAR_HEIGHT,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: isMobile || desktopOpen ? "space-between" : "center",
        }}
      >
        {(!isMobile && desktopOpen) && (
          <img src={logoBM} alt="Busca Missa" style={{ height: 32, width: "auto" }} />
        )}
        {!isMobile && (
          <IconButton
            onClick={() => setDesktopOpen(!desktopOpen)}
            size="small"
            sx={{ color: SIDEBAR.textMuted, "&:hover": { color: "#fff", bgcolor: SIDEBAR.bgHover } }}
            aria-label={desktopOpen ? "Recolher menu" : "Expandir menu"}
          >
            {desktopOpen ? <ChevronLeftIcon /> : <MenuOpenIcon />}
          </IconButton>
        )}
      </Box>
      <List sx={{ px: 1.5, py: 0 }}>
        {navItems.map(({ path, label, icon: Icon, badgeKey, children: childItems }) => {
          const selected = !!path && location.pathname === path;
          const badgeCount = badgeKey ? pendingCounts[badgeKey] : 0;
          const showLabels = desktopOpen || isMobile;
          const hasChildren = !!childItems?.length;
          const isOpen = hasChildren && !!openSubmenus[label];
          const childBadgeTotal = hasChildren
            ? childItems.reduce((total, child) => total + (child.badgeKey ? pendingCounts[child.badgeKey] || 0 : 0), 0)
            : 0;

          const handleItemClick = () => {
            if (hasChildren && !showLabels && !isMobile) {
              // Sidebar recolhida: expandir para mostrar o submenu.
              setDesktopOpen(true);
              setOpenSubmenus((prev) => ({ ...prev, [label]: true }));
              return;
            }
            if (hasChildren) {
              toggleSubmenu(label);
            }
            if (path) {
              handleNavigate(path);
            }
          };

          return (
            <Box key={label}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={handleItemClick}
                  selected={selected}
                  sx={{
                    borderRadius: 2,
                    py: 1.25,
                    px: 1.5,
                    color: SIDEBAR.text,
                    ...(selected && {
                      backgroundColor: SIDEBAR.bgActive,
                      color: "#fff",
                      borderLeft: "3px solid",
                      borderLeftColor: SIDEBAR.borderActive,
                      "& .MuiListItemIcon-root": { color: "#fff" },
                    }),
                    "&:hover": {
                      backgroundColor: selected ? SIDEBAR.bgActive : SIDEBAR.bgHover,
                    },
                    "&.Mui-selected": { "&:hover": { backgroundColor: SIDEBAR.bgActive } },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: desktopOpen || isMobile ? 40 : 36 }}>
                    <Badge badgeContent={badgeCount || childBadgeTotal} color="error" max={99} invisible={!badgeCount && !childBadgeTotal}>
                      <Icon sx={{ fontSize: 22 }} />
                    </Badge>
                  </ListItemIcon>
                  {showLabels && (
                    <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 500, fontSize: "0.9375rem" }} />
                  )}
                  {showLabels && hasChildren && (isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />)}
                </ListItemButton>
              </ListItem>

              {hasChildren && showLabels && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {childItems.map((child) => {
                      const childSelected = location.pathname === child.path;
                      const childBadgeCount = child.badgeKey ? pendingCounts[child.badgeKey] : 0;
                      const ChildIcon = child.icon;
                      return (
                        <ListItem key={child.path} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton
                            onClick={() => handleNavigate(child.path)}
                            selected={childSelected}
                            sx={{
                              borderRadius: 2,
                              py: 1,
                              px: 1.5,
                              color: SIDEBAR.text,
                              ...(childSelected && {
                                backgroundColor: SIDEBAR.bgActive,
                                color: "#fff",
                                borderLeft: "3px solid",
                                borderLeftColor: SIDEBAR.borderActive,
                                "& .MuiListItemIcon-root": { color: "#fff" },
                              }),
                              "&:hover": {
                                backgroundColor: childSelected ? SIDEBAR.bgActive : SIDEBAR.bgHover,
                              },
                              "&.Mui-selected": { "&:hover": { backgroundColor: SIDEBAR.bgActive } },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Badge badgeContent={childBadgeCount} color="error" max={99} invisible={!childBadgeCount}>
                                <ChildIcon sx={{ fontSize: 20 }} />
                              </Badge>
                            </ListItemIcon>
                            <ListItemText primary={child.label} primaryTypographyProps={{ fontWeight: 500, fontSize: "0.875rem" }} />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>
      <Box sx={{ flex: 1 }} />
      {(desktopOpen || isMobile) && (
        <Box sx={{ px: 2, pt: 1 }}>
          <SessaoCountdown />
        </Box>
      )}
      <List sx={{ px: 1.5, py: 1, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: 1.25,
              px: 1.5,
              color: "rgba(255,255,255,0.85)",
              "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#fca5a5" },
            }}
          >
            <ListItemIcon sx={{ minWidth: desktopOpen || isMobile ? 40 : 36 }}>
              <LogoutIcon sx={{ fontSize: 22 }} />
            </ListItemIcon>
            {(desktopOpen || isMobile) && (
              <ListItemText primary="Sair" primaryTypographyProps={{ fontWeight: 500, fontSize: "0.9375rem" }} />
            )}
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        sx={{
          display: { xs: "block", md: "none" },
          zIndex: (t) => t.zIndex.drawer + 1,
          backgroundColor: SIDEBAR.bg,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: { xs: TOP_BAR_HEIGHT, sm: TOP_BAR_HEIGHT_SM }, px: { xs: 1, sm: 2 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            sx={{ minWidth: 48, minHeight: 48, mr: 1 }}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <img src={logoBM} alt="Busca Missa" style={{ height: 28, width: "auto" }} />
          <Box sx={{ minWidth: 48 }} />
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
          disableScrollLock: false,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            ...drawerPaperSx,
            width: "min(260px, 85vw)",
            boxSizing: "border-box",
            top: 0,
            left: 0,
            zIndex: (t) => t.zIndex.drawer,
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "auto" }}>
          {drawerContent}
        </Box>
      </Drawer>

      <Drawer
        variant="persistent"
        open={true}
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            ...drawerPaperSx,
            position: "fixed",
            height: "100vh",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: "hidden",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>{drawerContent}</Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          pt: { xs: `${TOP_BAR_HEIGHT}px`, sm: `${TOP_BAR_HEIGHT_SM}px`, md: 0 },
        }}
      >
        <Box
          sx={{
            height: TOP_BAR_HEIGHT,
            flexShrink: 0,
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            px: 3,
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" fontWeight={600} color="text.primary">
            {pageTitle}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            p: 2,
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default Menu;
