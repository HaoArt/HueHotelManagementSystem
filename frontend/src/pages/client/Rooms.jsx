/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Container,
  FormControl,
  Select,
  MenuItem,
  Fade,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import RoomTypeService from "../../services/roomTypeService";
import SearchBar from "../../components/specific/SearchBar";
import RoomCard from "../../components/specific/RoomCard";

import DiamondIcon from "@mui/icons-material/Diamond";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const LUXURY = {
  white: "#FAFAF9",
  offwhite: "#F8F8F6",
  charcoal: "#1A1A1A",
  navy: "#1B2D4F",
  gold: "#D4AF37",
  goldLight: "#E8D4B8",
  warmGray: "#9B8B7E",
  softGray: "#D4D0C8",
};

const Rooms = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("Đề xuất");

  const location = useLocation();

  const fetchAllRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await RoomTypeService.getAllRoomTypes();
      setRoomTypes(data.data || data);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tải danh sách phòng.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchData) => {
    setLoading(true);
    setError("");
    try {
      const response = await RoomTypeService.searchRoomTypes(searchData);
      const results = response.data || response;
      setRoomTypes(results);
      setSortBy("Đề xuất");

      if (results.length === 0) {
        setError(
          "Không tìm thấy loại phòng nào phù hợp. Vui lòng thử đổi ngày hoặc giảm số người.",
        );
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tìm kiếm phòng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    if (location.state && location.state.initialSearchData) {
      handleSearch(location.state.initialSearchData);
    } else {
      fetchAllRooms();
    }
  }, [location.state]);

  useEffect(() => {
    if (roomTypes.length === 0) return;

    let sortedArray = [...roomTypes];

    if (sortBy === "Giá tăng dần") {
      sortedArray.sort(
        (a, b) => parseFloat(a.base_price) - parseFloat(b.base_price),
      );
    } else if (sortBy === "Giá giảm dần") {
      sortedArray.sort(
        (a, b) => parseFloat(b.base_price) - parseFloat(a.base_price),
      );
    } else {
      sortedArray.sort((a, b) => a.id - b.id);
    }

    setRoomTypes(sortedArray);
  }, [sortBy]);

  const getBadge = (room) => {
    if (room.available_count !== undefined && room.available_count !== null) {
      const count = Number(room.available_count);

      if (count === 0) {
        return {
          label: "Đã hết phòng",
          bgcolor: "#fef2f2",
          color: "#dc2626",
        };
      }
      if (count > 0 && count <= 2) {
        return {
          label: `Chỉ còn ${count} phòng`,
          bgcolor: "#fffbeb",
          color: "#d97706",
        };
      }
    }

    const roomName = (room.type_name || room.name || "").toLowerCase();

    if (roomName.includes("suite") || roomName.includes("vip")) {
      return {
        label: "Cao Cấp",
        icon: <DiamondIcon fontSize="small" />,
        bgcolor: LUXURY.navy,
        color: LUXURY.gold,
      };
    }
    if (roomName.includes("deluxe") || roomName.includes("premium")) {
      return {
        label: "Được Yêu Thích",
        icon: <ThumbUpIcon fontSize="small" />,
        bgcolor: `${LUXURY.gold}20`,
        color: LUXURY.gold,
      };
    }
    if (roomName.includes("family") || roomName.includes("gia đình")) {
      return {
        label: "Gia Đình",
        icon: <FamilyRestroomIcon fontSize="small" />,
        bgcolor: "#f0fdf4",
        color: "#166534",
      };
    }
    if (roomName.includes("couple")) {
      return {
        label: "Cặp Đôi",
        icon: <FavoriteIcon fontSize="small" />,
        bgcolor: "#fdf2f8",
        color: "#be185d",
      };
    }

    if (
      roomName.includes("standard") ||
      parseFloat(room.base_price) <= 500000
    ) {
      return {
        label: "Tiết Kiệm",
        icon: <LocalOfferIcon fontSize="small" />,
        bgcolor: "#eff6ff",
        color: "#1e40af",
      };
    }

    return null;
  };

  return (
    <Box sx={{ bgcolor: LUXURY.offwhite, minHeight: "100vh", pb: 12 }}>
      <Box
        sx={{
          height: { xs: "50vh", md: "60vh" },
          backgroundImage: `linear-gradient(to bottom, rgba(26,26,26,0.5), rgba(27,45,79,0.3)), url("https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=100&w=1920")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: { md: "fixed" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
          position: "relative",
          mb: { xs: 6, md: 10 },
        }}
      >
        <Container>
          <Fade in={true} timeout={1000}>
            <Box>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700,
                  letterSpacing: "1px",
                  mb: 2,
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  textShadow: "0 4px 16px rgba(0,0,0,0.4)",
                }}
              >
                Hệ Thống Phòng Nghỉ
              </Typography>
              <Typography
                variant="h6"
                component="p"
                sx={{
                  maxWidth: "700px",
                  mx: "auto",
                  fontWeight: 300,
                  opacity: 0.9,
                  lineHeight: 1.8,
                  fontSize: { xs: "1rem", md: "1.2rem" },
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                Tận hưởng không gian lưu trú đẳng cấp và tìm kiếm chốn tôn
                nghiêm hoàn hảo của bạn tại trung tâm Cố đô.
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: { xs: 4, lg: 6 },
            alignItems: "flex-start",
          }}
        >
          <Box
            sx={{
              flex: { xs: "1 1 100%", lg: "0 0 340px" },
              width: "100%",
              position: { lg: "sticky" },
              top: 100,
              bgcolor: LUXURY.white,
              borderRadius: "24px",
              border: `1px solid ${LUXURY.softGray}`,
              boxShadow: "0 20px 40px rgba(26,26,26,0.06)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                bgcolor: LUXURY.navy,
                color: LUXURY.white,
                py: 2.5,
                px: 3,
                textAlign: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 600,
                }}
              >
                Tìm Kiếm Phòng
              </Typography>
            </Box>
            <Box sx={{ p: 1 }}>
              <SearchBar onSearch={handleSearch} isSidebar={true} />
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                mb: 5,
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    color: LUXURY.charcoal,
                    mb: 1,
                  }}
                >
                  Kết Quả Tìm Kiếm
                </Typography>
                <Typography variant="body1" color={LUXURY.warmGray}>
                  Khám phá{" "}
                  <Box component="span" fontWeight="800" color={LUXURY.gold}>
                    {roomTypes.length}
                  </Box>{" "}
                  lựa chọn đẳng cấp dành riêng cho bạn
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography
                  variant="body2"
                  color={LUXURY.warmGray}
                  fontWeight="600"
                >
                  Sắp xếp:
                </Typography>
                <FormControl variant="standard">
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    disableUnderline
                    sx={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: LUXURY.navy,
                      bgcolor: LUXURY.white,
                      border: `1px solid ${LUXURY.softGray}`,
                      px: 2,
                      py: 0.8,
                      borderRadius: "12px",
                      "& .MuiSelect-select": {
                        py: 0,
                      },
                    }}
                  >
                    <MenuItem value="Đề xuất">Gợi ý từ Huế Hotel</MenuItem>
                    <MenuItem value="Giá tăng dần">
                      Giá từ thấp đến cao
                    </MenuItem>
                    <MenuItem value="Giá giảm dần">
                      Giá từ cao đến thấp
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 15 }}>
                <CircularProgress sx={{ color: LUXURY.gold }} />
              </Box>
            ) : error ? (
              <Alert
                severity="warning"
                sx={{
                  mb: 4,
                  borderRadius: "16px",
                  bgcolor: `${LUXURY.gold}15`,
                  color: LUXURY.charcoal,
                  border: `1px solid ${LUXURY.gold}40`,
                }}
              >
                {error}
              </Alert>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: { xs: 3, md: 4 },
                }}
              >
                {roomTypes.map((room, index) => {
                  const badge = getBadge(room);
                  const isSoldOut = Number(room.available_count) === 0;

                  return (
                    <Box
                      key={room.id}
                      sx={{
                        width: {
                          xs: "100%",
                          md: "calc(50% - 16px)",
                          xl: "calc(33.333% - 21.33px)",
                        },
                        display: "flex",
                        flexDirection: "column",
                        opacity: isSoldOut ? 0.7 : 1,
                        pointerEvents: isSoldOut ? "none" : "auto",
                        filter: isSoldOut ? "grayscale(80%)" : "none",
                      }}
                    >
                      <Fade in={true} timeout={400 + index * 150}>
                        <Box sx={{ height: "100%", width: "100%" }}>
                          <RoomCard
                            room={room}
                            badge={badge}
                            description={room.description || ""}
                          />
                        </Box>
                      </Fade>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Rooms;
