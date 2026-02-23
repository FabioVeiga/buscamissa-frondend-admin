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

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 68;

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
          py: 1.5,
          px: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: isMobile || desktopOpen ? "space-between" : "center",
          minHeight: 52,
        }}
      >
        {!isMobile && desktopOpen && (
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, color: "primary.main", letterSpacing: "-0.02em" }}>
            Busca Missa
          </Typography>
        )}
        {!isMobile && (
          <IconButton
            onClick={() => setDesktopOpen(!desktopOpen)}
            size="small"
            sx={{ ml: desktopOpen ? 0 : "auto", color: "text.secondary" }}
            aria-label={desktopOpen ? "Recolher menu" : "Expandir menu"}
          >
            {desktopOpen ? <ChevronLeftIcon fontSize="small" /> : <MenuOpenIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>
      <Divider sx={{ opacity: 0.6 }} />
      <List sx={{ px: 1, py: 0.5 }}>
        {navItems.map(({ path, label, icon: Icon }) => (
          <ListItem key={path} disablePadding sx={{ mb: 0.25 }}>
            <ListItemButton
              onClick={() => handleNavigate(path)}
              selected={location.pathname === path}
              sx={{
                borderRadius: 1.5,
                py: 1.25,
                px: 1.5,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                  "& .MuiListItemIcon-root": { color: "inherit" },
                },
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: desktopOpen || isMobile ? 36 : 28 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              {(desktopOpen || isMobile) && (
                <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 500, variant: "body2" }} />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ opacity: 0.6 }} />
      <List sx={{ px: 1, py: 0.5 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1.5,
              py: 1.25,
              px: 1.5,
              color: "error.main",
              "&:hover": { bgcolor: "error.light", color: "error.contrastText" },
            }}
          >
            <ListItemIcon sx={{ minWidth: desktopOpen || isMobile ? 36 : 28 }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            {(desktopOpen || isMobile) && (
              <ListItemText primary="Sair" primaryTypographyProps={{ fontWeight: 500, variant: "body2" }} />
            )}
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

      {/* Área de conteúdo – próxima ao sidebar */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          mt: { xs: 7, md: 0 },
          minHeight: "100vh",
          transition: theme.transitions.create(["width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          bgcolor: "background.default",
          borderLeft: { md: "1px solid" },
          borderColor: { md: "rgba(0,0,0,0.06)" },
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            pl: { md: 2.5 },
            pr: { md: 2.5 },
            maxWidth: 1400,
            width: "100%",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Menu;
