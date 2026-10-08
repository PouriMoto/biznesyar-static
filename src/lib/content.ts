import { getCollection, type CollectionEntry } from 'astro:content';
import { site } from '../config';
import servicesData from '../data/services.json';
import regions from '../data/regions.json';

export const showDrafts = import.meta.env.DEV || process.env.SHOW_DRAFTS === '1';

export async function getArticles(): Promise<CollectionEntry<'articles'>[]> {
  const all = await getCollection('articles', ({ data }) => showDrafts || !data.draft);
  return all.sort((a, b) => +b.data.publishedAt - +a.data.publishedAt);
}

export type Service = (typeof servicesData)[number] & { enabled: boolean };
export const allServices = (): Service[] =>
  servicesData.map((s) => ({ ...s, enabled: !!site.services.find((x) => x.slug === s.slug)?.enabled }));
export const enabledServices = () => allServices().filter((s) => s.enabled);
export const getRegions = () => regions;

export function related(all: CollectionEntry<'articles'>[], self: CollectionEntry<'articles'>, n = 3) {
  const score = (e: CollectionEntry<'articles'>) =>
    (e.data.service && e.data.service === self.data.service ? 2 : 0) +
    (e.data.region && e.data.region === self.data.region ? 2 : 0) +
    e.data.tags.filter((t) => self.data.tags.includes(t)).length +
    (e.data.category === self.data.category ? 1 : 0);
  return all.filter((e) => e.id !== self.id).map((e) => ({ e, s: score(e) })).sort((a, b) => b.s - a.s).slice(0, n).map((x) => x.e);
}
