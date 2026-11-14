// One Astro component per node type in schema.ts. Items (feature, stat, faq-item, testimonial,
// logo) are drawn by their parent section.
import Hero from './Hero.astro';
import PageHeader from './PageHeader.astro';
import Content from './Content.astro';
import ImageText from './ImageText.astro';
import Features from './Features.astro';
import Stats from './Stats.astro';
import Faq from './Faq.astro';
import Testimonials from './Testimonials.astro';
import Logos from './Logos.astro';
import Cta from './Cta.astro';
import Embed from './Embed.astro';
import Gallery from './Gallery.astro';
import Slideshow from './Slideshow.astro';
import Cards from './Cards.astro';
import Compare from './Compare.astro';
import Tabs from './Tabs.astro';
import Timeline from './Timeline.astro';
import Pricing from './Pricing.astro';
import Menu from './Menu.astro';
import Services from './Services.astro';
import Products from './Products.astro';
import Donate from './Donate.astro';
import Timetable from './Timetable.astro';
import CaseStudy from './CaseStudy.astro';
import Team from './Team.astro';
import Profile from './Profile.astro';
import MapHours from './MapHours.astro';
import ArticlesFeed from './ArticlesFeed.astro';
import EventsFeed from './EventsFeed.astro';
import Form from './Form.astro';
import Newsletter from './Newsletter.astro';
import Heading from './blocks/Heading.astro';
import Paragraph from './blocks/Paragraph.astro';
import Image from './blocks/Image.astro';
import Button from './blocks/Button.astro';
import Quote from './blocks/Quote.astro';
import Divider from './blocks/Divider.astro';

export const components: Record<string, any> = {
  hero: Hero, 'page-header': PageHeader, content: Content, 'image-text': ImageText, features: Features, stats: Stats,
  faq: Faq, testimonials: Testimonials, logos: Logos, cta: Cta,
  embed: Embed, gallery: Gallery, slideshow: Slideshow, cards: Cards, compare: Compare, tabs: Tabs, timeline: Timeline,
  pricing: Pricing, menu: Menu, services: Services, products: Products, donate: Donate, timetable: Timetable,
  'case-study': CaseStudy, team: Team, profile: Profile, map: MapHours,
  articles: ArticlesFeed, events: EventsFeed, form: Form, newsletter: Newsletter,
  heading: Heading, paragraph: Paragraph, image: Image, button: Button, quote: Quote, divider: Divider,
};
