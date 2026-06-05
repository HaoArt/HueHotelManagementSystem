# BÁO CÁO THUYẾT TRÌNH ĐỒ ÁN: HỆ THỐNG QUẢN LÝ KHÁCH SẠN HUE HOTEL

---

## Slide 1: Trang bìa

- **Tên đề tài:** Xây dựng Hệ thống Quản lý Khách sạn Hue Hotel
- **Giảng viên hướng dẫn:** [Tên GVHD]
- **Sinh viên thực hiện:** [Tên Sinh Viên]
- **Mã số sinh viên:** [MSSV]
- **Niên khóa:** [Năm học]

---

## Slide 2: Đặt vấn đề & Lý do

- **Bối cảnh:** Ngành nhà hàng khách sạn (Hospitality) đang yêu cầu sự chuyển đổi số mạnh mẽ để đáp ứng kỳ vọng của khách hàng.
- **Thực trạng yếu kém của các quy trình cũ:**
  - **Quản lý thủ công, thiếu linh hoạt:** Sai sót khi tính phụ thu Lễ/Tết cho từng đêm lưu trú, thất thoát doanh thu khi khách check-in sớm hoặc check-out trễ.
  - **Khủng hoảng Overbooking:** Nhận đặt phòng trùng lặp trên cùng một phòng vật lý do bất đồng bộ dữ liệu, dẫn đến đền bù và mất uy tín.
  - **Rủi ro khách hàng ảo (Spam):** Thiếu cơ chế đánh giá độ tin cậy của khách hàng, khách hàng giữ chỗ ảo và không đến (No-show).
- **Lý do chọn đề tài:** Từ những hạn chế trên, đề tài được thực hiện nhằm xây dựng Hệ thống quản lý toàn diện (Hue Hotel) giúp giải quyết triệt để các bài toán khó trong vận hành:
  - **Minh bạch và tự động hóa tài chính:** Xây dựng các thuật toán tính toán giá động (Dynamic Pricing), tự động hóa việc tính phụ phí Lễ/Tết theo từng đêm, phụ thu Check-in sớm/Check-out trễ và phí phạt hủy dịch vụ một cách chính xác tuyệt đối.
  - **Bảo vệ toàn vẹn dữ liệu (Chống Overbooking):** Áp dụng kỹ thuật Optimistic Locking ở cấp độ cơ sở dữ liệu để ngăn chặn hoàn toàn tình trạng trùng phòng khi có nhiều khách hàng cùng đặt phòng một lúc.
  - **Quản trị rủi ro thông minh:** Áp dụng hệ thống "Điểm tín nhiệm" (Trust Score) để đánh giá hành vi khách hàng, kết hợp với các tác vụ nền tự động (Cron Job) dọn dẹp đơn ảo, bảo vệ dòng tiền và tối ưu công suất phòng trống cho khách sạn.

> **🎙️ Kịch bản thuyết trình (Speaker Notes):**
> "Thưa Thầy/Cô, thực tế hiện nay nhiều phần mềm khách sạn nhỏ lẻ vẫn tính toán tiền phụ thu lễ tết bằng tay, hoặc gặp lỗi khi khách hàng Check-in sớm, Check-out trễ dẫn đến thất thoát doanh thu. Đặc biệt, vấn đề 'Overbooking' (trùng phòng) luôn là nỗi ám ảnh. Đó là lý do em quyết định xây dựng Hue Hotel - một phần mềm tự động hóa toàn bộ quy trình tính toán này một cách minh bạch và an toàn nhất."

---

## Slide 3: Mục tiêu của Hệ thống

- **Đối với Khách hàng:** Cung cấp trải nghiệm đặt phòng liền mạch, áp dụng giá động (khuyến mãi, hạng thành viên) và minh bạch hóa đơn đến từng đồng phụ phí.
- **Đối với Lễ tân:** Cung cấp sơ đồ phòng thời gian thực, tự động hóa hoàn toàn các thuật toán tính tiền phức tạp (thuê theo giờ, lố ngày, phạt hủy dịch vụ).
- **Đối với Quản trị viên:** Quản trị cấu hình giá động theo mùa cao điểm, kiểm soát rủi ro tự động và quản lý khách hàng bằng Điểm tín nhiệm (Trust Score).

