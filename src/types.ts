// ==== Модель данных каталога «История на пальцах» ====
// Класс → Раздел (глава) → Тема → ссылка на пост ВКонтакте

export interface Material {
  id: string
  label: string // название материала («Основной», «Презентация», «Дополнение 1»…)
  url: string
}

export interface Topic {
  id: string
  icon: string
  title: string
  url: string // основная ссылка на пост в ВКонтакте (может быть пустой)
  extras?: Material[] // дополнительные материалы к этой же теме
}

export interface Section {
  id: string
  roman: string // номер главы (I, II, ...)
  name: string
  course?: string // необязательная группа: «Всеобщая история» / «История России»
  topics: Topic[]
}

export interface Grade {
  id: string // "5".."11"
  title: string
  subtitle: string
  sections: Section[]
}

export interface Settings {
  // Логин администратора (проверяется в браузере).
  adminUsername?: string
  // SHA-256 хеш пароля администратора (проверяется в браузере).
  adminPasswordHash: string
}

export interface Content {
  settings: Settings
  grades: Grade[]
}

export const ROMAN: Record<string, string> = {
  '5': 'V', '6': 'VI', '7': 'VII', '8': 'VIII', '9': 'IX', '10': 'X', '11': 'XI',
}
