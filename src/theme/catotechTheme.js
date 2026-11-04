import { createTheme } from "@mui/material/styles";

const catotechTheme = createTheme({
  palette: {
    primary: {
      main: "#ff6600", // Laranja CatoTech
    },
    secondary: {
      main: "#001329", // Azul escuro
    },
    background: {
      default: "#fff7f4",
    },
  },
  typography: {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    button: { textTransform: "none" },
  },
});

export default catotechTheme;
