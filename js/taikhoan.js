// ===== TÀI KHOẢN CỦA TÔI: cập nhật hồ sơ, đổi mật khẩu =====

var nguoiHienTai = null;

function luuHoSo(e) {
    e.preventDefault();
    var kq = capNhatHoSo(layGiaTri("ho-n"), layGiaTri("ho-t"), layGiaTri("ho-d"));
    if (kq.ok) {
        datChu("ho-err", "");
        capNhatDauTrang();
        thongBao("Đã cập nhật thông tin");
    } else {
        datChu("ho-err", kq.thongBao);
    }
}

function luuMatKhauMoi(e) {
    e.preventDefault();
    if (layId("mk-m").value != layId("mk-n").value) {
        datChu("mk-err", "Hai lần nhập mật khẩu mới chưa giống nhau.");
        return;
    }
    var kq = doiMatKhau(layId("mk-c").value, layId("mk-m").value);
    if (kq.ok) {
        layId("fmk").reset();
        datChu("mk-err", "");
        thongBao("Đã đổi mật khẩu");
    } else {
        datChu("mk-err", kq.thongBao);
    }
}

function khoiTaoTaiKhoan() {
    capNhatDauTrang();
    nguoiHienTai = layNguoiDangNhap();
    if (nguoiHienTai == null) {
        location.href = "dangnhap.html?next=taikhoan.html";
        return;
    }
    if (nguoiHienTai.vaiTro != "khach") {
        location.href = "quantri.html";
        return;
    }
    layId("ho-e").value = nguoiHienTai.email;
    layId("ho-n").value = nguoiHienTai.hoTen;
    layId("ho-t").value = nguoiHienTai.sdt;
    layId("ho-d").value = nguoiHienTai.diaChi || "";
    layId("fho").onsubmit = luuHoSo;
    layId("fmk").onsubmit = luuMatKhauMoi;
}
