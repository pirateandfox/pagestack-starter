/** Text with any markup removed, for <title>, alt text and attributes. */
export const plainText = (s = '') => String(s).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
/** A colour value that is safe to drop into a stylesheet: #hex, rgb()/hsl()/oklch(), or a named colour. */
export const safeColor = (s?: string) => !!s && /^(#[0-9a-f]{3,8}|(rgb|hsl|oklch|oklab)a?\([\d\s.,%/+-]+\)|[a-z]+)$/i.test(s.trim());
