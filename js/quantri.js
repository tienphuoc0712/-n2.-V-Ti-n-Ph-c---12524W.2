// ===== TRANG QUẢN TRỊ: tổng quan, đơn hàng, món ăn, khuyến mãi, người dùng =====

var nguoiQT = null;          // người đang đăng nhập
var laQuanTri = false;       // true = quản trị viên, false = nhân viên
var tabDangXem = "dash";
var locTrangThai = "";       // bộ lọc trạng thái ở tab Đơn hàng

var LOAI_KM = { phan_tram: "Giảm %", so_tien: "Giảm tiền", mien_phi_ship: "Miễn phí giao" };
var HINH_THUC_TT = { cod: "Tiền mặt", bank: "Chuyển khoản", wallet: "Ví điện tử" };
var VAI_TRO = { quantri: "Quản trị viên", nhanvien: "Nhân viên", khach: "Khách hàng" };

// Danh sách tab. Nhân viên KHÔNG được xem Tổng quan, Khuyến mãi, Người dùng (BR08)
function layDanhSachTab() {
    var tatCa = [["dash", "Tổng quan", true], ["orders", "Đơn hàng", false], ["products", "Món ăn", false], ["promos", "Khuyến mãi", true], ["users", "Người dùng", true], ["categories", "Danh mục", true], ["reviews", "Đánh giá", true], ["feedback", "Góp ý", false]];
    var kq = [];
    for (var i = 0; i < tatCa.length; i++) {
        if (tatCa[i][2] == false || laQuanTri) {
            kq.push(tatCa[i]);
        }
    }
    return kq;
}

function veMenuTrai() {
    var ds = layDanhSachTab();
    var html = '<div class="brand">Jollibee Admin</div>';
    for (var i = 0; i < ds.length; i++) {
        var lop = ds[i][0] == tabDangXem ? "on" : "";
        html = html + '<a data-t="' + ds[i][0] + '" class="' + lop + '" onclick="chonTab(\'' + ds[i][0] + '\')">' + ds[i][1] + '</a>';
        if (ds[i][0] == tabDangXem) {
            datChu("ptitle", ds[i][1]);
        }
    }
    datHTML("side", html);
}

function chonTab(tab) {
    var ds = layDanhSachTab();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i][0] == tab) {                 // chỉ cho vào những tab mà vai trò này được phép xem
            tabDangXem = tab;
            veTrang();
            return;
        }
    }
}

function veTrang() {
    veMenuTrai();
    if (tabDangXem == "dash") { veTongQuan(); }
    else if (tabDangXem == "orders") { veDonHangQT(); }
    else if (tabDangXem == "products") { veMonAnQT(); }
    else if (tabDangXem == "promos") { veKhuyenMaiQT(); }
    else if (tabDangXem == "users") { veNguoiDungQT(); }
    else if (tabDangXem == "categories") { veDanhMucQT(); }
    else if (tabDangXem == "reviews") { veDanhGiaQT(); }
    else if (tabDangXem == "feedback") { veGopYQT(); }
}

/* ===== TỔNG QUAN (doanh thu chỉ tính đơn đã giao) ===== */
function veTongQuan() {
    var donHang = layDonHang();
    var daGiao = [];
    var choXacNhan = 0;
    var doanhThu = 0;
    for (var i = 0; i < donHang.length; i++) {
        if (donHang[i].trangThai == "da_giao") {
            daGiao.push(donHang[i]);
            doanhThu = doanhThu + donHang[i].tong;
        }
        if (donHang[i].trangThai == "cho_xac_nhan") {
            choXacNhan = choXacNhan + 1;
        }
    }

    // Doanh thu 7 ngày gần nhất
    var ngay = [];
    var tienNgay = [];
    var max = 1;
    for (var k = 6; k >= 0; k--) {
        var d = new Date();
        d.setDate(d.getDate() - k);
        var chuoiNgay = ngayDiaPhuong(d);          // theo giờ máy (không dùng giờ UTC nên không lệch ngày)
        var tong = 0;
        for (var j = 0; j < daGiao.length; j++) {
            if (ngayDiaPhuong(new Date(daGiao[j].ngay)) == chuoiNgay) {
                tong = tong + daGiao[j].tong;
            }
        }
        ngay.push(chuoiNgay);
        tienNgay.push(tong);
        if (tong > max) {
            max = tong;
        }
    }
    var cot = "";
    for (var c = 0; c < ngay.length; c++) {
        cot = cot + '<div><div class="bar" title="' + dinhDangTien(tienNgay[c]) + '" style="height:' + Math.round(tienNgay[c] / max * 150) + 'px;min-height:2px"></div>' + ngay[c].slice(5) + '</div>';
    }

    // Món bán chạy: cộng số lượng theo tên món
    var ten = [];
    var sl = [];
    for (var a = 0; a < daGiao.length; a++) {
        for (var b = 0; b < daGiao[a].mon.length; b++) {
            var vt = ten.indexOf(daGiao[a].mon[b].ten);
            if (vt == -1) {
                ten.push(daGiao[a].mon[b].ten);
                sl.push(daGiao[a].mon[b].soLuong);
            } else {
                sl[vt] = sl[vt] + daGiao[a].mon[b].soLuong;
            }
        }
    }
    var top = [];
    for (var t = 0; t < ten.length; t++) {
        top.push([ten[t], sl[t]]);
    }
    top.sort(function (x, y) { return y[1] - x[1]; });
    var htmlTop = "";
    for (var h = 0; h < top.length && h < 5; h++) {
        htmlTop = htmlTop + '<div class="sum-line"><span>' + (h + 1) + '. ' + maHoaChu(top[h][0]) + '</span><b>' + top[h][1] + '</b></div>';
    }
    if (htmlTop == "") {
        htmlTop = '<span class="muted">Chưa có dữ liệu.</span>';
    }

    var soKhach = 0;
    var nd = layNguoiDung();
    for (var n = 0; n < nd.length; n++) {
        if (nd[n].vaiTro == "khach") {
            soKhach = soKhach + 1;
        }
    }
    var the = [["Doanh thu (đơn đã giao)", dinhDangTien(doanhThu)], ["Đơn mới chờ xác nhận", choXacNhan], ["Món đang bán", layMonAn(false).length], ["Khách hàng", soKhach]];
    var htmlThe = "";
    for (var s = 0; s < the.length; s++) {
        htmlThe = htmlThe + '<div class="stat"><small>' + the[s][0] + '</small><b>' + the[s][1] + '</b></div>';
    }
    datHTML("view", '<div class="luoi-stat">' + htmlThe + '</div>' +
        '<div class="chia" style="--tl:7fr 5fr"><div class="box"><h6 style="font-weight:bold">Doanh thu 7 ngày gần nhất</h6><div class="bieu-do">' + cot + '</div></div>' +
        '<div class="box"><h6 style="font-weight:bold">Món bán chạy</h6>' + htmlTop + '</div></div>');
}

