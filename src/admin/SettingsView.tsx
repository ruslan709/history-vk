import { useState } from 'react'
import type { EditorProps } from './shared'
import { DEFAULT_ADMIN_USERNAME, GITHUB_OWNER, GITHUB_REPO, LS_TOKEN } from '../config'
import { getToken, setToken, verifyToken } from '../github'
import { sha256 } from '../utils'

export default function SettingsView({ content, applyEdit, notify }: EditorProps) {
  // --- Вход администратора (логин + пароль) ---
  const [user, setUser] = useState(content.settings.adminUsername || DEFAULT_ADMIN_USERNAME)
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')

  async function saveLogin() {
    if (!user.trim()) return notify('Логин не может быть пустым', 'err')
    if (p1 || p2) {
      if (p1.length < 4) return notify('Пароль слишком короткий (минимум 4 символа)', 'err')
      if (p1 !== p2) return notify('Пароли не совпадают', 'err')
    }
    const newHash = p1 ? await sha256(p1) : content.settings.adminPasswordHash
    applyEdit((c) => {
      c.settings.adminUsername = user.trim()
      c.settings.adminPasswordHash = newHash
    })
    setP1(''); setP2('')
    notify('Данные входа обновлены ✓ Нажмите «Сохранить на сайт»', 'ok')
  }

  // --- Токен (для разработчика) ---
  const [token, setTok] = useState(getToken())
  const [verifying, setVerifying] = useState(false)
  const [who, setWho] = useState('')

  async function saveToken() {
    setToken(token)
    setVerifying(true)
    setWho('')
    try {
      const login = await verifyToken()
      setWho(login)
      notify(`Токен сохранён на этом устройстве. Подключено как @${login} ✓`, 'ok')
    } catch (e) {
      notify(String((e as Error).message), 'err')
    } finally {
      setVerifying(false)
    }
  }

  function clearToken() {
    localStorage.removeItem(LS_TOKEN)
    setTok('')
    setWho('')
    notify('Токен удалён из этого браузера', 'info')
  }

  async function copySetupLink() {
    if (!token.trim()) return notify('Сначала вставьте токен', 'err')
    const link = `${window.location.origin}${import.meta.env.BASE_URL}admin.html#setup=${encodeURIComponent(token.trim())}`
    try {
      await navigator.clipboard.writeText(link)
      notify('Ссылка-настройка скопирована ✓ Отправьте её заказчику один раз', 'ok')
    } catch {
      window.prompt('Скопируйте ссылку-настройку для заказчика:', link)
    }
  }

  return (
    <>
      <div className="card">
        <h3>🔑 Вход администратора</h3>
        <div className="card-sub">Логин и пароль, под которыми заказчик заходит в админку каждый день.</div>
        <div className="field">
          <label>Логин</label>
          <input className="input" value={user} onChange={(e) => setUser(e.target.value)} autoComplete="off" />
        </div>
        <div className="row2">
          <div className="field">
            <label>Новый пароль</label>
            <input className="input" type="password" value={p1} onChange={(e) => setP1(e.target.value)} placeholder="оставьте пустым, чтобы не менять" />
          </div>
          <div className="field">
            <label>Повторите пароль</label>
            <input className="input" type="password" value={p2} onChange={(e) => setP2(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={saveLogin}>Сохранить логин и пароль</button>
      </div>

      <div className="card" style={{ borderColor: 'rgba(124,37,64,0.25)' }}>
        <h3>🛠️ Настройка сохранения <span className="badge badge-warn" style={{ verticalAlign: 'middle' }}>для разработчика</span></h3>
        <div className="card-sub">
          Этот раздел заполняет тот, кто настраивает проект. Заказчику сюда заходить не нужно.
          Репозиторий: <b>{GITHUB_OWNER}/{GITHUB_REPO}</b>.
        </div>

        <div className="callout info">
          <b>Токен GitHub (fine-grained):</b> github.com → Settings → Developer settings →
          Personal access tokens → Fine-grained tokens. Доступ к репозиторию <code>{GITHUB_REPO}</code>,
          право <code>Contents: Read and write</code>. Токен хранится только в этом браузере.
        </div>

        <div className="field">
          <label>Токен GitHub</label>
          <input className="input" type="password" value={token} onChange={(e) => setTok(e.target.value)} placeholder="github_pat_…" />
          {who && <span className="hint" style={{ color: '#2e7d32' }}>Подключено как @{who}</span>}
        </div>
        <div className="actions-row">
          <button className="btn btn-primary" onClick={saveToken} disabled={verifying || !token.trim()}>
            {verifying ? 'Проверка…' : 'Сохранить и проверить токен'}
          </button>
          <button className="btn btn-gold" onClick={copySetupLink} disabled={!token.trim()}>🔗 Ссылка-настройка для заказчика</button>
          {getToken() && <button className="btn btn-danger" onClick={clearToken}>Удалить токен</button>}
        </div>

        <div className="callout warn" style={{ marginTop: 16, marginBottom: 0 }}>
          <b>Как настроить новое устройство заказчика:</b> нажмите «Ссылка-настройка», отправьте её заказчику.
          Он один раз открывает ссылку — токен сохраняется в его браузере. Дальше он заходит только по логину и паролю.
        </div>
      </div>
    </>
  )
}
