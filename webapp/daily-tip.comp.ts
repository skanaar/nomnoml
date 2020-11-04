import { useState } from "react"
import { a, div, b, pre, span, prevent } from "./react-util"
// @ts-ignore
import * as nomnoml from "../dist/nomnoml.js"

export function DailyTip(props: { id: string, message: string, source?: string, hidePreview?: boolean }) {
    var visible = localStorage[props.id] != 'hide'
    var [_, setVisible] = useState(true)
    var source = props.source || null
    function closeAlert() {
      localStorage[props.id] = 'hide'
      setVisible(false)
    }
    return div({ className: "alert card " + (visible ? '' : 'alert-hidden') },
      b({}, props.message),
      props.source && pre({}, props.source),
      props.source && !props.hidePreview && span({ dangerouslySetInnerHTML: { __html: nomnoml.renderSvg(props.source) } }),
      a({ className: 'alert-close', onClick: prevent(closeAlert) }, '×')
    )
  }
  