/* eslint-disable react/prop-types */
import { CircularProgress, Box } from "@mui/material";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, isAuthenticated, loading }) => {
  if (loading) {
    return (
        <Box
            sx={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
        >
          <CircularProgress />
        </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;