> **🎙️ Kịch bản thuyết trình (Speaker Notes):**
> "Hệ thống hướng tới 3 đối tượng. Với khách hàng: Trải nghiệm đặt phòng mượt mà, minh bạch từng đồng phụ phí. Với Lễ tân: Tự động hóa mọi thuật toán tính tiền phát sinh, không cần bấm máy tính tay. Với Quản lý: Kiểm soát doanh thu động theo mùa và đánh giá được độ tin cậy của khách hàng."

---

## Slide 4: Công nghệ & Kiến trúc Hệ thống

- **Mô hình kiến trúc:** Client - Server (RESTful API).
- **Frontend:** ReactJS, Material-UI (MUI) - Thiết kế UI Luxury Glassmorphism, tối ưu hiệu suất bằng kỹ thuật Memoization (`useMemo`).
- **Backend:** Node.js, ExpressJS.
- **Cơ sở dữ liệu:** MySQL.
- **Giải pháp Kỹ thuật Nổi bật:**
  - **Bảo mật:** Xác thực bằng hệ thống JWT nằm trong HTTPOnly Cookie (chống XSS), chặn spam API bằng Express Rate-limit.
  - **Tối ưu tài nguyên:** Kỹ thuật xuất PDF hóa đơn bằng Streaming Buffer (chống cạn kiệt RAM cho Server), chạy tự động bằng Node-cron.

> **🎙️ Kịch bản thuyết trình (Speaker Notes):**
> "Về công nghệ, em sử dụng ReactJS và Node.js. Tuy nhiên, điểm nhấn nằm ở cách em xử lý bài toán hiệu suất và bảo mật. Em không dùng LocalStorage để lưu Token mà dùng HTTPOnly Cookie để chống lại tấn công XSS. Để xuất hóa đơn PDF, em sử dụng kỹ thuật 'Streaming Buffer' đẩy trực tiếp luồng byte về Client, giúp Server Node.js không bị tràn RAM kể cả khi có 50 khách hàng tải hóa đơn cùng lúc."

---

## Slide 5: Phân tích Hệ thống (Sơ đồ Use Case)

- **Luồng Khách hàng:** Tìm phòng trống, Đặt phòng trực tuyến (Online Booking), Hủy phòng có điều kiện, Gọi dịch vụ (Room Service), Đánh giá trải nghiệm.
- **Luồng Lễ tân (Vận hành):** Kiểm soát sơ đồ phòng, Xử lý khách Walk-in, Check-in/Check-out, Đổi phòng/Nâng hạng miễn phí, Xuất hóa đơn và duyệt Dịch vụ.
- **Luồng Quản trị viên:** Phân tích tài chính qua Dashboard, Quản lý cấu hình Phụ thu mùa cao điểm, Quản lý Coupon và kiểm toán qua Nhật ký hệ thống (Audit Logs).

> **🎙️ Kịch bản thuyết trình (Speaker Notes):**
> "Đây là sơ đồ Use Case tổng quát, bao phủ toàn bộ vòng đời của một quy trình lưu trú: Từ tìm phòng, đặt cọc, nhận phòng, gọi dịch vụ đến lúc xuất hóa đơn và đánh giá."

---

## Slide 6: Nghiệp vụ cốt lõi 1 - Đặt phòng & Chống Overbooking

