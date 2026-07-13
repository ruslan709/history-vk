import { useEffect, useMemo, useRef, useState } from 'react'
import type { Content, Grade, Section, Topic } from '../types'
import { ROMAN } from '../types'
import { loadPublic } from '../github'
import { computeStats, getMaterials, pluralChapters } from '../utils'

function Illustration() {
  return (
    <div className="illustration">
      <svg viewBox="0 0 320 230" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="float-slow">
          <rect x="118" y="18" width="150" height="108" rx="10" transform="rotate(8 118 18)" fill="#F1E4C4" stroke="#C9A15A" strokeWidth="2" />
          <path d="M140 40 Q170 55 160 80 T190 100" stroke="#7C2540" strokeWidth="1.6" fill="none" strokeDasharray="4 3" transform="rotate(8 118 18)" />
          <circle cx="150" cy="45" r="3" fill="#7C2540" transform="rotate(8 118 18)" />
          <circle cx="195" cy="98" r="3" fill="#7C2540" transform="rotate(8 118 18)" />
        </g>
        <g className="float-slow d2">
          <path d="M40 150 C40 145 44 141 49 141 H108 V196 H49 C44 196 40 192 40 187 Z" fill="#182848" />
          <path d="M176 150 C176 145 172 141 167 141 H108 V196 H167 C172 196 176 192 176 187 Z" fill="#233a63" />
          <path d="M108 141 V196" stroke="#E7CE9B" strokeWidth="1.4" />
          <line x1="52" y1="153" x2="98" y2="153" stroke="#8aa0c9" strokeWidth="1.4" />
          <line x1="52" y1="163" x2="98" y2="163" stroke="#8aa0c9" strokeWidth="1.4" />
          <line x1="52" y1="173" x2="92" y2="173" stroke="#8aa0c9" strokeWidth="1.4" />
        </g>
        <g>
          <rect x="182" y="120" width="86" height="52" rx="8" fill="#FBF6E9" stroke="#C9A15A" strokeWidth="2" />
          <circle cx="182" cy="146" r="9" fill="#F1E4C4" stroke="#C9A15A" strokeWidth="2" />
          <circle cx="268" cy="146" r="9" fill="#F1E4C4" stroke="#C9A15A" strokeWidth="2" />
          <line x1="198" y1="134" x2="252" y2="134" stroke="#B79A6E" strokeWidth="1.4" />
          <line x1="198" y1="144" x2="252" y2="144" stroke="#B79A6E" strokeWidth="1.4" />
          <line x1="198" y1="154" x2="238" y2="154" stroke="#B79A6E" strokeWidth="1.4" />
        </g>
        <g>
          <circle cx="227" cy="96" r="30" fill="#fff" stroke="#182848" strokeWidth="2.5" />
          <circle cx="227" cy="96" r="23" fill="none" stroke="#C9A15A" strokeWidth="1.2" />
          <g className="compass-needle">
            <path d="M227 78 L233 96 L227 114 L221 96 Z" fill="#7C2540" />
          </g>
          <circle cx="227" cy="96" r="3" fill="#182848" />
        </g>
      </svg>
    </div>
  )
}

// ⚠️ ЗАМЕНИ на ссылку своего сообщества ВКонтакте (напр. https://vk.com/istoriya_history)
const CHANNEL_INVITE = 'https://vk.com/'

// Логотип канала: пробуем logo.png → logo.webp → logo.jpg, иначе рисованная эмблема.
const LOGO_CANDIDATES = ['logo.png', 'logo.webp', 'logo.jpg']
function BrandEmblem() {
  const [i, setI] = useState(0)
  if (i >= LOGO_CANDIDATES.length) return <Illustration />
  return (
    <div className="illustration">
      <img
        className="brand-logo"
        src={`${import.meta.env.BASE_URL}${LOGO_CANDIDATES[i]}`}
        alt="История для урока и жизни"
        onError={() => setI((n) => n + 1)}
      />
    </div>
  )
}

