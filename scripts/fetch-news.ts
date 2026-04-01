/**
 * Fetch and parse RSS feeds from space news sources, filter for Artemis content.
 * No API keys needed — all public RSS feeds.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const DATA_DIR = resolve(import.meta.dirname ?? '.', '..', 'data');
const OUTPUT_FILE = resolve(DATA_DIR, 'news.json');

interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description: string;
}

interface NewsData {
  fetchedAt: string;
  articles: NewsArticle[];
}

const RSS_FEEDS = [
  { url: 'https://blogs.nasa.gov/artemis/feed/', source: 'NASA Artemis Blog' },
  { url: 'https://www.nasa.gov/news-release/feed/', source: 'NASA News' },
  { url: 'https://spacenews.com/feed/', source: 'SpaceNews' },
  { url: 'https://www.nasaspaceflight.com/feed/', source: 'NASASpaceflight' },
  { url: 'https://www.space.com/feeds/all', source: 'Space.com' },
];

// Keywords to filter for Artemis-related content (case-insensitive)
const ARTEMIS_KEYWORDS = [
  'artemis', 'orion', 'sls', 'space launch system',
  'moon mission', 'lunar', 'moonbound',
  'wiseman', 'glover', 'koch', 'hansen',
  'pad 39b', 'kennedy space center', 'ksc',
  'deep space', 'beyond leo', 'cislunar',
];

function isArtemisRelated(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return ARTEMIS_KEYWORDS.some(keyword => text.includes(keyword));
}

/**
 * Simple XML RSS parser — extracts items from RSS/Atom feeds without external dependencies.
 */
function parseRSS(xml: string, source: string): NewsArticle[] {
  const articles: NewsArticle[] = [];

  // Match <item> blocks (RSS 2.0)
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = extractTag(item, 'title');
    const link = extractTag(item, 'link') || extractAttr(item, 'link', 'href');
    const pubDate = extractTag(item, 'pubDate') || extractTag(item, 'published') || extractTag(item, 'dc:date');
    const description = stripHtml(
      extractTag(item, 'description') || extractTag(item, 'summary') || extractTag(item, 'content:encoded') || ''
    ).slice(0, 300);

    if (title && link) {
      articles.push({
        title: stripHtml(title).trim(),
        link: link.trim(),
        pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source,
        description: description.trim(),
      });
    }
  }

  // Match <entry> blocks (Atom)
  if (articles.length === 0) {
    const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    while ((match = entryRegex.exec(xml)) !== null) {
      const item = match[1];
      const title = extractTag(item, 'title');
      const link = extractAttr(item, 'link', 'href') || extractTag(item, 'link');
      const pubDate = extractTag(item, 'published') || extractTag(item, 'updated');
      const description = stripHtml(
        extractTag(item, 'summary') || extractTag(item, 'content') || ''
      ).slice(0, 300);

      if (title && link) {
        articles.push({
          title: stripHtml(title).trim(),
          link: link.trim(),
          pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          source,
          description: description.trim(),
        });
      }
    }
  }

  return articles;
}

function extractTag(xml: string, tag: string): string {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return cdataMatch[1];

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = regex.exec(xml);
  return match ? match[1] : '';
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']*)["'][^>]*/?>`, 'i');
  const match = regex.exec(xml);
  return match ? match[1] : '';
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchFeed(url: string, source: string): Promise<NewsArticle[]> {
  try {
    console.log(`  Fetching ${source}...`);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ArtemisIIDashboard/1.0 (github.com/mauritsajournal/artemis-dashboard)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`  WARNING: ${source} returned ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const articles = parseRSS(xml, source);
    console.log(`  ${source}: ${articles.length} articles parsed`);
    return articles;
  } catch (err) {
    console.warn(`  WARNING: ${source} failed: ${(err as Error).message}`);
    return [];
  }
}

async function main(): Promise<void> {
  console.log('Fetching space news RSS feeds...');

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  // Fetch all feeds in parallel
  const results = await Promise.all(
    RSS_FEEDS.map(feed => fetchFeed(feed.url, feed.source))
  );

  const allArticles = results.flat();
  console.log(`\n  Total articles from all feeds: ${allArticles.length}`);

  // Filter for Artemis-related content
  // NASA Artemis Blog is always relevant — don't filter it
  const filtered = allArticles.filter(article => {
    if (article.source === 'NASA Artemis Blog') return true;
    return isArtemisRelated(article.title, article.description);
  });

  console.log(`  Artemis-related articles: ${filtered.length}`);

  // Deduplicate by title similarity
  const seen = new Set<string>();
  const unique = filtered.filter(article => {
    const key = article.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by date (newest first), limit to 50
  unique.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  const articles = unique.slice(0, 50);

  const data: NewsData = {
    fetchedAt: new Date().toISOString(),
    articles,
  };

  // If no articles found at all, try to keep stale data
  if (articles.length === 0 && existsSync(OUTPUT_FILE)) {
    console.warn('WARNING: No articles found. Keeping stale data.');
    return;
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  console.log(`\nNews data written to ${OUTPUT_FILE} (${articles.length} articles)`);
}

main().catch((err) => {
  console.error('Fatal error in news fetch:', err);
  process.exit(1);
});
