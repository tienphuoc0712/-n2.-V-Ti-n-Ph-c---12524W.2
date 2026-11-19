// ===== ĐƠN HÀNG CỦA TÔI: danh sách đơn, hủy đơn khi còn "Chờ xác nhận" =====

var nguoiXem = null;
var TT_THANH_TOAN = { cod: "Tiền mặt khi nhận", bank: "Chuyển khoản", wallet: "Ví điện tử" };

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
        var nutQR = "";
        if (don.thanhToan == "bank" && daThanhToan(don) == false && (don.trangThai == "cho_xac_nhan" || don.trangThai == "da_xac_nhan" || don.trangThai == "dang_chuan_bi" || don.trangThai == "dang_giao")) {
            nutQR = '<button class="btn-jb cx" onclick="xemQRDon(\'' + don.ma + '\')">Mã QR thanh toán</button> ';
        }
        html = html + '<div class="box don"><div class="don-dau"><div><b>#' + don.ma + '</b> <small class="muted">' + new Date(don.ngay).toLocaleString("vi-VN") + '</small></div>' +
            '<span class="status st-' + don.trangThai + '">' + TRANG_THAI[don.trangThai] + '</span></div><hr>' + dongMon +
            '<div class="nho muted mt2">Người nhận: ' + maHoaChu(don.ten) + ' · ' + maHoaChu(don.sdt) + ' · ' + maHoaChu(don.diaChi) + '</div>' +
            '<div class="nho muted">Thanh toán: ' + maHoaChu(TT_THANH_TOAN[don.thanhToan] || don.thanhToan) + ' · ' + (daThanhToan(don) ? "Đã thanh toán" : (don.trangThai == "da_huy" || don.trangThai == "giao_that_bai" ? "Không thu tiền" : "Chưa thanh toán")) + '</div>' +
            '<div class="don-cuoi"><b class="don-tong">' + dinhDangTien(don.tong) + '</b><span>' + nutQR + nutHuy + '</span></div></div>';
    }
    if (html == "") {
        html = '<div class="rong-trong">Bạn chưa có đơn hàng nào.<br><a class="btn-jb mt3" href="thucdon.html">Đặt món ngay</a></div>';
    }
    datHTML("list", html);
}

// Mở lại mã QR chuyển khoản của đơn: số tiền đúng bằng tổng thanh toán của đơn đó
function xemQRDon(ma) {
    var don = timDon(ma);
    if (don == null || don.email != nguoiXem.email) {
        return;
    }
    hienHopThoai("Thanh toán đơn #" + ma, veKhungQR(don.tong, don.ma));
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
    veDonHang();
}
