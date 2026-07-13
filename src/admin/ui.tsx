import { type ReactNode } from 'react'

export const EMOJIS = [
  '📖', '📜', '📚', '🏛️', '👑', '⚔️', '🛡️', '🗡️', '🏹', '⚓', '⛵', '🧭', '🗺️',
  '🌍', '🌎', '🌏', '🔥', '⚡', '🕊️', '✝️', '☦️', '🕌', '🌙', '🕎', '⛪', '🏰',
  '🐎', '🐘', '🐉', '🏺', '🎨', '🎭', '🔬', '🔭', '📐', '🎓', '💡', '🏭', '🌾',
  '👥', '⚖️', '📢', '💰', '🚀', '🇷🇺', '🇫🇷', '🇬🇧', '🇺🇸', '🦅', '🐺', '⛓️', '🏙️',
]

export function Modal({
  title, children, onClose,
}: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  )
}

export function EmojiPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <label>Иконка</label>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} maxLength={4} placeholder="🦴" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            className="icon-btn"
            style={{ fontSize: 17, background: value === e ? 'var(--paper-2)' : '#fff' }}
            onClick={() => onChange(e)}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  )
}
