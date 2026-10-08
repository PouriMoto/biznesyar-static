import type { APIRoute } from 'astro';
import { site } from '../config';
import { getArticles, enabledServices } from '../lib/content';
import { abs } from '../lib/seo';

export const GET: APIRoute = async () => {
  const L: string[] = [`# ${site.brand.name_fa} — محتوای کامل`, '', `> ${site.seo.defaultDescription}`, ''];
  for (const s of enabledServices() as any[]) {
    L.push(`## ${s.title}`, `آدرس: ${abs(`/services/${s.slug}/`)}`, '', s.description ?? s.short, '');
    if (s.steps) { L.push('### مراحل'); s.steps.forEach((x: any, i: number) => L.push(`${i + 1}. ${x.title}: ${x.text}`)); L.push(''); }
    if (s.documents) { L.push('### مدارک معمول'); s.documents.forEach((d: any) => L.push(`- ${d.title}${d.note ? ` (${d.note})` : ''}`)); if (s.documentsNote) L.push('', s.documentsNote); L.push(''); }
    if (s.faq) { L.push('### پرسش‌های متداول'); s.faq.forEach((f: any) => L.push(`- ${f.q} ${f.a}`)); L.push(''); }
  }
  for (const a of await getArticles()) {
    L.push(`## ${a.data.title}`, `آدرس: ${abs(`/articles/${a.id}/`)}`, `دسته: ${a.data.category}`, '', a.body ?? '', '');
    if (a.data.faq.length) { L.push('### پرسش‌های متداول'); a.data.faq.forEach((f) => L.push(`- ${f.q} ${f.a}`)); L.push(''); }
  }
  return new Response(L.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
