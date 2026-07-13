import { useCallback, useEffect, useRef, useState } from 'react'
import type { Content } from '../types'
import { LS_AUTH } from '../config'
import { hasToken, loadFromGitHub, loadPublic, saveToGitHub, setToken } from '../github'
import type { Notify } from './shared'
import Login from './Login'
import Dashboard from './Dashboard'
import Catalog from './Catalog'
import SettingsView from './SettingsView'

type Tab = 'dashboard' | 'catalog' | 'settings'
interface Toast { id: number; msg: string; kind: 'ok' | 'err' | 'info' }

export default function Admin() {
  const [content, setContent] = useState<Content | null>(null)
  const [loadError, setLoadError] = useState('')
  const shaRef = useRef<string | null>(null)
  const [authed, setAuthed] = useState(localStorage.getItem(LS_AUTH) === '1')
  const [tab, setTab] = useState<Tab>('dashboard')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback<Notify>((msg, kind = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }, [])

  // Начальная загрузка
  useEffect(() => {
    // Ссылка-настройка: admin.html#setup=ТОКЕН — вкладывает токен в браузер один раз
    const hash = window.location.hash
    if (hash.startsWith('#setup=')) {
      const token = decodeURIComponent(hash.slice('#setup='.length))
      if (token) {
        setToken(token)
        history.replaceState(null, '', window.location.pathname + window.location.search)
        notify('Устройство настроено ✓ Теперь входите по логину и паролю', 'ok')
      }
    }
    async function load() {
      try {
        if (hasToken()) {
          const { content: c, sha } = await loadFromGitHub()
          shaRef.current = sha
          setContent(c)
        } else {
          const c = await loadPublic()
          shaRef.current = null
          setContent(c)
        }
      } catch (e) {
        // Падение GitHub-загрузки — пробуем публичный файл
        try {
          const c = await loadPublic()
          setContent(c)
        } catch {
          setLoadError(String((e as Error).message))
        }
      }
    }
    load()
  }, [])

  const applyEdit = useCallback((fn: (c: Content) => void) => {
    setContent((prev) => {
      if (!prev) return prev
      const draft = structuredClone(prev)
      fn(draft)
      return draft
    })
    setDirty(true)
  }, [])

  async function saveNow() {
    if (!content) return
    if (!hasToken()) {
      notify('Сначала добавьте токен GitHub в «Настройках»', 'err')
      setTab('settings')
      return
    }
    setSaving(true)
    try {
      // Если sha ещё не знаем — получим актуальный из GitHub
      if (shaRef.current === null) {
        const { sha } = await loadFromGitHub()
        shaRef.current = sha
      }
      const newSha = await saveToGitHub(content, shaRef.current, 'Обновление материалов через админ-панель')
      shaRef.current = newSha
      setDirty(false)
      notify('Сохранено на GitHub ✓ Сайт обновится через 1–2 минуты', 'ok')
    } catch (e) {
      notify(String((e as Error).message), 'err')
    } finally {
      setSaving(false)
    }
  }

  function logout() {
    localStorage.removeItem(LS_AUTH)
    setAuthed(false)
  }
  function onLoginOk() {
    localStorage.setItem(LS_AUTH, '1')
    setAuthed(true)
  }

  // Предупреждение о несохранённых изменениях
  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      if (dirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [dirty])

  if (loadError) {
    return <div className="shell"><div className="card"><div className="empty-hint"><div className="big">⚠️</div>{loadError}</div></div></div>
  }
  if (!content) {
    return <div className="shell"><div className="card"><div className="empty-hint"><div className="big">⏳</div>Загрузка…</div></div></div>
  }
  if (!authed) {
    return <>
      <Login content={content} onOk={onLoginOk} />
      <ToastWrap toasts={toasts} />
    </>
  }

  return (
    <div className="shell">
      <header className="adm-header">
        <div className="adm-brand">📚 История на пальцах <small>Админ-панель</small></div>
        <div className="adm-spacer" />
        {dirty && <span className="badge badge-warn">● Есть несохранённые изменения</span>}
        {!hasToken() && <span className="badge badge-warn">Токен не задан</span>}
        <a className="btn btn-ghost btn-sm" href={`${import.meta.env.BASE_URL}index.html`} target="_blank" rel="noopener">↗ Сайт</a>
        <button className="btn btn-primary btn-sm" onClick={saveNow} disabled={saving || !dirty}>
          {saving ? 'Сохранение…' : '💾 Сохранить на сайт'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Выйти</button>
      </header>

      <div className="adm-tabs">
        <button className={'adm-tab' + (tab === 'dashboard' ? ' active' : '')} onClick={() => setTab('dashboard')}>📊 Обзор</button>
        <button className={'adm-tab' + (tab === 'catalog' ? ' active' : '')} onClick={() => setTab('catalog')}>🗂️ Каталог</button>
        <button className={'adm-tab' + (tab === 'settings' ? ' active' : '')} onClick={() => setTab('settings')}>⚙️ Настройки</button>
      </div>

      {tab === 'dashboard' && <Dashboard content={content} applyEdit={applyEdit} notify={notify} />}
      {tab === 'catalog' && <Catalog content={content} applyEdit={applyEdit} notify={notify} />}
      {tab === 'settings' && <SettingsView content={content} applyEdit={applyEdit} notify={notify} />}

      <ToastWrap toasts={toasts} />
    </div>
  )
}

function ToastWrap({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={'toast ' + (t.kind === 'err' ? 'err' : t.kind === 'ok' ? 'ok' : '')}>{t.msg}</div>
      ))}
    </div>
  )
}
