import { GITHUB_OWNER, GITHUB_REPO, CONTENT_PATH, LS_TOKEN } from './config'
import type { Content } from './types'

const API = 'https://api.github.com'

export function getToken(): string {
  return localStorage.getItem(LS_TOKEN) || ''
}
export function setToken(t: string) {
  localStorage.setItem(LS_TOKEN, t.trim())
}
export function hasToken(): boolean {
  return !!getToken()
}

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${getToken()}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

// Корректная кодировка UTF-8 → base64 (btoa не умеет кириллицу напрямую)
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin)
}
function base64ToUtf8(b64: string): string {
  const bin = atob(b64.replace(/\n/g, ''))
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

let cachedBranch: string | null = null
async function defaultBranch(): Promise<string> {
  if (cachedBranch) return cachedBranch
  const res = await fetch(`${API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}`, { headers: headers() })
  if (!res.ok) throw new Error(await describeError(res))
  const data = await res.json()
  cachedBranch = data.default_branch || 'main'
  return cachedBranch as string
}

async function describeError(res: Response): Promise<string> {
  let msg = `Ошибка GitHub (${res.status})`
  try {
    const j = await res.json()
    if (j.message) msg += `: ${j.message}`
  } catch { /* ignore */ }
  if (res.status === 401) msg = 'Неверный или просроченный токен GitHub. Проверьте токен в «Настройках».'
  if (res.status === 404) msg = 'Файл или репозиторий не найден. Проверьте имя репозитория и права токена.'
  if (res.status === 403) msg = 'Нет доступа. У токена должно быть право «Contents: Read and write» для этого репозитория.'
  return msg
}

// Проверка токена — возвращает логин пользователя
export async function verifyToken(): Promise<string> {
  const res = await fetch(`${API}/user`, { headers: headers() })
  if (!res.ok) throw new Error(await describeError(res))
  const j = await res.json()
  return j.login as string
}

export interface LoadResult {
  content: Content
  sha: string | null
}

// Читает content.json из GitHub (свежая версия + sha для сохранения)
export async function loadFromGitHub(): Promise<LoadResult> {
  const branch = await defaultBranch()
  const url = `${API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CONTENT_PATH}?ref=${branch}`
  const res = await fetch(url, { headers: headers() })
  if (res.status === 404) {
    // Файла ещё нет — вернём пустую структуру
    return { content: { settings: { adminPasswordHash: '' }, grades: [] }, sha: null }
  }
  if (!res.ok) throw new Error(await describeError(res))
  const j = await res.json()
  const text = base64ToUtf8(j.content)
  return { content: JSON.parse(text) as Content, sha: j.sha as string }
}

// Сохраняет content.json обратно в GitHub (создаёт коммит)
export async function saveToGitHub(content: Content, sha: string | null, message: string): Promise<string> {
  const branch = await defaultBranch()
  const url = `${API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CONTENT_PATH}`
  const body: Record<string, unknown> = {
    message,
    content: utf8ToBase64(JSON.stringify(content, null, 2) + '\n'),
    branch,
  }
  if (sha) body.sha = sha
  const res = await fetch(url, { method: 'PUT', headers: headers(), body: JSON.stringify(body) })
  if (!res.ok) throw new Error(await describeError(res))
  const j = await res.json()
  return j.content.sha as string
}

// Чтение опубликованного файла (для публичной навигации, без токена)
export async function loadPublic(): Promise<Content> {
  const url = `${import.meta.env.BASE_URL}data/content.json?t=${Date.now()}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('Не удалось загрузить материалы')
  return (await res.json()) as Content
}
