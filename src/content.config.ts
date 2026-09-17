import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    // Optional for now: hornbot, chdk-ptp-java, wii-chuck have none. The owner
    // will supply these later. The build warns (console) for any project
    // missing a year; see src/lib/projects.ts.
    year: z.number().optional(),
    order: z.number(),
    featured: z.boolean().default(false),
    // Existing small preview image (<=186 CSS px wide), used only as a thumbnail.
    image: z.string(),
    // Large photo for panels/boards.
    hero: z.string(),
    // Soldermask color, hex.
    color: z.string(),
    project_url: z.string().default(''),
    // Names the destination of project_url. Absent when project_url is empty.
    link_label: z.string().optional(),
    categories: z.array(z.string()).default([]),
    description: z.string(),
    gallery: z.array(z.string()).default([]),
    // Parallel to gallery; only present for some projects.
    captions: z.array(z.string()).optional(),
    // Overrides the generated "For <client>, <year>." sentence.
    for_sentence: z.string().optional(),
    // Optional descriptive alt text for the hero image.
    hero_alt: z.string().optional(),
  }),
});

const log = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/log' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
  }),
});

export const collections = { projects, log };
