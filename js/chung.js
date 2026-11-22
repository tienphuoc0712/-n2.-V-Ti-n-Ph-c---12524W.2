// ===== FILE DÙNG CHUNG CHO MỌI TRANG =====
// Gồm: lưu dữ liệu (localStorage), giỏ hàng, khuyến mãi, tài khoản, đơn hàng, đánh giá,
// và đoạn giao diện dùng lại (đầu trang, chân trang, thẻ món ăn, thông báo, hộp thoại).
// Mỗi trang nhúng dulieu.js, rồi chung.js, rồi file js riêng của trang. (Không dùng jQuery.)

// Phí giao hàng theo khoảng cách (khách chọn khu vực giao ở trang giỏ hàng / đặt hàng)
var KHU_VUC = {
    gan: { ten: "Trong bán kính 3 km", phi: 15000 },
    vua: { ten: "Từ 3 đến 7 km", phi: 25000 },
    xa: { ten: "Từ 7 đến 12 km", phi: 35000 }
};
var PHI_GIAO = KHU_VUC.gan.phi;   // phí thấp nhất (khu vực gần)
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

// Đơn "đến lấy" tại cửa hàng không có khâu giao hàng:
// Chờ xác nhận -> Đã xác nhận -> Đang chuẩn bị -> Đã giao (khách đã nhận)
function layBuocTiep(don) {
    if (don.hinhThuc == "den_lay" && don.trangThai == "dang_chuan_bi") {
        return ["da_giao"];
    }
    return BUOC_TIEP[don.trangThai];
}

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
        nangCapDuLieu();
        return;
    }
    ghiDuLieu("jb_monAn", DU_LIEU.monAn);
    ghiDuLieu("jb_danhMuc", DU_LIEU.danhMuc);
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

// Dữ liệu đã lưu từ bản cũ: bổ sung các trường mới (mã WELCOME20 chỉ áp dụng cho đơn đầu tiên)
function nangCapDuLieu() {
    if (docDuLieu("jb_danhMuc", null) == null) {         // bản cũ chưa lưu danh mục
        ghiDuLieu("jb_danhMuc", DU_LIEU.danhMuc);
    }
    var ds = docDuLieu("jb_khuyenMai", []);
    var doi = false;
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].ma == "WELCOME20" && ds[i].donDau === undefined) {
            ds[i].donDau = true;
            doi = true;
        }
    }
    if (doi) {
        ghiDuLieu("jb_khuyenMai", ds);
    }
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

// Danh mục lưu ở localStorage (khóa jb_danhMuc) để quản trị viên thêm/sửa/xóa được
function layDanhMuc() {
    return docDuLieu("jb_danhMuc", DU_LIEU.danhMuc);
}

function luuDanhMuc(ds) {
    ghiDuLieu("jb_danhMuc", ds);
}

