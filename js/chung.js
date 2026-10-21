// ===== FILE DÙNG CHUNG CHO MỌI TRANG =====
// Gồm: lưu dữ liệu (localStorage), giỏ hàng, khuyến mãi, tài khoản, đơn hàng, đánh giá,
// và đoạn giao diện dùng lại (đầu trang, chân trang, thẻ món ăn, thông báo, hộp thoại).
// Mỗi trang nhúng dulieu.js, rồi chung.js, rồi file js riêng của trang. (Không dùng jQuery.)

var PHI_GIAO = 15000;      // phí giao hàng cố định
var TOI_DA = 20;           // mỗi món tối đa 20 phần trong giỏ

// Các trạng thái của đơn hàng: mã -> chữ hiển thị
var TRANG_THAI = {
    cho_xac_nhan: "Chờ xác nhận",
    da_xac_nhan: "Đã xác nhận",
    dang_chuan_bi: "Đang chuẩn bị",
    dang_giao: "Đang giao",
    da_giao: "Đã giao",
    da_huy: "Đã hủy",
    giao_that_bai: "Giao thất bại"
};

// Từ trạng thái hiện tại, đơn chỉ được chuyển sang các trạng thái trong danh sách này
var BUOC_TIEP = {
    cho_xac_nhan: ["da_xac_nhan", "da_huy"],
    da_xac_nhan: ["dang_chuan_bi", "da_huy"],
    dang_chuan_bi: ["dang_giao"],
    dang_giao: ["da_giao", "giao_that_bai"],
    da_giao: [],
    da_huy: [],
    giao_that_bai: []
};

// ================= 1. LƯU / ĐỌC DỮ LIỆU (localStorage) =================
// localStorage giống một "ngăn kéo" trong trình duyệt, chỉ lưu được chữ.
// Nên khi lưu phải đổi mảng/đối tượng thành chuỗi (JSON.stringify), khi đọc đổi ngược lại (JSON.parse).

function docDuLieu(khoa, macDinh) {
    try {
        var chu = localStorage.getItem(khoa);
        if (chu == null) {
            return macDinh;
        }
        return JSON.parse(chu);
    } catch (loi) {
        return macDinh;
    }
}

function ghiDuLieu(khoa, giaTri) {
    try {
        localStorage.setItem(khoa, JSON.stringify(giaTri));
    } catch (loi) {
        // trình duyệt chặn localStorage thì bỏ qua
    }
}

// Lần đầu mở website: nạp dữ liệu mẫu và 2 tài khoản có sẵn
function khoiTaoDuLieu() {
    if (docDuLieu("jb_daKhoiTao", false) == true) {
        return;
    }
    ghiDuLieu("jb_monAn", DU_LIEU.monAn);
    ghiDuLieu("jb_khuyenMai", DU_LIEU.khuyenMai);
    ghiDuLieu("jb_nguoiDung", [
        { id: 1, hoTen: "Quản trị viên", email: "admin@jollibee.vn", sdt: "0900000001", matKhau: bamMatKhau("admin123"), vaiTro: "quantri", biKhoa: false },
        { id: 2, hoTen: "Nhân viên cửa hàng", email: "nhanvien@jollibee.vn", sdt: "0900000002", matKhau: bamMatKhau("nv123456"), vaiTro: "nhanvien", biKhoa: false }
    ]);
    ghiDuLieu("jb_donHang", []);
    ghiDuLieu("jb_danhGia", []);
    ghiDuLieu("jb_gioHang", []);
    ghiDuLieu("jb_daKhoiTao", true);
}

// ================= 2. HÀM TIỆN ÍCH =================

