import { useState } from "react"
import { App } from "./App"
import { Icon } from "./Icon.comp"
import { a, div, el, h1, prevent } from "./react-util"
import { SystemBanners } from "./system-banners.comp"
import { TerminalBanners } from "./terminal-banners.comp"
import { arrow_down_outline, document_text, folder_open, info_large_outline, trash } from "./typicons"

export function Menu(props: { app: App }) {
    var [hint, setHint] = useState('')
    var app = props.app
    return div({ className: 'tools' },
        a({
            className: 'logo',
            onClick: prevent(() => app.toggleSidebar('about')),
            onMouseLeave: () => setHint(''),
            onMouseEnter: () => setHint('About nomnoml')
        }, h1({}, 'nomnoml ')),
        a({
            onClick: prevent(() => app.toggleSidebar('about')),
            onMouseLeave: () => setHint(''),
            onMouseEnter: () => setHint('About nomnoml')
        }, el(Icon, { shape: info_large_outline })),
        a({
            onClick: prevent(() => app.toggleSidebar('reference')),
            onMouseLeave: () => setHint(''),
            onMouseEnter: () => setHint('Language reference')
        }, el(Icon, { shape: document_text })),
        a({
            onClick: prevent(() => app.toggleSidebar('export')),
            onMouseLeave: () => setHint(''),
            onMouseEnter: () => setHint('Export this diagram')
        }, el(Icon, { shape: arrow_down_outline })),
        a({
            onClick: prevent(() => app.toggleSidebar('files')),
            onMouseLeave: () => setHint(''),
            onMouseEnter: () => setHint('Save this or load another diagram')
        }, el(Icon, { shape: folder_open })),
        
        app.dynamicButton ? app.dynamicButton(app, setHint) : a({
            onClick: prevent(() => app.discardCurrentGraph()),
            onMouseLeave: () => setHint(''),
            onMouseEnter: () => setHint('Discard current diagram')
        }, el(Icon, { shape: trash })),

        div({ id: 'tooltip' }, hint),
        el(SystemBanners, { app }),
        el(TerminalBanners, { app }),
    )
}