function timDanhMuc(ma) {
    var ds = layDanhMuc();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].ma == ma) {
            return ds[i];
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

// Mỗi món chỉ có MỘT mức giá (tiền giỏ hàng, đơn hàng đều tính theo giá này)
function giaHienThi(mon) {
    return dinhDangTien(mon.gia);
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
    var dong = layDongGio();         // chỉ đếm món còn đang bán
    var tong = 0;
    for (var i = 0; i < dong.length; i++) {
        tong = tong + dong[i].soLuong;
    }
    return tong;
}

// Xóa khỏi giỏ các món đã ngừng bán / bị xóa. Trả về tên các món bị xóa
function xoaMonNgungBan() {
    var gioHang = layGioHang();
    var con = [];
    var daXoa = [];
    for (var i = 0; i < gioHang.length; i++) {
        var mon = timMon(gioHang[i].id);
        if (mon != null && mon.dangBan) {
            con.push(gioHang[i]);
        } else {
            daXoa.push(mon != null ? mon.ten : "một món");
        }
    }
    if (daXoa.length > 0) {
        luuGioHang(con);
    }
    return daXoa;
}

// Dọn giỏ rồi báo cho khách biết món nào đã bị bỏ
function donGioHang() {
    var ds = xoaMonNgungBan();
    if (ds.length > 0) {
        thongBao("Đã bỏ khỏi giỏ (ngừng bán): " + ds.join(", "));
    }
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

// Khu vực giao hàng đang chọn (lưu lại để giỏ hàng và trang đặt hàng dùng chung)
function layKhuVuc() {
    var k = docDuLieu("jb_khuVuc", "gan");
    return KHU_VUC[k] ? k : "gan";
}

function luuKhuVuc(k) {
    if (KHU_VUC[k]) {
        ghiDuLieu("jb_khuVuc", k);
    }
}

// Vẽ ô chọn khu vực vào phần tử idHop; khiDoi() được gọi mỗi khi khách đổi lựa chọn
function veChonKhuVuc(idHop, khiDoi) {
    var html = '<label class="nhan dong" style="display:block">Khu vực giao hàng (tính phí theo khoảng cách)</label><select id="khuVucChon" class="o-nhap">';
    for (var k in KHU_VUC) {
        html = html + '<option value="' + k + '">' + KHU_VUC[k].ten + ' – ' + dinhDangTien(KHU_VUC[k].phi) + '</option>';
    }
    datHTML(idHop, html + '</select>');
    layId("khuVucChon").value = layKhuVuc();
    layId("khuVucChon").onchange = function () {
        luuKhuVuc(this.value);
        khiDoi();
    };
}

// Chương trình còn hiệu lực: đang bật và (nếu có khai báo) hôm nay nằm trong khoảng tuNgay..denNgay
function conHieuLuc(km) {
    if (!km.dangBan) {
        return false;
    }
    var homNay = ngayDiaPhuong(new Date());
    if (km.tuNgay && homNay < km.tuNgay) {
        return false;
    }
    if (km.denNgay && homNay > km.denNgay) {
        return false;
    }
    return true;
}

// Ngày theo giờ máy người dùng, dạng yyyy-mm-dd (không dùng toISOString vì nó tính theo giờ UTC)
function ngayDiaPhuong(d) {
    var m = String(d.getMonth() + 1);
    var n = String(d.getDate());
    return d.getFullYear() + "-" + (m.length < 2 ? "0" + m : m) + "-" + (n.length < 2 ? "0" + n : n);
}

function layKhuyenMai(tatCa) {
    var ds = docDuLieu("jb_khuyenMai", []);
    if (tatCa == true) {
        return ds;
    }
    var kq = [];
    for (var i = 0; i < ds.length; i++) {
        if (conHieuLuc(ds[i])) {
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

// Tài khoản này đã có đơn nào (chưa hủy / chưa giao thất bại) chưa? Dùng cho mã chỉ áp dụng đơn đầu tiên
// Số lượt mã đã được dùng (đơn bị hủy / giao thất bại thì không tính)
function soLuotDaDung(ma) {
    var ds = layDonHang();
    var dem = 0;
    for (var i = 0; i < ds.length; i++) {
        if (String(ds[i].maKM).toUpperCase() == String(ma).toUpperCase() && ds[i].trangThai != "da_huy" && ds[i].trangThai != "giao_that_bai") {
            dem = dem + 1;
        }
    }
    return dem;
}

function daCoDon(email) {
    var ds = layDonHang();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].email == email && ds[i].trangThai != "da_huy" && ds[i].trangThai != "giao_that_bai") {
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
            if (ds[i].donDau && daCoDon(nguoi.email)) {
                return { ok: false, thongBao: "Mã này chỉ áp dụng cho đơn hàng đầu tiên của tài khoản." };
            }
            if (ds[i].luotToiDa > 0 && soLuotDaDung(ds[i].ma) >= ds[i].luotToiDa) {
                return { ok: false, thongBao: "Mã này đã hết lượt sử dụng." };
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
function tinhTien(tamTinh, hinhThuc, km, khuVuc) {
    var phi = (KHU_VUC[khuVuc] || KHU_VUC.gan).phi;
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

// Mã tài khoản mới luôn lớn hơn mọi mã đã có (tránh trùng khi tạo cùng một mili-giây)
function taoMaNguoiDung(ds) {
    var maMoi = Date.now();
    for (var j = 0; j < ds.length; j++) {
        if (ds[j].id >= maMoi) {
            maMoi = ds[j].id + 1;
        }
    }
    return maMoi;
}

function dangKyTaiKhoan(hoTen, email, sdt, matKhau) {
    var ds = layNguoiDung();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].email.toLowerCase() == email.toLowerCase()) {
            return { ok: false, thongBao: "Email này đã được đăng ký." };
        }
    }
    var moi = { id: taoMaNguoiDung(ds), hoTen: hoTen, email: email.trim().toLowerCase(), sdt: sdt, matKhau: bamMatKhau(matKhau), vaiTro: "khach", biKhoa: false };
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

// Quên mật khẩu (không có máy chủ gửi email nên xác minh bằng email + số điện thoại đã đăng ký)
function datLaiMatKhauQuen(email, sdt, matKhauMoi) {
    if (matKhauMoi.length < 6) {
        return { ok: false, thongBao: "Mật khẩu tối thiểu 6 ký tự." };
    }
    var ds = layNguoiDung();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].email.toLowerCase() == email.trim().toLowerCase() && ds[i].sdt == sdt.trim() && ds[i].vaiTro == "khach") {
            ds[i].matKhau = bamMatKhau(matKhauMoi);
            luuNguoiDung(ds);
            return { ok: true };
        }
    }
    return { ok: false, thongBao: "Email và số điện thoại không khớp với tài khoản nào." };
}

// Đổi mật khẩu của người đang đăng nhập (phải nhập đúng mật khẩu hiện tại)
function doiMatKhau(matKhauCu, matKhauMoi) {
    var nguoi = layNguoiDangNhap();
    if (nguoi == null) {
        return { ok: false, thongBao: "Vui lòng đăng nhập." };
    }
    if (nguoi.matKhau != bamMatKhau(matKhauCu)) {
        return { ok: false, thongBao: "Mật khẩu hiện tại không đúng." };
    }
    if (matKhauMoi.length < 6) {
        return { ok: false, thongBao: "Mật khẩu mới tối thiểu 6 ký tự." };
    }
    var ds = layNguoiDung();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].id == nguoi.id) {
            ds[i].matKhau = bamMatKhau(matKhauMoi);
        }
    }
    luuNguoiDung(ds);
    return { ok: true };
}

