var nomnoml = require('../dist/nomnoml')
var fs = require('fs')

var source = `#lineWidth: 3
[Pirate|eyeCount: Int|raid();pillage()|
  [beard]--[parrot]
  [beard]-:>[foul mouth]
]

[<abstract>Marauder]<:--[Pirate]
[Pirate]- 0..7[<sender>mischief]
[<database>jollyness]->[Pirate]
[jollyness]->[rum]
[jollyness]->[<receiver>singing]
[Pirate]-> *[rum|tastiness: Int|swig()]
[Pirate]->[singing]
[singing]<->[rum]

[<start>st]->[<state>plunder]
[plunder]->[<choice>more loot]
[more loot]->[st]
[more loot] no ->[<end>e]

[<actor>Sailor] - [<usecase>shiver me;timbers]`

fs.writeFileSync('test/output.node-test.svg', nomnoml.renderSvg(source), 'utf8')