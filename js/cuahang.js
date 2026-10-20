// ===== CỬA HÀNG: lọc theo tỉnh/thành =====

function veCuaHang() {
    var tinh = layId("city").value;
    var html = "";
    for (var i = 0; i < DU_LIEU.cuaHang.length; i++) {
        var ch = DU_LIEU.cuaHang[i];
        if (tinh == "" || ch.thanhPho == tinh) {
            html = html + '<div class="box cua-hang"><h5>' + maHoaChu(ch.ten) + '</h5><div>' + maHoaChu(ch.thanhPho) + '</div>' +
                '<div class="muted nho">Giờ mở cửa: ' + ch.gioMoCua + '</div></div>';
        }
    }
    datHTML("g", html);
}

function khoiTaoCuaHang() {
    veDauTrangVaChanTrang("cuahang.html");
    // Tạo danh sách tỉnh/thành không trùng lặp
    var dsTinh = [];
    for (var i = 0; i < DU_LIEU.cuaHang.length; i++) {
        if (dsTinh.indexOf(DU_LIEU.cuaHang[i].thanhPho) == -1) {
            dsTinh.push(DU_LIEU.cuaHang[i].thanhPho);
        }
    }
    var html = "";
    for (var k = 0; k < dsTinh.length; k++) {
        html = html + "<option>" + dsTinh[k] + "</option>";
    }
    layId("city").insertAdjacentHTML("beforeend", html);
    layId("city").onchange = veCuaHang;
    veCuaHang();
}