/* ===== ĐƠN HÀNG (chuyển trạng thái đúng theo BUOC_TIEP) ===== */
var tuKhoaDon = "";          // ô tìm theo mã đơn / số điện thoại / tên

// Việc tiếp theo nhân viên nên làm với đơn: { chu, hanhDong } hoặc null nếu đơn đã kết thúc
function viecTiepTheo(o) {
    if (o.thanhToan == "bank" && daThanhToan(o) == false && (o.trangThai == "da_xac_nhan" || o.trangThai == "dang_chuan_bi")) {
        return { chu: "Xác nhận đã thu tiền", lenh: "xacNhanThuNhanh('" + o.ma + "')", loai: "thu" };
    }
    var buoc = layBuocTiep(o);
    if (buoc.length == 0) {
        return null;
    }
    var moi = buoc[0];
    var chu = moi == "da_xac_nhan" ? "Xác nhận đơn" : moi == "dang_chuan_bi" ? "Bắt đầu chuẩn bị" : moi == "dang_giao" ? "Giao hàng" : "Hoàn tất";
    if (moi == "dang_chuan_bi" && o.thanhToan == "bank" && daThanhToan(o) == false) {
        return { chu: "Chờ khách chuyển khoản", lenh: "", loai: "cho" };
    }
    return { chu: chu, lenh: "doiTrangThaiNhanh('" + o.ma + "', '" + moi + "')", loai: "tiep" };
}

function doiTrangThaiNhanh(ma, moi) {
    if (doiTrangThaiDon(ma, moi)) {
        veDonHangQT();
        thongBao("Đơn " + ma + ": " + TRANG_THAI[moi]);
    }
}

function xacNhanThuNhanh(ma) {
    if (xacNhanDaThu(ma)) {
        veDonHangQT();
        thongBao("Đã xác nhận nhận tiền đơn " + ma);
    }
}

function chonLocQT(loc) {
    locTrangThai = loc;
    veDonHangQT();
}

// Thân bảng: lọc theo trạng thái + từ khóa, đơn cần xử lý nổi bật
function veBangDonQT() {
    var ds = layDonHang();
    var tk = tuKhoaDon.toLowerCase();
    var hang = "";
    for (var i = 0; i < ds.length; i++) {
        var o = ds[i];
        if (locTrangThai != "" && o.trangThai != locTrangThai) {
            continue;
        }
        if (tk != "" && (o.ma + " " + o.sdt + " " + o.ten).toLowerCase().indexOf(tk) == -1) {
            continue;
        }
        var v = viecTiepTheo(o);
        var nut = "";
        if (v != null && v.loai == "cho") {
            nut = '<span class="muted nho">' + v.chu + '</span>';
        } else if (v != null) {
            nut = '<button class="btn-jb viec-' + v.loai + '" onclick="' + v.lenh + '">' + v.chu + '</button>';
        }
        hang = hang + '<tr class="' + (o.trangThai == "cho_xac_nhan" ? "hang-moi" : "") + '"><td><b>' + o.ma + '</b><div class="nho muted">' + thoiGianTruoc(o.ngay) + '</div></td>' +
            '<td>' + maHoaChu(o.ten) + '<div class="nho muted">' + maHoaChu(o.sdt) + '</div></td>' +
            '<td>' + (o.hinhThuc == "den_lay" ? "🏪 Đến lấy" : "🛵 Giao") + '</td><td><b>' + dinhDangTien(o.tong) + '</b><div>' + nhanThanhToan(o) + '</div></td>' +
            '<td>' + nhanTrangThai(o) + '</td>' +
            '<td class="nowrap">' + nut + ' <button class="btn-line vw" onclick="moChiTietDon(\'' + o.ma + '\')">Chi tiết</button></td></tr>';
    }
    if (hang == "") {
        hang = '<tr><td colspan="6" class="text-center muted" style="padding:1.5rem">Không có đơn hàng phù hợp.</td></tr>';
    }
    datHTML("bangDon", hang);
}

