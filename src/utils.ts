import type { Content, Topic } from './types'

// Все материалы темы: основная ссылка + дополнительные
export function getMaterials(t: Topic): { label: string; url: string }[] {
  const list: { label: string; url: string }[] = []
  if (t.url && t.url.trim()) list.push({ label: 'Основной материал', url: t.url.trim() })
  for (const e of t.extras ?? []) {
    if (e.url && e.url.trim()) list.push({ label: e.label?.trim() || 'Дополнительный материал', url: e.url.trim() })
  }
  return list
}
export function topicHasMaterial(t: Topic): boolean {
  return getMaterials(t).length > 0
}

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export interface Stats {
  grades: number
  sections: number
  topics: number
  links: number // темы с заполненной ссылкой
}

export function computeStats(c: Content): Stats {
  let sections = 0, topics = 0, links = 0
  for (const g of c.grades) {
    sections += g.sections.length
    for (const s of g.sections) {
      topics += s.topics.length
      for (const t of s.topics) if (topicHasMaterial(t)) links++
    }
  }
  return { grades: c.grades.length, sections, topics, links }
}

export function pluralChapters(n: number): string {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return 'глава'
  if ([2, 3, 4].includes(m10) && ![12, 13, 14].includes(m100)) return 'главы'
  return 'глав'
}
