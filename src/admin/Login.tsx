import { useState } from 'react'
import type { Content } from '../types'
import { DEFAULT_ADMIN_USERNAME, DEFAULT_PASSWORD_HASH } from '../config'
import { sha256 } from '../utils'

export default function Login({ content, onOk }: { content: Content | null; onOk: () => void }) {
  const [user, setUser] = useState('')
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const hash = await sha256(pwd)
    const expectedUser = content?.settings?.adminUsername || DEFAULT_ADMIN_USERNAME
    const expectedHash = content?.settings?.adminPasswordHash || DEFAULT_PASSWORD_HASH
    setBusy(false)
    if (user.trim().toLowerCase() === expectedUser.toLowerCase() && hash === expectedHash) onOk()
    else setErr('Неверный логин или пароль. Попробуйте ещё раз.')
  }

  return (
    <div className="shell">
      <div className="login-wrap">
        <div className="login-card">
          <div className="login-emoji">📚</div>
          <h1>Админ-панель</h1>
          <p>«История на пальцах» — управление содержанием навигации</p>
          <form onSubmit={submit}>
            <div className="field">
              <label>Логин</label>
              <input
                className="input"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Введите логин"
                autoFocus
                autoComplete="username"
              />
            </div>
            <div className="field">
              <label>Пароль</label>
              <input
                className="input"
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="Введите пароль"
                autoComplete="current-password"
              />
            </div>
            {err && <div className="callout warn" style={{ marginTop: -4 }}>{err}</div>}
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
              {busy ? 'Проверка…' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
