// ===== JAVASCRIPT CƠ BẢN: GIỎ HÀNG LƯU TRONG TRÌNH DUYỆT (localStorage) =====
// localStorage giống một "ngăn kéo" nhỏ trong trình duyệt để lưu dữ liệu dạng chữ.
// Giỏ hàng là một danh sách (mảng), mỗi món có dạng: { ten: "Mì Ý", gia: 29000, soLuong: 2 }

var PHI_GIAO = 15000;   // phí giao hàng cố định

// 1. Lấy giỏ hàng ra từ localStorage
function layGioHang() {
    var chu = localStorage.getItem("gioHang");   // lấy chuỗi đã lưu
    if (chu == null) {
        return [];                               // chưa có gì thì trả về giỏ rỗng
    }
    return JSON.parse(chu);                      // đổi chuỗi thành mảng
}

// 2. Lưu giỏ hàng vào localStorage
function luuGioHang(gioHang) {
    localStorage.setItem("gioHang", JSON.stringify(gioHang));   // đổi mảng thành chuỗi rồi lưu
    capNhatSoLuong();
}

// 3. Bấm nút "Thêm vào giỏ" thì gọi hàm này
function themVaoGio(ten, gia) {
    var gioHang = layGioHang();
    var daCo = false;
    for (var i = 0; i < gioHang.length; i++) {
        if (gioHang[i].ten == ten) {             // món đã có trong giỏ -> tăng số lượng
            if (gioHang[i].soLuong >= 20) {
                alert("Mỗi món chỉ được đặt tối đa 20 phần!");
                return;
            }
            gioHang[i].soLuong = gioHang[i].soLuong + 1;
            daCo = true;
        }
    }
    if (daCo == false) {                         // món chưa có -> thêm mới
        gioHang.push({ ten: ten, gia: gia, soLuong: 1 });
    }
    luuGioHang(gioHang);
    alert("Đã thêm " + ten + " vào giỏ hàng!");
}

// 4. Xóa một món khỏi giỏ (i là vị trí của món trong danh sách)
function xoaMon(i) {
    var gioHang = layGioHang();
    gioHang.splice(i, 1);                        // xóa 1 phần tử tại vị trí i
    luuGioHang(gioHang);
    hienThiGioHang();
}

// 5. Hiện số lượng món trên chữ "Giỏ hàng (0)" ở menu
function capNhatSoLuong() {
    var gioHang = layGioHang();
    var tong = 0;
    for (var i = 0; i < gioHang.length; i++) {
        tong = tong + gioHang[i].soLuong;
    }
    var o = document.getElementById("soLuongGio");
    if (o != null) {
        o.innerHTML = tong;
    }
    hienThiTaiKhoan();      // cập nhật luôn chữ "Xin chào..." trên menu
}

// 6. Vẽ bảng giỏ hàng (dùng ở trang GioHang.html)
function hienThiGioHang() {
    var gioHang = layGioHang();
    var html = "";
    var tamTinh = 0;
    for (var i = 0; i < gioHang.length; i++) {
        var thanhTien = gioHang[i].gia * gioHang[i].soLuong;
        tamTinh = tamTinh + thanhTien;
        html = html + "<tr>" +
            "<td>" + gioHang[i].ten + "</td>" +
            "<td>" + dinhDangTien(gioHang[i].gia) + "</td>" +
            "<td>" + gioHang[i].soLuong + "</td>" +
            "<td>" + dinhDangTien(thanhTien) + "</td>" +
            "<td><button onclick='xoaMon(" + i + ")'>Xóa</button></td>" +
            "</tr>";
    }
    if (gioHang.length == 0) {
        html = "<tr><td colspan='5'>Giỏ hàng đang trống. Hãy vào Thực đơn để chọn món nhé!</td></tr>";
    }
    document.getElementById("bangGioHang").innerHTML = html;
    document.getElementById("tamTinh").innerHTML = dinhDangTien(tamTinh);
}

// 7. Biến số 29000 thành chữ "29.000đ" cho dễ đọc
function dinhDangTien(so) {
    return so.toLocaleString("vi-VN") + "đ";
}

// ================= TÀI KHOẢN (lưu trong localStorage) =================
// Mỗi người dùng có dạng: { hoTen, email, sdt, matKhau, vaiTro }   vaiTro: "khach" hoặc "quantri"

