var nomnoml = nomnoml || {}

$(function (){

	var storage = buildStorage(location.hash)
	var jqCanvas = $('#canvas')
	var viewport = $(window)
	var lineNumbers = $('#linenumbers')
	var lineMarker = $('#linemarker')
	var textarea = document.getElementById('textarea')
	var imgLink = document.getElementById('savebutton')
	var linkLink = document.getElementById('linkbutton')
	var canvasElement = document.getElementById('canvas')
	var defaultSource = document.getElementById('defaultGraph').innerHTML
	var graphics = skanaar.Canvas(canvasElement, {})
	
	window.addEventListener('resize', _.throttle(sourceChanged, 750, {leading: true}))
	textarea.addEventListener('input', _.debounce(sourceChanged, 300))
	textarea.value = storage.read()

	if (storage.isReadonly) $('#storage-status').show()
	else $('#storage-status').hide()

	lineNumbers.val(_.times(60, _.identity).join('\n'))
	initImageDownloadLink(imgLink, canvasElement)
	sourceChanged()

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

	function setShareableLink(str){
		var base = 'http://www.nomnoml.com/#view/'
		linkLink.href = base + str.split('\n').join('%0A').split(' ').join('%20')
	}

	function isViewMode(locationHash){
	}

	function buildStorage(locationHash){
		if (locationHash.substring(0,6) === '#view/')
			return {
				read: function (){ return decodeURIComponent(locationHash.substring(6)) },
				save: function (source){ setShareableLink(textarea.value) },
				isReadonly: true
			}
		return {
			read: function (){ return localStorage['nomnoml.lastSource'] || defaultSource },
			save: function (source){
				setShareableLink(textarea.value)
				localStorage['nomnoml.lastSource'] = source
			},
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

	function fitCanvasSize(rect, scale){
		var w = rect.width * scale
		var h = rect.height * scale
		jqCanvas.attr({width: w, height: h})
		jqCanvas.css({
			top: 300 * (1 - h/viewport.height()),
			left: 150 + (viewport.width() - w)/2
		})
	}

	function setFont(config, isBold, isItalic){
		var style = (isBold === 'bold' ? 'bold ' : '')
		if (isItalic) style = 'italic ' + style
		graphics.ctx.font = style+config.fontSize+'pt '+config.font+', Helvetica, sans-serif'
	}

	function parseAndRender(){
		var ast = nomnoml.parse(textarea.value)
		var config = getConfig(ast.directives)
	    var measurer = {
	    	setFont: setFont,
	        textWidth: function (s){ return graphics.ctx.measureText(s).width },
	        textHeight: function (s){ return config.leading * config.fontSize }
	    }
		var layout = nomnoml.layout(measurer, config, ast)
		fitCanvasSize(layout, config.zoom)
		nomnoml.render(graphics, config, layout, setFont)
	}

	function sourceChanged(){
		try {
			lineMarker.css('top', -30)
			lineNumbers.css({background:'#eee8d5', color:'#D4CEBD'})
			parseAndRender()
			storage.save(textarea.value)
		} catch (e){
			var matches = e.message.match('line ([0-9]*)')
			if (matches)
				 lineMarker.css('top', 12 + 18*matches[1])
			else {
				lineNumbers.css({background:'rgba(220,50,47,0.4)', color:'#657b83'})
				throw e
			}
		}
	}
})