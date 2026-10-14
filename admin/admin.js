/* Trang quản trị: thống kê, món ăn, đơn hàng, khuyến mãi, người dùng */
(function ($) {
  var me = JB.me();
  if (!me || me.role === 'customer') { location.href = '../DangNhap.html?next=admin%2Findex.html'; return; }
  var isAdmin = me.role === 'admin';
  var TABS = [['dash', 'Tổng quan', true], ['orders', 'Đơn hàng', false], ['products', 'Món ăn', false], ['promos', 'Khuyến mãi', true], ['users', 'Người dùng', true]]
    .filter(function (t) { return !t[2] || isAdmin; }); // BR09: nhân viên không xem thống kê, khuyến mãi, người dùng
  var cur = isAdmin ? 'dash' : 'orders', esc = JB.esc, money = JB.money;
  $('#who').text(me.email + ' (' + (isAdmin ? 'Quản trị viên' : 'Nhân viên') + ')');
  $('#out').on('click', function (e) { e.preventDefault(); JB.logout(); location.href = '../TrangChu.html'; });
  function side() {
    $('#side').html('<div class="brand">Jollibee Admin</div>' + TABS.map(function (t) { return '<a data-t="' + t[0] + '" class="' + (cur === t[0] ? 'on' : '') + '">' + t[1] + '</a>'; }).join(''));
    $('#ptitle').text(TABS.filter(function (t) { return t[0] === cur; })[0][1]);
  }
  $('#side').on('click', 'a', function () { cur = $(this).data('t'); go(); });
  function go() { side(); V[cur](); }

  var V = {};
  /* ---------- Tổng quan ---------- */
  V.dash = function () {
    var os = JB.orders(), done = os.filter(function (o) { return o.status === 'da_giao'; }), rev = done.reduce(function (s, o) { return s + o.total; }, 0);
    var days = [], i; for (i = 6; i >= 0; i--) { var d = new Date(); d.setDate(d.getDate() - i); days.push(d.toISOString().slice(0, 10)); }
    var byDay = days.map(function (d) { return done.filter(function (o) { return o.date.slice(0, 10) === d; }).reduce(function (s, o) { return s + o.total; }, 0); });
    var mx = Math.max.apply(null, byDay.concat([1])), top = {};
    done.forEach(function (o) { o.items.forEach(function (it) { top[it.name] = (top[it.name] || 0) + it.qty; }); });
    var tl = Object.keys(top).map(function (k) { return [k, top[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5);
    $('#view').html('<div class="row g-3 mb-3">' +
      [['Doanh thu (đơn đã giao)', money(rev)], ['Đơn mới chờ xác nhận', os.filter(function (o) { return o.status === 'cho_xac_nhan'; }).length], ['Món đang bán', JB.products().length], ['Khách hàng', JB.users().filter(function (u) { return u.role === 'customer'; }).length]]
        .map(function (s) { return '<div class="col-6 col-lg-3"><div class="stat"><small>' + s[0] + '</small><b>' + s[1] + '</b></div></div>'; }).join('') + '</div>' +
      '<div class="row g-3"><div class="col-lg-7"><div class="box"><h6 class="fw-bold">Doanh thu 7 ngày gần nhất</h6><div class="d-flex align-items-end gap-2" style="height:180px">' +
      byDay.map(function (v, k) { return '<div class="flex-fill text-center small"><div class="bar" title="' + money(v) + '" style="height:' + Math.round(v / mx * 150) + 'px;min-height:2px"></div>' + days[k].slice(5) + '</div>'; }).join('') + '</div></div></div>' +
      '<div class="col-lg-5"><div class="box"><h6 class="fw-bold">Món bán chạy</h6>' + (tl.length ? tl.map(function (t, k) { return '<div class="sum-line"><span>' + (k + 1) + '. ' + esc(t[0]) + '</span><b>' + t[1] + '</b></div>'; }).join('') : '<span class="text-muted">Chưa có dữ liệu.</span>') + '</div></div></div>');
  };

  /* ---------- Đơn hàng ---------- */
  var ofilter = '';
  V.orders = function () {
    var os = JB.orders().filter(function (o) { return !ofilter || o.status === ofilter; });
    $('#view').html('<div class="mb-3"><select id="of" class="form-select" style="max-width:240px"><option value="">Tất cả trạng thái</option>' + Object.keys(JB.STATUS).map(function (k) { return '<option value="' + k + '"' + (k === ofilter ? ' selected' : '') + '>' + JB.STATUS[k] + '</option>'; }).join('') + '</select></div>' +
      '<div class="tbl"><table class="table mb-0 align-middle"><thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead><tbody>' +
      (os.map(function (o) { return '<tr><td><b>' + o.id + '</b></td><td>' + new Date(o.date).toLocaleString('vi-VN') + '</td><td>' + esc(o.name) + '<div class="small text-muted">' + esc(o.phone) + '</div></td><td>' + money(o.total) + '</td><td><span class="status st-' + o.status + '">' + JB.STATUS[o.status] + '</span></td><td><button class="btn-line vw" data-id="' + o.id + '">Chi tiết</button></td></tr>'; }).join('') || '<tr><td colspan="6" class="text-center text-muted py-4">Chưa có đơn hàng.</td></tr>') + '</tbody></table></div>');
    $('#of').on('change', function () { ofilter = this.value; V.orders(); });
  };
  $('#view').on('click', '.vw', function () { openOrder($(this).data('id')); });
  function openOrder(id) {
    var o = JB.orders().filter(function (x) { return x.id === id; })[0]; if (!o) return;
    $('#omT').text('Đơn hàng #' + o.id);
    $('#omB').html('<p><span class="status st-' + o.status + '">' + JB.STATUS[o.status] + '</span> · ' + (o.mode === 'pickup' ? 'Đến lấy' : 'Giao tận nơi') + ' · ' + ({ cod: 'Tiền mặt', bank: 'Chuyển khoản', wallet: 'Ví điện tử' }[o.pay] || o.pay) + '</p>' +
      '<p>Người nhận: <b>' + esc(o.name) + '</b> – ' + esc(o.phone) + '<br>Địa chỉ: ' + esc(o.address) + (o.note ? '<br>Ghi chú: ' + esc(o.note) : '') + '</p>' +
      o.items.map(function (i) { return '<div class="sum-line"><span>' + i.qty + ' × ' + esc(i.name) + '</span><span>' + money(i.price * i.qty) + '</span></div>'; }).join('') +
      '<div class="sum-line"><span>Phí giao hàng</span><span>' + money(o.ship) + '</span></div><div class="sum-line"><span>Giảm giá' + (o.code ? ' (' + esc(o.code) + ')' : '') + '</span><span>-' + money(o.discount) + '</span></div><div class="sum-line sum-total"><span>Tổng cộng</span><span>' + money(o.total) + '</span></div>' +
      '<div class="mt-3 d-flex gap-2 flex-wrap">' + (JB.NEXT[o.status].map(function (n) { return '<button class="btn-jb st" data-id="' + o.id + '" data-s="' + n + '">' + (n === 'da_huy' ? 'Hủy đơn' : '→ ' + JB.STATUS[n]) + '</button>'; }).join('') || '<span class="text-muted">Đơn đã kết thúc.</span>') + '</div>');
    bootstrap.Modal.getOrCreateInstance('#om').show();
  }
  $('#omB').on('click', '.st', function () {
    var id = $(this).data('id'); if (JB.setStatus(id, $(this).data('s'))) { openOrder(id); V.orders(); JB.toast('Đã cập nhật trạng thái'); }
  });

  /* ---------- Món ăn ---------- */
  V.products = function () {
    var ps = JB.products(true), cn = {}; JB.cats().forEach(function (c) { cn[c.slug] = c.name; });
    $('#view').html('<div class="mb-3">' + (isAdmin ? '<button class="btn-jb" id="padd">+ Thêm món</button>' : '<span class="text-muted small">Nhân viên chỉ được bật/tắt trạng thái bán.</span>') + '</div>' +
      '<div class="tbl"><table class="table mb-0 align-middle"><thead><tr><th></th><th>Tên món</th><th>Danh mục</th><th>Giá</th><th>Trạng thái</th><th></th></tr></thead><tbody>' +
      ps.map(function (p) { return '<tr><td><img class="thumb" src="' + esc(JB.img(p)) + '" alt=""></td><td><b>' + esc(p.name) + '</b>' + (p.hot ? ' <span class="badge text-bg-danger">Bán chạy</span>' : '') + '</td><td>' + esc(cn[p.cat]) + '</td><td>' + money(p.price) + '</td><td><span class="status ' + (p.active ? 'st-da_giao' : 'st-da_huy') + '">' + (p.active ? 'Đang bán' : 'Ngừng bán') + '</span></td>' +
        '<td class="text-nowrap"><button class="btn-line tg" data-id="' + p.id + '">' + (p.active ? 'Tắt' : 'Bật') + '</button> ' + (isAdmin ? '<button class="btn-line ed" data-id="' + p.id + '">Sửa</button> <button class="btn-line dl" data-id="' + p.id + '">Xóa</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>');
  };
  function openP(p) {
    $('#pc').html(JB.cats().map(function (c) { return '<option value="' + c.slug + '">' + esc(c.name) + '</option>'; }).join(''));
    $('#pmT').text(p ? 'Sửa món ăn' : 'Thêm món ăn'); $('#pe').text('');
    $('#pid').val(p ? p.id : ''); $('#pn').val(p ? p.name : ''); $('#pc').val(p ? p.cat : 'combo'); $('#pp').val(p ? p.price : ''); $('#pd').val(p ? p.desc : ''); $('#pi').val(p ? p.img : ''); $('#ph').prop('checked', p ? p.hot : false); $('#pa').prop('checked', p ? p.active : true);
    bootstrap.Modal.getOrCreateInstance('#pm').show();
  }
  $('#view').on('click', '#padd', function () { openP(null); })
    .on('click', '.ed', function () { openP(JB.product($(this).data('id'))); })
    .on('click', '.tg', function () { var ps = JB.products(true), id = $(this).data('id'); ps.forEach(function (p) { if (p.id === id) p.active = !p.active; }); JB.saveProducts(ps); V.products(); })
    .on('click', '.dl', function () {
      var id = $(this).data('id'), used = JB.orders().some(function (o) { return o.items.some(function (i) { return i.id === id; }); });
      if (used) { if (confirm('Món này đã có trong đơn hàng cũ nên không thể xóa hẳn. Chuyển sang "Ngừng bán"?')) { var ps = JB.products(true); ps.forEach(function (p) { if (p.id === id) p.active = false; }); JB.saveProducts(ps); V.products(); } } // BR10
      else if (confirm('Xóa món này?')) { JB.saveProducts(JB.products(true).filter(function (p) { return p.id !== id; })); V.products(); }
    });
  $('#psave').on('click', function () {
    var n = $('#pn').val().trim(), pr = parseInt($('#pp').val(), 10);
    if (!n) { $('#pe').text('Vui lòng nhập tên món.'); return; }
    if (!(pr > 0)) { $('#pe').text('Giá phải là số lớn hơn 0.'); return; }
    var ps = JB.products(true), id = Number($('#pid').val()), o = { name: n, cat: $('#pc').val(), price: pr, priceMax: pr, desc: $('#pd').val().trim(), img: $('#pi').val().trim(), hot: $('#ph').prop('checked'), active: $('#pa').prop('checked') };
    if (id) ps.forEach(function (p) { if (p.id === id) { var keepMax = p.priceMax > pr ? p.priceMax : pr; $.extend(p, o, { priceMax: keepMax }); } });
    else { o.id = ps.reduce(function (m, p) { return Math.max(m, p.id); }, 0) + 1; ps.push(o); }
    JB.saveProducts(ps); bootstrap.Modal.getOrCreateInstance('#pm').hide(); V.products(); JB.toast('Đã lưu món ăn');
  });

  /* ---------- Khuyến mãi ---------- */
  V.promos = function () {
    var ps = JB.promos(true);
    $('#view').html('<div class="box mb-3"><h6 class="fw-bold">Thêm mã giảm giá</h6><div class="row g-2"><div class="col-md-3"><input id="n-t" class="form-control" placeholder="Tên chương trình"></div><div class="col-md-2"><input id="n-c" class="form-control" placeholder="MÃ"></div><div class="col-md-2"><select id="n-y" class="form-select"><option value="percent">Giảm %</option><option value="amount">Giảm tiền</option><option value="ship">Miễn phí giao</option></select></div><div class="col-md-2"><input id="n-v" class="form-control" placeholder="Giá trị"></div><div class="col-md-2"><input id="n-m" class="form-control" placeholder="Đơn tối thiểu"></div><div class="col-md-1"><button class="btn-jb w-100" id="n-a">+</button></div></div><div class="invalid-msg" id="n-e"></div></div>' +
      '<div class="tbl"><table class="table mb-0 align-middle"><thead><tr><th>Mã</th><th>Chương trình</th><th>Loại</th><th>Giá trị</th><th>Tối thiểu</th><th></th></tr></thead><tbody>' +
      ps.map(function (p) { return '<tr><td><span class="code">' + esc(p.code) + '</span></td><td>' + esc(p.title) + '</td><td>' + { percent: 'Giảm %', amount: 'Giảm tiền', ship: 'Miễn phí giao' }[p.type] + '</td><td>' + (p.type === 'percent' ? p.value + '%' : p.type === 'amount' ? money(p.value) : '–') + '</td><td>' + money(p.min) + '</td><td class="text-nowrap"><button class="btn-line pt" data-id="' + p.id + '">' + (p.active ? 'Tắt' : 'Bật') + '</button> <button class="btn-line pd2" data-id="' + p.id + '">Xóa</button></td></tr>'; }).join('') + '</tbody></table></div>');
  };
  $('#view').on('click', '#n-a', function () {
    var t = $('#n-t').val().trim(), c = $('#n-c').val().trim().toUpperCase(), y = $('#n-y').val(), v = parseInt($('#n-v').val(), 10) || 0, m = parseInt($('#n-m').val(), 10) || 0, ps = JB.promos(true);
    if (!t || !c) { $('#n-e').text('Nhập tên chương trình và mã.'); return; }
    if (ps.some(function (p) { return p.code === c; })) { $('#n-e').text('Mã đã tồn tại.'); return; }
    if (y !== 'ship' && v <= 0) { $('#n-e').text('Nhập giá trị giảm.'); return; }
    if (y === 'percent' && v > 100) { $('#n-e').text('Phần trăm giảm tối đa 100.'); return; }
    ps.push({ id: Date.now(), title: t, code: c, type: y, value: v, min: m, desc: t, active: true }); JB.savePromos(ps); V.promos();
  }).on('click', '.pt', function () { var ps = JB.promos(true), id = $(this).data('id'); ps.forEach(function (p) { if (p.id === id) p.active = !p.active; }); JB.savePromos(ps); V.promos(); })
    .on('click', '.pd2', function () { var id = $(this).data('id'); if (confirm('Xóa mã này?')) { JB.savePromos(JB.promos(true).filter(function (p) { return p.id !== id; })); V.promos(); } });

  /* ---------- Người dùng ---------- */
  V.users = function () {
    var rl = { admin: 'Quản trị viên', staff: 'Nhân viên', customer: 'Khách hàng' };
    $('#view').html('<div class="tbl"><table class="table mb-0 align-middle"><thead><tr><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Vai trò</th><th>Trạng thái</th><th></th></tr></thead><tbody>' +
      JB.users().map(function (u) { return '<tr><td>' + esc(u.name) + '</td><td>' + esc(u.email) + '</td><td>' + esc(u.phone) + '</td><td>' + rl[u.role] + '</td><td><span class="status ' + (u.locked ? 'st-giao_that_bai' : 'st-da_giao') + '">' + (u.locked ? 'Đã khóa' : 'Hoạt động') + '</span></td><td>' + (u.id === me.id ? '' : '<button class="btn-line lk" data-id="' + u.id + '">' + (u.locked ? 'Mở khóa' : 'Khóa') + '</button>') + '</td></tr>'; }).join('') + '</tbody></table></div>');
  };
  $('#view').on('click', '.lk', function () { var us = JB.users(), id = $(this).data('id'); us.forEach(function (u) { if (u.id === id) u.locked = !u.locked; }); JB.saveUsers(us); V.users(); });

  go();
})(jQuery);
