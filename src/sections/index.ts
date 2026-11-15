// PageStack's `sections` module: what the editor can build pages from.
//   schemas      field definitions per node type (schema.ts)
//   presets      the "Add section" library, each arriving filled in; also what /blocks shows
//   pageFields   the Page tab, stored in page.layout
//   templates    starting points for "Add page"
//   globals      site-wide settings edited on their own screens (site details, theme)
//   collections  Markdown folders edited as lists of items (journal articles, events)
import type { CollectionDoc, Field, GlobalDoc, Node, PageTemplate, Preset } from '@pirateandfox/pagestack/runtime';
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
  /* ---------- Text and media (more) ---------- */
  {
    label: 'Embed: video',
    description: 'A YouTube or Vimeo video from a link.',
    create: () => make('embed', { title: 'Inside the Harbour Street studio', intro: '<p>Three minutes on how a former net store became a place to draw.</p>', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', caption: 'Sample video: Big Buck Bunny, Blender Foundation (CC BY 3.0). Paste your own link.' }),
  },
  {
    label: 'Embed: booking calendar',
    description: 'A Calendly (or similar) booking page in the page.',
    create: () => make('embed', { title: 'Book a site visit', intro: '<p>Thirty minutes on site, free, with the architect who would draw your building.</p>', url: 'https://calendly.com/acmesales', shape: 'tall', background: 'muted' }),
  },
  {
    label: 'Gallery',
    description: 'An even grid of photos that open full size.',
    create: () => make('gallery', { title: 'Recent work', columns: '4' }, [1, 2, 3, 4, 5, 6, 7, 8].map((i) => make('photo', { image: img(`project-${i}`, `Project ${i}`), caption: '' }))),
  },
  {
    label: 'Gallery, masonry',
    description: 'Photos keeping their own shape, with captions.',
    create: () => make('gallery', { title: 'Cliff House', eyebrow: 'Photographs', layout: 'masonry', columns: '3' }, [
      make('photo', { image: img('tall-1', 'The entrance'), caption: 'The entrance, from the lane' }),
      make('photo', { image: img('project-2', 'Living room'), caption: 'Living room at dawn' }),
      make('photo', { image: img('tall-2', 'Stair'), caption: 'The stair' }),
      make('photo', { image: img('project-3', 'Kitchen'), caption: '' }),
      make('photo', { image: img('tall-3', 'Bedroom window'), caption: 'Bedroom window' }),
      make('photo', { image: img('project-6', 'Garden'), caption: 'From the garden' }),
    ]),
  },
  {
    label: 'Slideshow',
    description: 'Large photos one at a time.',
    create: () => make('slideshow', { title: 'Harbour Street, from start to finish' }, [
      make('slide', { image: img('project-1', 'The net store before work began'), caption: 'March: the net store as we found it.' }),
      make('slide', { image: img('project-4', 'The frame going up'), caption: 'June: the new frame inside the old walls.' }),
      make('slide', { image: img('project-7', 'The finished studio'), caption: 'November: the studio, finished.' }),
    ]),
  },

  /* ---------- Explain (more) ---------- */
  {
    label: 'Cards',
    description: 'Linked cards with a picture on top.',
    create: () => make('cards', { title: 'Where to start', columns: '3' }, [
      make('card', { title: 'New homes', text: '<p>From a first sketch to the keys.</p>', image: img('project-2', ''), href: '/services/' }),
      make('card', { title: 'Extensions', text: '<p>More room and more light.</p>', image: img('project-5', ''), href: '/services/' }),
      make('card', { title: 'Shops and studios', text: '<p>Spaces that make people come in.</p>', image: img('project-8', ''), href: '/services/' }),
    ]),
  },
  {
    label: 'Cards, bordered',
    description: 'Text-only cards with a border.',
    create: () => make('cards', { eyebrow: 'Services', title: 'What we can help with', columns: '4', style: 'bordered', background: 'muted' }, [
      make('card', { title: 'Feasibility', text: '<p>Is the site worth it? A short report and a sketch.</p>', href: '/services/' }),
      make('card', { title: 'Planning', text: '<p>Drawings and the application, start to decision.</p>', href: '/services/' }),
      make('card', { title: 'Building control', text: '<p>The technical drawings your builder needs.</p>', href: '/services/' }),
      make('card', { title: 'On site', text: '<p>Weekly visits until the last coat of paint.</p>', href: '/services/' }),
    ]),
  },
  {
    label: 'Cards, title on picture',
    description: 'Big pictures with the title over them.',
    create: () => make('cards', { title: 'Selected projects', columns: '3', style: 'overlay' }, [
      make('card', { title: 'Cliff House', image: img('tall-1', ''), href: '/work/' }),
      make('card', { title: 'Okafor Ceramics', image: img('tall-2', ''), href: '/work/' }),
      make('card', { title: 'The Long Barn', image: img('tall-4', ''), href: '/work/' }),
    ]),
  },
  {
    label: 'Comparison',
    description: 'Options side by side, ticks and dashes.',
    create: () => make('compare', { title: 'Which service is right for you?', col1: 'Planning only', col2: 'Full service', col3: '', highlight: '2' }, [
      make('compare-row', { label: 'Site visit and brief', c1: 'yes', c2: 'yes' }),
      make('compare-row', { label: 'Planning drawings and application', c1: 'yes', c2: 'yes' }),
      make('compare-row', { label: 'Technical drawings', c1: 'no', c2: 'yes' }),
      make('compare-row', { label: 'Builder tender', c1: 'no', c2: 'yes' }),
      make('compare-row', { label: 'Visits during the build', c1: 'no', c2: 'Weekly' }),
      make('compare-row', { label: 'Typical fee', c1: 'From $4,000', c2: '8–12% of build' }),
    ]),
  },
  {
    label: 'Tabs',
    description: 'Content in tabs.',
    create: () => make('tabs', { title: 'Our three kinds of project' }, [
      make('tab', { title: 'New homes' }, [make('heading', { text: 'A house that fits its site', level: 'h3' }), make('paragraph', { text: '<p>We start with the land: the light, the wind, the view you will want from the kitchen sink. Most of our houses are timber-framed and built by local firms.</p>' }), button('See our houses', '/work/', 'text')]),
      make('tab', { title: 'Extensions' }, [make('heading', { text: 'More room, same house', level: 'h3' }), make('paragraph', { text: '<p>A good extension makes the old house work better, not just bigger. We often find the space is already there.</p>' })]),
      make('tab', { title: 'Commercial' }, [make('heading', { text: 'Small shops and studios', level: 'h3' }), make('paragraph', { text: '<p>Fit-outs and conversions for makers, cafés and small offices, usually on a tight programme.</p>' })]),
    ]),
  },
  {
    label: 'Timeline',
    description: 'Dated moments in order.',
    create: () => make('timeline', { eyebrow: 'About', title: 'Twelve years on Harbour Street' }, [
      make('moment', { date: '2014', title: 'Two desks above the chandlery', text: '<p>Ana and Joe leave a big London practice and come home to Portwell.</p>' }),
      make('moment', { date: '2017', title: 'Our first house', text: '<p>Kettle Cove, a timber house on a cliff, wins a regional award.</p>' }),
      make('moment', { date: '2021', title: 'The net store', text: '<p>We buy and convert the old net store. It becomes the studio.</p>' }),
      make('moment', { date: '2026', title: 'Sixty-four buildings', text: '<p>Seven people, one long table, still answering our own phone.</p>' }),
    ]),
  },

  /* ---------- Offer ---------- */
  {
    label: 'Pricing',
    description: 'Three plans, monthly and yearly.',
    create: () => make('pricing', { eyebrow: 'Membership', title: 'Join the drawing club', intro: '<p>Evening classes in the studio for anyone who wants to learn to draw buildings.</p>', yearly: true, background: 'muted' }, [
      make('plan', { name: 'Drop in', price: '$18', yearlyPrice: '', period: '/class', yearlyPeriod: '', text: '<p>Come when you can.</p>', features: '<ul><li>One evening class</li><li>Paper and pencils</li></ul>', button: 'Book a class', href: '/#contact' }),
      make('plan', { name: 'Regular', price: '$55', yearlyPrice: '$550', period: '/month', yearlyPeriod: '/year', text: '<p>Every Tuesday and Thursday.</p>', features: '<ul><li>Eight classes a month</li><li>All materials</li><li>Studio open hours</li></ul>', button: 'Join', href: '/#contact', featured: true, badge: 'Most popular' }),
      make('plan', { name: 'Studio', price: '$120', yearlyPrice: '$1,200', period: '/month', yearlyPeriod: '/year', text: '<p>For people working on a project.</p>', features: '<ul><li>Unlimited classes</li><li>A desk on Saturdays</li><li>A monthly review with an architect</li></ul>', button: 'Join', href: '/#contact' }),
    ]),
  },
  {
    label: 'Menu',
    description: 'A menu in two columns with dietary marks.',
    create: () => make('menu', { eyebrow: 'Open studio, 4 December', title: 'The supper menu' }, [
      make('menu-group', { title: 'To start', note: 'Served from 5 p.m.' }, [
        make('menu-item', { name: 'Harbour oysters', text: 'Shallot vinegar, lemon', price: 'market', marks: ['GF'] }),
        make('menu-item', { name: 'Leek and potato soup', text: 'Brown butter, sourdough', price: '9', marks: ['V'] }),
        make('menu-item', { name: 'Beetroot, walnut, labneh', text: '', price: '11', marks: ['V', 'GF'] }),
      ]),
      make('menu-group', { title: 'To follow', note: '' }, [
        make('menu-item', { name: 'Hake, mussels, cider', text: 'Samphire and new potatoes', price: '24', marks: ['GF'] }),
        make('menu-item', { name: 'Squash and chestnut pie', text: 'Mustard greens', price: '19', marks: ['VG'] }),
        make('menu-item', { name: 'Apple cake', text: 'Clotted cream', price: '8', marks: ['V'] }),
      ]),
    ]),
  },
  {
    label: 'Services list',
    description: 'Services with price and duration.',
    create: () => make('services', { title: 'Fixed-price services', intro: '<p>For smaller jobs we work to a fixed price, agreed before we start.</p>' }, [
      make('service', { title: 'Site appraisal', text: '<p>A visit, a sketch and a short report on what the site could take.</p>', price: '$650', duration: '2 weeks', href: '/services/' }),
      make('service', { title: 'Pre-application advice', text: '<p>We meet the planners with you before you commit to a design.</p>', price: '$1,200', duration: '4–6 weeks', href: '/services/' }),
      make('service', { title: 'Measured survey', text: '<p>Accurate drawings of your building as it stands today.</p>', price: 'From $900', duration: '1 week' }),
    ]),
  },
  {
    label: 'Products or rooms',
    description: 'Things to buy or book, each with a price.',
    create: () => make('products', { title: 'Stay in one of our buildings', intro: '<p>Three of our houses are let for short stays.</p>' }, [
      make('product', { title: 'Cliff House', text: '<p>Sleeps 4. A timber house above the cove.</p>', image: img('project-2', 'Cliff House'), price: '$320 / night', badge: 'New', button: 'Check dates', href: '/stay/' }),
      make('product', { title: 'The Long Barn', text: '<p>Sleeps 8. A stone barn with a new oak roof.</p>', image: img('project-6', 'The Long Barn'), price: '$480 / night', badge: '', button: 'Check dates', href: '/stay/' }),
      make('product', { title: 'Net Loft', text: '<p>Sleeps 2. Above the studio, on the harbour.</p>', image: img('project-7', 'Net Loft'), price: '$180 / night', badge: '', button: 'Check dates', href: '/stay/' }),
    ]),
  },
  {
    label: 'Donate',
    description: 'Suggested amounts to a donation page.',
    create: () => make('donate', { title: 'Help us save the old lifeboat house', text: '<p>Meridian is restoring Portwell’s 1890 lifeboat house as a free community space. Every gift goes to the building.</p>', button: 'Give now' }),
  },
  {
    label: 'Weekly timetable',
    description: 'Classes that repeat every week.',
    create: () => make('timetable', { title: 'Studio week', intro: '<p>Open sessions and classes. All in the Harbour Street studio.</p>' }, [
      make('session', { day: 'mon', time: '9:00', name: 'Open studio', who: 'Drop in', note: '' }),
      make('session', { day: 'tue', time: '18:30', name: 'Drawing club', who: 'With Ana', note: '' }),
      make('session', { day: 'wed', time: '12:30', name: 'Lunchtime talk', who: 'Guest', note: 'First Wednesday only' }),
      make('session', { day: 'thu', time: '18:30', name: 'Drawing club', who: 'With Joe', note: '' }),
      make('session', { day: 'sat', time: '10:00', name: 'Model making', who: 'With Sam', note: 'Ages 8 and up' }),
      make('session', { day: 'sat', time: '14:00', name: 'Studio desk', who: 'Members', note: '' }),
    ]),
  },

  /* ---------- Proof (more) ---------- */
  {
    label: 'Case study',
    description: 'One project: facts, story and a quote.',
    create: () => make('case-study', {
      title: 'Okafor Ceramics', eyebrow: 'Case study',
      text: '<p>Ruth needed a shop, a workshop and a kiln room in a 40 square metre fisherman’s store. We dropped the floor, opened the roof and put the wheel in the window, so the street can watch.</p>',
      image: img('tall-2', 'The Okafor Ceramics shop'),
      facts: [{ label: 'Where', value: 'Quay Street, Portwell' }, { label: 'Size', value: '40 m²' }, { label: 'Built', value: '2024' }, { label: 'Result', value: 'Sales up 60% in year one' }],
      quote: '<p>People stop to watch, then they come in.</p>', cite: 'Ruth Okafor', href: '/work/',
    }),
  },

  /* ---------- People ---------- */
  {
    label: 'Team',
    description: 'People with photos, names and roles.',
    create: () => make('team', { title: 'The studio', intro: '<p>Seven people, one long table.</p>' }, [
      make('person', { name: 'Ana Ferreira', role: 'Architect, founder', image: img('person-1', ''), href: '/team/ana/' }),
      make('person', { name: 'Joe Pascoe', role: 'Architect, founder', image: img('person-2', ''), href: '/team/joe/' }),
      make('person', { name: 'Sam Riley', role: 'Architectural designer', image: img('person-3', '') }),
      make('person', { name: 'Imogen Hart', role: 'Studio manager', image: img('person-4', '') }),
    ]),
  },
  {
    label: 'Team, circles',
    description: 'Round photos, centred, with a short bio.',
    create: () => make('team', { title: 'Who you will work with', columns: '3', shape: 'circle', background: 'muted' }, [
      make('person', { name: 'Ana Ferreira', role: 'Houses', text: '<p>Twenty years designing homes on difficult sites.</p>', image: img('person-1', '') }),
      make('person', { name: 'Joe Pascoe', role: 'Shops and studios', text: '<p>Fit-outs, conversions and anything with a kiln.</p>', image: img('person-2', '') }),
      make('person', { name: 'Sam Riley', role: 'Models and drawings', text: '<p>Makes the models you will fall in love with.</p>', image: img('person-3', '') }),
    ]),
  },
  {
    label: 'Profile',
    description: 'One person in depth.',
    create: () => make('profile', {
      title: 'Ana Ferreira', eyebrow: 'Architect and founder',
      text: '<p>Ana grew up two streets from the studio and trained in Lisbon and London. Before Meridian she spent eight years on housing schemes for a large practice, and came home wanting to build smaller, better.</p><p>She leads every house project from the first visit to handover, and still answers the studio phone on Mondays.</p>',
      image: img('person-1', 'Ana Ferreira'),
      details: [{ label: 'Registered', value: 'ARB, RIBA' }, { label: 'Focus', value: 'Houses, low-energy design' }, { label: 'Email', value: 'ana@meridian.example' }],
    }, [button('Book a call with Ana', '/#contact')]),
  },

  /* ---------- Act (more) ---------- */
  /* ---------- Forms ---------- */
  {
    label: 'Contact form',
    description: 'Name, email, what it is about, and a message.',
    create: () => make('form', { title: 'Tell us about your project', intro: '<p>A few lines is plenty. We reply within two working days.</p>', anchor: 'contact', layout: 'side', notice: '<p>We only use your details to reply to you.</p>' }, [
      make('form-field', { label: 'Your name', kind: 'text', required: true, width: 'half' }),
      make('form-field', { label: 'Email', kind: 'email', required: true, width: 'half' }),
      make('form-field', { label: 'Phone', kind: 'phone', width: 'half' }),
      make('form-field', { label: 'Kind of project', kind: 'select', options: ['New house', 'Extension', 'Shop or studio', 'Something else'], width: 'half' }),
      make('form-field', { label: 'Tell us about it', kind: 'textarea', required: true, placeholder: 'Where it is, what you would like, any dates that matter.' }),
      make('form-field', { label: 'Send me the monthly newsletter', kind: 'checkbox' }),
    ]),
  },
  {
    label: 'Booking request form',
    description: 'A date, a choice and a few details.',
    create: () => make('form', { title: 'Book a site visit', formName: 'Site visit request', button: 'Request a visit', background: 'muted', success: '<p>Thank you. We will call you to confirm a time.</p>' }, [
      make('form-field', { label: 'Your name', kind: 'text', required: true }),
      make('form-field', { label: 'Phone', kind: 'phone', required: true, width: 'half' }),
      make('form-field', { label: 'Email', kind: 'email', width: 'half' }),
      make('form-field', { label: 'Preferred date', kind: 'date', required: true, width: 'half' }),
      make('form-field', { label: 'Time of day', kind: 'choice', options: ['Morning', 'Afternoon'], width: 'half' }),
      make('form-field', { label: 'Site address', kind: 'text', required: true }),
    ]),
  },
  {
    label: 'Newsletter sign-up',
    description: 'Title on the left, email box on the right.',
    create: () => make('newsletter', { title: 'Notes from the studio', text: '<p>New projects and the occasional essay, once a month.</p>', notice: '<p>Unsubscribe any time.</p>' }),
  },
  {
    label: 'Map and hours',
    description: 'Address, opening hours and a map.',
    create: () => make('map', {
      title: 'Visit the studio', address: 'Meridian\n2 Harbour Street\nPortwell', query: 'Harbour Street, St Ives, Cornwall',
      hours: [{ days: 'Monday to Thursday', time: '9:00–17:30' }, { days: 'Friday', time: '9:00–16:00' }, { days: 'Weekends', time: 'By appointment' }],
      phone: '(555) 018-4420', email: 'studio@meridian.example',
      text: '<p>Parking on the quay. The studio is up one flight of stairs; tell us if that is a problem and we will meet you at the café below.</p>',
    }),
  },
  /* ---------- Feeds ---------- */
  {
    label: 'Articles feed',
    description: 'The latest three articles as cards.',
    create: () => make('articles', { title: 'From the journal', eyebrow: 'Journal', count: '3' }),
  },
  {
    label: 'Articles feed, list',
    description: 'Articles as a list with small pictures.',
    create: () => make('articles', { title: 'Notes and news', count: '4', layout: 'list', background: 'muted' }),
  },
  {
    label: 'Events feed',
    description: 'Upcoming events as a dated list.',
    create: () => make('events', { title: 'What’s on at the studio', anchor: 'events' }),
  },
  {
    label: 'Events feed, cards',
    description: 'Upcoming events as cards.',
    create: () => make('events', { title: 'Coming up', count: '3', layout: 'cards', background: 'muted', more: '' }),
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
      turnstileSiteKey: { type: 'text', label: 'Turnstile site key', group: 'advanced', help: 'Optional spam check on forms (Cloudflare Turnstile). Set TURNSTILE_SECRET on the host as well.' },
    },
  },
  theme: {
    label: 'Theme',
    description: 'The look of the whole site: theme, accent colour, fonts, corners, buttons and spacing.',
    file: 'src/data/theme.json',
    fields: {
      theme: { type: 'select', label: 'Theme', options: themes, help: 'Each theme sets colours, fonts and corners. The settings below change one thing at a time on top of it.' },
      accent: { type: 'color', label: 'Accent colour', help: "Buttons, links and accent backgrounds. Blank uses the theme's. Links use it too, so it needs to stand out against the page (a pale yellow won't)." },
      accentInk: { type: 'color', label: 'Text on the accent colour', help: 'Leave blank and the site picks white or near-black, whichever reads better on your accent. The all-blocks page (/blocks) flags any colours that are hard to read.' },
      fonts: { type: 'select', label: 'Fonts', options: [{ value: '', label: "The theme's own" }, ...Object.entries(fontPairings).map(([value, f]) => ({ value, label: f.label }))] },
      corners: { type: 'select', label: 'Corners', options: [{ value: '', label: "The theme's own" }, { value: 'square', label: 'Square' }, { value: 'soft', label: 'Soft' }, { value: 'round', label: 'Round' }] },
      buttons: { type: 'select', label: 'Buttons', options: [{ value: '', label: "The theme's own" }, { value: 'pill', label: 'Pill' }, { value: 'square', label: 'Square' }, { value: 'outline', label: 'Outline' }] },
      spacing: { type: 'select', label: 'Spacing between sections', options: [{ value: '', label: 'Normal' }, { value: 'compact', label: 'Compact' }, { value: 'roomy', label: 'Roomy' }] },
    },
  },
};

