/* Lõi ứng dụng: lưu trữ (localStorage), giỏ hàng, đơn hàng, tài khoản, header/footer dùng chung */
(function (w, $) {
  'use strict';
  var D = w.JB_DATA;
  var mem = {};
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return k in mem ? mem[k] : d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { mem[k] = v; } }
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { return Number(n || 0).toLocaleString('vi-VN') + 'đ'; }
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return 'h' + (h >>> 0).toString(16); } // chỉ để demo, không an toàn như băm thật

  var STATUS = {
    cho_xac_nhan: 'Chờ xác nhận', da_xac_nhan: 'Đã xác nhận', dang_chuan_bi: 'Đang chuẩn bị',
    dang_giao: 'Đang giao', da_giao: 'Đã giao', da_huy: 'Đã hủy', giao_that_bai: 'Giao thất bại'
  };
  var NEXT = { cho_xac_nhan: ['da_xac_nhan', 'da_huy'], da_xac_nhan: ['dang_chuan_bi', 'da_huy'], dang_chuan_bi: ['dang_giao'], dang_giao: ['da_giao', 'giao_that_bai'], da_giao: [], da_huy: [], giao_that_bai: [] };
  var SHIP = 15000, MAXQ = 20;

  var JB = { D: D, STATUS: STATUS, NEXT: NEXT, esc: esc, money: money, SHIP: SHIP, MAXQ: MAXQ };

  /* ---------- khởi tạo dữ liệu ---------- */
  JB.init = function () {
    if (!LS.get('jb_ready', false)) {
      LS.set('jb_products', D.products);
      LS.set('jb_promos', D.promos);
      LS.set('jb_users', [{ id: 1, name: 'Quản trị viên', email: 'admin@jollibee.vn', phone: '0900000001', pass: hash('admin123'), role: 'admin', locked: false },
        { id: 2, name: 'Nhân viên cửa hàng', email: 'nhanvien@jollibee.vn', phone: '0900000002', pass: hash('nv123456'), role: 'staff', locked: false }]);
      LS.set('jb_orders', []); LS.set('jb_reviews', []); LS.set('jb_cart', []);
      LS.set('jb_ready', true);
    }
  };

  /* ---------- sản phẩm ---------- */
  JB.cats = function () { return D.categories; };
  JB.cat = function (slug) { return D.categories.filter(function (c) { return c.slug === slug; })[0]; };
  JB.products = function (all) { var p = LS.get('jb_products', []); return all ? p : p.filter(function (x) { return x.active; }); };
  JB.saveProducts = function (p) { LS.set('jb_products', p); };
  JB.product = function (id) { return JB.products(true).filter(function (x) { return x.id === Number(id); })[0]; };
  var COLORS = { combo: '#E4002B', 'ga-gion': '#F59E0B', 'mi-y': '#DC2626', 'ga-sot-cay': '#B91C1C', 'burger-com': '#D97706', 'phan-an-phu': '#CA8A04', 'trang-mieng': '#EC4899', 'thuc-uong': '#0EA5E9' };
  JB.img = function (p) {
    if (p.img) return p.img;
    var c = COLORS[p.cat] || '#E4002B', words = p.name.split(' '), l1 = '', l2 = '';
    words.forEach(function (x) { if ((l1 + ' ' + x).length < 16 && !l2) l1 += (l1 ? ' ' : '') + x; else l2 += (l2 ? ' ' : '') + x; });
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="' + c + '"/><circle cx="200" cy="150" r="70" fill="#FFC72C" opacity=".9"/>' +
      '<text x="200" y="285" font-family="Arial" font-weight="bold" font-size="26" fill="#fff" text-anchor="middle">' + esc(l1) + '</text>' +
      '<text x="200" y="320" font-family="Arial" font-weight="bold" font-size="26" fill="#fff" text-anchor="middle">' + esc(l2) + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };
  JB.priceText = function (p) { return (p.priceMax > p.price ? '<small>Từ </small>' : '') + money(p.price); };

  /* ---------- giỏ hàng ---------- */
  JB.cart = function () { return LS.get('jb_cart', []); };
  function saveCart(c) { LS.set('jb_cart', c); JB.updateBadge(); }
  JB.cartAdd = function (id, qty) {
    var p = JB.product(id); if (!p || !p.active) return { ok: false, msg: 'Món này hiện đã ngừng bán.' };
    var c = JB.cart(), it = c.filter(function (x) { return x.id === Number(id); })[0];
    var n = (it ? it.qty : 0) + (qty || 1);
    if (n > MAXQ) return { ok: false, msg: 'Mỗi món tối đa ' + MAXQ + ' phần trong giỏ.' };
    if (it) it.qty = n; else c.push({ id: Number(id), qty: qty || 1 });
    saveCart(c); return { ok: true };
  };
  JB.cartSet = function (id, qty) {
    var c = JB.cart(); qty = Math.max(1, Math.min(MAXQ, parseInt(qty, 10) || 1));
    c.forEach(function (x) { if (x.id === Number(id)) x.qty = qty; }); saveCart(c);
  };
  JB.cartRemove = function (id) { saveCart(JB.cart().filter(function (x) { return x.id !== Number(id); })); };
  JB.cartClear = function () { saveCart([]); };
  JB.cartLines = function () {
    return JB.cart().map(function (x) { var p = JB.product(x.id); return p && p.active ? { p: p, qty: x.qty, sum: p.price * x.qty } : null; }).filter(Boolean);
  };
  JB.cartCount = function () { return JB.cart().reduce(function (s, x) { return s + x.qty; }, 0); };
  JB.subtotal = function () { return JB.cartLines().reduce(function (s, l) { return s + l.sum; }, 0); };
  JB.mode = function (m) { if (m) LS.set('jb_mode', m); return LS.get('jb_mode', 'delivery'); };

  /* ---------- khuyến mãi ---------- */
  JB.promos = function (all) { var p = LS.get('jb_promos', []); return all ? p : p.filter(function (x) { return x.active; }); };
  JB.savePromos = function (p) { LS.set('jb_promos', p); };
  JB.checkPromo = function (code, subtotal) {
    var pr = JB.promos().filter(function (x) { return x.code.toUpperCase() === String(code).trim().toUpperCase(); })[0];
    if (!pr) return { ok: false, msg: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' };
    if (subtotal < pr.min) return { ok: false, msg: 'Đơn tối thiểu ' + money(pr.min) + ' để dùng mã này.' };
    return { ok: true, promo: pr };
  };
  JB.calc = function (subtotal, mode, promo) {
    var ship = mode === 'pickup' ? 0 : SHIP, disc = 0;
    if (promo) { if (promo.type === 'percent') disc = Math.round(subtotal * promo.value / 100); else if (promo.type === 'amount') disc = promo.value; else if (promo.type === 'ship') ship = 0; }
    disc = Math.min(disc, subtotal);
    return { subtotal: subtotal, ship: ship, discount: disc, total: subtotal - disc + ship }; // BR05
  };

  /* ---------- tài khoản ---------- */
  JB.users = function () { return LS.get('jb_users', []); };
  JB.saveUsers = function (u) { LS.set('jb_users', u); };
  JB.me = function () { var id = LS.get('jb_session', null); return id ? JB.users().filter(function (u) { return u.id === id && !u.locked; })[0] || null : null; };
  JB.register = function (name, email, phone, pass) {
    var us = JB.users();
    if (us.some(function (u) { return u.email.toLowerCase() === email.toLowerCase(); })) return { ok: false, msg: 'Email này đã được đăng ký.' };
    var u = { id: Date.now(), name: name, email: email, phone: phone, pass: hash(pass), role: 'customer', locked: false };
    us.push(u); JB.saveUsers(us); LS.set('jb_session', u.id); return { ok: true, user: u };
  };
  JB.login = function (email, pass) {
    var u = JB.users().filter(function (x) { return x.email.toLowerCase() === email.toLowerCase() && x.pass === hash(pass); })[0];
    if (!u) return { ok: false, msg: 'Email hoặc mật khẩu không đúng.' };
    if (u.locked) return { ok: false, msg: 'Tài khoản đã bị khóa.' };
    LS.set('jb_session', u.id); return { ok: true, user: u };
  };
  JB.logout = function () { LS.set('jb_session', null); };

  /* ---------- đơn hàng ---------- */
  JB.orders = function () { return LS.get('jb_orders', []); };
  JB.saveOrders = function (o) { LS.set('jb_orders', o); };
  JB.createOrder = function (info) {
    var lines = JB.cartLines(); if (!lines.length) return { ok: false, msg: 'Giỏ hàng đang trống.' }; // BR01
    var sub = lines.reduce(function (s, l) { return s + l.sum; }, 0), promo = null;
    if (info.code) { var r = JB.checkPromo(info.code, sub); if (!r.ok) return r; promo = r.promo; }
    var t = JB.calc(sub, info.mode, promo), os = JB.orders();
    var o = {
      id: 'JB' + String(Date.now()).slice(-8), userId: info.userId, date: new Date().toISOString(), status: 'cho_xac_nhan',
      name: info.name, phone: info.phone, address: info.address, note: info.note, mode: info.mode, pay: info.pay, code: promo ? promo.code : '',
      items: lines.map(function (l) { return { id: l.p.id, name: l.p.name, price: l.p.price, qty: l.qty }; }), // giá tại thời điểm đặt
      subtotal: t.subtotal, ship: t.ship, discount: t.discount, total: t.total
    };
    os.unshift(o); JB.saveOrders(os); JB.cartClear(); return { ok: true, order: o };
  };
  JB.setStatus = function (id, st) {
    var os = JB.orders(), o = os.filter(function (x) { return x.id === id; })[0];
    if (!o || (NEXT[o.status] || []).indexOf(st) < 0) return false;
    o.status = st; JB.saveOrders(os); return true;
  };
  JB.cancelOrder = function (id) { var o = JB.orders().filter(function (x) { return x.id === id; })[0]; return o && o.status === 'cho_xac_nhan' && JB.setStatus(id, 'da_huy'); }; // BR07

  /* ---------- đánh giá ---------- */
  JB.reviews = function (pid) { return LS.get('jb_reviews', []).filter(function (r) { return r.pid === Number(pid); }); };
  JB.allReviews = function () { return LS.get('jb_reviews', []); };
  JB.saveReviews = function (r) { LS.set('jb_reviews', r); };
  JB.hasBought = function (uid, pid) { return JB.orders().some(function (o) { return o.userId === uid && o.status === 'da_giao' && o.items.some(function (i) { return i.id === Number(pid); }); }); }; // BR08

  /* ---------- UI chung ---------- */
  JB.toast = function (msg) {
    var b = $('.toast-box'); if (!b.length) b = $('<div class="toast-box"></div>').appendTo('body');
    var t = $('<div class="toast-i"></div>').text(msg).appendTo(b); setTimeout(function () { t.fadeOut(300, function () { t.remove(); }); }, 2400);
  };
  JB.updateBadge = function () { $('.jb-cart-n').text(JB.cartCount()); };
  JB.card = function (p) {
    return '<div class="col-6 col-md-4 col-lg-3"><div class="pcard">' + (p.hot ? '<span class="badge-jb">Bán chạy</span>' : '') +
      '<a class="pimg" href="ChiTietMonAn.html?id=' + p.id + '"><img loading="lazy" src="' + esc(JB.img(p)) + '" alt="' + esc(p.name) + '" onerror="this.onerror=null;this.src=JB.img({name:this.alt,cat:\'combo\'})"></a>' +
      '<div class="pbody"><h3><a href="ChiTietMonAn.html?id=' + p.id + '">' + esc(p.name) + '</a></h3><div class="pdesc">' + esc(p.desc) + '</div>' +
      '<div class="d-flex justify-content-between align-items-center"><span class="pprice">' + JB.priceText(p) + '</span>' +
      '<button class="btn-jb js-add" data-id="' + p.id + '">Thêm</button></div></div></div></div>';
  };
  $(document).on('click', '.js-add', function () {
    var r = JB.cartAdd($(this).data('id'), 1); JB.toast(r.ok ? 'Đã thêm vào giỏ hàng' : r.msg);
  });

  JB.layout = function (active) {
    var me = JB.me(), nav = [['TrangChu.html', 'Trang chủ'], ['ThucDon.html', 'Thực đơn'], ['KhuyenMai.html', 'Khuyến mãi'], ['DichVu.html', 'Dịch vụ'], ['TinTuc.html', 'Tin tức'], ['CuaHang.html', 'Cửa hàng'], ['LienHe.html', 'Liên hệ']];
    var mega = D.categories.map(function (c) { return '<a href="ThucDon.html?cat=' + c.slug + '"><img src="' + esc(c.img) + '" alt="" onerror="this.style.visibility=\'hidden\'">' + esc(c.name) + '</a>'; }).join('');
    var li = nav.map(function (n) {
      return '<li><a href="' + n[0] + '" class="' + (active === n[0] ? 'active' : '') + '">' + n[1] + '</a>' + (n[0] === 'ThucDon.html' ? '<div class="jb-mega">' + mega + '</div>' : '') + '</li>';
    }).join('');
    var acct = me ? '<a href="DonHang.html">' + esc(me.name) + '</a><span class="sep"></span>' + (me.role !== 'customer' ? '<a href="admin/index.html">QUẢN TRỊ</a><span class="sep"></span>' : '') + '<a href="#" id="jb-logout">ĐĂNG XUẤT</a>' : '<a href="DangNhap.html">ĐĂNG KÝ / ĐĂNG NHẬP</a>';
    $('#jb-header').html('<div class="jb-top"><a href="#">VN</a><span class="sep"></span><a href="#">EN</a><span class="sep"></span>' + acct + '</div>' +
      '<header class="jb-head"><div class="jb-head-in"><a class="jb-logo" href="TrangChu.html">Jollibee<small>ĐỒ ÁN 2 - Vũ Tiến Phước</small></a>' +
      '<button class="jb-burger" aria-label="Menu">&#9776;</button><ul class="jb-nav">' + li + '</ul>' +
      '<div class="jb-right"><a class="jb-cart" href="GioHang.html">Giỏ hàng <b class="jb-cart-n">0</b></a></div></div></header>');
    $('#jb-footer').html('<footer class="jb-foot"><div class="container"><div class="row g-4"><div class="col-md-5"><h5>Đồ án 2 – Thiết kế web cơ bản</h5>' +
      '<p>Website bán đồ ăn nhanh mô phỏng theo giao diện Jollibee Việt Nam.</p></div>' +
      '<div class="col-6 col-md-3"><h5>Liên kết</h5><div><a href="ThucDon.html">Thực đơn</a></div><div><a href="KhuyenMai.html">Khuyến mãi</a></div><div><a href="CuaHang.html">Cửa hàng</a></div><div><a href="DonHang.html">Đơn hàng của tôi</a></div></div>' +
      '<div class="col-6 col-md-4"><h5>Hỗ trợ</h5><div><a href="LienHe.html">Liên hệ</a></div><div><a href="TinTuc.html">Tin tức</a></div><div><small>Hotline minh họa: 1900 xxxx</small></div></div></div>' +
      '<div class="sub">Sinh viên thực hiện: Vũ Tiến Phước - Trường Đại học Công nghệ Kỹ thuật Hưng Yên.</div></div></footer><a class="chat-fab" href="LienHe.html">Trò chuyện cùng Jolly</a>');
    $('.jb-burger').on('click', function () { $('.jb-nav').toggleClass('open'); });
    $('#jb-logout').on('click', function (e) { e.preventDefault(); JB.logout(); location.href = 'TrangChu.html'; });
    JB.updateBadge();
  };

  JB.init();
  w.JB = JB;
})(window, jQuery);
