// Field schemas for every block: what the editor's sidebar, inserter, List View and save
// validation read. Serialisable; the components live in components.ts.
//
// House rules (see CLAUDE.md):
// - Style options are named choices (background: default / muted / accent / inverse), never raw
//   colours or pixel values, so every theme can style them.
// - Headings use `heading()`: bold and italic allowed, rendered with set:html.
// - The first inline text field names the block in List View, so the title goes first.
import type { BlockSchema, Field, SchemaRegistry } from '@pirateandfox/pagestack/runtime';

const opt = (vals: [string, string][]) => vals.map(([value, label]) => ({ value, label }));
const text = (label: string, def = '', extra: Partial<Field> = {}): Field => ({ type: 'text', label, inline: true, default: def, ...extra });
const heading = (label = 'Title', def = '', extra: Partial<Field> = {}): Field => text(label, def, { marks: true, ...extra });
const rich = (label: string, def = '', extra: Partial<Field> = {}): Field => ({ type: 'richtext', label, inline: true, default: def, ...extra });
const image = (label = 'Image', extra: Partial<Field> = {}): Field => ({ type: 'image', label, inline: true, default: { src: '', alt: '' }, ...extra });
const link = (label = 'Link', def = ''): Field => ({ type: 'link', label, default: def });
const select = (label: string, def: string, options: [string, string][], extra: Partial<Field> = {}): Field => ({ type: 'select', label, default: def, options: opt(options), group: 'style', ...extra });
const bool = (label: string, def = false, extra: Partial<Field> = {}): Field => ({ type: 'boolean', label, default: def, group: 'style', ...extra });

/** Every section has these: background, spacing and an anchor for links like /#contact. */
const section = (bg = 'default'): Record<string, Field> => ({
  background: select('Background', bg, [['default', 'Default'], ['muted', 'Muted'], ['accent', 'Accent'], ['inverse', 'Inverse']]),
  padding: select('Spacing', 'normal', [['normal', 'Normal'], ['compact', 'Compact'], ['roomy', 'Roomy'], ['none', 'None']]),
  anchor: { type: 'text', label: 'Anchor', default: '', group: 'advanced', help: 'Lets a link jump here, e.g. /#contact' },
});
const head = (title = '', eyebrow = ''): Record<string, Field> => ({
  title: heading('Title', title),
  eyebrow: text('Eyebrow', eyebrow, { help: 'Small line above the title. Blank for none.' }),
  intro: rich('Intro', ''),
});
const align = (def = 'left') => select('Alignment', def, [['left', 'Left'], ['center', 'Centred']]);
const item = (label: string, fields: Record<string, Field>, extra: Partial<BlockSchema> = {}): BlockSchema => ({ label, hidden: true, fields, ...extra });

