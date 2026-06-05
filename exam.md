# ĐÁNH GIÁ DỰ ÁN: HỆ THỐNG QUẢN LÝ KHÁCH SẠN (HUE HOTEL)

## 1. Tổng quan Dự án & Đánh giá Logic Nghiệp vụ

Dự án là một hệ thống quản lý khách sạn toàn diện được xây dựng trên nền tảng **React (MUI) cho Frontend** và **Node.js/Express + MySQL cho Backend**. Hệ thống không chỉ dừng lại ở việc quản lý CRUD cơ bản mà còn đi sâu vào các logic nghiệp vụ thực tế và phức tạp của ngành nhà hàng khách sạn (Hospitality).

### Logic Nghiệp vụ Nổi bật:

1. **Quản lý Đặt phòng (Booking)**:
   - Tính toán giá tiền động theo số ngày lưu trú, kết hợp với các quy tắc phụ thu mùa cao điểm (Surcharge), mã giảm giá (Coupon), và chiết khấu hạng thành viên (Rank).
   - Quy định thanh toán nghiêm ngặt: Buộc thanh toán/đặt cọc Online đối với các đơn hàng giá trị cao (trên 4.000.000 VNĐ) hoặc đặt trước quá 14 ngày.
   - Luồng Check-in/Check-out tự động hóa: Phát hiện Check-in sớm để tính thêm phụ phí đêm, Check-out trễ tính thêm % giá phòng (30%, 50%, 100%).
2. **Quản lý Dịch vụ phát sinh (Folio)**:
   - Xử lý tốt 2 loại dịch vụ: `Immediate` (Dùng ngay) và `PreOrder` (Đặt trước - yêu cầu chọn thời gian).
   - Áp dụng thuật toán phạt hủy (Cancellation Fee) nếu khách báo hủy dịch vụ `PreOrder` sát giờ (dưới 2 tiếng phạt 50%, quá hạn phạt 100%).
3. **Hệ thống Điểm tín nhiệm (Trust Score)**:
   - Thưởng điểm khi Check-out thành công hoặc để lại Review. Trừ điểm khi hủy phòng (tùy thuộc vào thời gian báo trước), trừ nặng khi No-Show. Khách có điểm dưới 80 sẽ bị tước quyền "Thanh toán tại quầy".
4. **Cron Job Tự động**:
   - Sử dụng `node-cron` để tự động dọn dẹp các đơn chưa thanh toán cọc sau 15 phút, và tự động hủy các đơn khách không đến (No-show).

---

## 2. Bảng Chấm điểm Chức năng (Theo mức độ hoàn thiện)

| Chức năng                            |  Điểm  | Đánh giá chi tiết                                                                                                       |
| :----------------------------------- | :----: | :---------------------------------------------------------------------------------------------------------------------- |
| **Xác thực & Phân quyền (Auth/OTP)** |  9/10  | Xử lý tốt luồng đăng ký bằng OTP Email. Có bảo mật bằng JWT và Refresh Token.                                           |
| **Đặt phòng (Booking & Walk-in)**    | 9.5/10 | Logic rất chặt chẽ. Xử lý đồng thời tốt bằng Optimistic Locking (`lockRoomOptimistic`). Ngăn chặn được Overbooking.     |
| **Check-in / Check-out**             |  9/10  | Tự động tính toán phụ phí cực kỳ linh hoạt. Có tích hợp xuất hóa đơn PDF tự động khi Check-out.                         |
| **Quản lý Dịch vụ (Folio)**          | 8.5/10 | Giao diện thân thiện, giỏ hàng thông minh. Logic phạt tiền khi hủy dịch vụ là một điểm cộng lớn.                        |
| **Hệ thống Khuyến mãi & Hạng**       |  8/10  | Mã giảm giá phân biệt loại % và giá cố định, có kết hợp tính Rank thành viên.                                           |
| **Sơ đồ phòng (Room Management)**    |  9/10  | Trực quan với UI báo chuông nhấp nháy khi có order mới. Phân quyền đổi phòng/nâng hạng miễn phí (Free Upgrade) rõ ràng. |
| **Lịch sử thao tác (Audit Log)**     |  8/10  | Lưu log các hành động quan trọng để truy vết (đổi phòng, hủy đơn, ...).                                                 |

---

## 3. Ưu điểm & Nhược điểm của Dự án

### Ưu điểm (Pros):

- **Nghiệp vụ thực tế sâu sắc**: Cách tiếp cận các bài toán như Check-in sớm, Check-out muộn, Phạt hủy dịch vụ, Nâng hạng phòng miễn phí, Điểm tín nhiệm... cho thấy sự tìm hiểu rất kỹ về domain Khách sạn.
- **Bảo vệ toàn vẹn dữ liệu**: Đã áp dụng `version` control (Optimistic Locking) cho Room để chống lại tình trạng Race Condition (2 khách cùng lúc đặt 1 phòng).
- **Giao diện đẳng cấp (Luxury UI)**: Frontend sử dụng thư viện Material-UI (MUI) hiệu quả, tận dụng tốt Glassmorphism, Animations (Fade, Slide) tạo cảm giác sang trọng.
- **Bảo mật & Trải nghiệm**: Refresh Token được cấu hình HTTPOnly Cookie thay vì localStorage, OTP xác thực qua Email chống spam.

### Nhược điểm (Cons):

- **Thiếu Transaction trong Database**: Các API như `createBooking`, `checkOut` hoặc `checkIn` thực hiện rất nhiều câu lệnh `INSERT`/`UPDATE` liên tiếp nhưng lại chưa sử dụng cơ chế DB Transaction (`db.beginTransaction()`). Nếu server crash giữa chừng, dữ liệu sẽ bị "nửa vời" (VD: tạo được booking nhưng chưa tạo được dịch vụ đi kèm).
- **Controller quá "cồng kềnh" (Fat Controllers)**: Logic tính toán tiền tệ, phần trăm, thời gian đặt trực tiếp trong file Controller (`bookingController.js`). Nên tách các thuật toán tính tiền này ra các file thư viện/Service riêng (Design Pattern: Service Layer) để code dễ bảo trì và test hơn.
- **Vấn đề Timezone**: Hệ thống đang phụ thuộc nhiều vào thời gian cục bộ của Server (`new Date()`). Nếu Server và Khách sạn không cùng múi giờ, logic tự động hóa (Cron) hoặc tính ngày sẽ bị sai lệch.

---

## 4. Quản lý Rủi ro (Risk Management)

### ✅ Các rủi ro ĐÃ được xử lý tốt:

1. **Rủi ro Overbooking (Quá tải phòng)**:
   - _Giải pháp_: Xử lý qua `lockRoomOptimistic` bằng field `version` trong DB. Bắt lỗi ngay tại thời điểm khách bấm xác nhận.
2. **Rủi ro Khách Spam đặt phòng ảo (Giữ chỗ)**:
   - _Giải pháp_: Đặt phòng xong chỉ giữ chỗ 15 phút nếu chọn Online. Áp dụng cơ chế Trust Score, phạt điểm nặng, chặn khách xấu (dưới 80 điểm) dùng tính năng "Trả tiền tại quầy". Có cronjob tự hủy phòng No-Show.
