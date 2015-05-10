var nomnoml = nomnoml || {}

$(function (){

	var storage = null
	var jqCanvas = $('#canvas')
	var viewport = $(window)
	var lineNumbers = $('#linenumbers')
	var lineMarker = $('#linemarker')
	var jqTextarea = $('#textarea')
	var storageStatusElement = $('#storage-status')
	var textarea = document.getElementById('textarea')
	var imgLink = document.getElementById('savebutton')
	var linkLink = document.getElementById('linkbutton')
	var canvasElement = document.getElementById('canvas')
	var defaultSource = document.getElementById('defaultGraph').innerHTML
	var graphics = skanaar.Canvas(canvasElement, {})

	window.addEventListener('hashchange', reloadStorage);
	window.addEventListener('resize', _.throttle(sourceChanged, 750, {leading: true}))
	textarea.addEventListener('input', _.debounce(sourceChanged, 300))
	initImageDownloadLink(imgLink, canvasElement)
	lineNumbers.val(_.times(60, _.identity).join('\n'))

	reloadStorage()

	nomnoml.toggleSidebar = function (id){
		var sidebars = ['reference', 'about']
		_.chain(sidebars).without(id).each(function (key){
			document.getElementById(key).classList.remove('visible')
		})
		document.getElementById(id).classList.toggle('visible')
	}

	nomnoml.discardCurrentGraph = function (){
		if (confirm('Do you want to discard current diagram and load the default example?')){
			textarea.value = defaultSource
			sourceChanged()
		}
	}

	nomnoml.saveViewModeToStorage = function (){
		if (confirm('Do you want to overwrite the diagram in localStorage with the currently viewed diagram?')){
			storage.moveToLocalStorage()
			window.location = './'
		}
	}

	nomnoml.exitViewMode = function (){
		window.location = './'
	}

	// Adapted from http://meyerweb.com/eric/tools/dencoder/
	function urlEncode(unencoded) {
		return encodeURIComponent(unencoded).replace(/'/g,"%27").replace(/"/g,"%22")
	}
	function urlDecode(encoded) {
		return decodeURIComponent(encoded.replace(/\+/g,  " "))
	}

	function setShareableLink(str){
		var base = 'http://www.nomnoml.com/#view/'
		linkLink.href = base + urlEncode(str)
	}

	function buildStorage(locationHash){
		var key = 'nomnoml.lastSource'
		if (locationHash.substring(0,6) === '#view/')
			return {
				read: function (){ return urlDecode(locationHash.substring(6)) },
				save: function (source){ setShareableLink(textarea.value) },
				moveToLocalStorage: function (){ localStorage[key] = this.read() },
				isReadonly: true
			}
		return {
			read: function (){ return localStorage[key] || defaultSource },
			save: function (source){
				setShareableLink(textarea.value)
				localStorage[key] = source
			},
			moveToLocalStorage: function (){},
			isReadonly: false
		}
	}

	function initImageDownloadLink(link, canvasElement){
		link.addEventListener('click', downloadImage, false);
		function downloadImage(){
			var url = canvasElement.toDataURL('image/png')
			link.href = url;
		}
	}

	function getConfig(d){
		return {
			arrowSize: +d.arrowSize || 1,
			bendSize: +d.bendSize || 0.3,
			direction: {down: 'TB', right: 'LR'}[d.direction] || 'TB',
			gutter: +d.gutter || 5,
			edgeMargin: (+d.edgeMargin) || 0,
			edges: {hard: 'hard', rounded: 'rounded'}[d.edges] || 'rounded',
			fill: (d.fill || '#eee8d5;#fdf6e3;#eee8d5;#fdf6e3').split(';'),
			fillArrows: d.fillArrows === 'true',
			font: d.font || 'Calibri',
			fontSize: (+d.fontSize) || 12,
			leading: (+d.leading) || 1.25,
			lineWidth: (+d.lineWidth) || 3,
			padding: (+d.padding) || 8,
			spacing: (+d.spacing) || 40,
			stroke: d.stroke || '#33322E',
			zoom: +d.zoom || 1
		}
	}

	function fitCanvasSize(rect, scale, superSampling){
		var w = rect.width * scale
		var h = rect.height * scale
		jqCanvas.attr({width: superSampling*w, height: superSampling*h})
		jqCanvas.css({
			top: 300 * (1 - h/viewport.height()),
			left: 150 + (viewport.width() - w)/2,
			width: w,
			height: h
		})
	}

	function setFont(config, isBold, isItalic){
		var style = (isBold === 'bold' ? 'bold ' : '')
		if (isItalic) style = 'italic ' + style
		graphics.ctx.font = style+config.fontSize+'pt '+config.font+', Helvetica, sans-serif'
	}

	function parseAndRender(superSampling){
		var ast = nomnoml.parse(textarea.value)
		var config = getConfig(ast.directives)
	    var measurer = {
	    	setFont: setFont,
	        textWidth: function (s){ return graphics.ctx.measureText(s).width },
	        textHeight: function (s){ return config.leading * config.fontSize }
	    }
		var layout = nomnoml.layout(measurer, config, ast)
		fitCanvasSize(layout, config.zoom, superSampling)
		config.zoom *= superSampling
		nomnoml.render(graphics, config, layout, setFont)
	}

	function reloadStorage(){
		storage = buildStorage(location.hash)
		textarea.value = storage.read()
		sourceChanged()
		if (storage.isReadonly) storageStatusElement.show()
		else storageStatusElement.hide()
	}

	function sourceChanged(){
		try {
			var superSampling = window.devicePixelRatio || 1;
			lineMarker.css('top', -30)
			lineNumbers.css({background:'#eee8d5', color:'#D4CEBD'})
			parseAndRender(superSampling)
			storage.save(textarea.value)
		} catch (e){
			var matches = e.message.match('line ([0-9]*)')
			if (matches){
				var lineHeight = parseFloat(jqTextarea.css('line-height'))
				lineMarker.css('top', 8 + lineHeight*matches[1])
			}
			else {
				lineNumbers.css({background:'rgba(220,50,47,0.4)', color:'#657b83'})
				throw e
			}
		}
	}
})
