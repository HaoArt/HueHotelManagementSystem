# PHÂN TÍCH LOGIC NGHIỆP VỤ - HỆ THỐNG QUẢN LÝ KHÁCH SẠN HUE HOTEL

Tài liệu này phân tích chi tiết các luồng nghiệp vụ (business logic) cốt lõi của dự án, cách chúng hoạt động, các quy tắc được áp dụng và chỉ ra các rủi ro hoặc điểm lỗi tiềm ẩn trong từng bước.

---

## Luồng 1: Đăng ký & Xác thực Tài khoản (Account Registration & Authentication)

Đây là luồng đầu tiên khi người dùng tương tác với hệ thống để tạo tài khoản.

### Hoạt động

1.  **Bước 1 (Pre-Register):** Người dùng điền thông tin cá nhân (Họ tên, Email, SĐT, CCCD, Mật khẩu) và gửi đi.
2.  **Bước 2 (Send OTP):** Hệ thống kiểm tra tính hợp lệ của dữ liệu, sau đó tạo một mã OTP ngẫu nhiên, lưu vào DB (bảng `users` với trạng thái `pending`) và gửi mã OTP đó đến email của người dùng.
3.  **Bước 3 (Verify):** Người dùng nhập mã OTP nhận được từ email. Hệ thống so sánh mã OTP này với mã đã lưu. Nếu khớp, tài khoản được kích hoạt (trạng thái đổi thành `active`).

### Logic chi tiết & Ràng buộc

- **Validation chặt chẽ:** Hệ thống kiểm tra định dạng Email, SĐT (10 số, đầu số hợp lệ), CCCD (đúng 12 số), và độ mạnh mật khẩu (ít nhất 8 ký tự, có chữ hoa, thường, số, ký tự đặc biệt).
- **Chống Spam:** Việc yêu cầu xác thực OTP qua email ngăn chặn việc tạo tài khoản rác hoặc sử dụng email không tồn tại.

### ⚠️ Rủi ro & Điểm lỗi tiềm ẩn

- **Rủi ro người dùng không nhận được Email:**
  - **Nguyên nhân:** Dịch vụ email (ví dụ: SendGrid, Mailgun) có thể gặp sự cố, hoặc email có thể bị rơi vào hòm thư Spam.
  - **Hậu quả:** Người dùng không thể hoàn tất đăng ký.
- **Rủi ro tấn công Brute-force OTP:**
  - **Nguyên nhân:** Kẻ xấu có thể thử nhập OTP liên tục.
  - **Hậu quả:** Có khả năng dò ra được mã OTP.
  - **Đánh giá:** Hệ thống hiện tại chưa có cơ chế giới hạn số lần nhập sai OTP (rate limiting). Đây là một điểm cần cải thiện.

---

## Luồng 2: Tìm kiếm & Đặt phòng (Room Search & Booking)

Đây là luồng nghiệp vụ phức tạp và quan trọng nhất của hệ thống.

### Hoạt động

1.  **Bước 1 (Search):** Người dùng chọn ngày nhận phòng, trả phòng và số lượng khách. Hệ thống tìm các loại phòng (`room_types`) còn trống ít nhất 1 phòng (`rooms`) trong khoảng thời gian đó.
2.  **Bước 2 (Create Booking):** Người dùng chọn một loại phòng và tiến hành đặt.
    - Hệ thống tìm một phòng vật lý (`rooms`) cụ thể còn trống và "khóa" nó lại bằng cơ chế **Optimistic Locking** (tăng `version` lên 1).
    - Tính toán tổng tiền dựa trên: `Giá phòng cơ bản * số đêm`.
    - Cộng thêm phụ thu nếu ngày đặt rơi vào mùa cao điểm/lễ tết (`surcharges`).
    - Áp dụng giảm giá theo hạng thành viên (`ranks`).
    - Áp dụng giảm giá từ mã coupon (nếu có).
    - Kiểm tra các quy tắc thanh toán (đơn giá trị cao, đặt xa ngày).
    - Tạo một bản ghi `bookings` trong CSDL với trạng thái `Pending` (nếu cọc online) hoặc `Confirmed` (nếu trả tại quầy).
    - Nếu có đặt kèm dịch vụ, tạo các bản ghi trong `folios`.
    - Tăng `used_count` của coupon (nếu có).

