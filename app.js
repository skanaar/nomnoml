var app = app || {}

;(function (){

	var storage = null
	var graphTitle = 'diagram'
	var viewport = window
	var body = document.querySelector('body')
	var tooltip = document.getElementById('tooltip')
	var lineNumbers = document.getElementById('linenumbers')
	var lineMarker = document.getElementById('linemarker')
	var storageStatusElement = document.getElementById('storage-status')
	var textarea = document.getElementById('textarea')
	var pngLink = document.getElementById('save-png-button')
	var svgLink = document.getElementById('save-svg-button')
	var srcLink = document.getElementById('save-source-button')
	var linkLink = document.getElementById('linkbutton')
	var canvasElement = document.getElementById('canvas')
	var canvasPanner = document.getElementById('canvas-panner')
	var canvasTools = document.getElementById('canvas-tools')
	var defaultSource = (document.getElementById('defaultGraph') || {}).innerHTML || ''
	var zoomLevel = 0
    var renderedText = null;
	var offset = {x:0, y:0}
	var mouseDownPoint = false
	var vm = nomnoml.skanaar.vector

	var editor = CodeMirror.fromTextArea(textarea, {
		lineNumbers: true,
		mode: 'nomnoml',
		matchBrackets: true,
		theme: 'solarized light',
		keyMap: 'sublime'
	});

	var editorElement = editor.getWrapperElement()

	window.addEventListener('hashchange', reloadStorage);
	window.addEventListener('resize', _.throttle(sourceChanged, 750, {leading: true}))
	editor.on('changes', _.debounce(sourceChanged, 300))
	canvasPanner.addEventListener('mouseenter', classToggler(body, 'canvas-mode', true))
	canvasPanner.addEventListener('mouseleave', classToggler(body, 'canvas-mode', false))
	canvasTools.addEventListener('mouseenter', classToggler(body, 'canvas-mode', true))
	canvasTools.addEventListener('mouseleave', classToggler(body, 'canvas-mode', false))
	canvasPanner.addEventListener('mousedown', mouseDown)
	window.addEventListener('mousemove', _.throttle(mouseMove,50))
	canvasPanner.addEventListener('mouseup', mouseUp)
	canvasPanner.addEventListener('mouseleave', mouseUp)
	canvasPanner.addEventListener('wheel', _.throttle(magnify, 50))
	initPngDownloadLink(pngLink)
	initSvgDownloadLink(svgLink)
	initSrcDownloadLink(srcLink)
	initToolbarTooltips()

	reloadStorage()

	function classToggler(element, className, state){
		return function () {
			if(state) element.classList.add(className)
			else element.classList.remove(className)
		}
	}

	function mouseDown(e){
		canvasPanner.style.width = '100%'
		mouseDownPoint = vm.diff({ x: e.pageX, y: e.pageY }, offset)
	}

	function mouseMove(e){
		if (mouseDownPoint){
			offset = vm.diff({ x: e.pageX, y: e.pageY }, mouseDownPoint)
			sourceChanged()
		}
	}

	function mouseUp(){
		mouseDownPoint = false
		canvasPanner.style.width = '33%'
	}

	function magnify(e){
		zoomLevel = Math.min(10, zoomLevel - (e.deltaY < 0 ? -1 : 1))
		sourceChanged()
	}

	app.magnifyViewport = function (diff){
		zoomLevel = Math.min(10, zoomLevel + diff)
		sourceChanged()
	}

	app.resetViewport = function (){
		zoomLevel = 1
		offset = {x: 0, y: 0}
		sourceChanged()
	}

	app.toggleSidebar = function (id){
		var sidebars = ['about', 'reference', 'export']
		_.each(sidebars, function (key){
			if (id !== key) document.getElementById(key).classList.remove('visible')
		})
		document.getElementById(id).classList.toggle('visible')
	}

	app.discardCurrentGraph = function (){
		if (confirm('Do you want to discard current diagram and load the default example?')){
			setCurrentText(defaultSource)
			sourceChanged()
		}
	}

	app.saveViewModeToStorage = function (){
		var question = 
			'Do you want to overwrite the diagram in ' +
			'localStorage with the currently viewed diagram?'
		if (confirm(question)){
			storage.moveToLocalStorage()
			window.location = './'
		}
	}

	app.exitViewMode = function (){
		window.location = './'
	}

	// Adapted from http://meyerweb.com/eric/tools/dencoder/
	function urlEncode(unencoded) {
		return encodeURIComponent(unencoded).replace(/'/g,'%27').replace(/"/g,'%22')
	}

	function urlDecode(encoded) {
		return decodeURIComponent(encoded.replace(/\+/g, ' '))
	}

	function setShareableLink(str){
		var base = '#view/'
		linkLink.href = base + urlEncode(str)
	}

	function buildStorage(locationHash){
		var key = 'nomnoml.lastSource'
		if (locationHash.substring(0,6) === '#view/')
			return {
				read: function (){ return urlDecode(locationHash.substring(6)) },
				save: function (){ setShareableLink(currentText()) },
				moveToLocalStorage: function (){ localStorage[key] = currentText() },
				isReadonly: true
			}
		return {
			read: function (){ return localStorage[key] || defaultSource },
			save: function (source){
				setShareableLink(currentText())
				localStorage[key] = source
			},
			moveToLocalStorage: function (){},
			isReadonly: false
		}
	}

	function initPngDownloadLink(link){
		link.addEventListener('click', doDownload, false);
		function doDownload(){
			if (!!canvasElement.msToBlob) {
				saveAs(canvasElement.msToBlob(), graphTitle + '.png')
			}
			else {
				canvasElement.toBlob(function (blob) { saveAs(blob, graphTitle + '.png') })
			}
			e.preventDefault()
		}
	}

	function initSvgDownloadLink(link){
		link.addEventListener('click', doDownload, false);
		function doDownload(e){
			var svg = nomnoml.renderSvg(currentText(), canvasElement)
			saveAs(new Blob([svg], {type: 'image/svg+xml'}), graphTitle + '.svg')
			e.preventDefault()
		}
	}

	function initSrcDownloadLink(link){
		link.addEventListener('click', doDownload, false);
		function doDownload(e){
			var src = currentText()
			saveAs(new Blob([src], {type: 'text/txt'}), graphTitle + '.nomnoml')
			e.preventDefault()
		}
	}

	function initToolbarTooltips(){
		_.each(document.querySelectorAll('.tools a'), function (link){
			link.onmouseover = function (){ tooltip.textContent = link.getAttribute('title') }
			link.onmouseout = function (){ tooltip.textContent = '' }
		})
	}

	function positionCanvas(rect, superSampling, offset){
		var w = rect.width / superSampling
		var h = rect.height / superSampling
		canvasElement.style.top = 300 * (1 - h/viewport.innerHeight) + offset.y + 'px'
		canvasElement.style.left = 150 + (viewport.innerWidth - w)/2 + offset.x + 'px'
		canvasElement.style.width = w + 'px'
		canvasElement.style.height = h + 'px'
	}

	function setFilenames(filename){
		pngLink.download = filename + '.png'
		svgLink.download = filename + '.svg'
		srcLink.download = filename + '.nomnoml'
	}

	function reloadStorage(){
		storage = buildStorage(location.hash)
		editor.setValue(storage.read())
		sourceChanged()
		if (storage.isReadonly) storageStatusElement.classList.add('visible')
		else storageStatusElement.classList.remove('visible')
	}

	function currentText(){
		return editor.getValue()
	}

	function setCurrentText(value){
		return editor.setValue(value)
	}

	function sourceChanged(){
		try {
			lineMarker.style.top = '-30px'
			lineNumbers.classList.remove('error')
			var superSampling = window.devicePixelRatio || 1
			var scale = superSampling * Math.exp(zoomLevel/10)

			var model = nomnoml.draw(canvasElement, currentText(), scale)
            renderedText = currentText()
			positionCanvas(canvasElement, superSampling, offset)
			graphTitle = model.config.title
			setFilenames(model.config.title)
			storage.save(currentText())
		} catch (e){
			var matches = e.message.match('line ([0-9]*)')
			lineNumbers.classList.add('error')
			if (matches){
				var lineHeight = parseFloat(editorElement.style.lineHeight) || 12
				lineMarker.style.top = 3 + lineHeight*matches[1] + 'px'

                // Rerender canvas with last successfully rendered text.
                nomnoml.draw(canvasElement, renderedText, scale)
			    positionCanvas(canvasElement, superSampling, offset)
			} else {
				throw e
			}
		}
	}
}());