// Иконка сообщества ВКонтакте (нарисована SVG — отдельный файл не нужен).
function VkIcon() {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="ВКонтакте">
      <rect width="48" height="48" rx="13" fill="#0077FF" />
      <text x="24" y="31" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="18" fill="#fff">VK</text>
    </svg>
  )
}

// Тонкие SVG-иконки для карточек статистики
const IconBook = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
    <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5z" />
  </svg>
)
const IconLayers = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="M3 13l9 5 9-5" /><path d="M3 18l9 5 9-5" />
  </svg>
)
const IconCap = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 9 12 4 2 9l10 5 10-5Z" /><path d="M6 11v5c0 1 2.7 3 6 3s6-2 6-3v-5" />
  </svg>
)

function StatNum({ target }: { target: number }) {
  const [val, setVal] = useState(0)
  const ref = useRef(target)
  ref.current = target
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const dur = 900
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(ref.current * eased))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return <>{val}</>
}

function highlight(text: string, q: string) {
  if (!q) return text
  const i = text.toLowerCase().indexOf(q)
  if (i === -1) return text
  return (
    <>
      {text.slice(0, i)}
      <span className="lesson-mark">{text.slice(i, i + q.length)}</span>
      {text.slice(i + q.length)}
    </>
  )
}

export default function Nav() {
  const [content, setContent] = useState<Content | null>(null)
  const [error, setError] = useState('')
  const [gradeId, setGradeId] = useState<string>('')
  const [openSection, setOpenSection] = useState<string>('')
  const [query, setQuery] = useState('')
  const [showJoin, setShowJoin] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [dark, setDark] = useState(false)
  const [toast, setToast] = useState('')
  const [openMats, setOpenMats] = useState<Record<string, boolean>>({})

  function closeJoin() {
    setShowJoin(false)
    localStorage.setItem('istoriya_vk_join_seen', '1')
  }

  // Тёмная тема
  useEffect(() => {
    const saved = localStorage.getItem('istoriya_vk_theme')
    const isDark = saved === 'dark'
    setDark(isDark)
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }, [])
  function toggleTheme() {
    setDark((d) => {
      const next = !d
      document.documentElement.dataset.theme = next ? 'dark' : 'light'
      localStorage.setItem('istoriya_vk_theme', next ? 'dark' : 'light')
      return next
    })
  }

  // Поделиться
  async function doShare() {
    const url = window.location.href.split('#')[0]
    const data = { title: 'История на пальцах', text: 'Навигатор по материалам по истории 5–11 классов', url }
    try {
      if (navigator.share) { await navigator.share(data); return }
      await navigator.clipboard.writeText(url)
      showToast('Ссылка скопирована ✓')
    } catch { /* пользователь отменил — ничего */ }
  }
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  useEffect(() => {
    loadPublic()
      .then((c) => {
        setContent(c)
        // Восстанавливаем последний выбранный класс и открытую главу
        const savedGrade = localStorage.getItem('istoriya_vk_nav_grade')
        const savedSection = localStorage.getItem('istoriya_vk_nav_section')
        const g = c.grades.find((x) => x.id === savedGrade) ?? c.grades[0]
        if (g) {
          setGradeId(g.id)
          const sec = g.sections.find((s) => s.id === savedSection) ?? g.sections[0]
          setOpenSection(sec?.id ?? '')
        }
        // Окно с приглашением подписаться — один раз на устройство
        if (!localStorage.getItem('istoriya_vk_join_seen')) setShowJoin(true)
        // Возврат к последней открытой теме — чтобы смотреть соседние темы подряд
        const savedTopic = localStorage.getItem('istoriya_vk_nav_topic')
        if (savedTopic) {
          setTimeout(() => {
            const el = document.getElementById('t-' + savedTopic)
            if (el) {
              el.scrollIntoView({ block: 'center' })
              el.classList.add('lesson-just')
              setTimeout(() => el.classList.remove('lesson-just'), 1600)
            }
          }, 350)
        }
      })
      .catch((e) => setError(String(e.message || e)))
  }, [])

  const stats = useMemo(() => (content ? computeStats(content) : null), [content])
  const grade: Grade | undefined = content?.grades.find((g) => g.id === gradeId)
  const q = query.trim().toLowerCase()

  function selectGrade(g: Grade) {
    const first = g.sections[0]?.id ?? ''
    setGradeId(g.id)
    setOpenSection(first)
    setQuery('')
    localStorage.setItem('istoriya_vk_nav_grade', g.id)
    localStorage.setItem('istoriya_vk_nav_section', first)
  }

  function toggleSection(id: string) {
    setOpenSection((cur) => {
      const next = cur === id ? '' : id
      localStorage.setItem('istoriya_vk_nav_section', next)
      return next
    })
  }

  if (error) {
    return (
      <div className="shell">
        <div className="content-card">
          <div className="empty-state">
            <div className="big">⚠️</div>
            <div>{error}</div>
          </div>
        </div>
      </div>
    )
  }
  if (!content || !grade || !stats) {
    return (
      <div className="shell">
        <div className="content-card">
          <div className="empty-state"><div className="big">📚</div>Загрузка материалов…</div>
        </div>
      </div>
    )
  }

  function renderLesson(t: Topic, subLabel?: string) {
    const mats = getMaterials(t)
    const titleBlock = (
      <div className="lesson-title">
        {highlight(t.title, q)}
        {subLabel && <span className="lesson-sub">{subLabel}</span>}
      </div>
    )

    // Нет материалов — «скоро»
    if (mats.length === 0) {
      return (
        <div key={t.id} className="lesson">
          <div className="lesson-icon">{t.icon}</div>
          {titleBlock}
          <span className="lesson-soon">скоро</span>
        </div>
      )
    }

    // Один материал — обычная кликабельная строка
    if (mats.length === 1) {
      return (
        <a key={t.id} id={`t-${t.id}`} className="lesson clickable" href={mats[0].url} onClick={() => localStorage.setItem('istoriya_vk_nav_topic', t.id)}>
          <div className="lesson-icon">{t.icon}</div>
          {titleBlock}
          <span className="lesson-arrow">↗</span>
        </a>
      )
    }

    // Несколько материалов — раскрывающийся список
    const open = !!openMats[t.id]
    return (
      <div key={t.id} id={`t-${t.id}`} className={'lesson-multi' + (open ? ' open' : '')}>
        <div className="lesson clickable lm-head" onClick={() => setOpenMats((o) => ({ ...o, [t.id]: !o[t.id] }))}>
          <div className="lesson-icon">{t.icon}</div>
          {titleBlock}
          <span className="lm-badge">📎 {mats.length}</span>
          <span className="lm-chev">▾</span>
        </div>
        <div className="lm-list" style={{ maxHeight: open ? `${mats.length * 60 + 10}px` : '0' }}>
          {mats.map((m, i) => (
            <a key={i} className="lm-item" href={m.url} onClick={() => localStorage.setItem('istoriya_vk_nav_topic', t.id)}>
              <span className="lm-dot">{i === 0 ? '📄' : '📎'}</span>
              <span className="lm-item-label">{m.label}</span>
              <span className="lesson-arrow">↗</span>
            </a>
          ))}
        </div>
      </div>
    )
  }

  const searchGroups = q
    ? content.grades
        .map((g) => {
          const hits: { t: Topic; sec: Section }[] = []
          g.sections.forEach((s) => s.topics.forEach((t) => {
            if (t.title.toLowerCase().includes(q)) hits.push({ t, sec: s })
          }))
          return { g, hits }
        })
        .filter((x) => x.hits.length > 0)
    : []
  const searchTotal = searchGroups.reduce((a, x) => a + x.hits.length, 0)

  let lastCourse = ' '

  return (
    <div className="shell">
      <header className="topbar">
        <div className="top-actions">
          <button className="ta-btn" onClick={toggleTheme} title="Светлая/тёмная тема" aria-label="Сменить тему">{dark ? '☀️' : '🌙'}</button>
          <button className="ta-btn" onClick={doShare} title="Поделиться" aria-label="Поделиться">🔗</button>
          <button className="ta-btn" onClick={() => setShowAbout(true)} title="Как пользоваться" aria-label="О проекте">ℹ️</button>
        </div>
        <div>
          <div className="brand-eyebrow">✦ Электронное пособие нового поколения</div>
          <h1>📚 История <span className="accent">на пальцах</span></h1>
          <div className="tagline">История для урока и жизни</div>
          <p className="lead">
            Современные материалы по истории для учителей, родителей и школьников — от 5 до 11 класса,
            собранные в одну понятную навигацию.
          </p>
          <div className="search-wrap">
            <span className="icon">🔍</span>
            <input
              type="text"
              placeholder="Найти тему, например «Древние»…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="search-hint">Поиск идёт сразу по всем классам и подсвечивает совпадения</div>
        </div>
        <BrandEmblem />
      </header>

      <section className="stats">
        <div className="stat-card">
          <div className="stat-icon"><IconBook /></div>
          <div><div className="stat-num"><StatNum target={stats.topics} /></div><div className="stat-label">Материалов</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><IconLayers /></div>
          <div><div className="stat-num"><StatNum target={stats.sections} /></div><div className="stat-label">Глав</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><IconCap /></div>
          <div><div className="stat-num"><StatNum target={stats.grades} /></div><div className="stat-label">Классов</div></div>
        </div>
      </section>

      {stats.topics > 0 && (
        <section className="progress-card">
          <div className="progress-top">
            <span className="progress-label">📈 Наполнение материалами</span>
            <span className="progress-val">Готово {stats.links} из {stats.topics} тем · {Math.round((stats.links / stats.topics) * 100)}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${Math.round((stats.links / stats.topics) * 100)}%` }} />
          </div>
        </section>
      )}

      <a className="join-cta" href={CHANNEL_INVITE} target="_blank" rel="noopener noreferrer">
        <span className="jc-glow" aria-hidden="true"></span>
        <span className="jc-badge"><VkIcon /></span>
        <span className="jc-body">
          <span className="jc-title">Все материалы — в нашем сообществе ВКонтакте</span>
          <span className="jc-sub">Подпишитесь, чтобы открывать темы из навигатора. Бесплатно и в один тап.</span>
        </span>
        <span className="jc-btn">Вступить в сообщество →</span>
      </a>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-title">🎓 Классы</div>
          <div className="class-list">
            {content.grades.map((g) => (
              <button
                key={g.id}
                className={'class-btn' + (g.id === gradeId ? ' active' : '')}
                onClick={() => selectGrade(g)}
              >
                <span>{g.id} класс</span>
                <span className="num">{ROMAN[g.id] ?? ''}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="content-card">
          {q ? (
            /* ===== Глобальный поиск по всем классам ===== */
            <>
              <div className="content-head">
                <div>
                  <div className="eyebrow">Поиск</div>
                  <h2>Результаты по «{query}»</h2>
                  <div className="sub">{searchTotal > 0 ? `Найдено ${searchTotal} — во всех классах` : 'Ничего не найдено'}</div>
                </div>
              </div>
              {searchTotal === 0 ? (
                <div className="empty-state">
                  <div className="big">🔍</div>
                  <div>По запросу «{query}» ничего не найдено</div>
                </div>
              ) : (
                searchGroups.map(({ g, hits }) => (
                  <div key={g.id} className="search-group">
                    <div className="course-heading">🎓 {g.id} класс — {g.title}</div>
                    <div className="search-hits">
                      {hits.map(({ t, sec }) => renderLesson(t, `Глава ${sec.roman}. ${sec.name}`))}
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            /* ===== Обычный вид: выбранный класс ===== */
            <>
              <div className="content-head">
                <div>
                  <div className="eyebrow">{grade.id} класс</div>
                  <h2>{grade.title}</h2>
                  <div className="sub">{grade.subtitle}</div>
                </div>
                <div className="chapter-count-pill">
                  {grade.sections.length} {pluralChapters(grade.sections.length)}
                </div>
              </div>

              {grade.sections.map((sec) => {
                const isOpen = openSection === sec.id
                const showCourseHeading = sec.course && sec.course !== lastCourse
                if (sec.course) lastCourse = sec.course
                return (
                  <div key={sec.id}>
                    {showCourseHeading && <div className="course-heading">📘 {sec.course}</div>}
                    <div className={'chapter' + (isOpen ? ' open' : '')}>
                      <div className="chapter-head" onClick={() => toggleSection(sec.id)}>
                        <div className="chapter-roman">{sec.roman}</div>
                        <div className="chapter-titles">
                          <div className="ctitle">📜 Глава {sec.roman}. {sec.name}</div>
                          <div className="cmeta">{sec.topics.length} материалов</div>
                        </div>
                        <div className="chapter-toggle">▼</div>
                      </div>
                      <div className="chapter-body" style={{ maxHeight: isOpen ? '3000px' : '0' }}>
                        <div className="chapter-body-inner">
                          {sec.topics.length === 0 && (
                            <div className="lesson"><div className="lesson-title" style={{ color: 'var(--text-muted)' }}>Материалы скоро появятся</div></div>
                          )}
                          {sec.topics.map((t) => renderLesson(t))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </section>
      </div>

      <footer className="nav-footer">
        <span className="fmark">©</span> История на пальцах — навигация по школьной программе.
      </footer>

      {showJoin && (
        <div className="jm-overlay" onClick={closeJoin}>
          <div className="jm-card" onClick={(e) => e.stopPropagation()}>
            <button className="jm-close" onClick={closeJoin} aria-label="Закрыть">×</button>
            <div className="jm-badge"><VkIcon /></div>
            <h3 className="jm-title">Подпишитесь на сообщество ВКонтакте</h3>
            <p className="jm-sub">Все материалы — в нашем сообществе. Это бесплатно и в один тап. После подписки открываются все темы навигатора.</p>
            <a className="jm-btn" href={CHANNEL_INVITE} target="_blank" rel="noopener noreferrer" onClick={closeJoin}>
              Вступить в сообщество →
            </a>
            <button className="jm-later" onClick={closeJoin}>Уже подписан(а) · закрыть</button>
          </div>
        </div>
      )}

      {showAbout && (
        <div className="jm-overlay" onClick={() => setShowAbout(false)}>
          <div className="jm-card about-card" onClick={(e) => e.stopPropagation()}>
            <button className="jm-close" onClick={() => setShowAbout(false)} aria-label="Закрыть">×</button>
            <div className="about-emoji">📚🧭</div>
            <h3 className="jm-title">Как пользоваться навигатором</h3>
            <ol className="about-steps">
              <li><b>Выберите класс</b> слева (с 5 по 11).</li>
              <li><b>Откройте главу</b> и найдите нужную тему (§).</li>
              <li><b>Нажмите на тему</b> — откроется пост с материалами в сообществе ВКонтакте.</li>
              <li>Материалы доступны <b>подписчикам сообщества</b> — подпишитесь в один тап.</li>
            </ol>
            <p className="about-note">💡 Совет: пользуйтесь <b>поиском</b> вверху — он ищет тему сразу по всем классам. А кнопка «Назад» в браузере вернёт вас на то же место.</p>
            <a className="jm-btn" href={CHANNEL_INVITE} target="_blank" rel="noopener noreferrer" onClick={() => setShowAbout(false)}>Вступить в сообщество →</a>
          </div>
        </div>
      )}

      {toast && <div className="nav-toast">{toast}</div>}
    </div>
  )
}
