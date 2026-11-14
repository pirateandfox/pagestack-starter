import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema, eventSchema } from './lib/schemas';

// Two Markdown folders, edited in the editor under Journal and Events. Each file is one item; its
// file name is its URL (/journal/<name>/, /events/<name>/).
const articles = defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/articles' }), schema: articleSchema });
const events = defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/events' }), schema: eventSchema });

export const collections = { articles, events };
