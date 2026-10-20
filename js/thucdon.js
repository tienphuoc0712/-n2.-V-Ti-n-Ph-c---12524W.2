// ===== THỰC ĐƠN: lọc theo danh mục, tìm kiếm theo tên, lọc theo giá, sắp xếp =====

var danhMucDangXem = "";      // mã danh mục lấy từ địa chỉ (?cat=...), rỗng = tất cả
var tatCaMon = [];

// Vẽ các tab danh mục phía trên
function veTabDanhMuc() {
    var html = '<a href="thucdon.html" class="' + (danhMucDangXem == "" ? "on" : "") + '">Tất cả</a>';
    var dm = layDanhMuc();
    for (var i = 0; i < dm.length; i++) {
        var lop = "";
        if (dm[i].ma == danhMucDangXem) {
            lop = "on";
        }
        html = html + '<a href="thucdon.html?cat=' + dm[i].ma + '" class="' + lop + '">' + maHoaChu(dm[i].ten) + '</a>';
    }
    datHTML("tabs", html);
}

// Lọc + sắp xếp rồi vẽ lại danh sách món
function locMon() {
    var tuKhoa = layGiaTri("q").toLowerCase();
    var khoangGia = layId("price").value;       // ví dụ "50000-100000"
    var cachXep = layId("sort").value;
    var ketQua = [];

    for (var i = 0; i < tatCaMon.length; i++) {
        var mon = tatCaMon[i];
        if (danhMucDangXem != "" && mon.danhMuc != danhMucDangXem) {
            continue;
        }
        if (tuKhoa != "" && mon.ten.toLowerCase().indexOf(tuKhoa) == -1) {
            continue;
        }
        if (khoangGia != "") {
            var gioiHan = khoangGia.split("-");
            if (mon.gia < Number(gioiHan[0]) || mon.gia >= Number(gioiHan[1])) {
                continue;
            }
        }
        ketQua.push(mon);
    }

    if (cachXep == "asc") {
        ketQua.sort(function (a, b) { return a.gia - b.gia; });
    } else if (cachXep == "desc") {
        ketQua.sort(function (a, b) { return b.gia - a.gia; });
    } else if (cachXep == "hot") {
        ketQua.sort(function (a, b) { return (b.banChay ? 1 : 0) - (a.banChay ? 1 : 0); });
    }

    var tieuDe = "Tất cả món";
    if (danhMucDangXem != "") {
        tieuDe = timDanhMuc(danhMucDangXem).ten;
    }
    datChu("ttl", tieuDe);
    datChu("cnt", ketQua.length + " món");

    var html = "";
    for (var k = 0; k < ketQua.length; k++) {
        html = html + veTheMon(ketQua[k]);
    }
    datHTML("grid", html);
    layId("empty").style.display = ketQua.length == 0 ? "block" : "none";
}

function khoiTaoThucDon() {
    veDauTrangVaChanTrang("thucdon.html");
    danhMucDangXem = layThamSo("cat");
    tatCaMon = layMonAn(false);
    layId("q").value = layThamSo("q");
    veTabDanhMuc();
    layId("q").oninput = locMon;
    layId("price").onchange = locMon;
    layId("sort").onchange = locMon;
    locMon();
}