/** A preset by its label, so templates don't break when the library is reordered. */
const preset = (label: string) => {
  const p = presets.find((x) => x.label === label);
  if (!p) throw new Error(`No preset called "${label}"`);
  return p.create();
};

export const templates: PageTemplate[] = [
  { label: 'Blank', description: 'A page header and nothing else.', create: () => ({ title: 'New page', sections: [preset('Page header')] }) },
  { label: 'Service page', description: 'Header, image and text, steps, FAQ and a call to action.', create: () => ({ title: 'New service', sections: ['Page header', 'Image and text', 'Steps', 'FAQ', 'Call to action'].map(preset) }) },
  { label: 'Contact page', description: 'Header, contact form, and map with opening hours.', create: () => ({ title: 'Contact', sections: ['Page header', 'Contact form', 'Map and hours'].map(preset) }) },
];

/** Markdown folders, edited under Journal and Events. Fields match src/lib/schemas.ts. */
export const collections: Record<string, CollectionDoc> = {
  articles: {
    label: 'Journal',
    singular: 'article',
    dir: 'src/content/articles',
    url: (slug) => `/journal/${slug}/`,
    fields: {
      title: { type: 'text', label: 'Title' },
      description: { type: 'textarea', label: 'Summary', help: 'One or two sentences, shown on cards and in search results.' },
      date: { type: 'date', label: 'Date', time: false, help: 'A future date schedules it: it appears on the first build on or after that day.' },
      author: { type: 'text', label: 'Author' },
      image: { type: 'image', label: 'Image', asUrl: true, altField: 'imageAlt' },
      imageAlt: { type: 'text', label: 'Image description' },
      tags: { type: 'tags', label: 'Tags' },
      draft: { type: 'boolean', label: 'Draft' },
    },
  },
  events: {
    label: 'Events',
    singular: 'event',
    dir: 'src/content/events',
    url: (slug) => `/events/${slug}/`,
    fields: {
      title: { type: 'text', label: 'Title' },
      description: { type: 'textarea', label: 'Summary' },
      start: { type: 'date', label: 'Starts', help: 'In the venue’s local time.' },
      end: { type: 'date', label: 'Ends' },
      allDay: { type: 'boolean', label: 'All day (times are ignored)' },
      place: { type: 'text', label: 'Place' },
      address: { type: 'text', label: 'Address', help: 'Links to a map.' },
      online: { type: 'link', label: 'Online link', help: 'For online or hybrid events.' },
      tickets: { type: 'link', label: 'Tickets link' },
      price: { type: 'text', label: 'Price', help: 'As it should read, e.g. "Free" or "$8, free for students".' },
      image: { type: 'image', label: 'Image', asUrl: true, altField: 'imageAlt' },
      imageAlt: { type: 'text', label: 'Image description' },
      draft: { type: 'boolean', label: 'Draft' },
    },
  },
};
