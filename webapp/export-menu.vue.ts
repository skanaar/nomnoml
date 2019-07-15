function ExportMenu(selector: string, app: App): Vue {
  return new Vue({
    el: selector,

    data: {
      shareLink: ''
    },

    mounted() {
      app.on('source-changed', (src: string) => this.onSourceChange(src))
      app.filesystem.on('updated', (src: string) => this.$forceUpdate())
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
        // Adapted from http://meyerweb.com/eric/tools/dencoder/
        function urlEncode(unencoded: string) {
          return encodeURIComponent(unencoded).replace(/'/g,'%27').replace(/"/g,'%22')
        }

        function urlDecode(encoded: string) {
          return decodeURIComponent(encoded.replace(/\+/g, ' '))
        }
        this.shareLink = '#view/' + urlEncode(src)
      }
    }

  })
}