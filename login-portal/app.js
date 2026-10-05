/**
 * DIU CPC 99 Days — Member Login Portal
 * app.js | Authentication, validation, UI interactions
 */

'use strict';

/* Member records are not bundled into public client code. */
const MEMBERS_DB = {};

/* ─────────────────────────────────────────
   THEME
───────────────────────────────────────── */
const html = document.documentElement;

function getStoredTheme() {
  try { return localStorage.getItem('diucpc-theme') || 'light'; }
  catch { return 'light'; }
}

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  try { localStorage.setItem('diucpc-theme', theme); } catch {}
}

function initTheme() {
  // Detect system preference if no stored preference
  let theme = getStoredTheme();
  if (theme === 'system') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  applyTheme(theme);
}

function toggleTheme() {
  const current = html.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/* ─────────────────────────────────────────
   FORM ELEMENTS
───────────────────────────────────────── */
const form        = document.getElementById('loginForm');
const memberIdEl  = document.getElementById('memberId');
const emailEl     = document.getElementById('email');
const submitBtn   = document.getElementById('submitBtn');
const btnLabel    = document.getElementById('btnLabel');
const btnSpinner  = document.getElementById('btnSpinner');
const formAlert   = document.getElementById('formAlert');
const rememberEl  = document.getElementById('remember');

/* ─────────────────────────────────────────
   VALIDATION HELPERS
───────────────────────────────────────── */
function showFieldError(groupId, errorId, message) {
  const group = document.getElementById(groupId);
  const error = document.getElementById(errorId);
  if (group) { group.classList.add('has-error'); group.classList.remove('has-success'); }
  if (error) error.textContent = message;
}

function showFieldSuccess(groupId, errorId) {
  const group = document.getElementById(groupId);
  const error = document.getElementById(errorId);
  if (group) { group.classList.remove('has-error'); group.classList.add('has-success'); }
  if (error) error.textContent = '';
}

function clearField(groupId, errorId) {
  const group = document.getElementById(groupId);
  const error = document.getElementById(errorId);
  if (group) { group.classList.remove('has-error', 'has-success'); }
  if (error) error.textContent = '';
}

function validateMemberId(value) {
  const v = value.trim();
  if (!v) return 'Membership ID is required.';

  // Accept short numeric IDs (e.g. 2007, 1001, 9999)
  const shortNumeric = /^\d{2,6}$/;
  // Accept full DIU-CPC format (e.g. DIU-CPC-2024-001)
  const fullFormat   = /^DIU-CPC-[A-Z0-9]{2,6}-\d{2,4}$/i;

  if (!shortNumeric.test(v) && !fullFormat.test(v)) {
    return 'Enter a valid ID — e.g. 2007  or  DIU-CPC-2024-001';
  }
  return null;
}

function validateEmail(value) {
  if (!value.trim()) return 'Email address is required.';
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(value.trim())) return 'Enter a valid email address.';
  return null;
}

