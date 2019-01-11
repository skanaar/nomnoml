var nomnoml = nomnoml || {};

(function () {
	'use strict';

	function parseCustomStyle(styleDef) {
		function directionToDagre(word) {
			return { down: 'TB', right: 'LR' }[word] || 'TB'
		}
		return {
			center: (styleDef.indexOf('center') > -1) || 1, // default to match visual class
			bold: (styleDef.indexOf('bold') > -1),
			underline: (styleDef.indexOf('underline') > -1),
			italic: (styleDef.indexOf('italic') > -1),
			dashed: (styleDef.indexOf('dashed') > -1),
			empty: (styleDef.indexOf('empty') > -1),
			fill: _.last(styleDef.match('fill=([^ ]*)')),
			visual: _.last(styleDef.match('visual=([^ ]*)')) || 'class',
			direction: directionToDagre(_.last(styleDef.match('direction=([^ ]*)')))
		}
	}

	function getConfig(d) {
		var userStyles = {}
		_.each(d, function (styleDef, key){
			if (key[0] != '.') return
			userStyles[key.substring(1).toUpperCase()] = parseCustomStyle(styleDef)
		})
		return {
			arrowSize: +d.arrowSize || 1,
			bendSize: +d.bendSize || 0.3,
			direction: { down: 'TB', right: 'LR' }[d.direction] || 'TB',
			gutter: +d.gutter || 5,
			edgeMargin: (+d.edgeMargin) || 0,
			edges: { hard: 'hard', rounded: 'rounded' }[d.edges] || 'rounded',
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
			zoom: +d.zoom || 1,
			styles: _.extend({}, nomnoml.styles, userStyles)
		};
	}

	function fitCanvasSize(canvas, rect, zoom) {
		canvas.width = rect.width * zoom;
		canvas.height = rect.height * zoom;
	}

	function setFont(config, isBold, isItalic, graphics) {
		var style = (isBold === 'bold' ? 'bold' : '')
		if (isItalic) style = 'italic ' + style
		var defaultFont = 'Helvetica, sans-serif'
		var font = skanaar.format('# #pt #, #', style, config.fontSize, config.font, defaultFont)
		graphics.font(font)
	}

	function parseAndRender(code, graphics, canvas, scale) {
		var ast = nomnoml.parse(code);
		var config = getConfig(ast.directives);
		var measurer = {
			setFont: function (a, b, c) { setFont(a, b, c, graphics); },
			textWidth: function (s) { return graphics.measureText(s).width },
			textHeight: function () { return config.leading * config.fontSize }
		};
		var layout = nomnoml.layout(measurer, config, ast);
		fitCanvasSize(canvas, layout, config.zoom * scale);
		config.zoom *= scale;
		nomnoml.render(graphics, config, layout, measurer.setFont);
		return { config: config };
	}

	nomnoml.draw = function (canvas, code, scale) {
		return parseAndRender(code, skanaar.Canvas(canvas), canvas, scale || 1)
	};

	nomnoml.renderSvg = function (code, docCanvas) {
		docCanvas = docCanvas || 0   // optional parameter
		var ast = nomnoml.parse(code)
		var config = getConfig(ast.directives)
		var skCanvas = skanaar.Svg('', docCanvas)
		function setFont(config, isBold, isItalic) {
			var style = (isBold === 'bold' ? 'bold' : '')
			if (isItalic) style = 'italic ' + style
			var defFont = 'Helvetica, sans-serif'
			var template = 'font-weight:#; font-size:#pt; font-family:\'#\', #'
			var font = skanaar.format(template, style, config.fontSize, config.font, defFont)
			skCanvas.font(font)
		}
		var measurer = {
			setFont: function (a, b, c) { setFont(a, b, c, skCanvas); },
			textWidth: function (s) { return skCanvas.measureText(s).width },
			textHeight: function () { return config.leading * config.fontSize }
		};
		var layout = nomnoml.layout(measurer, config, ast)
		nomnoml.render(skCanvas, config, layout, measurer.setFont)
		return skCanvas.serialize({
		  width: layout.width,
		  height: layout.height
		})
	};
})();
