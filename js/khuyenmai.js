// ===== KHUYẾN MÃI =====

function khoiTaoKhuyenMai() {
    capNhatDauTrang();
    var ds = layKhuyenMai(false);
    var html = "";
    for (var i = 0; i < ds.length; i++) {
        html = html + veTheKhuyenMai(ds[i], true);
    }
    if (html == "") {
        html = '<p class="text-center muted full">Hiện chưa có chương trình khuyến mãi.</p>';
    }
    datHTML("g", html);
}
