/* ===== DỮ LIỆU MẪU CỦA WEBSITE =====
   5 combo đầu lấy từ trang thực đơn Jollibee, các món còn lại là dữ liệu minh họa.
   Muốn thêm/sửa món ăn, khuyến mãi, tin tức, cửa hàng thì sửa ngay trong file này. */
var DU_LIEU = {
 danhMuc: [
  {"ma":"combo","ten":"Combo Bán Chạy","anh":"https://jollibee.com.vn//media/catalog/category/web-12_1_1.png"},
  {"ma":"ga-gion","ten":"Gà Giòn Vui Vẻ","anh":"https://jollibee.com.vn//media/catalog/category/web_2026-15.2_1.png"},
  {"ma":"mi-y","ten":"Mì Ý Jolly","anh":"https://jollibee.com.vn//media/catalog/category/web_2026-13.2.png"},
  {"ma":"ga-sot-cay","ten":"Gà Sốt Cay","anh":"https://jollibee.com.vn//media/catalog/category/web_2026-14.2.png"},
  {"ma":"burger-com","ten":"Burger/Cơm","anh":"https://jollibee.com.vn//media/catalog/category/web_2026-16.2.png"},
  {"ma":"phan-an-phu","ten":"Phần Ăn Phụ","anh":"https://jollibee.com.vn//media/catalog/category/web_2026-17.png"},
  {"ma":"trang-mieng","ten":"Món Tráng Miệng","anh":"https://jollibee.com.vn//media/catalog/category/web_2026-19.png"},
  {"ma":"thuc-uong","ten":"Thức Uống","anh":"https://jollibee.com.vn//media/catalog/category/web_2026-18.png"}
 ],

 monAn: [
  {"id":1,"danhMuc":"combo","ten":"Một Mình Hít Hà","moTa":"1 Mì ý sốt cay vừa + 1 Gà Sốt cay + 1 Nước ngọt","gia":80000,"giaCao":106000,"anh":"https://jollibee.com.vn/media/catalog/product/cache/9011257231b13517d19d9bae81fd87cc/c/o/combo_1_pax.jpg","banChay":true,"dangBan":true},
  {"id":2,"danhMuc":"combo","ten":"Càng Cay Càng Mê","moTa":"2 Mì ý sốt cay vừa + 1 Gà Sốt cay + 1 Gà Giòn Vui Vẻ + 2 Nước ngọt + 1 Khoai tây chiên vừa","gia":157000,"giaCao":225000,"anh":"https://jollibee.com.vn/media/catalog/product/cache/9011257231b13517d19d9bae81fd87cc/c/o/combo_2_pax.jpg","banChay":true,"dangBan":true},
  {"id":3,"danhMuc":"combo","ten":"Một Mình Ăn Ngon","moTa":"1 Gà Giòn Vui Vẻ + 1 Mì Ý Jolly + 1 Nước ngọt + 1 Tương Chua Ngọt","gia":73000,"giaCao":135000,"anh":"https://jollibee.com.vn/media/catalog/product/cache/9011257231b13517d19d9bae81fd87cc/7/3/73k_1_m_jolly_v_a_1_mi_ng_g_gi_n_vui_v_1_n_c_ng_t_v_a.jpg","banChay":true,"dangBan":true},
  {"id":4,"danhMuc":"combo","ten":"Cặp Đôi Ăn Ý","moTa":"2 Gà Giòn Vui Vẻ + 2 Mì Ý Jolly vừa + 1 Khoai tây chiên vừa + 2 Nước ngọt vừa + 2 Tương Chua Ngọt + 1 Tương Cà","gia":145000,"giaCao":225000,"anh":"https://jollibee.com.vn/media/catalog/product/cache/9011257231b13517d19d9bae81fd87cc/1/4/145k_c_p_i_n__1.jpg","banChay":false,"dangBan":true},
  {"id":5,"danhMuc":"combo","ten":"Cả Nhà No Nê","moTa":"3 Gà giòn vui vẻ + 2 Mì Ý Jolly vừa + 1 Khoai tây chiên vừa + 3 Nước ngọt vừa + 3 Tương Chua Ngọt + 1 Tương Cà","gia":185000,"giaCao":282000,"anh":"https://jollibee.com.vn/media/catalog/product/cache/9011257231b13517d19d9bae81fd87cc/1/8/185k_3_mi_ng_g_gi_n_vui_v_2_m_jolly_1_khoai_t_y_chi_n_v_a_3_n_c_ng_t_v_a.jpg","banChay":false,"dangBan":true},
  {"id":6,"danhMuc":"ga-gion","ten":"1 Miếng Gà Giòn Vui Vẻ","moTa":"Gà giòn rụm, thấm mềm, ngon trọn vị","gia":36000,"giaCao":36000,"anh":"","banChay":true,"dangBan":true},
  {"id":7,"danhMuc":"ga-gion","ten":"2 Miếng Gà Giòn Vui Vẻ","moTa":"2 miếng gà giòn tan, thấm vị","gia":70000,"giaCao":70000,"anh":"","banChay":false,"dangBan":true},
  {"id":8,"danhMuc":"ga-gion","ten":"3 Miếng Gà Giòn Vui Vẻ","moTa":"Phần gà dành cho 2 người ăn","gia":104000,"giaCao":104000,"anh":"","banChay":false,"dangBan":true},
  {"id":9,"danhMuc":"ga-gion","ten":"6 Miếng Gà Giòn Vui Vẻ","moTa":"Phần gà chia sẻ cho cả nhóm","gia":204000,"giaCao":204000,"anh":"","banChay":false,"dangBan":true},
  {"id":10,"danhMuc":"mi-y","ten":"Mì Ý Jolly (Vừa)","moTa":"Mì Ý sốt bò bằm, nhiều thịt, đậm phô mai","gia":29000,"giaCao":29000,"anh":"","banChay":true,"dangBan":true},
  {"id":11,"danhMuc":"mi-y","ten":"Mì Ý Jolly (Lớn)","moTa":"Phần mì Ý lớn cho người ăn khỏe","gia":39000,"giaCao":39000,"anh":"","banChay":false,"dangBan":true},
  {"id":12,"danhMuc":"mi-y","ten":"Mì Ý Sốt Cay","moTa":"Mì Ý sốt cay vừa, đậm đà","gia":35000,"giaCao":35000,"anh":"","banChay":false,"dangBan":true},
  {"id":13,"danhMuc":"ga-sot-cay","ten":"1 Miếng Gà Sốt Cay","moTa":"Gà phủ sốt cay đậm vị","gia":39000,"giaCao":39000,"anh":"","banChay":true,"dangBan":true},
  {"id":14,"danhMuc":"ga-sot-cay","ten":"2 Miếng Gà Sốt Cay","moTa":"Hai miếng gà sốt cay","gia":76000,"giaCao":76000,"anh":"","banChay":false,"dangBan":true},
  {"id":15,"danhMuc":"ga-sot-cay","ten":"3 Miếng Gà Sốt Cay","moTa":"Phần gà sốt cay cho nhóm bạn","gia":112000,"giaCao":112000,"anh":"","banChay":false,"dangBan":true},
  {"id":16,"danhMuc":"burger-com","ten":"Burger Gà Giòn","moTa":"Burger gà giòn, rau tươi, sốt mayo","gia":45000,"giaCao":45000,"anh":"","banChay":false,"dangBan":true},
  {"id":17,"danhMuc":"burger-com","ten":"Burger Bò Phô Mai","moTa":"Bò nướng, phô mai tan chảy","gia":52000,"giaCao":52000,"anh":"","banChay":false,"dangBan":true},
  {"id":18,"danhMuc":"burger-com","ten":"Cơm Gà Giòn","moTa":"Cơm trắng, gà giòn, nước sốt đặc biệt","gia":49000,"giaCao":49000,"anh":"","banChay":false,"dangBan":true},
  {"id":19,"danhMuc":"burger-com","ten":"Cơm Gà Sốt Cay","moTa":"Cơm trắng với gà sốt cay","gia":55000,"giaCao":55000,"anh":"","banChay":false,"dangBan":true},
  {"id":20,"danhMuc":"phan-an-phu","ten":"Khoai Tây Chiên (Vừa)","moTa":"Khoai chiên vàng giòn","gia":25000,"giaCao":25000,"anh":"","banChay":false,"dangBan":true},
  {"id":21,"danhMuc":"phan-an-phu","ten":"Khoai Tây Chiên (Lớn)","moTa":"Phần khoai lớn để chia sẻ","gia":32000,"giaCao":32000,"anh":"","banChay":false,"dangBan":true},
  {"id":22,"danhMuc":"phan-an-phu","ten":"Salad Bắp Cải","moTa":"Salad tươi mát ăn kèm gà","gia":18000,"giaCao":18000,"anh":"","banChay":false,"dangBan":true},
  {"id":23,"danhMuc":"trang-mieng","ten":"Kem Sundae Dâu","moTa":"Kem tươi phủ sốt dâu","gia":15000,"giaCao":15000,"anh":"","banChay":false,"dangBan":true},
  {"id":24,"danhMuc":"trang-mieng","ten":"Kem Sundae Socola","moTa":"Kem tươi phủ sốt socola","gia":15000,"giaCao":15000,"anh":"","banChay":false,"dangBan":true},
  {"id":25,"danhMuc":"trang-mieng","ten":"Bánh Xoài","moTa":"Bánh vỏ giòn nhân xoài","gia":22000,"giaCao":22000,"anh":"","banChay":false,"dangBan":true},
  {"id":26,"danhMuc":"thuc-uong","ten":"Nước Ngọt (Vừa)","moTa":"Nước ngọt có gas, ướp lạnh","gia":15000,"giaCao":15000,"anh":"","banChay":false,"dangBan":true},
  {"id":27,"danhMuc":"thuc-uong","ten":"Nước Ngọt (Lớn)","moTa":"Ly lớn giải khát","gia":19000,"giaCao":19000,"anh":"","banChay":false,"dangBan":true},
  {"id":28,"danhMuc":"thuc-uong","ten":"Trà Đào","moTa":"Trà đào thanh mát","gia":25000,"giaCao":25000,"anh":"","banChay":false,"dangBan":true},
  {"id":29,"danhMuc":"thuc-uong","ten":"Nước Suối","moTa":"Nước khoáng đóng chai","gia":10000,"giaCao":10000,"anh":"","banChay":false,"dangBan":true}
 ],

 khuyenMai: [
  {"id":1,"tieuDe":"Giảm 10% đơn từ 100.000đ","ma":"JOLLY10","loai":"phan_tram","giaTri":10,"toiThieu":100000,"moTa":"Áp dụng cho mọi đơn hàng đặt online từ 100.000đ.","dangBan":true},
  {"id":2,"tieuDe":"Miễn phí giao hàng","ma":"FREESHIP","loai":"mien_phi_ship","giaTri":0,"toiThieu":150000,"moTa":"Miễn phí giao hàng cho đơn từ 150.000đ.","dangBan":true},
  {"id":3,"tieuDe":"Giảm 20.000đ cho khách mới","ma":"WELCOME20","loai":"so_tien","giaTri":20000,"toiThieu":80000,"moTa":"Dành cho đơn đầu tiên từ 80.000đ.","dangBan":true}
 ],

 tinTuc: [
  {"id":1,"tieuDe":"Gà Giòn Vui Vẻ – ngon giòn rụm, triệu người yêu","ngay":"2026-09-20","noiDung":"Gà Giòn Vui Vẻ được tẩm ướp đậm đà, chiên giòn rụm, giữ trọn độ mềm ngọt bên trong."},
  {"id":2,"tieuDe":"Mì Ý Jolly phiên bản nhiều thịt, đậm phô mai","ngay":"2026-09-12","noiDung":"Sốt bò bằm đậm đà cùng phô mai phủ dày, món ăn quen thuộc của mọi lứa tuổi."},
  {"id":3,"tieuDe":"Combo cặp đôi ăn ý – ưu đãi đến 145.000đ","ngay":"2026-09-01","noiDung":"Hai phần gà giòn, hai phần mì Ý, khoai tây chiên và nước ngọt cho buổi hẹn trọn vị."},
  {"id":4,"tieuDe":"Cách đặt món online nhanh trong 4 bước","ngay":"2026-08-25","noiDung":"Chọn món, thêm vào giỏ, nhập địa chỉ nhận hàng và xác nhận – đơn của bạn sẽ được xử lý ngay."}
 ],

 cuaHang: [
  {"ten":"Jollibee – khu vực Quận 1","thanhPho":"TP. Hồ Chí Minh","gioMoCua":"07:00 – 22:00"},
  {"ten":"Jollibee – khu vực Thủ Đức","thanhPho":"TP. Hồ Chí Minh","gioMoCua":"07:00 – 22:00"},
  {"ten":"Jollibee – khu vực Cầu Giấy","thanhPho":"Hà Nội","gioMoCua":"07:00 – 22:00"},
  {"ten":"Jollibee – khu vực Hai Bà Trưng","thanhPho":"Hà Nội","gioMoCua":"07:00 – 22:00"},
  {"ten":"Jollibee – khu vực Hải Châu","thanhPho":"Đà Nẵng","gioMoCua":"07:00 – 21:30"},
  {"ten":"Jollibee – khu vực Ninh Kiều","thanhPho":"Cần Thơ","gioMoCua":"07:00 – 21:30"}
 ],

 banner: [
  "https://jollibee.com.vn/media/mageplaza/bannerslider/banner/image/b/a/banner_web_-_theme_summer_-_1920x794.jpg",
  "https://jollibee.com.vn/media/mageplaza/bannerslider/banner/image/b/a/banner_web_1920x794px_r2_1_-compressed.jpg",
  "https://jollibee.com.vn/media/mageplaza/bannerslider/banner/image/b/a/banner_web__m_jolly.jpg",
  "https://jollibee.com.vn/media/mageplaza/bannerslider/banner/image/b/a/banner_web_kv_m_cay_phase_2-compressed_1.jpg",
  "https://jollibee.com.vn/media/mageplaza/bannerslider/banner/image/b/a/banner_website_jbvn_-_combo_145k-compressed.jpg",
  "https://jollibee.com.vn/media/mageplaza/bannerslider/banner/image/g/a/ga_sot_cay___banner_web_final-compressed1.jpg",
  "https://jollibee.com.vn/media/mageplaza/bannerslider/banner/image/j/l/jlb_ckj_1920x794.jpg"
 ]
};
