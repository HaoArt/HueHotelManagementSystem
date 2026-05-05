/* eslint-disable react-hooks/set-state-in-effect */
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

// Import Component RoomCard
import RoomCard from "../../components/specific/RoomCard";

// Icons cho Badge
import StarIcon from "@mui/icons-material/Star";
import DiamondIcon from "@mui/icons-material/Diamond";

const COLORS = {
  primary: "#4a148c",
  bgLight: "#f8f9fa",
  border: "#e0e0e0",
  textMain: "#333",
  textSecondary: "#666",
  chipPopular: "#e3f2fd",
  chipLuxury: "#00695c",
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

  // Hàm mô phỏng tạo mô tả ngắn dựa trên tên phòng để UI đẹp như thiết kế
  const generateDescription = (roomName) => {
    if (roomName.toLowerCase().includes("suite"))
      return "Đỉnh cao của sự sang trọng với phòng khách riêng biệt, thiết kế hoàng gia đương đại và đặc quyền...";
    if (roomName.toLowerCase().includes("river"))
      return "Tận hưởng khung cảnh lãng mạn của dòng sông Hương trong không gian rộng rãi, thoáng đãng v...";
    return "Không gian nghỉ dưỡng tinh tế với tầm nhìn bao quát thành phố, trang bị nội thất hiện đại và bồn...";
  };

  // Hàm random badge (Phổ biến/Cao cấp) cho đẹp UI giống thiết kế
  const getBadge = (index, roomName) => {
    if (roomName.toLowerCase().includes("suite")) {
      return {
        label: "Cao cấp",
        icon: <DiamondIcon fontSize="small" />,
        bgcolor: COLORS.chipLuxury,
        color: "#fff",
      };
    }
    if (index === 0) {
      return {
        label: "Phổ biến",
        icon: <StarIcon fontSize="small" sx={{ color: "#1976d2" }} />,
        bgcolor: COLORS.chipPopular,
        color: "#1976d2",
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
          backgroundImage: `linear-gradient(to bottom, rgba(74, 20, 140, 0.7), rgba(49, 27, 146, 0.85)), url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600")`,
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
            fontWeight="800"
            letterSpacing={2}
            gutterBottom
            sx={{
              textTransform: "uppercase",
              fontSize: { xs: "2rem", md: "3rem" },
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
              lineHeight: 1.5,
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
              borderRadius: "8px",
              p: 0,
              border: `1px solid ${COLORS.border}`,
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
                mb: 3,
                borderBottom: `1px solid ${COLORS.border}`,
                pb: 2,
              }}
            >
              <Typography variant="body1" color={COLORS.textMain}>
                Hiển thị{" "}
                <Box component="span" fontWeight="bold">
                  {roomTypes.length}
                </Box>{" "}
                phòng phù hợp
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" color={COLORS.textSecondary}>
                  Sắp xếp:
                </Typography>
                <FormControl variant="standard" sx={{ minWidth: 100 }}>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    disableUnderline
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      color: COLORS.primary,
                    }}
                  >
                    <MenuItem value="Đề xuất">Đề xuất</MenuItem>
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
              <Alert severity="warning" sx={{ mb: 4, borderRadius: "4px" }}>
                {error}
              </Alert>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                }}
              >
                {/* SỬ DỤNG COMPONENT ROOMCARD */}
                {roomTypes.map((room, index) => {
                  const badge = getBadge(index, room.type_name);
                  return (
                    <RoomCard
                      key={room.id}
                      room={room}
                      badge={badge}
                      description={generateDescription(room.type_name)}
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