### Logic chi tiết & Ràng buộc

- **Chống Overbooking:** Sử dụng `UPDATE rooms SET version = version + 1 WHERE id = ? AND version = ?`. Nếu câu lệnh này trả về 0 dòng bị ảnh hưởng, nghĩa là có người khác đã đặt phòng đó trong tích tắc. Giao dịch sẽ bị hủy và báo lỗi cho người dùng.
- **Giá động (Dynamic Pricing):** Giá cuối cùng là kết quả của một chuỗi tính toán phức tạp, thể hiện đúng nghiệp vụ khách sạn.
- **Chính sách thanh toán nghiêm ngặt:**
  - Đơn > 4.000.000 VNĐ hoặc đặt trước > 14 ngày: **Bắt buộc** thanh toán online, không cho phép "Thanh toán tại quầy".
  - Khách có điểm tín nhiệm (`trust_score`) < 80: **Bắt buộc** thanh toán online.
  - Mùa cao điểm: **Không** cho phép "Thanh toán tại quầy".
- **Giữ chỗ (Hold):**
  - Đơn `Pending`: Giữ phòng 15 phút để khách chuyển khoản.
  - Đơn `Confirmed` (trả tại quầy): Giữ phòng đến một giờ nhất định trong ngày check-in.

### ⚠️ Rủi ro & Điểm lỗi tiềm ẩn

- **Rủi ro mất toàn vẹn dữ liệu (Nghiêm trọng):**
  - **Nguyên nhân:** Hàm `createBooking` thực hiện nhiều thao tác (tạo booking, thêm folio, cập nhật coupon) nhưng **không sử dụng DB Transaction**.
  - **Hậu quả:** Nếu hệ thống tạo booking thành công nhưng bị lỗi ở bước cập nhật coupon, dữ liệu sẽ ở trạng thái "nửa vời", không nhất quán. Booking tồn tại nhưng coupon chưa bị trừ lượt.
  - **Giải pháp:** Bọc toàn bộ các câu lệnh `INSERT/UPDATE` trong một khối `BEGIN TRANSACTION...COMMIT/ROLLBACK`.
- **Rủi ro Race Condition ở Coupon:**
  - **Nguyên nhân:** Giống như overbooking, nếu 2 người cùng sử dụng một mã coupon chỉ còn 1 lượt cuối, cả hai có thể cùng lúc vượt qua bước kiểm tra `used_count < usage_limit`.
  - **Hậu quả:** Coupon bị sử dụng lố số lượt cho phép.
  - **Giải pháp:** Cần áp dụng `UPDATE coupons SET used_count = used_count + 1 WHERE id = ? AND used_count < usage_limit`.

---

## Luồng 3: Quy trình Check-in (Admin thực hiện)

### Hoạt động

Khi khách đến nhận phòng, lễ tân tìm đơn đặt phòng và bấm nút "Check-in".

1.  **Bước 1 (Validate):** Hệ thống kiểm tra trạng thái đơn phải là `Confirmed`.
2.  **Bước 2 (Process Early Check-in):** Hệ thống so sánh ngày hiện tại với ngày check-in dự kiến.
    - **Nếu khách đến sớm trước ngày:** Hệ thống tự động tính thêm số đêm phát sinh, cộng tiền vào `total_amount`, lùi ngày `check_in_date` về ngày hiện tại và ghi chú lại.
3.  **Bước 3 (Update Status):**
    - Cập nhật trạng thái booking thành `Checked_in`.
    - Cập nhật trạng thái phòng (`rooms`) thành `Occupied`.
    - Cộng điểm tín nhiệm (`trust_score`) cho khách hàng.

### Logic chi tiết & Ràng buộc