// Cập nhật họ tên, số điện thoại, địa chỉ của người đang đăng nhập (email không đổi)
function capNhatHoSo(hoTen, sdt, diaChi) {
    var nguoi = layNguoiDangNhap();
    if (nguoi == null) {
        return { ok: false, thongBao: "Vui lòng đăng nhập." };
    }
    if (String(hoTen).trim() == "") {
        return { ok: false, thongBao: "Vui lòng nhập họ tên." };
    }
    if (sdtHopLe(sdt) == false) {
        return { ok: false, thongBao: "Số điện thoại gồm 10 số, bắt đầu bằng 0." };
    }
    var ds = layNguoiDung();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].id == nguoi.id) {
            ds[i].hoTen = String(hoTen).trim();
            ds[i].sdt = sdt;
            ds[i].diaChi = String(diaChi).trim();
        }
    }
    luuNguoiDung(ds);
    return { ok: true };
}

// ---- Các hàm dưới đây chỉ quản trị viên được dùng ----
function laQuanTriDangNhap() {
    var nguoi = layNguoiDangNhap();
    return nguoi != null && nguoi.vaiTro == "quantri";
}

// Tạo tài khoản nhân viên hoặc quản trị viên
function taoTaiKhoanNoiBo(hoTen, email, sdt, matKhau, vaiTro) {
    if (laQuanTriDangNhap() == false) {
        return { ok: false, thongBao: "Chỉ quản trị viên được tạo tài khoản nội bộ." };
    }
    if (vaiTro != "nhanvien" && vaiTro != "quantri") {
        return { ok: false, thongBao: "Vai trò không hợp lệ." };
    }
    if (String(hoTen).trim() == "" || emailHopLe(email) == false || sdtHopLe(sdt) == false || matKhau.length < 6) {
        return { ok: false, thongBao: "Nhập đủ họ tên, email, số điện thoại hợp lệ và mật khẩu từ 6 ký tự." };
    }
    var ds = layNguoiDung();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].email.toLowerCase() == email.trim().toLowerCase()) {
            return { ok: false, thongBao: "Email này đã được đăng ký." };
        }
    }
    ds.push({ id: taoMaNguoiDung(ds), hoTen: String(hoTen).trim(), email: email.trim().toLowerCase(), sdt: sdt, matKhau: bamMatKhau(matKhau), vaiTro: vaiTro, biKhoa: false });
    luuNguoiDung(ds);
    return { ok: true };
}

// Phân quyền: đổi vai trò (không đổi vai trò của chính mình để không mất quyền quản trị)
function doiVaiTro(id, vaiTro) {
    if (laQuanTriDangNhap() == false || (vaiTro != "khach" && vaiTro != "nhanvien" && vaiTro != "quantri")) {
        return false;
    }
    var ds = layNguoiDung();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].id == id && ds[i].id != layNguoiDangNhap().id) {
            ds[i].vaiTro = vaiTro;
            luuNguoiDung(ds);
            return true;
        }
    }
    return false;
}

// Đặt lại mật khẩu cho một tài khoản khi người dùng không tự khôi phục được
function datLaiMatKhauNguoiDung(id, matKhauMoi) {
    if (laQuanTriDangNhap() == false || matKhauMoi.length < 6) {
        return false;
    }
    var ds = layNguoiDung();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].id == id) {
            ds[i].matKhau = bamMatKhau(matKhauMoi);
            luuNguoiDung(ds);
            return true;
        }
    }
    return false;
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