3. **Rủi ro Khách chối bỏ dịch vụ sát giờ**:
   - _Giải pháp_: Logic PreOrder giới hạn hủy trước 2 tiếng, nếu không sẽ bị đưa vào `cancellation_fee`.
4. **Rủi ro Bảo mật Phiên đăng nhập**:
   - _Giải pháp_: Access Token ngắn hạn (15 phút), Refresh Token để trong `httpOnly` cookie. Cấu hình Axios Interceptors tự động renew token khi mã 401 bị trả về.

### ⚠️ Các rủi ro CHƯA được xử lý (Cần cải thiện):

1. **Rủi ro Toàn vẹn dữ liệu (Data Integrity Risk)**:
   - _Nguyên nhân_: Chưa sử dụng DB Transactions.
   - _Hậu quả_: Nếu khi `createBooking`, hệ thống lưu xong đơn nhưng lỗi ở bước cộng điểm/trừ số lượng Coupon, cơ sở dữ liệu sẽ bị bất đồng bộ.
2. **Rủi ro Concurrency tại Mã giảm giá (Coupon Race Condition)**:
   - _Nguyên nhân_: Giống như việc đặt phòng, nếu 2 người cùng bấm đặt phòng chung 1 mã giảm giá chỉ còn 1 lượt cuối cùng, cả 2 đều có thể qua được vòng if-check và sử dụng lố mã đó.
   - _Giải pháp_: Cần thêm điều kiện `UPDATE coupons SET used_count = used_count + 1 WHERE id = ? AND used_count < usage_limit`.
3. **Rủi ro tính tiền sai lệch kiểu Float (Float Precision Risk)**:
   - _Nguyên nhân_: Javascript tính toán Float đôi khi gặp lỗi `0.1 + 0.2 = 0.30000000000000004`.
   - _Giải pháp_: Cần sử dụng thư viện như `decimal.js` hoặc quy đổi toàn bộ tiền ra đơn vị nhỏ nhất (Cents/Đồng chẵn) để nhân chia, sau đó mới format lại.
4. **Rủi ro rác dữ liệu Upload (Orphan Images)**:
   - _Nguyên nhân_: Trong `roomTypeController`, gọi Cloudinary upload xong mới insert DB. Nếu DB lỗi, ảnh trên Cloudinary sẽ trở thành "rác" vĩnh viễn không được gọi tới.

---

**Tổng kết**: Đây là một dự án chất lượng rất cao, có tính thực tiễn và tính ứng dụng mạnh mẽ. Kiến trúc luồng đi thông minh, đáp ứng được các bài toán khó của quy trình vận hành Khách sạn thực tế.

---

## 5. Cấu trúc Thuyết trình Báo cáo Đồ án (Dự kiến ~30 Slide)

Dưới đây là đề xuất cấu trúc bài thuyết trình đồ án dựa trên các tính năng và nghiệp vụ đã xây dựng. Cấu trúc này giúp hội đồng đánh giá thấy được sự logic từ khâu phân tích vấn đề, áp dụng công nghệ, đến giải quyết nghiệp vụ thực tế.

### Phần 1: Giới thiệu & Đặt vấn đề (Slide 1 - 4)

- **Slide 1:** Trang bìa (Tên đề tài: Hệ thống Quản lý Khách sạn Hue Hotel, GVHD, SVTH).
- **Slide 2:** Lý do chọn đề tài (Bối cảnh ngành nhà hàng khách sạn, nhu cầu chuyển đổi số).
- **Slide 3:** Khảo sát hiện trạng (Những hạn chế của việc quản lý thủ công hoặc các phần mềm cũ).
- **Slide 4:** Mục tiêu đề tài (Giải quyết bài toán đặt phòng, quản lý dịch vụ, tự động hóa quy trình).
- **Lý do:** Thu hút sự chú ý của hội đồng, tạo bối cảnh rõ ràng và thuyết phục về tính cấp thiết của đồ án. Giúp người nghe hiểu hệ thống này sinh ra để làm gì.

### Phần 2: Công nghệ sử dụng & Kiến trúc hệ thống (Slide 5 - 8)

- **Slide 5:** Tổng quan kiến trúc hệ thống (Mô hình Client-Server, Frontend React, Backend Node.js/Express, Database MySQL).
- **Slide 6:** Công nghệ Frontend (ReactJS, Material-UI cho Luxury UI, Context API quản lý State).
- **Slide 7:** Công nghệ Backend & Bảo mật (ExpressJS, JWT Auth, Access/Refresh Token bằng HTTPOnly Cookie, OTP Email).
- **Slide 8:** Công nghệ hỗ trợ khác (Cloudinary lưu trữ ảnh, PDFKit xuất hóa đơn, node-cron cho tác vụ tự động).
- **Lý do:** Chứng minh năng lực làm chủ các công nghệ web hiện đại, biết cách kết hợp các công cụ để giải quyết bài toán lớn, đồng thời thể hiện sự quan tâm đến bảo mật (Security).

### Phần 3: Phân tích & Thiết kế Hệ thống (Slide 9 - 14)

- **Slide 9:** Sơ đồ Use Case tổng quát (Actor: Khách hàng, Lễ tân, Admin).
- **Slide 10:** Lược đồ CSDL (ERD - Lập trung vào các bảng cốt lõi như Bookings, Rooms, Folio, Users).
- **Slide 11:** Sơ đồ luồng Đặt phòng (Từ lúc khách tạo đơn, check-out, tính phụ phí).
- **Slide 12:** Sơ đồ luồng Quản lý dịch vụ (PreOrder vs Immediate, thuật toán phạt hủy).
- **Slide 13:** Giải pháp chống Overbooking (Trình bày về Optimistic Locking với field `version`).
- **Slide 14:** Hệ thống tính Điểm tín nhiệm (Trust Score).
- **Lý do:** Thể hiện tư duy kỹ sư phần mềm (Software Engineering). Hội đồng thường rất chú trọng vào cách sinh viên phân tích CSDL và xử lý các rủi ro hệ thống (như Overbooking hay Race Condition).

### Phần 4: Nổi bật Logic Nghiệp vụ cốt lõi (Slide 15 - 22)

- **Slide 15 - 16:** Nghiệp vụ Booking & Giá động (Phụ thu mùa cao điểm Surcharge, Mã giảm giá Coupon, Chiết khấu hạng thành viên Rank).
- **Slide 17:** Chính sách Thanh toán & Đặt cọc (Buộc cọc online với đơn >4tr hoặc đặt trước >14 ngày).
- **Slide 18 - 19:** Tự động hóa Check-in/Check-out (Thuật toán tự phát hiện khách đến sớm thu thêm tiền đêm, trả trễ thu phụ phí 30%, 50%, 100%).
- **Slide 20 - 21:** Quản lý Folio - Dịch vụ phát sinh (Phân loại dịch vụ dùng ngay và đặt trước, tính phí phạt 50%-100% nếu hủy sát giờ).
- **Slide 22:** Cơ chế Cronjob tự động (Dọn dẹp đơn treo sau 15 phút, tự động hủy No-show).
- **Lý do:** Đây là "trái tim" của đồ án. Chứng minh dự án không chỉ là web CRUD bình thường (thêm, sửa, xóa) mà là một hệ thống có chiều sâu nghiệp vụ, phản ánh đúng quy trình vận hành khắt khe của Khách sạn 4-5 sao.

