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
        app.metrics.track('localfile_discard:query')
        if (confirm('Permanently delete "' + item.name + '"'))
          app.metrics.track('localfile_discard:confirmed')
          app.filesystem.discard(item)
      },

      saveAs() {
        app.metrics.track('save_as:query')
        var name = prompt('Name your diagram')
        if (name) {
          if (app.filesystem.files().some((e: FileEntry) => e.name === name)) {
            app.metrics.track('save_as:file_already_exists')
            alert('A file named '+name+' already exists.')
            return
          }
          app.metrics.track('save_as:confirmed')
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