function veDonHangQT() {
    var ds = layDonHang();
    var dem = {};
    for (var i = 0; i < ds.length; i++) {
        dem[ds[i].trangThai] = (dem[ds[i].trangThai] || 0) + 1;
    }
    var chip = '<button class="chip-tt' + (locTrangThai == "" ? " on" : "") + '" onclick="chonLocQT(\'\')">Tất cả<b>' + ds.length + '</b></button>';
    for (var k in TRANG_THAI) {
        chip = chip + '<button class="chip-tt c-' + k + (locTrangThai == k ? " on" : "") + (k == "cho_xac_nhan" && dem[k] ? " can-xu-ly" : "") + '" onclick="chonLocQT(\'' + k + '\')">' + ICON_TT[k] + ' ' + TRANG_THAI[k] + '<b>' + (dem[k] || 0) + '</b></button>';
    }
    datHTML("view", (dem.cho_xac_nhan ? '<div class="bao-viec">🔔 Có <b>' + dem.cho_xac_nhan + '</b> đơn mới đang chờ bạn xác nhận.</div>' : '') +
        '<div class="loc-chip">' + chip + '</div>' +
        '<div class="loc-don"><input id="tkDon" class="o-nhap" placeholder="Tìm mã đơn, tên hoặc số điện thoại" value="' + maHoaChu(tuKhoaDon) + '"></div>' +
        '<div class="tbl"><table class="bang bang-don"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Nhận hàng</th><th>Tổng tiền / thanh toán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody id="bangDon"></tbody></table></div>');
    layId("tkDon").oninput = function () { tuKhoaDon = this.value; veBangDonQT(); };
    veBangDonQT();
}

function moChiTietDon(ma) {
    var o = timDon(ma);
    if (o == null) {
        return;
    }
    var dong = "";
    for (var i = 0; i < o.mon.length; i++) {
        dong = dong + '<div class="sum-line"><span>' + o.mon[i].soLuong + ' × ' + maHoaChu(o.mon[i].ten) + '</span><span>' + dinhDangTien(o.mon[i].gia * o.mon[i].soLuong) + '</span></div>';
    }
    var nut = "";
    var buoc = layBuocTiep(o);
    for (var k = 0; k < buoc.length; k++) {
        var chu = buoc[k] == "da_huy" ? "Hủy đơn" : "→ " + TRANG_THAI[buoc[k]];
        if (buoc[k] == "da_giao" && o.hinhThuc == "den_lay") {
            chu = "→ Khách đã nhận hàng";
        }
        var khoa = (buoc[k] == "dang_chuan_bi" && o.thanhToan == "bank" && daThanhToan(o) == false);
        nut = nut + '<button class="btn-jb st" data-s="' + buoc[k] + '"' + (khoa ? ' disabled title="Cần xác nhận đã nhận tiền chuyển khoản trước"' : '') + ' onclick="doiTrangThaiQT(\'' + o.ma + '\', \'' + buoc[k] + '\')">' + chu + '</button>';
    }
    var dongTien = "";
    if (o.thanhToan == "bank" && o.trangThai != "da_huy" && o.trangThai != "giao_that_bai" && daThanhToan(o) == false) {
        dongTien = '<button class="btn-line" id="thu" onclick="xacNhanThuTien(\'' + o.ma + '\')">Xác nhận đã nhận tiền chuyển khoản</button>';
    }
    if (nut == "") {
        nut = '<span class="muted">Đơn đã kết thúc.</span>';
    }
    datChu("omT", "Đơn hàng #" + o.ma);
    datHTML("omB",
        veTienTrinh(o) + '<p class="tt-mota">' + moTaTrangThai(o) + ' <span class="muted nho">(đặt ' + thoiGianTruoc(o.ngay) + ')</span></p>' +
        '<p><span class="status st-' + o.trangThai + '">' + ICON_TT[o.trangThai] + ' ' + TRANG_THAI[o.trangThai] + '</span> · ' + (o.hinhThuc == "den_lay" ? "Đến lấy" : "Giao tận nơi" + (o.khuVuc ? " (" + maHoaChu(o.khuVuc) + ")" : "")) + ' · ' + (HINH_THUC_TT[o.thanhToan] || o.thanhToan) + ' · <b>' + (daThanhToan(o) ? "Đã thanh toán" : "Chưa thanh toán") + '</b></p>' +
        '<p>Người nhận: <b>' + maHoaChu(o.ten) + '</b> – ' + maHoaChu(o.sdt) + '<br>Địa chỉ: ' + maHoaChu(o.diaChi) + (o.ghiChu ? "<br>Ghi chú: " + maHoaChu(o.ghiChu) : "") + '</p>' + dong +
        '<div class="sum-line"><span>Phí giao hàng</span><span>' + dinhDangTien(o.phiGiao) + '</span></div>' +
        '<div class="sum-line"><span>Giảm giá' + (o.maKM ? " (" + maHoaChu(o.maKM) + ")" : "") + '</span><span>-' + dinhDangTien(o.giamGia) + '</span></div>' +
        '<div class="sum-line sum-total"><span>Tổng cộng</span><span>' + dinhDangTien(o.tong) + '</span></div>' +
        '<div class="hang-nut">' + dongTien + nut + '</div>');
    moHopThoai("om");
}