### Phần 5: Demo Sản phẩm Thực tế (Slide 23 - 26)

- **Slide 23:** Giao diện Trang chủ & Luồng đặt phòng của Khách (UI Glassmorphism sang trọng).
- **Slide 24:** Giao diện Profile Khách hàng (Hiển thị Hạng thành viên, Trust Score, Lịch sử hóa đơn).
- **Slide 25:** Trang Quản trị Admin (Dashboard thống kê, Sơ đồ phòng trực quan có chuông báo dịch vụ).
- **Slide 26:** Luồng làm việc của Lễ tân (Duyệt Walk-in, Check-in/Out, In hóa đơn PDF).
- **Lý do:** _Trăm nghe không bằng một thấy_. Có thể sử dụng ảnh chụp màn hình GIF/Video ngắn hoặc chuyển sang Live Demo (Thao tác trực tiếp trên web) để chứng minh phần mềm hoạt động trơn tru.

### Phần 6: Đánh giá Rủi ro, Ưu/Nhược điểm & Hướng phát triển (Slide 27 - 29)

- **Slide 27:** Đánh giá Ưu điểm (UI/UX tốt, nghiệp vụ sâu, có cơ chế Optimistic Locking chống Overbooking).
- **Slide 28:** Đánh giá Nhược điểm & Rủi ro chưa xử lý (Thiếu DB Transaction dẫn đến rủi ro toàn vẹn dữ liệu, Controller đang xử lý quá nhiều logic).
- **Slide 29:** Hướng phát triển tương lai (Refactor code áp dụng Service Layer Pattern, thêm DB Transaction, Tích hợp AI Chatbot CSKH).
- **Lý do:** Thể hiện sự trung thực và tư duy phản biện. Việc sinh viên tự nhận thức được lỗi (như chưa dùng DB Transaction) và đề xuất được cách sửa sẽ ăn điểm rất cao trước hội đồng phản biện.

### Phần 7: Tổng kết & Q&A (Slide 30)

- **Slide 30:** Kết luận những giá trị dự án mang lại. Lời cảm ơn Hội đồng & Thầy cô hướng dẫn. Mời câu hỏi phản biện (Q&A).
- **Lý do:** Kết thúc chuyên nghiệp, chốt lại thông điệp và chuyển sang phần bảo vệ đồ án.

---

## 8. Đặc tả Use Case (Use Case Specifications)

Dưới đây là đặc tả chi tiết 6 Use Case cốt lõi của người dùng (Khách hàng) với hệ thống.

### UC1: Tìm kiếm và Lọc phòng

- Tên Use Case: Tìm kiếm và Lọc phòng
- Tác nhân: Khách hàng (Đã đăng nhập hoặc Chưa đăng nhập).
- Mô tả: Cho phép khách hàng tìm kiếm các hạng phòng còn phòng vật lý trống dựa trên tiêu chí về thời gian lưu trú và số lượng người.
- Tiền điều kiện: Không có.
- Luồng sự kiện chính:
  1. Khách hàng truy cập giao diện tìm kiếm phòng.
  2. Khách hàng nhập tiêu chí tìm kiếm: Ngày nhận phòng, Ngày trả phòng, và Sức chứa tối thiểu (Số người). (Nếu ngày trả phòng nhỏ hơn hoặc bằng ngày nhận phòng rẽ nhánh sang Ngoại lệ 1).
  3. Khách hàng nhấn nút "Tìm kiếm".
  4. Hệ thống tiếp nhận truy vấn, đếm số lượng phòng vật lý chưa bị đặt (hoặc chưa bảo trì) trong khoảng thời gian In/Out tương ứng. (Nếu không có phòng phù hợp rẽ nhánh sang Ngoại lệ 2).
  5. Hệ thống hiển thị danh sách các hạng phòng thỏa mãn điều kiện cùng số lượng phòng trống.
- Luồng ngoại lệ:
  - [Ngoại lệ 1 - Rẽ nhánh bước 2] Ngày trả phòng nhỏ hơn hoặc bằng ngày nhận phòng: Hệ thống hiển thị thông báo lỗi "Ngày trả phòng phải sau ngày nhận phòng" và yêu cầu nhập lại.
  - [Ngoại lệ 2 - Rẽ nhánh bước 4] Không có phòng vật lý nào trống phù hợp với tiêu chí: Hệ thống trả về mảng rỗng và hiển thị thông báo "Không tìm thấy phòng phù hợp".
- Hậu điều kiện: Khách hàng xem được danh sách hạng phòng trống và có thể tiến hành đặt.

### UC2: Đặt phòng trực tuyến

- Tên Use Case: Đặt phòng trực tuyến
- Tác nhân: Khách hàng (Bắt buộc đã đăng nhập).
- Mô tả: Khách hàng tiến hành đặt một hạng phòng, chọn dịch vụ đi kèm, áp dụng khuyến mãi và chọn phương thức thanh toán.
- Tiền điều kiện: Khách hàng không bị khóa tài khoản và không có quá 1 đơn đặt phòng đang treo (Pending).
- Luồng sự kiện chính:
  1. Khách hàng chọn hạng phòng và nhấn "Đặt phòng".
  2. Hệ thống hiển thị Form điền thông tin (Liên hệ, Ngày lưu trú, Dịch vụ nâng cấp).
  3. Hệ thống tự động tính toán Giá động (Cộng phụ thu Lễ Tết mùa cao điểm nếu có, trừ Chiết khấu theo Hạng thành viên).
  4. Khách hàng chọn phương thức thanh toán (Thanh toán Online hoặc Thanh toán tại quầy). (Nếu vi phạm chính sách thanh toán rẽ nhánh sang Ngoại lệ 1).
  5. Khách hàng đồng ý quy định và nhấn "Xác nhận đặt phòng".
  6. Hệ thống chạy thuật toán Optimistic Locking để lấy và khóa 1 căn phòng vật lý cho khách. (Nếu xảy ra Overbooking rẽ nhánh sang Ngoại lệ 2).
  7. Hệ thống tạo đơn hàng lưu vào cơ sở dữ liệu với trạng thái Pending (Online) hoặc Confirmed (Tại quầy).
  8. Hệ thống hiển thị mã QR thanh toán (nếu chọn Online) và thông báo thành công.
- Luồng ngoại lệ:
  - [Ngoại lệ 1 - Rẽ nhánh bước 4] Khách hàng có điểm tín nhiệm dưới 80, hoặc giá trị đơn hàng > 4 triệu VNĐ, hoặc đặt trước > 14 ngày: Hệ thống vô hiệu hóa nút "Thanh toán tại quầy", buộc khách phải "Thanh toán Online/Đặt cọc".
  - [Ngoại lệ 2 - Rẽ nhánh bước 6] Overbooking (Có khách khác nhanh tay đặt trước đúng căn phòng đó 1 vài giây): Hệ thống rollback giao dịch, báo lỗi "Có người khác vừa nhanh tay đặt căn phòng này" và yêu cầu thử lại.
- Hậu điều kiện: Đơn đặt phòng được tạo, phòng vật lý bị chiếm dụng trên sơ đồ thời gian.

### UC3: Áp dụng mã giảm giá

