# Website bán đồ ăn nhanh Jollibee (Đồ án 2 – Thiết kế web cơ bản)
Mở `html/trangchu.html` bằng trình duyệt (hoặc `index.html`, hoặc Live Server của VS Code).

## Cấu trúc (mỗi trang có 1 file html + 1 file css + 1 file js riêng)
| Trang | html/ | css/ | js/ |
|---|---|---|---|
| Trang chủ | trangchu.html | trangchu.css | trangchu.js |
| Thực đơn | thucdon.html | thucdon.css | thucdon.js |
| Chi tiết món ăn + đánh giá | chitiet.html | chitiet.css | chitiet.js |
| Giỏ hàng | giohang.html | giohang.css | giohang.js |
| Đặt hàng | dathang.html | dathang.css | dathang.js |
| Đăng nhập / Đăng ký | dangnhap.html | dangnhap.css | dangnhap.js |
| Đơn hàng của tôi | donhang.html | donhang.css | donhang.js |
| Khuyến mãi / Tin tức / Cửa hàng / Dịch vụ / Liên hệ | khuyenmai, tintuc, cuahang, dichvu, lienhe | (cùng tên) | (cùng tên) |
| Quản trị | quantri.html | quantri.css | quantri.js |

- `css/chung.css`: giao diện dùng chung (lưới, nút, biểu mẫu, header, footer, thẻ món ăn, hộp thoại).
- `js/chung.js`: dữ liệu localStorage, giỏ hàng, đơn hàng, tài khoản, header/footer dùng chung.
- `js/dulieu.js`: dữ liệu mẫu (5 combo lấy từ trang thực đơn Jollibee, còn lại là dữ liệu minh họa).

## Tài khoản thử
- Quản trị: `admin@jollibee.vn` / `admin123`
- Nhân viên: `nhanvien@jollibee.vn` / `nv123456`
- Khách hàng: tự đăng ký tại `dangnhap.html`

## Mã giảm giá thử
`JOLLY10` (giảm 10% đơn từ 100.000đ), `FREESHIP` (miễn phí giao, đơn từ 150.000đ), `WELCOME20` (giảm 20.000đ, đơn từ 80.000đ)

## Ghi chú
- Chưa có back-end: dữ liệu lưu trong localStorage của trình duyệt. Muốn xóa dữ liệu thử, xóa site data của trang.
- Mật khẩu chỉ băm đơn giản để minh họa. Thanh toán và giao hàng chỉ mô phỏng.
- Quy tắc nghiệp vụ BR01–BR10 trong báo cáo được cài trong `js/chung.js` và `js/quantri.js`.