- **Quy định thanh toán thông minh:** Các đơn hàng có giá trị > 4.000.000đ hoặc khoảng cách đặt phòng > 14 ngày bị hệ thống tước quyền "Thanh toán tại quầy", bắt buộc cọc Online.
- **Giải quyết triệt để Overbooking bằng Optimistic Locking:**
  - Quản lý phiên bản (Version Control): Gán trường `version` cho mỗi phòng vật lý.
  - Cập nhật trạng thái phòng kèm điều kiện đối chiếu `version`. Nếu 2 khách cùng bấm thanh toán 1 phòng trong cùng 1 mili-giây, giao dịch chậm hơn sẽ bị MySQL từ chối (0 row affected).
  - Hệ thống tự động Rollback giao dịch tài chính và báo lỗi khéo léo cho người dùng, đảm bảo không bao giờ trùng phòng.

> **🎙️ Kịch bản thuyết trình (Speaker Notes):**
> "Khi khách đặt phòng, bài toán khó nhất là: Chuyện gì xảy ra nếu 2 khách cùng bấm thanh toán 1 căn phòng vào cùng 1 tích tắc? Để chống Overbooking, thay vì dùng Pessimistic Lock làm chậm Database, em áp dụng **Optimistic Locking** ở mức DB. Em gán 1 trường `version` cho phòng. Câu lệnh Update của em là: Cập nhật phòng bằng Bận với điều kiện version hiện tại phải bằng version lúc khách nhìn thấy. Người thứ 2 gửi lệnh đến chậm hơn 1 mili-giây, version đã thay đổi, MySQL sẽ trả về 0 row affected. Lúc này, hệ thống lập tức Rollback giao dịch tài chính và báo lỗi. Hoàn toàn không có chuyện trùng phòng."

---

## Slide 7: Nghiệp vụ cốt lõi 2 - Thuật toán Giá động & Khuyến mãi

- **Công thức định giá đa tầng:** `Giá cuối = (Giá gốc x Số đêm) + Phụ thu Lễ Tết - Giảm giá Hạng thành viên - Khuyến mãi Coupon`.
- **Thuật toán quét phụ thu chính xác:** Tránh việc nhân gộp chung một cách máy móc, hệ thống chạy vòng lặp quét qua _từng đêm lưu trú_ để truy vết và cộng đúng % phụ thu của đêm đó.
- **Minh bạch hóa tài chính tuyệt đối:**
  - Tách bạch rõ _Tiền phòng gốc_ và _Tiền phụ thu_ trên hóa đơn PDF.
  - Tự động đóng dấu Ghi chú Hệ thống giải trình dòng tiền (ví dụ: `[Hệ thống: Phụ thu lố 2 đêm (400,000đ)]`).

> **🎙️ Kịch bản thuyết trình (Speaker Notes):**
> "Về tài chính, khi khách đặt 5 đêm, hệ thống của em không nhân dồn một cách máy móc. Nó chạy vòng lặp quét qua _từng đêm một_ để dò xem đêm nào chạm mốc Lễ Tết thì mới cộng % phụ thu của đêm đó. Đặc biệt, để minh bạch hóa đơn, hệ thống tự động bóc tách tiền phụ thu và đóng dấu một câu ghi chú ví dụ: '[Hệ thống: Phụ thu ở lố 2 đêm (400,000đ)]' lưu thẳng vào Database. Khách hàng nhìn hóa đơn sẽ hiểu ngay dòng tiền."

---

## Slide 8: Nghiệp vụ cốt lõi 3 - Check-in và Check-out thông minh

- **Tự động hóa Check-in sớm:** Thuật toán tự nhận diện lùi lịch nhận phòng, đếm số đêm phát sinh thực tế và tự quét xem các đêm đó có dính Lễ/Tết không để thu đúng tiền.
- **Xử lý Check-out (Trả phòng) thông minh:**
  - _Trả phòng trễ (Late Check-out):_ Tự động nhận diện khung giờ để phạt 30%, 50% hoặc 100% giá gốc.
  - _Ở lố ngày (Overstay):_ Tự động cộng dồn tiền phòng và quét phụ thu Lễ/Tết cho các đêm bị lố.
  - _Chống lách luật thuê theo giờ:_ Hệ thống chỉ kích hoạt tính tiền Day-use (30% cho 2h đầu) NẾU khách nhận và trả phòng trong cùng 1 ngày. Khách trả phòng sớm (Early Check-out) vẫn bị thu đủ doanh thu cam kết ban đầu.

