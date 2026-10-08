#!/usr/bin/env python3
"""ساخت PDF لید مگنت «فهرست مدارک» از روی public/flows/<service>.json و تنظیمات سایت.
اجرا: pip install playwright && playwright install chromium && python3 scripts/make-pdf.py business-license"""
import json, sys, html, pathlib
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parent.parent
svc = sys.argv[1] if len(sys.argv) > 1 else "business-license"
flow = json.loads((root / f"public/flows/{svc}.json").read_text(encoding="utf-8"))
cfg = json.loads((root / "src/config/site.config.json").read_text(encoding="utf-8"))
c = cfg["contact"]; th = cfg["theme"]
e = html.escape
FA = "۰۱۲۳۴۵۶۷۸۹"
fa = lambda s: "".join(FA[int(ch)] if ch.isdigit() else ch for ch in str(s))
mods = {m["key"]: m["label"] for m in flow.get("modules", [])}

def rows(items):
    out = ""
    for d in items:
        tag = "الزامی" if d.get("required", True) else "اختیاری"
        cond = f"<br><small>فقط در صورت: {e(mods.get(d['module'], d['module']))}</small>" if d.get("module") else ""
        hint = (d.get("help") or {}).get("text", "")
        out += f"<tr><td class='box'>☐</td><td><strong>{e(d.get('title') or d.get('label'))}</strong>{cond}<br><small>{e(hint)}</small></td><td><span class='tag {'req' if tag=='الزامی' else ''}'>{tag}</span></td></tr>"
    return out

phones = " · ".join(fa(p["number"]) for p in c.get("phones", []))
page = f"""<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><style>
@font-face {{ font-family: V; src: url('file://{root}/public/fonts/Vazirmatn-Variable.woff2'); font-weight: 100 900; }}
@page {{ size: A4; margin: 16mm 14mm; }}
body {{ font-family: V, sans-serif; color: {th['text']}; line-height: 1.85; font-size: 11.5pt; }}
header {{ background: {th['primary']}; color: #fff; padding: 14mm 12mm; border-radius: 10px; margin-bottom: 8mm; }}
header h1 {{ margin: 0 0 2mm; font-size: 21pt; }} header p {{ margin: 0; opacity: .9; }}
h2 {{ color: {th['primary']}; border-bottom: 2px solid {th['primary']}; padding-bottom: 1mm; margin: 7mm 0 3mm; font-size: 14pt; }}
table {{ width: 100%; border-collapse: collapse; }} td {{ padding: 2.2mm 2mm; border-bottom: 1px solid #dde3e8; vertical-align: top; }}
td.box {{ width: 8mm; font-size: 15pt; color: {th['primary']}; }} small {{ color: #5b6b7a; }}
.tag {{ font-size: 9pt; padding: 0 3mm; border-radius: 99px; border: 1px solid #c9d2da; white-space: nowrap; }} .tag.req {{ background: {th['accent']}33; border-color: {th['accent']}; }}
ul {{ margin: 0; padding-inline-start: 6mm; }} .note {{ background: #f3f7f8; border-inline-start: 4px solid {th['accent']}; padding: 3mm 4mm; border-radius: 6px; margin-top: 4mm; font-size: 10.5pt; }}
footer {{ margin-top: 9mm; padding-top: 4mm; border-top: 1px solid #dde3e8; font-size: 10.5pt; }}
</style></head><body>
<header><h1>فهرست مدارک و اطلاعات {e(flow['title'])}</h1><p>راهنمای آماده‌سازی قبل از شروع؛ {e(cfg['brand']['name_fa'])}</p></header>
<h2>پیش‌نیازها (قبل از هر اقدام)</h2><ul>{''.join(f'<li>{e(p)}</li>' for p in flow.get('prerequisites', []))}</ul>
<h2>مدارک لازم</h2><table>{rows(flow.get('documents', []))}</table>
<h2>اطلاعات لازم</h2><table>{rows(flow.get('fields', []))}</table>
<div class="note">فهرست دقیق بسته به رسته شغلی و محل کسب فرق می‌کند. موارد دارای شرط (بهداشت، پلیس اماکن، مهارت فنی، شریک) فقط برای رسته‌های مشمول لازم است. برای فهرست مخصوص خودتان مشاوره رایگان بگیرید. هزینه‌های رسمی اصناف جدا از هزینه خدمات است و مستقیم به سامانه مربوطه پرداخت می‌شود.</div>
<footer><strong>{e(cfg['brand']['name_fa'])}</strong> — {e(c.get('address',''))}<br>تلفن: <span dir="ltr">{phones}</span> · ساعات کاری: {e(c.get('hours',''))}<br>{e(cfg['brand']['url'])}</footer>
</body></html>"""
tmp = root / "scripts" / "_pdf.html"; tmp.write_text(page, encoding="utf-8")
out = root / "public/downloads" / f"{svc}-documents.pdf"; out.parent.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.goto(f"file://{tmp}"); pg.wait_for_timeout(500)
    pg.pdf(path=str(out), format="A4", print_background=True); b.close()
tmp.unlink(); print("wrote", out, out.stat().st_size, "bytes")
