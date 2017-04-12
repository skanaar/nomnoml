var nomnoml = nomnoml || {};

(function () {
	'use strict';

	function getConfig(d) {
		var userStyles = {}
		_.each(d, function (styleDef, key){
			if (key[0] != '.') return
			userStyles[key.substring(1).toUpperCase()] = {
				center: _.contains(styleDef, 'center'),
				bold: _.contains(styleDef, 'bold'),
				underline: _.contains(styleDef, 'underline'),
				italic: _.contains(styleDef, 'italic'),
				dashed: _.contains(styleDef, 'dashed'),
				empty: _.contains(styleDef, 'empty'),
				fill: _.last(styleDef.match('fill=([^ ]*)')),
				visual: _.last(styleDef.match('visual=([^ ]*)')) || 'class'
			}
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

	nomnoml.renderSvg = function (code) {
		var ast = nomnoml.parse(code)
		var config = getConfig(ast.directives)
		var skCanvas = skanaar.Svg('')
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
