function DailyTip(props: { id: string, message: string, source: string}) {
    var visible = localStorage[props.id] != 'hide'
    var [_, setVisible] = React.useState(true)
    function closeAlert() {
      localStorage[props.id] = 'hide'
      setVisible(false)
    }
    return div({ className: "alert " + (visible ? '' : 'alert-hidden') },
      b({}, props.message),
      pre({}, props.source),
      span({ dangerouslySetInnerHTML: { __html: (nomnoml as any).renderSvg(props.source) } }),
      a({ className: 'alert-close', onClick: prevent(closeAlert) }, '×')
    )
  }
  