// Mã đơn: JB + 6 số cuối của thời gian + 2 số ngẫu nhiên; lặp lại cho đến khi không trùng
function taoMaDon() {
    var ma = "";
    do {
        ma = "JB" + String(Date.now()).slice(-6) + String(Math.floor(Math.random() * 90) + 10);
    } while (timDon(ma) != null);
    return ma;
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
    if (String(thongTin.ten).trim() == "" || sdtHopLe(thongTin.sdt) == false) {
        return { ok: false, thongBao: "Họ tên hoặc số điện thoại không hợp lệ." };
    }
    if (thongTin.hinhThuc == "giao_tan_noi" && String(thongTin.diaChi).trim() == "") {
        return { ok: false, thongBao: "Vui lòng nhập địa chỉ giao hàng." };
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
    var khuVuc = KHU_VUC[thongTin.khuVuc] ? thongTin.khuVuc : "gan";
    var t = tinhTien(tamTinh, thongTin.hinhThuc, km, khuVuc);

    var mon = [];
    for (var i = 0; i < dong.length; i++) {
        // lưu luôn giá tại thời điểm đặt (sau này đổi giá cũng không ảnh hưởng đơn cũ)
        mon.push({ id: dong[i].mon.id, ten: dong[i].mon.ten, gia: dong[i].mon.gia, soLuong: dong[i].soLuong });
    }
    var don = {
        ma: taoMaDon(),
        email: thongTin.email,
        ngay: new Date().toISOString(),
        trangThai: "cho_xac_nhan",
        ten: thongTin.ten,
        sdt: thongTin.sdt,
        diaChi: thongTin.diaChi,
        ghiChu: thongTin.ghiChu,
        hinhThuc: thongTin.hinhThuc,
        khuVuc: thongTin.hinhThuc == "giao_tan_noi" ? KHU_VUC[khuVuc].ten : "",
        thanhToan: thongTin.thanhToan,
        daThanhToan: thongTin.thanhToan == "wallet",      // ví điện tử (mô phỏng) trả ngay; chuyển khoản chờ cửa hàng xác nhận; tiền mặt trả khi nhận
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

// Đã thu tiền chưa? Tiền mặt coi là đã thu khi khách nhận món; chuyển khoản phải được cửa hàng xác nhận
function daThanhToan(don) {
    if (don.daThanhToan) {
        return true;
    }
    return don.thanhToan == "cod" && don.trangThai == "da_giao";
}

// Đổi trạng thái đơn (không kiểm tra quyền), chỉ cho phép các bước hợp lệ trong BUOC_TIEP
function capNhatTrangThai(ma, trangThaiMoi) {
    var ds = layDonHang();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].ma == ma) {
            var duocPhep = layBuocTiep(ds[i]);
            if (duocPhep.indexOf(trangThaiMoi) == -1) {
                return false;
            }
            // đơn chuyển khoản phải được xác nhận đã nhận tiền trước khi vào bếp
            if (trangThaiMoi == "dang_chuan_bi" && ds[i].thanhToan == "bank" && daThanhToan(ds[i]) == false) {
                return false;
            }
            ds[i].trangThai = trangThaiMoi;
            luuDonHang(ds);
            return true;
        }
    }
    return false;
}

// Nhân viên / quản trị viên chuyển trạng thái đơn
function doiTrangThaiDon(ma, trangThaiMoi) {
    var nguoi = layNguoiDangNhap();
    if (nguoi == null || nguoi.vaiTro == "khach") {
        return false;
    }
    return capNhatTrangThai(ma, trangThaiMoi);
}

// Nhân viên / quản trị viên xác nhận đã nhận tiền chuyển khoản
function xacNhanDaThu(ma) {
    var nguoi = layNguoiDangNhap();
    if (nguoi == null || nguoi.vaiTro == "khach") {
        return false;
    }
    var ds = layDonHang();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].ma == ma && ds[i].thanhToan == "bank" && ds[i].trangThai != "da_huy" && ds[i].trangThai != "giao_that_bai") {
            ds[i].daThanhToan = true;
            luuDonHang(ds);
            return true;
        }
    }
    return false;
}

// Khách chỉ hủy được đơn CỦA MÌNH và chỉ khi còn ở trạng thái "Chờ xác nhận"
function huyDonHang(ma) {
    var nguoi = layNguoiDangNhap();
    var don = timDon(ma);
    if (nguoi == null || don == null || don.email != nguoi.email || don.trangThai != "cho_xac_nhan") {
        return false;
    }
    return capNhatTrangThai(ma, "da_huy");
}