- Tên Use Case: Áp dụng mã giảm giá
- Tác nhân: Khách hàng.
- Mô tả: Khách hàng sử dụng Coupon để nhận ưu đãi khấu trừ trực tiếp vào tổng tiền hóa đơn đặt phòng.
- Tiền điều kiện: Khách hàng đang thao tác tại màn hình Đặt phòng (Thanh toán).
- Luồng sự kiện chính:
  1. Khách hàng nhấp vào nút "Chọn hoặc nhập mã ưu đãi".
  2. Hệ thống hiển thị danh sách các mã giảm giá đang Active và hợp lệ với tài khoản khách hàng.
  3. Khách hàng chọn một mã giảm giá.
  4. Hệ thống kiểm tra điều kiện áp dụng: Hạn sử dụng, Lượt sử dụng còn lại, và Tổng giá trị đơn hàng có đạt tối thiểu hay không. (Nếu tổng tiền chưa đạt rẽ nhánh Ngoại lệ 1, Nếu hết lượt sử dụng rẽ nhánh Ngoại lệ 2).
  5. Hệ thống tính toán mức khấu trừ (dựa theo Số tiền cố định hoặc % Tối đa) và cập nhật lại Tổng thanh toán hiển thị trên màn hình.
- Luồng ngoại lệ:
  - [Ngoại lệ 1 - Rẽ nhánh bước 4] Tổng tiền chưa đạt yêu cầu của Coupon: Hệ thống từ chối áp dụng và hiển thị lỗi.
  - [Ngoại lệ 2 - Rẽ nhánh bước 4] Mã giảm giá vừa hết lượt sử dụng do khách khác dùng trước: Hệ thống báo "Mã giảm giá đã hết lượt sử dụng!".
- Hậu điều kiện: Đơn đặt phòng được ghi nhận cùng thông tin ID của mã giảm giá đã áp dụng.

### UC4: Hủy đặt phòng

- Tên Use Case: Hủy đặt phòng
- Tác nhân: Khách hàng.
- Mô tả: Cho phép khách hàng tự hủy đơn đặt phòng khi chưa tới ngày Check-in.
- Tiền điều kiện: Đơn đặt phòng của khách đang ở trạng thái Pending hoặc Confirmed.
- Luồng sự kiện chính:
  1. Khách hàng truy cập "Hồ sơ cá nhân", xem mục Lịch sử đặt phòng.
  2. Khách hàng chọn đơn hàng muốn hủy và bấm nút "Hủy đơn". (Nếu đơn đặt phòng đã qua trạng thái Pending/Confirmed rẽ nhánh sang Ngoại lệ 1).
  3. Hệ thống hiển thị Popup cảnh báo (Rủi ro trừ điểm tín nhiệm và mất tiền cọc).
  4. Khách hàng nhấn "Xác nhận hủy".
  5. Hệ thống tính toán chênh lệch thời gian hiện tại so với giờ Check-in để tính phạt:
     - Dưới 24h: Trừ 20 điểm tín nhiệm, mất 100% cọc.
     - Từ 24h - 48h: Trừ 10 điểm tín nhiệm, phạt 50% cọc.
     - Trên 48h: Trừ 5 điểm tín nhiệm, không mất cọc.
  6. Hệ thống chuyển trạng thái đơn sang Cancelled, đưa trạng thái phòng về lại Available.
  7. Hệ thống tự động gửi Email thông báo hóa đơn hủy cho khách hàng.
- Luồng ngoại lệ:
  - [Ngoại lệ 1 - Rẽ nhánh bước 2] Đơn đặt phòng đã qua trạng thái Checked_in hoặc Checked_out: Nút "Hủy đơn" sẽ bị hệ thống ẩn, không cho phép thao tác.
- Hậu điều kiện: Đơn hàng bị hủy, số điểm tín nhiệm của khách bị thay đổi tương ứng theo thời gian phạt.

### UC5: Gọi dịch vụ lưu trú

- Tên Use Case: Gọi dịch vụ lưu trú
- Tác nhân: Khách hàng.
- Mô tả: Khách hàng đang ở tại phòng có thể gọi thêm dịch vụ đồ ăn, thức uống, spa (Room Service).
- Tiền điều kiện: Trạng thái đơn phòng của khách đang là Checked_in.
- Luồng sự kiện chính:
  1. Khách hàng mở trang Chi tiết hóa đơn trên "Hồ sơ cá nhân".
  2. Khách hàng chọn loại dịch vụ trong danh sách, chọn số lượng và ghi chú. (Nếu trạng thái đơn phòng không phải Checked_in rẽ nhánh sang Ngoại lệ 1).
  3. Nếu dịch vụ thuộc loại Đặt trước (PreOrder), khách hàng bắt buộc phải chọn Giờ hẹn phục vụ. (Nếu bỏ trống giờ hẹn rẽ nhánh sang Ngoại lệ 2).
  4. Khách hàng nhấn "Gửi yêu cầu".
  5. Hệ thống lưu dịch vụ vào hóa đơn với trạng thái Pending.
  6. Hệ thống cập nhật hiển thị Cảnh báo có đơn dịch vụ mới (Chuông báo nhấp nháy màu cam) trên Sơ đồ phòng để Lễ tân chuẩn bị.
- Luồng ngoại lệ:
  - [Ngoại lệ 1 - Rẽ nhánh bước 2] Trạng thái đơn không phải Checked_in: Khách hàng không thể gọi dịch vụ, hệ thống báo lỗi.
  - [Ngoại lệ 2 - Rẽ nhánh bước 3] Khách hàng gọi dịch vụ hẹn giờ nhưng bỏ trống ngày giờ: Hệ thống từ chối submit và báo lỗi "Vui lòng chọn thời gian hẹn phục vụ".
- Hậu điều kiện: Dịch vụ được ghi nhận vào hóa đơn tổng của phòng, giá trị hóa đơn tăng lên.

### UC6: Đánh giá phòng

- Tên Use Case: Đánh giá phòng
- Tác nhân: Khách hàng.
- Mô tả: Khách hàng chia sẻ trải nghiệm (Rating/Comment) sau khi trả phòng để nhận điểm thưởng.
- Tiền điều kiện: Đơn đặt phòng có trạng thái Checked_out và chưa từng đánh giá.
- Luồng sự kiện chính:
  1. Khách hàng mở Lịch sử đặt phòng trên "Hồ sơ cá nhân".
  2. Tại đơn hàng đã hoàn tất, khách hàng nhấn nút "Đánh giá". (Nếu đơn hàng chưa check-out rẽ nhánh sang Ngoại lệ 1, Nếu đã đánh giá trước đó rẽ nhánh sang Ngoại lệ 2).
  3. Khách hàng chọn Số sao (1 đến 5 sao) và ghi nhận xét.
  4. Khách hàng nhấn "Gửi đánh giá".
  5. Hệ thống lưu đánh giá vào cơ sở dữ liệu liên kết trực tiếp với hạng phòng khách đã ở.
  6. Hệ thống cộng ngay 5 điểm tín nhiệm (Trust Score) cho tài khoản khách hàng nhằm tri ân phản hồi.
- Luồng ngoại lệ:
  - [Ngoại lệ 1 - Rẽ nhánh bước 2] Đơn hàng chưa check-out: Hệ thống không hiển thị nút đánh giá.
  - [Ngoại lệ 2 - Rẽ nhánh bước 2] Khách hàng đã đánh giá trước đó: Hệ thống hiển thị hộp thoại báo lỗi "Bạn đã đánh giá đơn hàng này rồi".
