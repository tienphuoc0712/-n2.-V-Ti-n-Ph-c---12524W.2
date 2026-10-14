# Website bán đồ ăn nhanh Jollibee

HTML + CSS + JavaScript + jQuery + Bootstrap 5, không cần cài đặt hay máy chủ.
Mở `TrangChu.html` bằng trình duyệt (hoặc dùng Live Server của VS Code).

## Cấu trúc
- `TrangChu.html`, `ThucDon.html`, `ChiTietMonAn.html`, `GioHang.html`, `DatHang.html`, `DangNhap.html`, `DonHang.html`, `KhuyenMai.html`, `TinTuc.html`, `CuaHang.html`, `DichVu.html`, `LienHe.html`: phân hệ người dùng
- `admin/index.html` + `admin/admin.js`: phân hệ quản trị (đơn hàng, món ăn, khuyến mãi, người dùng, thống kê)
- `js/data.js`: dữ liệu mẫu (5 combo lấy từ trang thực đơn Jollibee, còn lại là dữ liệu minh họa)
- `js/app.js`: lưu trữ bằng localStorage, giỏ hàng, đơn hàng, tài khoản, header/footer dùng chung
- `css/style.css`: giao diện đỏ – vàng theo phong cách Jollibee
- `BieuDo`: các biểu đồ UML (SVG và PNG)

## Tài khoản thử
- Quản trị: `admin@jollibee.vn` / `admin123`
- Nhân viên: `nhanvien@jollibee.vn` / `nv123456`
- Khách hàng: tự đăng ký tại `DangNhap.html`

## Mã giảm giá thử
`JOLLY10` (giảm 10% đơn từ 100.000đ), `FREESHIP` (miễn phí giao, đơn từ 150.000đ), `WELCOME20` (giảm 20.000đ, đơn từ 80.000đ)

## Ghi chú
- Chưa có back-end: dữ liệu lưu trong localStorage của trình duyệt. Muốn xóa dữ liệu thử, xóa site data của trang.
- Mật khẩu chỉ băm đơn giản để minh họa, không dùng cho hệ thống thật.
- Thanh toán và giao hàng chỉ mô phỏng giao diện.
- Quy tắc nghiệp vụ BR01–BR10 trong báo cáo đã được cài trong `js/app.js` và `admin/admin.js`.
