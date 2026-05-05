import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#009688",
      dark: "#00796b",
      light: "#4db6ac",
      contrastText: "#fff",
    },
    secondary: {
      main: "#0b1b3f",
      dark: "#08152f",
      light: "#24406d",
      contrastText: "#fff",
    },
    background: {
      default: "#eef5f4",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
    divider: "#e2e8f0",
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Be Vietnam Pro", "Segoe UI", Roboto, Arial, sans-serif',
    h1: { fontWeight: 900, letterSpacing: "-0.04em" },
    h2: { fontWeight: 900, letterSpacing: "-0.04em" },
    h3: { fontWeight: 900, letterSpacing: "-0.03em" },
    h4: { fontWeight: 800, letterSpacing: "-0.02em" },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root": {
          colorScheme: "light",
        },
        html: {
          scrollBehavior: "smooth",
        },
        body: {
          background:
            "radial-gradient(circle at top, rgba(0,150,136,0.08), transparent 28%), linear-gradient(180deg, #f7fbfb 0%, #eef5f4 100%)",
          color: "#0f172a",
        },
        "#root": {
          minHeight: "100%",
        },
        "::-webkit-scrollbar": {
          width: 10,
          height: 10,
        },
        "::-webkit-scrollbar-track": {
          background: "#e8f1f0",
        },
        "::-webkit-scrollbar-thumb": {
          background: "#b8d4d0",
          borderRadius: 999,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 14,
          fontWeight: 700,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: "1px solid rgba(226,232,240,0.9)",
          boxShadow: "0 20px 50px rgba(15,23,42,0.08)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 20,
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "clamp(16px, 3vw, 32px)",
          paddingRight: "clamp(16px, 3vw, 32px)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 999,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          minHeight: 48,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme;
