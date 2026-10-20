// ===== GIỎ HÀNG: đổi số lượng, xóa món, áp mã giảm giá, chọn hình thức nhận hàng =====

var kmDangDung = null;      // khuyến mãi khách đã áp dụng (null = chưa dùng mã)

// Lấy mã đã áp dụng từ lần trước (lưu tạm trong sessionStorage để sang trang đặt hàng vẫn còn)
function nhoLaiMaDaDung() {
    try {
        var ma = sessionStorage.getItem("jb_ma");
        if (ma) {
            var kq = kiemTraMa(ma, layTamTinh());
            if (kq.ok) {
                kmDangDung = kq.km;
                layId("code").value = ma;
            }
        }
    } catch (loi) { }
}

// Vẽ bảng giỏ hàng và các dòng tiền
function veGioHang() {
    var dong = layDongGio();
    if (dong.length == 0) {
        datHTML("lines", '<div class="cart-trong">Giỏ hàng đang trống.<br><a class="btn-jb mt3" href="thucdon.html">Chọn món ngay</a></div>');
        layId("go").disabled = true;
    } else {
        layId("go").disabled = false;
        var html = "";
        for (var i = 0; i < dong.length; i++) {
            var m = dong[i].mon;
            html = html + '<div class="cart-row">' +
                '<img src="' + maHoaChu(anhMon(m)) + '" alt="' + maHoaChu(m.ten) + '" onerror="anhLoi(this)">' +
                '<div class="ten"><b>' + maHoaChu(m.ten) + '</b><div class="muted nho">' + dinhDangTien(m.gia) + '</div></div>' +
                '<div class="qty"><button class="dec" onclick="giamMon(' + m.id + ', ' + dong[i].soLuong + ')">−</button>' +
                '<input class="qi" value="' + dong[i].soLuong + '" onchange="datSoLuongTuONhap(' + m.id + ', this.value)">' +
                '<button class="inc" onclick="tangMon(' + m.id + ', ' + dong[i].soLuong + ')">+</button></div>' +
                '<b class="tien">' + dinhDangTien(dong[i].thanhTien) + '</b>' +
                '<button class="rm" title="Xóa" onclick="xoaMon(' + m.id + ')">✕</button></div>';
        }
        datHTML("lines", html);
    }

    // mã đã áp dụng nhưng giỏ thay đổi làm không đủ điều kiện nữa thì bỏ mã
    if (kmDangDung != null) {
        var kt = kiemTraMa(kmDangDung.ma, layTamTinh());
        if (kt.ok == false) {
            kmDangDung = null;
            datHTML("pm", '<span style="color:#dc3545">Mã không còn đủ điều kiện áp dụng.</span>');
        }
    }
    var t = tinhTien(layTamTinh(), layHinhThuc(), kmDangDung);
    datChu("s1", dinhDangTien(t.tamTinh));
    datChu("s2", dinhDangTien(t.phiGiao));
    datChu("s3", "-" + dinhDangTien(t.giamGia));
    datChu("s4", dinhDangTien(t.tong));
    if (kmDangDung != null) {
        datHTML("pm", '<span class="ok-msg">Đã áp dụng: ' + maHoaChu(kmDangDung.tieuDe) + '</span>');
    }
}

function tangMon(id, soLuongHienTai) {
    if (soLuongHienTai + 1 > TOI_DA) {
        thongBao("Tối đa " + TOI_DA + " phần mỗi món");
        return;
    }
    datSoLuongMon(id, soLuongHienTai + 1);
    veGioHang();
}

function giamMon(id, soLuongHienTai) {
    datSoLuongMon(id, soLuongHienTai - 1);      // tối thiểu 1 (muốn bỏ món thì bấm ✕)
    veGioHang();
}

function datSoLuongTuONhap(id, giaTri) {
    datSoLuongMon(id, giaTri);
    veGioHang();
}

function xoaMon(id) {
    xoaMonKhoiGio(id);
    veGioHang();
}

// Bấm nút "Áp dụng"
function apDungMa() {
    var kq = kiemTraMa(layId("code").value, layTamTinh());
    if (kq.ok) {
        kmDangDung = kq.km;
        try { sessionStorage.setItem("jb_ma", kq.km.ma); } catch (loi) { }
        datHTML("pm", "");
    } else {
        kmDangDung = null;
        datHTML("pm", '<span style="color:#dc3545">' + kq.thongBao + '</span>');
    }
    veGioHang();
}

// Chọn "Giao tận nơi" / "Đến lấy"
function doiHinhThuc() {
    var o = document.getElementsByName("mode");
    for (var i = 0; i < o.length; i++) {
        if (o[i].checked) {
            luuHinhThuc(o[i].value);
        }
    }
    veGioHang();
}

function khoiTaoGioHang() {
    veDauTrangVaChanTrang("giohang.html");
    nhoLaiMaDaDung();
    var o = document.getElementsByName("mode");
    for (var i = 0; i < o.length; i++) {
        o[i].checked = o[i].value == layHinhThuc();
        o[i].onchange = doiHinhThuc;
    }
    layId("ap").onclick = apDungMa;
    layId("go").onclick = function () { location.href = "dathang.html"; };
    veGioHang();
}
