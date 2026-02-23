import { useState } from "react";
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useAuth } from "../Context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ChurchIcon from "@mui/icons-material/Church";
import LogoutIcon from "@mui/icons-material/Logout";
import BuildIcon from "@mui/icons-material/Build";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { SIDEBAR } from "../theme";

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;
const TOP_BAR_HEIGHT = 56;
const TOP_BAR_HEIGHT_SM = 64;

const navItems = [
  { path: "/home", label: "Dashboard", icon: HomeIcon },
  { path: "/usuario", label: "Usuários", icon: AccountCircleIcon },
  { path: "/igreja", label: "Igrejas", icon: ChurchIcon },
  { path: "/solicitacoes", label: "Solicitações", icon: BuildIcon },
  { path: "/contribuidores", label: "Contribuidores", icon: CurrencyExchangeIcon },
];

const pageTitles = {
  "/home": "Dashboard",
  "/usuario": "Usuários",
  "/igreja": "Igrejas",
  "/solicitacoes": "Solicitações",
  "/contribuidores": "Contribuidores",
  "/igrejaNovo": "Nova Igreja",
  "/igrejaEditar": "Editar Igreja",
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
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
            Busca Missa
          </Typography>
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
        {navItems.map(({ path, label, icon: Icon }) => {
          const selected = location.pathname === path;
          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigate(path)}
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
                  <Icon sx={{ fontSize: 22 }} />
                </ListItemIcon>
                {(desktopOpen || isMobile) && (
                  <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 500, fontSize: "0.9375rem" }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ flex: 1 }} />
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
          <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ flex: 1, textAlign: "center" }}>
            Busca Missa
          </Typography>
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