// Ngăn người dùng chèn mã HTML vào chữ hiển thị (an toàn hơn khi dùng innerHTML)
function maHoaChu(chu) {
    if (chu == null) {
        return "";
    }
    chu = String(chu);
    chu = chu.replace(/&/g, "&amp;");
    chu = chu.replace(/</g, "&lt;");
    chu = chu.replace(/>/g, "&gt;");
    chu = chu.replace(/"/g, "&quot;");
    chu = chu.replace(/'/g, "&#39;");
    return chu;
}

// 29000 -> "29.000đ"
function dinhDangTien(so) {
    return Number(so || 0).toLocaleString("vi-VN") + "đ";
}

// Băm mật khẩu đơn giản để không lưu mật khẩu dạng chữ thô (chỉ minh họa, không an toàn như băm thật)
function bamMatKhau(chu) {
    var h = 5381;
    for (var i = 0; i < chu.length; i++) {
        h = ((h << 5) + h + chu.charCodeAt(i)) | 0;
    }
    return "h" + (h >>> 0).toString(16);
}

function layId(id) {
    return document.getElementById(id);
}

// Lấy giá trị của ô nhập, bỏ khoảng trắng thừa 2 đầu
function layGiaTri(id) {
    return layId(id).value.trim();
}

function datChu(id, chu) {
    layId(id).textContent = chu;
}

function datHTML(id, html) {
    layId(id).innerHTML = html;
}

// Lấy tham số trên địa chỉ, ví dụ ThucDon?cat=combo -> layThamSo("cat") = "combo"
function layThamSo(ten) {
    var kq = new URLSearchParams(location.search).get(ten);
    if (kq == null) {
        return "";
    }
    return kq;
}

function sdtHopLe(sdt) {
    // đủ 10 chữ số và bắt đầu bằng số 0
    return /^0\d{9}$/.test(sdt);
}

function emailHopLe(email) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

// ================= 3. MÓN ĂN =================

// tatCa = true: lấy cả món ngừng bán (dùng cho trang quản trị)
function layMonAn(tatCa) {
    var ds = docDuLieu("jb_monAn", []);
    if (tatCa == true) {
        return ds;
    }
    var kq = [];
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].dangBan) {
            kq.push(ds[i]);
        }
    }
    return kq;
}

function luuMonAn(ds) {
    ghiDuLieu("jb_monAn", ds);
}

function timMon(id) {
    var ds = layMonAn(true);
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].id == id) {
            return ds[i];
        }
    }
    return null;
}

function layDanhMuc() {
    return DU_LIEU.danhMuc;
}

function timDanhMuc(ma) {
    for (var i = 0; i < DU_LIEU.danhMuc.length; i++) {
        if (DU_LIEU.danhMuc[i].ma == ma) {
            return DU_LIEU.danhMuc[i];
        }
    }
    return null;
}

// Màu nền cho ảnh dự phòng của từng danh mục
var MAU_DANH_MUC = {
    "combo": "#E4002B", "ga-gion": "#F59E0B", "mi-y": "#DC2626", "ga-sot-cay": "#B91C1C",
    "burger-com": "#D97706", "phan-an-phu": "#CA8A04", "trang-mieng": "#EC4899", "thuc-uong": "#0EA5E9"
};

