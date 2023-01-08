{{
  function join(list) {
    return list.join('')
  }
  function addNode(node, list) {
    return concatNodes([node], list)
  }
  function concatNodes(start, end) {
    let list = start
    for (const node of end) {
      const index = list.findIndex(e => e.id === node.id)
      if (index == -1) {
        list = [...list, node]
      } else if (list[index].parts.length < node.parts.length) {
        const copy = list.slice()
        copy[index] = node
        list = copy
      }
    }
    return list
  }
  function Part({ nodes = [], assocs = [], lines = [], directives = [] }) {
    return { nodes, assocs, lines, directives }
  }
}}

Root = PaddedGraph

Padding "padding" = [\n \t]*
Linebreak "linebreak" = [\n;]+

PaddedGraph = Padding g:Graph Padding { return g }

Graph =
  a:GraphPart _ Linebreak Padding _ b:Graph {
    return {
      nodes: concatNodes(a.nodes, b.nodes),
      assocs: [...a.assocs, ...b.assocs],
      lines: [...a.lines, ...b.lines],
      directives: [...a.directives, ...b.directives]
    }
  } /
  g:GraphPart { return g }

GraphPart =
  ch:Chain { return Part({ nodes: [...ch.nodes], assocs: ch.assocs }) } /
  dir:Directive { return Part({ directives: [dir] }) } /
  row:Row { return Part({ lines: [row] }) } /
  node:Node { return Part({ nodes: [node] }) }

NodeStart =
  "[<" _ type:Ident " " attr:AttrList _ ">" { return { type, attr } } /
  "[<" _ type:Ident _ ">" { return { type, attr: {} } } /
  "[<" _ attr:AttrList _ ">" { return { type: 'class', attr } } /
  "[" { return { type: 'class', attr: {} } }

Node =
  meta:NodeStart text:Text lines:(Linebreak @Text)* parts:NodeParts {
    const id = text.trim()
    return {
      id: meta.attr.id ?? id,
      type: meta.type,
      attr: meta.attr,
      parts: [Part({ lines: [id, ...lines.map(e => e.trim())] }), ...parts]
    }
  }

NodeParts = 
  "]" { return [] } /
  Padding "|" Padding parts:NodeParts { return [Part({}), ...parts] } /
  Padding "|" graph:PaddedGraph parts:NodeParts { return [graph, ...parts] }

Chain =
  first:Node assoc:Assoc chain:Chain {
    return {
      first,
      nodes: addNode(first, chain.nodes),
      assocs: [
        {
          type: assoc.symbol,
          start: first.id,
          end: chain.first.id,
          startLabel: { text: assoc.startLabel },
          endLabel: { text: assoc.endLabel }
        },
        ...chain.assocs
      ]
    }
  } /
  first:Node assoc:Assoc last:Node {
    return {
      first,
      nodes: addNode(first, [last]),
      assocs: [{
        type: assoc.symbol,
        start: first.id,
        end: last.id,
        startLabel: { text: assoc.startLabel },
        endLabel: { text: assoc.endLabel }
      }]
    }
  }

Directive "Directive" =
  "#" key:([.a-zA-Z0-9]+) ":"? [ ]* value:([^\n]*) {
    return { key: join(key), value: value.join('') }
  }

AttrList "AttrList" =
  first:Attr " " tail:AttrList { return { ...first, ...tail } } /
  attr:Attr { return attr }

Attr "Attr" =
  key:Ident "=" value:Ident { return { [key]: value } } 

Row "row" =
  text:Text row:Row { return text + row } /
  text:Text { return text.trim() }

Text "text" =
  chars:(TextChar+) { return chars.join('') }

Escaped "escaped" =
  "\\" char:"#" { return char } /
  "\\" char:";" { return char } /
  "\\" char:"|" { return char } /
  "\\" char:"[" { return char } /
  "\\" char:"]" { return char } /
  "\\" char:"<" { return char } /
  "\\" char:">" { return char } /
  "\\" char:"(" { return char } /
  "\\" char:")" { return char } /
  "\\" char:"-" { return char } /
  "\\" char:":" { return char } /
  "\\" char:"/" { return char }

TextChar "text character" =
  char:Escaped { return char } /
  char:([^\[\]\n\\;|<>]) { return char }

AssocStartPart "assoc start label part" =
  char:Escaped { return char } /
  chars:[<>():+o/]+ pad:[^\[\]\n\\;|-] { return join(chars) + pad } /
  chars:[<>():+o/]+ pad:Escaped { return join(chars) + pad } /
  chars:[^\[\]\n\\;|><():+o/-]+ { return join(chars) }

AssocEndPart "assoc end label part" =
  char:Escaped { return char } /
  pad:[^\[\]\n\\;|-] chars:[<>():+o/]+  { return pad + join(chars) } /
  pad:Escaped chars:[<>():+o/]+  { return pad + join(chars) } /
  chars:[^\[\]\n\\;|-]+ { return join(chars) }

AssocStartLabel "assoc start label" =
  chunks:AssocStartPart+ { return join(chunks) }

AssocEndLabel "assoc end label" =
  chunks:AssocEndPart+ { return join(chunks) }

Assoc "association" =
  start:AssocStartLabel arrow:Arrow end:AssocEndLabel {
    return { startLabel: start.trim(), symbol: arrow, endLabel: end.trim() }
  } /
  label:AssocStartLabel arrow:Arrow {
    return { startLabel: label.trim(), symbol: arrow, endLabel: "" }
  } /
  arrow:Arrow label:AssocEndLabel {
    return { startLabel: "", symbol: arrow, endLabel: label.trim() }
  } /
  arrow:Arrow {
    return { startLabel: "", symbol: arrow, endLabel: "" }
  }
  
ArrowStart "arrow_start" =
  token:"(o" { return token } /
  token:"(" { return token } /
  token:"o<" { return token } /
  token:"o" { return token } /
  token:"+" { return token } /
  token:"<:" { return token } /
  token:"<" { return token }
  
ArrowTrunk "arrow_trunk" =
  token:"--" { return token } /
  token:"-/-" { return token } /
  token:"-" { return token }
  
ArrowEnd "arrow_end" =
  token:"o)" { return token } /
  token:"o" { return token } /
  token:">o" { return token } /
  token:">" { return token } /
  token:")" { return token } /
  token:"+" { return token } /
  token:":>" { return token }

Arrow "arrow" =
  start:ArrowStart trunk:ArrowTrunk end:ArrowEnd { return start+trunk+end } /
  start:ArrowStart trunk:ArrowTrunk { return start + trunk } /
  trunk:ArrowTrunk end:ArrowEnd { return trunk + end } /
  trunk:ArrowTrunk { return trunk }

Ident "identifier" =
  id:[a-zA-Z0-9]+ {
    return id.join('')
  }

_ "space" = [ \t]*
