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

  /* ---------- Feeds ---------- */
  articles: {
    label: 'Articles feed',
    description: 'The latest articles from the Journal, as cards or a list.',
    category: 'Feeds',
    keywords: ['blog', 'news', 'posts', 'journal', 'latest', 'articles'],
    fields: {
      ...head('From the journal', ''),
      count: select('How many', '3', [['2', 'Two'], ['3', 'Three'], ['4', 'Four'], ['6', 'Six']]),
      layout: select('Layout', 'grid', [['grid', 'Cards'], ['list', 'List']]),
      tag: { type: 'text', label: 'Only this tag', default: '', help: 'Blank shows every article.' },
      more: text('Link to all', 'All articles', { inline: false, help: 'Blank for no link.' }),
      ...section(),
    },
  },
  events: {
    label: 'Events feed',
    description: 'Upcoming events, soonest first, with dates, places and ticket links.',
    category: 'Feeds',
    keywords: ['events', 'calendar', 'whats on', 'upcoming', 'dates', 'gigs', 'classes'],
    fields: {
      ...head('What’s on', ''),
      count: select('How many', '3', [['2', 'Two'], ['3', 'Three'], ['4', 'Four'], ['6', 'Six']]),
      layout: select('Layout', 'list', [['list', 'List'], ['cards', 'Cards']]),
      more: text('Link to all', 'All events', { inline: false, help: 'Blank for no link.' }),
      empty: text('When nothing is planned', 'Nothing planned right now.', { inline: false }),
      ...section(),
    },
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

  /* ---------- Text and media (more) ---------- */
  embed: {
    label: 'Embed',
    description: 'A video, audio player, booking calendar or map from another site, pasted as a link.',
    category: 'Text and media',
    keywords: ['video', 'youtube', 'vimeo', 'audio', 'spotify', 'soundcloud', 'calendly', 'booking', 'iframe'],
    fields: {
      ...head('', ''),
      url: { type: 'link', label: 'Link to embed', default: '', help: 'A YouTube, Vimeo, Spotify, SoundCloud or Calendly link, or any page that allows embedding (https only).' },
      shape: select('Shape', 'wide', [['wide', 'Video (16:9)'], ['square', 'Square'], ['audio', 'Audio player (short)'], ['tall', 'Booking calendar (tall)']]),
      caption: text('Caption', ''),
      ...section(),
    },
  },
  gallery: {
    label: 'Gallery',
    description: 'A grid of photos that open full size when clicked.',
    category: 'Text and media',
    keywords: ['photos', 'images', 'portfolio', 'lightbox', 'masonry', 'grid'],
    blocks: ['photo'],
    fields: {
      ...head('', ''),
      layout: select('Layout', 'grid', [['grid', 'Even grid'], ['masonry', 'Masonry (keeps each photo\'s shape)']]),
      columns: select('Columns', '3', [['2', 'Two'], ['3', 'Three'], ['4', 'Four']]),
      lightbox: bool('Open photos full size when clicked', true),
      ...section(),
    },
  },
  slideshow: {
    label: 'Slideshow',
    description: 'Large photos, one at a time, with arrows and swipe.',
    category: 'Text and media',
    keywords: ['carousel', 'slider', 'photos', 'swipe'],
    blocks: ['slide'],
    fields: { ...head('', ''), shape: select('Shape', 'wide', [['wide', 'Wide'], ['hero', 'Very wide'], ['tall', 'Tall']]), ...section() },
  },

  /* ---------- Explain (more) ---------- */
  cards: {
    label: 'Cards',
    description: 'Linked cards with a picture, a title and a line: services, areas of practice, rooms.',
    category: 'Explain',
    keywords: ['cards', 'tiles', 'links', 'grid', 'practice areas'],
    blocks: ['card'],
    fields: {
      ...head('', ''),
      columns: select('Columns', '3', [['2', 'Two'], ['3', 'Three'], ['4', 'Four']]),
      style: select('Style', 'image', [['image', 'Picture on top'], ['bordered', 'Bordered, no picture'], ['overlay', 'Title on the picture']]),
      ...section(),
    },
  },
  compare: {
    label: 'Comparison',
    description: 'A table that compares options side by side. Write yes or no for a tick or a dash.',
    category: 'Explain',
    keywords: ['table', 'compare', 'versus', 'vs', 'matrix', 'plans'],
    blocks: ['compare-row'],
    fields: {
      ...head('', ''),
      col1: text('Column 1', 'Option one'),
      col2: text('Column 2', 'Option two'),
      col3: text('Column 3', '', { help: 'Blank for two columns.' }),
      highlight: select('Highlight', 'none', [['none', 'None'], ['1', 'Column 1'], ['2', 'Column 2'], ['3', 'Column 3']]),
      ...section(),
    },
  },
  tabs: {
    label: 'Tabs',
    description: 'Content split into tabs, one shown at a time.',
    category: 'Explain',
    keywords: ['tabs', 'toggle', 'switch', 'panels'],
    blocks: ['tab'],
    fields: { ...head('', ''), ...section() },
  },
  timeline: {
    label: 'Timeline',
    description: 'Dated moments in order: a history, a project, a programme.',
    category: 'Explain',
    keywords: ['history', 'milestones', 'story', 'dates', 'chronology'],
    blocks: ['moment'],
    fields: { ...head('', ''), ...section() },
  },

  /* ---------- Offer ---------- */
  pricing: {
    label: 'Pricing',
    description: 'Plans or packages side by side, with an optional monthly and yearly switch.',
    category: 'Offer',
    keywords: ['plans', 'packages', 'prices', 'membership', 'tiers', 'subscription'],
    blocks: ['plan'],
    fields: {
      ...head('', ''),
      yearly: bool('Monthly and yearly switch', false, { help: 'Each plan then shows its yearly price when the switch is on yearly.' }),
      monthlyLabel: text('Monthly label', 'Monthly', { group: 'style' }),
      yearlyLabel: text('Yearly label', 'Yearly (2 months free)', { group: 'style' }),
      ...section(),
    },
  },
  menu: {
    label: 'Menu',
    description: 'A menu or price list in groups, with prices and dietary marks.',
    category: 'Offer',
    keywords: ['menu', 'food', 'drinks', 'price list', 'restaurant', 'cafe', 'dietary'],
    blocks: ['menu-group'],
    fields: {
      ...head('', ''),
      columns: select('Columns', '2', [['1', 'One'], ['2', 'Two']]),
      key: text('Key', 'V vegetarian · VG vegan · GF gluten free', { help: 'Explains the marks. Blank to hide.' }),
      ...section(),
    },
  },
  services: {
    label: 'Services list',
    description: 'A list of services, each with a line, a price and how long it takes.',
    category: 'Offer',
    keywords: ['services', 'treatments', 'price list', 'offer', 'rates'],
    blocks: ['service'],
    fields: { ...head('', ''), ...section() },
  },
  products: {
    label: 'Products or rooms',
    description: 'Things to buy or book: a picture, a price and a button each.',
    category: 'Offer',
    keywords: ['products', 'rooms', 'shop', 'store', 'items', 'book', 'buy'],
    blocks: ['product'],
    fields: { ...head('', ''), columns: select('Columns', '3', [['2', 'Two'], ['3', 'Three'], ['4', 'Four']]), ...section() },
  },
  donate: {
    label: 'Donate',
    description: 'Suggested amounts that go to your donation page.',
    category: 'Offer',
    keywords: ['donate', 'give', 'support', 'charity', 'fundraising'],
    fields: {
      title: heading('Title', 'Help keep the river clean'),
      text: rich('Text', '<p>Every gift pays for a volunteer morning on the water.</p>'),
      amounts: { type: 'tags', label: 'Suggested amounts', default: ['10', '25', '50', '100'], help: 'Numbers only.' },
      currency: text('Currency sign', '$', { inline: false }),
      href: link('Donation page', 'https://example.org/donate'),
      param: { type: 'text', label: 'Amount parameter', default: 'amount', group: 'advanced', help: 'The donation page reads the amount from this part of the link, e.g. ?amount=25.' },
      button: text('Button label', 'Donate'),
      ...section('muted'),
    },
  },
  timetable: {
    label: 'Weekly timetable',
    description: 'Classes or sessions that repeat every week, by day.',
    category: 'Offer',
    keywords: ['schedule', 'classes', 'timetable', 'week', 'opening', 'sessions'],
    blocks: ['session'],
    fields: { ...head('', ''), ...section() },
  },

  /* ---------- Proof (more) ---------- */
  'case-study': {
    label: 'Case study',
    description: 'One project told briefly: the facts, what you did and how it turned out.',
    category: 'Proof',
    keywords: ['case study', 'project', 'result', 'portfolio', 'work'],
    fields: {
      title: heading('Title', 'A project'),
      eyebrow: text('Eyebrow', 'Case study'),
      text: rich('Text', '<p>What the client needed, what you did and what changed.</p>'),
      image: image(),
      facts: { type: 'list', label: 'Facts', itemLabel: 'label', default: [], fields: { label: { type: 'text', label: 'Label', default: '' }, value: { type: 'text', label: 'Value', default: '' } } },
      quote: rich('Client quote', ''),
      cite: text('Who said it', ''),
      href: link('Link to the full story'),
      side: select('Image side', 'left', [['left', 'Left'], ['right', 'Right']]),
      ...section(),
    },
  },

  /* ---------- People ---------- */
  team: {
    label: 'Team',
    description: 'People with a photo, name and role.',
    category: 'People',
    keywords: ['team', 'staff', 'people', 'about', 'doctors', 'lawyers', 'teachers'],
    blocks: ['person'],
    fields: {
      ...head('', ''),
      columns: select('Columns', '4', [['2', 'Two'], ['3', 'Three'], ['4', 'Four']]),
      shape: select('Photo shape', 'portrait', [['portrait', 'Portrait'], ['circle', 'Circle']]),
      ...section(),
    },
  },
  profile: {
    label: 'Profile',
    description: 'One person in depth: photo, role, biography and details.',
    category: 'People',
    keywords: ['bio', 'biography', 'about me', 'person', 'founder'],
    blocks: ['button'],
    fields: {
      title: heading('Name', 'Name'),
      eyebrow: text('Role', ''),
      text: rich('Biography', '<p>A short biography.</p>'),
      image: image('Photo'),
      details: { type: 'list', label: 'Details', itemLabel: 'label', default: [], fields: { label: { type: 'text', label: 'Label', default: '' }, value: { type: 'text', label: 'Value', default: '' } } },
      ...section(),
    },
  },

  /* ---------- Act (more) ---------- */
  form: {
    label: 'Form',
    description: 'A contact or enquiry form. Add, remove and reorder its fields; it emails you or sends to your CRM.',
    category: 'Act',
    keywords: ['contact', 'form', 'enquiry', 'booking request', 'quote', 'email', 'rsvp'],
    blocks: ['form-field'],
    fields: {
      ...head('Get in touch', ''),
      formName: { type: 'text', label: 'Form name', default: 'Contact form', help: 'Names the email subject and the webhook’s form_name.' },
      button: text('Button label', 'Send'),
      success: rich('Thank-you message', '<p>Thank you. We will be in touch within two working days.</p>'),
      notice: rich('Small print', '', { help: 'e.g. how you use their details, with a link to your privacy policy.' }),
      next: { type: 'link', label: 'Thank-you page', default: '/thanks/', group: 'advanced', help: 'Where people land when their browser has JavaScript off.' },
      layout: select('Layout', 'stacked', [['stacked', 'Title above the form'], ['side', 'Title beside the form']]),
      ...section(),
    },
  },
  newsletter: {
    label: 'Newsletter sign-up',
    description: 'An email box and a button.',
    category: 'Act',
    keywords: ['newsletter', 'subscribe', 'email', 'mailing list', 'signup', 'mailchimp'],
    fields: {
      title: heading('Title', 'Get the newsletter'),
      text: rich('Text', '<p>Once a month. No spam.</p>'),
      button: text('Button label', 'Subscribe', { inline: false }),
      placeholder: text('Email placeholder', 'you@example.com', { inline: false }),
      name: bool('Ask for a first name', false, { group: 'content' }),
      success: rich('Thank-you message', '<p>Thanks! Check your inbox to confirm.</p>', { inline: false }),
      notice: rich('Small print', ''),
      layout: select('Layout', 'split', [['split', 'Title left, form right'], ['center', 'Centred']]),
      ...section('muted'),
    },
  },
  map: {
    label: 'Map and hours',
    description: 'Where you are, when you are open and how to reach you.',
    category: 'Act',
    keywords: ['map', 'location', 'address', 'hours', 'opening times', 'directions', 'contact'],
    fields: {
      title: heading('Title', 'Visit us'),
      address: { type: 'textarea', label: 'Address', default: '' },
      hours: { type: 'list', label: 'Opening hours', itemLabel: 'days', default: [], fields: { days: { type: 'text', label: 'Days', default: '' }, time: { type: 'text', label: 'Hours', default: '' } } },
      phone: text('Phone', '', { inline: false }),
      email: text('Email', '', { inline: false }),
      text: rich('Note', ''),
      map: select('Map', 'embed', [['embed', 'Interactive map'], ['none', 'No map']]),
      query: { type: 'text', label: 'Map search', default: '', help: 'What to look up on the map. Blank uses the address.' },
      ...section(),
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
  photo: item('Photo', { image: image(), caption: text('Caption', '') }),
  slide: item('Slide', { image: image(), caption: text('Caption', '') }),
  card: item('Card', { title: heading('Title', 'A card'), text: rich('Text', '<p>One line about it.</p>'), image: image(), href: link('Link') }),
  'compare-row': item('Row', { label: text('Label', 'A feature'), c1: text('Column 1', 'yes'), c2: text('Column 2', 'no'), c3: text('Column 3', '') }),
  tab: { label: 'Tab', hidden: true, blocks: ['heading', 'paragraph', 'image', 'button', 'quote', 'divider'], fields: { title: text('Tab label', 'Tab') } },
  moment: item('Moment', { date: text('Date', '2026'), title: heading('Title', 'Something happened'), text: rich('Text', '') }),
  plan: item('Plan', {
    name: text('Name', 'Plan'),
    price: text('Price', '$20'),
    yearlyPrice: text('Yearly price', '', { help: 'Shown when the switch is on yearly.' }),
    period: text('Per', '/month'),
    yearlyPeriod: text('Per (yearly)', '/year'),
    text: rich('Description', ''),
    features: rich('What is included', '<ul><li>One thing</li><li>Another thing</li></ul>'),
    button: text('Button label', 'Choose'),
    href: link('Button link', '/#contact'),
    featured: bool('Highlight this plan', false, { group: 'content' }),
    badge: text('Badge', '', { help: 'e.g. Most popular' }),
  }),
  'menu-group': { label: 'Menu group', hidden: true, blocks: ['menu-item'], fields: { title: heading('Title', 'Starters'), note: text('Note', '') } },
  'menu-item': item('Dish', {
    name: text('Name', 'A dish'),
    text: text('Description', ''),
    price: text('Price', '12', { help: 'A number, or words like "market".' }),
    marks: { type: 'tags', label: 'Marks', default: [], help: 'Short marks such as V, VG, GF.' },
  }),
  service: item('Service', { title: heading('Title', 'A service'), text: rich('Text', ''), price: text('Price', ''), duration: text('Duration', ''), href: link('Link (optional)') }),
  product: item('Product', { title: heading('Name', 'A product'), text: rich('Text', ''), image: image(), price: text('Price', ''), badge: text('Badge', ''), button: text('Button label', 'Book'), href: link('Button link') }),
  session: item('Session', {
    day: select('Day', 'mon', [['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'], ['thu', 'Thursday'], ['fri', 'Friday'], ['sat', 'Saturday'], ['sun', 'Sunday']], { group: 'content' }),
    time: text('Time', '7:00'),
    name: text('Name', 'A class'),
    who: text('With', ''),
    note: text('Note', ''),
  }),
  'form-field': item('Field', {
    label: text('Label', 'Your name'),
    kind: select('Type', 'text', [['text', 'Short text'], ['email', 'Email'], ['phone', 'Phone'], ['textarea', 'Message (long text)'], ['select', 'Dropdown'], ['choice', 'Choose one (buttons)'], ['checkbox', 'Tick box'], ['date', 'Date'], ['number', 'Number']], { group: 'content' }),
    required: bool('Required', false, { group: 'content' }),
    options: { type: 'tags', label: 'Choices', default: [], help: 'For Dropdown and Choose one.' },
    placeholder: { type: 'text', label: 'Placeholder', default: '' },
    help: text('Help text', ''),
    width: select('Width', 'full', [['full', 'Full'], ['half', 'Half (two side by side)']]),
  }),
  person: item('Person', { name: heading('Name', 'Name'), role: text('Role', ''), text: rich('Short bio', ''), image: image('Photo'), href: link('Profile link') }),
};
