// PageStack's `sections` module: what the editor can build pages from.
//   schemas      field definitions per node type (schema.ts)
//   presets      the "Add section" library, each arriving filled in; also what /blocks shows
//   pageFields   the Page tab, stored in page.layout
//   templates    starting points for "Add page"
//   globals      site-wide settings edited on their own screens (site details, theme)
import type { Field, GlobalDoc, Node, PageTemplate, Preset } from '@pirateandfox/pagestack/runtime';
import { newId } from '@pirateandfox/pagestack/runtime';
import { fontPairings, themes } from '../data/themes';
import { schemas } from './schema';

export { schemas };

const n = (type: string, settings: Record<string, any> = {}, blocks?: Node[]): Node => ({ id: newId(), type, settings, ...(blocks ? { blocks } : {}) });
/** A node with its schema defaults, overridden by `settings`. */
const make = (type: string, settings: Record<string, any> = {}, blocks?: Node[]) => {
  const defaults = Object.fromEntries(Object.entries(schemas[type].fields).map(([k, f]) => [k, structuredClone(f.default ?? '')]));
  return n(type, { ...defaults, ...settings }, blocks);
};
const img = (name: string, alt: string) => ({ src: `/images/${name}.svg`, alt });
const button = (label: string, href: string, style = 'solid') => make('button', { label, href, style });

/**
 * The block library. Each entry is one way to use a block; /blocks shows them all in this order,
 * and "Add section" offers them grouped by the block's category.
 */
