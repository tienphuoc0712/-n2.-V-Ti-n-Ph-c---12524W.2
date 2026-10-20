// ===== TIN TỨC =====

function khoiTaoTinTuc() {
    veDauTrangVaChanTrang("tintuc.html");
    var html = "";
    for (var i = 0; i < DU_LIEU.tinTuc.length; i++) {
        var t = DU_LIEU.tinTuc[i];
        html = html + '<div class="news-card"><div class="ph">J</div><div class="bd"><small>' + t.ngay + '</small><h5>' + maHoaChu(t.tieuDe) + '</h5><p>' + maHoaChu(t.noiDung) + '</p></div></div>';
    }
    datHTML("g", html);
}
