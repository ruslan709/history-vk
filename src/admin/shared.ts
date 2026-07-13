import type { Content } from '../types'

export type Notify = (msg: string, kind?: 'ok' | 'err' | 'info') => void

export interface EditorProps {
  content: Content
  applyEdit: (fn: (c: Content) => void) => void
  notify: Notify
}
