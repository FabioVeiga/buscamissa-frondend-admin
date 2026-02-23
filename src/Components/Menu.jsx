import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
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
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 72;

const navItems = [
  { path: "/home", label: "Home", icon: HomeIcon },
  { path: "/usuario", label: "Usuário", icon: AccountCircleIcon },
  { path: "/igreja", label: "Igreja", icon: ChurchIcon },
  { path: "/solicitacoes", label: "Solicitações", icon: BuildIcon },
  { path: "/contribuidores", label: "Contribuidores", icon: CurrencyExchangeIcon },
];

const Menu = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const drawerWidth = isMobile ? DRAWER_WIDTH : desktopOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED;

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    if (isMobile) setMobileOpen(false);
  };

  const drawerContent = (
    <>
      <Box
        sx={{
          py: 2,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: isMobile || desktopOpen ? "space-between" : "center",
          minHeight: 56,
        }}
      >
        {!isMobile && desktopOpen && (
          <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: "primary.main" }}>
            Busca Missa
          </Typography>
        )}
        {!isMobile && (
          <IconButton
            onClick={() => setDesktopOpen(!desktopOpen)}
            size="small"
            sx={{ ml: desktopOpen ? 0 : "auto" }}
            aria-label={desktopOpen ? "Recolher menu" : "Expandir menu"}
          >
            {desktopOpen ? <ChevronLeftIcon /> : <MenuOpenIcon />}
          </IconButton>
        )}
      </Box>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {navItems.map(({ path, label, icon: Icon }) => (
          <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigate(path)}
              selected={location.pathname === path}
              sx={{
                borderRadius: 2,
                py: 1.5,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                  "& .MuiListItemIcon-root": { color: "inherit" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: desktopOpen || isMobile ? 40 : 32 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              {(desktopOpen || isMobile) && <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 500 }} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: 1.5,
              color: "error.main",
              "&:hover": { bgcolor: "error.light", color: "error.contrastText" },
            }}
          >
            <ListItemIcon sx={{ minWidth: desktopOpen || isMobile ? 40 : 32 }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            {(desktopOpen || isMobile) && <ListItemText primary="Sair" primaryTypographyProps={{ fontWeight: 500 }} />}
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* AppBar apenas em mobile */}
      <AppBar
        position="fixed"
        sx={{
          display: { xs: "block", md: "none" },
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="span" fontWeight={700}>
            Busca Missa Admin
          </Typography>
          <Box sx={{ width: 40 }} />
        </Toolbar>
      </AppBar>

      {/* Drawer mobile: temporário (overlay) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            top: 0,
            left: 0,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Drawer desktop: persistente */}
      <Drawer
        variant="persistent"
        open={desktopOpen}
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            top: 0,
            left: 0,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: "hidden",
          },
        }}
      >
        <Box sx={{ pt: 1 }} />
        {drawerContent}
      </Drawer>

      {/* Área de conteúdo */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          mt: { xs: 7, md: 0 },
          minHeight: "100vh",
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1600, mx: "auto" }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default Menu;
