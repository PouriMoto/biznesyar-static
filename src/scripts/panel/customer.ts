import { api, list, requireAuth, session, esc, fa, money, when, L, fileUrl, toast, prepareFile, setPdfHelp, helpBtn, initHelp, copyText, countdown } from './api';

const me = requireAuth(['customer']).record;
const app = document.getElementById('app')!;
document.getElementById('who')!.textContent = fa(me.phone);
if (me.name) document.getElementById('hello')!.textContent = `سلام ${me.name.split(' ')[0]}`;
document.getElementById('logout')!.addEventListener('click', () => { session.clear(); location.href = '/login/'; });
initHelp();

let S: Record<string, string> = {};
const badge = (t: string, k = '') => `<span class="st st-${k}">${esc(t)}</span>`;
const err = (e: unknown) => toast((e as Error).message, 'err');
const SLOT: Record<string, string> = { missing: 'ارسال نشده', uploaded: 'در انتظار بررسی', accepted: 'تأیید شد', rejected: 'نیاز به اصلاح' };

async function boot() {
  try { (await list('app_settings')).forEach((r: any) => (S[r.skey] = r.value)); setPdfHelp(S.pdf_help); } catch { /* ignore */ }
  route();
}

// ---------- لیست ----------
async function renderList() {
  const cases = await list('cases', 'sort=-created');
  const steps = cases.length ? await list('case_steps', 'sort=order') : [];
  const bale = await api<{ url: string; connected: boolean }>('/api/bz/bale/link').catch(() => ({ url: '', connected: false }));
  const items = cases.map((c: any) => {
    const st = steps.filter((s: any) => s.case === c.id);
    const done = st.filter((s: any) => s.status === 'done').length;
    const act = st.find((s: any) => s.status === 'active');
    return `<a class="case-card" href="#/case/${c.id}"><div><strong>${esc(c.title)}</strong>
      <div class="meta"><span>کد پیگیری: <bdi>${esc(c.tracking)}</bdi></span><span>${when(c.created)}</span></div>
      ${act ? `<div class="meta"><span>مرحله فعلی: ${esc(act.title)}</span></div>` : ''}</div>
      <div class="cc-side">${badge(L.caseStatus[c.status] || c.status, c.status)}<div class="bar"><i style="width:${st.length ? Math.round((done / st.length) * 100) : 0}%"></i></div><small>${fa(done)} از ${fa(st.length)} مرحله</small></div></a>`;
  }).join('');
  const baleBox = bale.url ? `<div class="box-card">${bale.connected ? '✅ بله متصل است؛ وضعیت پرونده را آنجا هم می‌گیرید.' : `<strong>پیام‌های وضعیت را در بله بگیرید</strong><p class="meta">ارزان‌تر و سریع‌تر از پیامک.</p><a class="btn btn-ghost" href="${esc(bale.url)}" target="_blank" rel="noopener">اتصال به بله</a>`}</div>` : '';
  app.innerHTML = `${cases.length ? `<div class="cases">${items}</div>` : '<div class="note">هنوز پرونده‌ای ندارید. پس از مشاوره پرونده‌تان اینجا ساخته می‌شود؛ یا خودتان درخواست بدهید.</div>'}
    ${baleBox}
    <details class="newcase"><summary class="btn btn-ghost">درخواست پرونده جدید</summary>
      <form id="new-case" class="lead" style="margin-top:1rem"><label>عنوان<input name="title" required maxlength="200" placeholder="مثلاً جواز کسب فروشگاه" /></label>
      <label>توضیح (اختیاری)<textarea name="note" rows="2" maxlength="1000"></textarea></label><button class="btn btn-primary" type="submit">ثبت درخواست</button></form></details>`;
  document.getElementById('new-case')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const f = new FormData(e.target as HTMLFormElement);
    try { await api('/api/collections/cases/records', { method: 'POST', json: { title: f.get('title'), note: f.get('note'), owner: me.id } }); toast('درخواست ثبت شد'); renderList(); } catch (x) { err(x); }
  });
}

