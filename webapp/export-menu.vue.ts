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
        app.metrics.track('export_png')
        app.downloader.pngDownload()
      },

      downloadSvg() {
        app.metrics.track('export_svg')
        app.downloader.svgDownload()
      },

      downloadSrc() {
        app.metrics.track('export_src')
        app.downloader.srcDownload()
      },

      onSourceChange(src: string) {
        this.shareLink = '#view/' + Route.urlEncode(src)
      }
    }

  })
}