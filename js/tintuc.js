// ===== TIN TỨC: dữ liệu bài viết + hiển thị thẻ tin (trang chủ, trang Tin tức) và trang đọc bài =====
// anh: ảnh lưu trong thư mục images/tin (hiện khi không có mạng); anhGoc: ảnh gốc trên website Jollibee (ưu tiên dùng)
var TIN_TUC = [
    {
        id: 1,
        ngay: "Tháng 5/2026",
        tieuDe: "Jollibee công bố nhượng quyền thương hiệu tại Việt Nam",
        tomTat: "Đại diện Jollibee Việt Nam vừa công bố triển khai mô hình nhượng quyền thương hiệu, đánh dấu giai đoạn phát triển mới của doanh nghiệp sau hơn hai thập kỷ xây dựng hệ thống vận hành trong nước.",
        anhGoc: "https://jollibee.com.vn/media/wysiwyg/Anh_01_-_Khai_truong_cua_hang_HN-compressed.jpg",
        anh: "../images/tin/tin-nhuong-quyen.svg",
        chuAnh: "Jollibee liên tục khai trương cửa hàng mới tại Việt Nam trong năm 2026. Ảnh: Jollibee Việt Nam",
        noiDung: [
            "Đại diện Jollibee Việt Nam vừa công bố triển khai mô hình nhượng quyền thương hiệu, đánh dấu giai đoạn phát triển mới của doanh nghiệp sau hơn hai thập kỷ xây dựng hệ thống vận hành trong nước.",
            "Trên thế giới, Jollibee đã triển khai mô hình nhượng quyền tại nhiều thị trường như Mỹ, Trung Quốc, Philippines, Singapore, Malaysia và nhiều nước trong khu vực EMEA (Europe, Middle East & Asia). Hoạt động nhượng quyền tại Việt Nam được xem là bước tiếp theo trong chiến lược mở rộng của thương hiệu tại khu vực.",
            "“Việc mở rộng thông qua nhượng quyền không chỉ giúp doanh nghiệp tăng tốc độ phát triển, mà còn tạo thêm cơ hội việc làm, hỗ trợ chuỗi cung ứng trong nước và đóng góp vào sự phát triển của ngành dịch vụ ăn uống tại Việt Nam”, đại diện doanh nghiệp chia sẻ.",
            "Bên cạnh công bố nhượng quyền, Jollibee vừa ghi nhận cột mốc mới khi được Euromonitor International công nhận là “No.1 Quick Service Restaurant in Vietnam” - chuỗi nhà hàng phục vụ nhanh có doanh thu cao nhất tại Việt Nam. Euromonitor International là công ty hàng đầu thế giới về nghiên cứu thị trường, chiến lược tiêu dùng và phân tích dữ liệu kinh doanh.",
            "Kết quả này được công bố trong báo cáo Consumer Foodservice 2026 của Euromonitor, dựa trên doanh thu ngành hàng Quick Service Restaurant (QSR) tại Việt Nam năm 2025. Đây được xem là dấu mốc quan trọng của thương hiệu trong bối cảnh thị trường dịch vụ ăn uống bước vào giai đoạn cạnh tranh ngày càng khốc liệt.",
            "“Kết quả từ Euromonitor không chỉ phản ánh tốc độ tăng trưởng của thương hiệu mà còn cho thấy hiệu quả của chiến lược đầu tư dài hạn vào nền tảng vận hành và chất lượng sản phẩm tại thị trường Việt Nam”, đại diện doanh nghiệp cho biết.",
            "Tính đến tháng 5 này, Jollibee Việt Nam phát triển hơn 255 cửa hàng trên toàn quốc. Doanh nghiệp đồng thời đầu tư vào chuỗi cung ứng nội bộ với năng lực sản xuất chủ động và quy trình quản lý chất lượng chặt chẽ nhằm đảm bảo chất lượng sản phẩm đồng nhất trên toàn hệ thống. Nhà máy của doanh nghiệp tại Việt Nam hiện đạt chứng nhận FSSC 22000 về quản lý an toàn thực phẩm."
        ],
        nguon: "Jollibee"
    },

];

function timTin(id) {
    for (var i = 0; i < TIN_TUC.length; i++) {
        if (TIN_TUC[i].id == id) {
            return TIN_TUC[i];
        }
    }
    return null;
}

// Ảnh bìa: ưu tiên ảnh gốc trên website Jollibee, lỗi (không có mạng) thì dùng ảnh trong thư mục images/tin
function htmlAnhTin(t, lopThem) {
    var nguon = t.anhGoc || t.anh;
    var du = t.anhGoc ? ' onerror="this.onerror=null;this.src=\'' + t.anh + '\'"' : "";
    return '<img class="' + (lopThem || "") + '" loading="lazy" src="' + nguon + '" alt="' + maHoaChu(t.tieuDe) + '"' + du + '>';
}

function veTheTin(t) {
    return '<a class="news-card the-tin" href="tintuc.html?id=' + t.id + '"><div class="ph co-anh">' + htmlAnhTin(t) + '</div>' +
        '<div class="bd"><small>' + maHoaChu(t.ngay) + '</small><h5>' + maHoaChu(t.tieuDe) + '</h5><p>' + maHoaChu(t.tomTat) + '</p></div></a>';
}

// Trang chủ: 3 tin mới nhất
function veTinTrangChu() {
    var o = document.getElementById("newsGrid");
    if (o == null) {
        return;
    }
    var html = "";
    for (var i = 0; i < 3 && i < TIN_TUC.length; i++) {
        html = html + veTheTin(TIN_TUC[i]);
    }
    o.innerHTML = html;
}

// Trang Tin tức: danh sách, hoặc đọc một bài khi có ?id=
function veTrangTin() {
    var o = document.getElementById("g");
    if (o == null) {
        return;
    }
    var t = timTin(layThamSo("id"));
    if (t != null) {
        var chu = "";
        for (var i = 0; i < t.noiDung.length; i++) {
            chu = chu + "<p>" + maHoaChu(t.noiDung[i]) + "</p>";
        }
        o.className = "";
        o.innerHTML = '<article class="bai-tin"><a class="quay-lai" href="tintuc.html">← Tất cả tin tức</a><small>' + maHoaChu(t.ngay) + '</small><h1>' + maHoaChu(t.tieuDe) + '</h1>' +
            '<div class="anh-bia">' + htmlAnhTin(t) + (t.chuAnh ? '<em>' + maHoaChu(t.chuAnh) + '</em>' : "") + '</div>' + chu +
            (t.nguon ? '<p class="nguon">(Nguồn: ' + maHoaChu(t.nguon) + ')</p>' : "") + '</article>';
        document.title = t.tieuDe + " | Jollibee – Đồ án 2";
        return;
    }
    var html = "";
    for (var k = 0; k < TIN_TUC.length; k++) {
        html = html + veTheTin(TIN_TUC[k]);
    }
    o.innerHTML = html;
}

veTinTrangChu();
veTrangTin();
