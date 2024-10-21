import { css, unsafeCSS } from "lit";
// eslint-disable-next-line import/no-unresolved
import tailwind from '../style.css?inline'

export const styles = css`
  ${unsafeCSS(tailwind)}
`
