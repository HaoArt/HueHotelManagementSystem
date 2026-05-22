import { useState, useEffect } from "react";
import { Fab, Fade, Tooltip } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// LUXURY DESIGN TOKENS
const LUXURY = {
  charcoal: "#1A1A1A",
  navy: "#1B2D4F",
  gold: "#D4AF37",
};

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Lắng nghe sự kiện cuộn chuột
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Hàm xử lý cuộn lên đầu trang mượt mà
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Fade in={isVisible} timeout={500}>
      <Tooltip title="Lên đầu trang" placement="left">
        <Fab
          onClick={scrollToTop}
          sx={{
            position: "fixed",
            bottom: { xs: 24, md: 40 },
            right: { xs: 24, md: 40 },
            bgcolor: LUXURY.navy,
            color: LUXURY.gold,
            zIndex: 9999, // Luôn nổi lên trên cùng
            boxShadow: `0 8px 24px ${LUXURY.navy}60`,
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: LUXURY.charcoal,
              transform: "translateY(-4px)",
              boxShadow: `0 12px 32px ${LUXURY.charcoal}80`,
            },
          }}
        >
          <KeyboardArrowUpIcon fontSize="large" />
        </Fab>
      </Tooltip>
    </Fade>
  );
};

export default ScrollToTopButton;