- **Tự động hóa phụ thu đến sớm:** Logic này cực kỳ thông minh, giúp lễ tân không cần tính toán thủ công, giảm sai sót và tăng tính minh bạch.
- **Linh hoạt đổi phòng:** Giao diện cho phép lễ tân chọn một phòng trống khác để check-in cho khách nếu phòng dự kiến ban đầu gặp sự cố (ví dụ: chưa dọn xong).

### ⚠️ Rủi ro & Điểm lỗi tiềm ẩn

- **Rủi ro mất toàn vẹn dữ liệu:** Tương tự luồng đặt phòng, hàm `checkIn` cũng thực hiện nhiều `UPDATE` nhưng chưa có DB Transaction. Nếu lỗi xảy ra giữa chừng (ví dụ: cập nhật booking xong nhưng lỗi khi cập nhật trạng thái phòng), hệ thống sẽ bị bất đồng bộ.

---

## Luồng 4: Quản lý Dịch vụ trong kỳ nghỉ (Folio Management)

### Hoạt động

Khách hàng có thể gọi thêm dịch vụ (đồ ăn, giặt ủi, thuê xe...) từ trang cá nhân của họ.

1.  **Bước 1 (Order):** Khách chọn dịch vụ, số lượng.
2.  **Bước 2 (Validate Time):** Nếu dịch vụ là loại `PreOrder` (đặt trước, ví dụ: bữa tối lúc 7h), hệ thống bắt buộc khách phải nhập thời gian mong muốn.
3.  **Bước 3 (Create Folio):** Hệ thống tạo một bản ghi `folio_items` với trạng thái `Pending` và thêm vào hóa đơn của booking hiện tại.
4.  **Bước 4 (Cancel Service):** Khách có thể hủy dịch vụ đã đặt.

### Logic chi tiết & Ràng buộc

- **Phạt hủy dịch vụ `PreOrder`:** Đây là một nghiệp vụ rất thực tế.
  - Nếu khách hủy **trước 2 tiếng** so với giờ hẹn: Hủy miễn phí.
  - Nếu khách hủy **trong vòng 2 tiếng** so với giờ hẹn: Phạt 50% giá trị dịch vụ.
  - Nếu khách hủy **sau giờ hẹn**: Phạt 100% giá trị dịch vụ.
  - Số tiền phạt được ghi vào cột `cancellation_fee`.

### ⚠️ Rủi ro & Điểm lỗi tiềm ẩn

- **Vấn đề Timezone:** Logic tính toán thời gian phạt hủy đang dựa trên `new Date()` của server. Nếu server và khách sạn ở hai múi giờ khác nhau, việc tính toán "2 tiếng" có thể bị sai lệch. Cần chuẩn hóa tất cả thời gian về UTC.

---

## Luồng 5: Quy trình Check-out (Admin thực hiện)

### Hoạt động

Khi khách trả phòng, lễ tân bấm nút "Check-out".

1.  **Bước 1 (Calculate Late Fee):** Hệ thống so sánh giờ hiện tại với giờ check-out quy định (12:00 trưa).
    - **Trả phòng trong ngày (Day-use):** Nếu khách check-in và check-out trong cùng một ngày, tính tiền theo giờ.
    - **Trả phòng muộn (Late Check-out):** Nếu trả sau 12:00 trưa, hệ thống tự động cộng thêm phụ phí:
      - Trước 15:00: Phụ thu 30% giá phòng.
      - Từ 15:00 - 18:00: Phụ thu 50% giá phòng.
      - Sau 18:00: Phụ thu 100% giá phòng (tính là thêm 1 đêm).
2.  **Bước 2 (Finalize Bill):** Hệ thống tổng hợp lại toàn bộ tiền phòng, tiền dịch vụ, tiền phạt, trừ đi tiền cọc để ra số tiền cuối cùng khách phải trả.
3.  **Bước 3 (Update Status):**
    - Cập nhật trạng thái booking thành `Checked_out`.
    - Cập nhật trạng thái phòng (`rooms`) thành `Dirty` (chờ dọn dẹp).
    - Cập nhật tổng chi tiêu (`total_spent`) và cộng điểm tín nhiệm cho khách.
