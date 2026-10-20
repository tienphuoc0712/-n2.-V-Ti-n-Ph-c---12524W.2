// ===== TRANG QUẢN TRỊ: tổng quan, đơn hàng, món ăn, khuyến mãi, người dùng =====

var nguoiQT = null;          // người đang đăng nhập
var laQuanTri = false;       // true = quản trị viên, false = nhân viên
var tabDangXem = "dash";
var locTrangThai = "";       // bộ lọc trạng thái ở tab Đơn hàng

var LOAI_KM = { phan_tram: "Giảm %", so_tien: "Giảm tiền", mien_phi_ship: "Miễn phí giao" };
var HINH_THUC_TT = { cod: "Tiền mặt", bank: "Chuyển khoản", wallet: "Ví điện tử" };
var VAI_TRO = { quantri: "Quản trị viên", nhanvien: "Nhân viên", khach: "Khách hàng" };

// Danh sách tab. Nhân viên KHÔNG được xem Tổng quan, Khuyến mãi, Người dùng (BR09)
function layDanhSachTab() {
    var tatCa = [["dash", "Tổng quan", true], ["orders", "Đơn hàng", false], ["products", "Món ăn", false], ["promos", "Khuyến mãi", true], ["users", "Người dùng", true]];
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
    tabDangXem = tab;
    veTrang();
}