// Lấy danh sách người dùng. Lần đầu chạy sẽ tạo sẵn 1 tài khoản quản trị.
function layNguoiDung() {
    var chu = localStorage.getItem("nguoiDung");
    if (chu == null) {
        var mau = [{ hoTen: "Quản trị viên", email: "admin@jollibee.vn", sdt: "0900000001", matKhau: "admin123", vaiTro: "quantri" }];
        localStorage.setItem("nguoiDung", JSON.stringify(mau));
        return mau;
    }
    return JSON.parse(chu);
}

// Lấy người đang đăng nhập (null nếu chưa đăng nhập)
function layNguoiDangNhap() {
    var email = localStorage.getItem("dangNhap");
    if (email == null) {
        return null;
    }
    var ds = layNguoiDung();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].email == email) {
            return ds[i];
        }
    }
    return null;
}

// Hiện "Xin chào ... | Đăng xuất" hoặc "Đăng nhập" trên menu
function hienThiTaiKhoan() {
    var o = document.getElementById("taiKhoan");
    if (o == null) {
        return;
    }
    var nguoi = layNguoiDangNhap();
    if (nguoi == null) {
        o.innerHTML = "<a href='DangNhap.html'>ĐĂNG KÝ / ĐĂNG NHẬP</a>";
    } else {
        var html = "<a href='DonHang.html'>Xin chào, " + nguoi.hoTen + "</a>";
        if (nguoi.vaiTro == "quantri") {
            html = html + " <a href='QuanTri.html'>Quản trị</a>";
        }
        html = html + " <a href='#' onclick='dangXuat()'>Đăng xuất</a>";
        o.innerHTML = html;
    }
}

// Bấm nút "Đăng ký"
function dangKy() {
    var hoTen = document.getElementById("dkHoTen").value;
    var email = document.getElementById("dkEmail").value;
    var sdt = document.getElementById("dkSdt").value;
    var matKhau = document.getElementById("dkMatKhau").value;

    if (hoTen == "" || email == "" || matKhau == "") {
        alert("Vui lòng nhập đầy đủ họ tên, email và mật khẩu!");
        return false;
    }
    if (email.indexOf("@") == -1) {
        alert("Email không hợp lệ!");
        return false;
    }
    if (sdtHopLe(sdt) == false) {
        alert("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0!");
        return false;
    }
    if (matKhau.length < 6) {
        alert("Mật khẩu phải có ít nhất 6 ký tự!");
        return false;
    }
    var ds = layNguoiDung();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].email == email) {
            alert("Email này đã được đăng ký!");
            return false;
        }
    }
    ds.push({ hoTen: hoTen, email: email, sdt: sdt, matKhau: matKhau, vaiTro: "khach" });
    localStorage.setItem("nguoiDung", JSON.stringify(ds));
    localStorage.setItem("dangNhap", email);        // đăng ký xong tự đăng nhập luôn
    alert("Đăng ký thành công!");
    window.location.href = "TrangChu.html";
    return false;
}

// Bấm nút "Đăng nhập"
function dangNhap() {
    var email = document.getElementById("email").value;
    var matKhau = document.getElementById("matKhau").value;
    var ds = layNguoiDung();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].email == email && ds[i].matKhau == matKhau) {
            localStorage.setItem("dangNhap", email);
            if (ds[i].vaiTro == "quantri") {
                window.location.href = "QuanTri.html";
            } else {
                window.location.href = "TrangChu.html";
            }
            return false;
        }
    }
    alert("Sai email hoặc mật khẩu!");
    return false;
}

function dangXuat() {
    localStorage.removeItem("dangNhap");
    window.location.href = "TrangChu.html";
}

// Kiểm tra số điện thoại: đủ 10 số và bắt đầu bằng 0
function sdtHopLe(sdt) {
    if (sdt.length != 10 || sdt.charAt(0) != "0" || isNaN(sdt)) {
        return false;
    }
    return true;
}

// ================= ĐẶT HÀNG + MÃ GIẢM GIÁ =================
var maDaDung = "";      // mã giảm giá khách đã áp dụng ("" = chưa dùng mã)

// Tính tạm tính của giỏ hàng
function layTamTinh() {
    var gioHang = layGioHang();
    var tam = 0;
    for (var i = 0; i < gioHang.length; i++) {
        tam = tam + gioHang[i].gia * gioHang[i].soLuong;
    }
    return tam;
}

// Đếm số đơn đã đặt của người đang đăng nhập
function demDonCuaToi() {
    var nguoi = layNguoiDangNhap();
    var donHang = JSON.parse(localStorage.getItem("donHang") || "[]");
    var dem = 0;
    for (var i = 0; i < donHang.length; i++) {
        if (nguoi != null && donHang[i].email == nguoi.email) {
            dem = dem + 1;
        }
    }
    return dem;
}

