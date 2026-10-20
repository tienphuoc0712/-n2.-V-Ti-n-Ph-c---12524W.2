// ===== ĐƠN HÀNG CỦA TÔI: danh sách đơn, hủy đơn khi còn "Chờ xác nhận" =====

var nguoiXem = null;

function veDonHang() {
    var ds = layDonHang();
    var html = "";
    for (var i = 0; i < ds.length; i++) {
        var don = ds[i];
        if (don.email != nguoiXem.email) {
            continue;
        }
        var dongMon = "";
        for (var j = 0; j < don.mon.length; j++) {
            dongMon = dongMon + '<div class="sum-line"><span>' + don.mon[j].soLuong + ' × ' + maHoaChu(don.mon[j].ten) + '</span><span>' + dinhDangTien(don.mon[j].gia * don.mon[j].soLuong) + '</span></div>';
        }
        var nutHuy = "";
        if (don.trangThai == "cho_xac_nhan") {          // chỉ hủy được khi chưa xác nhận
            nutHuy = '<button class="btn-line cx" onclick="bamHuyDon(\'' + don.ma + '\')">Hủy đơn</button>';
        }
        html = html + '<div class="box don"><div class="don-dau"><div><b>#' + don.ma + '</b> <small class="muted">' + new Date(don.ngay).toLocaleString("vi-VN") + '</small></div>' +
            '<span class="status st-' + don.trangThai + '">' + TRANG_THAI[don.trangThai] + '</span></div><hr>' + dongMon +
            '<div class="nho muted mt2">Người nhận: ' + maHoaChu(don.ten) + ' · ' + maHoaChu(don.sdt) + ' · ' + maHoaChu(don.diaChi) + '</div>' +
            '<div class="don-cuoi"><b class="don-tong">' + dinhDangTien(don.tong) + '</b>' + nutHuy + '</div></div>';
    }
    if (html == "") {
        html = '<div class="rong-trong">Bạn chưa có đơn hàng nào.<br><a class="btn-jb mt3" href="thucdon.html">Đặt món ngay</a></div>';
    }
    datHTML("list", html);
}

function bamHuyDon(ma) {
    if (confirm("Bạn chắc chắn muốn hủy đơn này?")) {
        huyDonHang(ma);
        veDonHang();
        thongBao("Đã hủy đơn hàng");
    }
}

function khoiTaoDonHang() {
    veDauTrangVaChanTrang("");
    nguoiXem = layNguoiDangNhap();
    if (nguoiXem == null) {
        location.href = "dangnhap.html?next=donhang.html";
        return;
    }
    veDonHang();
}
