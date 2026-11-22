// ===== ĐƠN HÀNG CỦA TÔI: danh sách đơn, hủy đơn khi còn "Chờ xác nhận" =====

var nguoiXem = null;
var TT_THANH_TOAN = { cod: "Tiền mặt khi nhận", bank: "Chuyển khoản", wallet: "Ví điện tử" };

var locDonKhach = "all";      // all = tất cả, dang = đang xử lý, xong = đã giao, huy = đã hủy / thất bại

// Nhóm của một đơn theo bộ lọc
function nhomDon(don) {
    if (don.trangThai == "da_giao") { return "xong"; }
    if (don.trangThai == "da_huy" || don.trangThai == "giao_that_bai") { return "huy"; }
    return "dang";
}

function chonLocDon(loc) {
    locDonKhach = loc;
    veDonHang();
}

function veDonHang() {
    var ds = layDonHang();
    var cua = [];
    var dem = { all: 0, dang: 0, xong: 0, huy: 0 };
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].email == nguoiXem.email) {
            cua.push(ds[i]);
            dem.all = dem.all + 1;
            dem[nhomDon(ds[i])] = dem[nhomDon(ds[i])] + 1;
        }
    }
    var tab = '<div class="loc-tab">';
    var nhan = [["all", "Tất cả"], ["dang", "Đang xử lý"], ["xong", "Đã giao"], ["huy", "Đã hủy"]];
    for (var t = 0; t < nhan.length; t++) {
        tab = tab + '<button class="' + (locDonKhach == nhan[t][0] ? "on" : "") + '" onclick="chonLocDon(\'' + nhan[t][0] + '\')">' + nhan[t][1] + '<b>' + dem[nhan[t][0]] + '</b></button>';
    }
    tab = tab + '</div>';

    var html = "";
    for (var k = 0; k < cua.length; k++) {
        var don = cua[k];
        if (locDonKhach != "all" && nhomDon(don) != locDonKhach) {
            continue;
        }
        var dongMon = "";
        var soMon = 0;
        for (var j = 0; j < don.mon.length; j++) {
            soMon = soMon + don.mon[j].soLuong;
            dongMon = dongMon + '<div class="sum-line"><span>' + don.mon[j].soLuong + ' × ' + maHoaChu(don.mon[j].ten) + '</span><span>' + dinhDangTien(don.mon[j].gia * don.mon[j].soLuong) + '</span></div>';
        }
        var nutHuy = "";
        if (don.trangThai == "cho_xac_nhan") {          // chỉ hủy được khi chưa xác nhận
            nutHuy = '<button class="btn-line cx" onclick="bamHuyDon(\'' + don.ma + '\')">Hủy đơn</button>';
        }
        var nutQR = "";
        if (don.thanhToan == "bank" && daThanhToan(don) == false && (don.trangThai == "cho_xac_nhan" || don.trangThai == "da_xac_nhan" || don.trangThai == "dang_chuan_bi" || don.trangThai == "dang_giao")) {
            nutQR = '<button class="btn-jb cx" onclick="xemQRDon(\'' + don.ma + '\')">Mã QR thanh toán</button> ';
        }
        var nutDatLai = "";
        if (don.trangThai == "da_giao" || don.trangThai == "da_huy" || don.trangThai == "giao_that_bai") {          // đơn đã kết thúc thì cho đặt lại
            nutDatLai = '<button class="btn-line cx" onclick="bamDatLaiDon(\'' + don.ma + '\')">Đặt lại đơn</button> ';
        }
        html = html + '<div class="box don m-' + don.trangThai + '"><div class="don-dau"><div><b>#' + don.ma + '</b> <small class="muted">' + new Date(don.ngay).toLocaleString("vi-VN") + ' · ' + thoiGianTruoc(don.ngay) + '</small></div>' +
            nhanTrangThai(don) + '</div>' + veTienTrinh(don) + '<p class="tt-mota">' + moTaTrangThai(don) + '</p><hr>' +
            '<details class="don-mon"' + (cua.length == 1 ? " open" : "") + '><summary>' + soMon + ' phần · xem chi tiết món</summary>' + dongMon + '</details>' +
            '<div class="don-thongtin nho muted"><span>' + (don.hinhThuc == "den_lay" ? "Đến lấy tại cửa hàng" : "Giao tận nơi" + (don.khuVuc ? " (" + maHoaChu(don.khuVuc) + ")" : "")) + '</span><span>Người nhận: ' + maHoaChu(don.ten) + ' · ' + maHoaChu(don.sdt) + '</span><span>' + maHoaChu(don.diaChi) + '</span></div>' +
            '<div class="don-thongtin"><span class="nho muted">' + maHoaChu(TT_THANH_TOAN[don.thanhToan] || don.thanhToan) + '</span>' + nhanThanhToan(don) + '</div>' +
            '<div class="don-cuoi"><b class="don-tong">' + dinhDangTien(don.tong) + '</b><span>' + nutQR + nutDatLai + nutHuy + '</span></div></div>';
    }
    if (html == "") {
        html = '<div class="rong-trong">' + (cua.length == 0 ? 'Bạn chưa có đơn hàng nào.' : 'Không có đơn nào trong mục này.') + '<br><a class="btn-jb mt3" href="thucdon.html">Đặt món ngay</a></div>';
    }
    datHTML("list", tab + html);
}

// Mở lại mã QR chuyển khoản của đơn: số tiền đúng bằng tổng thanh toán của đơn đó
function xemQRDon(ma) {
    var don = timDon(ma);
    if (don == null || don.email != nguoiXem.email) {
        return;
    }
    hienHopThoai("Thanh toán đơn #" + ma, veKhungQR(don.tong, don.ma));
}

// Đặt lại đơn cũ: đưa các món còn bán vào giỏ rồi sang trang giỏ hàng
function bamDatLaiDon(ma) {
    var kq = datLaiDon(ma);
    if (kq.ok == false) {
        thongBao("Không thể đặt lại: các món trong đơn đã ngừng bán hoặc giỏ đã đầy.");
        return;
    }
    thongBao("Đã thêm " + kq.soMon + " món vào giỏ" + (kq.boQua > 0 ? " (" + kq.boQua + " món đã ngừng bán được bỏ qua)" : ""));
    setTimeout(function () { location.href = "giohang.html"; }, 900);
}

function bamHuyDon(ma) {
    if (confirm("Bạn chắc chắn muốn hủy đơn này?")) {
        var daHuy = huyDonHang(ma);
        veDonHang();
        thongBao(daHuy ? "Đã hủy đơn hàng" : "Không thể hủy: đơn đã được cửa hàng xác nhận.");
    }
}

function khoiTaoDonHang() {
    capNhatDauTrang();
    nguoiXem = layNguoiDangNhap();
    if (nguoiXem == null) {
        location.href = "dangnhap.html?next=donhang.html";
        return;
    }
    if (nguoiXem.vaiTro != "khach") {         // theo dõi đơn của nhân viên nằm trong trang quản trị
        location.href = "quantri.html";
        return;
    }
    veDonHang();
}
