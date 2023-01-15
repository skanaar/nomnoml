import { App } from "./App"
import { label, div, input, el, a } from "./react-util"

export function ParserConfig({ app }: { app: App }) {
  return div({ className: 'alert card' },
    el('p', {},
      'Nomnoml is now testing a new parser.',
      el('br', {}),
      'Is your diagram not working? Please report any problems to ',
      a({ href: 'https://github.com/skanaar/nomnoml/issues', target: '_blank' }, 'GitHub'),
      ' or email ',
      a({ href: 'mailto:daniel.kallin@gmail.com' }, 'Daniel'),
      '.'
    ),
    label({},
      input({
        type: 'checkbox',
        checked: app.isUsingLegacyParser(),
        onChange: (e: any) => app.setLegacyParser(e.target.checked)
      }),
      'Use legacy parser'
      )
  )
}
