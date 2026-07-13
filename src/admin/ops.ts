import type { Content, Grade, Material, Section, Topic } from '../types'
import { uid } from '../utils'

export function newTopic(title = '', icon = '📖', url = ''): Topic {
  return { id: uid('t'), title, icon, url }
}
export function newMaterial(label = '', url = ''): Material {
  return { id: uid('m'), label, url }
}
export function newSection(roman: string, name: string, course = ''): Section {
  return { id: uid('s'), roman, name, course, topics: [] }
}
export function newGrade(id: string, title: string, subtitle: string): Grade {
  return { id, title, subtitle, sections: [] }
}

export function findGrade(c: Content, id: string) {
  return c.grades.find((g) => g.id === id)
}
export function findSection(c: Content, gradeId: string, sectionId: string) {
  return findGrade(c, gradeId)?.sections.find((s) => s.id === sectionId)
}

export function move<T>(arr: T[], from: number, dir: -1 | 1) {
  const to = from + dir
  if (to < 0 || to >= arr.length) return
  const [item] = arr.splice(from, 1)
  arr.splice(to, 0, item)
}

// Автоматический следующий римский номер главы
const ROMANS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV']
export function nextRoman(count: number) {
  return ROMANS[count] ?? String(count + 1)
}
