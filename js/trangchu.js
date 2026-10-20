// ===== TRANG CHỦ: banner trượt, danh mục, món bán chạy, khuyến mãi, tin tức =====

var viTriBanner = 0;        // banner đang hiện (0 = banner đầu tiên)
var henGioBanner = null;    // bộ đếm giờ tự chuyển banner

// Chuyển sang banner thứ i (hết banner cuối thì quay về đầu)
function chuyenBanner(i) {
    var tong = DU_LIEU.banner.length;
    viTriBanner = (i + tong) % tong;
    layId("heroItems").style.transform = "translateX(-" + (viTriBanner * 100) + "%)";
    var cham = layId("heroDots").getElementsByTagName("button");
    for (var k = 0; k < cham.length; k++) {
        if (k == viTriBanner) {
            cham[k].classList.add("active");
        } else {
            cham[k].classList.remove("active");
        }
    }
}

// Cứ 4,5 giây tự chuyển sang banner kế tiếp
function batDauTuChuyen() {
    clearInterval(henGioBanner);
    henGioBanner = setInterval(function () { chuyenBanner(viTriBanner + 1); }, 4500);
}

function veBanner() {
    var htmlBanner = "";
    var htmlCham = "";
    for (var i = 0; i < DU_LIEU.banner.length; i++) {
        htmlBanner = htmlBanner + '<div class="slider-muc"><div class="bn"><img src="' + DU_LIEU.banner[i] + '" alt="" onerror="this.style.display=\'none\'"></div></div>';
        htmlCham = htmlCham + '<button type="button" onclick="chuyenBanner(' + i + '); batDauTuChuyen();"></button>';
    }
    datHTML("heroItems", htmlBanner);
    datHTML("heroDots", htmlCham);
    layId("sTruoc").onclick = function () { chuyenBanner(viTriBanner - 1); batDauTuChuyen(); };
    layId("sSau").onclick = function () { chuyenBanner(viTriBanner + 1); batDauTuChuyen(); };
    layId("slider").onmouseenter = function () { clearInterval(henGioBanner); };     // rê chuột vào thì dừng
    layId("slider").onmouseleave = batDauTuChuyen;
    chuyenBanner(0);
    batDauTuChuyen();
}

// Các nhóm món (Combo, Gà giòn, Mì Ý...)
function veDanhMuc() {
    var html = "";
    var dm = layDanhMuc();
    for (var i = 0; i < dm.length; i++) {
        html = html + '<a class="cat-chip" href="thucdon.html?cat=' + dm[i].ma + '"><img src="' + dm[i].anh + '" alt="" onerror="this.style.visibility=\'hidden\'">' + maHoaChu(dm[i].ten) + '</a>';
    }
    datHTML("catStrip", html);
}

// Tối đa 8 món bán chạy
function veMonBanChay() {
    var ds = layMonAn(false);
    var html = "";
    var dem = 0;
    for (var i = 0; i < ds.length && dem < 8; i++) {
        if (ds[i].banChay) {
            html = html + veTheMon(ds[i]);
            dem = dem + 1;
        }
    }
    datHTML("hotGrid", html);
}

function veKhuyenMai() {
    var ds = layKhuyenMai(false);
    var html = "";
    for (var i = 0; i < ds.length; i++) {
        html = html + veTheKhuyenMai(ds[i], false);
    }
    datHTML("promoGrid", html);
}

function veTinTuc() {
    var html = "";
    for (var i = 0; i < 3 && i < DU_LIEU.tinTuc.length; i++) {
        var t = DU_LIEU.tinTuc[i];
        html = html + '<div class="news-card"><div class="ph">J</div><div class="bd"><small>' + t.ngay + '</small><h5>' + maHoaChu(t.tieuDe) + '</h5><p>' + maHoaChu(t.noiDung) + '</p></div></div>';
    }
    datHTML("newsGrid", html);
}

// Hai nút "Giao hàng tận nơi" / "Đặt đến lấy": ghi nhớ lựa chọn rồi sang trang thực đơn
function toSangHinhThuc() {
    var hinhThuc = layHinhThuc();
    if (hinhThuc == "giao_tan_noi") {
        layId("mDel").classList.add("on");
        layId("mPick").classList.remove("on");
    } else {
        layId("mPick").classList.add("on");
        layId("mDel").classList.remove("on");
    }
}

function chonHinhThuc(hinhThuc) {
    luuHinhThuc(hinhThuc);
    toSangHinhThuc();
    location.href = "thucdon.html";
}

function khoiTaoTrangChu() {
    veDauTrangVaChanTrang("trangchu.html");
    veBanner();
    veDanhMuc();
    veMonBanChay();
    veKhuyenMai();
    veTinTuc();
    layId("mDel").onclick = function () { chonHinhThuc("giao_tan_noi"); };
    layId("mPick").onclick = function () { chonHinhThuc("den_lay"); };
    toSangHinhThuc();
}