4.  **Bước 4 (Generate Invoice):** Tự động tạo và cho phép tải về hóa đơn PDF.

### ⚠️ Rủi ro & Điểm lỗi tiềm ẩn

- **Rủi ro tính toán số thực (Float Precision Risk):**
  - **Nguyên nhân:** Javascript có thể gặp lỗi khi tính toán các số thập phân (ví dụ `0.1 + 0.2`).
  - **Hậu quả:** Có thể dẫn đến sai lệch nhỏ trong hóa đơn cuối cùng.
  - **Giải pháp:** Nên sử dụng thư viện `decimal.js` hoặc tính toán trên đơn vị nhỏ nhất (đồng) để đảm bảo chính xác tuyệt đối.
- **Rủi ro mất toàn vẹn dữ liệu:** Hàm `checkOut` cũng cần được bọc trong DB Transaction.

---

## Luồng 6: Hệ thống Tự động (Automated Cron Jobs)

Hệ thống sử dụng `node-cron` để chạy các tác vụ nền theo lịch trình.

### Hoạt động

1.  **Dọn dẹp đơn `Pending`:**
    - **Tần suất:** Mỗi phút (`* * * * *`).
    - **Logic:** Tìm các booking có trạng thái `Pending` và `hold_until` đã quá thời gian hiện tại. Chuyển trạng thái của chúng thành `Cancelled` và giải phóng phòng về `Available`.
2.  **Xử lý khách không đến (No-Show):**
    - **Tần suất:** Mỗi giờ (`0 * * * *`).
    - **Logic:** Tìm các booking `Confirmed` (khách hẹn trả tại quầy) đã quá thời gian giữ chỗ (`hold_until`). Chuyển trạng thái thành `Cancelled`, giải phóng phòng và trừ nặng điểm tín nhiệm của khách.
3.  **Gửi Email nhắc nhở:**
    - **Tần suất:** 8 giờ sáng hàng ngày (`0 8 * * *`).
    - **Logic:** Tìm các booking có ngày check-in là ngày mai và gửi email nhắc nhở lịch trình cho khách.

### ⚠️ Rủi ro & Điểm lỗi tiềm ẩn

- **Vấn đề Timezone (Nghiêm trọng với Cron):**
  - **Nguyên nhân:** Các cron job được lên lịch dựa trên múi giờ của server.
  - **Hậu quả:** Nếu server chạy ở Mỹ (UTC-5) và khách sạn ở Việt Nam (UTC+7), job "8 giờ sáng" sẽ chạy vào 8 giờ sáng giờ Mỹ, tức là 8 giờ tối giờ Việt Nam. Điều này làm sai hoàn toàn logic nghiệp vụ.
  - **Giải pháp:** Cần chỉ định rõ múi giờ khi khởi tạo cron job, ví dụ: `{ scheduled: true, timezone: "Asia/Ho_Chi_Minh" }`.

---

## Luồng 7: Nghiệp vụ Đổi phòng (Change Room & Free Upgrade)

Đây là luồng nghiệp vụ dành cho Lễ tân xử lý khi phòng hiện tại của khách gặp sự cố hoặc khách có nhu cầu nâng hạng.

### Hoạt động

1.  **Bước 1 (Select New Room):** Lễ tân mở giao diện đổi phòng trên đơn đang lưu trú (`Checked_in`), hệ thống tự động lọc và chỉ hiển thị danh sách các phòng vật lý đang ở trạng thái Sẵn sàng (`Available`).
2.  **Bước 2 (Calculate Fee):** Lễ tân chọn phòng mới và tùy chọn Nâng hạng miễn phí.
    - Nếu tích chọn "Nâng hạng miễn phí" (Free Upgrade) do lỗi từ phía khách sạn, hệ thống giữ nguyên tổng hóa đơn cũ của khách.
    - Nếu khách chủ động đổi phòng khác hạng, hệ thống tự động tính toán chênh lệch giá gốc giữa 2 hạng phòng áp dụng cho số đêm còn lại, sau đó cập nhật lại tổng hóa đơn.
