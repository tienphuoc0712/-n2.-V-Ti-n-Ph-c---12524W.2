// ===== ĐẶT HÀNG: kiểm tra thông tin nhận hàng rồi tạo đơn =====

var nguoiDat = null;
var kmDatHang = null;

// Giá trị đang được chọn của một nhóm nút radio (ví dụ "mode", "pay")
function layRadio(ten) {
    var o = document.getElementsByName(ten);
    for (var i = 0; i < o.length; i++) {
        if (o[i].checked) {
            return o[i].value;
        }
    }
    return "";
}

// Vẽ phần "Đơn hàng của bạn" bên phải và các dòng tiền
function veTomTat() {
    var hinhThuc = layRadio("mode");
    luuHinhThuc(hinhThuc);
    layId("addrBox").style.display = hinhThuc == "giao_tan_noi" ? "" : "none";     // đến lấy thì không cần địa chỉ
    var dong = layDongGio();
    var html = "";
    for (var i = 0; i < dong.length; i++) {
        html = html + '<div class="sum-line"><span>' + dong[i].soLuong + ' × ' + maHoaChu(dong[i].mon.ten) + '</span><span>' + dinhDangTien(dong[i].thanhTien) + '</span></div>';
    }
    datHTML("sumLines", html);
    var t = tinhTien(layTamTinh(), hinhThuc, kmDatHang);
    datChu("s1", dinhDangTien(t.tamTinh));
    datChu("s2", dinhDangTien(t.phiGiao));
    datChu("s3", "-" + dinhDangTien(t.giamGia));
    datChu("s4", dinhDangTien(t.tong));
}

// Bấm "Xác nhận đặt hàng"
function xacNhanDatHang() {
    var hinhThuc = layRadio("mode");
    var coLoi = false;
    var cacOLoi = document.getElementsByClassName("invalid-msg");
    for (var i = 0; i < cacOLoi.length; i++) {
        cacOLoi[i].textContent = "";
    }
    if (layGiaTri("name") == "") {
        datChu("e-name", "Vui lòng nhập họ tên.");
        coLoi = true;
    }
    if (sdtHopLe(layGiaTri("phone")) == false) {
        datChu("e-phone", "Số điện thoại gồm 10 số, bắt đầu bằng 0.");
        coLoi = true;
    }
    if (hinhThuc == "giao_tan_noi" && layGiaTri("addr") == "") {
        datChu("e-addr", "Vui lòng nhập địa chỉ giao hàng.");
        coLoi = true;
    }
    if (coLoi) {
        return;
    }

    var diaChi = "Nhận tại cửa hàng";
    if (hinhThuc == "giao_tan_noi") {
        diaChi = layGiaTri("addr");
    }
    var kq = taoDonHang({
        email: nguoiDat.email,
        ten: layGiaTri("name"),
        sdt: layGiaTri("phone"),
        diaChi: diaChi,
        ghiChu: layGiaTri("note"),
        hinhThuc: hinhThuc,
        thanhToan: layRadio("pay"),
        maKM: kmDatHang == null ? "" : kmDatHang.ma
    });
    if (kq.ok == false) {
        datChu("e-all", kq.thongBao);
        return;
    }
    try { sessionStorage.removeItem("jb_ma"); } catch (loi) { }
    datHTML("wrap",
        '<div class="dh-xong"><div class="dau-tick">✔</div><h2>ĐẶT HÀNG THÀNH CÔNG</h2>' +
        '<p>Mã đơn hàng của bạn: <b>' + kq.don.ma + '</b><br>Tổng thanh toán: <b>' + dinhDangTien(kq.don.tong) + '</b><br>Trạng thái: Chờ xác nhận</p>' +
        '<a class="btn-jb" href="donhang.html">Theo dõi đơn hàng</a> <a class="btn-line" href="thucdon.html">Tiếp tục mua</a></div>');
    capNhatSoLuongGio();
    window.scrollTo(0, 0);
}

function khoiTaoDatHang() {
    if (duocMuaHang() == false) {              // nhân viên / quản trị không có giỏ hàng
        location.href = "quantri.html";
        return;
    }
    veDauTrangVaChanTrang("giohang.html");
    nguoiDat = layNguoiDangNhap();
    if (nguoiDat == null) {                      // chưa đăng nhập thì sang trang đăng nhập
        location.href = "dangnhap.html?next=dathang.html";
        return;
    }
    if (layDongGio().length == 0) {              // giỏ trống thì quay lại giỏ hàng
        location.href = "giohang.html";
        return;
    }
    layId("name").value = nguoiDat.hoTen;
    layId("phone").value = nguoiDat.sdt;
    try {
        var ma = sessionStorage.getItem("jb_ma");
        if (ma) {
            var kq = kiemTraMa(ma, layTamTinh());
            if (kq.ok) {
                kmDatHang = kq.km;
            }
        }
    } catch (loi) { }
    var o = document.getElementsByName("mode");
    for (var i = 0; i < o.length; i++) {
        o[i].checked = o[i].value == layHinhThuc();
        o[i].onchange = veTomTat;
    }
    layId("place").onclick = xacNhanDatHang;
    veTomTat();
}
