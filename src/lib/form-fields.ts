// Turning a form block's fields into input names: "Wedding date" → wedding_date. Unique per form,
// and never one of the names the form uses for itself.
import { RESERVED } from './form-server';

export function fieldNames(labels: string[]): string[] {
  const seen = new Set(RESERVED);
  return labels.map((label, i) => {
    let base = String(label ?? '').replace(/<[^>]*>/g, '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 36) || `field_${i + 1}`;
    if (/^\d/.test(base)) base = `f_${base}`;
    let name = base, n = 2;
    while (seen.has(name)) name = `${base}_${n++}`;
    seen.add(name);
    return name;
  });
}