function doiTrangThaiQT(ma, moi) {
    if (doiTrangThaiDon(ma, moi)) {
        moChiTietDon(ma);
        veDonHangQT();
        thongBao("Đã cập nhật trạng thái");
    } else {
        thongBao("Không thể chuyển trạng thái (đơn chuyển khoản cần xác nhận đã nhận tiền trước).");
    }
}

function xacNhanThuTien(ma) {
    if (xacNhanDaThu(ma)) {
        moChiTietDon(ma);
        veDonHangQT();
        thongBao("Đã xác nhận nhận tiền");
    }
}

/* ===== MÓN ĂN (nhân viên chỉ bật/tắt; BR09: món đã có trong đơn thì không xóa hẳn) ===== */
function veMonAnQT() {
    var ds = layMonAn(true);
    var hang = "";
    for (var i = 0; i < ds.length; i++) {
        var p = ds[i];
        var nutAdmin = "";
        if (laQuanTri) {
            nutAdmin = '<button class="btn-line ed" onclick="moFormMon(' + p.id + ')">Sửa</button> <button class="btn-line dl" onclick="xoaMonQT(' + p.id + ')">Xóa</button>';
        }
        hang = hang + '<tr><td><img class="thumb" src="' + maHoaChu(anhMon(p)) + '" alt="" onerror="anhLoi(this)"></td>' +
            '<td><b>' + maHoaChu(p.ten) + '</b>' + (p.banChay ? ' <span class="nhan-do">Bán chạy</span>' : "") + '</td>' +
            '<td>' + maHoaChu(timDanhMuc(p.danhMuc) ? timDanhMuc(p.danhMuc).ten : '—') + '</td><td>' + dinhDangTien(p.gia) + '</td>' +
            '<td><span class="status ' + (p.dangBan ? "st-da_giao" : "st-da_huy") + '">' + (p.dangBan ? "Đang bán" : "Ngừng bán") + '</span></td>' +
            '<td class="nowrap"><button class="btn-line tg" onclick="batTatMon(' + p.id + ')">' + (p.dangBan ? "Tắt" : "Bật") + '</button> ' + nutAdmin + '</td></tr>';
    }
    var dauTrang = laQuanTri ? '<button class="btn-jb" id="padd" onclick="moFormMon(0)">+ Thêm món</button>' : '<span class="muted nho">Nhân viên chỉ được bật/tắt trạng thái bán.</span>';
    datHTML("view", '<div class="mb3">' + dauTrang + '</div>' +
        '<div class="tbl"><table class="bang"><thead><tr><th></th><th>Tên món</th><th>Danh mục</th><th>Giá</th><th>Trạng thái</th><th></th></tr></thead><tbody>' + hang + '</tbody></table></div>');
}

function batTatMon(id) {
    var ds = layMonAn(true);
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].id == id) {
            ds[i].dangBan = !ds[i].dangBan;
        }
    }
    luuMonAn(ds);
    veMonAnQT();
}

// Mở hộp thoại thêm (id = 0) hoặc sửa món
function moFormMon(id) {
    if (laQuanTri == false) {                  // chỉ quản trị viên được thêm/sửa món
        return;
    }
    var p = id == 0 ? null : timMon(id);
    var opt = "";
    var dm = layDanhMuc();
    for (var i = 0; i < dm.length; i++) {
        opt = opt + '<option value="' + dm[i].ma + '">' + maHoaChu(dm[i].ten) + '</option>';
    }
    datHTML("pc", opt);
    datChu("pmT", p ? "Sửa món ăn" : "Thêm món ăn");
    datChu("pe", "");
    layId("pid").value = p ? p.id : "";
    layId("pn").value = p ? p.ten : "";
    layId("pc").value = p ? p.danhMuc : dm[0].ma;
    layId("pp").value = p ? p.gia : "";
    layId("pd").value = p ? p.moTa : "";
    layId("pi").value = p ? (p.anh || "") : "";
    layId("ph").checked = p ? !!p.banChay : false;
    layId("pa").checked = p ? !!p.dangBan : true;
    moHopThoai("pm");
}

function luuMon() {
    if (laQuanTri == false) {
        return;
    }
    var ten = layGiaTri("pn");
    var gia = parseInt(layId("pp").value, 10);
    if (ten == "") {
        datChu("pe", "Vui lòng nhập tên món.");
        return;
    }
    if (!(gia > 0)) {
        datChu("pe", "Giá phải là số lớn hơn 0.");
        return;
    }
    var ds = layMonAn(true);
    var id = Number(layId("pid").value);
    if (id) {
        for (var i = 0; i < ds.length; i++) {
            if (ds[i].id == id) {
                ds[i].ten = ten;
                ds[i].danhMuc = layId("pc").value;
                ds[i].gia = gia;
                ds[i].moTa = layGiaTri("pd");
                ds[i].anh = layGiaTri("pi");
                ds[i].banChay = layId("ph").checked;
                ds[i].dangBan = layId("pa").checked;
            }
        }
    } else {
        var idMoi = 0;
        for (var j = 0; j < ds.length; j++) {
            if (ds[j].id > idMoi) {
                idMoi = ds[j].id;
            }
        }
        ds.push({ id: idMoi + 1, danhMuc: layId("pc").value, ten: ten, moTa: layGiaTri("pd"), gia: gia, anh: layGiaTri("pi"), banChay: layId("ph").checked, dangBan: layId("pa").checked });
    }
    luuMonAn(ds);
    dongHopThoai("pm");
    veMonAnQT();
    thongBao("Đã lưu món ăn");
}

