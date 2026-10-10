/* =========================================================
   Куманцов ПК .ru — логика приложения
   ========================================================= */
(function () {
  "use strict";

  /* ---------------- утилиты ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const money = (n) => Number(n).toLocaleString("ru-RU") + " " + SHOP.currency;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let uid = 0;
  const nextUid = () => "u" + (++uid);

  const native = window.AndroidHost || null;
  function haptic() { try { if (native) native.vibrate(12); } catch (e) {} }
  function toast(msg, kind) {
    const w = $("#toast-wrap");
    const t = document.createElement("div");
    t.className = "toast" + (kind ? " " + kind : "");
    t.innerHTML = (kind === "ok" ? ICON.check(18) : kind === "err" ? ICON.warn(18) : "") + "<span>" + esc(msg) + "</span>";
    w.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateY(10px)"; setTimeout(() => t.remove(), 250); }, 2200);
  }

  /* ---------------- иконки ---------------- */
  const ICON = {
    check: (s) => `<svg viewBox="0 0 24 24" style="width:${s || 18}px;height:${s || 18}px;color:#00ffa3"><path d="M20 6L9 17l-5-5"/></svg>`,
    warn: (s) => `<svg viewBox="0 0 24 24" style="width:${s || 18}px;height:${s || 18}px;color:#ff5c8a"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg>`,
    heart: (f) => `<svg viewBox="0 0 24 24" ${f ? 'fill="currentColor"' : ""}><path d="M12 20s-7-4.6-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7C19 15.4 12 20 12 20z"/></svg>`,
    cart: (s) => `<svg viewBox="0 0 24 24" style="width:${s || 18}px;height:${s || 18}px"><path d="M3 4h2.2l2.2 11h9.6l2-8H6"/><circle cx="10" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/></svg>`,
    star: () => `<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8z"/></svg>`,
    back: () => `<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>`,
    phone: () => `<svg viewBox="0 0 24 24"><path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 12l4 1.5v3A2.5 2.5 0 0 1 17.5 21C10 21 3 14 3 6.5A2.5 2.5 0 0 1 5.5 4z"/></svg>`,
    tg: () => `<svg viewBox="0 0 24 24"><path d="M21 4L3 11l5 1.6L19 7l-8.5 8.3.3 4.3 2.6-3.5 4.4 3.2z"/></svg>`,
    wa: () => `<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 0 1-11.7 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5"/></svg>`,
    mail: () => `<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>`,
    pin: () => `<svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>`,
    shield: () => `<svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.2-3 7.8-7 9-4-1.2-7-4.8-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>`,
    bolt: () => `<svg viewBox="0 0 24 24"><path d="M13 3L5 14h6l-1 7 8-11h-6z"/></svg>`,
    box: () => `<svg viewBox="0 0 24 24"><path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/></svg>`,
    gear: () => `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/></svg>`,
    truck: () => `<svg viewBox="0 0 24 24"><path d="M2 6h11v10H2zM13 9h4.5l3.5 3.5V16H13z"/><circle cx="6.5" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>`,
    cash: () => `<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.8"/></svg>`,
    card: () => `<svg viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 9.5h19"/></svg>`,
    doc: () => `<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>`,
    game: () => `<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M16 12h.01M18.5 14h.01"/></svg>`,
    cube: () => `<svg viewBox="0 0 24 24"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>`,
    grid: () => `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></svg>`,
    trash: () => `<svg viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>`,
    clock: () => `<svg viewBox="0 0 24 24" style="width:16px;height:16px"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>`,
    tag: () => `<svg viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="7.5" r="1.2"/></svg>`
  };

  /* ---------------- SVG-арт товара ---------------- */
  function pcArt(accent) {
    const id = nextUid();
    return `
<svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity=".95"/>
      <stop offset="60%" stop-color="${accent}" stop-opacity=".35"/>
      <stop offset="100%" stop-color="#8b5cff" stop-opacity=".25"/>
    </linearGradient>
    <linearGradient id="b${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1f30"/><stop offset="100%" stop-color="#0b0e16"/>
    </linearGradient>
    <filter id="f${id}" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="r${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accent}" stop-opacity=".42"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="100" cy="128" rx="86" ry="16" fill="url(#r${id})"/>
  <g opacity=".55" stroke="${accent}" stroke-width="2" fill="none" filter="url(#f${id})">
    <circle cx="118" cy="56" r="17"/><circle cx="118" cy="56" r="11"/>
    <circle cx="118" cy="90" r="17"/><circle cx="118" cy="90" r="11"/>
  </g>
  <rect x="66" y="14" width="68" height="112" rx="7" fill="url(#b${id})" stroke="${accent}" stroke-opacity=".55" stroke-width="1.6"/>
  <rect x="70" y="18" width="42" height="104" rx="5" fill="#05070d" fill-opacity=".55" stroke="${accent}" stroke-opacity=".3"/>
  <rect x="73.5" y="22" width="5" height="96" rx="2.5" fill="url(#g${id})" filter="url(#f${id})"/>
  <g fill="none" stroke="${accent}" stroke-opacity=".8" stroke-width="1.5">
    <circle cx="118" cy="56" r="17"/><circle cx="118" cy="56" r="4"/>
    <circle cx="118" cy="90" r="17"/><circle cx="118" cy="90" r="4"/>
  </g>
  <g stroke="${accent}" stroke-opacity=".85" stroke-width="1.4" stroke-linecap="round">
    <path d="M118 44c7 3 7 15 0 24"/><path d="M118 48c4 2 4 12 0 16"/>
    <path d="M118 78c7 3 7 15 0 24"/><path d="M118 82c4 2 4 12 0 16"/>
  </g>
  <rect x="78" y="108" width="28" height="3" rx="1.5" fill="url(#g${id})"/>
  <circle cx="122" cy="120" r="2" fill="${accent}"/><circle cx="115" cy="120" r="2" fill="${accent}" opacity=".5"/>
  <rect x="60" y="126" width="80" height="4" rx="2" fill="#ffffff" opacity=".07"/>
</svg>`;
  }

  /* ---------------- хранилище ---------------- */
  const KEY = "kumanpc_v1";
  const DEFAULTS = { cart: [], favs: [], orders: [], promo: "", lastDelivery: "", lastPayment: "" };
  let S = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULTS));
      const p = JSON.parse(raw);
      return Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), p);
    } catch (e) { return JSON.parse(JSON.stringify(DEFAULTS)); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function cartCount() { return S.cart.reduce((a, b) => a + b.q, 0); }
  function cartTotal() { return S.cart.reduce((a, b) => a + product(b.id).price * b.q, 0); }
  function product(id) { return PRODUCTS.filter((p) => p.id === id)[0]; }
  function inCart(id) { return S.cart.some((b) => b.id === id); }
  function inFav(id) { return S.favs.indexOf(id) >= 0; }

  /* ---------------- корзина ---------------- */
  function addToCart(id, qty) {
    const p = product(id); if (!p) return;
    const row = S.cart.filter((b) => b.id === id)[0];
    if (row) row.q = Math.min(row.q + (qty || 1), 99);
    else S.cart.push({ id: id, q: qty || 1 });
    save(); badges(); haptic();
    toast(p.name + " — в корзине", "ok");
  }
  function setQty(id, q) {
    const row = S.cart.filter((b) => b.id === id)[0];
    if (!row) return;
    row.q = q;
    if (row.q <= 0) S.cart = S.cart.filter((b) => b.id !== id);
    save(); badges();
  }
  function removeFromCart(id) {
    S.cart = S.cart.filter((b) => b.id !== id);
    save(); badges(); toast("Товар удалён из корзины");
  }
  function toggleFav(id) {
    const i = S.favs.indexOf(id);
    if (i >= 0) { S.favs.splice(i, 1); toast("Убрано из избранного"); }
    else { S.favs.push(id); toast("Добавлено в избранное", "ok"); }
    save(); badges();
    render();
  }

  /* ---------------- промокоды ---------------- */
  const PROMOS = {
    SUMMER10: { off: 0.10, label: "Скидка 10%" },
    VIP15:    { off: 0.15, min: 100000, label: "Скидка 15% от 100 000 ₽" },
    BONUS:    { sum: 1000, label: "−1 000 ₽" }
  };
  function promoInfo(code) {
    const c = (code || "").trim().toUpperCase();
    if (!c) return null;
    const p = PROMOS[c]; if (!p) return { error: "Промокод не найден" };
    const sub = cartTotal();
    if (p.min && sub < p.min) return { error: "Промокод действует от " + money(p.min) };
    return { code: c, off: p.off || 0, sum: p.sum || 0, label: p.label, sub: sub };
  }
  function discountValue(p) {
    if (!p || p.error) return 0;
    let d = p.sum || Math.round(p.sub * p.off);
    return Math.min(d, cartTotal());
  }

  /* ---------------- бейджи / табы ---------------- */
  function badges() {
    const c = cartCount(), f = S.favs.length;
    const cb = $("#cart-badge"); cb.textContent = c; cb.hidden = c === 0;
    const fb = $("#fav-badge"); fb.textContent = f; fb.hidden = f === 0;
  }
  function markTab(name) {
    $$(".tab").forEach((t) => t.classList.toggle("on", t.dataset.tab === name));
    moveIndicator();
  }

  /* «капля» liquid glass под активной вкладкой */
  function moveIndicator() {
    var bar = $("#tabbar"), ind = $("#tab-ind");
    if (!bar || !ind) return;
    var on = bar.querySelector(".tab.on");
    if (!on) { ind.classList.remove("on"); return; }
    var left = on.offsetLeft;
    ind.style.setProperty("--w", on.offsetWidth + "px");
    ind.style.setProperty("--x", left + "px");
    ind.classList.add("on");
  }

  /* ---------------- состояние вида ---------------- */
  let state = { cat: "all", sort: "pop", q: "", search: false };

  /* ---------------- роутер ---------------- */
  const routes = {
    home: viewHome, catalog: viewCatalog, favorites: viewFavorites,
    cart: viewCart, checkout: viewCheckout, contacts: viewContacts,
    configurator: viewConfigurator, master: viewMaster, contract: viewContract
  };

  function readHashParams() {
    const q = /[?&]cat=([a-z]+)/.exec(location.hash);
    if (q) state.cat = q[1];
    const s = /[?&]sort=([a-z]+)/.exec(location.hash);
    if (s) state.sort = s[1];
  }

  function go() {
    readHashParams();
    $("#view").classList.remove("has-sticky");
    const h = location.hash.replace(/^#\/?/, "").split("?")[0];
    const parts = h.split("/").filter(Boolean);
    const name = parts[0] || "home";
    const view = $("#view");

    if (name === "product") { viewProduct(view, parts[1]); markTab("catalog"); bindArt(); return; }
    if (name === "success") { viewSuccess(view); markTab(""); bindArt(); return; }

    (routes[name] || viewHome)(view);
    markTab(name === "favorites" ? "home" : name);
    bindArt();
    window.scrollTo(0, 0);
  }

  function render() { go(); }

  /* ================= ЭКРАН: ГЛАВНАЯ ================= */
  function viewHome(v) {
    const hits = PRODUCTS.filter((p) => p.rating >= 4.9).slice(0, 4);
    const fresh = PRODUCTS.slice().sort(() => 0.5 - Math.random()).slice(0, 4);

    v.innerHTML = `
<section class="hero">
  <span class="pill"><i class="dot"></i>Приём заказов ${esc(SHOP.workHours)}</span>
  <h1>Компьютеры<br><span>собраны под вас</span></h1>
  <p class="lead">Готовые ПК и сборки на заказ. Оригинальные комплектующие, гарантия ${esc(SHOP.warranty)}, тест 48 часов перед отправкой. Доставка по всей России.</p>
  <div class="hero-cta">
    <a class="btn primary" href="#/catalog">${ICON.game(19)}Открыть каталог</a>
    <a class="btn ghost" href="#/configurator">${ICON.gear(19)}Собрать ПК</a>
  </div>
  <div class="hero-stats">
    <div><b>${PRODUCTS.length}</b><span>моделей в наличии</span></div>
    <div><b>36</b><span>месяцев гарантии</span></div>
    <div><b>4.9</b><span>рейтинг покупателей</span></div>
  </div>
</section>

<div class="sec">
  <div class="sec-head"><h2>Категории</h2></div>
  <div class="grid-cards">
    ${CATS.map((c) => `<a class="card cat-card" href="#/catalog?cat=${c.id}">
      <span class="ico">${ICON[c.ico]()}</span>
      <b>${esc(c.name)}</b><span>${esc(c.desc)}</span></a>`).join("")}
  </div>
</div>

<div class="sec">
  <div class="sec-head"><h2>Лучшие</h2><p>рейтинг 4.9+</p><a class="more" href="#/catalog?sort=rating">Все →</a></div>
  <div class="grid-cards">${hits.map(cardHTML).join("")}</div>
</div>

<div class="sec">
  <div class="sec-head"><h2>${ICON.bolt(18)} Скидки и спецпредложения</h2><a class="more" href="#/catalog?cat=all">Все →</a></div>
  <div class="grid-cards">${fresh.map(cardHTML).join("")}</div>
</div>

<div class="sec">
  <div class="grid-cards">
    <a class="card cat-card" href="#/master">
      <span class="ico">${ICON.gear()}</span>
      <b>Вызвать мастера</b><span>Ремонт от 990 ₽</span></a>
    <a class="card cat-card" href="#/contract">
      <span class="ico">${ICON.shield()}</span>
      <b>Служба по контракту</b><span>${esc(CONTRACT.pay)}</span></a>
    <a class="card cat-card" href="#/catalog?cat=parts">
      <span class="ico">${ICON.gear()}</span>
      <b>Комплектующие</b><span>Видеокарты и БП</span></a>
  </div>
</div>

<div class="sec">
  <div class="sec-head"><h2>Почему мы</h2></div>
  <div class="panel">
    <div class="step"><span class="n">1</span><div><b>Собственное производство</b><span>Собираем каждый ПК сами, а не перепродаём чужие.</span></div></div>
    <hr class="sep">
    <div class="step"><span class="n">2</span><div><b>Проверка 48 часов</b><span>Прогоняем стресс-тесты, стабилизируем разгон.</span></div></div>
    <hr class="sep">
    <div class="step"><span class="n">3</span><div><b>Гарантия ${esc(SHOP.warranty)}</b><span>Бесплатный ремонт и замена комплектующих.</span></div></div>
    <hr class="sep">
    <div class="step"><span class="n">4</span><div><b>Доставка по РФ</b><span>Бесплатно при заказе от ${money(SHOP.freeDeliveryFrom)}.</span></div></div>
  </div>
</div>`;
  }

  /* ---------------- картинка товара ---------------- */
  function artHTML(p, big) {
    if (p.img) {
      return `<img class="photo${big ? " big" : ""}" src="${esc(p.img)}" alt="${esc(p.name)}" `
        + `data-art="${esc(p.art || "#8b5cff")}" draggable="false">`;
    }
    return pcArt(p.art || "#8b5cff");
  }

  /* если фото не отрисовалось (битая картинка / старый WebView) —
     показываем SVG-корпус, чтобы не было чёрного прямоугольника */
  function bindArt() {
    $$("img.photo").forEach((img) => {
      if (img.dataset.bound) return;
      img.dataset.bound = "1";
      img.addEventListener("error", function () {
        var holder = document.createElement("div");
        holder.innerHTML = pcArt(img.dataset.art || "#8b5cff");
        var svg = holder.firstChild;
        if (svg && img.parentNode) {
          svg.setAttribute("class", "photo-fallback");
          img.parentNode.replaceChild(svg, img);
        }
      });
    });
  }

  /* ================= КАРТОЧКА ТОВАРА ================= */
  function cardHTML(p) {
    return `<a class="card prod${p.img ? " has-photo" : ""}" href="#/product/${p.id}">
    <div class="art">
      ${artHTML(p)}
      <span class="tag">${esc(p.tag)}</span>
      <span class="favbtn ${inFav(p.id) ? "on" : ""}" data-fav="${p.id}">${ICON.heart()}</span>
    </div>
    <div class="body">
      <h3>${esc(p.name)}</h3>
      <div class="spec-line"><i>${esc(p.specs["Видеокарта"] || p.specs["Платформа"] || "")}</i></div>
      <div class="spec-line"><i>${esc(p.specs["Процессор"])}</i></div>
      <div class="rating"><span class="stars">${ICON.star()}${ICON.star()}${ICON.star()}${ICON.star()}${ICON.star()}</span> ${p.rating.toFixed(1)} · ${p.reviews} отзывов</div>
      <div class="price"><b>${money(p.price)}</b>${p.old ? `<s>${money(p.old)}</s>` : ""}</div>
    </div>
  </a>`;
  }

  /* ================= ЭКРАН: КАТАЛОГ ================= */
  function viewCatalog(v) {
    v.innerHTML = `
      <div class="chips" id="cat-chips">
        ${CATS.map((c) => `<a class="chip ${state.cat === c.id ? "on" : ""}" data-cat="${c.id}" href="#/catalog?cat=${c.id}">${esc(c.name)}</a>`).join("")}
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin:2px 0 14px">
        <select class="sel" id="sort">
          <option value="pop">По популярности</option>
          <option value="rating">По рейтингу</option>
          <option value="asc">Сначала дешёвые</option>
          <option value="desc">Сначала дорогие</option>
          <option value="discount">По скидке</option>
        </select>
        <span class="hint" id="count"></span>
      </div>
      <div class="grid-cards" id="grid"></div>`;

    $("#sort").value = state.sort;
    $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; drawGrid(); });
    drawGrid();
  }

  function drawGrid() {
    let list = PRODUCTS.slice();
    if (state.cat !== "all") list = list.filter((p) => p.cat === state.cat);
    if (state.q) {
      const q = state.q.toLowerCase();
      list = list.filter((p) =>
        (p.name + " " + p.short + " " + JSON.stringify(p.specs) + " " + p.tag).toLowerCase().indexOf(q) >= 0);
    }
    list.sort((a, b) => {
      if (state.sort === "asc") return a.price - b.price;
      if (state.sort === "desc") return b.price - a.price;
      if (state.sort === "rating") return b.rating - a.rating;
      if (state.sort === "discount") return (b.old ? b.old / b.price : 1) - (a.old ? a.old / a.price : 1);
      return (b.reviews * b.rating) - (a.reviews * a.rating);
    });
    const g = $("#grid"), c = $("#count");
    if (!g) return;
    c.textContent = list.length ? "Найдено: " + list.length : "";
    g.innerHTML = list.length ? list.map(cardHTML).join("")
      : `<div class="empty" style="grid-column:1/-1"><div class="ei">${ICON.grid()}</div>
         <b>Ничего не найдено</b><p>Попробуйте изменить запрос или выбрать другую категорию.</p></div>`;
  }

  /* ================= ЭКРАН: ТОВАР ================= */
  function viewProduct(v, id) {
    const p = product(id);
    if (!p) { location.hash = "#/catalog"; return; }
    const specs = Object.keys(p.specs).map((k) => `<div class="kv"><span>${esc(k)}</span><b>${esc(p.specs[k])}</b></div>`).join("");
    v.classList.add("has-sticky");

    v.innerHTML = `
      <a class="backlink" href="#/catalog">${ICON.back()}Назад в каталог</a>
      <div class="pp-art${p.img ? " pp-photo" : ""}">${artHTML(p, true)}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <span class="chip on" style="cursor:default">${esc(p.tag)}</span>
        <span class="stock"><i class="dot"></i>В наличии</span>
      </div>
      <h1 class="pp-title">${esc(p.name)}</h1>
      <p class="pp-sub">${esc(p.short)}</p>
      <div class="rating" style="margin-bottom:6px"><span class="stars">${ICON.star()}${ICON.star()}${ICON.star()}${ICON.star()}${ICON.star()}</span> ${p.rating.toFixed(1)} · ${p.reviews} отзывов</div>
      <div class="price-big">${money(p.price)}${p.old ? `<s>${money(p.old)}</s>` : ""}</div>
      ${p.old ? `<div class="discount">Выгода ${money(p.old - p.price)} · цена действует до конца месяца</div>` : ""}

      <div class="actions">
        <button class="btn green" id="pp-add">${ICON.cart(19)}В корзину</button>
        <button class="btn ghost" id="pp-fav">${ICON.heart(19)}В избранное</button>
      </div>

      <div class="sec">
        <div class="sec-head"><h2>${ICON.bolt(18)} Что входит</h2></div>
        <div class="feat">${p.feat.map((f) => `<div>${ICON.check(18)}<span>${esc(f)}</span></div>`).join("")}</div>
      </div>

      <div class="sec">
        <div class="sec-head"><h2>Характеристики</h2></div>
        <div class="panel">${specs}</div>
      </div>

      <div class="sec">
        <div class="sec-head"><h2>${ICON.truck(19)} Доставка и оплата</h2></div>
        <div class="panel">
          <div class="step"><span class="n">1</span><div><b>Самовывоз — бесплатно</b><span>${esc(SHOP.address)}</span></div></div>
          <hr class="sep">
          <div class="step"><span class="n">2</span><div><b>Голубиная доставка — ${money(SHOP.deliveryPrice)}</b><span>Бесплатно при заказе от ${money(SHOP.freeDeliveryFrom)}. Голуби не задерживаются.</span></div></div>
          <hr class="sep">
          <div class="step"><span class="n">3</span><div><b>По России — бесплатно от ${money(SHOP.freeDeliveryFrom)}</b><span>СДЭК, ПЭК, Боксберри, Почта России.</span></div></div>
          <hr class="sep">
          <div class="step"><span class="n">4</span><div><b>Оплата</b><span>${esc(SHOP.paymentNote)}</span></div></div>
        </div>
      </div>

      <div class="sticky-buy">
        <div class="p"><b>${money(p.price)}</b><s>${p.old ? money(p.old) : ""}</s></div>
        <button class="btn green" data-buy="${p.id}">${ICON.cart(19)}Купить</button>
      </div>`;

    $("#pp-add").onclick = () => { addToCart(p.id); render(); };
    $("#pp-fav").onclick = () => toggleFav(p.id);
    $$("[data-buy]").forEach((b) => b.onclick = () => { addToCart(b.dataset.buy); location.hash = "#/cart"; });
  }

  /* ================= ЭКРАН: ИЗБРАННОЕ ================= */
  function viewFavorites(v) {
    const list = S.favs.map(product).filter(Boolean);
    v.innerHTML = `
      <a class="backlink" href="#/home">${ICON.back()}На главную</a>
      <div class="sec-head"><h2>Избранное</h2><p>${list.length} товаров</p></div>
      ${list.length ? `<div class="grid-cards">${list.map(cardHTML).join("")}</div>` : `
        <div class="empty"><div class="ei">${ICON.heart()}</div><b>Здесь пока пусто</b>
        <p>Нажимайте на сердечко в карточке товара, чтобы отложить его.</p>
        <a class="btn primary" href="#/catalog" style="margin-top:14px">Перейти в каталог</a></div>`}`;
  }

  /* ================= ЭКРАН: КОРЗИНА ================= */
  function viewCart(v) {
    if (!S.cart.length) {
      v.innerHTML = `<div class="empty"><div class="ei">${ICON.cart(30)}</div><b>Корзина пуста</b>
        <p>Выберите компьютер из каталога или соберите свой.</p>
        <div class="hero-cta" style="justify-content:center;margin-top:14px">
          <a class="btn primary" href="#/catalog">В каталог</a>
          <a class="btn ghost" href="#/configurator">Собрать ПК</a></div></div>`;
      return;
    }
    const sub = cartTotal();
    const pi = promoInfo(S.promo);
    const d = discountValue(pi);
    const deliv = (sub - d) >= SHOP.freeDeliveryFrom ? 0 : SHOP.deliveryPrice;

    v.innerHTML = `
      <div class="sec-head"><h2>Корзина</h2><p>${cartCount()} шт.</p></div>
      <div class="panel">
        ${S.cart.map((r) => {
          const p = product(r.id);
          return `<div class="cart-row">
            <div class="mini">${artHTML(p)}</div>
            <div class="info"><b>${esc(p.name)}</b><span>${esc(p.specs["Процессор"].split(",")[0])} · ${esc(p.specs["Видеокарта"])}</span></div>
            <div class="qty"><button data-minus="${p.id}">−</button><span>${r.q}</span><button data-plus="${p.id}">+</button></div>
            <div class="row-price">${money(p.price * r.q)}<br><button class="rm" data-del="${p.id}">${ICON.trash()}</button></div>
          </div>`;
        }).join("")}
      </div>

      <div class="panel">
        <h3>Промокод</h3>
        <div style="display:flex;gap:8px">
          <input id="promo" placeholder="Например, SUMMER10" value="${esc(S.promo)}" style="flex:1;padding:12px 13px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.05);outline:none">
          <button class="btn sm" id="promo-apply">Применить</button>
        </div>
        ${pi && pi.error ? `<div class="discount off">${esc(pi.error)}</div>`
          : pi ? `<div class="discount">${ICON.tag(14)} Промокод применён: ${esc(pi.label)}</div>` : ""}
      </div>

      <div class="panel">
        <div class="sum"><span>Товары (${cartCount()} шт.)</span><b>${money(sub)}</b></div>
        ${d ? `<div class="sum"><span>Скидка</span><b class="free">−${money(d)}</b></div>` : ""}
        <div class="sum"><span>Доставка</span><b class="${deliv === 0 ? "free" : ""}">${deliv === 0 ? "бесплатно" : money(deliv)}</b></div>
        ${deliv ? `<p class="note">Добавьте товаров на ${money(SHOP.freeDeliveryFrom - (sub - d))} — и доставка станет бесплатной.</p>` : ""}
        <div class="sum total"><span>Итого</span><b>${money(sub - d + deliv)}</b></div>
        <button class="btn primary block" id="to-checkout" style="margin-top:12px">Оформить заказ${ICON.bolt(19)}</button>
        <button class="btn ghost block" id="clear-cart" style="margin-top:8px">Очистить корзину</button>
      </div>

      <div class="panel">
        <h3>${ICON.phone(18)} Есть вопросы?</h3>
        <p class="note" style="margin-top:0">Позвоните — поможем подобрать конфигурацию под ваш бюджет и задачи.</p>
        <a class="btn green block" href="tel:${esc(SHOP.phoneHref)}" style="margin-top:10px">${ICON.phone(18)}${esc(SHOP.phone)}</a>
      </div>`;

    $$("[data-plus]").forEach((b) => b.onclick = () => { const r = S.cart.filter((x) => x.id === b.dataset.plus)[0]; setQty(b.dataset.plus, r.q + 1); render(); });
    $$("[data-minus]").forEach((b) => b.onclick = () => { const r = S.cart.filter((x) => x.id === b.dataset.minus)[0]; setQty(b.dataset.minus, r.q - 1); render(); });
    $$("[data-del]").forEach((b) => b.onclick = () => { removeFromCart(b.dataset.del); render(); });
    $("#promo-apply").onclick = () => {
      const val = $("#promo").value.trim().toUpperCase();
      if (!val) { S.promo = ""; save(); render(); return; }
      const info = promoInfo(val);
      if (info.error) { toast(info.error, "err"); return; }
      S.promo = val; save(); toast("Промокод применён: " + info.label, "ok"); render();
    };
    $("#to-checkout").onclick = () => location.hash = "#/checkout";
    $("#clear-cart").onclick = () => { S.cart = []; S.promo = ""; save(); badges(); toast("Корзина очищена"); render(); };
  }

  /* ================= ЭКРАН: ОФОРМЛЕНИЕ ================= */
  let form = { name: "", phone: "", addr: "", delivery: "courier", payment: "card", comment: "" };

  function syncForm() {
    const n = $("#f-name"), p = $("#f-phone"), a = $("#f-addr"), c = $("#f-comment"), ag = $("#f-agree");
    if (n) form.name = n.value;
    if (p) form.phone = p.value;
    if (a) form.addr = a.value;
    if (c) form.comment = c.value;
    if (ag) form.agree = ag.checked;
  }

  function viewCheckout(v) {
    if (!S.cart.length) { location.hash = "#/cart"; return; }
    const pi = promoInfo(S.promo);
    const sub = cartTotal(), d = discountValue(pi);
    const deliv = (sub - d) >= SHOP.freeDeliveryFrom ? 0 : SHOP.deliveryPrice;
    const isCourier = form.delivery === "courier";

    v.innerHTML = `
      <a class="backlink" href="#/cart">${ICON.back()}Корзина</a>
      <div class="sec-head"><h2>Оформление заказа</h2><p>осталось 1 минута</p></div>

      <div class="panel">
        <h3>Ваши данные</h3>
        <div class="field"><label>Имя *</label><input id="f-name" value="${esc(form.name)}" placeholder="Иван" autocomplete="off"><div class="err">Укажите имя</div></div>
        <div class="field"><label>Телефон *</label><input id="f-phone" type="tel" value="${esc(form.phone)}" placeholder="+7 900 000-00-00" autocomplete="off"><div class="err">Введите корректный номер</div></div>
      </div>

      <div class="panel">
        <h3>Самый удобный для вас способ получения</h3>
        <div class="choice-row">
          <div class="choice ${form.delivery === "pickup" ? "on" : ""}" data-choice="delivery" data-val="pickup">
            <b>${ICON.box(15)} Самовывоз</b><span>кабинет Васильевны</span></div>
          <div class="choice ${form.delivery === "courier" ? "on" : ""}" data-choice="delivery" data-val="courier">
            <b>${ICON.truck(15)} Голубиная доставка</b><span>${(sub - d) >= SHOP.freeDeliveryFrom ? "бесплатно" : money(SHOP.deliveryPrice)}</span></div>
          <div class="choice ${form.delivery === "post" ? "on" : ""}" data-choice="delivery" data-val="post">
            <b>${ICON.box(15)} Доставка по РФ</b><span>СДЭК, ПЭК</span></div>
        </div>
        ${isCourier ? `<div class="field" style="margin-top:13px"><label>Адрес доставки</label>
          <input id="f-addr" value="${esc(form.addr)}" placeholder="Город, улица, дом, квартира"><div class="err">Укажите адрес</div></div>` : ""}
      </div>

      <div class="panel">
        <h3>Оплата</h3>
        <div class="choice-row">
          <div class="choice ${form.payment === "card" ? "on" : ""}" data-choice="payment" data-val="card"><b>${ICON.card(15)} Картой</b><span>онлайн или при получении</span></div>
          <div class="choice ${form.payment === "sbp" ? "on" : ""}" data-choice="payment" data-val="sbp"><b>${ICON.cash(15)} СБП</b><span>по QR-коду</span></div>
          <div class="choice ${form.payment === "coins" ? "on" : ""}" data-choice="payment" data-val="coins"><b>${ICON.gear(15)} Монетами «Слава казино»</b><span>принимаются все номиналы</span></div>
        </div>
        <p class="note">${esc(SHOP.paymentNote)}</p>
        <div class="field" style="margin-top:13px"><label>Комментарий</label>
          <textarea id="f-comment" placeholder="Пожелания по комплектующим, удобное время доставки…">${esc(form.comment)}</textarea></div>
      </div>

      <div class="panel">
        <div class="sum"><span>Товары (${cartCount()} шт.)</span><b>${money(sub)}</b></div>
        ${d ? `<div class="sum"><span>Скидка</span><b class="free">−${money(d)}</b></div>` : ""}
        <div class="sum"><span>Доставка</span><b class="${deliv === 0 ? "free" : ""}">${deliv === 0 ? "бесплатно" : money(deliv)}</b></div>
        <div class="sum total"><span>Итого</span><b>${money(sub - d + deliv)}</b></div>
        <label class="hint" style="display:flex;gap:9px;align-items:flex-start;margin:12px 0 0;line-height:1.4">
          <input type="checkbox" id="f-agree" checked style="width:auto;margin-top:2px">
          <span>Согласен с обработкой персональных данных и условиями продажи</span></label>
      </div>

      <button class="btn primary block" id="submit-order" style="padding:16px">${ICON.check(19)}Подтвердить заказ</button>
      <p class="note" style="text-align:center">Мы перезвоним в течение 15 минут для подтверждения. ${ICON.shield(13)} Данные защищены.</p>`;

    $$("[data-choice]").forEach((c) => c.onclick = () => {
      syncForm();
      form[c.dataset.choice] = c.dataset.val;
      if (c.dataset.choice === "delivery") S.lastDelivery = form.delivery;
      if (c.dataset.choice === "payment") S.lastPayment = form.payment;
      save(); render();
    });

    $("#submit-order").onclick = () => {
      const name = $("#f-name").value.trim();
      const phone = $("#f-phone").value.trim();
      const addr = $("#f-addr") ? $("#f-addr").value.trim() : "";
      let ok = true;

      const bad = (id) => { const el = $(id); if (!el) return; el.parentNode.classList.add("bad"); ok = false; };
      const good = (id) => { const el = $(id); if (el) el.parentNode.classList.remove("bad"); };

      name.length < 2 ? bad("#f-name") : good("#f-name");
      phone.replace(/\D/g, "").length < 10 ? bad("#f-phone") : good("#f-phone");
      if (form.delivery === "courier" && addr.length < 5) bad("#f-addr"); else good("#f-addr");

      if (!ok) { toast("Проверьте отмеченные поля", "err"); return; }
      if (!$("#f-agree").checked) { toast("Нужно согласие на обработку данных", "err"); return; }

      const num = "КП-" + String(Date.now()).slice(-6);
      const order = {
        num: num, date: new Date().toLocaleString("ru-RU"),
        name: name, phone: phone, addr: addr,
        delivery: form.delivery, payment: form.payment, comment: form.comment,
        items: S.cart.map((r) => ({ n: product(r.id).name, q: r.q, s: product(r.id).price * r.q })),
        total: sub - d + deliv, discount: d, promo: pi && !pi.error ? S.promo : ""
      };
      S.orders.unshift(order);
      const txt = orderText(order);
      S.cart = []; S.promo = ""; save(); badges();
      S.lastOrder = txt; S.lastOrderNum = num;
      haptic();
      location.hash = "#/success";
      try { if (native) native.share(txt); } catch (e) {}
    };
  }

  function orderText(o) {
    let s = "Заказ " + o.num + " — " + SHOP.domain + "\n";
    s += o.name + ", " + o.phone + "\n";
    s += o.items.map((i) => i.n + " × " + i.q).join("\n") + "\n";
    s += "Итого: " + money(o.total);
    return s;
  }

  /* ================= ЭКРАН: УСПЕХ ================= */
  function viewSuccess(v) {
    const txt = S.lastOrder || "Заказ принят!";
    v.innerHTML = `
      <div class="ok">
        <div class="ring">${ICON.check(40)}</div>
        <h2>Заказ принят!</h2>
        <p>Мы свяжемся с вами в течение 15 минут, чтобы подтвердить заказ и уточнить детали доставки.</p>
        <div class="num">Номер заказа: ${esc(S.lastOrderNum || "КП-000000")}</div>
        <p style="margin-top:14px;font-size:12.5px">${esc(txt.split("\n")[0])}</p>
      </div>
      <div class="panel" style="margin-top:12px">
        <h3>Связаться с нами</h3>
        <a class="btn green block" href="tel:${esc(SHOP.phoneHref)}" style="margin-bottom:9px">${ICON.phone(18)}${esc(SHOP.phone)}</a>
        <a class="btn block" href="${esc(SHOP.telegramHref)}" style="margin-bottom:9px">${ICON.tg(18)}Написать в Telegram</a>
        <a class="btn block" href="https://wa.me/${esc(SHOP.whatsapp)}">${ICON.wa(18)}WhatsApp</a>
      </div>
      <a class="btn ghost block" href="#/home">На главную</a>`;
  }

  /* ================= РЕКЛАМА (раз в 2 минуты, ролик случайный) ================= */
  const AD = {
    every: 30000,    // показывать раз в 30 секунд
    capMs: 90000,    // страховка, если ролик не доиграет
    items: [
      {
        video: "ad/ad.mp4", poster: "img/ad-poster.jpg",
        caption: "Лучшие сборки в Куманцов ПК",
        title: "Куманцов ПК .ru — лучшие сборки",
        note: "Подпишись на канал и получи промокод SUMMER10"
      },
      {
        video: "ad/ad2.mp4", poster: "img/ad-poster2.jpg",
        caption: "Скидки дня",
        title: "Скидки дня в Куманцов ПК",
        note: "Компьютеры от 990 ₽ — остатки со склада"
      },
      {
        video: "ad/ad3.mp4", poster: "img/ad-poster3.jpg",
        caption: "Это свадьба Елены Васильевны",
        title: "Это свадьба Елены Васильевны",
        note: "Свадьба прошла, но рекламу отменить не удалось"
      },
      {
        video: "ad/ad4.mp4", poster: "img/ad-poster4.jpg",
        caption: "БОБИНЬ",
        title: "БОБИНЬ",
        note: "Бобинарь рекламного отдела КумАнцов ПК"
      },
      {
        video: "ad/ad5.mp4", poster: "img/ad-poster5.jpg",
        caption: "Реклама из провинции",
        title: "Реклама из провинции",
        note: "Показываем, даже если никто не смотрит"
      },
      {
        video: "ad/ad6.mp4", poster: "img/ad-poster6.jpg",
        caption: "Минутная реклама",
        title: "Минутная реклама",
        note: "Минута — и снова реклама"
      },
      {
        video: "ad/ad7.mp4", poster: "img/ad-poster7.jpg",
        caption: "Длинная реклама",
        title: "Длинная реклама",
        note: "Ещё немного, и закрытие"
      },
      {
        video: "ad/ad8.mp4", poster: "img/ad-poster8.jpg",
        caption: "Реклама широкоформатная",
        title: "Реклама широкоформатная",
        note: "Горизонтальная, зато честная"
      },
      {
        video: "ad/ad9.mp4", poster: "img/ad-poster9.jpg",
        caption: "Реклама вертикальная",
        title: "Реклама вертикальная",
        note: "Для тех, кто читает в полный экран"
      }
    ]
  };
  let adShownAt = 0, adOpen = false, adTickTimer = null, lastAdIdx = -1;

  /* случайный ролик, но не тот же, что в прошлый раз */
  function pickAd() {
    if (AD.items.length === 1) return 0;
    var i;
    do { i = Math.floor(Math.random() * AD.items.length); } while (i === lastAdIdx);
    lastAdIdx = i;
    return i;
  }

  function showAd() {
    if (adOpen) return;
    adOpen = true;

    var it = AD.items[pickAd()] || AD.items[0];

    var ov = document.createElement("div");
    ov.className = "ad-overlay";
    ov.id = "ad-overlay";
    ov.innerHTML =
      '<div class="ad-box">' +
        '<span class="ad-tag">РЕКЛАМА</span>' +
        '<button class="ad-close" id="ad-x" aria-label="Закрыть">' +
          '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<div class="ad-media">' +
          '<img src="' + it.poster + '" alt="">' +
          '<video id="ad-video" src="' + it.video + '" playsinline preload="auto" webkit-playsinline></video>' +
          '<span class="ad-timer" id="ad-timer"></span>' +
          '<div class="ad-caption">' + esc(it.caption || it.title) + '</div>' +
          '<button class="ad-sound" id="ad-sound" aria-label="Звук">' +
            '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/>' +
            '<path d="M15.5 9a4.2 4.2 0 0 1 0 6"/><path d="M18 6.5a8 8 0 0 1 0 11"/></svg></button>' +
        '</div>' +
        '<div class="ad-foot">' +
          '<b>' + esc(it.title) + '</b>' +
          '<span>' + esc(it.note) + '</span>' +
          '<button class="btn sm ghost block ad-skip" id="ad-skip">Скрыть рекламу</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);

    var tm = $("#ad-timer");
    var v = $("#ad-video");
    var snd = $("#ad-sound");
    var cap = null, endTimer = null;

    // ролик играет до конца, потом закрывается
    function armCap() {
      if (cap) clearTimeout(cap);
      cap = setTimeout(function () { try { v.pause(); } catch (e) { } hide(); }, AD.capMs);
    }
    function hide() {
      if (cap) clearTimeout(cap);
      if (endTimer) clearTimeout(endTimer);
      try { v.pause(); } catch (e) { }
      closeAd();
    }

    tm.textContent = "реклама";
    v.addEventListener("loadedmetadata", function () {
      var d = Math.ceil(v.duration || 0);
      if (d > 0) tm.textContent = "осталось " + d + " с";
    });
    v.addEventListener("timeupdate", function () {
      if (!v.duration) return;
      var left = Math.ceil(v.duration - v.currentTime);
      tm.textContent = left > 0 ? "осталось " + left + " с" : "реклама";
    });
    v.addEventListener("ended", function () {
      if (cap) clearTimeout(cap);
      endTimer = setTimeout(hide, 900);
    });

    var v = $("#ad-video");
    var snd = $("#ad-sound");

    function startVideo() {
      if (!v || !v.src) return;
      try { v.currentTime = 0; } catch (e) { }
      try { v.volume = 1; } catch (e) { }

      // сначала пробуем со звуком
      v.muted = false;
      var pr = v.play();
      if (pr && pr.catch) {
        pr.catch(function () {
          // автозапуск со звуком запрещён системой — откатываемся на беззвучный
          v.muted = true;
          paintSound();
          var p2 = v.play();
          if (p2 && p2.catch) {
            p2.catch(function () {
              v.addEventListener("canplay", function () { try { v.play(); } catch (e) { } }, { once: true });
            });
          }
        });
      }
    }

    function paintSound() {
      if (!snd || !v) return;
      var on = !v.muted;
      snd.innerHTML = on
        ? '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/>' +
          '<path d="M15.5 9a4.2 4.2 0 0 1 0 6"/><path d="M18 6.5a8 8 0 0 1 0 11"/></svg>'
        : '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/>' +
          '<path d="M16 10l4 4M20 10l-4 4"/></svg>';
      snd.classList.toggle("off", !on);
    }

    if (snd) {
      snd.onclick = function () {
        if (!v) return;
        v.muted = !v.muted;
        if (!v.muted) { try { v.play(); } catch (e) { } }
        paintSound();
      };
      paintSound();
    }

    if (v.readyState >= 2) startVideo();
    else v.addEventListener("loadeddata", startVideo, { once: true });
    v.addEventListener("error", function () {
      // видео не пошло — оставляем постер, чтобы не было тёмного квадрата
      tm.textContent = "видео недоступно";
    });
    // если за 2,5 с видео так и не тронулось — показываем постер вместо чёрного поля
    setTimeout(function () {
      if (v && v.currentTime === 0 && v.readyState < 2) tm.textContent = "видео недоступно";
    }, 2500);

    armCap();

    $("#ad-x").onclick = hide;
    $("#ad-skip").onclick = hide;
    ov.addEventListener("click", function (e) { if (e.target === ov) hide(); });
    haptic();
  }

  function closeAd() {
    var ov = $("#ad-overlay");
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    adOpen = false;
  }

  function adTick() {
    if (document.hidden || adOpen) return;
    if (!adShownAt) { adShownAt = Date.now(); return; }
    if (Date.now() - adShownAt >= AD.every) { adShownAt = Date.now(); showAd(); }
  }

  function startAdLoop() {
    if (adTickTimer) clearInterval(adTickTimer);
    adShownAt = Date.now();
    adTickTimer = setInterval(adTick, 5000);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (adTickTimer) { clearInterval(adTickTimer); adTickTimer = null; }
      closeAd();
    } else startAdLoop();
  });

  /* ================= ЭКРАН: МАСТЕР ================= */
  let mForm = { name: "", phone: "", when: "" };

  function viewMaster(v) {
    v.innerHTML = `
      <section class="hero" style="margin-bottom:14px">
        <span class="pill"><i class="dot"></i>${esc(MASTER.workHours)}</span>
        <h1 style="font-size:26px">Вызвать<br><span>мастера</span></h1>
        <p class="lead">Диагностика бесплатно, ремонт в день обращения, гарантия 6 месяцев. Позвоните — мастер перезвонит ${esc(MASTER.responseTime)}.</p>
        <div class="hero-cta">
          <a class="btn primary" href="tel:${esc(SHOP.phoneHref)}">${ICON.phone(19)}${esc(SHOP.phone)}</a>
          <a class="btn ghost" href="#/contacts">${ICON.pin(19)}Контакты</a>
        </div>
      </section>

      <div class="sec-head"><h2>Услуги</h2><p>${SERVICES.length} направления</p></div>
      ${SERVICES.map((s) => `
        <div class="svc-card" data-svc="${s.id}">
          <img class="photo" src="${esc(s.img)}" alt="${esc(s.name)}" data-art="#31c8ff" draggable="false">
          <div class="svc-body">
            <div class="t"><b>${esc(s.name)}</b><em>${esc(s.price)}</em></div>
            <p>${esc(s.short)}</p>
            <ul class="svc-list">
              ${s.items.map((i) => `<li>${ICON.check(15)}<span>${esc(i)}</span></li>`).join("")}
            </ul>
            <p class="svc-note">${esc(s.note)}</p>
          </div>
        </div>`).join("")}

      <div class="sec">
        <div class="sec-head"><h2>Почему нас зовут</h2></div>
        <div class="panel">
          ${MASTER.why.map((w, i) => `<div class="step"><span class="n">${i + 1}</span><div><b>${esc(w.t)}</b><span>${esc(w.d)}</span></div></div>${i < MASTER.why.length - 1 ? '<hr class="sep">' : ''}`).join("")}
        </div>
      </div>

      <div class="sec">
        <div class="sec-head"><h2>Заявка на мастера</h2><p>ответим ${esc(MASTER.responseTime)}</p></div>
        <div class="panel">
          <div class="field"><label>Имя *</label><input id="m-name" value="${esc(mForm.name)}" placeholder="Иван" autocomplete="off"><div class="err">Укажите имя</div></div>
          <div class="field"><label>Телефон *</label><input id="m-phone" type="tel" value="${esc(mForm.phone)}" placeholder="+7 900 000-00-00" autocomplete="off"><div class="err">Введите корректный номер</div></div>
          <div class="field"><label>Что случилось</label><textarea id="m-when" placeholder="Не включается, гудит, пахнет горелым…">${esc(mForm.when)}</textarea></div>
          <button class="btn green block" id="m-send">${ICON.phone(19)}Вызвать мастера</button>
          <p class="note" style="text-align:center">Заявка остаётся в приложении, мастер перезвонит ${esc(MASTER.responseTime)}.</p>
        </div>
      </div>`;

    $("#m-send").onclick = function () {
      var n = $("#m-name").value.trim();
      var p = $("#m-phone").value.trim();
      var ok = true;
      if (n.length < 2) { $("#m-name").parentNode.classList.add("bad"); ok = false; } else $("#m-name").parentNode.classList.remove("bad");
      if (p.replace(/\D/g, "").length < 10) { $("#m-phone").parentNode.classList.add("bad"); ok = false; } else $("#m-phone").parentNode.classList.remove("bad");
      if (!ok) { toast("Проверьте имя и телефон", "err"); return; }
      mForm = { name: n, phone: p, when: $("#m-when").value.trim() };
      S.masterRequests = (S.masterRequests || 0) + 1;
      save(); haptic();
      toast("Заявка принята, мастер перезвонит " + MASTER.responseTime, "ok");
      openShareSheet("Заявка на мастера — " + SHOP.domain + "\n" + n + ", " + p +
        (mForm.when ? "\n" + mForm.when : ""));
    };
  }

  /* ================= ЭКРАН: КОНТРАКТ ================= */
  let cForm = { name: "", phone: "", city: "" };

  function viewContract(v) {
    v.innerHTML = `
      <a class="backlink" href="#/home">${ICON.back()}На главную</a>

      <div class="contract-hero">
        <img class="photo" src="${esc(CONTRACT.img)}" alt="${esc(CONTRACT.title)}" data-art="#00ffa3" draggable="false">
        <div class="veil">
          <h1>${esc(CONTRACT.title)}</h1>
          <p>${esc(CONTRACT.lead)}</p>
        </div>
      </div>

      <div class="pay-badge"><span>Выплата</span><b>${esc(CONTRACT.pay)}</b></div>

      <div class="terms">
        ${CONTRACT.terms.map((t, i) => `<div class="term"><span class="ti">${i + 1}</span><div><b>${esc(t.t)}</b><span>${esc(t.d)}</span></div></div>`).join("")}
      </div>

      <div class="sec">
        <div class="sec-head"><h2>Заявка на контракт</h2></div>
        <div class="panel">
          <div class="field"><label>Имя и фамилия *</label><input id="c-name" value="${esc(cForm.name)}" placeholder="Васильевна" autocomplete="off"><div class="err">Укажите имя</div></div>
          <div class="field"><label>Телефон *</label><input id="c-phone" type="tel" value="${esc(cForm.phone)}" placeholder="+7 900 000-00-00" autocomplete="off"><div class="err">Введите корректный номер</div></div>
          <div class="field"><label>Город</label><input id="c-city" value="${esc(cForm.city)}" placeholder="г. Москва" autocomplete="off"></div>
          <button class="btn green block" id="c-send">${ICON.check(19)}Оставить заявку</button>
          <p class="note" style="text-align:center">Заявка сохраняется в приложении. Компьютер выдаётся лично, форму — на почте.</p>
        </div>
      </div>

      <div class="sec">
        <div class="sec-head"><h2>${ICON.tag(14)} Образец объявления</h2></div>
        <div class="svc-card" style="cursor:default">
          <img class="photo" src="img/po-kontraktu.jpg" alt="Образец объявления" data-art="#ff3d81" draggable="false">
        </div>
      </div>

      <a class="btn ghost block" href="#/catalog" style="margin-top:12px">${ICON.grid(18)}Смотреть компьютеры</a>`;

    $("#c-send").onclick = function () {
      var n = $("#c-name").value.trim();
      var p = $("#c-phone").value.trim();
      var ok = true;
      if (n.length < 2) { $("#c-name").parentNode.classList.add("bad"); ok = false; } else $("#c-name").parentNode.classList.remove("bad");
      if (p.replace(/\D/g, "").length < 10) { $("#c-phone").parentNode.classList.add("bad"); ok = false; } else $("#c-phone").parentNode.classList.remove("bad");
      if (!ok) { toast("Проверьте имя и телефон", "err"); return; }
      cForm = { name: n, phone: p, city: $("#c-city").value.trim() };
      S.contractRequests = (S.contractRequests || 0) + 1;
      save(); haptic();
      toast("Заявка на контракт принята", "ok");
      openShareSheet("Заявка на службу по контракту — " + SHOP.domain + "\n" +
        n + ", " + p + (cForm.city ? ", " + cForm.city : "") + "\nВыплата: " + CONTRACT.pay);
    };
  }

  /* ================= ЭКРАН: КОНТАКТЫ ================= */
  function viewContacts(v) {
    v.innerHTML = `
      <div class="sec-head"><h2>Контакты</h2><p>${esc(SHOP.workHours)}</p></div>
      <div class="contact-card"><span class="ci">${ICON.phone()}</span><div><b>${esc(SHOP.phone)}</b><span>Звонок бесплатный</span></div>
        <a class="icon-btn" href="tel:${esc(SHOP.phoneHref)}" style="margin-left:auto">${ICON.phone(19)}</a></div>
      <div class="contact-card"><span class="ci">${ICON.tg()}</span><div><b>@${esc(SHOP.telegram)}</b><span>Ответим в Telegram</span></div>
        <a class="icon-btn" href="${esc(SHOP.telegramHref)}" style="margin-left:auto">${ICON.tg(19)}</a>
        <a class="icon-btn" href="${esc(SHOP.telegramHref)}" style="margin-left:6px">${ICON.tg(19)}</a></div>
      <div class="contact-card"><span class="ci">${ICON.wa()}</span><div><b>WhatsApp</b><span>Сообщения и фото комплектующих</span></div>
        <a class="icon-btn" href="https://wa.me/${esc(SHOP.whatsapp)}" style="margin-left:auto">${ICON.wa(19)}</a></div>
      <div class="contact-card"><span class="ci">${ICON.mail()}</span><div><b>${esc(SHOP.email)}</b><span>Для юрлиц и документов</span></div>
        <a class="icon-btn" href="mailto:${esc(SHOP.email)}" style="margin-left:auto">${ICON.mail(19)}</a></div>
      <div class="contact-card"><span class="ci">${ICON.pin()}</span><div><b>${esc(SHOP.address)}</b><span>Самовывоз по записи</span></div></div>

      <div class="sec">
        <div class="sec-head"><h2>Как заказать</h2></div>
        <div class="panel">
          <div class="step"><span class="n">1</span><div><b>Выберите ПК</b><span>Из каталога или соберите свой через конфигуратор.</span></div></div>
          <hr class="sep">
          <div class="step"><span class="n">2</span><div><b>Оформите заказ</b><span>Корзина → данные → способ доставки и оплаты.</span></div></div>
          <hr class="sep">
          <div class="step"><span class="n">3</span><div><b>Мы перезваниваем</b><span>Уточняем детали и подтверждаем заказ.</span></div></div>
          <hr class="sep">
          <div class="step"><span class="n">4</span><div><b>Сборка и тест</b><span>48 часов стресс-тестов и стабилизации.</span></div></div>
          <hr class="sep">
          <div class="step"><span class="n">5</span><div><b>Доставка и гарантия</b><span>Доставляем, настраиваем, даём гарантию ${esc(SHOP.warranty)}.</span></div></div>
        </div>
      </div>

      <div class="sec">
        <div class="sec-head"><h2>Гарантия и сервис</h2></div>
        <div class="panel">
          <div class="kv"><span>Гарантия</span><b>${esc(SHOP.warranty)}</b></div>
          <div class="kv"><span>Тест перед отправкой</span><b>48 часов</b></div>
          <div class="kv"><span>Гарантийный сервис</span><b>${esc(SHOP.inn)}</b></div>
          <div class="kv"><span>Документы</span><b>Чек и гарантийный талон</b></div>
        </div>
      </div>`;
  }

  /* ================= ЭКРАН: КОНФИГУРАТОР ================= */
  let cfg = { purpose: "games2k", budget: 110000, ram: 1, ssd: 1, cool: 1, case: 1, extras: [] };

  function buildCfg(budget, purpose) {
    const P = CFG.purposes.filter((p) => p.id === purpose)[0] || CFG.purposes[2];
    let cpuShare = Math.max(0.14, 1 - P.gpu - 0.24), gpuShare = P.gpu, rest = 0.24;

    const pick = (arr, target) => {
      let best = arr[0];
      for (const a of arr) if (a.p <= target) best = a;
      return best;
    };
    const mbo = budget < 70000 ? CFG.parts.mbo[0] : budget < 120000 ? CFG.parts.mbo[1] : budget < 200000 ? CFG.parts.mbo[2] : CFG.parts.mbo[3];
    const free = budget - mbo.p;
    const cpu = pick(CFG.parts.cpu, Math.max(free * cpuShare, 8000));
    const gpu = pick(CFG.parts.gpu, Math.max(free * gpuShare, 0));
    const ram = pick(CFG.parts.ram, free * 0.14);
    const ssd = pick(CFG.parts.ssd, free * 0.10);
    const psu = gpu.p >= 90000 ? CFG.parts.psu[2] : gpu.p >= 30000 ? CFG.parts.psu[1] : CFG.parts.psu[0];
    const cool = gpu.p >= 70000 ? CFG.parts.cool[2] : cfg.cool === 3 ? CFG.parts.cool[3] : CFG.parts.cool[1];
    const cs = budget < 60000 ? CFG.parts.case[0] : cfg.case === 2 ? CFG.parts.case[2] : CFG.parts.case[1];

    const core = [cpu, gpu, ram, ssd, mbo, psu, cool, cs];
    const coreSum = core.reduce((a, b) => a + b.p, 0);
    const extras = cfg.extras.map((id) => CFG.extras.filter((e) => e.id === id)[0]).filter(Boolean);
    const extraSum = extras.reduce((a, b) => a + b.p, 0);
    const total = coreSum + extraSum + SHOP.assemblyPrice;

    return {
      title: "ПК " + money(budget) + " · " + P.name,
      parts: core, extras: extras, sum: total, coreSum: coreSum, extraSum: extraSum,
      diff: total - budget,
      labels: ["Процессор", "Видеокарта", "Оперативная память", "SSD", "Материнская плата", "Блок питания", "Охлаждение", "Корпус"]
    };
  }

  function viewConfigurator(v) {
    const r = buildCfg(cfg.budget, cfg.purpose);
    v.innerHTML = `
      <a class="backlink" href="#/home">${ICON.back()}На главную</a>
      <div class="sec-head"><h2>${ICON.gear(18)} Конфигуратор</h2><p>Соберём ПК под ваш бюджет</p></div>

      <div class="panel">
        <h3>Задача</h3>
        <div class="choice-row">
          ${CFG.purposes.map((p) => `<div class="choice ${cfg.purpose === p.id ? "on" : ""}" data-pur="${p.id}">${esc(p.name)}</div>`).join("")}
        </div>
      </div>

      <div class="panel">
        <h3>Бюджет</h3>
        <div class="budget-val" id="budget-val">${money(cfg.budget)}</div>
        <input class="slider" type="range" id="budget" min="${CFG.min}" max="${CFG.max}" step="${CFG.step}" value="${cfg.budget}">
        <div style="display:flex;justify-content:space-between" class="hint"><span>${money(CFG.min)}</span><span>${money(CFG.max)}</span></div>
      </div>

      <div class="panel">
        <h3>Дополнительно</h3>
        <div class="choice-row">
          ${CFG.extras.map((e) => `<div class="choice ${cfg.extras.indexOf(e.id) >= 0 ? "on" : ""}" data-extra="${e.id}">
            <b>${esc(e.name)}</b><span>+${money(e.p)}</span></div>`).join("")}
        </div>
      </div>

      <div class="cfg-result">
        <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">
          <div style="font-size:20px;font-weight:900">Ваша сборка</div>
          <div style="margin-left:auto;font-size:22px;font-weight:900">${money(r.sum)}</div>
        </div>
        <p class="note" style="margin:6px 0 0">${r.diff > 0 ? "Чтобы уложиться в бюджет, можно убрать доп. опции или уменьшить бюджет на " + money(r.diff) + "." : "Укладывается в бюджет " + money(Math.abs(r.diff)) + "."}</p>
        <ul class="cfg-list">
          ${r.parts.map((p, i) => `<li><span>${esc(r.labels[i])}</span><b>${esc(p.n)}<br><small style="color:var(--muted);font-weight:600">${esc(p.c)} · ${money(p.p)}</small></b></li>`).join("")}
          ${r.extras.map((e) => `<li><span>Доп. опция</span><b>${esc(e.name)} · ${money(e.p)}</b></li>`).join("")}
          <li><span>Сборка и настройка</span><b>${money(SHOP.assemblyPrice)}</b></li>
        </ul>
        <div class="actions">
          <button class="btn green" id="cfg-order">${ICON.cart(19)}В заказ</button>
          <button class="btn ghost" id="cfg-share">${ICON.tg(19)}Отправить</button>
        </div>
      </div>

      <div class="sec">
        <div class="sec-head"><h2>Как это работает</h2></div>
        <div class="panel">
          <div class="step"><span class="n">1</span><div><b>Подбираем комплектующие</b><span>Считаем бюджет и распределяем его между CPU, GPU и остальным.</span></div></div>
          <hr class="sep">
          <div class="step"><span class="n">2</span><div><b>Согласовываем состав</b><span>Меняем детали по вашему желанию — напишите менеджеру.</span></div></div>
          <hr class="sep">
          <div class="step"><span class="n">3</span><div><b>Собираем и тестируем</b><span>48 часов стресс-тестов, гарантия ${esc(SHOP.warranty)}.</span></div></div>
        </div>
      </div>`;

    const upd = () => {
      const r2 = buildCfg(cfg.budget, cfg.purpose);
      $("#budget-val").textContent = money(cfg.budget);
      const box = $(".cfg-result");
      box.innerHTML = `<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">
          <div style="font-size:20px;font-weight:900">Ваша сборка</div>
          <div style="margin-left:auto;font-size:22px;font-weight:900">${money(r2.sum)}</div></div>
        <p class="note" style="margin:6px 0 0">${r2.diff > 0 ? "Чтобы уложиться в бюджет, можно убрать доп. опции или уменьшить бюджет на " + money(r2.diff) + "." : "Укладывается в бюджет " + money(Math.abs(r2.diff)) + "."}</p>
        <ul class="cfg-list">${r2.parts.map((p, i) => `<li><span>${esc(r2.labels[i])}</span><b>${esc(p.n)}<br><small style="color:var(--muted);font-weight:600">${esc(p.c)} · ${money(p.p)}</small></b></li>`).join("")}
          ${r2.extras.map((e) => `<li><span>Доп. опция</span><b>${esc(e.name)} · ${money(e.p)}</b></li>`).join("")}
          <li><span>Сборка и настройка</span><b>${money(SHOP.assemblyPrice)}</b></li></ul>
        <div class="actions">
          <button class="btn green" id="cfg-order">${ICON.cart(19)}В заказ</button>
          <button class="btn ghost" id="cfg-share">${ICON.tg(19)}Отправить</button></div>`;
      bindArt();
      bindResult(r2);
    };

    $$("[data-pur]").forEach((c) => c.onclick = () => { cfg.purpose = c.dataset.pur; render(); });
    $$("[data-extra]").forEach((c) => c.onclick = () => {
      const id = c.dataset.extra, i = cfg.extras.indexOf(id);
      if (i >= 0) cfg.extras.splice(i, 1); else cfg.extras.push(id);
      render();
    });
    $("#budget").oninput = (e) => { cfg.budget = +e.target.value; upd(); };
    bindResult(r);
  }

  function bindResult(r) {
    const txt = "Сборка ПК от " + SHOP.domain + " — " + money(r.sum) + "\n" +
      r.parts.map((p, i) => r.labels[i] + ": " + p.n).join("\n") +
      (r.extras.length ? "\n" + r.extras.map((e) => e.name).join("\n") : "");
    const add = $("#cfg-order"), share = $("#cfg-share");
    if (add) add.onclick = () => {
      const custom = {
        id: "custom-" + Date.now(), cat: "game", name: "Сборка на заказ " + money(r.sum),
        tag: "Конфигуратор", price: r.sum, old: 0, rating: 5, reviews: 0,
        art: "#00ffa3", stock: 99, short: "Индивидуальная конфигурация",
        specs: {}, feat: ["Гарантия " + SHOP.warranty], custom: true
      };
      r.labels.forEach((l, i) => custom.specs[l] = r.parts[i].n + " — " + r.parts[i].c);
      r.extras.forEach((e) => custom.specs[e.name] = "включено");
      custom.specs["Стоимость сборки"] = "уже включена в цену";
      if (!PRODUCTS.some((p) => p.id === custom.id)) PRODUCTS.unshift(custom);
      addToCart(custom.id);
      location.hash = "#/cart";
    };
    if (share) share.onclick = () => {
      try { if (native) { native.share(txt); return; } } catch (e) {}
      openShareSheet(txt);
    };
  }

  /* ---------------- bottom sheet «поделиться» ---------------- */
  function openShareSheet(txt) {
    const b = $("#sheet-backdrop"), sh = $("#sheet");
    $("#sheet-body").innerHTML = `
      <h3 style="margin:0 0 14px;font-size:17px">Отправить заявку</h3>
      <a class="btn block" href="${esc(SHOP.telegramHref)}" style="margin-bottom:9px" data-close>${ICON.tg(18)}Telegram</a>
      <a class="btn block" href="https://wa.me/${esc(SHOP.whatsapp)}" style="margin-bottom:9px" data-close>${ICON.wa(18)}WhatsApp</a>
      <a class="btn block" href="mailto:${esc(SHOP.email)}?subject=${encodeURIComponent("Заявка с сайта")}&body=${encodeURIComponent(txt)}" style="margin-bottom:9px" data-close>${ICON.mail(18)}Почта</a>
      <a class="btn green block" href="tel:${esc(SHOP.phoneHref)}" data-close>${ICON.phone(18)}Позвонить</a>
      <button class="btn ghost block" id="sheet-copy" style="margin-top:9px">Скопировать текст</button>
      <button class="btn ghost block" id="sheet-close" style="margin-top:9px">Закрыть</button>`;
    b.hidden = false; sh.hidden = false;
    b.onclick = closeSheet;
    $("#sheet-close").onclick = closeSheet;
    $("#sheet-copy").onclick = () => {
      try { navigator.clipboard.writeText(txt); toast("Скопировано", "ok"); } catch (e) { toast("Не удалось скопировать", "err"); }
      closeSheet();
    };
  }
  function closeSheet() { $("#sheet").hidden = true; $("#sheet-backdrop").hidden = true; }

  /* ---------------- поиск ---------------- */
  function openSearch() {
    state.search = true;
    const sb = $("#searchbar");
    sb.hidden = false;
    const inp = $("#search-input");
    inp.value = state.q;
    $("#btn-search").classList.add("on");
    setTimeout(() => inp.focus(), 120);
    drawGrid();
  }
  function closeSearch() {
    state.search = false;
    state.q = "";
    $("#searchbar").hidden = true;
    $("#search-input").value = "";
    $("#btn-search").classList.remove("on");
    drawGrid();
  }

  /* ---------------- слушатели ---------------- */
  $("#btn-search").onclick = () => (state.search ? closeSearch() : openSearch());
  $("#search-close").onclick = closeSearch;
  $("#search-input").addEventListener("input", (e) => { state.q = e.target.value; drawGrid(); });

  document.addEventListener("click", (e) => {
    const fav = e.target.closest("[data-fav]");
    if (fav) { e.preventDefault(); e.stopPropagation(); toggleFav(fav.dataset.fav); }
  }, true);

  window.addEventListener("hashchange", () => {
    if (location.hash.indexOf("catalog") < 0 && state.search) closeSearch();
    go();
  });

  /* ---------------- старт ---------------- */
  form.delivery = S.lastDelivery || "pickup";
  form.payment = S.lastPayment || "card";
  badges();
  if (!location.hash) location.hash = "#/home";
  go();
  moveIndicator();
  startAdLoop();
  window.addEventListener("resize", moveIndicator);
})();