// Đặt lại đơn cũ: thêm các món của đơn vào giỏ (bỏ qua món đã ngừng bán, không vượt quá số phần tối đa)
// Trả về { ok, soMon, boQua }
function datLaiDon(ma) {
    var nguoi = layNguoiDangNhap();
    var don = timDon(ma);
    if (nguoi == null || don == null || don.email != nguoi.email || duocMuaHang() == false) {
        return { ok: false, soMon: 0, boQua: 0 };
    }
    var them = 0;
    var boQua = 0;
    for (var i = 0; i < don.mon.length; i++) {
        var mon = timMon(don.mon[i].id);
        if (mon == null || mon.dangBan == false) {
            boQua = boQua + 1;
            continue;
        }
        var daCo = 0;
        var gio = layGioHang();
        for (var j = 0; j < gio.length; j++) {
            if (gio[j].id == mon.id) {
                daCo = gio[j].soLuong;
            }
        }
        var duocThem = Math.min(don.mon[i].soLuong, TOI_DA - daCo);
        if (duocThem > 0) {
            themMonVaoGio(mon.id, duocThem);
            them = them + 1;
        }
    }
    return { ok: them > 0, soMon: them, boQua: boQua };
}

// ---- Hiển thị trạng thái đơn (dùng cho khách ở "Đơn hàng của tôi" và nhân viên ở trang quản trị) ----
var ICON_TT = { cho_xac_nhan: "⏳", da_xac_nhan: "✅", dang_chuan_bi: "👨‍🍳", dang_giao: "🛵", da_giao: "🎉", da_huy: "✖", giao_that_bai: "⚠" };

// Lời giải thích ngắn cho khách về việc đang diễn ra
function moTaTrangThai(don) {
    var kieu = don.hinhThuc == "den_lay";
    var ma = don.trangThai;
    if (ma == "cho_xac_nhan") { return "Cửa hàng đã nhận đơn và sẽ xác nhận trong ít phút."; }
    if (ma == "da_xac_nhan") { return don.thanhToan == "bank" && daThanhToan(don) == false ? "Đã xác nhận. Cửa hàng bắt đầu làm món sau khi nhận được tiền chuyển khoản." : "Cửa hàng đã xác nhận đơn của bạn."; }
    if (ma == "dang_chuan_bi") { return kieu ? "Món đang được chuẩn bị, bạn sẽ đến lấy khi có thông báo." : "Món của bạn đang được chuẩn bị."; }
    if (ma == "dang_giao") { return "Shipper đang trên đường giao đến bạn."; }
    if (ma == "da_giao") { return kieu ? "Bạn đã nhận hàng. Chúc ngon miệng!" : "Đơn đã giao thành công. Chúc ngon miệng!"; }
    if (ma == "da_huy") { return "Đơn hàng đã được hủy."; }
    return "Giao hàng không thành công, vui lòng liên hệ cửa hàng.";
}

// Các bước của đơn theo hình thức nhận hàng (đơn đến lấy không có bước "Đang giao")
function cacBuocDon(don) {
    if (don.hinhThuc == "den_lay") {
        return ["cho_xac_nhan", "da_xac_nhan", "dang_chuan_bi", "da_giao"];
    }
    return ["cho_xac_nhan", "da_xac_nhan", "dang_chuan_bi", "dang_giao", "da_giao"];
}

// Thanh tiến trình: bước đã qua (✓), bước hiện tại (nổi bật), bước chưa tới (xám)
function veTienTrinh(don) {
    var cac = cacBuocDon(don);
    if (don.trangThai == "da_huy" || don.trangThai == "giao_that_bai") {
        return '<div class="tt-loi tt-' + don.trangThai + '">' + ICON_TT[don.trangThai] + ' ' + TRANG_THAI[don.trangThai] + '</div>';
    }
    var viTri = cac.indexOf(don.trangThai);
    var html = '<ol class="tien-trinh">';
    for (var i = 0; i < cac.length; i++) {
        var lop = i < viTri || (i == viTri && cac[i] == "da_giao") ? "xong" : (i == viTri ? "dang" : "");
        var nhan = TRANG_THAI[cac[i]];
        if (cac[i] == "da_giao" && don.hinhThuc == "den_lay") {
            nhan = "Đã nhận hàng";
        }
        html = html + '<li class="' + lop + '"><span class="cham">' + (lop == "xong" ? "✓" : (i + 1)) + '</span><span class="chu">' + nhan + '</span></li>';
    }
    return html + '</ol>';
}

// Nhãn trạng thái có biểu tượng
function nhanTrangThai(don) {
    return '<span class="status st-' + don.trangThai + '">' + ICON_TT[don.trangThai] + ' ' + TRANG_THAI[don.trangThai] + '</span>';
}