3.  **Bước 3 (Commit Change):** Lễ tân bấm Xác nhận. Hệ thống thực thi đổi trạng thái phòng cũ thành `Dirty` (Cần dọn dẹp), phòng mới thành `Occupied` (Có khách), cập nhật lại `room_id` cho đơn hàng và ghi log kiểm toán.

### ⚠️ Rủi ro & Điểm lỗi tiềm ẩn

- **Rủi ro Xung đột trạng thái phòng (Race Condition):**
  - **Nguyên nhân:** Lễ tân A mở giao diện đổi phòng và nhìn thấy Phòng 102 đang `Available`. Tuy nhiên, trong lúc Lễ tân A đang thương lượng với khách, một khách hàng trên Website đã đặt thành công đúng Phòng 102 đó, hoặc Lễ tân B ở máy khác đã giao Phòng 102 cho khách Walk-in. Lúc này, Lễ tân A mới bấm "Xác nhận đổi".
  - **Hậu quả:** Nếu không kiểm soát, 2 khách hàng sẽ bị xếp chung vào 1 phòng vật lý gây ra khủng hoảng vận hành (Double-booking).
  - **Giải pháp xử lý:** Backend đã được cài đặt chốt chặn an toàn ngay tại Controller. Khi nhận request đổi phòng, hệ thống **bắt buộc query lại Database để kiểm tra trạng thái phòng mới nhất một lần nữa** (`SELECT status FROM rooms WHERE id = ?`). Nếu trạng thái không còn là `Available`, hệ thống lập tức từ chối giao dịch, báo lỗi xung đột: _"Trạng thái phòng này không khả dụng để chuyển sang!"_ và yêu cầu Lễ tân chọn lại phòng khác.

---

## 8. Các biện pháp Tối ưu Hệ thống (System Optimizations)

Bên cạnh các logic nghiệp vụ phức tạp, hệ thống cũng đã và đang áp dụng (hoặc cần áp dụng) các kỹ thuật tối ưu hóa về mặt hiệu suất, tài nguyên và bảo mật.

### 🟢 Các tối ưu ĐÃ được thực hiện:

1. **Tối ưu Bộ nhớ Backend (Memory Optimization):**
   - **Streaming PDF:** Khi xuất hóa đơn (`downloadInvoice` trong `bookingController.js`), thay vì tạo file PDF lưu vào ổ cứng server hoặc load toàn bộ vào RAM, hệ thống dùng cơ chế Stream `(chunk) => res.write(chunk)` đẩy trực tiếp luồng byte về phía Client. Kỹ thuật này giúp Server tiết kiệm bộ nhớ cực tốt, không bị giật lag/crash khi có hàng chục khách check-out và xuất hóa đơn cùng một lúc.
2. **Tối ưu Hiệu suất Frontend (React Performance):**
   - **Kỹ thuật Memoization:** Sử dụng triệt để hook `useMemo` (trong `Profile.jsx`, `AdminBookingsPage.jsx`) để cache lại kết quả tính toán của danh sách đơn hàng đã lọc (`filteredBookings`) hoặc tiến trình tính hạng thành viên (`nextRankInfo`). Giúp giao diện không bị giật lag (tránh re-render vô ích) khi người dùng thao tác gõ phím tìm kiếm.
   - **Tối ưu Rendering:** Tích hợp phân trang (Pagination) ở bảng quản lý `AdminBookingsPage.jsx` thay vì load hàng ngàn dòng, giúp giảm tải số lượng DOM nodes cần render trên trình duyệt, tiết kiệm CPU/RAM của thiết bị người dùng.
