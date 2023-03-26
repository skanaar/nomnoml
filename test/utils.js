module.exports.dir = dir
module.exports.node = node
module.exports.part = part
module.exports.assoc = assoc

function dir(key, value = '') {
  return { key, value }
}

function node(id, template = {}) {
  return {
    id,
    type: 'class',
    parts: [part({ lines: [id] })],
    attr: {},
    ...template,
  }
}

function part(template) {
  return {
    nodes: [],
    assocs: [],
    lines: [],
    ...template,
  }
}

function assoc(start, type, end, template = {}) {
  return {
    start,
    end,
    type,
    startLabel: { text: '' },
    endLabel: { text: '' },
    ...template,
  }
}