// Ảnh của món. Nếu món không có ảnh (hoặc ảnh lỗi) thì tự vẽ một ảnh SVG có tên món
function anhMon(mon) {
    if (mon.anh) {
        return mon.anh;
    }
    var mau = MAU_DANH_MUC[mon.danhMuc] || "#E4002B";
    var tu = mon.ten.split(" ");
    var dong1 = "";
    var dong2 = "";
    for (var i = 0; i < tu.length; i++) {
        if ((dong1 + " " + tu[i]).length < 16 && dong2 == "") {
            dong1 = dong1 + (dong1 == "" ? "" : " ") + tu[i];
        } else {
            dong2 = dong2 + (dong2 == "" ? "" : " ") + tu[i];
        }
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">' +
        '<rect width="400" height="400" fill="' + mau + '"/>' +
        '<circle cx="200" cy="150" r="70" fill="#FFC72C" opacity=".9"/>' +
        '<text x="200" y="285" font-family="Arial" font-weight="bold" font-size="26" fill="#fff" text-anchor="middle">' + maHoaChu(dong1) + '</text>' +
        '<text x="200" y="320" font-family="Arial" font-weight="bold" font-size="26" fill="#fff" text-anchor="middle">' + maHoaChu(dong2) + '</text></svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

// Dùng cho thuộc tính onerror của thẻ img: ảnh tải lỗi thì thay bằng ảnh dự phòng
function anhLoi(img) {
    img.onerror = null;
    img.src = anhMon({ ten: img.alt, danhMuc: "combo" });
}

// Món có nhiều mức giá (giaCao > gia) thì hiện chữ "Từ ..."
function giaHienThi(mon) {
    var chu = dinhDangTien(mon.gia);
    if (mon.giaCao > mon.gia) {
        chu = "<small>Từ </small>" + chu;
    }
    return chu;
}

// ================= 4. GIỎ HÀNG =================
// Giỏ hàng là mảng, mỗi phần tử có dạng: { id: 5, soLuong: 2 }

// Mỗi tài khoản khách có giỏ riêng: jb_gioHang_<id>. Chưa đăng nhập dùng giỏ tạm "jb_gioHang".
// Nhân viên / quản trị viên không có giỏ hàng (không được đặt món).
function khoaGioHang() {
    var nguoi = layNguoiDangNhap();
    if (nguoi == null) {
        return "jb_gioHang";
    }
    if (nguoi.vaiTro == "khach") {
        return "jb_gioHang_" + nguoi.id;
    }
    return null;
}

// Chỉ khách hàng mới được mua (nhân viên/quản trị viên chỉ quản lý)
function duocMuaHang() {
    var nguoi = layNguoiDangNhap();
    return nguoi == null || nguoi.vaiTro == "khach";
}

function layGioHang() {
    var khoa = khoaGioHang();
    if (khoa == null) {
        return [];
    }
    return docDuLieu(khoa, []);
}

function luuGioHang(gioHang) {
    var khoa = khoaGioHang();
    if (khoa != null) {
        ghiDuLieu(khoa, gioHang);
    }
    capNhatSoLuongGio();
}

// Sau khi khách đăng nhập: gộp giỏ tạm (lúc chưa đăng nhập) vào giỏ của tài khoản
function gopGioTam() {
    var tam = docDuLieu("jb_gioHang", []);
    if (tam.length == 0 || duocMuaHang() == false) {
        return;
    }
    var gio = layGioHang();
    for (var i = 0; i < tam.length; i++) {
        var thay = false;
        for (var j = 0; j < gio.length; j++) {
            if (gio[j].id == tam[i].id) {
                gio[j].soLuong = Math.min(TOI_DA, gio[j].soLuong + tam[i].soLuong);
                thay = true;
            }
        }
        if (thay == false) {
            gio.push(tam[i]);
        }
    }
    luuGioHang(gio);
    ghiDuLieu("jb_gioHang", []);
}

// Thêm món vào giỏ. Trả về { ok: true/false, thongBao: "..." }
function themMonVaoGio(id, soLuong) {
    if (layNguoiDangNhap() == null) {
        return { ok: false, canDangNhap: true, thongBao: "Vui lòng đăng nhập để thêm món vào giỏ hàng." };
    }
    if (duocMuaHang() == false) {
        return { ok: false, thongBao: "Tài khoản nhân viên/quản trị không thể đặt món." };
    }
    var mon = timMon(id);
    if (mon == null || mon.dangBan == false) {
        return { ok: false, thongBao: "Món này hiện đã ngừng bán." };
    }
    var gioHang = layGioHang();
    var daCo = false;
    for (var i = 0; i < gioHang.length; i++) {
        if (gioHang[i].id == id) {
            if (gioHang[i].soLuong + soLuong > TOI_DA) {
                return { ok: false, thongBao: "Mỗi món tối đa " + TOI_DA + " phần trong giỏ." };
            }
            gioHang[i].soLuong = gioHang[i].soLuong + soLuong;
            daCo = true;
        }
    }
    if (daCo == false) {
        gioHang.push({ id: Number(id), soLuong: soLuong });
    }
    luuGioHang(gioHang);
    return { ok: true, thongBao: "Đã thêm vào giỏ hàng" };
}

// Đặt số lượng của một món (tối thiểu 1, tối đa TOI_DA)
function datSoLuongMon(id, soLuong) {
    soLuong = parseInt(soLuong, 10);
    if (isNaN(soLuong) || soLuong < 1) {
        soLuong = 1;
    }
    if (soLuong > TOI_DA) {
        soLuong = TOI_DA;
    }
    var gioHang = layGioHang();
    for (var i = 0; i < gioHang.length; i++) {
        if (gioHang[i].id == id) {
            gioHang[i].soLuong = soLuong;
        }
    }
    luuGioHang(gioHang);
}

function xoaMonKhoiGio(id) {
    var gioHang = layGioHang();
    var moi = [];
    for (var i = 0; i < gioHang.length; i++) {
        if (gioHang[i].id != id) {
            moi.push(gioHang[i]);
        }
    }
    luuGioHang(moi);
}

function xoaGioHang() {
    luuGioHang([]);
}

// Các dòng trong giỏ kèm thông tin món (bỏ qua món đã ngừng bán)
// Mỗi dòng: { mon: {...}, soLuong: 2, thanhTien: 58000 }
function layDongGio() {
    var gioHang = layGioHang();
    var kq = [];
    for (var i = 0; i < gioHang.length; i++) {
        var mon = timMon(gioHang[i].id);
        if (mon != null && mon.dangBan) {
            kq.push({ mon: mon, soLuong: gioHang[i].soLuong, thanhTien: mon.gia * gioHang[i].soLuong });
        }
    }
    return kq;
}

function tongSoMon() {
    var gioHang = layGioHang();
    var tong = 0;
    for (var i = 0; i < gioHang.length; i++) {
        tong = tong + gioHang[i].soLuong;
    }
    return tong;
}

function layTamTinh() {
    var dong = layDongGio();
    var tong = 0;
    for (var i = 0; i < dong.length; i++) {
        tong = tong + dong[i].thanhTien;
    }
    return tong;
}

// Cập nhật số hiển thị trên nút "Giỏ hàng" ở đầu trang
function capNhatSoLuongGio() {
    var o = document.getElementsByClassName("jb-cart-n");
    for (var i = 0; i < o.length; i++) {
        o[i].textContent = tongSoMon();
    }
}

// Hình thức nhận hàng khách đang chọn: "giao_tan_noi" hoặc "den_lay" (nhớ lại giữa các trang)
function layHinhThuc() {
    return docDuLieu("jb_hinhThuc", "giao_tan_noi");
}

function luuHinhThuc(hinhThuc) {
    ghiDuLieu("jb_hinhThuc", hinhThuc);
}

// ================= 5. KHUYẾN MÃI VÀ TÍNH TIỀN =================

function layKhuyenMai(tatCa) {
    var ds = docDuLieu("jb_khuyenMai", []);
    if (tatCa == true) {
        return ds;
    }
    var kq = [];
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].dangBan) {
            kq.push(ds[i]);
        }
    }
    return kq;
}