3. **Tối ưu Xử lý Đồng thời (Concurrency Control):**
   - Kỹ thuật **Optimistic Locking** (`lockRoomOptimistic` bằng cột `version`) ở tầng Database giúp giải quyết bài toán thắt cổ chai (bottleneck) tốt hơn nhiều so với Pessimistic Locking. Thay vì khóa hẳn dữ liệu (lock rows) làm chậm các truy vấn của những người dùng khác đang xem, hệ thống cho phép đọc thoải mái và chỉ chặn lại ở khâu UPDATE cuối cùng.
4. **Tối ưu Trải nghiệm Người dùng (UX / Perceived Performance):**
   - Sử dụng UI Glassmorphism kết hợp với các hiệu ứng `Slide`, `Fade` từ Material-UI tạo cảm giác mượt mà. Kỹ thuật này đánh lừa thị giác (Perceived Performance), giúp người dùng cảm thấy hệ thống chạy rất nhanh trong lúc chờ đợi API phản hồi.

### 🟡 Các tối ưu CẦN thiết trong tương lai (Để chịu tải lớn):

1. **Tối ưu Bộ nhớ đệm (Caching với Redis):**
   - Hiện tại mọi request lấy cấu hình (`SystemConfig`) hay Danh sách loại phòng (`RoomTypes`) đều đánh trực tiếp vào Database MySQL. Đây là những dữ liệu rất ít khi thay đổi (Static/Infrequent Data).
   - **Đề xuất:** Cần tích hợp Redis Cache để lưu các dữ liệu này trên RAM. Khi API gọi, đọc từ Redis sẽ giúp giảm hàng ngàn query thừa xuống Database, tăng tốc độ phản hồi từ ~100ms xuống còn <10ms.
2. **Tối ưu Tốc độ truy vấn Database (Indexing):**
   - Khi dữ liệu bảng `bookings`, `users` tăng lên hàng trăm ngàn dòng, việc admin tìm kiếm theo `phone` (SĐT) hoặc `full_name` (Tên) bằng mệnh đề `LIKE` hoặc quét toàn bảng (Full Table Scan) sẽ làm treo Database.
   - **Đề xuất:** Cần đánh Index (B-Tree Index) cho các cột thường xuyên được truy vấn như `phone`, `email`, `status`, `check_in_date`.
3. **Tối ưu Kiến trúc Code (Service Layer Pattern):**
   - Các Controller hiện tại (đặc biệt là `bookingController.js`) đang "gánh" quá nhiều công việc: kiểm tra logic, tính giá động, tính % giảm giá, insert DB... (Hiện tượng Fat Controller).
   - **Đề xuất:** Tách các thuật toán tính toán này ra một thư mục `services/PricingService.js`. Điều này giúp code gọn gàng, dễ tái sử dụng và cực kỳ thuận tiện cho việc viết Automation Test (Unit Test).
4. **Tối ưu Chống Tấn Công (Rate Limiting & Throttling):**
   - Hiện tại hệ thống đăng ký OTP, Đăng nhập, và Tìm phòng chưa bị giới hạn tần suất. Kẻ xấu có thể viết script gọi API 1000 lần/giây để spam gửi Email OTP hoặc làm cạn kiệt tài nguyên Server (DDoS, Brute-force).
   - **Đề xuất:** Cần bổ sung middleware `express-rate-limit` để giới hạn mỗi IP chỉ được gửi yêu cầu OTP 3 lần/15 phút, hoặc chỉ được gọi API tìm kiếm 50 lần/phút.
5. **Tối ưu Kích thước Tải lên (Image Compression):**
   - Mặc dù đã chặn ảnh quá 10MB bằng `multer`, nhưng nếu người dùng upload ảnh 9MB, Cloudinary vẫn phải lưu ảnh nặng, làm chậm quá trình render phía Client sau này.
   - **Đề xuất:** Tích hợp thêm các thư viện nén ảnh như `sharp` hoặc cấu hình `upload_preset` trên Cloudinary để tự động nén, resize ảnh xuống độ phân giải chuẩn (vd: max width 1200px) và format `webp` trước khi lưu.