// Tính tiền: tạm tính, giảm giá, phí giao, tổng cộng
// Công thức: tổng = tạm tính - giảm giá + phí giao
function tinhTien() {
    var tam = layTamTinh();
    var giam = 0;
    var phi = PHI_GIAO;
    if (maDaDung == "JOLLY10") {
        giam = Math.round(tam * 0.1);
    } else if (maDaDung == "WELCOME20") {
        giam = Math.round(tam * 0.2);
    } else if (maDaDung == "FREESHIP") {
        phi = 0;
    }
    return { tamTinh: tam, giam: giam, phi: phi, tong: tam - giam + phi };
}

// Bấm nút "Áp dụng" mã giảm giá
function apDungMa() {
    var ma = document.getElementById("maGiamGia").value.toUpperCase().trim();
    var tam = layTamTinh();

    if (ma == "") {
        maDaDung = "";
    } else if (ma == "JOLLY10") {
        if (tam < 100000) { alert("Mã JOLLY10 áp dụng cho đơn từ 100.000đ!"); return; }
        maDaDung = ma;
    } else if (ma == "FREESHIP") {
        if (tam < 150000) { alert("Mã FREESHIP áp dụng cho đơn từ 150.000đ!"); return; }
        maDaDung = ma;
    } else if (ma == "WELCOME20") {
        if (demDonCuaToi() > 0) { alert("Mã WELCOME20 chỉ dành cho khách hàng mới (chưa có đơn nào)!"); return; }
        maDaDung = ma;
    } else {
        alert("Mã giảm giá không tồn tại!");
        return;
    }
    if (ma != "") {
        alert("Áp dụng mã " + ma + " thành công!");
    }
    hienThiTongDatHang();
}

// Trang đặt hàng: hiện các dòng tiền
function hienThiTongDatHang() {
    var t = tinhTien();
    document.getElementById("tamTinh").innerHTML = dinhDangTien(t.tamTinh);
    document.getElementById("giamGia").innerHTML = "-" + dinhDangTien(t.giam);
    document.getElementById("phiGiao").innerHTML = dinhDangTien(t.phi);
    document.getElementById("tongTien").innerHTML = dinhDangTien(t.tong);
    // Nếu đã đăng nhập thì điền sẵn họ tên và số điện thoại
    var nguoi = layNguoiDangNhap();
    if (nguoi != null && document.getElementById("hoTen").value == "") {
        document.getElementById("hoTen").value = nguoi.hoTen;
        document.getElementById("sdt").value = nguoi.sdt;
    }
}

// Bấm nút "Xác nhận đặt hàng": kiểm tra dữ liệu rồi lưu đơn
function xacNhanDatHang() {
    var nguoi = layNguoiDangNhap();
    if (nguoi == null) {
        alert("Bạn cần đăng nhập để đặt hàng!");
        window.location.href = "DangNhap.html";
        return false;
    }
    var gioHang = layGioHang();
    var ten = document.getElementById("hoTen").value;
    var sdt = document.getElementById("sdt").value;
    var diaChi = document.getElementById("diaChi").value;

    if (gioHang.length == 0) {
        alert("Giỏ hàng đang trống!");
        return false;                            // return false = không gửi form đi
    }
    if (ten == "" || diaChi == "") {
        alert("Vui lòng nhập họ tên và địa chỉ!");
        return false;
    }
    if (sdtHopLe(sdt) == false) {
        alert("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0!");
        return false;
    }

    // Lưu đơn hàng. Giá món được lưu luôn trong đơn (sau này đổi giá cũng không ảnh hưởng đơn cũ)
    var t = tinhTien();
    var donHang = JSON.parse(localStorage.getItem("donHang") || "[]");
    var ma = "DH" + (donHang.length + 1);
    donHang.push({
        ma: ma,
        email: nguoi.email,
        ngay: new Date().toLocaleString("vi-VN"),
        ten: ten,
        sdt: sdt,
        diaChi: diaChi,
        mon: gioHang,
        giamGia: t.giam,
        phiGiao: t.phi,
        tong: t.tong,
        trangThai: "Chờ xác nhận"
    });
    localStorage.setItem("donHang", JSON.stringify(donHang));
    localStorage.removeItem("gioHang");          // đặt xong thì xóa giỏ
    maDaDung = "";

    alert("Đặt hàng thành công! Mã đơn của bạn là " + ma);
    window.location.href = "DonHang.html";
    return false;
}