// Nhãn thanh toán: Đã thanh toán / Chưa thanh toán / Không thu tiền
function nhanThanhToan(don) {
    if (don.trangThai == "da_huy" || don.trangThai == "giao_that_bai") {
        return '<span class="tt-nhan tt-khong">Không thu tiền</span>';
    }
    if (daThanhToan(don)) {
        return '<span class="tt-nhan tt-da">Đã thanh toán</span>';
    }
    return '<span class="tt-nhan tt-chua">Chưa thanh toán</span>';
}

// "5 phút trước", "2 giờ trước", "3 ngày trước"
function thoiGianTruoc(iso) {
    var phut = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (phut < 1) { return "vừa xong"; }
    if (phut < 60) { return phut + " phút trước"; }
    if (phut < 1440) { return Math.floor(phut / 60) + " giờ trước"; }
    return Math.floor(phut / 1440) + " ngày trước";
}

// ================= 8. ĐÁNH GIÁ =================

// Vẽ số sao: 4 sao = ★★★★☆
function veSao(diem) {
    var chu = "";
    for (var i = 1; i <= 5; i++) {
        chu = chu + (i <= Math.round(diem) ? "★" : "☆");
    }
    return chu;
}

// Đánh giá: { idMon, email, ten, soSao, noiDung, ngay }

// Đánh giá bị quản trị viên ẩn (an = true) không hiện ra cho khách; tatCa = true thì lấy cả đánh giá bị ẩn
function layDanhGia(idMon, tatCa) {
    var ds = docDuLieu("jb_danhGia", []);
    var kq = [];
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].idMon == idMon && (tatCa == true || !ds[i].an)) {
            kq.push(ds[i]);
        }
    }
    return kq;
}

// Mỗi khách chỉ có MỘT đánh giá cho mỗi món: đã đánh giá rồi thì cập nhật lại
function layDanhGiaCuaKhach(email, idMon) {
    var ds = layDanhGia(idMon, true);
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].email == email) {
            return ds[i];
        }
    }
    return null;
}

function themDanhGia(danhGia) {
    var tatCa = docDuLieu("jb_danhGia", []);
    var ds = [];
    for (var i = 0; i < tatCa.length; i++) {
        if (!(tatCa[i].idMon == danhGia.idMon && tatCa[i].email == danhGia.email)) {
            ds.push(tatCa[i]);
        } else if (tatCa[i].an) {
            danhGia.an = true;              // đánh giá đã bị ẩn thì sửa lại vẫn bị ẩn, chờ quản trị viên duyệt
        }
    }
    ds.unshift(danhGia);
    ghiDuLieu("jb_danhGia", ds);
}

// Xóa đánh giá: chủ đánh giá xóa của mình, quản trị viên xóa được mọi đánh giá vi phạm
function xoaDanhGia(idMon, email) {
    var nguoi = layNguoiDangNhap();
    if (nguoi == null || (nguoi.email != email && nguoi.vaiTro != "quantri")) {
        return false;
    }
    var tatCa = docDuLieu("jb_danhGia", []);
    var ds = [];
    for (var i = 0; i < tatCa.length; i++) {
        if (!(tatCa[i].idMon == idMon && tatCa[i].email == email)) {
            ds.push(tatCa[i]);
        }
    }
    ghiDuLieu("jb_danhGia", ds);
    return ds.length < tatCa.length;
}

// Kiểm duyệt: quản trị viên ẩn / hiện lại một đánh giá
function anHienDanhGia(idMon, email) {
    if (laQuanTriDangNhap() == false) {
        return false;
    }
    var ds = docDuLieu("jb_danhGia", []);
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].idMon == idMon && ds[i].email == email) {
            ds[i].an = !ds[i].an;
            ghiDuLieu("jb_danhGia", ds);
            return true;
        }
    }
    return false;
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

