import { useState } from 'react'
import type { EditorProps } from './shared'
import type { Grade, Material, Section, Topic } from '../types'
import { EmojiPicker, Modal } from './ui'
import { findGrade, findSection, move, newMaterial, newTopic } from './ops'

type TopicRef = { gradeId: string; sectionId: string; topic: Topic }
type SectionRef = { gradeId: string; section: Section }

export default function Catalog({ content, applyEdit, notify }: EditorProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({ [content.grades[0]?.id ?? '']: true })
  const [editTopic, setEditTopic] = useState<TopicRef | null>(null)
  const [addTopicTo, setAddTopicTo] = useState<SectionRef | null>(null)
  const [addMaterialTo, setAddMaterialTo] = useState<TopicRef | null>(null)
  const [editSection, setEditSection] = useState<SectionRef | null>(null)
  const [editGrade, setEditGrade] = useState<Grade | null>(null)

  function confirmDel(msg: string) { return window.confirm(msg) }

  // Кол-во материалов у темы (основной + дополнительные)
  function matCount(t: Topic) {
    return (t.url && t.url.trim() ? 1 : 0) + (t.extras?.filter((e) => e.url && e.url.trim()).length ?? 0)
  }

  return (
    <div className="card">
      <h3>🗂️ Каталог материалов</h3>
      <div className="card-sub">Редактируйте классы, разделы и темы. После изменений нажмите «Сохранить на сайт».</div>

      {content.grades.length === 0 && (
        <div className="empty-hint"><div className="big">📭</div>Пока нет ни одного класса. Добавьте его на вкладке «Обзор».</div>
      )}

      {content.grades.map((g, gi) => {
        const isOpen = !!open[g.id]
        const topicCount = g.sections.reduce((a, s) => a + s.topics.length, 0)
        return (
          <div className="tree-grade" key={g.id}>
            <div className="tree-grade-head" onClick={() => setOpen((o) => ({ ...o, [g.id]: !o[g.id] }))}>
              <div className="g-num">{g.id}</div>
              <div className="g-title">
                <b>{g.title}</b>
                <span>{g.sections.length} разделов · {topicCount} тем</span>
              </div>
              <div className="mini-btns" onClick={(e) => e.stopPropagation()}>
                <button className="icon-btn" title="Вверх" disabled={gi === 0} onClick={() => applyEdit((c) => move(c.grades, gi, -1))}>↑</button>
                <button className="icon-btn" title="Вниз" disabled={gi === content.grades.length - 1} onClick={() => applyEdit((c) => move(c.grades, gi, 1))}>↓</button>
                <button className="icon-btn" title="Редактировать класс" onClick={() => setEditGrade(g)}>✏️</button>
                <button className="icon-btn del" title="Удалить класс" onClick={() => {
                  if (confirmDel(`Удалить ${g.id} класс «${g.title}» со всеми разделами и темами?`))
                    applyEdit((c) => { c.grades = c.grades.filter((x) => x.id !== g.id) })
                }}>🗑️</button>
                <button className="icon-btn" title={isOpen ? 'Свернуть' : 'Развернуть'}>{isOpen ? '▲' : '▼'}</button>
              </div>
            </div>

            {isOpen && (
              <div className="tree-grade-body">
                {g.sections.length === 0 && <div className="empty-hint" style={{ padding: '18px' }}>В этом классе ещё нет разделов.</div>}
                {g.sections.map((s, si) => (
                  <div className="tree-section" key={s.id}>
                    <div className="tree-section-head">
                      <div className="s-roman">{s.roman}</div>
                      <div className="s-name">{s.name}</div>
                      {s.course && <div className="s-course">{s.course}</div>}
                      <div className="mini-btns">
                        <button className="icon-btn" title="Вверх" disabled={si === 0} onClick={() => applyEdit((c) => { const gg = findGrade(c, g.id); if (gg) move(gg.sections, si, -1) })}>↑</button>
                        <button className="icon-btn" title="Вниз" disabled={si === g.sections.length - 1} onClick={() => applyEdit((c) => { const gg = findGrade(c, g.id); if (gg) move(gg.sections, si, 1) })}>↓</button>
                        <button className="icon-btn" title="Добавить тему" onClick={() => setAddTopicTo({ gradeId: g.id, section: s })}>➕</button>
                        <button className="icon-btn" title="Редактировать раздел" onClick={() => setEditSection({ gradeId: g.id, section: s })}>✏️</button>
                        <button className="icon-btn del" title="Удалить раздел" onClick={() => {
                          if (confirmDel(`Удалить раздел «${s.name}» и все его темы?`))
                            applyEdit((c) => { const gg = findGrade(c, g.id); if (gg) gg.sections = gg.sections.filter((x) => x.id !== s.id) })
                        }}>🗑️</button>
                      </div>
                    </div>
                    <div className="tree-topics">
                      {s.topics.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '4px 2px' }}>Нет тем. Нажмите ➕, чтобы добавить.</div>}
                      {s.topics.map((t, ti) => (
                        <div className="tree-topic" key={t.id}>
                          <div className="t-icon">{t.icon}</div>
                          <div className="t-title">
                            {t.title}
                            <span className="t-url" style={{ color: matCount(t) ? '#2e7d32' : 'var(--text-muted)' }}>
                              {matCount(t) ? `🔗 материалов: ${matCount(t)}` : 'без ссылки'}
                            </span>
                          </div>
                          <div className="mini-btns">
                            <button className="icon-btn" title="Вверх" disabled={ti === 0} onClick={() => applyEdit((c) => { const ss = findSection(c, g.id, s.id); if (ss) move(ss.topics, ti, -1) })}>↑</button>
                            <button className="icon-btn" title="Вниз" disabled={ti === s.topics.length - 1} onClick={() => applyEdit((c) => { const ss = findSection(c, g.id, s.id); if (ss) move(ss.topics, ti, 1) })}>↓</button>
                            <button className="icon-btn" title="Добавить материал к этой теме" onClick={() => setAddMaterialTo({ gradeId: g.id, sectionId: s.id, topic: t })}>🆕</button>
                            <button className="icon-btn" title="Редактировать тему" onClick={() => setEditTopic({ gradeId: g.id, sectionId: s.id, topic: t })}>✏️</button>
                            <button className="icon-btn del" title="Удалить тему" onClick={() => {
                              if (confirmDel(`Удалить тему «${t.title}»?`))
                                applyEdit((c) => { const ss = findSection(c, g.id, s.id); if (ss) ss.topics = ss.topics.filter((x) => x.id !== t.id) })
                            }}>🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {editTopic && (
        <TopicModal
          initial={editTopic.topic}
          onClose={() => setEditTopic(null)}
          onSave={(title, icon, url, extras) => {
            applyEdit((c) => {
              const s = findSection(c, editTopic.gradeId, editTopic.sectionId)
              const t = s?.topics.find((x) => x.id === editTopic.topic.id)
              if (t) { t.title = title; t.icon = icon; t.url = url; t.extras = extras }
            })
            notify('Тема обновлена ✓', 'ok')
            setEditTopic(null)
          }}
        />
      )}

      {addMaterialTo && (
        <MaterialModal
          hasMain={!!(addMaterialTo.topic.url && addMaterialTo.topic.url.trim())}
          suggestLabel={`Дополнение ${(addMaterialTo.topic.extras?.length ?? 0) + 1}`}
          onClose={() => setAddMaterialTo(null)}
          onSave={(label, url) => {
            applyEdit((c) => {
              const s = findSection(c, addMaterialTo.gradeId, addMaterialTo.sectionId)
              const t = s?.topics.find((x) => x.id === addMaterialTo.topic.id)
              if (!t) return
              if (!t.url || !t.url.trim()) { t.url = url }
              else { (t.extras = t.extras ?? []).push(newMaterial(label || `Дополнение ${(t.extras?.length ?? 0) + 1}`, url)) }
            })
            notify('Материал добавлен ✓', 'ok')
            setAddMaterialTo(null)
          }}
        />
      )}

      {addTopicTo && (
        <TopicModal
          initial={newTopic()}
          title="Новая тема"
          onClose={() => setAddTopicTo(null)}
          onSave={(title, icon, url, extras) => {
            applyEdit((c) => {
              const s = findSection(c, addTopicTo.gradeId, addTopicTo.section.id)
              const nt = newTopic(title, icon, url)
              if (extras.length) nt.extras = extras
              s?.topics.push(nt)
            })
            notify('Тема добавлена ✓', 'ok')
            setAddTopicTo(null)
          }}
        />
      )}

      {editSection && (
        <SectionModal
          initial={editSection.section}
          onClose={() => setEditSection(null)}
          onSave={(roman, name, course) => {
            applyEdit((c) => {
              const s = findSection(c, editSection.gradeId, editSection.section.id)
              if (s) { s.roman = roman; s.name = name; s.course = course }
            })
            notify('Раздел обновлён ✓', 'ok')
            setEditSection(null)
          }}
        />
      )}

      {editGrade && (
        <GradeModal
          initial={editGrade}
          onClose={() => setEditGrade(null)}
          onSave={(title, subtitle) => {
            applyEdit((c) => {
              const g = findGrade(c, editGrade.id)
              if (g) { g.title = title; g.subtitle = subtitle }
            })
            notify('Класс обновлён ✓', 'ok')
            setEditGrade(null)
          }}
        />
      )}
    </div>
  )
}

function TopicModal({ initial, title = 'Редактировать тему', onClose, onSave }: {
  initial: Topic; title?: string; onClose: () => void; onSave: (title: string, icon: string, url: string, extras: Material[]) => void
}) {
  const [t, setT] = useState(initial.title)
  const [icon, setIcon] = useState(initial.icon)
  const [url, setUrl] = useState(initial.url)
  const [extras, setExtras] = useState<Material[]>((initial.extras ?? []).map((e) => ({ ...e })))

  function addExtra() { setExtras((x) => [...x, newMaterial(`Дополнение ${x.length + 1}`, '')]) }
  function upExtra(id: string, patch: Partial<Material>) { setExtras((x) => x.map((e) => (e.id === id ? { ...e, ...patch } : e))) }
  function delExtra(id: string) { setExtras((x) => x.filter((e) => e.id !== id)) }

  return (
    <Modal title={title} onClose={onClose}>
      <div className="field">
        <label>Название темы</label>
        <input className="input" value={t} onChange={(e) => setT(e.target.value)} placeholder="§1. Древнейшие люди" autoFocus />
      </div>
      <EmojiPicker value={icon} onChange={setIcon} />
      <div className="field">
        <label>Основная ссылка на пост ВКонтакте</label>
        <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://vk.com/…" />
      </div>

      <div className="field">
        <label>Дополнительные материалы {extras.length ? `· ${extras.length}` : ''}</label>
        <span className="hint">Раскрываются списком под темой на сайте. Один пост = один материал.</span>
        {extras.map((e) => (
          <div key={e.id} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input className="input" style={{ flex: '0 0 32%' }} value={e.label} onChange={(ev) => upExtra(e.id, { label: ev.target.value })} placeholder="Название" />
            <input className="input" style={{ flex: 1 }} value={e.url} onChange={(ev) => upExtra(e.id, { url: ev.target.value })} placeholder="https://vk.com/…" />
            <button type="button" className="icon-btn del" title="Удалить материал" onClick={() => delExtra(e.id)}>🗑️</button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={addExtra}>+ Добавить материал</button>
      </div>

      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
        <button className="btn btn-primary" onClick={() => t.trim() && onSave(t.trim(), icon, url.trim(), extras.map((e) => ({ ...e, label: e.label.trim(), url: e.url.trim() })).filter((e) => e.url))}>Сохранить</button>
      </div>
    </Modal>
  )
}

function MaterialModal({ hasMain, suggestLabel, onClose, onSave }: {
  hasMain: boolean; suggestLabel: string; onClose: () => void; onSave: (label: string, url: string) => void
}) {
  const [label, setLabel] = useState(suggestLabel)
  const [url, setUrl] = useState('')
  return (
    <Modal title="Добавить материал к теме" onClose={onClose}>
      {hasMain && (
        <div className="field">
          <label>Название материала</label>
          <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Дополнение / Презентация / Тест" />
        </div>
      )}
      <div className="field">
        <label>Ссылка на пост ВКонтакте</label>
        <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://vk.com/…" autoFocus />
        <span className="hint">{hasMain ? 'Добавится как дополнительный материал к этой теме (раскроется списком на сайте).' : 'Станет основным материалом темы.'}</span>
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
        <button className="btn btn-primary" onClick={() => url.trim() && onSave(label.trim(), url.trim())}>Добавить</button>
      </div>
    </Modal>
  )
}

function SectionModal({ initial, onClose, onSave }: {
  initial: Section; onClose: () => void; onSave: (roman: string, name: string, course: string) => void
}) {
  const [roman, setRoman] = useState(initial.roman)
  const [name, setName] = useState(initial.name)
  const [course, setCourse] = useState(initial.course ?? '')
  return (
    <Modal title="Редактировать раздел" onClose={onClose}>
      <div className="row2">
        <div className="field">
          <label>Номер главы</label>
          <input className="input" value={roman} onChange={(e) => setRoman(e.target.value)} />
        </div>
        <div className="field">
          <label>Курс (необязательно)</label>
          <input className="input" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="История России" />
        </div>
      </div>
      <div className="field">
        <label>Название раздела</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
        <button className="btn btn-primary" onClick={() => roman.trim() && name.trim() && onSave(roman.trim(), name.trim(), course.trim())}>Сохранить</button>
      </div>
    </Modal>
  )
}

function GradeModal({ initial, onClose, onSave }: {
  initial: Grade; onClose: () => void; onSave: (title: string, subtitle: string) => void
}) {
  const [title, setTitle] = useState(initial.title)
  const [subtitle, setSubtitle] = useState(initial.subtitle)
  return (
    <Modal title={`Класс ${initial.id}`} onClose={onClose}>
      <div className="field">
        <label>Название курса</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </div>
      <div className="field">
        <label>Подзаголовок</label>
        <input className="input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
        <button className="btn btn-primary" onClick={() => title.trim() && onSave(title.trim(), subtitle.trim())}>Сохранить</button>
      </div>
    </Modal>
  )
}