> **🎙️ Kịch bản thuyết trình (Speaker Notes):**
> "Đây là phần tự động hóa em tâm đắc nhất. Khi Check-in sớm trước ngày: Hệ thống tự lùi lịch, đếm số đêm phát sinh và quét luôn xem các đêm phát sinh đó có dính lễ tết không để thu đúng tiền. Khi Check-out: Hệ thống tự nhận diện trả trễ để phạt 30-100%. Đặc biệt, để chống thất thoát do Early Check-out: Nếu khách đặt 10 ngày nhưng ngày thứ 2 đã đòi về, hệ thống vẫn ép thu đủ doanh thu dự kiến 10 ngày ban đầu, chỉ tính giá thuê theo giờ (Day-use) nếu khách đi và về trong cùng 1 ngày."

---

## Slide 9: Nghiệp vụ cốt lõi 4 - Quản lý Dịch vụ phát sinh (Folio)

- **Phân loại dịch vụ linh hoạt:** Cung cấp dịch vụ dùng ngay (Immediate) và dịch vụ Đặt trước hẹn giờ (PreOrder).
- **Thuật toán Phạt hủy dịch vụ (Cancellation Fee):** Khống chế rủi ro khách "bùng" nhà hàng.
  - Hủy trước 2 tiếng so với giờ hẹn: Hệ thống cho phép hủy miễn phí.
  - Hủy trong vòng 2 tiếng sát giờ: Tự động phạt 50% giá trị dịch vụ.
  - Hủy sau giờ hẹn: Phạt 100% giá trị dịch vụ.
- **Quyền Hủy ép (Void):** Tính năng đặc quyền dành cho Lễ tân xử lý các sự cố nội bộ mà không làm khách bị tính phí oan.

> **🎙️ Kịch bản thuyết trình (Speaker Notes):**
> "Với dịch vụ Room Service như gọi đồ ăn, em chia làm 2 loại: Dùng ngay và Đặt trước. Với dịch vụ Đặt trước, em có viết thuật toán Phạt hủy. Nếu khách báo hủy trước 2 tiếng: Miễn phí. Hủy sát giờ: Phạt 50%. Khách 'bùng' luôn: Phạt 100%. Lễ tân sẽ có đặc quyền nút 'Void' (Hủy ép) để xóa món nếu lỗi do phía bếp nhà hàng."

---

## Slide 10: Quản lý Rủi ro - Điểm tín nhiệm & Cron Job

- **Giải pháp Điểm tín nhiệm (Trust Score):**
  - Thưởng điểm (+20) khi hoàn tất kỳ nghỉ, (+5) khi viết Review.
  - Phạt điểm (-5 đến -20) tùy theo thời gian hủy phòng sớm hay muộn. Khách có Trust Score < 80 tự động mất quyền "Thanh toán tại quầy".
- **Tác vụ nền tự động hóa bằng Node-cron:**
  - Chạy mỗi phút: Quét và thu hồi các phòng bị khách giữ chỗ (Pending) nhưng không thanh toán Online sau 15 phút.
  - Chạy mỗi giờ: Xử lý các đơn No-Show (Khách không đến), hủy đơn và trừ điểm tín nhiệm để giải phóng quỹ phòng cho người khác.

> **🎙️ Kịch bản thuyết trình (Speaker Notes):**
> "Để bảo vệ khách sạn khỏi khách spam giữ chỗ, em tạo ra Hệ thống Điểm tín nhiệm (Trust Score). Điểm dưới 80, hệ thống tước luôn quyền 'Thanh toán tại quầy', bắt buộc phải chuyển khoản 100%. Phía background, em cấu hình 1 Cron Job chạy mỗi phút. Khách chọn thanh toán Online mà sau 15 phút không thấy tiền, Cron Job tự động đá đơn hàng về Cancelled, nhả phòng lại cho khách khác đặt."