- Hậu điều kiện: Phản hồi của khách được ghi nhận, điểm tín nhiệm tăng, khách khác có thể đọc được đánh giá tại trang chi tiết phòng.

### UC7: Xem sơ đồ phòng và Trạng thái phòng
- Tên Use Case: Xem sơ đồ phòng và Trạng thái phòng
- Tác nhân: Lễ tân, Quản trị viên.
- Mô tả: Cho phép Lễ tân xem tổng quan sơ đồ phòng, trạng thái từng phòng (Sẵn sàng, Có khách, Cần dọn dẹp, Bảo trì) và nhận cảnh báo nếu có yêu cầu dịch vụ mới.
- Tiền điều kiện: Lễ tân đã đăng nhập vào hệ thống quản trị.
- Luồng sự kiện chính:
  1. Lễ tân truy cập trang Sơ đồ Phòng trên bảng điều khiển.
  2. Hệ thống tải danh sách toàn bộ phòng vật lý và trạng thái hiện tại. (Nếu có lỗi kết nối rẽ nhánh sang Ngoại lệ 1).
  3. Hệ thống hiển thị các phòng dưới dạng lưới phân chia theo tầng, hoặc dạng danh sách.
  4. Hệ thống kiểm tra các đơn dịch vụ mới chưa phục vụ và hiển thị cảnh báo chuông nhấp nháy tại các phòng tương ứng.
  5. Lễ tân sử dụng bộ lọc hoặc thanh tìm kiếm để lọc danh sách phòng mong muốn.
- Luồng ngoại lệ:
  - [Ngoại lệ 1 - Rẽ nhánh bước 2] Lỗi tải dữ liệu phòng: Hệ thống hiển thị thông báo lỗi mạng và yêu cầu làm mới trang.
- Hậu điều kiện: Lễ tân nắm bắt được tình trạng phòng hiện tại của khách sạn để có hướng điều phối.

### UC8: Quản lý đơn đặt phòng
- Tên Use Case: Quản lý đơn đặt phòng
- Tác nhân: Lễ tân, Quản trị viên.
- Mô tả: Lễ tân xem danh sách đơn đặt phòng, tìm kiếm đơn và xác nhận tiền cọc đối với các đơn khách thanh toán chuyển khoản.
- Tiền điều kiện: Lễ tân đã đăng nhập vào hệ thống quản trị.
- Luồng sự kiện chính:
  1. Lễ tân truy cập trang Quản lý đơn đặt phòng.
  2. Hệ thống hiển thị danh sách đơn đặt phòng phân trang, phân chia theo các thẻ trạng thái.
  3. Đối với các đơn đang ở trạng thái Chờ nhận cọc, Lễ tân kiểm tra tài khoản ngân hàng của khách sạn.
  4. Nếu đã nhận được tiền, Lễ tân nhấn nút Xác nhận cọc trên đơn tương ứng. (Nếu đơn không hợp lệ rẽ nhánh sang Ngoại lệ 1).
  5. Hệ thống hiển thị hộp thoại xác nhận. Lễ tân đồng ý.
  6. Hệ thống cập nhật trạng thái đơn sang Đã xác nhận và tự động gửi email thông báo cho khách hàng.
- Luồng ngoại lệ:
  - [Ngoại lệ 1 - Rẽ nhánh bước 4] Đơn đã bị hệ thống tự động hủy do quá hạn giữ chỗ 15 phút: Nút xác nhận bị ẩn, hệ thống báo trạng thái không hợp lệ.
- Hậu điều kiện: Đơn đặt phòng được chuyển sang trạng thái an toàn, giữ phòng thành công cho khách.

### UC9: Tạo đơn Walk-in (Khách đặt tại quầy)
- Tên Use Case: Tạo đơn Walk-in (Khách đặt tại quầy)
- Tác nhân: Lễ tân, Quản trị viên.
- Mô tả: Lễ tân tạo đơn đặt phòng trực tiếp cho khách vãng lai đến thuê phòng ngay tại quầy.
- Tiền điều kiện: Lễ tân đang ở trang Sơ đồ Phòng hoặc Quản lý đơn đặt phòng.
- Luồng sự kiện chính:
  1. Lễ tân nhấn nút Khách Walk-in.
  2. Hệ thống hiển thị Form tạo đơn, tự động lọc ra danh sách các phòng đang Sẵn sàng.
  3. Lễ tân nhập số điện thoại khách hàng. (Nếu số điện thoại đã tồn tại, hệ thống tự động điền Họ tên cũ).
  4. Lễ tân nhập đầy đủ thông tin: Họ tên, chọn phòng trống, ngày trả phòng dự kiến và số tiền đã thu. (Nếu ngày trả phòng không hợp lệ rẽ nhánh sang Ngoại lệ 1).
  5. Lễ tân nhấn Xác nhận và Giao phòng.
  6. Hệ thống tự tạo tài khoản (nếu là khách mới), tạo đơn đặt phòng, tự động cập nhật trạng thái đơn thành Đang lưu trú và trạng thái phòng thành Có khách.
- Luồng ngoại lệ:
  - [Ngoại lệ 1 - Rẽ nhánh bước 4] Ngày trả phòng nhỏ hơn hoặc bằng ngày nhận phòng: Hệ thống hiển thị lỗi yêu cầu nhập lại ngày.
- Hậu điều kiện: Khách hàng Walk-in được nhận phòng ngay lập tức, dữ liệu được ghi nhận vào hệ thống.

### UC10: Check-in (Nhận phòng)
- Tên Use Case: Check-in (Nhận phòng)
- Tác nhân: Lễ tân, Quản trị viên.
- Mô tả: Lễ tân chuyển trạng thái đơn đặt phòng sang Đang lưu trú khi khách đến nhận phòng.
- Tiền điều kiện: Đơn đặt phòng của khách đang ở trạng thái Đã xác nhận hoặc Chờ nhận cọc.
- Luồng sự kiện chính:
  1. Lễ tân tìm đơn đặt phòng của khách và nhấn Check-in.
  2. Hệ thống hiển thị hộp thoại Xác nhận Check-in kèm thông tin tóm tắt.
  3. Hệ thống kiểm tra thời gian hiện tại so với ngày check-in dự kiến. (Nếu khách đến sớm trước ngày rẽ nhánh sang Luồng phụ 1, Nếu phòng hiện tại chưa sẵn sàng rẽ nhánh Ngoại lệ 1).
  4. Lễ tân nhấn Xác nhận Check-in.
  5. Hệ thống chuyển trạng thái đơn sang Đang lưu trú, phòng vật lý sang Có khách và cộng điểm tín nhiệm cho khách.
- Luồng phụ 1 (Đến sớm trước ngày):
  - Hệ thống cảnh báo Lễ tân, tự động tính toán số đêm đến sớm, lùi ngày nhận phòng về hiện tại và cộng thêm tiền phòng phát sinh vào tổng hóa đơn.
- Luồng ngoại lệ:
  - [Ngoại lệ 1 - Rẽ nhánh bước 3] Phòng dự kiến đang có trạng thái Cần dọn dẹp hoặc Đang có khách: Lễ tân bắt buộc phải chọn Đổi phòng thay thế ngay trên hộp thoại Check-in để giao phòng khác cho khách, nếu không hệ thống sẽ chặn thao tác.
