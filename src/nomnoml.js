var nomnoml = nomnoml || {};

nomnoml.Classifier = function (type, name, compartments){
	return {
        type: type,
        name: name,
        compartments: compartments
    }
}

nomnoml.Compartment = function (lines, nodes, relations){
	return {
        lines: lines,
        nodes: nodes,
        relations: relations
    }
}

;(function () {
	'use strict';

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
		var ast = nomnoml.parse(code)
		var config = ast.config
		var measurer = {
			setFont: function (a, b, c) { setFont(a, b, c, graphics); },
			textWidth: function (s) { return graphics.measureText(s).width },
			textHeight: function () { return config.leading * config.fontSize }
		};
		var layout = nomnoml.layout(measurer, config, ast)
		fitCanvasSize(canvas, layout, config.zoom * scale)
		config.zoom *= scale
		nomnoml.render(graphics, config, layout, measurer.setFont)
		return { config: config }
	}

	nomnoml.draw = function (canvas, code, scale) {
		return parseAndRender(code, skanaar.Canvas(canvas), canvas, scale || 1)
	};

	nomnoml.renderSvg = function (code, docCanvas) {
		docCanvas = docCanvas || 0   // optional parameter
		var ast = nomnoml.parse(code)
		var config = ast.config
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
