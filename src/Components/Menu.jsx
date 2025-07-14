import { useState } from "react";
import { Drawer, List, ListItem, ListItemText, Divider, Button, ListItemIcon, IconButton, Box } from "@mui/material";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChurchIcon from '@mui/icons-material/Church';
import LogoutIcon from '@mui/icons-material/Logout';
import BuildIcon from '@mui/icons-material/Build';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const drawerWidth = 250;

const Menu = ({ children }) => {
  const [open, setOpen] = useState(true); // Default aberto
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false); // Fecha o menu ao navegar (remova se quiser manter aberto)
  };

  return (
    <Box>
      <Drawer
        anchor="left"
        open={open}
        variant="persistent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            position: "relative",
          },
        }}
      >
        <div>
          {/* Botão para retrair o menu */}
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ margin: 1, float: "right" }}
            color="primary"
          >
            <ChevronLeftIcon />
          </IconButton>
          <Button sx={{ margin: 2 }} startIcon={<HomeIcon />} onClick={() => handleNavigate('/home')}>
            Home
          </Button>
          <Divider />
          <List>
            <ListItem button onClick={() => handleNavigate('/usuario')}>
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Usuário" />
            </ListItem>
            <ListItem button onClick={() => handleNavigate('/igreja')}>
              <ListItemIcon>
                <ChurchIcon />
              </ListItemIcon>
              <ListItemText primary="Igreja" />
            </ListItem>
            <ListItem button onClick={() => handleNavigate('/solicitacoes')}>
              <ListItemIcon>
                <BuildIcon />
              </ListItemIcon>
              <ListItemText primary="Solicitações" />
            </ListItem>
            <ListItem button onClick={() => handleNavigate('/contribuidores')}>
              <ListItemIcon>
                <CurrencyExchangeIcon />
              </ListItemIcon>
              <ListItemText primary="Contribuidores" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Deslogar" />
            </ListItem>
          </List>
        </div>
      </Drawer>
      {/* Botão para abrir o menu quando fechado */}
      {!open && (
        <IconButton
          onClick={() => setOpen(true)}
          sx={{ position: "fixed", top: 16, left: 16, zIndex: 1300 }}
          color="primary"
        >
          <MenuIcon />
        </IconButton>
      )}
      {/* Conteúdo principal deslocado quando menu está aberto */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: "margin 0.3s",
          marginLeft: open ? `${drawerWidth}px` : 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Menu;