- Hậu điều kiện: Khách chính thức lưu trú, phòng vật lý bị đánh dấu bị chiếm dụng.

### UC11: Check-out (Trả phòng)
- Tên Use Case: Check-out (Trả phòng)
- Tác nhân: Lễ tân, Quản trị viên.
- Mô tả: Lễ tân tính toán tổng chi phí cuối cùng, hoàn tất kỳ nghỉ của khách và xuất hóa đơn.
- Tiền điều kiện: Đơn đặt phòng đang ở trạng thái Đang lưu trú.
- Luồng sự kiện chính:
  1. Lễ tân mở chi tiết phòng đang Có khách trên sơ đồ phòng.
  2. Hệ thống tính toán tổng tiền minh bạch: Tiền phòng + Phụ thu Lễ + Dịch vụ phát sinh + Phạt hủy dịch vụ - Giảm giá - Tiền cọc.
  3. Hệ thống kiểm tra giờ hiện tại so với giờ Check-out quy định. (Nếu khách trả phòng trễ rẽ nhánh sang Luồng phụ 1).
  4. Lễ tân thu đủ số tiền còn lại và nhấn Thanh toán & Check-out.
  5. Hệ thống cập nhật đơn sang Đã hoàn tất, giải phóng phòng thành Cần dọn dẹp và cập nhật tổng chi tiêu của khách.
  6. Hệ thống tự động xuất file Hóa đơn định dạng PDF, tải xuống máy của Lễ tân và ngầm gửi một bản sao PDF qua email khách hàng.
- Luồng phụ 1 (Trả trễ):
  - Nếu trả trễ trong ngày, hệ thống cảnh báo Lễ tân tính toán và tạo một dịch vụ Phụ thu trả trễ vào đơn của khách trước khi Check-out.
  - Nếu trả trễ lố qua ngày hôm sau, hệ thống tự động cộng dồn số đêm lố vào tổng tiền phòng và cập nhật lại ngày trả phòng thành ngày hiện tại.
- Luồng ngoại lệ: Không có.
- Hậu điều kiện: Giao dịch hoàn tất, khách trả phòng, hóa đơn được sinh ra tự động.

### UC12: Xuất hóa đơn PDF
- Tên Use Case: Xuất hóa đơn PDF
- Tác nhân: Lễ tân, Quản trị viên.
- Mô tả: Lễ tân tải xuống bản sao hóa đơn định dạng PDF của một đơn đặt phòng đã hoàn tất để in ấn gửi cho khách hoặc lưu trữ.
- Tiền điều kiện: Đơn đặt phòng phải ở trạng thái Đã hoàn tất.
- Luồng sự kiện chính:
  1. Lễ tân tìm đơn đặt phòng đã hoàn tất trên trang Quản lý đơn đặt phòng.
  2. Lễ tân nhấn nút Hóa đơn.
  3. Hệ thống thu thập dữ liệu tài chính, tạo luồng dữ liệu file PDF từ hệ thống. (Nếu có lỗi tạo PDF rẽ nhánh sang Ngoại lệ 1).
  4. Hệ thống tải file PDF xuống thiết bị của Lễ tân.
  5. Hệ thống ngầm ghi lại hành động tải hóa đơn vào Nhật ký hệ thống (Audit Log) để kiểm toán.
- Luồng ngoại lệ:
  - [Ngoại lệ 1 - Rẽ nhánh bước 3] Lỗi tạo PDF: Hệ thống báo lỗi thư viện tạo PDF và yêu cầu thử lại.
- Hậu điều kiện: File PDF hóa đơn được tải về máy thành công.

### UC13: Quản lý hóa đơn dịch vụ và Hủy ép (Void)
- Tên Use Case: Quản lý hóa đơn dịch vụ và Hủy ép (Void)
- Tác nhân: Lễ tân, Quản trị viên.
- Mô tả: Lễ tân tiếp nhận yêu cầu gọi dịch vụ của khách, đánh dấu đã phục vụ, thêm dịch vụ thủ công và thực hiện Hủy ép nếu có sai sót.
- Tiền điều kiện: Khách đang lưu trú tại khách sạn.
- Luồng sự kiện chính:
  1. Lễ tân nhìn thấy cảnh báo Yêu cầu mới trên Sơ đồ phòng và nhấp vào phòng tương ứng.
  2. Tại bảng Nhật ký dịch vụ, Lễ tân xem các dịch vụ đang ở trạng thái Chờ phục vụ.
  3. Sau khi nhân viên mang dịch vụ lên phòng, Lễ tân nhấn biểu tượng Xác nhận để chuyển trạng thái sang Đã phục vụ.
  4. Lễ tân cũng có thể chủ động thêm dịch vụ vào hóa đơn thông qua nút Thêm dịch vụ.
  5. Nếu có sai sót như Lễ tân bấm nhầm hoặc khách trả lại món ăn còn nguyên, Lễ tân bấm nút Hủy ép trên dịch vụ đã phục vụ. (Nếu thao tác hủy dịch vụ do khách yêu cầu khi chưa phục vụ rẽ nhánh Ngoại lệ 1).
  6. Hệ thống thực hiện lệnh Hủy ép (Void), chuyển trạng thái sang Đã hủy với mức phí phạt 0 VNĐ, tiền hóa đơn tổng tự động giảm xuống và hệ thống ghi log kiểm toán.
- Luồng ngoại lệ:
  - [Ngoại lệ 1 - Rẽ nhánh bước 5] Hủy dịch vụ do khách yêu cầu: Hệ thống tự động tính toán chênh lệch thời gian hẹn giờ và áp dụng mức phạt 50% hoặc 100% nếu khách hủy quá sát giờ theo quy định.
- Hậu điều kiện: Hóa đơn chi phí phụ của khách được cập nhật chính xác.

### UC14: Đổi phòng (Change Room)
- Tên Use Case: Đổi phòng (Change Room)
- Tác nhân: Lễ tân, Quản trị viên.
- Mô tả: Lễ tân chuyển khách sang một phòng khác trong quá trình khách đang lưu trú do yêu cầu hoặc sự cố phòng.
- Tiền điều kiện: Khách đang lưu trú tại phòng.
- Luồng sự kiện chính:
  1. Lễ tân mở chi tiết phòng đang lưu trú và nhấn nút Nâng cấp / Đổi phòng.
  2. Hệ thống hiển thị danh sách các phòng vật lý đang ở trạng thái Sẵn sàng.
  3. Lễ tân chọn một phòng trống mới.
  4. Lễ tân tùy chọn có tích vào ô Đổi/Nâng hạng phòng miễn phí hay không. (Nếu không tích rẽ nhánh sang Luồng phụ 1).
  5. Lễ tân nhấn Xác nhận đổi.
  6. Hệ thống điều chuyển thông tin khách sang phòng mới, đổi trạng thái phòng cũ thành Cần dọn dẹp, phòng mới thành Có khách và giữ nguyên tổng tiền hóa đơn cũ của khách.
