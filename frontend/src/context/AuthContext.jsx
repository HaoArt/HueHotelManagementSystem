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

          if (decoded.exp * 1000 < Date.now()) {
            console.warn("Token đã hết hạn!");
            localStorage.removeItem("token");
            setUser(null);
          } else {
            setUser(decoded);
            try {
              const res = await UserService.getProfile();
              const fullUserInfo = res.data?.userInfo || res.data || {};

              setUser((prevUser) => ({
                ...prevUser,
                ...fullUserInfo,
              }));
            } catch (apiErr) {
              console.error(
                "Lỗi khi tải thông tin chi tiết người dùng:",
                apiErr,
              );
             
            }
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
      {/* Chỉ render UI khi quá trình kiểm tra và tải User đã hoàn tất */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