function luuKhuyenMai(ds) {
    ghiDuLieu("jb_khuyenMai", ds);
}

// Kiểm tra mã giảm giá. Trả về { ok: true, km: {...} } hoặc { ok: false, thongBao: "..." }
// Tài khoản này đã dùng mã chưa? (đơn đã hủy / giao thất bại thì không tính là đã dùng)
function daDungMa(email, ma) {
    var ds = layDonHang();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].email == email && String(ds[i].maKM).toUpperCase() == String(ma).toUpperCase()
            && ds[i].trangThai != "da_huy" && ds[i].trangThai != "giao_that_bai") {
            return true;
        }
    }
    return false;
}

function kiemTraMa(ma, tamTinh) {
    ma = String(ma).trim().toUpperCase();
    var ds = layKhuyenMai(false);
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].ma.toUpperCase() == ma) {
            var nguoi = layNguoiDangNhap();
            if (nguoi == null) {
                return { ok: false, thongBao: "Vui lòng đăng nhập để dùng mã giảm giá." };
            }
            if (daDungMa(nguoi.email, ds[i].ma)) {
                return { ok: false, thongBao: "Bạn đã dùng mã này rồi (mỗi tài khoản chỉ dùng 1 lần)." };
            }
            if (tamTinh < ds[i].toiThieu) {
                return { ok: false, thongBao: "Đơn tối thiểu " + dinhDangTien(ds[i].toiThieu) + " để dùng mã này." };
            }
            return { ok: true, km: ds[i] };
        }
    }
    return { ok: false, thongBao: "Mã giảm giá không tồn tại hoặc đã hết hạn." };
}