---

## Slide 11: Giao diện Khách hàng (Demo)

- _(Chèn hình ảnh/Video Demo)_
- Thiết kế UI mang phong cách Luxury, tối ưu UX với Glassmorphism.
- Màn hình tìm kiếm phòng trực quan.
- Màn hình Profile xem tiến trình Hạng thành viên, Lịch sử đặt phòng và Thẻ hóa đơn minh bạch.

> **🎙️ Kịch bản thuyết trình (Speaker Notes):**
> _(Thao tác web/video)_ "Mời Thầy/Cô xem qua giao diện khách hàng. Em áp dụng phong cách thiết kế Luxury Glassmorphism, mang lại cảm giác sang trọng và trực quan cho người dùng từ khâu tìm phòng đến lúc xem hóa đơn minh bạch."

---

## Slide 12: Giao diện Quản trị & Lễ tân (Demo)

- _(Chèn hình ảnh/Video Demo)_
- Bảng điều khiển (Dashboard) thống kê tài chính trực quan.
- Sơ đồ phòng thông minh: Hiển thị lưới phòng theo trạng thái (Available, Occupied, Dirty). Có chuông cảnh báo nhấp nháy khi khách vừa order dịch vụ (Room Service).

> **🎙️ Kịch bản thuyết trình (Speaker Notes):**
> _(Thao tác web/video)_ "Ở trang Admin, em có áp dụng kỹ thuật 'Short Polling' kết hợp với VisibilityState của trình duyệt. Tức là Lễ tân cứ mở tab để đó, mỗi 15 giây hệ thống tự lấy đơn mới ngầm ở dưới mà không làm giật màn hình. Nhưng nếu Lễ tân thu nhỏ tab lại, luồng gọi API sẽ tự tắt để tiết kiệm tài nguyên Server."

---

## Slide 13: Đánh giá hệ thống - Ưu điểm nổi bật

- **Độ thực tiễn cao:** Mô phỏng hoàn hảo các luồng nghiệp vụ khắt khe của Khách sạn 4-5 sao (Phạt hủy dịch vụ, thuật toán phụ thu theo đêm, quy tắc đổi phòng).
- **Bảo vệ toàn vẹn dữ liệu (Data Integrity):** Áp dụng DB Transaction (`beginTransaction`) cho luồng Đặt phòng và **Optimistic Locking** chống Overbooking tuyệt đối.
- **Tối ưu hiệu suất & Tài nguyên:** Kỹ thuật Streaming Buffer xuất file PDF trực tiếp, giúp Server Node.js không bị cạn kiệt RAM khi có hàng loạt người dùng thao tác.
- **Bảo mật tốt:** JWT nằm trong HTTPOnly Cookie chống XSS, chặn Spam/DDoS hệ thống bằng thư viện Express Rate-limit.

> **🎙️ Kịch bản thuyết trình (Speaker Notes):**
> "Tóm lại, ưu điểm lớn nhất của đồ án là độ thực tiễn rất cao, mô phỏng chuẩn xác các nghiệp vụ phạt tài chính. Về mặt kỹ thuật, hệ thống an toàn trước Overbooking, chống DDoS Spam OTP bằng Rate-limit, và xuất file PDF tối ưu RAM."

---

## Slide 14: Đánh giá hệ thống - Nhược điểm & Rủi ro