function xoaMonQT(id) {
    if (laQuanTri == false) {
        return;
    }
    var daCoTrongDon = false;
    var dsDon = layDonHang();
    for (var i = 0; i < dsDon.length; i++) {
        for (var j = 0; j < dsDon[i].mon.length; j++) {
            if (dsDon[i].mon[j].id == id) {
                daCoTrongDon = true;
            }
        }
    }
    if (daCoTrongDon) {
        if (confirm('Món này đã có trong đơn hàng cũ nên không thể xóa hẳn. Chuyển sang "Ngừng bán"?')) {
            var ds = layMonAn(true);
            for (var k = 0; k < ds.length; k++) {
                if (ds[k].id == id) {
                    ds[k].dangBan = false;
                }
            }
            luuMonAn(ds);
            veMonAnQT();
        }
    } else if (confirm("Xóa món này?")) {
        var con = [];
        var tatCa = layMonAn(true);
        for (var m = 0; m < tatCa.length; m++) {
            if (tatCa[m].id != id) {
                con.push(tatCa[m]);
            }
        }
        luuMonAn(con);
        veMonAnQT();
    }
}

/* ===== KHUYẾN MÃI ===== */
var kmDangSua = 0;           // id mã đang sửa (0 = đang thêm mã mới)

function veKhuyenMaiQT() {
    var ds = layKhuyenMai(true);
    var hang = "";
    for (var i = 0; i < ds.length; i++) {
        var p = ds[i];
        var giaTri = "–";
        if (p.loai == "phan_tram") { giaTri = p.giaTri + "%"; }
        else if (p.loai == "so_tien") { giaTri = dinhDangTien(p.giaTri); }
        var hanDung = (p.tuNgay || p.denNgay) ? (p.tuNgay || "…") + " → " + (p.denNgay || "…") : "Không giới hạn";
        var luot = soLuotDaDung(p.ma) + (p.luotToiDa > 0 ? " / " + p.luotToiDa : " / không giới hạn");
        hang = hang + '<tr><td><span class="code">' + maHoaChu(p.ma) + '</span></td><td>' + maHoaChu(p.tieuDe) + (p.donDau ? ' <span class="nhan-do">Đơn đầu</span>' : '') + '</td><td>' + LOAI_KM[p.loai] + '</td><td>' + giaTri + '</td><td>' + dinhDangTien(p.toiThieu) + '</td><td>' + hanDung + '</td><td>' + luot + '</td>' +
            '<td class="nowrap"><button class="btn-line pt" onclick="batTatKM(' + p.id + ')">' + (p.dangBan ? "Tắt" : "Bật") + '</button> <button class="btn-line ed" onclick="suaKM(' + p.id + ')">Sửa</button> <button class="btn-line pd2" onclick="xoaKM(' + p.id + ')">Xóa</button></td></tr>';
    }
    datHTML("view", '<div class="box mb3"><h6 style="font-weight:bold" id="n-tt">Thêm mã giảm giá</h6><div class="form-km"><input id="n-t" class="o-nhap" placeholder="Tên chương trình"><input id="n-c" class="o-nhap" placeholder="MÃ">' +
        '<select id="n-y" class="o-nhap"><option value="phan_tram">Giảm %</option><option value="so_tien">Giảm tiền</option><option value="mien_phi_ship">Miễn phí giao</option></select>' +
        '<input id="n-v" class="o-nhap" placeholder="Giá trị"><input id="n-m" class="o-nhap" placeholder="Đơn tối thiểu"><input id="n-d1" class="o-nhap" type="date" title="Từ ngày"><input id="n-d2" class="o-nhap" type="date" title="Đến ngày"><input id="n-l" class="o-nhap" placeholder="Lượt tối đa (trống = không giới hạn)" title="Số lần mã được dùng tối đa trên toàn hệ thống"><button class="btn-jb" id="n-a" onclick="themKM()">+</button></div><div class="invalid-msg" id="n-e"></div></div>' +
        '<div class="tbl"><table class="bang"><thead><tr><th>Mã</th><th>Chương trình</th><th>Loại</th><th>Giá trị</th><th>Tối thiểu</th><th>Hạn dùng</th><th>Lượt dùng</th><th></th></tr></thead><tbody>' + hang + '</tbody></table></div>');
    kmDangSua = 0;
}

// Đưa mã cần sửa lên biểu mẫu; bấm lưu sẽ cập nhật mã đó (mã code không đổi được)
function suaKM(id) {
    if (laQuanTri == false) {
        return;
    }
    var ds = layKhuyenMai(true);
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].id == id) {
            kmDangSua = id;
            datChu("n-tt", "Sửa mã giảm giá " + ds[i].ma);
            layId("n-t").value = ds[i].tieuDe;
            layId("n-c").value = ds[i].ma;
            layId("n-c").disabled = true;
            layId("n-y").value = ds[i].loai;
            layId("n-v").value = ds[i].giaTri;
            layId("n-m").value = ds[i].toiThieu;
            layId("n-d1").value = ds[i].tuNgay || "";
            layId("n-d2").value = ds[i].denNgay || "";
            layId("n-l").value = ds[i].luotToiDa > 0 ? ds[i].luotToiDa : "";
            layId("n-a").textContent = "Lưu";
            window.scrollTo(0, 0);
        }
    }
}

