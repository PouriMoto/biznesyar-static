import { BASE, session, fa } from './api';

const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!;
const phoneForm = $<HTMLFormElement>('#phone-form');
const codeForm = $<HTMLFormElement>('#code-form');
const msg = $('#login-msg');
let phone = '';

const norm = (s: string) => s.replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/\D/g, '');
const say = (t: string, err = true) => { msg.hidden = false; msg.textContent = t; msg.dataset.kind = err ? 'error' : 'info'; };

async function post(path: string, body: unknown) {
  const r = await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d?.message || 'خطا در ارتباط با سرور');
  return d;
}

const existing = session.get();
if (existing) location.replace(existing.record.role === 'customer' ? '/panel/' : '/ops/');

phoneForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.hidden = true;
  phone = norm(String(new FormData(phoneForm).get('phone') || ''));
  if (!/^09\d{9}$/.test(phone)) return say('شماره موبایل را به شکل 09123456789 وارد کنید.');
  const btn = phoneForm.querySelector('button')!; btn.disabled = true;
  try {
    const d = await post('/api/bz/otp/request', { phone });
    phoneForm.hidden = true; codeForm.hidden = false;
    $('#sent-to').textContent = fa(phone);
    say(d.devCode ? `حالت آزمایشی: کد ${d.devCode}` : 'کد تأیید پیامک شد.', false);
    codeForm.querySelector<HTMLInputElement>('input')!.focus();
  } catch (err) { say((err as Error).message); }
  btn.disabled = false;
});

codeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.hidden = true;
  const code = norm(String(new FormData(codeForm).get('code') || ''));
  if (code.length !== 6) return say('کد ۶ رقمی را وارد کنید.');
  const btn = codeForm.querySelector('button')!; btn.disabled = true;
  try {
    const d = await post('/api/bz/otp/verify', { phone, code });
    session.set({ token: d.token, record: d.record });
    location.href = d.record.role === 'customer' ? '/panel/' : '/ops/';
  } catch (err) { say((err as Error).message); btn.disabled = false; }
});

const qp = new URLSearchParams(location.search);
const pre = qp.get('phone');
if (pre) { phoneForm.querySelector<HTMLInputElement>('input')!.value = pre; if (qp.get('go') === '1') setTimeout(() => phoneForm.requestSubmit(), 150); }

$('#back').addEventListener('click', () => { codeForm.hidden = true; phoneForm.hidden = false; msg.hidden = true; });
