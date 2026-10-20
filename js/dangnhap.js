// ===== ĐĂNG NHẬP / ĐĂNG KÝ =====

// Địa chỉ trang sẽ quay lại sau khi đăng nhập xong (mặc định là trang chủ)
function layTrangQuayLai() {
    var trang = layThamSo("next");
    if (trang == "") {
        return "trangchu.html";
    }
    // chỉ cho phép chuyển đến file .html cùng thư mục, chặn địa chỉ ra bên ngoài
    if (/^[\w\-\.%]+\.html/.test(trang) == false || /^[a-z]+:/i.test(trang)) {
        return "trangchu.html";
    }
    return trang;
}

// Chuyển qua lại giữa tab "Đăng nhập" và "Đăng ký"
function chuyenTab(tab) {
    var cacTab = layId("tab").getElementsByTagName("a");
    for (var i = 0; i < cacTab.length; i++) {
        if (cacTab[i].getAttribute("data-t") == tab) {
            cacTab[i].classList.add("active");
        } else {
            cacTab[i].classList.remove("active");
        }
    }
    layId("fup").style.display = tab == "up" ? "" : "none";
    layId("fin").style.display = tab == "in" ? "" : "none";
}

function xuLyDangNhap(e) {
    e.preventDefault();
    var kq = dangNhapTaiKhoan(layGiaTri("li-e"), layId("li-p").value);
    if (kq.ok) {
        location.href = layTrangQuayLai();
    } else {
        datChu("li-err", kq.thongBao);
    }
}

function xuLyDangKy(e) {
    e.preventDefault();
    var hoTen = layGiaTri("su-n");
    var email = layGiaTri("su-e");
    var sdt = layGiaTri("su-t");
    var matKhau = layId("su-p").value;
    var loi = "";

    if (hoTen == "") {
        loi = "Vui lòng nhập họ tên.";
    } else if (emailHopLe(email) == false) {
        loi = "Email không hợp lệ.";
    } else if (sdtHopLe(sdt) == false) {
        loi = "Số điện thoại gồm 10 số, bắt đầu bằng 0.";
    } else if (matKhau.length < 6) {
        loi = "Mật khẩu tối thiểu 6 ký tự.";
    }
    if (loi != "") {
        datChu("su-err", loi);
        return;
    }
    var kq = dangKyTaiKhoan(hoTen, email, sdt, matKhau);
    if (kq.ok) {
        location.href = layTrangQuayLai();
    } else {
        datChu("su-err", kq.thongBao);
    }
}

function khoiTaoDangNhap() {
    veDauTrangVaChanTrang("");
    var cacTab = layId("tab").getElementsByTagName("a");
    for (var i = 0; i < cacTab.length; i++) {
        cacTab[i].onclick = function (e) {
            e.preventDefault();
            chuyenTab(this.getAttribute("data-t"));
        };
    }
    layId("fin").onsubmit = xuLyDangNhap;
    layId("fup").onsubmit = xuLyDangKy;
}
