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
import Heading from './blocks/Heading.astro';
import Paragraph from './blocks/Paragraph.astro';
import Image from './blocks/Image.astro';
import Button from './blocks/Button.astro';
import Quote from './blocks/Quote.astro';
import Divider from './blocks/Divider.astro';

export const components: Record<string, any> = {
  hero: Hero, 'page-header': PageHeader, content: Content, 'image-text': ImageText, features: Features, stats: Stats,
  faq: Faq, testimonials: Testimonials, logos: Logos, cta: Cta,
  heading: Heading, paragraph: Paragraph, image: Image, button: Button, quote: Quote, divider: Divider,
};
