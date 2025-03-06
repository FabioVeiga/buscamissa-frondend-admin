import PropTypes from 'prop-types';
import { Alert } from '@mui/material';

const ErrorSpan = ({ errorMessage, severity , field = null}) => {
  let message = "";
  if(field !== null){
    message = `${field}: ${errorMessage}`
  }else{
    message = errorMessage;
  }
    return (
    <Alert severity={severity}>{message}</Alert>
    );
  };
  
  ErrorSpan.propTypes = {
    errorMessage: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        errorMessage: PropTypes.string
      }),
    ]).isRequired,
    severity: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            severity: PropTypes.string
        }),
      ]).isRequired,
  };
  

export default ErrorSpan;
