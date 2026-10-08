import { site } from '../config';

const intl = (n: string) => {
  const d = n.replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/\D/g, '');
  if (d.startsWith('98')) return d;
  if (d.startsWith('0')) return '98' + d.slice(1);
  return d;
};

export const faDigits = (s: string) => s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
export const telHref = (n: string) => `tel:+${intl(n)}`;

export interface Channel { key: string; label: string; href: string; icon: string; external: boolean }

export function phones() {
  const c = site.contact as any;
  const list: { number: string; label: string }[] = c.phones?.length ? c.phones : c.phone ? [{ number: c.phone, label: 'تلفن' }] : [];
  return list.map((p) => ({ ...p, href: telHref(p.number), display: faDigits(p.number) }));
}

export function channels(): Channel[] {
  const c = site.contact;
  const out: Channel[] = [];
  const calls = phones().map((p, i) => ({ key: i === 0 ? 'call' : `call${i + 1}`, label: `${p.label}: ${p.display}`, href: p.href, icon: 'phone', external: false }));
  const map: Record<string, Channel[]> = {
    call: calls,
    whatsapp: c.whatsapp ? [{ key: 'whatsapp', label: 'واتساپ', href: `https://wa.me/${intl(c.whatsapp)}?text=${encodeURIComponent(site.cta.whatsappText)}`, icon: 'message', external: true }] : [],
    bale: c.bale ? [{ key: 'bale', label: 'بله', href: `https://ble.ir/${c.bale.replace('@', '')}`, icon: 'message', external: true }] : [],
    rubika: c.rubika ? [{ key: 'rubika', label: 'روبیکا', href: `https://rubika.ir/${c.rubika.replace('@', '')}`, icon: 'message', external: true }] : [],
    instagram: c.instagram ? [{ key: 'instagram', label: 'اینستاگرام', href: `https://instagram.com/${c.instagram.replace('@', '')}`, icon: 'instagram', external: true }] : []
  };
  site.cta.order.forEach((k) => out.push(...(map[k] ?? [])));
  return out;
}

export const sameAs = () => channels().filter((c) => c.key === 'instagram').map((c) => c.href);
