import { useState } from 'react'
import type { EditorProps } from './shared'
import { computeStats } from '../utils'
import { EmojiPicker, Modal } from './ui'
import { findGrade, findSection, newGrade, newSection, newTopic, nextRoman } from './ops'

export default function Dashboard({ content, applyEdit, notify }: EditorProps) {
  const stats = computeStats(content)

  // Быстрое добавление темы
  const [gradeId, setGradeId] = useState(content.grades[0]?.id ?? '')
  const grade = findGrade(content, gradeId)
  const [sectionId, setSectionId] = useState(grade?.sections[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('📖')
  const [url, setUrl] = useState('')
  const [paid, setPaid] = useState(false)

  const [showGrade, setShowGrade] = useState(false)
  const [showSection, setShowSection] = useState(false)

  // Держим section валидным при смене класса
  const curGrade = findGrade(content, gradeId)
  const curSectionValid = curGrade?.sections.some((s) => s.id === sectionId)
  const effectiveSectionId = curSectionValid ? sectionId : curGrade?.sections[0]?.id ?? ''

  function saveTopic(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return notify('Введите название темы', 'err')
    if (!effectiveSectionId) return notify('Сначала добавьте раздел в этот класс', 'err')
    applyEdit((c) => {
      const s = findSection(c, gradeId, effectiveSectionId)
      s?.topics.push(newTopic(title.trim(), icon, url.trim(), paid))
    })
    notify('Тема добавлена ✓ Не забудьте «Сохранить на сайт»', 'ok')
    setTitle('')
    setUrl('')
    setPaid(false)
  }

  const [showHelp, setShowHelp] = useState(true)

  return (
    <>
      <div className="card" style={{ borderColor: 'rgba(201,161,90,0.45)', background: 'linear-gradient(120deg,#fff,#fbf6ea)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowHelp((v) => !v)}>
          <h3 style={{ margin: 0 }}>❔ Как добавить материал</h3>
          <button className="btn btn-ghost btn-sm" type="button">{showHelp ? 'Свернуть' : 'Показать'}</button>
        </div>
        {showHelp && (
          <div style={{ marginTop: 14, fontSize: 14.5, lineHeight: 1.7 }}>
            <div><b>1.</b> Опубликуйте пост с материалами в сообществе ВКонтакте.</div>
            <div><b>2.</b> Скопируйте <b>ссылку на этот пост</b>: в ВКонтакте у поста «•••» → «Скопировать ссылку».</div>
            <div className="callout warn" style={{ margin: '8px 0' }}>
              ⚠️ Копируйте именно <b>ссылку</b> — она выглядит как <code>https://vk.com/wall-…</code>.
              Не вставляйте название/подпись поста (текст) — так тема не откроется.
            </div>
            <div><b>3.</b> Ниже выберите <b>класс</b> и <b>раздел</b>.</div>
            <div><b>4.</b> Впишите <b>название темы</b> (например «§4. …»).</div>
            <div><b>5.</b> Вставьте ссылку в поле <b>«Ссылка на пост ВКонтакте»</b>.</div>
            <div><b>6.</b> Нажмите <b>«Сохранить тему»</b>, затем вверху <b>«💾 Сохранить на сайт»</b>.</div>
            <div style={{ marginTop: 10, color: 'var(--text-muted)' }}>
              🔁 Чтобы <b>заменить</b> ссылку у существующей темы — откройте вкладку «Каталог» → у темы нажмите ✏️.<br />
              🆕 Чтобы добавить <b>ещё материал к той же теме</b> — в «Каталоге» у темы нажмите 🆕. На сайте тема останется одной строкой, а материалы раскроются списком.
            </div>
            <div className="actions-row" style={{ marginTop: 14 }}>
              <a className="btn btn-gold btn-sm" href={`${import.meta.env.BASE_URL}spravka.html`} target="_blank" rel="noopener">📚 Открыть справку с картинками</a>
            </div>
          </div>
        )}
      </div>

      <div className="adm-stats">
        <div className="adm-stat ink"><div className="n">{stats.grades}</div><div className="l">📚 Классов</div></div>
        <div className="adm-stat gold"><div className="n">{stats.sections}</div><div className="l">📖 Разделов / глав</div></div>
        <div className="adm-stat burg"><div className="n">{stats.topics}</div><div className="l">📝 Тем</div></div>
        <div className="adm-stat green"><div className="n">{stats.links}</div><div className="l">🔗 Ссылок на ВК</div></div>
      </div>

      <div className="card">
        <h3>➕ Добавить тему</h3>
        <div className="card-sub">Выберите класс и раздел, впишите название и вставьте ссылку на пост ВКонтакте.</div>
        <form onSubmit={saveTopic}>
          <div className="row2">
            <div className="field">
              <label>Класс</label>
              <select className="select" value={gradeId} onChange={(e) => { setGradeId(e.target.value); }}>
                {content.grades.map((g) => (
                  <option key={g.id} value={g.id}>{g.id} класс — {g.title}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Раздел / глава</label>
              <select className="select" value={effectiveSectionId} onChange={(e) => setSectionId(e.target.value)}>
                {curGrade?.sections.length ? (
                  curGrade.sections.map((s) => (
                    <option key={s.id} value={s.id}>Глава {s.roman}. {s.name}</option>
                  ))
                ) : (
                  <option value="">— нет разделов, добавьте ниже —</option>
                )}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Название темы</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="§1. Древнейшие люди" />
          </div>

          <EmojiPicker value={icon} onChange={setIcon} />

          <div className="field">
            <label>Ссылка на пост ВКонтакте</label>
            <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://vk.com/…" />
            <span className="hint">Можно оставить пустой — тогда тема покажется с пометкой «скоро».</span>
          </div>

          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} style={{ width: 18, height: 18 }} />
              🔒 Материал по подписке (платный)
            </label>
            <span className="hint">Отметьте, если тема доступна только по платной подписке. На сайте появится метка «🔒 по подписке».</span>
          </div>

          <div className="actions-row">
            <button className="btn btn-primary" type="submit">💾 Сохранить тему</button>
            <button className="btn btn-ghost" type="button" onClick={() => setShowSection(true)}>+ Новый раздел</button>
            <button className="btn btn-ghost" type="button" onClick={() => setShowGrade(true)}>+ Новый класс</button>
          </div>
        </form>
      </div>

      {showGrade && (
        <AddGradeModal
          content={content}
          onClose={() => setShowGrade(false)}
          onAdd={(id, t, sub) => {
            if (content.grades.some((g) => g.id === id)) return notify('Класс с таким номером уже есть', 'err')
            applyEdit((c) => c.grades.push(newGrade(id, t, sub)))
            setGradeId(id)
            notify('Класс добавлен ✓', 'ok')
            setShowGrade(false)
          }}
        />
      )}
      {showSection && (
        <AddSectionModal
          content={content}
          defaultGrade={gradeId}
          onClose={() => setShowSection(false)}
          onAdd={(gId, roman, name, course) => {
            let newId = ''
            applyEdit((c) => {
              const g = findGrade(c, gId)
              const s = newSection(roman, name, course)
              newId = s.id
              g?.sections.push(s)
            })
            setGradeId(gId)
            setSectionId(newId)
            notify('Раздел добавлен ✓', 'ok')
            setShowSection(false)
          }}
        />
      )}
    </>
  )
}

function AddGradeModal({ content, onClose, onAdd }: {
  content: EditorProps['content']
  onClose: () => void
  onAdd: (id: string, title: string, subtitle: string) => void
}) {
  const suggested = ['5', '6', '7', '8', '9', '10', '11'].find((n) => !content.grades.some((g) => g.id === n)) ?? ''
  const [id, setId] = useState(suggested)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  return (
    <Modal title="Новый класс" onClose={onClose}>
      <div className="field">
        <label>Номер класса</label>
        <input className="input" value={id} onChange={(e) => setId(e.target.value)} placeholder="5" />
      </div>
      <div className="field">
        <label>Название курса</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="История Древнего мира" />
      </div>
      <div className="field">
        <label>Подзаголовок</label>
        <input className="input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Короткое описание курса" />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
        <button className="btn btn-primary" onClick={() => id.trim() && title.trim() && onAdd(id.trim(), title.trim(), subtitle.trim())}>Добавить</button>
      </div>
    </Modal>
  )
}

function AddSectionModal({ content, defaultGrade, onClose, onAdd }: {
  content: EditorProps['content']
  defaultGrade: string
  onClose: () => void
  onAdd: (gradeId: string, roman: string, name: string, course: string) => void
}) {
  const [gId, setGId] = useState(defaultGrade || content.grades[0]?.id || '')
  const g = findGrade(content, gId)
  const [roman, setRoman] = useState(nextRoman(g?.sections.length ?? 0))
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  return (
    <Modal title="Новый раздел / глава" onClose={onClose}>
      <div className="field">
        <label>Класс</label>
        <select className="select" value={gId} onChange={(e) => { setGId(e.target.value); const gg = findGrade(content, e.target.value); setRoman(nextRoman(gg?.sections.length ?? 0)) }}>
          {content.grades.map((gr) => <option key={gr.id} value={gr.id}>{gr.id} класс</option>)}
        </select>
      </div>
      <div className="row2">
        <div className="field">
          <label>Номер главы</label>
          <input className="input" value={roman} onChange={(e) => setRoman(e.target.value)} placeholder="I" />
        </div>
        <div className="field">
          <label>Курс (необязательно)</label>
          <input className="input" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="История России" />
        </div>
      </div>
      <div className="field">
        <label>Название раздела</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Первобытное общество" />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
        <button className="btn btn-primary" onClick={() => roman.trim() && name.trim() && onAdd(gId, roman.trim(), name.trim(), course.trim())}>Добавить</button>
      </div>
    </Modal>
  )
}
