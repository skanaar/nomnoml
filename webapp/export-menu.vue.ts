function ExportMenu(selector: string, app: App): Vue {
  return new Vue({
    el: selector,

    data: {
      shareLink: ''
    },

    mounted() {
      app.signals.on('source-changed', (src: string) => this.onSourceChange(src))
      app.filesystem.signals.on('updated', (src: string) => this.$forceUpdate())
    },

    methods: {
      downloadPng() {
        app.downloader.pngDownload()
      },

      downloadSvg() {
        app.downloader.svgDownload()
      },

      downloadSrc() {
        app.downloader.srcDownload()
      },

      onSourceChange(src: string) {
        this.shareLink = '#view/' + Route.urlEncode(src)
      }
    }

  })
}