export const presets: Preset[] = [
  {
    label: 'Hero, split',
    description: 'Title, a line, buttons, and a tall image beside them.',
    create: () => make('hero', {
      eyebrow: 'Architecture and interiors',
      title: 'Small buildings, <em>carefully</em> made',
      text: '<p>We design homes, studios and shopfronts for people who care how a room feels at seven in the morning. Twelve years, sixty buildings, one coastline.</p>',
      image: img('tall-1', 'A low timber house on a grassy slope at dusk'),
      layout: 'split',
    }, [button('See our work', '/#work'), button('Start a project', '/#contact', 'outline')]),
  },
  {
    label: 'Hero, full image',
    description: 'A large image behind the title.',
    create: () => make('hero', {
      eyebrow: 'Harbour Street Studio, 2025',
      title: 'Light first. Everything else follows.',
      text: '<p>A former net store turned into a studio and two flats.</p>',
      image: img('hero', 'The converted net store seen from the harbour wall'),
      layout: 'image',
    }, [button('Read the story', '/journal/')]),
  },
  {
    label: 'Hero, text only',
    description: 'A big statement and nothing else. Good for services and about pages.',
    create: () => make('hero', {
      title: 'We take on <strong>six projects a year</strong>, so each one gets our full attention.',
      text: '',
      image: { src: '', alt: '' },
      layout: 'minimal',
    }, [button('How we work', '/#process', 'text')]),
  },
  {
    label: 'Page header',
    description: 'Title and intro at the top of an inner page.',
    create: () => make('page-header', { eyebrow: 'Services', title: 'From first sketch to the keys', intro: '<p>Every project starts with a conversation on site. Here is what happens after that.</p>' }),
  },
  {
    label: 'Content: text',
    description: 'A heading and paragraphs, at reading width.',
    create: () => make('content', {}, [
      make('heading', { text: 'Why small buildings', level: 'h2' }),
      make('paragraph', { text: '<p>Small buildings are where design matters most. Every square metre has a job, every window frames something, and there is nowhere for a bad decision to hide.</p><p>We started Meridian to work at that scale: close to the people who will live in the rooms, and close to the builders who make them.</p>' }),
      button('About the studio', '/about/', 'text'),
    ]),
  },
  {
    label: 'Content: story with image and quote',
    description: 'A longer piece mixing text, an image and a pull quote.',
    create: () => make('content', {}, [
      make('heading', { text: 'The net store, <em>slowly</em>', level: 'h2' }),
      make('paragraph', { text: '<p>The building had stood empty for eleven years. Salt had eaten the window frames and the roof leaked in four places, but the walls were good: half a metre of local stone.</p>' }),
      make('image', { image: img('project-3', 'Stone walls and a new timber roof under construction'), caption: 'The new roof going on, March 2025.', ratio: 'wide' }),
      make('quote', { text: 'We kept everything the sea had not already taken.', cite: 'Ana Ruiz, project architect' }),
      make('paragraph', { text: '<p>Inside, a single oak stair connects the studio to the flats above, lit from a long rooflight that follows the ridge.</p>' }),
    ]),
  },
  {
    label: 'Image and text',
    description: 'An image on the left, a story on the right.',
    create: () => make('image-text', {
      eyebrow: 'The studio',
      title: 'Three architects, one long table',
      text: '<p>We work from a converted sail loft on Harbour Street. Everyone who works on your project sits at the same table, so nothing gets lost between drawings.</p>',
      image: img('tall-2', 'A long worktable under a north-facing window'),
      side: 'left',
    }, [button('Meet the team', '/about/', 'outline')]),
  },
  {
    label: 'Image and text, image right',
    description: 'The same, mirrored.',
    create: () => make('image-text', {
      eyebrow: 'Planning',
      title: 'We handle the paperwork, too',
      text: '<p>Planning applications, building regulations, party wall agreements and the tender. You will know what is happening, but you will not have to chase it.</p>',
      image: img('project-5', 'Drawings pinned to a wall'),
      side: 'right',
      ratio: 'square',
    }),
  },
  {
    label: 'Feature grid',
    description: 'Three short points, with a line above each.',
    create: () => make('features', { eyebrow: 'Services', title: 'What we do', intro: '', anchor: 'services', columns: '3', style: 'plain' }, [
      make('feature', { title: 'New homes', text: '<p>Houses and cabins on difficult, beautiful sites. Coastal, rural and infill.</p>' }),
      make('feature', { title: 'Extensions and conversions', text: '<p>More room, more light, and a building that still looks like itself.</p>' }),
      make('feature', { title: 'Shops and studios', text: '<p>Small commercial spaces that work hard and make people want to come in.</p>' }),
    ]),
  },
  {
    label: 'Feature grid, cards',
    description: 'Four points on cards.',
    create: () => make('features', { title: 'Why clients come back', columns: '4', style: 'cards', background: 'muted' }, [
      make('feature', { title: 'Fixed fees', text: '<p>Agreed at the start, broken into stages.</p>' }),
      make('feature', { title: 'One architect', text: '<p>The person you meet draws your building.</p>' }),
      make('feature', { title: 'Local builders', text: '<p>A short list we have worked with for years.</p>' }),
      make('feature', { title: 'Low energy', text: '<p>Every project is designed to Passivhaus principles.</p>' }),
    ]),
  },
  {
    label: 'Steps',
    description: 'Numbered stages of how you work.',
    create: () => make('features', { eyebrow: 'Process', title: 'How a project runs', anchor: 'process', columns: '4', style: 'numbered' }, [
      make('feature', { title: 'Visit', text: '<p>We walk the site with you and listen. No charge.</p>' }),
      make('feature', { title: 'Design', text: '<p>Three options, then one, drawn and modelled until it is right.</p>' }),
      make('feature', { title: 'Permission', text: '<p>We prepare and submit the planning application.</p>' }),
      make('feature', { title: 'Build', text: '<p>We stay on through construction, on site every week.</p>' }),
    ]),
  },
  {
    label: 'Numbers',
    description: 'Big figures with a label under each.',
    create: () => make('stats', { title: '' }, [
      make('stat', { value: '12', label: 'Years on Harbour Street' }),
      make('stat', { value: '64', label: 'Buildings finished' }),
      make('stat', { value: '9', label: 'Design awards' }),
      make('stat', { value: '0', label: 'Projects over budget since 2019' }),
    ]),
  },
  {
    label: 'FAQ',
    description: 'Questions beside their title.',
    create: () => make('faq', { title: 'Questions people ask', intro: '<p>Anything else, <a href="/#contact">ask us</a>.</p>' }, [
      make('faq-item', { question: 'How much does an architect cost?', answer: '<p>For most of our projects, between 8 and 12 percent of the build cost. We agree a fixed fee before we start.</p>' }),
      make('faq-item', { question: 'Do you work outside Portwell?', answer: '<p>Yes, anywhere within about two hours. Further than that, we will recommend someone local.</p>' }),
      make('faq-item', { question: 'How long does planning take?', answer: '<p>Usually eight to thirteen weeks from submission. We will tell you early if a site looks difficult.</p>' }),
      make('faq-item', { question: 'Can you work with my builder?', answer: '<p>Of course. We are happy to tender too, if you would like to compare.</p>' }),
    ]),
  },
  {
    label: 'Testimonials',
    description: 'Three client quotes in a grid.',
    create: () => make('testimonials', { title: 'From our clients', background: 'muted' }, [
      make('testimonial', { quote: '<p>They found us a whole extra bedroom in a house we thought we had outgrown.</p>', name: 'Priya and Tom Hale', role: 'Loft conversion, Upper Portwell', image: img('person-1', '') }),
      make('testimonial', { quote: '<p>Calm, clear, and on site every single week. I would not build without them.</p>', name: 'Marcus Fenn', role: 'New house, Kettle Cove', image: img('person-2', '') }),
      make('testimonial', { quote: '<p>Our shop finally feels like the place we wanted to make.</p>', name: 'Ruth Okafor', role: 'Okafor Ceramics', image: img('person-3', '') }),
    ]),
  },
  {
    label: 'Testimonial, large',
    description: 'One quote, set large.',
    create: () => make('testimonials', { title: '', layout: 'single' }, [
      make('testimonial', { quote: '<p>The house is better than anything we could have described to them. They listened to what we meant, not what we said.</p>', name: 'Elena Marsh', role: 'Cliff House, 2024', image: img('person-4', '') }),
    ]),
  },
  {
    label: 'Logo strip',
    description: 'Clients, partners or press.',
    create: () => make('logos', { title: 'As featured in' }, [1, 2, 3, 4, 5, 6].map((i) => make('logo', { image: img(`logo-${i}`, ['Northfold', 'Calder & Co', 'Halden', 'Oyster Bay', 'Pellworth', 'Vantage'][i - 1]) }))),
  },
  {
    label: 'Call to action',
    description: 'A band that asks for one thing.',
    create: () => make('cta', { anchor: 'contact' }, [button('Book a site visit', 'mailto:studio@meridian.example'), button('(555) 018-4420', 'tel:+15550184420', 'outline')]),
  },
  {
    label: 'Call to action, split',
    description: 'Title on the left, buttons on the right.',
    create: () => make('cta', { title: 'Our journal, once a month', text: '<p>New projects, the odd essay, no noise.</p>', layout: 'split', background: 'inverse' }, [button('Read the journal', '/journal/')]),
  },
];

