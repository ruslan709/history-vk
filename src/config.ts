// ==== Настройки репозитория GitHub ====
// Эти значения указывают, в какой репозиторий админка сохраняет материалы.
// Если ты меняешь логин/имя репозитория — поправь здесь и в vite.config.ts (base).

export const GITHUB_OWNER = 'ruslan709'
export const GITHUB_REPO = 'history-vk'

// Путь к файлу данных внутри репозитория (исходник, не собранный сайт).
export const CONTENT_PATH = 'public/data/content.json'

// Ключи в localStorage браузера (отдельные от MAX-версии — сайты на одном домене)
export const LS_TOKEN = 'istoriya_vk_gh_token'
export const LS_AUTH = 'istoriya_vk_admin_authed'

// Логин администратора по умолчанию (можно сменить в «Настройках»).
export const DEFAULT_ADMIN_USERNAME = 'admin'

// Пароль администратора по умолчанию: «istoriya2026» (SHA-256).
// Используется, только если в content.json ещё не задан свой хеш.
// Сменить пароль можно в разделе «Настройки» админки.
export const DEFAULT_PASSWORD_HASH =
  '974e568dfe6bb530b1fd55c61d836ea69010fde9578e3ca7fdeacf20f5bd71d9'