- **Nguy cơ bất đồng bộ dữ liệu ở các luồng phụ:** Dù Đặt phòng đã bọc DB Transaction, nhưng API Check-in/Check-out đang gọi nhiều lệnh Update liên tiếp (Đổi trạng thái phòng, cộng điểm, tính tiền) mà chưa có Transaction. Nếu cúp điện, dữ liệu sẽ bị lỗi nửa vời.
- **Rủi ro Race Condition ở mã giảm giá (Coupon):** Hệ thống chưa khóa dữ liệu ở tầng truy vấn, nếu 2 người cùng bấm dùng 1 mã giảm giá ở lượt sử dụng cuối cùng, Coupon sẽ bị lạm dụng âm lượt.
- **Rủi ro vận hành đa quốc gia (Timezone):** Hệ thống tính toán đang phụ thuộc vào múi giờ cục bộ của Server (`new Date()`). Cron Job tự động xử lý No-show có thể chạy sai thời gian nếu Khách sạn ở Việt Nam nhưng Server đặt tại Mỹ.

> **🎙️ Kịch bản thuyết trình (Speaker Notes):**
> "Tuy nhiên, với tư cách là một kỹ sư, em nhận thấy hệ thống vẫn còn rủi ro. Nhược điểm lớn nhất là Thiếu DB Transaction ở luồng Check-in/Check-out. Ở luồng Đặt phòng em đã có Transaction, nhưng ở luồng Check-in em đang gọi 3-4 lệnh Update liên tiếp. Nếu cúp điện giữa chừng, dữ liệu sẽ bị hỏng."

---

## Slide 15: Các biện pháp tối ưu hệ thống

- **Những gì đã đạt được:**
  - Tối ưu UI/UX: Sử dụng React `useMemo` chống giật lag.
  - Áp dụng Giao diện phản hồi giả lập (Perceived Performance) tạo cảm giác phần mềm phản hồi tức thì.
- **Giải pháp khắc phục nhược điểm:**
  - Mở rộng áp dụng `db.beginTransaction()` đồng bộ cho mọi API thao tác tài chính.
  - Chuyển logic tính tiền ra một `PricingService` độc lập (Service Layer Pattern) để dễ dàng bảo trì và Unit Test.

> **🎙️ Kịch bản thuyết trình (Speaker Notes):**
> "Giải pháp sắp tới của em là mở rộng `db.beginTransaction()` cho mọi luồng. Đồng thời, em sẽ refactor code, tách các thuật toán tính tiền khổng lồ ở Controller ra một `PricingService` độc lập để dễ dàng bảo trì và Unit Test hơn."

---

## Slide 16: Hướng phát triển tương lai

- Tích hợp Cổng thanh toán điện tử thực tế (VNPAY, ZaloPay, Momo) để thay thế cho việc xác nhận chuyển khoản thủ công bằng mã QR.
- Triển khai hệ thống Caching bằng Redis để tăng tốc độ phản hồi đối với các API tra cứu phòng trống.
- Tích hợp AI Chatbot để tự động tư vấn, trả lời các thắc mắc của khách hàng về tiện ích khách sạn.

> **🎙️ Kịch bản thuyết trình (Speaker Notes):**
> "Trong tương lai, em sẽ tích hợp cổng thanh toán VNPAY/Momo thay cho chuyển khoản thủ công, và dùng Redis Cache để tăng tốc API tìm phòng trống lên gấp 10 lần."

---

## Slide 17: Kết luận & Q&A

- **Kết luận:** Đồ án đã xây dựng thành công một hệ thống quản lý khách sạn không chỉ đáp ứng tốt các yêu cầu cơ bản (CRUD) mà còn giải quyết được các bài toán hóc búa trong quy trình vận hành và tài chính của Khách sạn.
- **Lời cảm ơn:** Chân thành cảm ơn Thầy/Cô đã hướng dẫn và Hội đồng đã lắng nghe.
- **Hỏi đáp (Q&A):** Mời các Thầy/Cô đặt câu hỏi phản biện.

> **🎙️ Kịch bản thuyết trình (Speaker Notes):**
> "Đồ án đã giúp em hiểu sâu sắc về cách kết hợp giữa code và nghiệp vụ kinh doanh thực tế. Em xin chân thành cảm ơn Thầy/Cô đã lắng nghe. Em rất mong nhận được những câu hỏi và góp ý từ Hội đồng ạ."
