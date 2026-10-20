// ===== LIÊN HỆ: kiểm tra biểu mẫu rồi lưu phản hồi vào localStorage =====

function guiLienHe(e) {
    e.preventDefault();
    var ten = layGiaTri("n");
    var email = layGiaTri("e");
    var noiDung = layGiaTri("m");
    var loi = "";

    if (ten == "" || noiDung == "") {
        loi = "Vui lòng nhập họ tên và nội dung.";
    } else if (emailHopLe(email) == false) {
        loi = "Email không hợp lệ.";
    }
    if (loi != "") {
        datChu("err", loi);
        return;
    }
    datChu("err", "");
    var ds = docDuLieu("jb_lienHe", []);
    ds.unshift({ ten: ten, email: email, noiDung: noiDung, ngay: new Date().toISOString() });
    ghiDuLieu("jb_lienHe", ds);
    layId("f").reset();
    thongBao("Cảm ơn bạn! Chúng tôi đã nhận được phản hồi.");
}

function khoiTaoLienHe() {
    veDauTrangVaChanTrang("lienhe.html");
    layId("f").onsubmit = guiLienHe;
}
