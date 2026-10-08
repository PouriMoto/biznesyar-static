import { site } from '../config';
export const isStatic = (site as any).mode !== 'backend';
type Placement = 'hero' | 'service' | 'area' | 'article' | 'contact' | 'magnet';
// آیا فرم لید در این جایگاه فعال است؟ (کلید کلی + کلید هر جایگاه)
export const leadsOn = (p: Placement) => {
  const l = (site as any).leads;
  return !!l?.enabled && l.placements?.[p] !== false;
};
