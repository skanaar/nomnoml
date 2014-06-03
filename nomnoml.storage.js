var nomnoml = nomnoml || {}

nomnoml.Storage = function (options){
	function get(key){ return localStorage['nomnoml.' + key] }
	function set(key, val){ return localStorage['nomnoml.' + key] = val }

	var defaultDiagramSet = { untitled: {source: options.defaultSource} }
	set('diagrams', get('diagrams') || defaultDiagramSet)

	var currentDiagram = get('lastDiagramName') || 'untitled'

	return {
		localDiagramNames = function (){
			return _.map(get('diagrams'), function (d, key){
				return {
					source: d.source,
					name: key, 
					isCurrent: key === currentDiagram
				}
			})
		},
		currentDiagram = function (){
			return get('diagrams')[get(currentDiagram)] || { source: '' }
		},
		sourceChanged = function (src){
			var ds = get('diagrams')
			ds[get(currentDiagram)] = { source: src }
			set('diagrams', ds)
		},
		chooseDiagram = function (name){
			var ds = get('diagrams')
			ds[get(currentDiagram)] = { source: src }
			set('lastDiagramName', name)
		}
	}
}