// Đầu trang + chân trang đã viết sẵn trong từng file html.
// JS chỉ cập nhật 2 chỗ phụ thuộc người dùng: phần tài khoản (thanh vàng) và nút giỏ hàng.
function capNhatDauTrang() {
    var nguoi = layNguoiDangNhap();
    var taiKhoan = '<a href="dangnhap.html">ĐĂNG KÝ / ĐĂNG NHẬP</a>';
    if (nguoi != null) {
        if (nguoi.vaiTro == "khach") {
            taiKhoan = '<a href="taikhoan.html">' + maHoaChu(nguoi.hoTen) + '</a><span class="sep"></span>';
        } else {                                    // nhân viên / quản trị: chỉ hiện tên, không có liên kết
            taiKhoan = '<span class="jb-ten">' + maHoaChu(nguoi.hoTen) + '</span><span class="sep"></span>';
        }
        if (nguoi.vaiTro == "khach") {
            taiKhoan = taiKhoan + '<a href="donhang.html">ĐƠN HÀNG</a><span class="sep"></span>';
        }
        if (nguoi.vaiTro != "khach") {
            taiKhoan = taiKhoan + '<a href="quantri.html">QUẢN TRỊ</a><span class="sep"></span>';
        }
        taiKhoan = taiKhoan + '<a href="#" onclick="dangXuat(); return false;">ĐĂNG XUẤT</a>';
    }
    datHTML("jb-tk", taiKhoan);
    var mega = document.getElementsByClassName("jb-mega");       // menu Thực đơn vẽ theo danh mục hiện có
    if (mega.length > 0) {
        var dm = layDanhMuc();
        var menu = "";
        for (var i = 0; i < dm.length; i++) {
            menu = menu + '<a href="thucdon.html?cat=' + encodeURIComponent(dm[i].ma) + '"><img src="' + maHoaChu(dm[i].anh || "") + '" alt="" onerror="this.style.visibility=\'hidden\'">' + maHoaChu(dm[i].ten) + '</a>';
        }
        mega[0].innerHTML = menu;
    }
    if (duocMuaHang() == false) {                  // nhân viên / quản trị không có giỏ hàng, không có "Đơn hàng của tôi"
        layId("jb-gio").style.display = "none";
        var lk = document.querySelectorAll('.jb-foot a[href="donhang.html"]');
        for (var j = 0; j < lk.length; j++) {
            lk[j].parentNode.style.display = "none";
        }
    }
    capNhatSoLuongGio();
}

// ================= 10. THANH TOÁN QR, THÔNG TIN LIÊN HỆ, TRÒ CHUYỆN =================

// Mã kiểm tra CRC16 (CCITT) mà chuẩn VietQR yêu cầu ở cuối chuỗi
function tinhCRC16(chuoi) {
    var crc = 0xFFFF;
    for (var i = 0; i < chuoi.length; i++) {
        crc = crc ^ (chuoi.charCodeAt(i) << 8);
        for (var b = 0; b < 8; b++) {
            if (crc & 0x8000) {
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
            } else {
                crc = (crc << 1) & 0xFFFF;
            }
        }
    }
    return ("0000" + crc.toString(16).toUpperCase()).slice(-4);
}

// Một trường dữ liệu của VietQR: mã (2 số) + độ dài (2 số) + giá trị
function truongQR(ma, giaTri) {
    return ma + ("0" + giaTri.length).slice(-2) + giaTri;
}

// Chuỗi VietQR chứa sẵn ngân hàng, số tài khoản, số tiền và nội dung chuyển khoản
function taoChuoiVietQR(soTien, noiDung) {
    var nh = CUA_HANG.nganHang;
    var noiDungSach = noiDung.replace(/[^A-Za-z0-9 ]/g, "").slice(0, 25);
    var taiKhoan = truongQR("00", nh.bin) + truongQR("01", nh.soTK);
    var chuoi = truongQR("00", "01") + truongQR("01", "12") +
        truongQR("38", truongQR("00", "A000000727") + truongQR("01", taiKhoan) + truongQR("02", "QRIBFTTA")) +
        truongQR("53", "704") + truongQR("54", String(Math.round(soTien))) + truongQR("58", "VN") +
        truongQR("62", truongQR("08", noiDungSach)) + "6304";
    return chuoi + tinhCRC16(chuoi);
}

// Vẽ mã QR (thẻ svg) từ một chuỗi bất kỳ, dùng thư viện qr.js
function veMaQR(chuoi) {
    var qr = qrcode(0, "M");
    qr.addData(chuoi);
    qr.make();
    return qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
}

// Khung thanh toán chuyển khoản: mã QR + thông tin tài khoản + số tiền + nội dung
function veKhungQR(soTien, noiDung, anHuongDan) {
    var nh = CUA_HANG.nganHang;
    var dong = function (nhan, giaTri) {
        return '<div class="qr-dong"><span>' + nhan + '</span><b>' + maHoaChu(giaTri) + '</b></div>';
    };
    return '<div class="qr-khung"><div class="qr-anh">' + veMaQR(taoChuoiVietQR(soTien, noiDung)) + '</div>' +
        '<div class="qr-tt">' + dong("Ngân hàng", nh.ten) + dong("Số tài khoản", nh.soTK) + dong("Chủ tài khoản", nh.chuTK) +
        '<div class="qr-dong"><span>Số tiền</span><b class="qr-tien">' + dinhDangTien(soTien) + '</b></div>' +
        dong("Nội dung", noiDung) + '</div></div>' +
        (anHuongDan ? "" : '<p class="nho muted qr-ghi">Mở ứng dụng ngân hàng, chọn quét mã QR: số tiền và nội dung đã được điền sẵn.</p>');
}