// ---------- جزئیات ----------
async function renderCase(id: string) {
  const [c, steps, slots, fields, logs, docs, pays] = await Promise.all([
    api<any>(`/api/collections/cases/records/${id}`),
    list('case_steps', `filter=case='${id}'&sort=order`), list('case_slots', `filter=case='${id}'&sort=order`), list('case_fields', `filter=case='${id}'&sort=order`),
    list('case_logs', `filter=case='${id}'&sort=created`), list('documents', `filter=case='${id}'&sort=created`), list('payments', `filter=case='${id}'&sort=created`)
  ]);
  const open = new Set<string>(JSON.parse(sessionStorage.getItem('bz_open_' + id) || '[]'));
  const link = async (coll: string, rid: string, f: string, label: string) => `<a href="${await fileUrl(coll, rid, f)}" target="_blank" rel="noopener">${esc(label)}</a>`;

  const slotHtml = async (sl: any) => {
    const mine = docs.filter((d: any) => d.slot === sl.id);
    const files = (await Promise.all(mine.map((d: any) => link('documents', d.id, d.file, 'مشاهده فایل')))).join(' · ');
    return `<div class="slot s-${sl.status}"><div class="slot-h"><strong>${esc(sl.title)}</strong> <small class="tag">${sl.required ? 'الزامی' : 'اختیاری'}</small> ${helpBtn(sl.help_text, sl.help_image)} ${badge(SLOT[sl.status], sl.status)}</div>
      ${sl.status === 'rejected' && sl.note ? `<p class="note">${esc(sl.note)}</p>` : ''}${files ? `<p class="meta">${files}</p>` : ''}
      ${sl.status === 'accepted' ? '' : `<label class="upl">${mine.length ? 'ارسال مجدد' : 'انتخاب فایل'}<input type="file" accept="image/*,application/pdf" data-slot="${sl.id}" hidden /></label>`}</div>`;
  };
  const fieldHtml = (f: any) => `<form class="fld" data-id="${f.id}"><label><span>${esc(f.label)} <small class="tag">${f.required ? 'الزامی' : 'اختیاری'}</small> ${helpBtn(f.help_text, f.help_image)}</span>
      <div class="inline"><input name="value" value="${esc(f.value)}" maxlength="500" ${f.sensitive ? 'autocomplete="off" inputmode="numeric"' : ''} /><button class="btn btn-ghost" type="submit">ذخیره</button></div></label>
      ${f.sensitive ? '<small class="meta">این کد فقط برای کارشناس نمایش داده می‌شود و ۱۵ دقیقه بعد پاک می‌شود.</small>' : ''}</form>`;

  const payHtml = async (step: any) => {
    const p = pays.find((x: any) => x.kind === step.pay);
    if (!p) return '';
    const rec = p.receipt ? await link('payments', p.id, p.receipt, 'مشاهده رسید') : '';
    const head = `<div class="bc-head"><strong>${esc(L.kind[p.kind])}: ${money(p.amount)}</strong>${badge(L.pay[p.status], p.status)}</div>`;
    if (p.status === 'submitted') return `<div class="box-card">${head}<p>رسید شما ثبت شد و در انتظار تأیید است. ${rec}</p></div>`;
    if (p.status === 'confirmed') return `<div class="box-card">${head}<p>پرداخت تأیید شد. ${rec}</p></div>`;
    const hasBank = S.bank_card || S.bank_sheba;
    return `<div class="box-card">${head}${p.status === 'rejected' && p.note ? `<p class="note">${esc(p.note)}</p>` : ''}
      <form class="lead pay-form" data-id="${p.id}"><fieldset class="methods"><legend>روش پرداخت</legend>
        <label class="radio"><input type="radio" name="method" value="card" checked /> کارت‌به‌کارت</label><label class="radio"><input type="radio" name="method" value="sheba" /> واریز به شبا</label></fieldset>
        ${hasBank ? `<div class="bank" data-for="card"><p class="meta">مبلغ ${money(p.amount)} را به کارت زیر واریز کنید:</p><dl>${S.bank_owner ? `<dt>به نام</dt><dd>${esc(S.bank_owner)}</dd>` : ''}${S.bank_name ? `<dt>بانک</dt><dd>${esc(S.bank_name)}</dd>` : ''}<dt>شماره کارت</dt><dd dir="ltr">${esc(S.bank_card || '—')} ${S.bank_card ? `<button type="button" class="copy" data-c="${esc(S.bank_card)}">کپی</button>` : ''}</dd></dl></div>
        <div class="bank" data-for="sheba" hidden><p class="meta">مبلغ ${money(p.amount)} را به شبای زیر واریز کنید:</p><dl>${S.bank_owner ? `<dt>به نام</dt><dd>${esc(S.bank_owner)}</dd>` : ''}${S.bank_name ? `<dt>بانک</dt><dd>${esc(S.bank_name)}</dd>` : ''}<dt>شماره شبا</dt><dd dir="ltr">${esc(S.bank_sheba || '—')} ${S.bank_sheba ? `<button type="button" class="copy" data-c="${esc(S.bank_sheba)}">کپی</button>` : ''}</dd></dl></div>`
          : '<div class="note">اطلاعات حساب هنوز ثبت نشده است. از کارشناس بپرسید یا در همین مرحله پیام بدهید.</div>'}
        <div class="row pair"><label>شماره پیگیری واریز<input name="ref_no" maxlength="60" /></label><label>تصویر رسید<input name="receipt" type="file" accept="image/*,application/pdf" /></label></div>
        <button class="btn btn-primary" type="submit">ثبت رسید پرداخت</button></form></div>`;
  };

  const threadHtml = async (stepId: string) => {
    const ls = logs.filter((l: any) => l.step === stepId);
    const rows = (await Promise.all(ls.map(async (l: any) => `<li class="${l.actor_role === 'customer' ? 'mine' : ''}"><div class="meta"><strong>${esc(l.actor_name)}</strong><span>${when(l.created)}</span></div><p>${esc(l.body)}</p>${l.attachment ? `<p>📎 ${await link('case_logs', l.id, l.attachment, 'دانلود فایل')}</p>` : ''}</li>`))).join('');
    return `<div class="thread"><ul class="timeline">${rows || '<li class="meta">هنوز پیامی در این مرحله نیست.</li>'}</ul>
      <form class="lead msg-form" data-step="${stepId}"><textarea name="body" rows="2" required maxlength="2000" placeholder="پیام به کارشناس…"></textarea><div class="inline"><input type="file" name="attachment" accept="image/*,application/pdf" /><button class="btn btn-ghost" type="submit">ارسال</button></div></form></div>`;
  };

  const stageHtml = async (s: any, i: number) => {
    const ss = slots.filter((x: any) => x.step === s.id), ff = fields.filter((x: any) => x.step === s.id);
    const body = [s.kind === 'payment' ? await payHtml(s) : '', ff.length ? `<h4>اطلاعات</h4>${ff.map(fieldHtml).join('')}` : '',
      ss.length ? `<h4>مدارک</h4>${(await Promise.all(ss.map(slotHtml))).join('')}` : '', await threadHtml(s.id)].join('');
    const isOpen = s.status === 'active' || open.has(s.id);
    return `<details class="stage s-${s.status}" data-id="${s.id}" ${isOpen ? 'open' : ''}><summary><span class="dot">${s.status === 'done' ? '✓' : fa(i + 1)}</span>
      <span class="sg"><strong>${esc(s.title)}</strong> ${helpBtn(s.help_text, s.help_image)}<small>${esc(s.status === 'active' ? 'در حال انجام' : L.step[s.status])}${s.due_at && s.status === 'active' ? ' · ' + countdown(s.due_at) : ''}</small></span></summary>
      <div class="stage-body">${s.summary ? `<p class="meta">${esc(s.summary)}</p>` : ''}${body}</div></details>`;
  };

  const general = logs.filter((l: any) => !l.step).slice(-8).reverse();
  const stages = (await Promise.all(steps.map(stageHtml))).join('');
  app.innerHTML = `<p><a href="#/">← همه پرونده‌ها</a></p>
    <div class="case-head2"><div><h2 style="margin:0">${esc(c.title)}</h2><div class="meta"><span>کد پیگیری: <bdi>${esc(c.tracking)}</bdi></span>${c.operator_name ? `<span>کارشناس: ${esc(c.operator_name)}</span>` : ''}</div></div>${badge(L.caseStatus[c.status] || c.status, c.status)}</div>
    ${c.total_amount ? `<p class="meta"><span>هزینه خدمت: ${money(c.total_amount)}</span><span>بیعانه: ${money(c.deposit_amount)}</span><span>باقی‌مانده: ${money(c.final_amount)}</span></p><p class="meta">هزینه‌های رسمی اصناف جدا از هزینه خدمت است و مستقیم به خود سامانه پرداخت می‌شود.</p>` : ''}
    <div class="stages">${stages}</div>
    ${general.length ? `<section class="block"><h3>اعلان‌های پرونده</h3><ul class="timeline">${general.map((l: any) => `<li><div class="meta"><strong>${esc(l.actor_name)}</strong><span>${when(l.created)}</span></div><p>${esc(l.body)}</p></li>`).join('')}</ul></section>` : ''}`;
  wire(id);
}