- Luồng phụ 1 (Đổi phòng tính phí):
  - Hệ thống tự động tính toán chênh lệch giá giữa hạng phòng cũ và hạng phòng mới đối với các đêm lưu trú còn lại, sau đó cộng/trừ số chênh lệch này vào tổng hóa đơn hiện tại của khách.
- Luồng ngoại lệ: Không có.
- Hậu điều kiện: Khách được chuyển sang phòng mới trên phần mềm, các thông số tài chính và sơ đồ phòng được cập nhật tương ứng.

### UC15: Hủy đơn đặt phòng (Admin)
- Tên Use Case: Hủy đơn đặt phòng (Admin)
- Tác nhân: Lễ tân, Quản trị viên.
- Mô tả: Lễ tân chủ động hủy đơn đặt phòng của khách do khách gọi điện yêu cầu, hoặc khách không đến (No-show).
- Tiền điều kiện: Đơn ở trạng thái Chờ nhận cọc hoặc Đã xác nhận.
- Luồng sự kiện chính:
  1. Lễ tân tìm đơn cần hủy trên giao diện Quản lý đặt phòng.
  2. Lễ tân nhấn nút Hủy đơn.
  3. Hệ thống hiển thị Cảnh báo về thao tác không thể hoàn tác.
  4. Lễ tân đồng ý xác nhận hủy.
  5. Hệ thống áp dụng chính sách hủy tự động, tính toán chênh lệch giờ so với giờ check-in để đưa ra mức phạt và trừ điểm tín nhiệm khách hàng theo quy định.
  6. Hệ thống chuyển trạng thái đơn sang Đã hủy, giải phóng phòng về trạng thái Sẵn sàng và tự động gửi email thông báo hóa đơn hủy cho khách.
- Luồng ngoại lệ: Không có.
- Hậu điều kiện: Đơn bị hủy, phòng vật lý được trả lại hệ thống quỹ phòng trống.

### UC16: Quản lý danh mục (Phòng/Loại phòng)
- Tên Use Case: Quản lý danh mục (Phòng/Loại phòng)
- Tác nhân: Quản trị viên (Admin).
- Mô tả: Admin thêm, sửa, xóa các hạng phòng (Room Type) và các phòng vật lý (Room) tương ứng.
- Tiền điều kiện: Admin đã đăng nhập vào hệ thống.
- Luồng sự kiện chính:
  1. Admin truy cập trang Quản lý Phòng & Loại phòng.
  2. Hệ thống hiển thị danh sách các hạng phòng và phòng vật lý hiện có.
  3. Admin chọn thao tác Thêm/Sửa một hạng phòng hoặc phòng vật lý.
  4. Hệ thống hiển thị form nhập liệu tương ứng (Tên, Giá, Sức chứa, Tiện ích, Số phòng).
  5. Admin điền thông tin và nhấn Lưu. (Nếu dữ liệu không hợp lệ rẽ nhánh sang Ngoại lệ 1).
  6. Hệ thống xác thực dữ liệu, cập nhật vào cơ sở dữ liệu và hiển thị thông báo thành công.
- Luồng ngoại lệ:
  - [Ngoại lệ 1 - Rẽ nhánh bước 5] Dữ liệu trùng lặp (trùng số phòng) hoặc bỏ trống trường bắt buộc: Hệ thống báo lỗi và yêu cầu nhập lại.
  - [Ngoại lệ 2] Xóa phòng/hạng phòng đang có đơn đặt phòng: Hệ thống chặn thao tác xóa và báo lỗi ràng buộc dữ liệu.
- Hậu điều kiện: Thông tin danh mục phòng được cập nhật và hiển thị trên giao diện đặt phòng của khách hàng.

### UC17: Quản lý người dùng và Phân quyền
- Tên Use Case: Quản lý người dùng và Phân quyền
- Tác nhân: Quản trị viên (Admin).
- Mô tả: Admin xem danh sách tài khoản, khóa/mở khóa tài khoản khách hàng, hoặc cấp quyền Lễ tân cho nhân viên.
- Tiền điều kiện: Admin đã đăng nhập vào hệ thống.
- Luồng sự kiện chính:
  1. Admin truy cập trang Quản lý tài khoản.
  2. Hệ thống hiển thị danh sách tất cả người dùng kèm vai trò (Role) và trạng thái.
  3. Admin tìm kiếm tài khoản cần xử lý.
  4. Admin chọn thao tác Đổi quyền (cấp quyền Receptionist) hoặc Khóa tài khoản (Inactive).
  5. Hệ thống hiển thị hộp thoại xác nhận.
  6. Admin đồng ý xác nhận.
  7. Hệ thống cập nhật trạng thái/vai trò vào cơ sở dữ liệu và thông báo thành công.
- Luồng ngoại lệ:
  - [Ngoại lệ 1] Admin tự khóa tài khoản của chính mình: Hệ thống chặn thao tác và báo lỗi không hợp lệ.
- Hậu điều kiện: Quyền hạn hoặc trạng thái truy cập của người dùng bị thay đổi ngay lập tức.

### UC18: Cấu hình giá động (Surcharge)
- Tên Use Case: Cấu hình giá động (Surcharge)
- Tác nhân: Quản trị viên (Admin).
- Mô tả: Admin thiết lập các khoảng thời gian Lễ/Tết hoặc mùa cao điểm và mức phần trăm phụ thu giá phòng tương ứng.
- Tiền điều kiện: Admin đã đăng nhập vào hệ thống.
- Luồng sự kiện chính:
  1. Admin truy cập trang Cấu hình Giá động theo mùa.
  2. Hệ thống tải danh sách các quy tắc phụ thu đang có.
  3. Admin nhấn nút Thêm quy tắc mới.
  4. Admin nhập Tên dịp lễ, Ngày bắt đầu, Ngày kết thúc và % Phụ thu. (Nếu ngày kết thúc trước ngày bắt đầu rẽ nhánh sang Ngoại lệ 1).
  5. Admin nhấn Lưu thay đổi.
  6. Hệ thống lưu quy tắc mới, tự động áp dụng % phụ thu này vào thuật toán tính giá khi khách hàng đặt phòng trong khoảng thời gian trên.
- Luồng ngoại lệ:
  - [Ngoại lệ 1 - Rẽ nhánh bước 4] Ngày kết thúc nhỏ hơn hoặc bằng ngày bắt đầu: Hệ thống báo lỗi và yêu cầu chọn lại khoảng thời gian.
- Hậu điều kiện: Thuật toán tính giá phòng trên toàn hệ thống tự động cập nhật theo cấu hình mới.

### UC19: Xem thống kê và Báo cáo
- Tên Use Case: Xem thống kê và Báo cáo
- Tác nhân: Quản trị viên (Admin).
- Mô tả: Admin xem các biểu đồ thống kê về doanh thu, công suất phòng, và số lượng đơn đặt phòng để đánh giá tình hình kinh doanh.
- Tiền điều kiện: Admin đã đăng nhập vào hệ thống.
- Luồng sự kiện chính:
  1. Admin truy cập trang Tổng quan (Dashboard).
  2. Hệ thống tổng hợp dữ liệu từ các bảng đơn đặt phòng, hóa đơn và phòng vật lý.
  3. Hệ thống hiển thị các thẻ chỉ số tóm tắt (Tổng doanh thu, Tổng đơn, Lượt khách mới).
  4. Hệ thống vẽ biểu đồ đường (Doanh thu theo tháng) và biểu đồ tròn (Tỷ lệ trạng thái phòng).
  5. Admin có thể thay đổi bộ lọc thời gian (Theo tuần, tháng, năm) để xem chi tiết.
