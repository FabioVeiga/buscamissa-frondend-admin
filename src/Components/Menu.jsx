import {  Drawer,  List,  ListItem,  ListItemText,  Divider,  Button,ListItemIcon } from "@mui/material";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChurchIcon from '@mui/icons-material/Church';
import LogoutIcon from '@mui/icons-material/Logout';
import BuildIcon from '@mui/icons-material/Build';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';

const Menu = () => {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const handleNavigate = (path) => {
    navigate(path);
  };


  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 250,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 250,
          boxSizing: "border-box",
          position: "relative",
        },
      }}
    >
      <div>
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
  );
};
export default Menu;
