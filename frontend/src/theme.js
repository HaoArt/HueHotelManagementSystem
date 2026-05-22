import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const brand = {
  teal: "#009688",
  navy: "#0b1b3f",
  white: "#ffffff",
  gold: "#D4AF37", // Thêm màu gold nếu em muốn dùng ở nhiều nơi
};

const surfaces = {
  page: "#f4f7fb",
  paper: "rgba(255,255,255,0.92)",
  card: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(250,252,255,0.94) 100%)",
};

const radii = {
  xs: 10,
  sm: 12,
  md: 16,
  lg: 18,
  xl: 22,
  card: 24,
};

let theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    mode: "light",
    primary: {
      main: brand.teal,
      light: "#33ab9f",
      dark: "#00796d",
      contrastText: brand.white,
    },
    secondary: {
      main: brand.navy,
      light: "#1b2d57",
      dark: "#07122b",
      contrastText: brand.white,
    },
    success: { main: "#16a34a" },
    warning: { main: "#d97706" },
    error: { main: "#dc2626" },
    background: {
      default: surfaces.page,
      paper: surfaces.paper,
    },
    text: {
      primary: "#102349",
      secondary: "#52607a",
    },
    divider: "rgba(11,27,63,0.12)",
  },
  spacing: 8,
  shape: {
    borderRadius: radii.lg,
  },
  // ==============================================================
  // CẤU HÌNH FONT CHỮ CỐ ĐỊNH Ở ĐÂY
  // ==============================================================
  typography: {
    // Font mặc định cho toàn bộ văn bản (đoạn văn, button, label...)
    fontFamily: '"Inter", sans-serif',
    
    // Ép font Playfair Display cho toàn bộ thẻ Tiêu đề
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 800,
      fontSize: "clamp(2rem, 4.4vw, 3.15rem)",
      lineHeight: 1.14,
      letterSpacing: "-0.03em",
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 800,
      fontSize: "clamp(1.7rem, 3.5vw, 2.5rem)",
      lineHeight: 1.2,
      letterSpacing: "-0.025em",
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      fontSize: "clamp(1.4rem, 2.8vw, 2rem)",
      lineHeight: 1.25,
      letterSpacing: "-0.02em",
    },
    h4: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      fontSize: "clamp(1.2rem, 2.1vw, 1.6rem)",
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h5: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      fontSize: "1.2rem",
      lineHeight: 1.35,
      letterSpacing: "-0.005em",
    },
    h6: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      fontSize: "1.04rem",
      lineHeight: 1.4,
      letterSpacing: "-0.003em",
    },
    body1: {
      fontSize: "0.98rem",
      lineHeight: 1.68,
      letterSpacing: "0.01em",
    },
    body2: {
      fontSize: "0.9rem",
      lineHeight: 1.62,
      letterSpacing: "0.01em",
    },
    subtitle1: {
      fontWeight: 600,
      lineHeight: 1.45,
      letterSpacing: "0.01em",
    },
    subtitle2: {
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "0.01em",
    },
    button: {
      fontWeight: 600,
      fontSize: "0.92rem",
      letterSpacing: "0.01em",
      textTransform: "none",
    },
  },
  customTokens: {
    layout: {
      pageMaxWidth: 1440,
      sectionGap: { xs: 2.5, sm: 3, md: 4 },
    },
    surface: {
      glass: "rgba(255,255,255,0.78)",
      strokeSoft: "1px solid rgba(11,27,63,0.08)",
      strokeStrong: "1px solid rgba(11,27,63,0.14)",
    },
    elevation: {
      soft: "0 8px 24px rgba(11,27,63,0.08), 0 2px 10px rgba(11,27,63,0.05)",
      medium: "0 16px 34px rgba(11,27,63,0.15), 0 3px 12px rgba(0,150,136,0.16)",
      floating: "0 20px 40px rgba(11,27,63,0.2)",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root": { colorScheme: "light" },
        html: { scrollBehavior: "smooth" },
        body: {
          background: `
            radial-gradient(circle at 15% 10%, rgba(0,150,136,0.09), transparent 34%),
            radial-gradient(circle at 85% 90%, rgba(11,27,63,0.08), transparent 30%),
            linear-gradient(180deg, #f8fbff 0%, #eef3fa 52%, #f6f9fd 100%)
          `,
          color: "#102349",
          minHeight: "100vh",
          textRendering: "optimizeLegibility",
          WebkitFontSmoothing: "antialiased",
        },
        "*": { boxSizing: "border-box" },
        "::-webkit-scrollbar": { width: 10, height: 10 },
        "::-webkit-scrollbar-track": { background: "#e8edf5" },
        "::-webkit-scrollbar-thumb": {
          background: "linear-gradient(180deg, #0b1b3f 0%, #009688 100%)",
          borderRadius: 999,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(255,255,255,0.84)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 4px 20px rgba(11,27,63,0.08)",
          borderBottom: "1px solid rgba(11,27,63,0.1)",
          color: "#102349",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(11,27,63,0.06)",
        },
        rounded: { borderRadius: radii.xl },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: radii.card,
          background: surfaces.card,
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(11,27,63,0.08)",
          boxShadow: "0 8px 24px rgba(11,27,63,0.08), 0 2px 10px rgba(11,27,63,0.05)",
          transition: "transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            borderColor: "rgba(0,150,136,0.34)",
            boxShadow: "0 16px 34px rgba(11,27,63,0.15), 0 3px 12px rgba(0,150,136,0.16)",
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: radii.sm,
          paddingInline: 20,
          paddingBlock: 10,
          fontWeight: 600,
          minHeight: 42,
          lineHeight: 1.2,
          boxShadow: "none",
          transition: "transform 0.2s ease, box-shadow 0.24s ease, background-color 0.2s ease",
          "&:hover": { transform: "translateY(-1px)" },
          "&.Mui-disabled": { opacity: 0.65 },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
          boxShadow: "0 8px 18px rgba(11,27,63,0.22)",
          "&:hover": { boxShadow: "0 12px 24px rgba(11,27,63,0.3)" },
        },
        outlinedPrimary: {
          borderColor: "rgba(0,150,136,0.4)",
          color: "#00796d",
          "&:hover": {
            borderColor: "#009688",
            backgroundColor: "rgba(0,150,136,0.08)",
          },
        },
        textPrimary: {
          "&:hover": { backgroundColor: "rgba(0,150,136,0.1)" },
        },
      },
      variants: [
        {
          props: { size: "small" },
          style: { minHeight: 34, paddingInline: 14, borderRadius: radii.xs, fontSize: "0.84rem" },
        },
        {
          props: { size: "large" },
          style: { minHeight: 48, paddingInline: 24, borderRadius: radii.md, fontSize: "0.98rem" },
        },
      ],
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: { borderRadius: radii.sm, overflow: "hidden" },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputLabel-root": { color: "#6b778f" },
          "& .MuiOutlinedInput-root": {
            borderRadius: radii.md,
            background: "rgba(255,255,255,0.96)",
            "& fieldset": { borderColor: "rgba(11,27,63,0.16)" },
            "&:hover fieldset": { borderColor: "rgba(0,150,136,0.4)" },
            "&.Mui-focused fieldset": { borderColor: "#009688", borderWidth: 2 },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "linear-gradient(180deg, #0b1b3f 0%, #0f2a61 100%)",
          backdropFilter: "blur(20px)",
          color: "#ffffff",
          borderRight: "none",
          boxShadow: "8px 0 24px rgba(7,18,43,0.28)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radii.sm, fontWeight: 700, letterSpacing: "0.01em" },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: radii.card,
          border: "1px solid rgba(11,27,63,0.08)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 40px rgba(11,27,63,0.2)",
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: radii.lg,
          overflowX: "auto",
          border: "1px solid rgba(11,27,63,0.08)",
          backgroundColor: "rgba(255,255,255,0.95)",
          boxShadow: "0 8px 22px rgba(11,27,63,0.08)",
        },
      },
    },
    MuiTable: {
      styleOverrides: { root: { minWidth: 640 } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: { background: "linear-gradient(180deg, rgba(11,27,63,0.06) 0%, rgba(11,27,63,0.02) 100%)" },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: "1px solid rgba(11,27,63,0.08)", padding: "14px 16px" },
        head: {
          color: "#102349",
          fontWeight: 700,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          fontSize: "0.76rem",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 0.2s ease",
          "&:nth-of-type(even)": { backgroundColor: "rgba(11,27,63,0.015)" },
          "&:hover": { backgroundColor: "rgba(0,150,136,0.06)" },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 4, borderRadius: 999, backgroundColor: brand.teal },
        root: { minHeight: 44 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          minHeight: 48,
          fontWeight: 600,
          borderRadius: radii.xs,
          "&.Mui-selected": { color: brand.navy },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "clamp(16px, 4vw, 32px)",
          paddingRight: "clamp(16px, 4vw, 32px)",
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme, { factor: 2.2 });

export default theme;