// Thêm mã mới, hoặc lưu thay đổi nếu đang ở chế độ sửa
function themKM() {
    if (laQuanTri == false) {
        return;
    }
    var tieuDe = layGiaTri("n-t");
    var ma = layGiaTri("n-c").toUpperCase();
    var loai = layId("n-y").value;
    var giaTri = parseInt(layId("n-v").value, 10) || 0;
    var toiThieu = parseInt(layId("n-m").value, 10) || 0;
    var luotToiDa = parseInt(layId("n-l").value, 10) || 0;
    var ds = layKhuyenMai(true);
    if (tieuDe == "" || ma == "") {
        datChu("n-e", "Nhập tên chương trình và mã.");
        return;
    }
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].ma == ma && ds[i].id != kmDangSua) {
            datChu("n-e", "Mã đã tồn tại.");
            return;
        }
    }
    if (loai != "mien_phi_ship" && giaTri <= 0) {
        datChu("n-e", "Nhập giá trị giảm.");
        return;
    }
    if (loai == "phan_tram" && giaTri > 100) {
        datChu("n-e", "Phần trăm giảm tối đa 100.");
        return;
    }
    var tuNgay = layId("n-d1").value;
    var denNgay = layId("n-d2").value;
    if (tuNgay != "" && denNgay != "" && denNgay < tuNgay) {
        datChu("n-e", "Ngày kết thúc phải sau ngày bắt đầu.");
        return;
    }
    if (kmDangSua != 0) {
        for (var k = 0; k < ds.length; k++) {
            if (ds[k].id == kmDangSua) {
                ds[k].tieuDe = tieuDe;
                ds[k].moTa = tieuDe;
                ds[k].loai = loai;
                ds[k].giaTri = giaTri;
                ds[k].toiThieu = toiThieu;
                ds[k].tuNgay = tuNgay;
                ds[k].denNgay = denNgay;
                ds[k].luotToiDa = luotToiDa;
            }
        }
    } else {
        ds.push({ id: Date.now(), tieuDe: tieuDe, ma: ma, loai: loai, giaTri: giaTri, toiThieu: toiThieu, moTa: tieuDe, tuNgay: tuNgay, denNgay: denNgay, luotToiDa: luotToiDa, dangBan: true });
    }
    luuKhuyenMai(ds);
    veKhuyenMaiQT();
}

function batTatKM(id) {
    if (laQuanTri == false) {
        return;
    }
    var ds = layKhuyenMai(true);
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].id == id) {
            ds[i].dangBan = !ds[i].dangBan;
        }
    }
    luuKhuyenMai(ds);
    veKhuyenMaiQT();
}

function xoaKM(id) {
    if (laQuanTri && confirm("Xóa mã này?")) {
        var con = [];
        var ds = layKhuyenMai(true);
        for (var i = 0; i < ds.length; i++) {
            if (ds[i].id != id) {
                con.push(ds[i]);
            }
        }
        luuKhuyenMai(con);
        veKhuyenMaiQT();
    }
}

/* ===== NGƯỜI DÙNG: thêm tài khoản nội bộ, phân quyền, khóa / mở khóa, đặt lại mật khẩu ===== */
function veNguoiDungQT() {
    var ds = layNguoiDung();
    var hang = "";
    for (var i = 0; i < ds.length; i++) {
        var u = ds[i];
        var nut = "";
        var vaiTro = VAI_TRO[u.vaiTro];
        if (u.id != nguoiQT.id) {                                 // không tự khóa / đổi quyền của chính mình
            var opt = "";
            for (var v in VAI_TRO) {
                opt = opt + '<option value="' + v + '"' + (v == u.vaiTro ? " selected" : "") + '>' + VAI_TRO[v] + '</option>';
            }
            vaiTro = '<select class="o-nhap vt" onchange="doiVaiTroQT(' + u.id + ', this.value)">' + opt + '</select>';
            nut = '<button class="btn-line dm" onclick="datLaiMatKhauQT(' + u.id + ')">Đặt lại MK</button> ';
            if (u.vaiTro != "quantri") {                          // không khóa quản trị viên khác
                nut = nut + '<button class="btn-line lk" onclick="khoaNguoiDung(' + u.id + ')">' + (u.biKhoa ? "Mở khóa" : "Khóa") + '</button>';
            }
        }
        hang = hang + '<tr><td>' + maHoaChu(u.hoTen) + '</td><td>' + maHoaChu(u.email) + '</td><td>' + maHoaChu(u.sdt) + '</td><td>' + vaiTro + '</td>' +
            '<td><span class="status ' + (u.biKhoa ? "st-giao_that_bai" : "st-da_giao") + '">' + (u.biKhoa ? "Đã khóa" : "Hoạt động") + '</span></td><td class="nowrap">' + nut + '</td></tr>';
    }
    datHTML("view", '<div class="box mb3"><h6 style="font-weight:bold">Thêm tài khoản nhân viên / quản trị viên</h6><div class="form-tk">' +
        '<input id="u-n" class="o-nhap" placeholder="Họ và tên"><input id="u-e" class="o-nhap" placeholder="Email"><input id="u-t" class="o-nhap" placeholder="Số điện thoại"><input id="u-p" class="o-nhap" type="password" placeholder="Mật khẩu (từ 6 ký tự)">' +
        '<select id="u-v" class="o-nhap"><option value="nhanvien">Nhân viên</option><option value="quantri">Quản trị viên</option></select><button class="btn-jb" onclick="themTaiKhoanQT()">+</button></div><div class="invalid-msg" id="u-err"></div></div>' +
        '<div class="tbl"><table class="bang"><thead><tr><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Vai trò</th><th>Trạng thái</th><th></th></tr></thead><tbody>' + hang + '</tbody></table></div>');
}