/** Fields on the Page tab, stored in page.layout. */
export const pageFields: Record<string, Field> = {
  announcement: { type: 'boolean', label: 'Show the announcement bar', default: true },
};

const nav: Field = { type: 'list', label: 'Main menu', itemLabel: 'label', fields: { label: { type: 'text', label: 'Label', default: '' }, href: { type: 'link', label: 'Link', default: '' } } };

export const globals: Record<string, GlobalDoc> = {
  site: {
    label: 'Site details',
    description: 'Name, menu, announcement bar and contact details.',
    file: 'src/data/site.json',
    fields: {
      name: { type: 'text', label: 'Site name' },
      tagline: { type: 'text', label: 'Tagline', help: 'Shown in the footer and in the home page title.' },
      announcement: { type: 'richtext', label: 'Announcement bar', help: 'Blank hides it everywhere.' },
      nav,
      ctaLabel: { type: 'text', label: 'Header button label' },
      ctaHref: { type: 'link', label: 'Header button link' },
      address: { type: 'text', label: 'Address' },
      phone: { type: 'text', label: 'Phone' },
      email: { type: 'text', label: 'Email' },
      footerLinks: { ...nav, label: 'Footer links' },
    },
  },
  theme: {
    label: 'Theme',
    description: 'The look of the whole site: theme, accent colour, fonts, corners, buttons and spacing.',
    file: 'src/data/theme.json',
    fields: {
      theme: { type: 'select', label: 'Theme', options: themes, help: 'Each theme sets colours, fonts and corners. The settings below change one thing at a time on top of it.' },
      accent: { type: 'color', label: 'Accent colour', help: "Buttons, links and accent backgrounds. Blank uses the theme's." },
      accentInk: { type: 'color', label: 'Text on the accent colour', help: 'Usually white or near-black. Pick whichever is easier to read on the accent.' },
      fonts: { type: 'select', label: 'Fonts', options: [{ value: '', label: "The theme's own" }, ...Object.entries(fontPairings).map(([value, f]) => ({ value, label: f.label }))] },
      corners: { type: 'select', label: 'Corners', options: [{ value: '', label: "The theme's own" }, { value: 'square', label: 'Square' }, { value: 'soft', label: 'Soft' }, { value: 'round', label: 'Round' }] },
      buttons: { type: 'select', label: 'Buttons', options: [{ value: '', label: "The theme's own" }, { value: 'pill', label: 'Pill' }, { value: 'square', label: 'Square' }, { value: 'outline', label: 'Outline' }] },
      spacing: { type: 'select', label: 'Spacing between sections', options: [{ value: '', label: 'Normal' }, { value: 'compact', label: 'Compact' }, { value: 'roomy', label: 'Roomy' }] },
    },
  },
};

export const templates: PageTemplate[] = [
  { label: 'Blank', description: 'A page header and nothing else.', create: () => ({ title: 'New page', sections: [presets[3].create()] }) },
  { label: 'Service page', description: 'Header, image and text, steps, FAQ and a call to action.', create: () => ({ title: 'New service', sections: [presets[3].create(), presets[6].create(), presets[10].create(), presets[12].create(), presets[16].create()] }) },
];
