function StorageTools(selector: string, app: App) {
  return new Vue({
    el: selector,

    mounted() {
      app.filesystem.on('updated', (src: string) => this.$forceUpdate())
    },

    methods: {
      isUrlStorage() {
        return (app.filesystem.storage.kind == 'url')
      },

      isLocalFileStorage() {
        return (app.filesystem.storage.kind == 'local_file')
      },

      saveViewModeToStorage() {
        app.saveViewModeToStorage()
      }
    }

  })
}