function themTaiKhoanQT() {
    var kq = taoTaiKhoanNoiBo(layGiaTri("u-n"), layGiaTri("u-e"), layGiaTri("u-t"), layId("u-p").value, layId("u-v").value);
    if (kq.ok) {
        veNguoiDungQT();
        thongBao("Đã tạo tài khoản");
    } else {
        datChu("u-err", kq.thongBao);
    }
}

function doiVaiTroQT(id, vaiTro) {
    if (doiVaiTro(id, vaiTro)) {
        thongBao("Đã đổi vai trò");
    }
    veNguoiDungQT();
}

function datLaiMatKhauQT(id) {
    var mk = prompt("Nhập mật khẩu mới cho tài khoản này (từ 6 ký tự):");
    if (mk == null) {
        return;
    }
    thongBao(datLaiMatKhauNguoiDung(id, mk) ? "Đã đặt lại mật khẩu" : "Mật khẩu phải từ 6 ký tự");
}

function khoaNguoiDung(id) {
    if (laQuanTri == false) {
        return;
    }
    var ds = layNguoiDung();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].id == id && ds[i].vaiTro != "quantri" && ds[i].id != nguoiQT.id) {
            ds[i].biKhoa = !ds[i].biKhoa;
        }
    }
    luuNguoiDung(ds);
    veNguoiDungQT();
}

/* ===== DANH MỤC (quản trị viên thêm / sửa / xóa) ===== */
var dmDangSua = "";          // mã danh mục đang sửa ("" = đang thêm)

function veDanhMucQT() {
    var ds = layDanhMuc();
    var mon = layMonAn(true);
    var hang = "";
    for (var i = 0; i < ds.length; i++) {
        var dem = 0;
        for (var j = 0; j < mon.length; j++) {
            if (mon[j].danhMuc == ds[i].ma) {
                dem = dem + 1;
            }
        }
        hang = hang + '<tr><td><span class="code">' + maHoaChu(ds[i].ma) + '</span></td><td><b>' + maHoaChu(ds[i].ten) + '</b></td><td>' + dem + ' món</td>' +
            '<td class="nowrap"><button class="btn-line ed" onclick="suaDanhMuc(\'' + ds[i].ma + '\')">Sửa</button> <button class="btn-line dl" onclick="xoaDanhMuc(\'' + ds[i].ma + '\')">Xóa</button></td></tr>';
    }
    datHTML("view", '<div class="box mb3"><h6 style="font-weight:bold" id="dm-tt">Thêm danh mục</h6><div class="form-dm">' +
        '<input id="dm-t" class="o-nhap" placeholder="Tên danh mục"><input id="dm-a" class="o-nhap" placeholder="Đường dẫn hình ảnh (tùy chọn)"><button class="btn-jb" id="dm-b" onclick="luuDanhMucQT()">+</button></div><div class="invalid-msg" id="dm-e"></div></div>' +
        '<div class="tbl"><table class="bang"><thead><tr><th>Mã</th><th>Tên danh mục</th><th>Số món</th><th></th></tr></thead><tbody>' + hang + '</tbody></table></div>');
    dmDangSua = "";
}

// Mã danh mục sinh từ tên: bỏ dấu, chữ thường, nối bằng dấu gạch ngang
function taoMaDanhMuc(ten) {
    var ma = ten.toLowerCase().replace(/đ/g, "d").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return ma == "" ? "dm-" + Date.now() : ma;
}

function suaDanhMuc(ma) {
    var dm = laQuanTri ? timDanhMuc(ma) : null;
    if (dm != null) {
        dmDangSua = ma;
        datChu("dm-tt", "Sửa danh mục " + dm.ten);
        layId("dm-t").value = dm.ten;
        layId("dm-a").value = dm.anh || "";
        layId("dm-b").textContent = "Lưu";
    }
}

function luuDanhMucQT() {
    if (laQuanTri == false) {
        return;
    }
    var ten = layGiaTri("dm-t");
    if (ten == "") {
        datChu("dm-e", "Nhập tên danh mục.");
        return;
    }
    var ds = layDanhMuc();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].ten.toLowerCase() == ten.toLowerCase() && ds[i].ma != dmDangSua) {
            datChu("dm-e", "Tên danh mục đã tồn tại.");
            return;
        }
    }
    if (dmDangSua != "") {
        for (var k = 0; k < ds.length; k++) {
            if (ds[k].ma == dmDangSua) {
                ds[k].ten = ten;
                ds[k].anh = layGiaTri("dm-a");
            }
        }
    } else {
        var ma = taoMaDanhMuc(ten);
        while (timDanhMuc(ma) != null) {
            ma = ma + "-2";
        }
        ds.push({ ma: ma, ten: ten, anh: layGiaTri("dm-a") });
    }
    luuDanhMuc(ds);
    veDanhMucQT();
}

