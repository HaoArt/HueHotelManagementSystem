// src/components/specific/SearchBar.jsx
import { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  InputAdornment,
  Button,
  Typography,
  Stack,
  Box,
} from "@mui/material";

// Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HotelIcon from "@mui/icons-material/Hotel";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import RoomTypeService from "../../services/roomTypeService";

// LUXURY DESIGN TOKENS (Đồng bộ với Home & Rooms)
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

const SearchBar = ({ onSearch, isSidebar = false }) => {
  const [searchData, setSearchData] = useState({
    checkIn: "",
    checkOut: "",
    roomType: "all",
    capacity: 1,
  });

  const [dbRoomTypes, setDbRoomTypes] = useState([]);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await RoomTypeService.getAllRoomTypes();
        setDbRoomTypes(res.data || res);
      } catch (error) {
        console.error("Lỗi tải danh sách loại phòng cho SearchBar:", error);
      }
    };
    fetchRoomTypes();
  }, []);

  const handleChange = (e) => {
    setSearchData({ ...searchData, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchData);
    }
  };

  // Style chung cho ô nhập liệu chuẩn 5 sao
  const luxuryInputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      bgcolor: LUXURY.white,
      transition: "all 0.3s ease",
      "& fieldset": { borderColor: LUXURY.softGray, borderWidth: "1px" },
      "&:hover fieldset": { borderColor: LUXURY.gold },
      "&.Mui-focused fieldset": {
        borderColor: LUXURY.gold,
        borderWidth: "2px",
      },
    },
    "& .MuiInputLabel-root": { color: LUXURY.warmGray },
    "& .MuiInputLabel-root.Mui-focused": {
      color: LUXURY.gold,
      fontWeight: "bold",
    },
  };

  // ============================================================
  // GIAO DIỆN 1: DẠNG DỌC (DÙNG LÀM SIDEBAR CHO TRANG ROOMS)
  // ============================================================
  if (isSidebar) {
    return (
      <Box sx={{ p: { xs: 1, md: 2 } }}>
        {/* Đã bỏ đi Header TÌM KIẾM thừa vì file Rooms.jsx đã có Header Navy bao bọc */}
        <form onSubmit={handleSearch}>
          <Stack spacing={2.5}>
            <Box>
              <Typography
                variant="caption"
                fontWeight="800"
                color={LUXURY.charcoal}
                display="block"
                mb={0.8}
                letterSpacing={0.5}
              >
                NGÀY NHẬN PHÒNG
              </Typography>
              <TextField
                fullWidth
                type="date"
                name="checkIn"
                size="medium"
                value={searchData.checkIn}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={luxuryInputStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthIcon sx={{ color: LUXURY.gold }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                fontWeight="800"
                color={LUXURY.charcoal}
                display="block"
                mb={0.8}
                letterSpacing={0.5}
              >
                NGÀY TRẢ PHÒNG
              </Typography>
              <TextField
                fullWidth
                type="date"
                name="checkOut"
                size="medium"
                value={searchData.checkOut}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={luxuryInputStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthIcon sx={{ color: LUXURY.gold }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                fontWeight="800"
                color={LUXURY.charcoal}
                display="block"
                mb={0.8}
                letterSpacing={0.5}
              >
                LOẠI PHÒNG
              </Typography>
              <TextField
                select
                fullWidth
                name="roomType"
                size="medium"
                value={searchData.roomType}
                onChange={handleChange}
                sx={luxuryInputStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HotelIcon sx={{ color: LUXURY.gold }} />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="all" sx={{ fontWeight: 600 }}>
                  Tất cả loại phòng
                </MenuItem>
                {dbRoomTypes.map((type) => (
                  <MenuItem key={type.id} value={type.type_name}>
                    {type.type_name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box>
              <Typography
                variant="caption"
                fontWeight="800"
                color={LUXURY.charcoal}
                display="block"
                mb={0.8}
                letterSpacing={0.5}
              >
                SỐ KHÁCH
              </Typography>
              <TextField
                select
                fullWidth
                name="capacity"
                size="medium"
                value={searchData.capacity}
                onChange={handleChange}
                sx={luxuryInputStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PeopleAltOutlinedIcon sx={{ color: LUXURY.gold }} />
                    </InputAdornment>
                  ),
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <MenuItem key={num} value={num}>
                    Tối đa {num} Người
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                color: LUXURY.white,
                fontWeight: "800",
                py: 1.8,
                mt: 2,
                borderRadius: "12px",
                fontSize: "1.05rem",
                letterSpacing: "1px",
                boxShadow: `0 8px 24px ${LUXURY.gold}40`,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 32px ${LUXURY.gold}60`,
                },
              }}
            >
              TÌM PHÒNG NGAY
            </Button>
          </Stack>
        </form>
      </Box>
    );
  }

  // ============================================================
  // GIAO DIỆN 2: DẠNG NGANG NỔI LÊN (DÙNG CHO TRANG CHỦ HOME)
  // ============================================================
  return (
    <Box sx={{ p: { xs: 1, md: 1 }, width: "100%" }}>
      <form onSubmit={handleSearch}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2.5,
            alignItems: { xs: "stretch", md: "flex-end" },
            width: "100%",
          }}
        >
          {/* CHECK IN */}
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography
              variant="caption"
              fontWeight="800"
              color={LUXURY.charcoal}
              display="block"
              mb={0.8}
              letterSpacing={0.5}
              px={0.5}
            >
              NGÀY NHẬN PHÒNG
            </Typography>
            <TextField
              fullWidth
              type="date"
              name="checkIn"
              size="medium"
              value={searchData.checkIn}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{ ...luxuryInputStyle, bgcolor: LUXURY.offwhite }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon sx={{ color: LUXURY.gold }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* CHECK OUT */}
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography
              variant="caption"
              fontWeight="800"
              color={LUXURY.charcoal}
              display="block"
              mb={0.8}
              letterSpacing={0.5}
              px={0.5}
            >
              NGÀY TRẢ PHÒNG
            </Typography>
            <TextField
              fullWidth
              type="date"
              name="checkOut"
              size="medium"
              value={searchData.checkOut}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{ ...luxuryInputStyle, bgcolor: LUXURY.offwhite }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon sx={{ color: LUXURY.gold }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* ROOM TYPE */}
          <Box sx={{ flex: 1.2, minWidth: 220 }}>
            <Typography
              variant="caption"
              fontWeight="800"
              color={LUXURY.charcoal}
              display="block"
              mb={0.8}
              letterSpacing={0.5}
              px={0.5}
            >
              LOẠI PHÒNG
            </Typography>
            <TextField
              select
              fullWidth
              name="roomType"
              size="medium"
              value={searchData.roomType}
              onChange={handleChange}
              sx={{ ...luxuryInputStyle, bgcolor: LUXURY.offwhite }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HotelIcon sx={{ color: LUXURY.gold }} />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="all" sx={{ fontWeight: 600 }}>
                Tất cả loại phòng
              </MenuItem>
              {dbRoomTypes.map((type) => (
                <MenuItem key={type.id} value={type.type_name}>
                  {type.type_name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* CAPACITY */}
          <Box sx={{ flex: 0.8, minWidth: 160 }}>
            <Typography
              variant="caption"
              fontWeight="800"
              color={LUXURY.charcoal}
              display="block"
              mb={0.8}
              letterSpacing={0.5}
              px={0.5}
            >
              SỐ KHÁCH
            </Typography>
            <TextField
              select
              fullWidth
              name="capacity"
              size="medium"
              value={searchData.capacity}
              onChange={handleChange}
              sx={{ ...luxuryInputStyle, bgcolor: LUXURY.offwhite }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PeopleAltOutlinedIcon sx={{ color: LUXURY.gold }} />
                  </InputAdornment>
                ),
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <MenuItem key={num} value={num}>
                  Tối đa {num} Người
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* BUTTON */}
          <Box sx={{ flex: "0 0 160px", minWidth: 160, mt: { xs: 2, md: 0 } }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                color: LUXURY.white,
                fontWeight: "800",
                height: "56px",
                borderRadius: "12px",
                fontSize: "1rem",
                letterSpacing: "0.5px",
                boxShadow: `0 8px 24px ${LUXURY.gold}40`,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 32px ${LUXURY.gold}60`,
                },
              }}
            >
              TÌM KIẾM
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default SearchBar;