// ================= ĐƠN HÀNG CỦA TÔI =================
function hienThiDonHang() {
    var nguoi = layNguoiDangNhap();
    if (nguoi == null) {
        document.getElementById("bangDonHang").innerHTML = "<tr><td colspan='6'>Vui lòng <a href='DangNhap.html'>đăng nhập</a> để xem đơn hàng.</td></tr>";
        return;
    }
    var donHang = JSON.parse(localStorage.getItem("donHang") || "[]");
    var html = "";
    for (var i = 0; i < donHang.length; i++) {
        if (donHang[i].email == nguoi.email) {
            var nut = "";
            if (donHang[i].trangThai == "Chờ xác nhận") {      // chỉ hủy được khi chưa xác nhận
                nut = "<button onclick='huyDon(" + i + ")'>Hủy đơn</button>";
            }
            html = html + "<tr>" +
                "<td>" + donHang[i].ma + "</td>" +
                "<td>" + donHang[i].ngay + "</td>" +
                "<td>" + tenMon(donHang[i].mon) + "</td>" +
                "<td>" + dinhDangTien(donHang[i].tong) + "</td>" +
                "<td>" + donHang[i].trangThai + "</td>" +
                "<td>" + nut + "</td></tr>";
        }
    }
    if (html == "") {
        html = "<tr><td colspan='6'>Bạn chưa có đơn hàng nào.</td></tr>";
    }
    document.getElementById("bangDonHang").innerHTML = html;
}

// Ghép tên các món trong đơn thành 1 dòng chữ
function tenMon(danhSach) {
    var chu = "";
    for (var i = 0; i < danhSach.length; i++) {
        chu = chu + danhSach[i].ten + " x" + danhSach[i].soLuong + "<br>";
    }
    return chu;
}

function huyDon(i) {
    if (confirm("Bạn có chắc muốn hủy đơn này?")) {
        var donHang = JSON.parse(localStorage.getItem("donHang"));
        donHang[i].trangThai = "Đã hủy";
        localStorage.setItem("donHang", JSON.stringify(donHang));
        hienThiDonHang();
    }
}

// ================= TRANG QUẢN TRỊ =================
var DS_TRANG_THAI = ["Chờ xác nhận", "Đã xác nhận", "Đang chuẩn bị", "Đang giao", "Đã giao", "Đã hủy"];

function hienThiQuanTri() {
    var nguoi = layNguoiDangNhap();
    if (nguoi == null || nguoi.vaiTro != "quantri") {      // không phải quản trị -> đuổi ra
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = "DangNhap.html";
        return;
    }
    var donHang = JSON.parse(localStorage.getItem("donHang") || "[]");
    var html = "";
    var doanhThu = 0;
    for (var i = 0; i < donHang.length; i++) {
        if (donHang[i].trangThai == "Đã giao") {
            doanhThu = doanhThu + donHang[i].tong;
        }
        // Tạo ô chọn trạng thái
        var chon = "<select onchange='doiTrangThai(" + i + ", this.value)'>";
        for (var j = 0; j < DS_TRANG_THAI.length; j++) {
            var dangChon = "";
            if (DS_TRANG_THAI[j] == donHang[i].trangThai) {
                dangChon = " selected";
            }
            chon = chon + "<option" + dangChon + ">" + DS_TRANG_THAI[j] + "</option>";
        }
        chon = chon + "</select>";

        html = html + "<tr>" +
            "<td>" + donHang[i].ma + "</td>" +
            "<td>" + donHang[i].ngay + "</td>" +
            "<td>" + donHang[i].ten + "<br>" + donHang[i].sdt + "<br>" + donHang[i].diaChi + "</td>" +
            "<td>" + tenMon(donHang[i].mon) + "</td>" +
            "<td>" + dinhDangTien(donHang[i].tong) + "</td>" +
            "<td>" + chon + "</td></tr>";
    }
    if (html == "") {
        html = "<tr><td colspan='6'>Chưa có đơn hàng nào.</td></tr>";
    }
    document.getElementById("bangQuanTri").innerHTML = html;
    document.getElementById("soDon").innerHTML = donHang.length;
    document.getElementById("doanhThu").innerHTML = dinhDangTien(doanhThu);
}

function doiTrangThai(i, trangThaiMoi) {
    var donHang = JSON.parse(localStorage.getItem("donHang"));
    donHang[i].trangThai = trangThaiMoi;
    localStorage.setItem("donHang", JSON.stringify(donHang));
    hienThiQuanTri();
}