function wire(id: string) {
  app.querySelectorAll<HTMLDetailsElement>('details.stage').forEach((d) => d.addEventListener('toggle', () => {
    const cur = new Set<string>(JSON.parse(sessionStorage.getItem('bz_open_' + id) || '[]'));
    d.open ? cur.add(d.dataset.id!) : cur.delete(d.dataset.id!); sessionStorage.setItem('bz_open_' + id, JSON.stringify([...cur]));
  }));
  app.querySelectorAll<HTMLInputElement>('input[data-slot]').forEach((inp) => inp.addEventListener('change', async () => {
    const f = inp.files?.[0]; if (!f) return;
    try { const pf = await prepareFile(f); const fd = new FormData(); fd.set('case', id); fd.set('slot', inp.dataset.slot!); fd.set('file', pf); await api('/api/collections/documents/records', { method: 'POST', form: fd }); toast('مدرک ارسال شد'); renderCase(id); } catch (e) { err(e); }
  }));
  app.querySelectorAll<HTMLFormElement>('.fld').forEach((f) => f.addEventListener('submit', async (e) => {
    e.preventDefault();
    try { await api(`/api/collections/case_fields/records/${f.dataset.id}`, { method: 'PATCH', json: { value: new FormData(f).get('value') } }); toast('ذخیره شد'); } catch (x) { err(x); }
  }));
  app.querySelectorAll<HTMLFormElement>('.pay-form').forEach((f) => {
    f.querySelectorAll<HTMLInputElement>('input[name=method]').forEach((r) => r.addEventListener('change', () => f.querySelectorAll<HTMLElement>('.bank').forEach((b) => (b.hidden = b.dataset.for !== r.value))));
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const fd = new FormData(f); fd.set('status', 'submitted');
        const rf = fd.get('receipt') as File; if (rf?.size) fd.set('receipt', await prepareFile(rf)); else fd.delete('receipt');
        await api(`/api/collections/payments/records/${f.dataset.id}`, { method: 'PATCH', form: fd }); toast('رسید ثبت شد؛ پس از بررسی تأیید می‌شود'); renderCase(id);
      } catch (x) { err(x); }
    });
  });
  app.querySelectorAll<HTMLButtonElement>('.copy').forEach((b) => b.addEventListener('click', () => copyText(b.dataset.c!)));
  app.querySelectorAll<HTMLFormElement>('.msg-form').forEach((f) => f.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData(f); fd.set('case', id); fd.set('step', f.dataset.step!); fd.set('public', 'true');
      const af = fd.get('attachment') as File; if (af?.size) fd.set('attachment', await prepareFile(af)); else fd.delete('attachment');
      await api('/api/collections/case_logs/records', { method: 'POST', form: fd }); renderCase(id);
    } catch (x) { err(x); }
  }));
}

async function route() {
  try { const m = location.hash.match(/^#\/case\/(\w+)/); if (m) await renderCase(m[1]); else await renderList(); }
  catch (e) { app.innerHTML = `<div class="note">${esc((e as Error).message)}</div>`; }
}
addEventListener('hashchange', route);
boot();
setInterval(() => { const a = document.activeElement; if (!document.hidden && !(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName))) route(); }, 45000);
