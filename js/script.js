'use strict';

/* ==============================
   GOOD TIME BURGER テイクアウト注文（デモ）
   ※実際の注文送信・決済は行いません
============================== */

document.addEventListener('DOMContentLoaded', () => {

  // 視差効果を減らす設定
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const yen = (n) => '¥' + n.toLocaleString('ja-JP');
  const flat = (s) => s.replace(/\n/g, '');

  const ICON_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  const ICON_CUP = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M12 16h24l-3 26H15z"/><path d="M10 16h28M26 16l4-11 6 1"/><path d="M14 26h20"/></svg>';


  // ------------------------------
  // 商品データ（メニュー表より）
  // ------------------------------
  const SET_DRINKS = ['コーヒー（アイス）', 'コーヒー（ホット）', '紅茶（アイス）', '紅茶（ホット）', '炭酸水', 'オレンジジュース', 'グレープジュース'];

  const SETS = [
    { id: 'single', name: '単品', add: 0, drink: false },
    { id: 'd', name: 'ドリンクSET', add: 350, drink: true },
    { id: 'pd', name: 'ポテト・ドリンクSET', add: 550, drink: true },
    { id: 'pds', name: 'ポテト・ドリンク・サラダSET', add: 1100, drink: true },
  ];

  // トッピング（デモ用の仮設定）
  const TOPPINGS = [
    { id: 'cheese', name: 'チーズ追加', add: 100 },
    { id: 'bacon', name: 'ベーコン追加', add: 150 },
    { id: 'avocado', name: 'アボカド追加', add: 150 },
    { id: 'egg', name: '目玉焼き', add: 100 },
    { id: 'jalapeno', name: 'ハラペーニョ', add: 80 },
  ];

  const ITEMS = {
    b1: { name: 'アボカドとベーコンの\nスペシャルバーガー', price: 880, img: 'burger-avocado', shape: 'cut', burger: true },
    b2: { name: 'プリプリ海老カツの\nグリルチーズバーガー', price: 990, img: 'burger-ebi', shape: 'cut', burger: true },
    b3: { name: '照り焼きチキンの\nダブルバーガー', price: 880, img: 'burger-teriyaki', shape: 'cut', burger: true },
    b4: { name: '粗挽きビーフとチーズの\nクラシックバーガー', price: 990, img: 'burger-beef', shape: 'cut', burger: true },
    s1: { name: 'フレンチフライの\nハーブソルト仕立て', price: 880, img: 'side-fries', shape: 'pill' },
    s2: { name: 'サクサクイカフライの\nバスケット', price: 990, img: 'side-squid', shape: 'pill' },
    s3: { name: 'サクサクチキン\n〈1ピース〉', price: 880, img: 'side-chicken', shape: 'pill' },
    s4: { name: 'スパイシーシュリンプの\nチリマヨフリット', price: 990, img: 'side-shrimp', shape: 'pill' },
    d1: { name: '焼きたてチェリーパイと\nバニラアイス', price: 880, img: 'dessert-cherrypie', shape: 'pill' },
    d2: { name: '濃厚チョコレート\nナッツブラウニー', price: 990, img: 'dessert-brownie', shape: 'pill' },
    d3: { name: '特製クラシック\nプリン', price: 880, img: 'dessert-pudding', shape: 'pill' },
    k1: { name: '昔ながらの\nクリームソーダ', price: 880, img: 'drink-creamsoda', shape: 'cut' },
    k2: { name: 'しゅわっとレモンの\nクラフトレモネード', price: 990, img: 'drink-lemonade', shape: 'cut' },
    k3: { name: '濃厚チョコレートの\nシェイク', price: 880, img: 'drink-shake', shape: 'cut' },
    k4: { name: 'フルーツ\nスペシャルパフェ', price: 990, img: 'drink-parfait', shape: 'cut' },
    x1: { name: 'コーヒー', price: 550, temp: true },
    x2: { name: '紅茶', price: 550, temp: true },
    x3: { name: '炭酸水', price: 550 },
    x4: { name: 'オレンジジュース', price: 550 },
    x5: { name: 'グレープジュース', price: 550 },
  };
  const imgPath = (it) => `./img/${it.img}.webp`;


  // ------------------------------
  // 写真が読み込めないときの表示
  // ------------------------------
  const watchImage = (img) => {
    const mark = () => img.parentElement.classList.add('is-error');
    if (img.complete && img.naturalWidth === 0) mark();
    img.addEventListener('error', mark);
  };
  $$('.menu__img img').forEach(watchImage);


  // ------------------------------
  // 商品カードのスクロールアニメーション
  // ------------------------------
  if ('IntersectionObserver' in window && !RM) {
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-wait');
        entry.target.classList.add('is-show');
        cardObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    $$('.js-popUp').forEach((card) => {
      // 最初の画面に見えているカードはそのまま表示
      if (card.getBoundingClientRect().top > window.innerHeight) {
        card.classList.add('is-wait');
        cardObserver.observe(card);
      }
    });
  }


  // ------------------------------
  // カテゴリタブ（クリックでスクロール・現在地を強調）
  // ------------------------------
  const tabs = $('#js-tabs');
  const sections = $$('.js-menu-section');
  const offsetTop = () => $('#js-header').offsetHeight + tabs.offsetHeight;
  let spyLock = 0;

  const setTab = (id) => {
    tabs.querySelectorAll('.tabs__item').forEach((tab) => {
      const on = tab.dataset.target === id;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-current', on);
      if (on) {
        const left = tab.offsetLeft - 16;
        const right = left + tab.offsetWidth + 32;
        if (left < tabs.scrollLeft || right > tabs.scrollLeft + tabs.clientWidth) {
          tabs.scrollTo({ left: left - 20, behavior: RM ? 'auto' : 'smooth' });
        }
      }
    });
  };

  tabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.tabs__item');
    if (!tab) return;
    const target = document.getElementById(tab.dataset.target);
    setTab(tab.dataset.target);
    spyLock = Date.now() + 900;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offsetTop() + 2, behavior: RM ? 'auto' : 'smooth' });
  });

  let ticking = false;
  const spy = () => {
    ticking = false;
    if (Date.now() < spyLock || $('#js-view-menu').hidden) return;
    const line = offsetTop() + 40;
    let current = sections[0].id;
    sections.forEach((sec) => {
      if (sec.getBoundingClientRect().top <= line) current = sec.id;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = sections[sections.length - 1].id;
    }
    setTab(current);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(spy);
    }
  }, { passive: true });

  $('#js-logo').addEventListener('click', () => {
    showView('menu');
    window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
  });


  // ------------------------------
  // カート（データ・計算）
  // ------------------------------
  let cart = [];

  const lineKey = (l) => [l.id, l.set || '', l.drink || '', l.temp || '', (l.tops || []).slice().sort().join('+')].join('|');

  const unitPrice = (l) => {
    let price = ITEMS[l.id].price;
    if (l.set) price += SETS.find((s) => s.id === l.set).add;
    (l.tops || []).forEach((t) => { price += TOPPINGS.find((x) => x.id === t).add; });
    return price;
  };

  const optionText = (l) => {
    const list = [];
    if (l.temp) list.push(l.temp);
    if (l.set && l.set !== 'single') list.push(SETS.find((s) => s.id === l.set).name);
    else if (ITEMS[l.id].burger) list.push('単品');
    if (l.drink) list.push('ドリンク：' + l.drink);
    if (l.tops && l.tops.length) list.push('トッピング：' + l.tops.map((t) => TOPPINGS.find((x) => x.id === t).name).join('・'));
    return list.join(' ／ ');
  };

  const lineName = (l) => flat(ITEMS[l.id].name);
  const count = () => cart.reduce((sum, l) => sum + l.qty, 0);
  const total = () => cart.reduce((sum, l) => sum + unitPrice(l) * l.qty, 0);

  const addLine = (line) => {
    const key = lineKey(line);
    const same = cart.find((l) => lineKey(l) === key);
    if (same) same.qty = Math.min(99, same.qty + line.qty);
    else cart.push(line);
    renderCart();
  };


  // ------------------------------
  // カート（表示）
  // ------------------------------
  const cartList = $('#js-cart-list');

  const renderCart = () => {
    const n = count();
    const badge = $('#js-cart-badge');
    badge.textContent = n;
    badge.classList.toggle('is-zero', n === 0);
    $('#js-cart-btn').setAttribute('aria-label', `カートを開く（${n}点）`);
    $('#js-cart-count').textContent = n + '点';
    $('#js-sum-qty').textContent = n;
    $('#js-sum-sub').textContent = yen(total());
    $('#js-sum-total').textContent = yen(total());
    $('#js-to-confirm').disabled = n === 0;

    // カートが空のとき
    if (!cart.length) {
      cartList.innerHTML = `
        <div class="cart__empty">
          <p class="cart__empty-script">empty!</p>
          <p class="cart__empty-text">カートは空です。</p>
          <p class="cart__empty-text">メニューの <span class="cart__empty-icon">${ICON_PLUS}</span> ボタンか、<br>商品をタップして追加してください。</p>
          <button class="btn btn--ghost cart__empty-btn" type="button" id="js-empty-back">メニューを見る</button>
        </div>`;
      $('#js-empty-back').addEventListener('click', closeCart);
      return;
    }

    cartList.innerHTML = cart.map((l, i) => {
      const it = ITEMS[l.id];
      const img = it.img
        ? `<div class="cart__img${it.shape === 'pill' ? ' cart__img--pill' : ''}"><img src="${imgPath(it)}" alt=""></div>`
        : `<div class="cart__img"><span class="menu__icon">${ICON_CUP}</span></div>`;
      const opt = optionText(l);
      return `
        <div class="cart__item" data-index="${i}">
          ${img}
          <div class="cart__body">
            <p class="cart__name">${lineName(l)}</p>
            ${opt ? `<p class="cart__option">${opt}</p>` : ''}
            <p class="cart__option">単価 ${yen(unitPrice(l))}</p>
            <div class="cart__row">
              <div class="qty qty--small" role="group" aria-label="${lineName(l)}の数量">
                <button class="qty__btn" type="button" data-act="dec" aria-label="1つ減らす">−</button>
                <output class="qty__num">${l.qty}</output>
                <button class="qty__btn" type="button" data-act="inc" aria-label="1つ増やす" ${l.qty >= 99 ? 'disabled' : ''}>＋</button>
              </div>
              <span class="cart__subtotal">${yen(unitPrice(l) * l.qty)}</span>
            </div>
            <button class="cart__delete" type="button" data-act="del">削除する</button>
          </div>
        </div>`;
    }).join('');
  };

  const removeLine = (row, i) => {
    if (RM) {
      cart.splice(i, 1);
      renderCart();
      return;
    }
    row.classList.add('is-remove');
    setTimeout(() => {
      cart.splice(i, 1);
      renderCart();
    }, 280);
  };

  cartList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const row = btn.closest('.cart__item');
    const i = Number(row.dataset.index);
    const line = cart[i];
    if (btn.dataset.act === 'inc') {
      line.qty = Math.min(99, line.qty + 1);
      renderCart();
    }
    if (btn.dataset.act === 'dec') {
      if (line.qty > 1) {
        line.qty--;
        renderCart();
      } else {
        removeLine(row, i);
      }
    }
    if (btn.dataset.act === 'del') removeLine(row, i);
  });


  // ------------------------------
  // 暗幕・カートの開閉
  // ------------------------------
  const overlay = $('#js-overlay');
  const detail = $('#js-detail');
  const cartPanel = $('#js-cart');
  let lastFocus = null;

  const lockScroll = (on) => document.body.classList.toggle('is-fixed', on);

  const openCart = () => {
    closeDetail(true);
    lastFocus = document.activeElement;
    cartPanel.classList.add('is-open');
    overlay.classList.add('is-open');
    lockScroll(true);
    setTimeout(() => $('#js-cart-close').focus(), 50);
  };

  const closeCart = () => {
    if (!cartPanel.classList.contains('is-open')) return;
    cartPanel.classList.remove('is-open');
    overlay.classList.remove('is-open');
    lockScroll(false);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  };

  $('#js-cart-btn').addEventListener('click', openCart);
  $('#js-cart-close').addEventListener('click', closeCart);
  overlay.addEventListener('click', () => {
    closeDetail();
    closeCart();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (detail.classList.contains('is-open')) closeDetail();
    else closeCart();
  });


  // ------------------------------
  // 商品詳細（下からせり上がる）
  // ------------------------------
  const detailBody = $('#js-detail-body');
  let current = null;

  const detailImage = (it) => {
    if (!it.img) return `<div class="detail__img detail__img--icon"><span class="menu__icon">${ICON_CUP}</span></div>`;
    return `<div class="detail__img detail__img--${it.shape}"><img src="${imgPath(it)}" alt="${flat(it.name)}"></div>`;
  };

  const openDetail = (id) => {
    const it = ITEMS[id];
    lastFocus = document.activeElement;
    current = { id, qty: 1, tops: [] };
    if (it.burger) {
      current.set = 'single';
      current.drink = SET_DRINKS[0];
    }
    if (it.temp) current.temp = 'アイス';

    let html = detailImage(it);
    html += `<h2 class="detail__name" id="js-detail-name">${it.name.replace(/\n/g, '<br>')}</h2>`;
    html += `<p class="detail__price">${yen(it.price)}</p>`;

    // ホット／アイス
    if (it.temp) {
      html += `
        <fieldset class="detail__group">
          <legend class="detail__legend">TEMP<small class="detail__legend-sub">アイス or ホット</small></legend>
          <div class="detail__options detail__options--two">
            ${['アイス', 'ホット'].map((t, i) => `<label class="option"><input class="option__input" type="radio" name="temp" value="${t}" ${i ? '' : 'checked'}><span class="option__label">${t}</span></label>`).join('')}
          </div>
        </fieldset>`;
    }

    // バーガー：セット・ドリンク・トッピング
    if (it.burger) {
      html += `
        <fieldset class="detail__group">
          <legend class="detail__legend">SET<small class="detail__legend-sub">単品／VALUE SET</small></legend>
          <div class="detail__options">
            ${SETS.map((s, i) => `<label class="option"><input class="option__input" type="radio" name="set" value="${s.id}" ${i ? '' : 'checked'}><span class="option__label">${s.name}<span class="option__price">${s.add ? '+' + yen(s.add) : '±¥0'}</span></span></label>`).join('')}
          </div>
        </fieldset>
        <div id="js-drink-slot"></div>
        <fieldset class="detail__group">
          <legend class="detail__legend">TOPPING<small class="detail__legend-sub">複数選択できます</small></legend>
          <p class="detail__demo">※トッピングはデモ用の仮設定です</p>
          <div class="detail__options detail__options--two">
            ${TOPPINGS.map((t) => `<label class="option"><input class="option__input" type="checkbox" name="top" value="${t.id}"><span class="option__label">${t.name}<span class="option__price">+${yen(t.add)}</span></span></label>`).join('')}
          </div>
        </fieldset>`;
    }

    detailBody.innerHTML = html;
    detailBody.scrollTop = 0;
    updateDetail();
    detail.classList.add('is-open');
    overlay.classList.add('is-open');
    lockScroll(true);
    setTimeout(() => $('#js-detail-close').focus(), 60);
  };

  // ドリンク付きのセットを選んだときだけドリンクを表示
  const renderDrinks = () => {
    const slot = $('#js-drink-slot');
    if (!slot) return;
    const needDrink = SETS.find((s) => s.id === current.set).drink;
    if (!needDrink) {
      slot.innerHTML = '';
      return;
    }
    if (slot.firstChild) return;
    slot.innerHTML = `
      <fieldset class="detail__group detail__drink">
        <legend class="detail__legend">DRINK<small class="detail__legend-sub">セットのドリンクを選択</small></legend>
        <div class="detail__options detail__options--two">
          ${SET_DRINKS.map((d) => `<label class="option"><input class="option__input" type="radio" name="drink" value="${d}" ${d === current.drink ? 'checked' : ''}><span class="option__label">${d}</span></label>`).join('')}
        </div>
      </fieldset>`;
  };

  // 選んだ内容と数量で金額を更新
  const updateDetail = () => {
    renderDrinks();
    $('#js-qty-num').textContent = current.qty;
    $('#js-qty-minus').disabled = current.qty <= 1;
    $('#js-qty-plus').disabled = current.qty >= 99;
    $('#js-detail-price').textContent = yen(unitPrice(current) * current.qty);
  };

  detailBody.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'set') current.set = t.value;
    if (t.name === 'drink') current.drink = t.value;
    if (t.name === 'temp') current.temp = t.value;
    if (t.name === 'top') current.tops = [...detailBody.querySelectorAll('input[name=top]:checked')].map((x) => x.value);
    updateDetail();
  });

  $('#js-qty-minus').addEventListener('click', () => {
    if (current.qty > 1) {
      current.qty--;
      updateDetail();
    }
  });
  $('#js-qty-plus').addEventListener('click', () => {
    if (current.qty < 99) {
      current.qty++;
      updateDetail();
    }
  });

  const closeDetail = (silent) => {
    if (!detail.classList.contains('is-open')) return;
    detail.classList.remove('is-open');
    if (!cartPanel.classList.contains('is-open')) {
      overlay.classList.remove('is-open');
      lockScroll(false);
    }
    if (!silent && lastFocus && document.contains(lastFocus)) lastFocus.focus();
  };
  $('#js-detail-close').addEventListener('click', () => closeDetail());

  // カートに入れる
  $('#js-detail-add').addEventListener('click', () => {
    const line = { id: current.id, qty: current.qty, tops: current.tops.slice() };
    if (current.set) {
      line.set = current.set;
      if (SETS.find((s) => s.id === current.set).drink) line.drink = current.drink;
    }
    if (current.temp) line.temp = current.temp;
    const src = detailBody.querySelector('.detail__img img, .menu__icon');
    addLine(line);
    flyToCart(src, ITEMS[current.id]);
    closeDetail(true);
  });


  // ------------------------------
  // 商品カードのクリック（詳細を開く／＋ですぐ追加）
  // ------------------------------
  const menuWrap = $('#js-view-menu');

  menuWrap.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      e.stopPropagation();
      const id = addBtn.dataset.add;
      const it = ITEMS[id];
      // ホット／アイスを選ぶ商品は詳細を開く
      if (it.temp) {
        openDetail(id);
        return;
      }
      const line = { id, qty: 1, tops: [] };
      if (it.burger) line.set = 'single';
      addLine(line);
      flyToCart(addBtn.closest('.menu__card').querySelector('.menu__img img, .menu__icon'), it);
      return;
    }
    const card = e.target.closest('.menu__card');
    if (card) openDetail(card.dataset.id);
  });

  menuWrap.addEventListener('keydown', (e) => {
    const card = e.target.closest && e.target.closest('.menu__card');
    if (card && e.target === card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openDetail(card.dataset.id);
    }
  });


  // ------------------------------
  // カートへ飛ぶアニメーション＋紙吹雪
  // ------------------------------
  const bumpBadge = () => {
    const badge = $('#js-cart-badge');
    const btn = $('#js-cart-btn');
    badge.classList.remove('is-bump');
    void badge.offsetWidth;
    badge.classList.add('is-bump');
    btn.classList.remove('is-jolt');
    void btn.offsetWidth;
    btn.classList.add('is-jolt');
    sparks();
  };

  const flyToCart = (src, it) => {
    if (RM || !src || !Element.prototype.animate) {
      bumpBadge();
      return;
    }
    const from = src.getBoundingClientRect();
    const to = $('#js-cart-btn').getBoundingClientRect();
    if (!from.width) {
      bumpBadge();
      return;
    }

    let el;
    if (src.tagName === 'IMG') {
      el = document.createElement('img');
      el.src = src.src;
      el.alt = '';
      if (it.shape === 'pill') el.style.borderRadius = '999px';
    } else {
      el = document.createElement('div');
      el.innerHTML = ICON_CUP;
      el.style.color = '#b8283a';
    }
    el.className = 'flyer';
    const size = Math.min(from.width, 150);
    const h = from.height * size / from.width;
    Object.assign(el.style, {
      left: (from.left + from.width / 2 - size / 2) + 'px',
      top: (from.top + from.height / 2 - h / 2) + 'px',
      width: size + 'px',
      height: h + 'px',
      objectFit: it.shape === 'pill' ? 'cover' : 'contain',
    });
    document.body.appendChild(el);

    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const anim = el.animate([
      { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 110}px) rotate(260deg) scale(.75)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) rotate(720deg) scale(.12)`, opacity: 0.7 },
    ], { duration: 850, easing: 'cubic-bezier(.45, .05, .55, .95)' });
    anim.onfinish = () => {
      el.remove();
      bumpBadge();
    };
  };

  const sparks = () => {
    if (RM) return;
    const r = $('#js-cart-btn').getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const colors = ['#b8283a', '#8f1c2c', '#e9b949', '#fffdf8'];
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('i');
      s.className = 'spark';
      s.style.background = colors[i % colors.length];
      s.style.left = cx + 'px';
      s.style.top = cy + 'px';
      if (i % 4 === 3) s.style.boxShadow = '0 0 0 1px #b8283a';
      document.body.appendChild(s);
      const ang = (i / 16) * Math.PI * 2 + Math.random() * 0.4;
      const d = 34 + Math.random() * 26;
      s.animate([
        { transform: 'translate(-50%, -50%) scale(1) rotate(0)', opacity: 1 },
        { transform: `translate(${Math.cos(ang) * d - 3}px, ${Math.sin(ang) * d - 3}px) scale(.9) rotate(${200 + Math.random() * 200}deg)`, opacity: 1, offset: 0.7 },
        { transform: `translate(${Math.cos(ang) * d * 1.15 - 3}px, ${Math.sin(ang) * d * 1.15 + 14}px) scale(.3) rotate(420deg)`, opacity: 0 },
      ], { duration: 700 + Math.random() * 200, easing: 'cubic-bezier(.2, .8, .4, 1)' }).onfinish = () => s.remove();
    }
  };


  // ------------------------------
  // 画面の切り替え
  // ------------------------------
  const showView = (view) => {
    $('#js-view-menu').hidden = view !== 'menu';
    $('#confirm').hidden = view !== 'confirm';
    $('#complete').hidden = view !== 'complete';
    window.scrollTo(0, 0);
  };


  // ------------------------------
  // 注文確認
  // ------------------------------
  const pad = (n) => String(n).padStart(2, '0');

  // 現在時刻から20分後以降・10分刻み
  const timeSlots = () => {
    const now = new Date();
    const start = new Date(now.getTime() + 20 * 60000);
    start.setSeconds(0, 0);
    start.setMinutes(Math.ceil(start.getMinutes() / 10) * 10);
    const slots = [];
    for (let i = 0; i < 18; i++) {
      const d = new Date(start.getTime() + i * 10 * 60000);
      const day = d.getDate() !== now.getDate() ? '明日 ' : '本日 ';
      slots.push(day + pad(d.getHours()) + ':' + pad(d.getMinutes()));
    }
    return slots;
  };

  const openConfirm = () => {
    if (!cart.length) return;
    closeCart();
    showView('confirm');

    const receipt = $('#js-receipt');
    receipt.innerHTML =
      '<div class="receipt__shop">GOOD TIME BURGER<small class="receipt__shop-sub">TAKE OUT</small></div><hr class="receipt__rule">' +
      cart.map((l) => {
        const opt = optionText(l);
        return `<div class="receipt__line"><span class="receipt__name">${lineName(l)} × ${l.qty}</span><span class="receipt__price">${yen(unitPrice(l) * l.qty)}</span>${opt ? `<span class="receipt__option">${opt}</span>` : ''}</div>`;
      }).join('') +
      `<hr class="receipt__rule"><div class="receipt__line"><span class="receipt__name">商品点数</span><span class="receipt__price">${count()}点</span></div>` +
      `<div class="receipt__total"><span>合計</span><b>${yen(total())}</b></div>`;
    receipt.classList.remove('is-print');
    void receipt.offsetWidth;
    receipt.classList.add('is-print');

    const select = $('#js-pickup-time');
    const prev = select.value;
    select.innerHTML = timeSlots().map((s) => `<option value="${s}">${s}</option>`).join('');
    if ([...select.options].some((o) => o.value === prev)) select.value = prev;
  };

  $('#js-to-confirm').addEventListener('click', openConfirm);
  $('#js-back-cart').addEventListener('click', () => {
    showView('menu');
    openCart();
  });

  // 名前の入力チェック
  const nameInput = $('#js-pickup-name');
  const nameError = $('#js-name-error');
  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim()) {
      nameInput.removeAttribute('aria-invalid');
      nameError.hidden = true;
    }
  });

  $('#js-order-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.setAttribute('aria-invalid', 'true');
      nameInput.classList.remove('is-shake');
      void nameInput.offsetWidth;
      nameInput.classList.add('is-shake');
      nameError.hidden = false;
      nameInput.focus();
      return;
    }
    // ※デモのため送信はしない
    $('#js-order-no').textContent = '#' + String(Math.floor(1000 + Math.random() * 9000));
    $('#js-order-name').textContent = name + ' 様';
    $('#js-order-time').textContent = $('#js-pickup-time').value;
    cart = [];
    renderCart();
    showView('complete');
    buildBurger();
  });

  $('#js-back-menu').addEventListener('click', () => {
    nameInput.value = '';
    showView('menu');
    $$('.confetti').forEach((c) => c.remove());
  });


  // ------------------------------
  // 注文完了（ハンバーガーが完成→Thank you!→紙吹雪）
  // ------------------------------
  const LAYERS = [ // 下から順番に
    { b: 0, svg: '<svg width="176" height="38" viewBox="0 0 176 38"><path d="M4 4h168c0 18-10 32-28 32H32C14 36 4 22 4 4z" fill="#d8923f" stroke="#8f1c2c" stroke-width="3"/><path d="M4 4h168" stroke="#8f1c2c" stroke-width="3"/></svg>' },
    { b: 30, svg: '<svg width="184" height="30" viewBox="0 0 184 30"><rect x="3" y="3" width="178" height="24" rx="12" fill="#5b2a1c" stroke="#3a150e" stroke-width="3"/><path d="M20 12h14M52 16h18M92 11h14M128 16h16M156 12h10" stroke="#7d4130" stroke-width="3" stroke-linecap="round"/></svg>' },
    { b: 52, svg: '<svg width="190" height="22" viewBox="0 0 190 22"><path d="M4 4h182l-10 5-8 11-10-11H66l-9 11-9-11H24L14 18 8 9z" fill="#f2c12e" stroke="#b37d10" stroke-width="2.5" stroke-linejoin="round"/></svg>' },
    { b: 66, svg: '<svg width="196" height="20" viewBox="0 0 196 20"><path d="M4 10c8-8 14 6 22-2s14 6 22-2 14 6 22-2 14 6 22-2 14 6 22-2 14 6 22-2 14 6 22-2 14 6 22-2c8-4 10 4 10 4l-2 8H6z" fill="#6aa84f" stroke="#2f6b25" stroke-width="2.5" stroke-linejoin="round"/></svg>' },
    { b: 80, svg: '<svg width="176" height="18" viewBox="0 0 176 18"><rect x="4" y="3" width="80" height="12" rx="6" fill="#d9362f" stroke="#8f1c2c" stroke-width="2.5"/><rect x="92" y="3" width="80" height="12" rx="6" fill="#d9362f" stroke="#8f1c2c" stroke-width="2.5"/><path d="M30 9h28M118 9h28" stroke="#f5a19a" stroke-width="2" stroke-linecap="round"/></svg>' },
    { b: 92, svg: '<svg width="182" height="72" viewBox="0 0 182 72"><path d="M4 66C4 26 40 4 91 4s87 22 87 62z" fill="#e49a45" stroke="#8f1c2c" stroke-width="3"/><path d="M4 66h174" stroke="#8f1c2c" stroke-width="3"/><g fill="#fff4dc"><ellipse cx="56" cy="30" rx="4" ry="2.2" transform="rotate(-20 56 30)"/><ellipse cx="84" cy="20" rx="4" ry="2.2"/><ellipse cx="112" cy="26" rx="4" ry="2.2" transform="rotate(18 112 26)"/><ellipse cx="136" cy="40" rx="4" ry="2.2" transform="rotate(30 136 40)"/><ellipse cx="40" cy="46" rx="4" ry="2.2" transform="rotate(-30 40 46)"/><ellipse cx="96" cy="40" rx="4" ry="2.2"/><ellipse cx="70" cy="44" rx="4" ry="2.2" transform="rotate(-10 70 44)"/><ellipse cx="120" cy="50" rx="4" ry="2.2" transform="rotate(10 120 50)"/></g></svg>' },
  ];

  const buildBurger = () => {
    const stage = $('#js-burger-stage');
    const info = $('#js-complete-info');
    const thanks = $('#js-thanks');
    const step = RM ? 0 : 0.38;
    stage.innerHTML = LAYERS.map((l, i) =>
      `<div class="complete__layer" style="bottom:${l.b + 10}px; z-index:${i}; animation-delay:${(i * step).toFixed(2)}s">${l.svg}</div>`
    ).join('');
    const endTime = RM ? 0 : (LAYERS.length - 1) * step * 1000 + 700;
    thanks.style.animationDelay = (endTime / 1000) + 's';
    thanks.classList.remove('is-show');
    void thanks.offsetWidth;
    thanks.classList.add('is-show');
    info.classList.remove('is-show');
    setTimeout(() => {
      info.classList.add('is-show');
      if (!RM) confettiRain();
    }, endTime + 200);
  };

  const confettiRain = () => {
    for (let i = 0; i < 46; i++) {
      const c = document.createElement('i');
      c.className = 'confetti';
      const size = 12 + Math.random() * 10;
      c.style.width = size + 'px';
      c.style.height = size * (0.6 + Math.random() * 0.5) + 'px';
      c.style.left = Math.random() * window.innerWidth + 'px';
      document.body.appendChild(c);
      const drift = (Math.random() - 0.5) * 160;
      const rot = (Math.random() - 0.5) * 1080;
      c.animate([
        { transform: 'translate(0, 0) rotate(0) rotateX(0)', opacity: 1 },
        { transform: `translate(${drift * 0.5}px, ${window.innerHeight * 0.5}px) rotate(${rot * 0.5}deg) rotateX(360deg)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${drift}px, ${window.innerHeight + 40}px) rotate(${rot}deg) rotateX(720deg)`, opacity: 0.9 },
      ], { duration: 2600 + Math.random() * 2000, delay: Math.random() * 900, easing: 'cubic-bezier(.3, .2, .6, 1)', fill: 'backwards' }).onfinish = () => c.remove();
    }
  };


  // ------------------------------
  // ファーストビューの動画
  // ------------------------------
  const video = $('#js-fv-video');
  if (RM) {
    video.removeAttribute('autoplay');
    video.pause();
  } else if ('IntersectionObserver' in window) {
    // 画面外では停止
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const p = video.play();
          if (p && p.catch) p.catch(() => {});
        } else {
          video.pause();
        }
      });
    }).observe(video);
  }


  // ------------------------------
  // 店名の文字を順番に落とす
  // ------------------------------
  $$('.fv__char').forEach((c, i) => {
    c.style.animationDelay = (0.1 + i * 0.07).toFixed(2) + 's';
  });


  // ------------------------------
  // ローディング
  // ------------------------------
  const loader = $('#js-loader');
  const bar = $('#js-loader-bar');
  document.documentElement.classList.add('is-loading');
  lockScroll(true);
  const minTime = RM ? 300 : 1900;
  const startTime = performance.now();
  let progress = 0;
  const timer = setInterval(() => {
    progress = Math.min(90, progress + 6 + Math.random() * 12);
    bar.style.width = progress + '%';
  }, 180);

  const pageLoaded = new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });
  const fontsLoaded = document.fonts
    ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))])
    : Promise.resolve();

  Promise.all([pageLoaded, fontsLoaded]).then(() => {
    const wait = Math.max(0, minTime - (performance.now() - startTime));
    setTimeout(() => {
      clearInterval(timer);
      bar.style.width = '100%';
      setTimeout(() => {
        loader.classList.add('is-hidden');
        document.documentElement.classList.remove('is-loading');
        lockScroll(false);
        setTimeout(() => loader.remove(), 800);
      }, RM ? 0 : 350);
    }, wait);
  });

  renderCart();
});
