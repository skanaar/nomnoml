import { useState } from "react"
import { a, div, span, prevent } from "./react-util"
// @ts-ignore
import * as nomnoml from "../dist/nomnoml.js"

type DailyTipProps = { id: string, sticky?: boolean, children: any }
export function DailyTip({ id, sticky, children }: DailyTipProps) {
  var key = 'nomnoml.daily-tip:' + id
  var visible = sticky || localStorage[key] != 'hide'
  var [, setVisible] = useState(true)
  function closeAlert() {
    localStorage[key] = 'hide'
    setVisible(false)
  }
  return div({ className: "alert card " + (visible ? '' : 'alert-hidden') },
    children,
    sticky || a({ className: 'alert-close', onClick: prevent(closeAlert) }, '×')
  )
}

export function NomnomlGraph(props: { source: string }) {
  return span({ dangerouslySetInnerHTML: { __html: nomnoml.renderSvg(props.source) } })
}

