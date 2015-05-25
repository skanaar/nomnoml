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
	var canvasPanner = document.getElementById('canvas-panner')
	var defaultSource = document.getElementById('defaultGraph').innerHTML
	var graphics = skanaar.Canvas(canvasElement, {})
	var zoomLevel = 0
	var offset = {x:0, y:0}
	var mouseDownPoint = false

	window.addEventListener('hashchange', reloadStorage);
	window.addEventListener('resize', _.throttle(sourceChanged, 750, {leading: true}))
	textarea.addEventListener('input', _.debounce(sourceChanged, 300))
	canvasPanner.addEventListener('mouseenter', _.bind(jqTextarea.toggleClass, jqTextarea, 'hidden', true))
	canvasPanner.addEventListener('mouseleave', _.bind(jqTextarea.toggleClass, jqTextarea, 'hidden', false))
	canvasPanner.addEventListener('mousedown', mouseDown)
	window.addEventListener('mousemove', _.throttle(mouseMove,50))
	canvasPanner.addEventListener('mouseup', mouseUp)
	canvasPanner.addEventListener('mouseleave', mouseUp)
	canvasPanner.addEventListener('wheel', _.throttle(magnify, 50))
	initImageDownloadLink(imgLink, canvasElement)
	lineNumbers.val(_.times(60, _.identity).join('\n'))
	initToolbarTooltips()

	reloadStorage()

	function mouseDown(e){
		$(canvasPanner).css({width: '100%'})
		mouseDownPoint = diff({ x: e.pageX, y: e.pageY }, offset)
	}

	function mouseMove(e){
		if (mouseDownPoint){
			offset = diff({ x: e.pageX, y: e.pageY }, mouseDownPoint)
			sourceChanged()
		}
	}

	function mouseUp(e){
		mouseDownPoint = false
		$(canvasPanner).css({width: '33%'})
	}

	function magnify(e){
		zoomLevel = Math.min(10, zoomLevel - (e.deltaY < 0 ? -1 : 1))
		sourceChanged()
	}

	nomnoml.toggleSidebar = function (id){
		var sidebars = ['reference', 'about']
		_.chain(sidebars).without(id).each(function (key){
			$(document.getElementById(key)).toggleClass('visible', false)
		})
		$(document.getElementById(id)).toggleClass('visible')
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

	function initToolbarTooltips(){
		var tooltip = $('#tooltip')[0]
		$('.tools > a').each(function (i, link){
			link.onmouseover = function (){ tooltip.textContent  = $(link).attr('title') }
			link.onmouseout = function (){ tooltip.textContent  = '' }
		})
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
			title: d.title || 'nomnoml',
			zoom: +d.zoom || 1
		}
	}

	function fitCanvasSize(rect, zoom, superSampling, offset){
		var w = rect.width * zoom
		var h = rect.height * zoom
		jqCanvas.attr({width: superSampling*w, height: superSampling*h})
		jqCanvas.css({
			top: 300 * (1 - h/viewport.height()) + offset.y,
			left: 150 + (viewport.width() - w)/2 + offset.x,
			width: w,
			height: h
		})
	}

	function setFont(config, isBold, isItalic){
		var style = (isBold === 'bold' ? 'bold ' : '')
		if (isItalic) style = 'italic ' + style
		graphics.ctx.font = style+config.fontSize+'pt '+config.font+', Helvetica, sans-serif'
	}

	function setFilename(filename){
		imgLink.download = filename + '.png'
	}

	function parseAndRender(superSampling){
		var ast = nomnoml.parse(textarea.value)
		var config = getConfig(ast.directives)
		setFilename(config.title)
		var scale = Math.exp(zoomLevel/10)
	    var measurer = {
	    	setFont: setFont,
	        textWidth: function (s){ return graphics.ctx.measureText(s).width },
	        textHeight: function (s){ return config.leading * config.fontSize }
	    }
		var layout = nomnoml.layout(measurer, config, ast)
		fitCanvasSize(layout, config.zoom * scale, superSampling, offset)
		config.zoom *= superSampling
		config.zoom *= scale
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