// Hộp thoại dùng chung: tạo một lần, mỗi lần gọi chỉ đổi tiêu đề và nội dung
function hienHopThoai(tieuDe, noiDung) {
    var hop = document.getElementById("hop-chung");
    if (hop == null) {
        hop = document.createElement("div");
        hop.className = "hop-nen";
        hop.id = "hop-chung";
        hop.innerHTML = '<div class="hop"><div class="hop-dau"><h5 id="hop-chung-t"></h5>' +
            '<button class="hop-dong" onclick="dongHopThoai(\'hop-chung\')">&times;</button></div>' +
            '<div class="hop-than" id="hop-chung-n"></div></div>';
        document.body.appendChild(hop);
    }
    datChu("hop-chung-t", tieuDe);
    datHTML("hop-chung-n", noiDung);
    moHopThoai("hop-chung");
}

// Thông tin chủ cửa hàng và mã QR Zalo (dùng ở trang Liên hệ)
function veThongTinCuaHang() {
    var c = CUA_HANG;
    var dong = function (nhan, giaTri) {
        return '<div class="lh-dong"><span>' + nhan + '</span><b>' + maHoaChu(giaTri) + '</b></div>';
    };
    return '<div class="lh-khung"><div class="lh-tt"><h5>' + maHoaChu(c.ten) + '</h5>' +
        dong(c.chucVu, c.chu) + dong("Số điện thoại", c.sdt) + dong("Zalo", c.zalo) + dong("Email", c.email) +
        dong("Địa chỉ", c.diaChi) + dong("Giờ mở cửa", c.gioMoCua) + '</div>' +
        '<div class="lh-zalo"><div class="qr-anh">' + veMaQR("https://zalo.me/" + c.zalo.replace(/[^0-9]/g, "")) + '</div>' +
        '<b>Quét mã để nhắn Zalo</b><small class="muted">Tư vấn đặt tiệc sinh nhật, đơn hàng lớn</small></div></div>';
}

// Khung "Trò chuyện cùng Jolly" ở góc dưới bên phải: khách để lại ý kiến, đánh giá, góp ý
function moTroChuyen() {
    var khung = document.getElementById("chatPanel");
    if (khung == null) {
        khung = document.createElement("div");
        khung.className = "chat-panel";
        khung.id = "chatPanel";
        khung.innerHTML = '<div class="chat-dau"><b>Trò chuyện cùng Jolly</b>' +
            '<button class="hop-dong" onclick="moTroChuyen()" aria-label="Đóng">&times;</button></div>' +
            '<div class="chat-than"><div class="chat-bong">Xin chào! Jolly rất muốn nghe ý kiến, đánh giá hoặc góp ý của bạn về món ăn và dịch vụ.</div>' +
            '<form id="fGopY" novalidate>' +
            '<label class="nhan">Họ và tên</label><input id="gy-n" class="o-nhap">' +
            '<label class="nhan">Email</label><input id="gy-e" class="o-nhap" type="email">' +
            '<label class="nhan">Ý kiến, góp ý của bạn</label><textarea id="gy-m" rows="3" class="o-nhap"></textarea>' +
            '<div class="invalid-msg" id="gy-err"></div><button class="btn-jb w100 mt2">Gửi cho Jolly</button></form></div>';
        document.body.appendChild(khung);
        layId("fGopY").onsubmit = guiGopY;
        var nguoi = layNguoiDangNhap();
        if (nguoi != null) {
            layId("gy-n").value = nguoi.hoTen;
            layId("gy-e").value = nguoi.email;
        }
    }
    khung.classList.toggle("show");
}

// Gửi ý kiến: kiểm tra rồi lưu vào localStorage (khóa jb_lienHe)
function guiGopY(e) {
    e.preventDefault();
    var ten = layGiaTri("gy-n");
    var email = layGiaTri("gy-e");
    var noiDung = layGiaTri("gy-m");
    var loi = "";
    if (ten == "" || noiDung == "") {
        loi = "Vui lòng nhập họ tên và ý kiến.";
    } else if (emailHopLe(email) == false) {
        loi = "Email không hợp lệ.";
    }
    datChu("gy-err", loi);
    if (loi != "") {
        return;
    }
    var ds = docDuLieu("jb_lienHe", []);
    ds.unshift({ ten: ten, email: email, noiDung: noiDung, ngay: new Date().toISOString() });
    ghiDuLieu("jb_lienHe", ds);
    layId("gy-m").value = "";
    thongBao("Cảm ơn bạn! Jolly đã nhận được ý kiến của bạn.");
    moTroChuyen();
}

khoiTaoDuLieu();
