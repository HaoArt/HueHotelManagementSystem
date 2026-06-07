import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import UserService from "../services/userService";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTokenAndFetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decoded = jwtDecode(token);

          // 1. Set tạm dữ liệu cơ bản từ token giải mã để UI nhận diện ngay là đang đăng nhập
          setUser(decoded);

          try {
            // 2. Tự tin gọi API lấy Profile.
            // Nếu Token hết hạn 15p, Axios Interceptor (api.js) sẽ ngầm gọi Refresh Token để lấy token mới, sau đó gọi lại API này.
            const res = await UserService.getProfile();
            const fullUserInfo = res.data?.userInfo || res.data || {};

            setUser((prevUser) => ({
              ...prevUser,
              ...fullUserInfo,
            }));
          } catch (apiErr) {
            console.warn(
              "Phiên đăng nhập đã hết hạn hoàn toàn, yêu cầu đăng nhập lại.",
              apiErr,
            );
            localStorage.removeItem("token");
            setUser(null);
          }
        } catch (error) {
          console.error("Token không hợp lệ:", error);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkTokenAndFetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
