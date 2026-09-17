import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getLogEntries } from '../lib/projects';

export async function GET(context: APIContext) {
  const logEntries = await getLogEntries();

  return rss({
    title: 'Alex Camilo',
    description:
      'Electrical engineer, product developer, and prototyper. Schematic capture, PCB layout, and the messy middle of taking hardware from concept to retail.',
    site: context.site!,
    items: logEntries.map((l) => ({
      title: l.entry.data.title,
      description: l.entry.data.description,
      pubDate: l.entry.data.date,
      link: l.url,
      content: l.entry.rendered?.html,
    })),
    customData: `<language>en-us</language>`,
  });
}
