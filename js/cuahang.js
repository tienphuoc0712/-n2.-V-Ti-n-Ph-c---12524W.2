// ===== CỬA HÀNG: lọc theo tỉnh/thành =====
// Danh sách cửa hàng viết sẵn trong html, mỗi thẻ có thuộc tính data-tp = tỉnh/thành.
// JS chỉ ẩn những thẻ không thuộc tỉnh/thành đang chọn.

function locCuaHang() {
    var tinh = layId("city").value;
    var cacThe = document.getElementsByClassName("cua-hang");
    for (var i = 0; i < cacThe.length; i++) {
        if (tinh == "" || cacThe[i].getAttribute("data-tp") == tinh) {
            cacThe[i].style.display = "";
        } else {
            cacThe[i].style.display = "none";
        }
    }
}

function khoiTaoCuaHang() {
    capNhatDauTrang();
    layId("city").onchange = locCuaHang;
}
