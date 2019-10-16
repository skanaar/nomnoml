function FileMenu(selector: string, app: App): Vue {
  return new Vue({
    el: selector,

    data: {
      source: ''
    },

    mounted() {
      app.signals.on('source-changed', (src: string) => this.onSourceChange(src))
      app.filesystem.signals.on('updated', (src: string) => this.$forceUpdate())
    },

    methods: {
      items() {
        return app.filesystem.files()
      },

      isActive(item: FileEntry): boolean {
        return this.isLocalFile() && app.filesystem.activeFile.name === item.name
      },

      isLocalFile() {
        return app.filesystem.storage.kind === 'local_file'
      },

      isAtHome() {
        return app.filesystem.storage.kind === 'local_default'
      },

      itemPath(item: FileEntry) {
        return '#file/' + encodeURIComponent(item.name).replace(/%20/g, '+')
      },

      discard(item: FileEntry) {
        if (confirm('Permanently delete "' + item.name + '"'))
          app.filesystem.discard(item)
      },

      saveAs() {
        var name = prompt('Name your diagram')
        if (name) {
          if (app.filesystem.files().some((e: FileEntry) => e.name === name)) {
            alert('A file named '+name+' already exists.')
            return
          }
          app.filesystem.moveToFileStorage(name, app.currentSource())
          location.href = '#file/' + encodeURIComponent(name)
        }
      },

      loadSvg(e: Event) {
        var files = (e.target as HTMLInputElement).files
        app.handleOpeningFiles(files)
      },

      onSourceChange(src: string) {
        this.source = src
      }
    }

  })
}