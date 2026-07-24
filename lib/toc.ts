export interface TocItem {
  level: number;
  text: string;
  slug: string;
}

const combiningMarks = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g');

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(combiningMarks, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}

export function textFromNode(children: unknown): string {
  if (typeof children === 'string') {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(textFromNode).join('');
  }
  if (children && typeof children === 'object' && 'props' in children) {
    return textFromNode((children as { props?: { children?: unknown } }).props?.children);
  }
  return '';
}

export function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split('\n');
  const items: TocItem[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) {
      continue;
    }

    const match = /^(#{1,3})\s+(.+?)\s*#*$/.exec(line);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`~]/g, '').trim();
      if (text) {
        items.push({ level, text, slug: slugifyHeading(text) });
      }
    }
  }

  return items;
}