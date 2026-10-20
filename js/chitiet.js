// ===== CHI TIẾT MÓN ĂN: thông tin, chọn số lượng, thêm vào giỏ, đánh giá, món liên quan =====

var monDangXem = null;

// Số lượng đang nhập (ép về khoảng 1 .. TOI_DA)
function laySoLuongChon() {
    var n = parseInt(layId("qv").value, 10);
    if (isNaN(n) || n < 1) {
        n = 1;
    }
    if (n > TOI_DA) {
        n = TOI_DA;
    }
    return n;
}

function tangGiamSoLuong(buoc) {
    var n = laySoLuongChon() + buoc;
    if (n < 1) {
        n = 1;
    }
    if (n > TOI_DA) {
        n = TOI_DA;
    }
    layId("qv").value = n;
}

function bamThemVaoGio() {
    var kq = themMonVaoGio(monDangXem.id, laySoLuongChon());
    thongBao(kq.thongBao);
}

function bamMuaNgay() {
    var kq = themMonVaoGio(monDangXem.id, laySoLuongChon());
    if (kq.ok) {
        location.href = "giohang.html";
    } else {
        thongBao(kq.thongBao);
    }
}

// 4.3 -> "★★★★☆"
function veSao(diem) {
    var chu = "";
    for (var i = 1; i <= 5; i++) {
        chu = chu + (i <= Math.round(diem) ? "★" : "☆");
    }
    return chu;
}

function veThongTinMon() {
    var mon = monDangXem;
    var dm = timDanhMuc(mon.danhMuc);
    var ghiChuGia = "";
    if (mon.giaCao > mon.gia) {
        ghiChuGia = '<p class="muted nho">Giá thay đổi theo kích cỡ/lựa chọn kèm theo. Giỏ hàng tính theo giá thấp nhất.</p>';
    }
    datHTML("detail",
        '<div class="chia md" style="--tl:5fr 7fr">' +
        '<div><img class="ct-anh" src="' + maHoaChu(anhMon(mon)) + '" alt="' + maHoaChu(mon.ten) + '" onerror="anhLoi(this)"></div>' +
        '<div><nav class="ct-duong-dan"><a href="thucdon.html">Thực đơn</a> / <a href="thucdon.html?cat=' + mon.danhMuc + '">' + maHoaChu(dm.ten) + '</a></nav>' +
        '<h1 class="ct-ten">' + maHoaChu(mon.ten) + '</h1><div class="stars" id="avg"></div>' +
        '<div class="ct-gia">' + giaHienThi(mon) + '</div><p>' + maHoaChu(mon.moTa) + '</p>' + ghiChuGia +
        '<div class="ct-hang"><div class="qty"><button id="mi">−</button><input id="qv" value="1" inputmode="numeric"><button id="pl">+</button></div>' +
        '<button class="btn-jb" id="add">Thêm vào giỏ</button><button class="btn-jb yellow" id="buy">Mua ngay</button></div></div></div>');
    layId("mi").onclick = function () { tangGiamSoLuong(-1); };
    layId("pl").onclick = function () { tangGiamSoLuong(1); };
    layId("qv").onchange = function () { layId("qv").value = laySoLuongChon(); };
    layId("add").onclick = bamThemVaoGio;
    layId("buy").onclick = bamMuaNgay;
}

// Vẽ điểm trung bình và danh sách đánh giá
function veDanhGia() {
    var ds = layDanhGia(monDangXem.id);
    var tong = 0;
    for (var i = 0; i < ds.length; i++) {
        tong = tong + ds[i].soSao;
    }
    if (ds.length == 0) {
        datHTML("avg", '<small class="muted">Chưa có đánh giá</small>');
        datHTML("reviews", '<p class="muted">Hãy là người đầu tiên đánh giá món này.</p>');
        return;
    }
    var tb = tong / ds.length;
    datHTML("avg", veSao(tb) + ' <small class="muted">(' + tb.toFixed(1) + ' · ' + ds.length + ' đánh giá)</small>');
    var html = "";
    for (var k = 0; k < ds.length; k++) {
        html = html + '<div class="box"><b>' + maHoaChu(ds[k].ten) + '</b> <span class="stars">' + veSao(ds[k].soSao) + '</span> ' +
            '<small class="muted">' + new Date(ds[k].ngay).toLocaleDateString("vi-VN") + '</small><div>' + maHoaChu(ds[k].noiDung) + '</div></div>';
    }
    datHTML("reviews", html);
}

// Khách bấm "Gửi đánh giá"
function guiDanhGia() {
    var nguoi = layNguoiDangNhap();
    var noiDung = layGiaTri("rt");
    if (noiDung == "") {
        datChu("re", "Vui lòng nhập nội dung.");
        return;
    }
    themDanhGia({
        idMon: monDangXem.id,
        email: nguoi.email,
        ten: nguoi.hoTen,
        soSao: Number(layId("rs").value),
        noiDung: noiDung,
        ngay: new Date().toISOString()
    });
    layId("rt").value = "";
    datChu("re", "");
    veDanhGia();
    thongBao("Cảm ơn bạn đã đánh giá!");
}

// Ô viết đánh giá: chỉ khách đã nhận món mới được viết
function veKhungDanhGia() {
    var nguoi = layNguoiDangNhap();
    if (nguoi == null) {
        datHTML("reviewForm", 'Vui lòng <a href="dangnhap.html?next=chitiet.html%3Fid%3D' + monDangXem.id + '"><b>đăng nhập</b></a> để đánh giá.');
    } else if (daMuaMon(nguoi.email, monDangXem.id) == false) {
        datHTML("reviewForm", '<span class="muted">Chỉ khách đã nhận món này mới có thể đánh giá.</span>');
    } else {
        datHTML("reviewForm",
            '<div class="danh-gia-gui"><select id="rs" class="o-nhap"><option value="5">5 sao</option><option value="4">4 sao</option><option value="3">3 sao</option><option value="2">2 sao</option><option value="1">1 sao</option></select>' +
            '<textarea id="rt" class="o-nhap" rows="2" placeholder="Chia sẻ cảm nhận của bạn"></textarea>' +
            '<div class="invalid-msg" id="re"></div><button class="btn-jb" id="rb">Gửi đánh giá</button></div>');
        layId("rb").onclick = guiDanhGia;
    }
}

// Tối đa 4 món cùng danh mục
function veMonLienQuan() {
    var ds = layMonAn(false);
    var html = "";
    var dem = 0;
    for (var i = 0; i < ds.length && dem < 4; i++) {
        if (ds[i].danhMuc == monDangXem.danhMuc && ds[i].id != monDangXem.id) {
            html = html + veTheMon(ds[i]);
            dem = dem + 1;
        }
    }
    if (html == "") {
        html = '<p class="muted">Chưa có món liên quan.</p>';
    }
    datHTML("related", html);
}

function khoiTaoChiTiet() {
    veDauTrangVaChanTrang("thucdon.html");
    monDangXem = timMon(layThamSo("id"));
    if (monDangXem == null) {
        datHTML("detail", '<div class="text-center" style="padding:3rem 0"><h4>Không tìm thấy món ăn.</h4><a class="btn-jb" href="thucdon.html">Về thực đơn</a></div>');
        layId("reviewForm").remove();
        layId("reviews").remove();
        return;
    }
    veThongTinMon();
    veKhungDanhGia();
    veDanhGia();
    veMonLienQuan();
}
