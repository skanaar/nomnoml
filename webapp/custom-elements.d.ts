import { DetailedHTMLProps, HTMLAttributes } from 'react'

// this allows us to use custom elements in jsx
// <my-custom-tag class="heavy"></my-custom-tag>
// note that custom elements use "class" instead of "className"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & { class?: string },
        HTMLElement
      >
    }
  }
}