// Tổng tiền = tạm tính - giảm giá + phí giao
// (đến lấy tại cửa hàng thì không mất phí giao; mã miễn phí giao thì phí giao = 0)
function tinhTien(tamTinh, hinhThuc, km) {
    var phi = PHI_GIAO;
    var giam = 0;
    if (hinhThuc == "den_lay") {
        phi = 0;
    }
    if (km != null) {
        if (km.loai == "phan_tram") {
            giam = Math.round(tamTinh * km.giaTri / 100);
        } else if (km.loai == "so_tien") {
            giam = km.giaTri;
        } else if (km.loai == "mien_phi_ship") {
            phi = 0;
        }
    }
    if (giam > tamTinh) {
        giam = tamTinh;            // giảm giá không vượt quá tạm tính
    }
    return { tamTinh: tamTinh, phiGiao: phi, giamGia: giam, tong: tamTinh - giam + phi };
}

// Nhãn lớn trên thẻ khuyến mãi: -10%, FREE, -20K
function nhanKhuyenMai(km) {
    if (km.loai == "phan_tram") {
        return "-" + km.giaTri + "%";
    }
    if (km.loai == "mien_phi_ship") {
        return "FREE";
    }
    return "-" + (km.giaTri / 1000) + "K";
}

function veTheKhuyenMai(km, coNut) {
    var nut = "";
    if (coNut) {
        nut = '<div class="km-nut"><a class="btn-jb" href="thucdon.html">Đặt món ngay</a></div>';
    }
    return '<div class="promo"><div class="ph">' + nhanKhuyenMai(km) + '</div><div class="bd">' +
        '<h4>' + maHoaChu(km.tieuDe) + '</h4><p>' + maHoaChu(km.moTa) + '</p>' +
        '<span class="code">' + maHoaChu(km.ma) + '</span>' + nut + '</div></div>';
}

// ================= 6. TÀI KHOẢN =================
// Người dùng: { id, hoTen, email, sdt, matKhau, vaiTro, biKhoa }
// vaiTro: "khach" (khách hàng), "nhanvien" (nhân viên), "quantri" (quản trị viên)

function layNguoiDung() {
    return docDuLieu("jb_nguoiDung", []);
}

function luuNguoiDung(ds) {
    ghiDuLieu("jb_nguoiDung", ds);
}

// Người đang đăng nhập (null nếu chưa đăng nhập hoặc tài khoản bị khóa)
function layNguoiDangNhap() {
    var id = docDuLieu("jb_dangNhap", null);
    if (id == null) {
        return null;
    }
    var ds = layNguoiDung();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].id == id && ds[i].biKhoa == false) {
            return ds[i];
        }
    }
    return null;
}

function dangKyTaiKhoan(hoTen, email, sdt, matKhau) {
    var ds = layNguoiDung();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].email.toLowerCase() == email.toLowerCase()) {
            return { ok: false, thongBao: "Email này đã được đăng ký." };
        }
    }
    var moi = { id: Date.now(), hoTen: hoTen, email: email, sdt: sdt, matKhau: bamMatKhau(matKhau), vaiTro: "khach", biKhoa: false };
    ds.push(moi);
    luuNguoiDung(ds);
    ghiDuLieu("jb_dangNhap", moi.id);        // đăng ký xong tự đăng nhập luôn
    gopGioTam();
    return { ok: true };
}

function dangNhapTaiKhoan(email, matKhau) {
    var ds = layNguoiDung();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].email.toLowerCase() == email.toLowerCase() && ds[i].matKhau == bamMatKhau(matKhau)) {
            if (ds[i].biKhoa) {
                return { ok: false, thongBao: "Tài khoản đã bị khóa." };
            }
            ghiDuLieu("jb_dangNhap", ds[i].id);
            gopGioTam();
            try { sessionStorage.removeItem("jb_ma"); } catch (loi) { }
            return { ok: true };
        }
    }
    return { ok: false, thongBao: "Email hoặc mật khẩu không đúng." };
}

