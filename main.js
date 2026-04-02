/* ============================================================
   下関リゾート - main.js
   機能: ヘッダースクロール / フェードイン / スムーズスクロール
         予約フォーム（バリデーション・確認・完了・LocalStorage）
         モバイルナビ
   ============================================================ */

/* ---- 1. ヘッダー: スクロールで背景変化 ---- */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
});

/* ---- 2. モバイルナビ ---- */
const navToggle = document.getElementById('navToggle');
const mainNav   = document.getElementById('mainNav');

navToggle?.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  const isOpen = mainNav.classList.contains('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

// ナビリンクをクリックしたら閉じる
mainNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
  });
});

// ナビ外クリックで閉じる
document.addEventListener('click', (e) => {
  if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
    mainNav.classList.remove('open');
  }
});

/* ---- 3. スクロール連動フェードイン ---- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

// セクション内の主要要素にrevealクラスを自動付与
document.querySelectorAll(
  '.feature-card .facility-card, .exp-card, .concept-list li, .room-feature-item, .step, .access-block'
).forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 0.1}s`;
  revealObserver.observe(el);
});

// セクション見出しにも付与
document.querySelectorAll('.section-label, .section-heading, .section-divider, .section-body').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ---- 4. スムーズスクロール ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // ヘッダー高さ分
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ============================================================
   5. 予約フォーム機能
   ============================================================ */

/** 今日の日付をYYYY-MM-DD形式で返す */
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

/** 日付表示用フォーマット (YYYY-MM-DD → YYYY年MM月DD日) */
function formatDate(str) {
  if (!str) return '―';
  const [y, m, d] = str.split('-');
  return `${y}年${m}月${d}日`;
}

/** プランの日本語名 */
const planLabels = {
  standard: 'スタンダードプラン（朝食付）',
  premium:  'プレミアムプラン（2食付）',
  family:   'ファミリープラン（2食付＋キッズサービス）'
};

/** 宿泊料金（1泊・大人1名あたり）シミュレーション */
const planPrices = { standard: 18000, premium: 28000, family: 35000 };

/** 宿泊日数を計算 */
function calcNights(checkin, checkout) {
  const d1 = new Date(checkin);
  const d2 = new Date(checkout);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

/** 料金計算 */
function calcPrice(checkin, checkout, adults, plan) {
  const nights = calcNights(checkin, checkout);
  if (nights <= 0 || !adults) return null;
  const total = planPrices[plan] * parseInt(adults) * nights;
  return { nights, total };
}

/** ページ読み込み時: 日付の最小値をセット */
document.addEventListener('DOMContentLoaded', () => {
  const checkinEl  = document.getElementById('checkin');
  const checkoutEl = document.getElementById('checkout');
  if (checkinEl) checkinEl.min = getTodayString();
  if (checkoutEl) checkoutEl.min = getTodayString();

  // チェックイン変更でチェックアウト最小値を更新
  checkinEl?.addEventListener('change', () => {
    const nextDay = new Date(checkinEl.value);
    nextDay.setDate(nextDay.getDate() + 1);
    checkoutEl.min = nextDay.toISOString().split('T')[0];
    if (checkoutEl.value && checkoutEl.value <= checkinEl.value) {
      checkoutEl.value = nextDay.toISOString().split('T')[0];
    }
  });

  // LocalStorageにデータがあれば復元（入力途中の保持）
  const saved = localStorage.getItem('shimonoseki_form_draft');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (checkinEl && data.checkin) checkinEl.value = data.checkin;
      if (checkoutEl && data.checkout) checkoutEl.value = data.checkout;
      ['adults','children','infants','plan','guestName','guestEmail','requests'].forEach(id => {
        const el = document.getElementById(id);
        if (el && data[id] !== undefined) el.value = data[id];
      });
    } catch(e) { /* 無視 */ }
  }

  // 入力のたびにLocalStorageへ保存
  ['checkin','checkout','adults','children','infants','plan','guestName','guestEmail','requests'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', saveFormDraft);
  });
});

/** フォーム内容をLocalStorageに保存 */
function saveFormDraft() {
  const data = {
    checkin:    document.getElementById('checkin')?.value,
    checkout:   document.getElementById('checkout')?.value,
    adults:     document.getElementById('adults')?.value,
    children:   document.getElementById('children')?.value,
    infants:    document.getElementById('infants')?.value,
    plan:       document.getElementById('plan')?.value,
    guestName:  document.getElementById('guestName')?.value,
    guestEmail: document.getElementById('guestEmail')?.value,
    requests:   document.getElementById('requests')?.value,
  };
  localStorage.setItem('shimonoseki_form_draft', JSON.stringify(data));
}


