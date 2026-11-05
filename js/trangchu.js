// ===== TRANG CHỦ: banner trượt, món bán chạy, khuyến mãi (danh mục và tin tức viết sẵn trong html) =====

var viTriBanner = 0;        // banner đang hiện (0 = banner đầu tiên)
var henGioBanner = null;    // bộ đếm giờ tự chuyển banner

// Chuyển sang banner thứ i (hết banner cuối thì quay về đầu)
function chuyenBanner(i) {
    var tong = layId("heroDots").getElementsByTagName("button").length;     // số banner viết sẵn trong html
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

// Banner và chấm tròn đã viết sẵn trong html, JS chỉ lo phần chuyển động
function khoiTaoBanner() {
    layId("sTruoc").onclick = function () { chuyenBanner(viTriBanner - 1); batDauTuChuyen(); };
    layId("sSau").onclick = function () { chuyenBanner(viTriBanner + 1); batDauTuChuyen(); };
    layId("slider").onmouseenter = function () { clearInterval(henGioBanner); };     // rê chuột vào thì dừng
    layId("slider").onmouseleave = batDauTuChuyen;
    chuyenBanner(0);
    batDauTuChuyen();
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
    capNhatDauTrang();
    khoiTaoBanner();
    veMonBanChay();
    veKhuyenMai();
    layId("mDel").onclick = function () { chonHinhThuc("giao_tan_noi"); };
    layId("mPick").onclick = function () { chonHinhThuc("den_lay"); };
    toSangHinhThuc();
}
