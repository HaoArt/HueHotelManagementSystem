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
} from "@mui/material";
import { useLocation } from "react-router-dom";
import RoomTypeService from "../../services/roomTypeService";
import SearchBar from "../../components/specific/SearchBar";
import RoomCard from "../../components/specific/RoomCard";

// ==========================================
// IMPORT THÊM CÁC ICON Ý NGHĨA CHO BADGE
// ==========================================
import DiamondIcon from "@mui/icons-material/Diamond";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const COLORS = {
  primary: "#5e35b1", // Đồng bộ màu tím Huế Hotel
  bgLight: "#f8f9fa",
  border: "#e0e0e0",
  textMain: "#333",
  textSecondary: "#666",
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

  // ==========================================
  // HÀM TẠO BADGE CÓ Ý NGHĨA DỰA VÀO TÊN PHÒNG
  // ==========================================
  const getBadge = (room) => {
    const roomName = (room.type_name || room.name || "").toLowerCase();

    if (roomName.includes("suite") || roomName.includes("vip")) {
      return {
        label: "Cao cấp",
        icon: <DiamondIcon fontSize="small" />,
        bgcolor: "#00695c", // Xanh ngọc sang trọng
        color: "#fff",
      };
    }
    if (roomName.includes("deluxe") || roomName.includes("premium")) {
      return {
        label: "Được yêu thích",
        icon: <ThumbUpIcon fontSize="small" sx={{ color: "#d84315" }} />,
        bgcolor: "#fbe9e7", // Cam nhạt
        color: "#d84315", // Cam đậm
      };
    }
    if (roomName.includes("family") || roomName.includes("gia đình")) {
      return {
        label: "Gia đình",
        icon: <FamilyRestroomIcon fontSize="small" sx={{ color: "#2e7d32" }} />,
        bgcolor: "#e8f5e9", // Xanh lá nhạt
        color: "#2e7d32",
      };
    }
    if (roomName.includes("couple")) {
      return {
        label: "Dành cho cặp đôi",
        icon: <FavoriteIcon fontSize="small" sx={{ color: "#c2185b" }} />,
        bgcolor: "#fce4ec", // Hồng nhạt
        color: "#c2185b",
      };
    }

    // Nếu là phòng Standard hoặc giá dưới 500k thì gắn nhãn Tiết kiệm
    if (
      roomName.includes("standard") ||
      parseFloat(room.base_price) <= 500000
    ) {
      return {
        label: "Tiết kiệm",
        icon: <LocalOfferIcon fontSize="small" sx={{ color: "#1565c0" }} />,
        bgcolor: "#e3f2fd", // Xanh dương nhạt
        color: "#1565c0",
      };
    }

    return null;
  };

  return (
    <Box sx={{ bgcolor: COLORS.bgLight, minHeight: "100vh", pb: 10 }}>
      {/* KHU VỰC HERO BANNER */}
      <Box
        sx={{
          height: { xs: "40vh", md: "50vh" },
          backgroundImage: `linear-gradient(to bottom, rgba(94, 53, 177, 0.6), rgba(69, 39, 160, 0.3)), url("https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1920")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
          mb: 6,
        }}
      >
        <Container>
          <Typography
            variant="h3"
            component="h1"
            fontWeight="900"
            letterSpacing={2}
            gutterBottom
            sx={{
              textTransform: "uppercase",
              fontSize: { xs: "2rem", md: "3.5rem" },
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
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
              fontWeight: 400,
              opacity: 0.9,
              lineHeight: 1.6,
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            Tận hưởng không gian lưu trú đẳng cấp và tìm kiếm chốn tôn nghiêm
            hoàn hảo của bạn tại trung tâm Cố đô.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 4,
            alignItems: "flex-start",
          }}
        >
          {/* CỘT TRÁI: SIDEBAR TÌM KIẾM */}
          <Box
            sx={{
              flex: { xs: "1 1 100%", lg: "0 0 320px" },
              position: { lg: "sticky" },
              top: 100,
              bgcolor: "white",
              borderRadius: "12px",
              p: 0,
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            <SearchBar onSearch={handleSearch} isSidebar={true} />
          </Box>

          {/* CỘT PHẢI: DANH SÁCH PHÒNG */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* THANH TOP BAR CỦA DANH SÁCH PHÒNG */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
                borderBottom: `1px solid ${COLORS.border}`,
                pb: 2,
              }}
            >
              <Typography
                variant="body1"
                color={COLORS.textMain}
                sx={{ fontSize: "1.1rem" }}
              >
                Đã tìm thấy{" "}
                <Box component="span" fontWeight="900" color={COLORS.primary}>
                  {roomTypes.length}
                </Box>{" "}
                phòng phù hợp
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  color={COLORS.textSecondary}
                  fontWeight="bold"
                >
                  Sắp xếp theo:
                </Typography>
                <FormControl variant="standard" sx={{ minWidth: 120 }}>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    disableUnderline
                    sx={{
                      fontSize: "0.95rem",
                      fontWeight: "bold",
                      color: COLORS.primary,
                      bgcolor: "rgba(94, 53, 177, 0.08)",
                      px: 2,
                      py: 0.5,
                      borderRadius: "8px",
                    }}
                  >
                    <MenuItem value="Đề xuất">Mặc định</MenuItem>
                    <MenuItem value="Giá tăng dần">Giá tăng dần</MenuItem>
                    <MenuItem value="Giá giảm dần">Giá giảm dần</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 10 }}>
                <CircularProgress sx={{ color: COLORS.primary }} />
              </Box>
            ) : error ? (
              <Alert severity="warning" sx={{ mb: 4, borderRadius: "8px" }}>
                {error}
              </Alert>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                }}
              >
                {/* SỬ DỤNG COMPONENT ROOMCARD VÀ TRUYỀN DỮ LIỆU ĐỘNG */}
                {roomTypes.map((room) => {
                  const badge = getBadge(room); // Gọi hàm getBadge mới
                  return (
                    <RoomCard
                      key={room.id}
                      room={room}
                      badge={badge}
                      // Ưu tiên lấy description thật từ DB, không có mới dùng thẻ rỗng
                      description={room.description || ""}
                    />
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