/* ---- バリデーション ---- */
function getVal(id) {
  return (document.getElementById(id)?.value || '').trim();
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  ['checkin-error','checkout-error','adults-error','name-error','email-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

function validateForm() {
  clearErrors();
  let valid = true;
  const today = getTodayString();

  const checkin  = getVal('checkin');
  const checkout = getVal('checkout');
  const adults   = getVal('adults');
  const name     = getVal('guestName');
  const email    = getVal('guestEmail');

  if (!checkin) {
    showError('checkin-error', 'チェックイン日を選択してください');
    valid = false;
  } else if (checkin < today) {
    showError('checkin-error', '過去の日付は選択できません');
    valid = false;
  }

  if (!checkout) {
    showError('checkout-error', 'チェックアウト日を選択してください');
    valid = false;
  } else if (checkin && checkout <= checkin) {
    showError('checkout-error', 'チェックアウトはチェックインより後の日付を選択してください');
    valid = false;
  }

  if (!adults) {
    showError('adults-error', '大人の人数を選択してください');
    valid = false;
  }

  if (!name) {
    showError('name-error', 'お名前を入力してください');
    valid = false;
  }

  if (!email) {
    showError('email-error', 'メールアドレスを入力してください');
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('email-error', '正しいメールアドレスの形式で入力してください');
    valid = false;
  }

  return valid;
}

/* ---- ステップ管理 ---- */
function setStep(n) {
  [1, 2, 3].forEach(i => {
    document.getElementById(`reservationStep${i}`)?.classList.add('d-none');
    const ind = document.getElementById(`step-indicator-${i}`);
    if (ind) ind.classList.toggle('active', i === n);
  });
  document.getElementById(`reservationStep${n}`)?.classList.remove('d-none');
}

/* ---- STEP1 → STEP2（確認画面） ---- */
function goToConfirm() {
  if (!validateForm()) return;

  const checkin   = getVal('checkin');
  const checkout  = getVal('checkout');
  const adults    = getVal('adults');
  const children  = getVal('children');
  const infants   = getVal('infants');
  const plan      = document.getElementById('plan')?.value;
  const name      = getVal('guestName');
  const email     = getVal('guestEmail');
  const requests  = getVal('requests');

  const priceData = calcPrice(checkin, checkout, adults, plan);

  const rows = [
    ['チェックイン',      formatDate(checkin)],
    ['チェックアウト',    formatDate(checkout)],
    ['宿泊数',           priceData ? `${priceData.nights}泊` : '―'],
    ['大人',             `${adults}名`],
    ['子供（3〜12歳）',  `${children || 0}名`],
    ['乳幼児（0〜2歳）', `${infants || 0}名`],
    ['プラン',           planLabels[plan] || plan],
    ['お名前',           name],
    ['メールアドレス',   email],
    ['ご要望',           requests || 'なし'],
    ['概算料金',         priceData ? `¥${priceData.total.toLocaleString()}（税別）` : '要問合せ'],
  ];

  const detailsEl = document.getElementById('confirmDetails');
  detailsEl.innerHTML = rows.map(([label, value]) => `
    <div class="confirm-row">
      <span class="label">${label}</span>
      <span>${value}</span>
    </div>
  `).join('');

  setStep(2);
  scrollToReservation();
}

/* ---- STEP2 → STEP1（修正） ---- */
function backToForm() {
  setStep(1);
  scrollToReservation();
}



/* ---- STEP2 → STEP3（完了） ---- */
function completeReservation() {
  // 予約番号生成
  const reservationId = 'SMR-' + Date.now().toString(36).toUpperCase();
  const checkin   = getVal('checkin');
  const checkout  = getVal('checkout');
  const adults    = getVal('adults');
  const children  = getVal('children');
  const infants   = getVal('infants');
  const plan      = document.getElementById('plan')?.value;
  const name      = getVal('guestName');
  const email     = getVal('guestEmail');
  const requests  = getVal('requests');

  const priceData = calcPrice(checkin, checkout, adults, plan);

// GASに送るデータ
  const formData = {
    checkin,
    checkout,
    adults,
    children,
    infants,
    plan,
    name,
    email,
    requests
  };

// ここでGASにデータを送信
  fetch("https://script.google.com/macros/s/AKfycbzQxsbKh_dNWlCKAZLTQ483D0I6YjW8cMJKo-w4PwBI1e4DvYdDUfxQzSyiXUXO7HOWCw/exec",
     {
    method: "POST",
    body: JSON.stringify(formData)
  })
  .then(() => {
    // 成功したら完了画面
    setStep(3);
  })
  .catch(() => {
    alert("送信に失敗しました");
  });

  // LocalStorageに完了データを保存
  const reservationData = {
    id:          reservationId,
    checkin,
    checkout,
    adults,
    plan,
    name,
    email,
    price:       priceData?.total || null,
    createdAt:   new Date().toISOString()
  };
  localStorage.setItem('shimonoseki_last_reservation', JSON.stringify(reservationData));
  localStorage.removeItem('shimonoseki_form_draft'); // 下書き削除

  // 完了画面の内容
  document.getElementById('completeDetails').innerHTML = `
    <p>予約番号：<strong style="color:var(--gold-light)">${reservationId}</strong></p>
    <p>${formatDate(checkin)} → ${formatDate(checkout)}</p>
    <p>${name} 様（${adults}名）</p>
    <p>${planLabels[plan] || plan}</p>
    ${priceData ? `<p>概算料金：¥${priceData.total.toLocaleString()}（税別）</p>` : ''}
    <p style="margin-top:0.8rem; font-size:0.8rem; opacity:0.6;">確認メール送信先：${email}</p>
  `;

  setStep(3);
  scrollToReservation();
}

/* ---- リセット ---- */
function resetReservation() {
  ['checkin','checkout','adults','children','infants','guestName','guestEmail','requests'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const planEl = document.getElementById('plan');
  if (planEl) planEl.value = 'standard';
  clearErrors();
  setStep(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** 予約セクションの先頭へスクロール */
function scrollToReservation() {
  const section = document.getElementById('reservation');
  if (section) {
    const top = section.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}
