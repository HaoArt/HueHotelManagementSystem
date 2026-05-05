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
  Grid,
  Divider,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HotelIcon from "@mui/icons-material/Hotel";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import RoomTypeService from "../../services/roomTypeService";

// Theme Colors đồng bộ với toàn hệ thống
const COLORS = {
  primary: "#5e35b1", // Tím chủ đạo
  primaryDark: "#4527a0",
  border: "#e0e0e0",
  textMain: "#333333",
  textSecondary: "#666666",
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

  // Custom style chung cho TextField để bo góc mượt mà
  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      bgcolor: "white",
    },
  };

  // ============================================================
  // GIAO DIỆN 1: DẠNG DỌC (DÙNG LÀM SIDEBAR CHO TRANG ROOMS)
  // ============================================================
  if (isSidebar) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            color: COLORS.primary,
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <SearchIcon /> TÌM KIẾM
        </Typography>
        <Divider sx={{ mb: 3, borderColor: COLORS.border }} />

        <form onSubmit={handleSearch}>
          <Stack spacing={2.5}>
            <Box>
              <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                display="block"
                mb={0.5}
                letterSpacing={0.5}
              >
                NGÀY NHẬN PHÒNG
              </Typography>
              <TextField
                fullWidth
                type="date"
                name="checkIn"
                size="small"
                value={searchData.checkIn}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={textFieldStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                display="block"
                mb={0.5}
                letterSpacing={0.5}
              >
                NGÀY TRẢ PHÒNG
              </Typography>
              <TextField
                fullWidth
                type="date"
                name="checkOut"
                size="small"
                value={searchData.checkOut}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={textFieldStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                display="block"
                mb={0.5}
                letterSpacing={0.5}
              >
                LOẠI PHÒNG
              </Typography>
              <TextField
                select
                fullWidth
                name="roomType"
                size="small"
                value={searchData.roomType}
                onChange={handleChange}
                sx={textFieldStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HotelIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="all">Tất cả loại phòng</MenuItem>
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
                fontWeight="bold"
                color="text.secondary"
                display="block"
                mb={0.5}
                letterSpacing={0.5}
              >
                SỐ KHÁCH
              </Typography>
              <TextField
                select
                fullWidth
                name="capacity"
                size="small"
                value={searchData.capacity}
                onChange={handleChange}
                sx={textFieldStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PeopleAltOutlinedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num} Người
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disableElevation
              sx={{
                bgcolor: COLORS.primary,
                fontWeight: "bold",
                py: 1.2,
                mt: 1,
                borderRadius: "8px",
                fontSize: "1rem",
                textTransform: "none",
                "&:hover": {
                  bgcolor: COLORS.primaryDark,
                },
              }}
            >
              TÌM PHÒNG
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
    <Box sx={{ p: { xs: 2, md: 1.5 }, width: "100%" }}>
      <form onSubmit={handleSearch}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={2.5}>
            <Typography
              variant="caption"
              fontWeight="bold"
              color="text.secondary"
              display="block"
              mb={0.5}
              letterSpacing={0.5}
              px={0.5}
            >
              NGÀY NHẬN PHÒNG
            </Typography>
            <TextField
              fullWidth
              type="date"
              name="checkIn"
              size="small"
              value={searchData.checkIn}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={textFieldStyles}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={2.5}>
            <Typography
              variant="caption"
              fontWeight="bold"
              color="text.secondary"
              display="block"
              mb={0.5}
              letterSpacing={0.5}
              px={0.5}
            >
              NGÀY TRẢ PHÒNG
            </Typography>
            <TextField
              fullWidth
              type="date"
              name="checkOut"
              size="small"
              value={searchData.checkOut}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={textFieldStyles}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography
              variant="caption"
              fontWeight="bold"
              color="text.secondary"
              display="block"
              mb={0.5}
              letterSpacing={0.5}
              px={0.5}
            >
              LOẠI PHÒNG
            </Typography>
            <TextField
              select
              fullWidth
              name="roomType"
              size="small"
              value={searchData.roomType}
              onChange={handleChange}
              sx={textFieldStyles}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HotelIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="all">Tất cả loại phòng</MenuItem>
              {dbRoomTypes.map((type) => (
                <MenuItem key={type.id} value={type.type_name}>
                  {type.type_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography
              variant="caption"
              fontWeight="bold"
              color="text.secondary"
              display="block"
              mb={0.5}
              letterSpacing={0.5}
              px={0.5}
            >
              SỐ KHÁCH
            </Typography>
            <TextField
              select
              fullWidth
              name="capacity"
              size="small"
              value={searchData.capacity}
              onChange={handleChange}
              sx={textFieldStyles}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PeopleAltOutlinedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <MenuItem key={num} value={num}>
                  {num} Người
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={2}>
            {/* Thêm Label tàng hình để cân bằng chiều cao với các cột khác */}
            <Typography
              variant="caption"
              display="block"
              mb={0.5}
              px={0.5}
              sx={{ opacity: 0, userSelect: "none" }}
            >
              .
            </Typography>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disableElevation
              sx={{
                bgcolor: COLORS.primary,
                height: "40px",
                borderRadius: "8px",
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "0.95rem",
                "&:hover": {
                  bgcolor: COLORS.primaryDark,
                },
              }}
            >
              TÌM KIẾM
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default SearchBar;
