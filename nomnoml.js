var nomnoml = nomnoml || {};

(function () {
	'use strict';

	function getConfig(d) {
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
			zoom: +d.zoom || 1
		};
	}

	function fitCanvasSize(canvas, rect, zoom) {
		canvas.width = rect.width * zoom;
		canvas.height = rect.height * zoom;
	}

	function setFont(config, isBold, isItalic, graphics) {
		var style = (isBold === 'bold' ? 'bold' : '')
		if (isItalic) style = 'italic' + style
		var defaultFont = 'Helvetica, sans-serif'
		var font = skanaar.format('# #pt #, #', style, config.fontSize, config.font, defaultFont)
		graphics.ctx.font = font
	}

	function parseAndRender(code, graphics, canvas, scale) {
		var ast = nomnoml.parse(code);
		var config = getConfig(ast.directives);
		var measurer = {
			setFont: function (a, b, c) { setFont(a, b, c, graphics); },
			textWidth: function (s) { return graphics.ctx.measureText(s).width },
			textHeight: function () { return config.leading * config.fontSize }
		};
		var layout = nomnoml.layout(measurer, config, ast);
		fitCanvasSize(canvas, layout, config.zoom * scale);
		config.zoom *= scale;
		nomnoml.render(graphics, config, layout, measurer.setFont);
		return { config: config };
	}

	nomnoml.draw = function (canvas, code, scale) {
		var skCanvas = skanaar.Canvas(canvas)
		return parseAndRender(code, skCanvas, canvas, scale || 1)
	};
})();
