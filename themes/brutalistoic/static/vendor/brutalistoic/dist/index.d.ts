/** brutalistoic components. Global: window.Brutalistoic. Needs React 18, tokens.css and bundle.css. */
export type Tone = 'default' | 'accent' | 'ok' | 'warn' | 'err' | 'info' | 'outline';
export interface LogoProps { size?: number; color?: string; pulse?: boolean; title?: string; }
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost'; size?: 'sm'; active?: boolean; }
export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; hint?: string; error?: string; prompt?: string; }
export interface CardProps { title?: string; kicker?: string; titleFont?: 'tech' | 'slab' | 'gothic'; mono?: boolean; dither?: 'animated' | 'static' | 'none'; children?: React.ReactNode; }
export interface WindowProps { title: string; footer?: React.ReactNode; children?: React.ReactNode; }
export interface FrameProps { padding?: number; size?: number; color?: string; inset?: number; children?: React.ReactNode; }
export interface BadgeProps { tone?: Tone; children?: React.ReactNode; }
export interface TabsProps { items: { id: string; label: string }[]; value?: string; defaultValue?: string; onChange?: (id: string) => void; }
export interface TableProps { columns: { key: string; label: string; numeric?: boolean }[]; rows: Record<string, React.ReactNode>[]; dense?: boolean; }
export interface AsciiProgressProps { value?: number; width?: number; label?: string; }
export interface AsciiSpinnerProps { frames?: 'star' | 'braille' | 'bar' | 'block'; label?: string; interval?: number; }
/** 'thebrutalistoic' is the opaque design-system hero ground: use it only for heroes about the design system. */
export type AsciiAnimationName = 'thebrutalistoic' | 'cat' | 'coin' | 'computer' | 'grok' | 'hands' | 'fire-2' | 'cube' | 'wave' | 'wizard' | 'rocket' | 'planet' | 'mail';
export interface AsciiAnimationProps { name?: AsciiAnimationName; fps?: number; size?: number; maxSize?: number; cover?: boolean; opacity?: number; veil?: boolean; playing?: boolean; alt?: string; decorative?: boolean; }
export interface TerminalProps { lines?: (string | { t: string; kind?: 'cmd' | 'out' | 'ok' | 'warn' | 'err' | 'dim' })[]; code?: string; title?: string; status?: string; prompt?: string; typing?: boolean; speed?: number; copy?: boolean; }
export interface ArticleHeaderProps { title: string; kicker?: string; deck?: string; meta?: string; titleFont?: 'gothic' | 'slab'; }
export interface AsciiFieldProps { variant?: 'drift' | 'field' | 'starburst' | 'swirl' | 'torus'; size?: number; speed?: number; scale?: number; animated?: boolean; opacity?: number; color?: string; mask?: string; seed?: number; }
export interface AsciiBannerProps { rows?: number; size?: number; alt?: string; }
export interface AsciiDevouredProps { size?: number; fit?: boolean; fps?: number; playing?: boolean; color?: string; alt?: string; }
export interface BayerFieldProps { animated?: boolean; opacity?: number; cell?: number; color?: string; mask?: string; seed?: number; }
export interface MarbleDitherProps { speed?: number; scale?: number; block?: number; animated?: boolean; opacity?: number; color?: string; mask?: string; seed?: number; }
