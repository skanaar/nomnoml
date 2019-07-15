function FileMenu(selector: string, app: App): Vue {
  return new Vue({
    el: selector,

    data: {
      source: ''
    },

    mounted() {
      app.on('source-changed', (src: string) => this.onSourceChange(src))
      app.filesystem.on('updated', (src: string) => this.$forceUpdate())
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

      itemPath(item: FileEntry) {
        return '#file/' + encodeURIComponent(item.name).replace(/%20/g, '+')
      },

      discardCurrent() {
        if (app.filesystem.storage.kind === 'local_default') {
          app.discardCurrentGraph()
        }
        else if (app.filesystem.storage.kind === 'local_file') {
          if (confirm('Permanently delete "' + app.filesystem.activeFile.name + '"')) {
            app.filesystem.discard(app.filesystem.activeFile)
          }
        }
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

      onSourceChange(src: string) {
        this.source = src
      }
    }

  })
}