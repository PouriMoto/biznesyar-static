const faDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long', day: 'numeric' });
export const formatDate = (d: Date) => faDate.format(d);
export const toFa = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
export const readingMinutes = (body = '') => Math.max(1, Math.ceil(body.split(/\s+/).filter(Boolean).length / 180));
