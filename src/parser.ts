namespace nomnoml {
	interface ParsedDiagram {
		root: Compartment
		config: Config
	}
	export type AstRoot = AstCompartment
	type AstCompartment = AstSlot[]
	type AstSlot = string | AstClassifier | AstRelation
	type AstCompartmentList = AstCompartment[]
	interface AstRelation {
		assoc: string,
		start: AstClassifier,
		end: AstClassifier,
		startLabel: string,
		endLabel: string
	}
	interface AstClassifier { type: string, id: string, parts: AstCompartment[] }

	declare var nomnomlCoreParser: { parse(source: string): AstRoot }

	class Line {
			index: number
			text: string
	}

	export function parse(source: string): ParsedDiagram {
		function onlyCompilables(line: string){
			var ok = line[0] !== '#' && line.trim().substring(0,2) !== '//'
			return ok ? line.trim() : ''
		}
		function isDirective(line: Line): boolean { return line.text[0] === '#' }
		var lines: Line[] = source.split('\n').map(function (s, i){
			return {text: s, index: i }
		})
		var pureDirectives = lines.filter(isDirective)
		var directives: { [key: string]: string } = {}
		pureDirectives.forEach(function (line){
			try {
				var tokens =  line.text.substring(1).split(':')
				directives[tokens[0].trim()] = tokens[1].trim()
			}
			catch (e) {
				throw new Error('line ' + (line.index + 1))
			}
		})
		var pureDiagramCode = lines.map(function(e){ return onlyCompilables(e.text)}).join('\n').trim()
		var parseTree = nomnoml.intermediateParse(pureDiagramCode)
		return {
			root: nomnoml.transformParseIntoSyntaxTree(parseTree),
			config: getConfig(directives)
		}

		function directionToDagre(word: any): 'TB'|'LR' {
			if (word == 'down') return 'TB'
			if (word == 'right') return 'LR'
			else return 'TB'
		}

		function parseCustomStyle(styleDef: string): Style {
			var contains = skanaar.hasSubstring
			return {
				bold: contains(styleDef, 'bold'),
				underline: contains(styleDef, 'underline'),
				italic: contains(styleDef, 'italic'),
				dashed: contains(styleDef, 'dashed'),
				empty: contains(styleDef, 'empty'),
				center: skanaar.last(styleDef.match('align=([^ ]*)') || []) == 'left' ? false : true,
				fill: skanaar.last(styleDef.match('fill=([^ ]*)') || []),
				stroke: skanaar.last(styleDef.match('stroke=([^ ]*)') || []),
				visual: skanaar.last(styleDef.match('visual=([^ ]*)') || []) || 'class',
				direction: directionToDagre(skanaar.last(styleDef.match('direction=([^ ]*)') || [])),
				hull: 'auto'
			}
		}

		function getConfig(d: { [index:string]:string }): Config {
			var userStyles: { [index:string]: Style } = {}
			for (var key in d) {
				if (key[0] != '.') continue
				var styleDef = d[key]
				userStyles[key.substring(1).toUpperCase()] = parseCustomStyle(styleDef)
			}
			return {
				arrowSize: +d.arrowSize || 1,
				bendSize: +d.bendSize || 0.3,
				direction: directionToDagre(d.direction),
				gutter: +d.gutter || 5,
				edgeMargin: (+d.edgeMargin) || 0,
				edges: d.edges == 'hard' ? 'hard' : 'rounded',
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
				styles: skanaar.merged(nomnoml.styles, userStyles)
			};
		}
	}

	export function intermediateParse(source: string): AstRoot {
		return nomnomlCoreParser.parse(source)
	}

	export function transformParseIntoSyntaxTree(entity: AstRoot): Compartment {

		function isAstClassifier(obj: AstSlot): obj is AstClassifier {
			return (<AstClassifier>obj).parts !== undefined
		}

		function isAstRelation(obj: AstSlot): obj is AstRelation {
			return (<AstRelation>obj).assoc !== undefined
		}

		function isAstCompartment(obj: any): obj is AstCompartment {
			return Array.isArray(obj)
		}

		var relationId: number = 0

		function transformCompartment(slots: AstCompartment): Compartment {
			var lines: string[] = []
			var rawClassifiers: AstClassifier[] = []
			var relations: Relation[] = []
			slots.forEach(function (p: AstSlot){
				if (typeof p === 'string')
					lines.push(p)
				if (isAstRelation(p)){ // is a relation
					rawClassifiers.push(p.start)
					rawClassifiers.push(p.end)
					relations.push({
							id: relationId++,
							assoc: p.assoc,
							start: p.start.parts[0][0] as string,
							end: p.end.parts[0][0] as string,
							startLabel: p.startLabel,
							endLabel: p.endLabel
						})
					}
				if (isAstClassifier(p)){
					rawClassifiers.push(p)
				}
			})
			var allClassifiers: Classifier[] = rawClassifiers
				.map(transformClassifier)
				.sort(function(a: Classifier, b: Classifier): number {
					return b.compartments.length - a.compartments.length
				})
			var uniqClassifiers = skanaar.uniqueBy(allClassifiers, 'name')
			return new Compartment(lines, uniqClassifiers, relations)
		}

		function transformClassifier(entity: AstClassifier): Classifier {
				var compartments = entity.parts.map(transformCompartment)
				return new Classifier(entity.type, entity.id, compartments)
		}

		function transformItem(entity: AstSlot): undefined|string|Compartment|Classifier {
			if (typeof entity === 'string')
				return entity
			if (isAstCompartment(entity))
				return transformCompartment(entity)
			if (isAstClassifier(entity)){
				return transformClassifier(entity)
			}
			return undefined
		}

		return transformCompartment(entity)
	}
}
