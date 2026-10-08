// ابزار مشترک پنل‌ها: ارتباط با PocketBase، احراز هویت، قالب‌بندی
const cfgEl = document.getElementById('bz-config');
export const cfg = cfgEl ? JSON.parse(cfgEl.textContent || '{}') : {};
export const BASE: string = cfg.api?.base || '';
const KEY = 'bz_auth';

export interface User { id: string; name: string; phone: string; role: 'customer' | 'operator' | 'admin' }
export const session = {
  get(): { token: string; record: User } | null { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } },
  set(d: unknown) { localStorage.setItem(KEY, JSON.stringify(d)); },
  clear() { localStorage.removeItem(KEY); }
};

export class ApiError extends Error { status: number; constructor(m: string, s: number) { super(m); this.status = s; } }

export async function api<T = any>(path: string, opts: { method?: string; json?: unknown; form?: FormData } = {}): Promise<T> {
  const s = session.get();
  const headers: Record<string, string> = {};
  if (s) headers.Authorization = s.token;
  let body: BodyInit | undefined;
  if (opts.json !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(opts.json); }
  if (opts.form) body = opts.form;
  const res = await fetch(BASE + path, { method: opts.method || 'GET', headers, body });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    if (res.status === 401 && s) { session.clear(); location.href = '/login/'; }
    let msg = data?.message || 'خطا در ارتباط با سرور';
    if (data?.data) {
      const first = Object.values<any>(data.data)[0];
      if (first?.message) msg = first.message;
    }
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

export async function list<T = any>(coll: string, query = ''): Promise<T[]> {
  const q = (query ? query + '&' : '') + 'perPage=200';
  const d = await api<{ items: T[] }>(`/api/collections/${coll}/records?${q}`);
  return d.items;
}

let fileToken: { t: string; at: number } | null = null;
export async function fileUrl(coll: string, id: string, name: string): Promise<string> {
  if (!fileToken || Date.now() - fileToken.at > 90_000) {
    const d = await api<{ token: string }>('/api/files/token', { method: 'POST' });
    fileToken = { t: d.token, at: Date.now() };
  }
  return `${BASE}/api/files/${coll}/${id}/${encodeURIComponent(name)}?token=${fileToken.t}`;
}

export const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const FA = '۰۱۲۳۴۵۶۷۸۹';
export const fa = (n: unknown) => String(n).replace(/\d/g, (d) => FA[+d]);
export const money = (n: number) => fa(Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')) + ' تومان';
const dt = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
export const when = (iso: string) => { const d = new Date(iso.replace(' ', 'T')); return isNaN(+d) ? '' : dt.format(d); };

export const L = {
  caseStatus: { new: 'در انتظار بررسی', awaiting_deposit: 'در انتظار بیعانه', in_progress: 'در حال انجام', awaiting_payment: 'در انتظار پرداخت باقی‌مانده', completed: 'تکمیل‌شده', cancelled: 'لغو شده' } as Record<string, string>,
  step: { pending: 'در انتظار', active: 'در حال انجام', done: 'انجام شد' } as Record<string, string>,
  pay: { requested: 'در انتظار پرداخت', submitted: 'در انتظار تأیید', confirmed: 'تأیید شد', rejected: 'رد شد' } as Record<string, string>,
  kind: { deposit: 'بیعانه', final: 'مبلغ باقی‌مانده' } as Record<string, string>,
  doc: { uploaded: 'ارسال شد', accepted: 'تأیید شد', rejected: 'نیاز به اصلاح' } as Record<string, string>,
  lead: { new: 'جدید', contacted: 'تماس گرفته شد', won: 'تبدیل به پرونده', lost: 'از دست رفت' } as Record<string, string>
};

export function requireAuth(roles?: string[]): { token: string; record: User } {
  const s = session.get();
  if (!s) { location.href = '/login/'; throw new Error('no auth'); }
  if (roles && !roles.includes(s.record.role)) { location.href = s.record.role === 'customer' ? '/panel/' : '/ops/'; throw new Error('wrong role'); }
  return s;
}

export function toast(msg: string, kind: 'ok' | 'err' = 'ok') {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg; el.dataset.kind = kind; el.classList.add('show');
  setTimeout(() => el!.classList.remove('show'), 3500);
}

export async function refreshMe() {
  const s = session.get();
  if (!s) return;
  try { const r = await api<User>(`/api/collections/users/records/${s.record.id}`); session.set({ token: s.token, record: r }); } catch { /* ignore */ }
}

// ---------- آپلود: کم‌حجم‌سازی خودکار تصویر و محدودیت ۵ مگابایت ----------
export const MAX_UPLOAD = 5 * 1024 * 1024;
let pdfHelp = 'اگر فایل PDF بیش از ۵ مگابایت است، از برنامه‌های اسکن موبایل با کیفیت متوسط استفاده کنید یا عکس بگیرید.';
export const setPdfHelp = (t: string) => { if (t) pdfHelp = t; };

export async function prepareFile(file: File): Promise<File> {
  if (file.type === 'application/pdf') {
    if (file.size > MAX_UPLOAD) throw new Error('حجم PDF بیش از ۵ مگابایت است. ' + pdfHelp);
    return file;
  }
  if (!file.type.startsWith('image/')) throw new Error('فقط تصویر (JPG, PNG, WebP) یا PDF مجاز است.');
  if (file.size <= 700 * 1024 && /jpeg|png|webp/.test(file.type)) return file;
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) throw new Error('این نوع تصویر پشتیبانی نمی‌شود؛ آن را به JPG تبدیل کنید.');
  let scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
  let blob: Blob | null = null;
  for (let q = 0.85, i = 0; i < 6; i++, q -= 0.1, scale *= 0.9) {
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/jpeg', Math.max(q, 0.45)));
    if (blob && blob.size <= MAX_UPLOAD * 0.8) break;
  }
  if (!blob || blob.size > MAX_UPLOAD) throw new Error('حجم تصویر زیاد است؛ تصویر کوچک‌تری انتخاب کنید.');
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}

// ---------- پنجره راهنما (!) ----------
export const helpBtn = (text?: string, image?: string) =>
  text ? `<button type="button" class="help-btn" data-ht="${esc(text)}" data-hi="${esc(image || '')}" aria-label="راهنما">!</button>` : '';

export function initHelp() {
  let dlg = document.getElementById('help-dlg') as HTMLDialogElement | null;
  if (!dlg) {
    dlg = document.createElement('dialog'); dlg.id = 'help-dlg';
    dlg.innerHTML = '<form method="dialog"><button class="help-x" aria-label="بستن">×</button></form><div class="help-body"></div>';
    document.body.appendChild(dlg);
  }
  document.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('.help-btn');
    if (!b) return;
    const img = b.dataset.hi;
    dlg!.querySelector('.help-body')!.innerHTML = `<p>${esc(b.dataset.ht)}</p>${img ? `<img src="${esc(img)}" alt="نمونه تصویر" onerror="this.remove()">` : ''}`;
    dlg!.showModal();
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg!.close(); });
}

export async function copyText(t: string) {
  try { await navigator.clipboard.writeText(t); toast('کپی شد'); } catch { toast('کپی نشد؛ دستی انتخاب کنید', 'err'); }
}
export const countdown = (iso: string) => {
  const ms = new Date(iso.replace(' ', 'T')).getTime() - Date.now();
  if (isNaN(ms)) return '';
  const h = Math.floor(Math.abs(ms) / 3600000), m = Math.floor((Math.abs(ms) % 3600000) / 60000);
  return ms < 0 ? `${fa(h)} ساعت و ${fa(m)} دقیقه از مهلت گذشته` : `${fa(h)} ساعت و ${fa(m)} دقیقه تا مهلت`;
};
