function Menu(props: { app: App }) {
    var [hint, setHint] = React.useState('')
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
        }, el(Icon, { id: 'info-outline' })),
        a({
            onClick: prevent(() => app.toggleSidebar('reference')),
            onMouseLeave: () => setHint(''),
            onMouseEnter: () => setHint('Language reference')
        }, el(Icon, { id: 'document-text' })),
        a({
            onClick: prevent(() => app.toggleSidebar('export')),
            onMouseLeave: () => setHint(''),
            onMouseEnter: () => setHint('Export this diagram')
        }, el(Icon, { id: 'arrow-down-outline' })),
        a({
            onClick: prevent(() => app.toggleSidebar('files')),
            onMouseLeave: () => setHint(''),
            onMouseEnter: () => setHint('Save this or load another diagram')
        }, el(Icon, { id: 'folder-open' })),
        
        app.dynamicButton ? app.dynamicButton(app, setHint) : a({
            onClick: prevent(() => app.discardCurrentGraph()),
            onMouseLeave: () => setHint(''),
            onMouseEnter: () => setHint('Discard current diagram')
        }, el(Icon, { id: 'trash' })),

        div({ id: 'tooltip' }, hint),
        el(SystemBanners, { app }),
        el(TerminalBanners, { app }),
    )
}