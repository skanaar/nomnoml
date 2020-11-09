import { useState } from "react"
import { a, div, span, prevent } from "./react-util"
// @ts-ignore
import * as nomnoml from "../dist/nomnoml.js"

export function DailyTip(props: { id: string, children: any }) {
  var visible = localStorage[props.id] != 'hide'
  var [, setVisible] = useState(true)
  function closeAlert() {
    localStorage[props.id] = 'hide'
    setVisible(false)
  }
  return div({ className: "alert card " + (visible ? '' : 'alert-hidden') },
    props.children,
    a({ className: 'alert-close', onClick: prevent(closeAlert) }, '×')
  )
}

export function NomnomlGraph(props: { source: string }) {
  return span({ dangerouslySetInnerHTML: { __html: nomnoml.renderSvg(props.source) } })
}