function dangXuat() {
    ghiDuLieu("jb_dangNhap", null);
    try { sessionStorage.removeItem("jb_ma"); } catch (loi) { }
    location.href = "trangchu.html";
}

// ================= 7. ĐƠN HÀNG =================
// Đơn hàng: { ma, email, ngay, trangThai, ten, sdt, diaChi, ghiChu, hinhThuc, thanhToan,
//             maKM, mon: [{id, ten, gia, soLuong}], tamTinh, phiGiao, giamGia, tong }

function layDonHang() {
    return docDuLieu("jb_donHang", []);
}

function luuDonHang(ds) {
    ghiDuLieu("jb_donHang", ds);
}

function timDon(ma) {
    var ds = layDonHang();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].ma == ma) {
            return ds[i];
        }
    }
    return null;
}

// Tạo đơn từ giỏ hàng. Trả về { ok: true, don: {...} } hoặc { ok: false, thongBao: "..." }
function taoDonHang(thongTin) {
    if (duocMuaHang() == false) {
        return { ok: false, thongBao: "Tài khoản nhân viên/quản trị không thể đặt món." };
    }
    var dong = layDongGio();
    if (dong.length == 0) {
        return { ok: false, thongBao: "Giỏ hàng đang trống." };
    }
    var tamTinh = layTamTinh();
    var km = null;
    if (thongTin.maKM != "") {
        var kq = kiemTraMa(thongTin.maKM, tamTinh);
        if (kq.ok == false) {
            return kq;
        }
        km = kq.km;
    }
    var t = tinhTien(tamTinh, thongTin.hinhThuc, km);

    var mon = [];
    for (var i = 0; i < dong.length; i++) {
        // lưu luôn giá tại thời điểm đặt (sau này đổi giá cũng không ảnh hưởng đơn cũ)
        mon.push({ id: dong[i].mon.id, ten: dong[i].mon.ten, gia: dong[i].mon.gia, soLuong: dong[i].soLuong });
    }
    var don = {
        ma: "JB" + String(Date.now()).slice(-8),
        email: thongTin.email,
        ngay: new Date().toISOString(),
        trangThai: "cho_xac_nhan",
        ten: thongTin.ten,
        sdt: thongTin.sdt,
        diaChi: thongTin.diaChi,
        ghiChu: thongTin.ghiChu,
        hinhThuc: thongTin.hinhThuc,
        thanhToan: thongTin.thanhToan,
        maKM: km == null ? "" : km.ma,
        mon: mon,
        tamTinh: t.tamTinh,
        phiGiao: t.phiGiao,
        giamGia: t.giamGia,
        tong: t.tong
    };
    var ds = layDonHang();
    ds.unshift(don);                  // đơn mới nhất lên đầu
    luuDonHang(ds);
    xoaGioHang();
    return { ok: true, don: don };
}

// Đổi trạng thái đơn, chỉ cho phép các bước hợp lệ trong BUOC_TIEP
function doiTrangThaiDon(ma, trangThaiMoi) {
    var ds = layDonHang();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].ma == ma) {
            var duocPhep = BUOC_TIEP[ds[i].trangThai];
            if (duocPhep.indexOf(trangThaiMoi) == -1) {
                return false;
            }
            ds[i].trangThai = trangThaiMoi;
            luuDonHang(ds);
            return true;
        }
    }
    return false;
}

// Khách chỉ hủy được đơn khi còn ở trạng thái "Chờ xác nhận"
function huyDonHang(ma) {
    var don = timDon(ma);
    if (don == null || don.trangThai != "cho_xac_nhan") {
        return false;
    }
    return doiTrangThaiDon(ma, "da_huy");
}

// ================= 8. ĐÁNH GIÁ =================
// Đánh giá: { idMon, email, ten, soSao, noiDung, ngay }

function layDanhGia(idMon) {
    var ds = docDuLieu("jb_danhGia", []);
    var kq = [];
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].idMon == idMon) {
            kq.push(ds[i]);
        }
    }
    return kq;
}