export const schemas: SchemaRegistry = {
  /* ---------- Openers ---------- */
  hero: {
    label: 'Hero',
    description: 'The opening of a page: a big title, a line or two and buttons, with or without an image.',
    category: 'Openers',
    keywords: ['banner', 'header', 'intro', 'masthead'],
    blocks: ['button'],
    fields: {
      title: heading('Title', 'Small buildings, <em>carefully</em> made'),
      eyebrow: text('Eyebrow', ''),
      text: rich('Text', '<p>One or two sentences that say what you do and who it is for.</p>'),
      image: image(),
      layout: select('Layout', 'split', [['split', 'Split: text and image side by side'], ['image', 'Full image behind the text'], ['minimal', 'Text only']]),
      align: align('left'),
      ...section(),
    },
  },
  'page-header': {
    label: 'Page header',
    description: 'Title and a short intro at the top of an inner page.',
    category: 'Openers',
    keywords: ['title', 'heading', 'intro'],
    fields: {
      title: heading('Title', 'Page title'),
      eyebrow: text('Eyebrow', ''),
      intro: rich('Intro', ''),
      align: align('left'),
      ...section('muted'),
    },
  },

  /* ---------- Text and media ---------- */
  content: {
    label: 'Content',
    description: 'A section to fill with headings, text, images, quotes and buttons, like a page in a document.',
    category: 'Text and media',
    keywords: ['text', 'section', 'group', 'container', 'prose', 'article'],
    blocks: ['heading', 'paragraph', 'image', 'button', 'quote', 'divider'],
    fields: {
      width: select('Width', 'narrow', [['narrow', 'Narrow (reading)'], ['normal', 'Normal'], ['wide', 'Wide']]),
      align: align('left'),
      ...section(),
    },
  },
  'image-text': {
    label: 'Image and text',
    description: 'An image on one side, a title, text and buttons on the other.',
    category: 'Text and media',
    keywords: ['media', 'split', 'story', 'about', 'two column'],
    blocks: ['button'],
    fields: {
      title: heading('Title', 'A heading for this part of the story'),
      eyebrow: text('Eyebrow', ''),
      text: rich('Text', '<p>Two or three sentences. Keep it short; people read the title and skim the rest.</p>'),
      image: image(),
      side: select('Image side', 'left', [['left', 'Left'], ['right', 'Right']]),
      ratio: select('Image shape', 'tall', [['tall', 'Tall'], ['square', 'Square'], ['wide', 'Wide']]),
      ...section(),
    },
  },

  /* ---------- Explain ---------- */
  features: {
    label: 'Feature grid',
    description: 'Short points in a grid: what you offer, how it works, why choose you.',
    category: 'Explain',
    keywords: ['features', 'benefits', 'services', 'grid', 'icons', 'columns'],
    blocks: ['feature'],
    fields: {
      ...head('What we do', ''),
      columns: select('Columns', '3', [['2', 'Two'], ['3', 'Three'], ['4', 'Four']]),
      style: select('Style', 'plain', [['plain', 'Plain'], ['cards', 'Cards'], ['numbered', 'Numbered']]),
      align: align('left'),
      ...section(),
    },
  },
  stats: {
    label: 'Numbers',
    description: 'A row of big numbers with a label under each.',
    category: 'Explain',
    keywords: ['stats', 'statistics', 'counter', 'figures', 'impact'],
    blocks: ['stat'],
    fields: { ...head('', ''), ...section() },
  },
  faq: {
    label: 'FAQ',
    description: 'Questions that open to show their answer.',
    category: 'Explain',
    keywords: ['questions', 'accordion', 'answers', 'help'],
    blocks: ['faq-item'],
    fields: { ...head('Questions people ask', ''), layout: select('Layout', 'side', [['side', 'Title beside the questions'], ['stacked', 'Title above the questions']]), ...section() },
  },

  /* ---------- Proof ---------- */
  testimonials: {
    label: 'Testimonials',
    description: 'What clients say: one big quote, or several in a grid.',
    category: 'Proof',
    keywords: ['quotes', 'reviews', 'clients', 'social proof'],
    blocks: ['testimonial'],
    fields: { ...head('', ''), layout: select('Layout', 'grid', [['grid', 'Grid'], ['single', 'One large quote']]), ...section() },
  },
  logos: {
    label: 'Logo strip',
    description: 'A row of client, partner or press logos.',
    category: 'Proof',
    keywords: ['clients', 'partners', 'press', 'brands', 'trusted by'],
    blocks: ['logo'],
    fields: { title: heading('Title', 'Trusted by'), ...section() },
  },

  /* ---------- Act ---------- */
  cta: {
    label: 'Call to action',
    description: 'A short, strong band that asks people to do one thing.',
    category: 'Act',
    keywords: ['cta', 'banner', 'contact', 'signup', 'band'],
    blocks: ['button'],
    fields: {
      title: heading('Title', 'Have a building in mind?'),
      text: rich('Text', '<p>Tell us about it. We reply within two working days.</p>'),
      layout: select('Layout', 'center', [['center', 'Centred'], ['split', 'Title left, buttons right']]),
      ...section('accent'),
    },
  },

  /* ---------- Blocks inside sections ---------- */
  heading: {
    label: 'Heading',
    hidden: true, // only inside sections
    description: 'A heading inside a content section.',
    category: 'Text and media',
    fields: {
      text: heading('Text', 'Heading'),
      level: select('Level', 'h2', [['h2', 'Heading (H2)'], ['h3', 'Subheading (H3)'], ['h4', 'Small heading (H4)']], { group: 'content' }),
    },
  },
  paragraph: {
    label: 'Text',
    hidden: true, // only inside sections
    description: 'Paragraphs, lists and links.',
    category: 'Text and media',
    keywords: ['paragraph', 'rich text', 'body'],
    fields: { text: rich('Text', '<p>Write something.</p>'), size: select('Size', 'normal', [['normal', 'Normal'], ['lede', 'Large (intro)']]) },
  },
  image: {
    label: 'Image',
    hidden: true, // only inside sections
    description: 'One image with an optional caption.',
    category: 'Text and media',
    keywords: ['picture', 'photo', 'figure'],
    fields: {
      image: image(),
      caption: text('Caption', ''),
      ratio: select('Shape', 'auto', [['auto', 'As uploaded'], ['wide', 'Wide'], ['square', 'Square'], ['tall', 'Tall']]),
    },
  },
  button: {
    label: 'Button',
    hidden: true, // only inside sections
    description: 'A link styled as a button.',
    category: 'Text and media',
    keywords: ['link', 'cta'],
    fields: {
      label: text('Label', 'Get in touch'),
      href: link('Link', '/#contact'),
      style: select('Style', 'solid', [['solid', 'Solid'], ['outline', 'Outline'], ['text', 'Text link']], { group: 'content' }),
    },
  },
  quote: {
    label: 'Quote',
    hidden: true, // only inside sections
    description: 'A pull quote with who said it.',
    category: 'Text and media',
    keywords: ['pull quote', 'blockquote', 'citation'],
    fields: { text: heading('Quote', 'A sentence worth setting large.'), cite: text('Who said it', '') },
  },
  divider: {
    label: 'Divider',
    hidden: true, // only inside sections
    description: 'A line or a gap between blocks.',
    category: 'Text and media',
    keywords: ['separator', 'spacer', 'line', 'hr', 'gap'],
    fields: { style: select('Style', 'line', [['line', 'Line'], ['space', 'Space only']], { group: 'content' }), size: select('Size', 'normal', [['small', 'Small'], ['normal', 'Normal'], ['large', 'Large']], { group: 'content' }) },
  },

  /* ---------- Items drawn by their parent ---------- */
  feature: item('Feature', { title: heading('Title', 'A clear point'), text: rich('Text', '<p>One or two sentences about it.</p>'), href: link('Link (optional)') }),
  stat: item('Number', { value: text('Number', '120'), label: text('Label', 'Projects finished') }),
  'faq-item': item('Question', { question: text('Question', 'A question people ask?'), answer: rich('Answer', '<p>A short, direct answer.</p>') }),
  testimonial: item('Testimonial', { quote: rich('Quote', '<p>What the client said, in their words.</p>'), name: text('Name', 'Name'), role: text('Role or company', ''), image: image('Photo') }),
  logo: item('Logo', { image: image('Logo'), href: link('Link (optional)') }),
};