- Luồng ngoại lệ:
  - [Ngoại lệ 1] Lỗi truy vấn dữ liệu lớn: Hệ thống hiển thị thông báo đang tải dữ liệu hoặc lỗi kết nối nếu timeout.
- Hậu điều kiện: Admin nắm bắt được số liệu tài chính và hiệu suất hoạt động của khách sạn.

### UC20: Quản lý mã giảm giá (Coupon)
- Tên Use Case: Quản lý mã giảm giá
- Tác nhân: Quản trị viên (Admin).
- Mô tả: Admin tạo mới, chỉnh sửa, khóa hoặc xóa các mã khuyến mãi dành cho khách hàng.
- Tiền điều kiện: Admin đã đăng nhập vào hệ thống.
- Luồng sự kiện chính:
  1. Admin truy cập trang Quản lý Khuyến mãi.
  2. Hệ thống hiển thị danh sách các mã Coupon hiện có kèm số lượt đã dùng và trạng thái.
  3. Admin nhấn Tạo mã mới.
  4. Admin nhập mã code, loại giảm giá, giá trị giảm, đơn tối thiểu, hạn sử dụng và số lượng tối đa.
  5. Admin nhấn Xác nhận. (Nếu bỏ trống mã code hoặc giá trị rẽ nhánh sang Ngoại lệ 1).
  6. Hệ thống kiểm tra mã code có bị trùng không. (Nếu trùng rẽ nhánh sang Ngoại lệ 2).
  7. Hệ thống lưu mã giảm giá mới và đưa vào trạng thái Hoạt động.
- Luồng ngoại lệ:
  - [Ngoại lệ 1 - Rẽ nhánh bước 5] Thiếu thông tin bắt buộc: Hệ thống cảnh báo yêu cầu nhập đầy đủ.
  - [Ngoại lệ 2 - Rẽ nhánh bước 6] Mã code đã tồn tại: Hệ thống báo lỗi và yêu cầu nhập mã khác.
- Hậu điều kiện: Khách hàng có thể sử dụng mã giảm giá này ở bước thanh toán nếu đơn hàng thỏa mãn điều kiện.

---

## 9. Thiết kế kiến trúc giao tiếp (RESTful API)

Hệ thống được thiết kế theo chuẩn RESTful API, giao tiếp giữa Client (React) và Server (Node.js/Express) thông qua định dạng JSON. Dưới đây là đặc tả các endpoint cốt lõi theo từng nhóm nghiệp vụ:

### 9.1 Đặc tả nhóm API Xác thực & Người dùng

| Method | Endpoint | Quyền truy cập | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/pre-register` | Public | Tiếp nhận thông tin cá nhân, tạo mã OTP gửi qua Email. |
| **POST** | `/api/auth/verify-and-create` | Public | Xác thực mã OTP hợp lệ và lưu trữ thông tin người dùng vào CSDL. |
| **POST** | `/api/auth/login` | Public | Xác thực thông tin, trả về `AccessToken` và gắn `refreshToken` ngầm vào HTTPOnly Cookie. |
| **POST** | `/api/auth/refresh-token` | Public | Đọc Refresh Token trong Cookie và cấp lại Access Token mới để duy trì phiên đăng nhập. |
| **GET** | `/api/users/profile` | User/Admin | Lấy thông tin hồ sơ cá nhân, điểm tín nhiệm và cấp bậc hạng thành viên hiện tại. |
| **PUT** | `/api/users/profile` | User/Admin | Cập nhật thông tin cá nhân (Họ tên, SĐT, CCCD) và upload ảnh đại diện. |

### 9.2 Đặc tả nhóm API Nghiệp vụ Đặt phòng

| Method | Endpoint | Quyền truy cập | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/bookings` | User | Tạo đơn đặt phòng mới (Kích hoạt khóa Optimistic Locking, tính toán phụ thu mùa cao điểm, Coupon, điểm tín nhiệm). |
| **GET** | `/api/bookings/user` | User | Truy xuất lịch sử đặt phòng của người dùng hiện hành để hiển thị tại Profile. |
| **POST** | `/api/bookings/walk-in` | Receptionist | Tạo đơn và tự động gán trạng thái Check-in cho khách đến thuê trực tiếp tại quầy. |
| **POST** | `/api/bookings/:id/check-in` | Receptionist | Thực hiện thủ tục nhận phòng. Tự động lùi ngày check-in và tính phụ thu tiền đêm nếu khách đến sớm trước ngày. |
| **POST** | `/api/bookings/:id/check-out` | Receptionist | Thực hiện trả phòng. Tự động tính toán phí phạt trả trễ và xuất hóa đơn PDF trực tiếp (Streaming buffer). |
| **POST** | `/api/bookings/:id/cancel` | User/Receptionist/Admin | Xử lý hủy đơn đặt phòng, tự động tính toán phí phạt hoàn cọc (100%, 50%, 0%) theo thời gian và trừ điểm tín nhiệm. |
| **PUT** | `/api/bookings/:id/change-room` | Receptionist | Thực hiện đổi phòng vật lý hoặc nâng hạng miễn phí (Free Upgrade) cho khách đang lưu trú. |
| **GET** | `/api/bookings/:id/invoice` | User/Receptionist/Admin | Kết xuất và tải xuống bản sao hóa đơn định dạng PDF (yêu cầu đơn đã Check-out). Ghi Log kiểm toán nếu thao tác từ hệ thống quản trị. |

### 9.3 Đặc tả nhóm API Dịch vụ và Quản trị hệ thống

| Method | Endpoint | Quyền truy cập | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/services` | Public | Lấy danh sách các dịch vụ bổ sung lưu trú (Phân loại Immediate / PreOrder). |
| **POST** | `/api/services` | Admin | Quản trị viên thêm mới một danh mục dịch vụ vào hệ thống. |
| **POST** | `/api/folios/order` | User/Receptionist/Admin | Gọi thêm dịch vụ (Room Service). Logic chặn chốt: Chỉ thành công nếu phòng đang ở trạng thái Checked_in. |
| **DELETE** | `/api/folios/item/:id` | User/Receptionist/Admin | Hủy dịch vụ đã đặt. Áp dụng thuật toán phạt 50%-100% nếu hủy sát giờ hẹn. Lễ tân có đặc quyền Hủy ép (Void) không mất phí. |
| **PUT** | `/api/folios/item/:id/deliver`| Receptionist | Đánh dấu dịch vụ đã được Lễ tân mang lên phòng phục vụ cho khách. |
| **GET** | `/api/admin/bookings` | Admin | Lấy danh sách toàn bộ đơn hàng (Phân trang Pagination, tìm kiếm nội dung, lọc theo thẻ trạng thái). |
| **GET** | `/api/admin/rooms` | Receptionist | Lấy danh sách phòng vật lý kèm trạng thái hiện hành để vẽ lưới Sơ đồ phòng trực quan. |
| **GET** | `/api/surcharges/rules` | Public | Lấy danh sách các cấu hình sự kiện Lễ/Tết đang được kích hoạt để Frontend áp dụng Giá động. |