function themDanhGia(danhGia) {
    var ds = docDuLieu("jb_danhGia", []);
    ds.unshift(danhGia);
    ghiDuLieu("jb_danhGia", ds);
}

// Chỉ khách đã nhận món (đơn "Đã giao") mới được đánh giá món đó
function daMuaMon(email, idMon) {
    var ds = layDonHang();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].email == email && ds[i].trangThai == "da_giao") {
            for (var j = 0; j < ds[i].mon.length; j++) {
                if (ds[i].mon[j].id == idMon) {
                    return true;
                }
            }
        }
    }
    return false;
}

// ================= 9. GIAO DIỆN DÙNG CHUNG =================

// Thông báo nhỏ ở góc dưới bên phải, tự tắt sau 2,4 giây
function thongBao(noiDung) {
    var khung = document.querySelector(".toast-box");
    if (khung == null) {
        khung = document.createElement("div");
        khung.className = "toast-box";
        document.body.appendChild(khung);
    }
    var o = document.createElement("div");
    o.className = "toast-i";
    o.textContent = noiDung;
    khung.appendChild(o);
    setTimeout(function () {
        o.style.opacity = "0";
        setTimeout(function () { o.remove(); }, 300);
    }, 2400);
}

// Thẻ món ăn (dùng ở trang chủ, thực đơn, món liên quan)
function veTheMon(mon) {
    var nhan = "";
    if (mon.banChay) {
        nhan = '<span class="badge-jb">Bán chạy</span>';
    }
    var lienKet = "chitiet.html?id=" + mon.id;
    return '<div class="pcard">' + nhan +
        '<a class="pimg" href="' + lienKet + '"><img loading="lazy" src="' + maHoaChu(anhMon(mon)) + '" alt="' + maHoaChu(mon.ten) + '" onerror="anhLoi(this)"></a>' +
        '<div class="pbody"><h3><a href="' + lienKet + '">' + maHoaChu(mon.ten) + '</a></h3>' +
        '<div class="pdesc">' + maHoaChu(mon.moTa) + '</div>' +
        '<div class="flex hai-dau giua-doc"><span class="pprice">' + giaHienThi(mon) + '</span>' +
        '<button class="btn-jb" onclick="bamNutThem(' + mon.id + ')">Thêm</button></div></div></div>';
}

// Chuyển sang trang đăng nhập, đăng nhập xong quay lại đúng trang đang xem
function chuyenDenDangNhap() {
    var trang = location.pathname.split("/").pop() + location.search;
    location.href = "dangnhap.html?next=" + encodeURIComponent(trang);
}

// Bấm nút "Thêm" trên thẻ món ăn
function bamNutThem(id) {
    var kq = themMonVaoGio(id, 1);
    if (kq.canDangNhap) {
        chuyenDenDangNhap();
        return;
    }
    thongBao(kq.thongBao);
}

// Hộp thoại (popup): thêm/bớt lớp "show" để hiện/ẩn
function moHopThoai(id) {
    layId(id).classList.add("show");
}

function dongHopThoai(id) {
    layId(id).classList.remove("show");
}

// Bấm ra vùng tối bên ngoài hoặc nhấn phím Esc thì đóng hộp thoại
document.addEventListener("click", function (e) {
    if (e.target.classList && e.target.classList.contains("hop-nen")) {
        e.target.classList.remove("show");
    }
});
document.addEventListener("keydown", function (e) {
    if (e.key == "Escape") {
        var ds = document.querySelectorAll(".hop-nen.show");
        for (var i = 0; i < ds.length; i++) {
            ds[i].classList.remove("show");
        }
    }
});

