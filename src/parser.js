var nomnoml = nomnoml || {}

_.maxBy = _.maxBy || _.max // polyfill the differences between lodash and underscore

nomnoml.parse = function (source){
	function onlyCompilables(line){
		var ok = line[0] !== '#' && line.trim().substring(0,2) !== '//'
		return ok ? line.trim() : ''
	}
	var isDirective = function (line){ return line.text[0] === '#' }
	var lines = source.split('\n').map(function (s, i){
		return {text: s, index: i }
	})
	var pureDirectives = _.filter(lines, isDirective)
	var directives = {}
	_.each(pureDirectives, function (line){
		try {
			var tokens =  line.text.substring(1).split(':')
			directives[tokens[0].trim()] = tokens[1].trim()
		}
		catch (e) {
			throw new Error('line ' + (line.index + 1))
		}
	})
	var pureDiagramCode = _.map(_.map(lines, 'text'), onlyCompilables).join('\n').trim()
	var ast = nomnoml.transformParseIntoSyntaxTree(nomnoml.intermediateParse(pureDiagramCode))
	ast.directives = directives
	ast.config = getConfig(ast.directives)
	return ast

	function directionToDagre(word) {
		return { down: 'TB', right: 'LR' }[word] || 'TB'
	}

	function parseCustomStyle(styleDef) {
		var contains = skanaar.hasSubstring
		return {
			bold: contains(styleDef, 'bold'),
			underline: contains(styleDef, 'underline'),
			italic: contains(styleDef, 'italic'),
			dashed: contains(styleDef, 'dashed'),
			empty: contains(styleDef, 'empty'),
			center: _.last(styleDef.match('align=([^ ]*)')) == 'left' ? false : true,
			fill: _.last(styleDef.match('fill=([^ ]*)')),
			stroke: _.last(styleDef.match('stroke=([^ ]*)')),
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
			direction: directionToDagre(d.direction),
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
}

nomnoml.intermediateParse = function (source){
	return nomnomlCoreParser.parse(source)
}

nomnoml.transformParseIntoSyntaxTree = function (entity){

	var relationId = 0

	function transformCompartment(parts){
		var lines = []
		var rawClassifiers = []
		var relations = []
		_.each(parts, function (p){
			if (typeof p === 'string')
				lines.push(p)
			if (p.assoc){ // is a relation
				rawClassifiers.push(p.start)
				rawClassifiers.push(p.end)
				relations.push({
                    id: relationId++,
                    assoc: p.assoc,
                    start: p.start.parts[0][0],
                    end: p.end.parts[0][0],
                    startLabel: p.startLabel,
                    endLabel: p.endLabel
                })
            }
			if (p.parts){ // is a classifier
				rawClassifiers.push(p)
            }
		})
		var allClassifiers = _.map(rawClassifiers, transformItem)
		var noDuplicates = _.map(_.groupBy(allClassifiers, 'name'), function (cList){
			return _.maxBy(cList, function (c){ return c.compartments.length })
		})

		return nomnoml.Compartment(lines, noDuplicates, relations)
	}

	function transformItem(entity){
		if (typeof entity === 'string')
			return entity
		if (_.isArray(entity))
			return transformCompartment(entity)
		if (entity.parts){
			var compartments = _.map(entity.parts, transformCompartment)
			return nomnoml.Classifier(entity.type, entity.id, compartments)
		}
		return undefined
	}

	return transformItem(entity)
}