function veTrang() {
    veMenuTrai();
    if (tabDangXem == "dash") { veTongQuan(); }
    else if (tabDangXem == "orders") { veDonHangQT(); }
    else if (tabDangXem == "products") { veMonAnQT(); }
    else if (tabDangXem == "promos") { veKhuyenMaiQT(); }
    else if (tabDangXem == "users") { veNguoiDungQT(); }
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
        var chuoiNgay = d.toISOString().slice(0, 10);
        var tong = 0;
        for (var j = 0; j < daGiao.length; j++) {
            if (daGiao[j].ngay.slice(0, 10) == chuoiNgay) {
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
function veDonHangQT() {
    var ds = layDonHang();
    var opt = '<option value="">Tất cả trạng thái</option>';
    for (var k in TRANG_THAI) {
        opt = opt + '<option value="' + k + '"' + (k == locTrangThai ? " selected" : "") + '>' + TRANG_THAI[k] + '</option>';
    }
    var hang = "";
    for (var i = 0; i < ds.length; i++) {
        var o = ds[i];
        if (locTrangThai != "" && o.trangThai != locTrangThai) {
            continue;
        }
        hang = hang + '<tr><td><b>' + o.ma + '</b></td><td>' + new Date(o.ngay).toLocaleString("vi-VN") + '</td>' +
            '<td>' + maHoaChu(o.ten) + '<div class="nho muted">' + maHoaChu(o.sdt) + '</div></td><td>' + dinhDangTien(o.tong) + '</td>' +
            '<td><span class="status st-' + o.trangThai + '">' + TRANG_THAI[o.trangThai] + '</span></td>' +
            '<td><button class="btn-line vw" onclick="moChiTietDon(\'' + o.ma + '\')">Chi tiết</button></td></tr>';
    }
    if (hang == "") {
        hang = '<tr><td colspan="6" class="text-center muted" style="padding:1.5rem">Chưa có đơn hàng.</td></tr>';
    }
    datHTML("view", '<div class="loc-don"><select id="of" class="o-nhap" onchange="locTrangThai = this.value; veDonHangQT();">' + opt + '</select></div>' +
        '<div class="tbl"><table class="bang"><thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead><tbody>' + hang + '</tbody></table></div>');
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
    var buoc = BUOC_TIEP[o.trangThai];
    for (var k = 0; k < buoc.length; k++) {
        var chu = buoc[k] == "da_huy" ? "Hủy đơn" : "→ " + TRANG_THAI[buoc[k]];
        nut = nut + '<button class="btn-jb st" data-s="' + buoc[k] + '" onclick="doiTrangThaiQT(\'' + o.ma + '\', \'' + buoc[k] + '\')">' + chu + '</button>';
    }
    if (nut == "") {
        nut = '<span class="muted">Đơn đã kết thúc.</span>';
    }
    datChu("omT", "Đơn hàng #" + o.ma);
    datHTML("omB",
        '<p><span class="status st-' + o.trangThai + '">' + TRANG_THAI[o.trangThai] + '</span> · ' + (o.hinhThuc == "den_lay" ? "Đến lấy" : "Giao tận nơi") + ' · ' + (HINH_THUC_TT[o.thanhToan] || o.thanhToan) + '</p>' +
        '<p>Người nhận: <b>' + maHoaChu(o.ten) + '</b> – ' + maHoaChu(o.sdt) + '<br>Địa chỉ: ' + maHoaChu(o.diaChi) + (o.ghiChu ? "<br>Ghi chú: " + maHoaChu(o.ghiChu) : "") + '</p>' + dong +
        '<div class="sum-line"><span>Phí giao hàng</span><span>' + dinhDangTien(o.phiGiao) + '</span></div>' +
        '<div class="sum-line"><span>Giảm giá' + (o.maKM ? " (" + maHoaChu(o.maKM) + ")" : "") + '</span><span>-' + dinhDangTien(o.giamGia) + '</span></div>' +
        '<div class="sum-line sum-total"><span>Tổng cộng</span><span>' + dinhDangTien(o.tong) + '</span></div>' +
        '<div class="hang-nut">' + nut + '</div>');
    moHopThoai("om");
}

function doiTrangThaiQT(ma, moi) {
    if (doiTrangThaiDon(ma, moi)) {
        moChiTietDon(ma);
        veDonHangQT();
        thongBao("Đã cập nhật trạng thái");
    }
}

/* ===== MÓN ĂN (nhân viên chỉ bật/tắt; BR10: món đã có trong đơn thì không xóa hẳn) ===== */
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
            '<td>' + maHoaChu(timDanhMuc(p.danhMuc).ten) + '</td><td>' + dinhDangTien(p.gia) + '</td>' +
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
                if (!(ds[i].giaCao > gia)) {
                    ds[i].giaCao = gia;
                }
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
        ds.push({ id: idMoi + 1, danhMuc: layId("pc").value, ten: ten, moTa: layGiaTri("pd"), gia: gia, giaCao: gia, anh: layGiaTri("pi"), banChay: layId("ph").checked, dangBan: layId("pa").checked });
    }
    luuMonAn(ds);
    dongHopThoai("pm");
    veMonAnQT();
    thongBao("Đã lưu món ăn");
}

function xoaMonQT(id) {
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
function veKhuyenMaiQT() {
    var ds = layKhuyenMai(true);
    var hang = "";
    for (var i = 0; i < ds.length; i++) {
        var p = ds[i];
        var giaTri = "–";
        if (p.loai == "phan_tram") { giaTri = p.giaTri + "%"; }
        else if (p.loai == "so_tien") { giaTri = dinhDangTien(p.giaTri); }
        hang = hang + '<tr><td><span class="code">' + maHoaChu(p.ma) + '</span></td><td>' + maHoaChu(p.tieuDe) + '</td><td>' + LOAI_KM[p.loai] + '</td><td>' + giaTri + '</td><td>' + dinhDangTien(p.toiThieu) + '</td>' +
            '<td class="nowrap"><button class="btn-line pt" onclick="batTatKM(' + p.id + ')">' + (p.dangBan ? "Tắt" : "Bật") + '</button> <button class="btn-line pd2" onclick="xoaKM(' + p.id + ')">Xóa</button></td></tr>';
    }
    datHTML("view", '<div class="box mb3"><h6 style="font-weight:bold">Thêm mã giảm giá</h6><div class="form-km"><input id="n-t" class="o-nhap" placeholder="Tên chương trình"><input id="n-c" class="o-nhap" placeholder="MÃ">' +
        '<select id="n-y" class="o-nhap"><option value="phan_tram">Giảm %</option><option value="so_tien">Giảm tiền</option><option value="mien_phi_ship">Miễn phí giao</option></select>' +
        '<input id="n-v" class="o-nhap" placeholder="Giá trị"><input id="n-m" class="o-nhap" placeholder="Đơn tối thiểu"><button class="btn-jb" id="n-a" onclick="themKM()">+</button></div><div class="invalid-msg" id="n-e"></div></div>' +
        '<div class="tbl"><table class="bang"><thead><tr><th>Mã</th><th>Chương trình</th><th>Loại</th><th>Giá trị</th><th>Tối thiểu</th><th></th></tr></thead><tbody>' + hang + '</tbody></table></div>');
}

function themKM() {
    var tieuDe = layGiaTri("n-t");
    var ma = layGiaTri("n-c").toUpperCase();
    var loai = layId("n-y").value;
    var giaTri = parseInt(layId("n-v").value, 10) || 0;
    var toiThieu = parseInt(layId("n-m").value, 10) || 0;
    var ds = layKhuyenMai(true);
    if (tieuDe == "" || ma == "") {
        datChu("n-e", "Nhập tên chương trình và mã.");
        return;
    }
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].ma == ma) {
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
    ds.push({ id: Date.now(), tieuDe: tieuDe, ma: ma, loai: loai, giaTri: giaTri, toiThieu: toiThieu, moTa: tieuDe, dangBan: true });
    luuKhuyenMai(ds);
    veKhuyenMaiQT();
}

function batTatKM(id) {
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
    if (confirm("Xóa mã này?")) {
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

/* ===== NGƯỜI DÙNG (khóa / mở khóa) ===== */
function veNguoiDungQT() {
    var ds = layNguoiDung();
    var hang = "";
    for (var i = 0; i < ds.length; i++) {
        var u = ds[i];
        var nut = "";
        if (u.id != nguoiQT.id) {                 // không tự khóa chính mình
            nut = '<button class="btn-line lk" onclick="khoaNguoiDung(' + u.id + ')">' + (u.biKhoa ? "Mở khóa" : "Khóa") + '</button>';
        }
        hang = hang + '<tr><td>' + maHoaChu(u.hoTen) + '</td><td>' + maHoaChu(u.email) + '</td><td>' + maHoaChu(u.sdt) + '</td><td>' + VAI_TRO[u.vaiTro] + '</td>' +
            '<td><span class="status ' + (u.biKhoa ? "st-giao_that_bai" : "st-da_giao") + '">' + (u.biKhoa ? "Đã khóa" : "Hoạt động") + '</span></td><td>' + nut + '</td></tr>';
    }
    datHTML("view", '<div class="tbl"><table class="bang"><thead><tr><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Vai trò</th><th>Trạng thái</th><th></th></tr></thead><tbody>' + hang + '</tbody></table></div>');
}

function khoaNguoiDung(id) {
    var ds = layNguoiDung();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].id == id) {
            ds[i].biKhoa = !ds[i].biKhoa;
        }
    }
    luuNguoiDung(ds);
    veNguoiDungQT();
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