// Đầu trang + chân trang: vẽ bằng JS để sửa một chỗ là đổi toàn bộ các trang.
// trangHienTai = tên file của trang đang mở (để tô sáng mục menu tương ứng)
function veDauTrangVaChanTrang(trangHienTai) {
    var nguoi = layNguoiDangNhap();
    var menu = [
        ["trangchu.html", "Trang chủ"], ["thucdon.html", "Thực đơn"], ["khuyenmai.html", "Khuyến mãi"],
        ["dichvu.html", "Dịch vụ"], ["tintuc.html", "Tin tức"], ["cuahang.html", "Cửa hàng"], ["lienhe.html", "Liên hệ"]
    ];

    // Menu lớn hiện ra khi rê chuột vào "Thực đơn"
    var menuLon = "";
    var dm = layDanhMuc();
    for (var i = 0; i < dm.length; i++) {
        menuLon = menuLon + '<a href="thucdon.html?cat=' + dm[i].ma + '"><img src="' + maHoaChu(dm[i].anh) + '" alt="" onerror="this.style.visibility=\'hidden\'">' + maHoaChu(dm[i].ten) + '</a>';
    }

    var dsMenu = "";
    for (var j = 0; j < menu.length; j++) {
        var lop = "";
        if (menu[j][0] == trangHienTai) {
            lop = "active";
        }
        dsMenu = dsMenu + '<li><a href="' + menu[j][0] + '" class="' + lop + '">' + menu[j][1] + '</a>';
        if (menu[j][0] == "thucdon.html") {
            dsMenu = dsMenu + '<div class="jb-mega">' + menuLon + '</div>';
        }
        dsMenu = dsMenu + "</li>";
    }

    // Phần tài khoản ở thanh vàng trên cùng
    var taiKhoan = '<a href="dangnhap.html">ĐĂNG KÝ / ĐĂNG NHẬP</a>';
    if (nguoi != null) {
        taiKhoan = '<a href="donhang.html">' + maHoaChu(nguoi.hoTen) + '</a><span class="sep"></span>';
        if (nguoi.vaiTro != "khach") {
            taiKhoan = taiKhoan + '<a href="quantri.html">QUẢN TRỊ</a><span class="sep"></span>';
        }
        taiKhoan = taiKhoan + '<a href="#" onclick="dangXuat(); return false;">ĐĂNG XUẤT</a>';
    }

    datHTML("jb-header",
        '<div class="jb-top"><a href="#">VN</a><span class="sep"></span><a href="#">EN</a><span class="sep"></span>' + taiKhoan + '</div>' +
        '<header class="jb-head"><div class="jb-head-in">' +
        '<a class="jb-logo" href="trangchu.html">Jollibee<small>Đồ án 2 – Vũ Tiến Phước</small></a>' +
        '<button class="jb-burger" aria-label="Menu" onclick="document.getElementById(\'menuChinh\').classList.toggle(\'open\')">&#9776;</button>' +
        '<ul class="jb-nav" id="menuChinh">' + dsMenu + '</ul>' +
        '<div class="jb-right">' + (duocMuaHang() ? '<a class="jb-cart" href="giohang.html">Giỏ hàng <b class="jb-cart-n">0</b></a>' : '') + '</div>' +
        '</div></header>');

    datHTML("jb-footer",
        '<footer class="jb-foot"><div class="container"><div class="foot-luoi">' +
        '<div><h5>Đồ án 2 – Thiết kế web cơ bản</h5><p>Website bán đồ ăn nhanh mô phỏng theo giao diện Jollibee Việt Nam.</p></div>' +
        '<div><h5>Liên kết</h5><div><a href="thucdon.html">Thực đơn</a></div><div><a href="khuyenmai.html">Khuyến mãi</a></div><div><a href="cuahang.html">Cửa hàng</a></div><div><a href="donhang.html">Đơn hàng của tôi</a></div></div>' +
        '<div><h5>Hỗ trợ</h5><div><a href="lienhe.html">Liên hệ</a></div><div><a href="tintuc.html">Tin tức</a></div><div><small>Hotline minh họa: 1900 xxxx</small></div></div>' +
        '</div><div class="sub">Sinh viên thực hiện: Vũ Tiến Phước – Đại học Công nghệ Kỹ thuật Hưng Yên.</div></div></footer>' +
        '<a class="chat-fab" href="lienhe.html">Trò chuyện cùng Jolly</a>');

    capNhatSoLuongGio();
}

khoiTaoDuLieu();