// Chỉ xóa được danh mục không còn món nào
function xoaDanhMuc(ma) {
    if (laQuanTri == false) {
        return;
    }
    var mon = layMonAn(true);
    for (var i = 0; i < mon.length; i++) {
        if (mon[i].danhMuc == ma) {
            thongBao("Không thể xóa: danh mục còn món ăn. Hãy chuyển hoặc xóa các món trước.");
            return;
        }
    }
    if (confirm("Xóa danh mục này?")) {
        var con = [];
        var ds = layDanhMuc();
        for (var k = 0; k < ds.length; k++) {
            if (ds[k].ma != ma) {
                con.push(ds[k]);
            }
        }
        luuDanhMuc(con);
        veDanhMucQT();
    }
}

/* ===== ĐÁNH GIÁ (kiểm duyệt: ẩn / hiện / xóa đánh giá vi phạm) ===== */
function veDanhGiaQT() {
    var ds = docDuLieu("jb_danhGia", []);
    var hang = "";
    for (var i = 0; i < ds.length; i++) {
        var mon = timMon(ds[i].idMon);
        hang = hang + '<tr><td class="nowrap">' + new Date(ds[i].ngay).toLocaleDateString("vi-VN") + '</td><td>' + maHoaChu(mon ? mon.ten : "Món #" + ds[i].idMon) + '</td><td>' + maHoaChu(ds[i].ten) + '</td><td class="stars">' + veSao(ds[i].soSao) + '</td><td>' + maHoaChu(ds[i].noiDung) + '</td>' +
            '<td><span class="status ' + (ds[i].an ? "st-da_huy" : "st-da_giao") + '">' + (ds[i].an ? "Đã ẩn" : "Hiển thị") + '</span></td>' +
            '<td class="nowrap"><button class="btn-line" onclick="anHienDanhGiaQT(' + ds[i].idMon + ', \'' + maHoaChu(ds[i].email) + '\')">' + (ds[i].an ? "Hiện" : "Ẩn") + '</button> <button class="btn-line dl" onclick="xoaDanhGiaQT(' + ds[i].idMon + ', \'' + maHoaChu(ds[i].email) + '\')">Xóa</button></td></tr>';
    }
    if (hang == "") {
        hang = '<tr><td colspan="7" class="text-center muted" style="padding:1.5rem">Chưa có đánh giá nào.</td></tr>';
    }
    datHTML("view", '<div class="tbl"><table class="bang"><thead><tr><th>Ngày</th><th>Món</th><th>Khách</th><th>Số sao</th><th>Nội dung</th><th>Trạng thái</th><th></th></tr></thead><tbody>' + hang + '</tbody></table></div>');
}

function anHienDanhGiaQT(idMon, email) {
    anHienDanhGia(idMon, email);
    veDanhGiaQT();
}

function xoaDanhGiaQT(idMon, email) {
    if (confirm("Xóa đánh giá này?")) {
        xoaDanhGia(idMon, email);
        veDanhGiaQT();
    }
}

/* ===== GÓP Ý CỦA KHÁCH (gửi từ khung "Trò chuyện cùng Jolly", lưu ở khóa jb_lienHe) ===== */
function veGopYQT() {
    var ds = docDuLieu("jb_lienHe", []);
    var hang = "";
    for (var i = 0; i < ds.length; i++) {
        hang = hang + '<tr><td class="nowrap">' + new Date(ds[i].ngay).toLocaleString("vi-VN") + '</td><td>' + maHoaChu(ds[i].ten) + '</td><td>' + maHoaChu(ds[i].email) + '</td><td>' + maHoaChu(ds[i].noiDung) + '</td></tr>';
    }
    if (hang == "") {
        hang = '<tr><td colspan="4" class="text-center muted" style="padding:1.5rem">Chưa có góp ý nào.</td></tr>';
    }
    datHTML("view", '<div class="tbl"><table class="bang"><thead><tr><th>Thời gian</th><th>Họ tên</th><th>Email</th><th>Nội dung góp ý</th></tr></thead><tbody>' + hang + '</tbody></table></div>');
}

function khoiTaoQuanTri() {
    nguoiQT = layNguoiDangNhap();
    if (nguoiQT == null || nguoiQT.vaiTro == "khach") {
        location.href = "dangnhap.html?next=quantri.html";
        return;
    }
    laQuanTri = nguoiQT.vaiTro == "quantri";
    tabDangXem = laQuanTri ? "dash" : "orders";
    datChu("who", nguoiQT.email + " (" + (laQuanTri ? "Quản trị viên" : "Nhân viên") + ")");
    layId("out").onclick = function (e) {
        e.preventDefault();
        dangXuat();
        location.href = "trangchu.html";
    };
    layId("psave").onclick = luuMon;
    var nutDong = document.querySelectorAll("[data-dong]");
    for (var i = 0; i < nutDong.length; i++) {
        nutDong[i].onclick = function () {
            this.closest(".hop-nen").classList.remove("show");
        };
    }
    veTrang();
}