/* ─────────────────────────────────────────
   ALERTS
───────────────────────────────────────── */
function showAlert(type, message) {
  formAlert.className = `form-alert alert-${type}`;
  formAlert.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      style="flex-shrink:0;margin-top:1px">
      ${type === 'error'
        ? '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>'
        : '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>'}
    </svg>
    <span>${message}</span>`;
  formAlert.hidden = false;
}

function hideAlert() { formAlert.hidden = true; }

/* ─────────────────────────────────────────
   LOADING STATE
───────────────────────────────────────── */
function setLoading(loading) {
  submitBtn.disabled = loading;
  btnLabel.hidden = loading;
  btnSpinner.hidden = !loading;
}

/* ─────────────────────────────────────────
   SUCCESS OVERLAY
───────────────────────────────────────── */
const successOverlay = document.getElementById('successOverlay');
const successMsg     = document.getElementById('successMsg');
const successInfo    = document.getElementById('successInfo');
const successClose   = document.getElementById('successClose');

function showSuccess(member, memberId) {
  const progress = member.day;
  const pct = Math.round((progress / 99) * 100);

  successMsg.textContent = `Welcome back, ${member.name}!`;
  successInfo.innerHTML = `
    <div>🆔 <b>ID:</b> ${memberId.toUpperCase()}</div>
    <div>🎯 <b>Track:</b> ${member.track}</div>
    <div>📅 <b>Day:</b> ${progress} / 99 &nbsp;(${pct}%)</div>
    <div>🟢 <b>Status:</b> ${member.status === 'completed' ? '✅ Completed' : '🔥 In Progress'}</div>
  `;
  successOverlay.hidden = false;
  document.body.style.overflow = 'hidden';
}

function hideSuccess() {
  successOverlay.hidden = true;
  document.body.style.overflow = '';
}

successClose.addEventListener('click', () => {
  hideSuccess();
  // In production: redirect to dashboard
  // window.location.href = '/dashboard';
});

successOverlay.addEventListener('click', (e) => {
  if (e.target === successOverlay) hideSuccess();
});

/* ─────────────────────────────────────────
   FORGOT MODAL
───────────────────────────────────────── */
const forgotModal  = document.getElementById('forgotModal');
const forgotBtn    = document.getElementById('forgotBtn');
const modalClose   = document.getElementById('modalClose');
const modalCancel  = document.getElementById('modalCancel');

function openForgot() {
  forgotModal.hidden = false;
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeForgot() {
  forgotModal.hidden = true;
  document.body.style.overflow = '';
  forgotBtn.focus();
}

forgotBtn.addEventListener('click', openForgot);
modalClose.addEventListener('click', closeForgot);
modalCancel.addEventListener('click', closeForgot);
forgotModal.addEventListener('click', (e) => {
  if (e.target === forgotModal) closeForgot();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!forgotModal.hidden) closeForgot();
    if (!successOverlay.hidden) hideSuccess();
  }
});

/* ─────────────────────────────────────────
   LIVE VALIDATION
───────────────────────────────────────── */
memberIdEl.addEventListener('blur', () => {
  const err = validateMemberId(memberIdEl.value);
  if (err) showFieldError('grp-memberid', 'err-memberid', err);
  else showFieldSuccess('grp-memberid', 'err-memberid');
});

memberIdEl.addEventListener('input', () => {
  clearField('grp-memberid', 'err-memberid');
  hideAlert();
  // Only uppercase full-format IDs; keep short numeric as-is
  const v = memberIdEl.value;
  const isShortNumeric = /^\d*$/.test(v.trim());
  if (!isShortNumeric) {
    const pos = memberIdEl.selectionStart;
    memberIdEl.value = v.toUpperCase();
    memberIdEl.setSelectionRange(pos, pos);
  }
});

emailEl.addEventListener('blur', () => {
  const err = validateEmail(emailEl.value);
  if (err) showFieldError('grp-email', 'err-email', err);
  else showFieldSuccess('grp-email', 'err-email');
});

emailEl.addEventListener('input', () => {
  clearField('grp-email', 'err-email');
  hideAlert();
});

/* ─────────────────────────────────────────
   REMEMBER ME — Restore saved values
───────────────────────────────────────── */
function loadRemembered() {
  try {
    const saved = localStorage.getItem('diucpc-remember');
    if (saved) {
      const { memberId } = JSON.parse(saved);
      if (memberId) {
        memberIdEl.value = memberId;
        rememberEl.checked = true;
      }
    }
  } catch {}
}

function saveRemembered(memberId) {
  try { localStorage.setItem('diucpc-remember', JSON.stringify({ memberId })); }
  catch {}
}

function clearRemembered() {
  try { localStorage.removeItem('diucpc-remember'); } catch {}
}

/* ─────────────────────────────────────────
   MOCK AUTHENTICATION
   In production replace with:
   const res = await fetch('/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ memberId, email })
   });
   const data = await res.json();
───────────────────────────────────────── */
async function authenticate(memberId, email) {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 1400 + Math.random() * 600));

  const raw = memberId.trim();

  // Normalize: short numeric IDs stay as-is; full format uppercased
  const isShortNumeric = /^\d{2,6}$/.test(raw);
  const key = isShortNumeric ? raw : raw.toUpperCase();

  const member = MEMBERS_DB[key];

  if (!member) {
    return {
      success: false,
      error: 'Membership ID not found in our registry. Please double-check your ID or contact us.'
    };
  }

  // Check primary email AND any alternate emails
  const inputEmail = email.toLowerCase().trim();
  const primaryMatch = member.email.toLowerCase() === inputEmail;
  const altMatch = member.altEmails && member.altEmails.some(e => e.toLowerCase() === inputEmail);

  if (!primaryMatch && !altMatch) {
    return {
      success: false,
      error: 'Email does not match our records for this Membership ID.'
    };
  }

  return { success: true, member, memberId: key };
}

/* ─────────────────────────────────────────
   FORM SUBMIT
───────────────────────────────────────── */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const memberId = memberIdEl.value.trim();
  const email    = emailEl.value.trim();

  // Validate both fields
  let valid = true;
  const idErr = validateMemberId(memberId);
  const emErr = validateEmail(email);

  if (idErr) { showFieldError('grp-memberid', 'err-memberid', idErr); valid = false; }
  else showFieldSuccess('grp-memberid', 'err-memberid');

  if (emErr) { showFieldError('grp-email', 'err-email', emErr); valid = false; }
  else showFieldSuccess('grp-email', 'err-email');

  if (!valid) return;

  setLoading(true);

  try {
    const result = await authenticate(memberId, email);

    if (!result.success) {
      showAlert('error', result.error);
      // Shake the card
      const card = document.getElementById('loginCard');
      card.style.animation = 'none';
      setTimeout(() => { card.style.animation = ''; }, 10);
      card.classList.add('shake');
      setTimeout(() => card.classList.remove('shake'), 500);
    } else {
      // Save if remember is checked
      if (rememberEl.checked) saveRemembered(result.memberId);
      else clearRemembered();

      // Save session for dashboard
      try {
        sessionStorage.setItem('diucpc-session', JSON.stringify({
          memberId:   result.memberId,
          name:       result.member.name,
          email:      result.member.email,
          track:      result.member.track || 'explore',
          day:        result.member.day   || 1,
          status:     result.member.status || 'active',
          loginTime:  Date.now(),
        }));
      } catch(e) { console.warn('Session save failed', e); }

      // Brief success flash then redirect
      showSuccess(result.member, result.memberId);
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1800);
    }
  } catch (err) {
    showAlert('error', 'Network error. Please try again in a moment.');
    console.error('[DIU CPC Login]', err);
  } finally {
    setLoading(false);
  }
});

/* ─────────────────────────────────────────
   SHAKE ANIMATION (CSS via JS)
───────────────────────────────────────── */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  .shake {
    animation: shakeX .4s ease !important;
  }
  @keyframes shakeX {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-8px); }
    40%     { transform: translateX(8px); }
    60%     { transform: translateX(-5px); }
    80%     { transform: translateX(5px); }
  }
`;
document.head.appendChild(shakeStyle);

/* ─────────────────────────────────────────
   KEYBOARD ACCESSIBILITY
───────────────────────────────────────── */
// Allow Enter on checkboxes and buttons that aren't submit
document.querySelectorAll('.checkbox-label').forEach(label => {
  label.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const cb = label.querySelector('input[type="checkbox"]');
      if (cb) cb.checked = !cb.checked;
    }
  });
});

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
function init() {
  initTheme();
  loadRemembered();

  // Theme toggle button
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Listen for OS theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('diucpc-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Smooth entrance animation for login card
  const card = document.querySelector('.login-card');
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px) scale(0.98)';
    setTimeout(() => {
      card.style.transition = 'opacity .5s ease, transform .5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0) scale(1)';
    }, 80);
  }

  console.log('%c DIU CPC 99 Days Portal ', 'background:#2563eb;color:white;padding:4px 8px;border-radius:4px;font-weight:bold;');
  console.log('%c diucpc.club | Let Infinity Be Your Limit ', 'color:#64748b;font-size:11px;');
  console.log('  Example: ID: 2007 | Email: mehedibafsj@gmail.com');
}

document.addEventListener('DOMContentLoaded', init);
