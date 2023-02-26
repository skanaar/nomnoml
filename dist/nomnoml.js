(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('graphre')) :
    typeof define === 'function' && define.amd ? define(['exports', 'graphre'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.nomnoml = {}, global.graphre));
})(this, (function (exports, graphre) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function range([min, max], count) {
        var output = [];
        for (var i = 0; i < count; i++)
            output.push(min + ((max - min) * i) / (count - 1));
        return output;
    }
    function sum(list, transform) {
        for (var i = 0, sum = 0, len = list.length; i < len; i++)
            sum += transform(list[i]);
        return sum;
    }
    function find(list, predicate) {
        for (var i = 0; i < list.length; i++)
            if (predicate(list[i]))
                return list[i];
        return undefined;
    }
    function last(list) {
        return list[list.length - 1];
    }
    function hasSubstring(haystack, needle) {
        if (needle === '')
            return true;
        if (!haystack)
            return false;
        return haystack.indexOf(needle) !== -1;
    }
    function indexBy(list, key) {
        var obj = {};
        for (var i = 0; i < list.length; i++)
            obj[list[i][key]] = list[i];
        return obj;
    }
    function uniqueBy(list, property) {
        var seen = {};
        var out = [];
        for (var i = 0; i < list.length; i++) {
            var key = list[i][property];
            if (!seen[key]) {
                seen[key] = true;
                out.push(list[i]);
            }
        }
        return out;
    }

    var util = /*#__PURE__*/Object.freeze({
        __proto__: null,
        range: range,
        sum: sum,
        find: find,
        last: last,
        hasSubstring: hasSubstring,
        indexBy: indexBy,
        uniqueBy: uniqueBy
    });

    function buildStyle(conf, title, body = {}) {
        return {
            title: {
                bold: title.bold || false,
                underline: title.underline || false,
                italic: title.italic || false,
                center: title.center || false,
            },
            body: {
                bold: body.bold || false,
                underline: body.underline || false,
                italic: body.italic || false,
                center: body.center || false,
            },
            dashed: conf.dashed || false,
            fill: conf.fill || undefined,
            stroke: conf.stroke || undefined,
            visual: conf.visual || 'class',
            direction: conf.direction || undefined,
        };
    }
    var styles = {
        abstract: buildStyle({ visual: 'class' }, { center: true, italic: true }),
        actor: buildStyle({ visual: 'actor' }, { center: true }, { center: true }),
        choice: buildStyle({ visual: 'rhomb' }, { center: true }, { center: true }),
        class: buildStyle({ visual: 'class' }, { center: true, bold: true }),
        database: buildStyle({ visual: 'database' }, { center: true, bold: true }, { center: true }),
        end: buildStyle({ visual: 'end' }, {}),
        frame: buildStyle({ visual: 'frame' }, {}),
        hidden: buildStyle({ visual: 'hidden' }, {}),
        input: buildStyle({ visual: 'input' }, { center: true }),
        instance: buildStyle({ visual: 'class' }, { center: true, underline: true }),
        label: buildStyle({ visual: 'none' }, { center: true }),
        lollipop: buildStyle({ visual: 'lollipop' }, { center: true }),
        note: buildStyle({ visual: 'note' }, {}),
        pipe: buildStyle({ visual: 'pipe' }, { center: true, bold: true }),
        package: buildStyle({ visual: 'package' }, {}),
        receiver: buildStyle({ visual: 'receiver' }, {}),
        reference: buildStyle({ visual: 'class', dashed: true }, { center: true }),
        sender: buildStyle({ visual: 'sender' }, {}),
        socket: buildStyle({ visual: 'socket' }, {}),
        start: buildStyle({ visual: 'start' }, {}),
        state: buildStyle({ visual: 'roundrect' }, { center: true }),
        sync: buildStyle({ visual: 'sync' }, { center: true }),
        table: buildStyle({ visual: 'table' }, { center: true, bold: true }),
        transceiver: buildStyle({ visual: 'transceiver' }, {}),
        usecase: buildStyle({ visual: 'ellipse' }, { center: true }, { center: true }),
    };
    function offsetBox(config, clas, offset) {
        var _a, _b;
        clas.width = Math.max(...clas.parts.map((e) => { var _a; return (_a = e.width) !== null && _a !== void 0 ? _a : 0; }));
        clas.height = sum(clas.parts, (e) => { var _a, _b; return (_b = (_a = e.height) !== null && _a !== void 0 ? _a : 0) !== null && _b !== void 0 ? _b : 0; });
        clas.dividers = [];
        var y = 0;
        for (var comp of clas.parts) {
            comp.x = 0 + offset.x;
            comp.y = y + offset.y;
            comp.width = clas.width;
            y += (_b = (_a = comp.height) !== null && _a !== void 0 ? _a : 0) !== null && _b !== void 0 ? _b : 0;
            if (comp != last(clas.parts))
                clas.dividers.push([
                    { x: 0, y: y },
                    { x: clas.width, y: y },
                ]);
        }
    }
    function box(config, clas) {
        offsetBox(config, clas, { x: 0, y: 0 });
    }
    function icon(config, clas) {
        clas.dividers = [];
        clas.parts = [];
        clas.width = config.fontSize * 2.5;
        clas.height = config.fontSize * 2.5;
    }
    function labelledIcon(config, clas) {
        var _a, _b, _c;
        clas.width = config.fontSize * 1.5;
        clas.height = config.fontSize * 1.5;
        clas.dividers = [];
        var y = config.direction == 'LR' ? clas.height - config.padding : -clas.height / 2;
        for (var comp of clas.parts) {
            if (config.direction == 'LR') {
                comp.x = clas.width / 2 - ((_a = comp.width) !== null && _a !== void 0 ? _a : 0) / 2;
                comp.y = y;
            }
            else {
                comp.x = clas.width / 2 + config.padding / 2;
                comp.y = y;
            }
            y += (_c = (_b = comp.height) !== null && _b !== void 0 ? _b : 0) !== null && _c !== void 0 ? _c : 0;
        }
    }
    var layouters = {
        actor: function (config, clas) {
            var _a;
            clas.width = Math.max(config.padding * 2, ...clas.parts.map((e) => { var _a; return (_a = e.width) !== null && _a !== void 0 ? _a : 0; }));
            clas.height = config.padding * 3 + sum(clas.parts, (e) => { var _a; return (_a = e.height) !== null && _a !== void 0 ? _a : 0; });
            clas.dividers = [];
            var y = config.padding * 3;
            for (var comp of clas.parts) {
                comp.x = 0;
                comp.y = y;
                comp.width = clas.width;
                y += (_a = comp.height) !== null && _a !== void 0 ? _a : 0;
                if (comp != last(clas.parts))
                    clas.dividers.push([
                        { x: config.padding, y: y },
                        { x: clas.width - config.padding, y: y },
                    ]);
            }
        },
        class: box,
        database: function (config, clas) {
            var _a;
            clas.width = Math.max(...clas.parts.map((e) => { var _a; return (_a = e.width) !== null && _a !== void 0 ? _a : 0; }));
            clas.height = sum(clas.parts, (e) => { var _a; return (_a = e.height) !== null && _a !== void 0 ? _a : 0; }) + config.padding * 2;
            clas.dividers = [];
            var y = config.padding * 1.5;
            for (var comp of clas.parts) {
                comp.x = 0;
                comp.y = y;
                comp.width = clas.width;
                y += (_a = comp.height) !== null && _a !== void 0 ? _a : 0;
                if (comp != last(clas.parts)) {
                    var path = range([0, Math.PI], 16).map((a) => ({
                        x: clas.width * 0.5 * (1 - Math.cos(a)),
                        y: y + config.padding * (0.75 * Math.sin(a) - 0.5),
                    }));
                    clas.dividers.push(path);
                }
            }
        },
        ellipse: function (config, clas) {
            var _a;
            var width = Math.max(...clas.parts.map((e) => { var _a; return (_a = e.width) !== null && _a !== void 0 ? _a : 0; }));
            var height = sum(clas.parts, (e) => { var _a; return (_a = e.height) !== null && _a !== void 0 ? _a : 0; });
            clas.width = width * 1.25;
            clas.height = height * 1.25;
            clas.dividers = [];
            var y = height * 0.125;
            var sq = (x) => x * x;
            var rimPos = (y) => Math.sqrt(sq(0.5) - sq(y / clas.height - 0.5)) * clas.width;
            for (var comp of clas.parts) {
                comp.x = width * 0.125;
                comp.y = y;
                comp.width = width;
                y += (_a = comp.height) !== null && _a !== void 0 ? _a : 0;
                if (comp != last(clas.parts))
                    clas.dividers.push([
                        { x: clas.width / 2 + rimPos(y) - 1, y: y },
                        { x: clas.width / 2 - rimPos(y) + 1, y: y },
                    ]);
            }
        },
        end: icon,
        frame: function (config, clas) {
            var _a, _b, _c, _d, _e;
            var w = (_a = clas.parts[0].width) !== null && _a !== void 0 ? _a : 0;
            var h = (_b = clas.parts[0].height) !== null && _b !== void 0 ? _b : 0;
            clas.parts[0].width = h / 2 + ((_c = clas.parts[0].width) !== null && _c !== void 0 ? _c : 0);
            box(config, clas);
            if ((_d = clas.dividers) === null || _d === void 0 ? void 0 : _d.length)
                clas.dividers.shift();
            (_e = clas.dividers) === null || _e === void 0 ? void 0 : _e.unshift([
                { x: 0, y: h },
                { x: w - h / 4, y: h },
                { x: w + h / 4, y: h / 2 },
                { x: w + h / 4, y: 0 },
            ]);
        },
        hidden: function (config, clas) {
            clas.dividers = [];
            clas.parts = [];
            clas.width = 1;
            clas.height = 1;
        },
        input: box,
        lollipop: labelledIcon,
        none: box,
        note: box,
        package: box,
        pipe: function box(config, clas) {
            offsetBox(config, clas, { x: -config.padding / 2, y: 0 });
        },
        receiver: box,
        rhomb: function (config, clas) {
            var _a;
            var width = Math.max(...clas.parts.map((e) => { var _a; return (_a = e.width) !== null && _a !== void 0 ? _a : 0; }));
            var height = sum(clas.parts, (e) => { var _a; return (_a = e.height) !== null && _a !== void 0 ? _a : 0; });
            clas.width = width * 1.5;
            clas.height = height * 1.5;
            clas.dividers = [];
            var y = height * 0.25;
            for (var comp of clas.parts) {
                comp.x = width * 0.25;
                comp.y = y;
                comp.width = width;
                y += (_a = comp.height) !== null && _a !== void 0 ? _a : 0;
                var slope = clas.width / clas.height;
                if (comp != last(clas.parts))
                    clas.dividers.push([
                        {
                            x: clas.width / 2 + (y < clas.height / 2 ? y * slope : (clas.height - y) * slope),
                            y: y,
                        },
                        {
                            x: clas.width / 2 - (y < clas.height / 2 ? y * slope : (clas.height - y) * slope),
                            y: y,
                        },
                    ]);
            }
        },
        roundrect: box,
        sender: box,
        socket: labelledIcon,
        start: icon,
        sync: function (config, clas) {
            clas.dividers = [];
            clas.parts = [];
            if (config.direction == 'LR') {
                clas.width = config.lineWidth * 3;
                clas.height = config.fontSize * 5;
            }
            else {
                clas.width = config.fontSize * 5;
                clas.height = config.lineWidth * 3;
            }
        },
        table: function (config, clas) {
            var _a, _b, _c, _d, _e;
            if (clas.parts.length == 1) {
                box(config, clas);
                return;
            }
            var gridcells = clas.parts.slice(1);
            var rows = [[]];
            function isRowBreak(e) {
                return !e.lines.length && !e.nodes.length && !e.assocs.length;
            }
            function isRowFull(e) {
                var current = last(rows);
                return rows[0] != current && rows[0].length == current.length;
            }
            function isEnd(e) {
                return comp == last(gridcells);
            }
            for (var comp of gridcells) {
                if (!isEnd() && isRowBreak(comp) && last(rows).length) {
                    rows.push([]);
                }
                else if (isRowFull()) {
                    rows.push([comp]);
                }
                else {
                    last(rows).push(comp);
                }
            }
            var header = clas.parts[0];
            var cellW = Math.max(((_a = header.width) !== null && _a !== void 0 ? _a : 0) / rows[0].length, ...gridcells.map((e) => { var _a; return (_a = e.width) !== null && _a !== void 0 ? _a : 0; }));
            var cellH = Math.max(...gridcells.map((e) => { var _a; return (_a = e.height) !== null && _a !== void 0 ? _a : 0; }));
            clas.width = cellW * rows[0].length;
            clas.height = ((_b = header.height) !== null && _b !== void 0 ? _b : 0) + cellH * rows.length;
            var hh = (_c = header.height) !== null && _c !== void 0 ? _c : 0;
            clas.dividers = [
                [
                    { x: 0, y: (_d = header.height) !== null && _d !== void 0 ? _d : 0 },
                    { x: 0, y: (_e = header.height) !== null && _e !== void 0 ? _e : 0 },
                ],
                ...rows.map((e, i) => {
                    var _a;
                    return [
                        { x: 0, y: hh + i * cellH },
                        { x: (_a = clas.width) !== null && _a !== void 0 ? _a : 0, y: hh + i * cellH },
                    ];
                }),
                ...rows[0].map((e, i) => [
                    { x: (i + 1) * cellW, y: hh },
                    { x: (i + 1) * cellW, y: clas.height },
                ]),
            ];
            header.x = 0;
            header.y = 0;
            header.width = clas.width;
            for (var i = 0; i < rows.length; i++) {
                for (var j = 0; j < rows[i].length; j++) {
                    var cell = rows[i][j];
                    cell.x = j * cellW;
                    cell.y = hh + i * cellH;
                    cell.width = cellW;
                }
            }
            clas.parts = clas.parts.filter((e) => !isRowBreak(e));
        },
        transceiver: box,
    };
    var visualizers = {
        actor: function (node, x, y, config, g) {
            var a = config.padding / 2;
            var yp = y + a * 4;
            var faceCenter = { x: node.x, y: yp - a };
            g.circle(faceCenter, a).fillAndStroke();
            g.path([
                { x: node.x, y: yp },
                { x: node.x, y: yp + 2 * a },
            ]).stroke();
            g.path([
                { x: node.x - a, y: yp + a },
                { x: node.x + a, y: yp + a },
            ]).stroke();
            g.path([
                { x: node.x - a, y: yp + a + config.padding },
                { x: node.x, y: yp + config.padding },
                { x: node.x + a, y: yp + a + config.padding },
            ]).stroke();
        },
        class: function (node, x, y, config, g) {
            g.rect(x, y, node.width, node.height).fillAndStroke();
        },
        database: function (node, x, y, config, g) {
            var pad = config.padding;
            var cy = y - pad / 2;
            var pi = 3.1416;
            g.rect(x, y + pad, node.width, node.height - pad * 2).fill();
            g.path([
                { x: x, y: cy + pad * 1.5 },
                { x: x, y: cy - pad * 0.5 + node.height },
            ]).stroke();
            g.path([
                { x: x + node.width, y: cy + pad * 1.5 },
                { x: x + node.width, y: cy - pad * 0.5 + node.height },
            ]).stroke();
            g.ellipse({ x: node.x, y: cy + pad * 1.5 }, node.width, pad * 1.5).fillAndStroke();
            g.ellipse({ x: node.x, y: cy - pad * 0.5 + node.height }, node.width, pad * 1.5, 0, pi).fillAndStroke();
        },
        ellipse: function (node, x, y, config, g) {
            g.ellipse({ x: node.x, y: node.y }, node.width, node.height).fillAndStroke();
        },
        end: function (node, x, y, config, g) {
            g.circle({ x: node.x, y: y + node.height / 2 }, node.height / 3).fillAndStroke();
            g.fillStyle(config.stroke);
            g.circle({ x: node.x, y: y + node.height / 2 }, node.height / 3 - config.padding / 2).fill();
        },
        frame: function (node, x, y, config, g) {
            g.rect(x, y, node.width, node.height).fillAndStroke();
        },
        hidden: function (node, x, y, config, g) { },
        input: function (node, x, y, config, g) {
            g.circuit([
                { x: x + config.padding, y: y },
                { x: x + node.width, y: y },
                { x: x + node.width - config.padding, y: y + node.height },
                { x: x, y: y + node.height },
            ]).fillAndStroke();
        },
        lollipop: function (node, x, y, config, g) {
            g.circle({ x: node.x, y: y + node.height / 2 }, node.height / 2.5).fillAndStroke();
        },
        none: function (node, x, y, config, g) { },
        note: function (node, x, y, config, g) {
            g.circuit([
                { x: x, y: y },
                { x: x + node.width - config.padding, y: y },
                { x: x + node.width, y: y + config.padding },
                { x: x + node.width, y: y + node.height },
                { x: x, y: y + node.height },
                { x: x, y: y },
            ]).fillAndStroke();
            g.path([
                { x: x + node.width - config.padding, y: y },
                { x: x + node.width - config.padding, y: y + config.padding },
                { x: x + node.width, y: y + config.padding },
            ]).stroke();
        },
        package: function (node, x, y, config, g) {
            var _a;
            var headHeight = (_a = node.parts[0].height) !== null && _a !== void 0 ? _a : 0;
            g.rect(x, y + headHeight, node.width, node.height - headHeight).fillAndStroke();
            var w = g.measureText(node.parts[0].lines[0]).width + 2 * config.padding;
            g.circuit([
                { x: x, y: y + headHeight },
                { x: x, y: y },
                { x: x + w, y: y },
                { x: x + w, y: y + headHeight },
            ]).fillAndStroke();
        },
        pipe: function (node, x, y, config, g) {
            var pad = config.padding;
            var pi = 3.1416;
            g.rect(x, y, node.width, node.height).fill();
            g.path([
                { x: x, y: y },
                { x: x + node.width, y: y },
            ]).stroke();
            g.path([
                { x: x, y: y + node.height },
                { x: x + node.width, y: y + node.height },
            ]).stroke();
            g.ellipse({ x: x + node.width, y: node.y }, pad * 1.5, node.height).fillAndStroke();
            g.ellipse({ x: x, y: node.y }, pad * 1.5, node.height, pi / 2, (pi * 3) / 2).fillAndStroke();
        },
        receiver: function (node, x, y, config, g) {
            g.circuit([
                { x: x - config.padding, y: y },
                { x: x + node.width, y: y },
                { x: x + node.width, y: y + node.height },
                { x: x - config.padding, y: y + node.height },
                { x: x, y: y + node.height / 2 },
            ]).fillAndStroke();
        },
        rhomb: function (node, x, y, config, g) {
            g.circuit([
                { x: node.x, y: y },
                { x: x + node.width, y: node.y },
                { x: node.x, y: y + node.height },
                { x: x, y: node.y },
            ]).fillAndStroke();
        },
        roundrect: function (node, x, y, config, g) {
            var r = Math.min(config.padding * 2 * config.leading, node.height / 2);
            g.roundRect(x, y, node.width, node.height, r).fillAndStroke();
        },
        sender: function (node, x, y, config, g) {
            g.circuit([
                { x: x, y: y },
                { x: x + node.width - config.padding, y: y },
                { x: x + node.width, y: y + node.height / 2 },
                { x: x + node.width - config.padding, y: y + node.height },
                { x: x, y: y + node.height },
            ]).fillAndStroke();
        },
        socket: function (node, x, y, config, g) {
            var from = config.direction === 'TB' ? Math.PI : Math.PI / 2;
            var to = config.direction === 'TB' ? 2 * Math.PI : -Math.PI / 2;
            g.ellipse({ x: node.x, y: node.y }, node.width, node.height, from, to).stroke();
        },
        start: function (node, x, y, config, g) {
            g.fillStyle(config.stroke);
            g.circle({ x: node.x, y: y + node.height / 2 }, node.height / 2.5).fill();
        },
        sync: function (node, x, y, config, g) {
            g.fillStyle(config.stroke);
            g.rect(x, y, node.width, node.height).fillAndStroke();
        },
        table: function (node, x, y, config, g) {
            g.rect(x, y, node.width, node.height).fillAndStroke();
        },
        transceiver: function (node, x, y, config, g) {
            g.circuit([
                { x: x - config.padding, y: y },
                { x: x + node.width - config.padding, y: y },
                { x: x + node.width, y: y + node.height / 2 },
                { x: x + node.width - config.padding, y: y + node.height },
                { x: x - config.padding, y: y + node.height },
                { x: x, y: y + node.height / 2 },
            ]).fillAndStroke();
        },
    };

    function layout(measurer, config, ast) {
        function measureLines(lines, fontWeight) {
            if (!lines.length)
                return { width: 0, height: config.padding };
            measurer.setFont(config.font, config.fontSize, fontWeight, 'normal');
            return {
                width: Math.round(Math.max(...lines.map(measurer.textWidth)) + 2 * config.padding),
                height: Math.round(measurer.textHeight() * lines.length + 2 * config.padding),
            };
        }
        function layoutCompartment(c, compartmentIndex, style) {
            var _a, _b, _c, _d;
            var textSize = measureLines(c.lines, compartmentIndex ? 'normal' : 'bold');
            if (!c.nodes.length && !c.assocs.length) {
                const layoutedPart = c;
                layoutedPart.width = textSize.width;
                layoutedPart.height = textSize.height;
                layoutedPart.offset = { x: config.padding, y: config.padding };
                return;
            }
            var styledConfig = Object.assign(Object.assign({}, config), { direction: (_a = style.direction) !== null && _a !== void 0 ? _a : config.direction });
            const layoutedNodes = c.nodes;
            const layoutedAssoc = c.assocs;
            for (let i = 0; i < layoutedAssoc.length; i++)
                layoutedAssoc[i].id = `${i}`;
            for (const e of layoutedNodes)
                layoutNode(e, styledConfig);
            var g = new graphre.graphlib.Graph({
                multigraph: true,
            });
            g.setGraph({
                rankdir: style.direction || config.direction,
                nodesep: config.spacing,
                edgesep: config.spacing,
                ranksep: config.spacing,
                acyclicer: config.acyclicer,
                ranker: config.ranker,
            });
            for (var e of layoutedNodes) {
                g.setNode(e.id, { width: e.layoutWidth, height: e.layoutHeight });
            }
            for (var r of layoutedAssoc) {
                if (r.type.indexOf('_') > -1) {
                    g.setEdge(r.start, r.end, { minlen: 0 }, r.id);
                }
                else if (((_b = config.gravity) !== null && _b !== void 0 ? _b : 1) != 1) {
                    g.setEdge(r.start, r.end, { minlen: config.gravity }, r.id);
                }
                else {
                    g.setEdge(r.start, r.end, {}, r.id);
                }
            }
            graphre.layout(g);
            var rels = indexBy(c.assocs, 'id');
            var nodes = indexBy(c.nodes, 'id');
            for (const name of g.nodes()) {
                var node = g.node(name);
                nodes[name].x = node.x;
                nodes[name].y = node.y;
            }
            var left = 0;
            var right = 0;
            var top = 0;
            var bottom = 0;
            for (const edgeObj of g.edges()) {
                var edge = g.edge(edgeObj);
                var start = nodes[edgeObj.v];
                var end = nodes[edgeObj.w];
                var rel = rels[edgeObj.name];
                rel.path = [start, ...edge.points, end].map(toPoint);
                var startP = rel.path[1];
                var endP = rel.path[rel.path.length - 2];
                layoutLabel(rel.startLabel, startP, adjustQuadrant((_c = quadrant(startP, start)) !== null && _c !== void 0 ? _c : 4, start, end));
                layoutLabel(rel.endLabel, endP, adjustQuadrant((_d = quadrant(endP, end)) !== null && _d !== void 0 ? _d : 2, end, start));
                left = Math.min(left, rel.startLabel.x, rel.endLabel.x, ...edge.points.map((e) => e.x), ...edge.points.map((e) => e.x));
                right = Math.max(right, rel.startLabel.x + rel.startLabel.width, rel.endLabel.x + rel.endLabel.width, ...edge.points.map((e) => e.x));
                top = Math.min(top, rel.startLabel.y, rel.endLabel.y, ...edge.points.map((e) => e.y));
                bottom = Math.max(bottom, rel.startLabel.y + rel.startLabel.height, rel.endLabel.y + rel.endLabel.height, ...edge.points.map((e) => e.y));
            }
            var graph = g.graph();
            var width = Math.max(graph.width, right - left);
            var height = Math.max(graph.height, bottom - top);
            var graphHeight = height ? height + 2 * config.gutter : 0;
            var graphWidth = width ? width + 2 * config.gutter : 0;
            var part = c;
            part.width = Math.max(textSize.width, graphWidth) + 2 * config.padding;
            part.height = textSize.height + graphHeight + config.padding;
            part.offset = { x: config.padding - left, y: config.padding - top };
        }
        function toPoint(o) {
            return { x: o.x, y: o.y };
        }
        function layoutLabel(label, point, quadrant) {
            if (!label.text) {
                label.width = 0;
                label.height = 0;
                label.x = point.x;
                label.y = point.y;
            }
            else {
                var fontSize = config.fontSize;
                var lines = label.text.split('`');
                label.width = Math.max(...lines.map((l) => measurer.textWidth(l)));
                label.height = fontSize * lines.length;
                label.x =
                    point.x + (quadrant == 1 || quadrant == 4 ? config.padding : -label.width - config.padding);
                label.y =
                    point.y + (quadrant == 3 || quadrant == 4 ? config.padding : -label.height - config.padding);
            }
        }
        function quadrant(point, node) {
            if (point.x < node.x && point.y < node.y)
                return 1;
            if (point.x > node.x && point.y < node.y)
                return 2;
            if (point.x > node.x && point.y > node.y)
                return 3;
            if (point.x < node.x && point.y > node.y)
                return 4;
            return undefined;
        }
        function adjustQuadrant(quadrant, point, opposite) {
            if (opposite.x == point.x || opposite.y == point.y)
                return quadrant;
            var flipHorizontally = [4, 3, 2, 1];
            var flipVertically = [2, 1, 4, 3];
            var oppositeQuadrant = opposite.y < point.y ? (opposite.x < point.x ? 2 : 1) : opposite.x < point.x ? 3 : 4;
            if (oppositeQuadrant === quadrant) {
                if (config.direction === 'LR')
                    return flipHorizontally[quadrant - 1];
                if (config.direction === 'TB')
                    return flipVertically[quadrant - 1];
            }
            return quadrant;
        }
        function layoutNode(node, config) {
            var _a, _b, _c;
            var style = config.styles[node.type] || styles.class;
            node.parts.forEach((co, i) => layoutCompartment(co, i, style));
            var visual = (_a = layouters[style.visual]) !== null && _a !== void 0 ? _a : layouters.class;
            visual(config, node);
            node.layoutWidth = ((_b = node.width) !== null && _b !== void 0 ? _b : 0) + 2 * config.edgeMargin;
            node.layoutHeight = ((_c = node.height) !== null && _c !== void 0 ? _c : 0) + 2 * config.edgeMargin;
        }
        const root = ast;
        layoutCompartment(root, 0, styles.class);
        return root;
    }

    function join(list) {
        return list.join('')
      }
      function addNode(node, list) {
        return concatNodes([node], list)
      }
      function concatNodes(start, end) {
        let list = start;
        for (const node of end) {
          const index = list.findIndex(e => e.id === node.id);
          if (index == -1) {
            list = [...list, node];
          } else if (list[index].parts.length < node.parts.length) {
            const copy = list.slice();
            copy[index] = node;
            list = copy;
          }
        }
        return list
      }
      function Part({ nodes = [], assocs = [], lines = [], directives = [] }) {
        return { nodes, assocs, lines, directives }
      }

    function peg$subclass(child, parent) {
      function C() { this.constructor = child; }
      C.prototype = parent.prototype;
      child.prototype = new C();
    }

    function peg$SyntaxError(message, expected, found, location) {
      var self = Error.call(this, message);
      // istanbul ignore next Check is a necessary evil to support older environments
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(self, peg$SyntaxError.prototype);
      }
      self.expected = expected;
      self.found = found;
      self.location = location;
      self.name = "SyntaxError";
      return self;
    }

    peg$subclass(peg$SyntaxError, Error);

    function peg$padEnd(str, targetLength, padString) {
      padString = padString || " ";
      if (str.length > targetLength) { return str; }
      targetLength -= str.length;
      padString += padString.repeat(targetLength);
      return str + padString.slice(0, targetLength);
    }

    peg$SyntaxError.prototype.format = function(sources) {
      var str = "Error: " + this.message;
      if (this.location) {
        var src = null;
        var k;
        for (k = 0; k < sources.length; k++) {
          if (sources[k].source === this.location.source) {
            src = sources[k].text.split(/\r\n|\n|\r/g);
            break;
          }
        }
        var s = this.location.start;
        var loc = this.location.source + ":" + s.line + ":" + s.column;
        if (src) {
          var e = this.location.end;
          var filler = peg$padEnd("", s.line.toString().length, ' ');
          var line = src[s.line - 1];
          var last = s.line === e.line ? e.column : line.length + 1;
          var hatLen = (last - s.column) || 1;
          str += "\n --> " + loc + "\n"
              + filler + " |\n"
              + s.line + " | " + line + "\n"
              + filler + " | " + peg$padEnd("", s.column - 1, ' ')
              + peg$padEnd("", hatLen, "^");
        } else {
          str += "\n at " + loc;
        }
      }
      return str;
    };

    peg$SyntaxError.buildMessage = function(expected, found) {
      var DESCRIBE_EXPECTATION_FNS = {
        literal: function(expectation) {
          return "\"" + literalEscape(expectation.text) + "\"";
        },

        class: function(expectation) {
          var escapedParts = expectation.parts.map(function(part) {
            return Array.isArray(part)
              ? classEscape(part[0]) + "-" + classEscape(part[1])
              : classEscape(part);
          });

          return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
        },

        any: function() {
          return "any character";
        },

        end: function() {
          return "end of input";
        },

        other: function(expectation) {
          return expectation.description;
        }
      };

      function hex(ch) {
        return ch.charCodeAt(0).toString(16).toUpperCase();
      }

      function literalEscape(s) {
        return s
          .replace(/\\/g, "\\\\")
          .replace(/"/g,  "\\\"")
          .replace(/\0/g, "\\0")
          .replace(/\t/g, "\\t")
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
          .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
      }

      function classEscape(s) {
        return s
          .replace(/\\/g, "\\\\")
          .replace(/\]/g, "\\]")
          .replace(/\^/g, "\\^")
          .replace(/-/g,  "\\-")
          .replace(/\0/g, "\\0")
          .replace(/\t/g, "\\t")
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
          .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
      }

      function describeExpectation(expectation) {
        return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
      }

      function describeExpected(expected) {
        var descriptions = expected.map(describeExpectation);
        var i, j;

        descriptions.sort();

        if (descriptions.length > 0) {
          for (i = 1, j = 1; i < descriptions.length; i++) {
            if (descriptions[i - 1] !== descriptions[i]) {
              descriptions[j] = descriptions[i];
              j++;
            }
          }
          descriptions.length = j;
        }

        switch (descriptions.length) {
          case 1:
            return descriptions[0];

          case 2:
            return descriptions[0] + " or " + descriptions[1];

          default:
            return descriptions.slice(0, -1).join(", ")
              + ", or "
              + descriptions[descriptions.length - 1];
        }
      }

      function describeFound(found) {
        return found ? "\"" + literalEscape(found) + "\"" : "end of input";
      }

      return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
    };

    function peg$parse(input, options) {
      options = options !== undefined ? options : {};

      var peg$FAILED = {};
      var peg$source = options.grammarSource;

      var peg$startRuleFunctions = { Root: peg$parseRoot };
      var peg$startRuleFunction = peg$parseRoot;

      var peg$c0 = "[<";
      var peg$c1 = " ";
      var peg$c2 = ">";
      var peg$c3 = "[";
      var peg$c4 = "]";
      var peg$c5 = "|";
      var peg$c6 = "#";
      var peg$c7 = ":";
      var peg$c8 = "=";
      var peg$c9 = "\\";
      var peg$c10 = ";";
      var peg$c11 = "<";
      var peg$c12 = "(";
      var peg$c13 = ")";
      var peg$c14 = "-";
      var peg$c15 = "/";
      var peg$c16 = "(o";
      var peg$c17 = "o<";
      var peg$c18 = "o";
      var peg$c19 = "+";
      var peg$c20 = "<:";
      var peg$c21 = "--";
      var peg$c22 = "-/-";
      var peg$c23 = "o)";
      var peg$c24 = ">o";
      var peg$c25 = ":>";

      var peg$r0 = /^[\n \t]/;
      var peg$r1 = /^[\n;]/;
      var peg$r2 = /^[.a-zA-Z0-9]/;
      var peg$r3 = /^[ ]/;
      var peg$r4 = /^[^\n]/;
      var peg$r5 = /^[^[\]\n\\;|<>]/;
      var peg$r6 = /^[<>():+o\/]/;
      var peg$r7 = /^[^[\]\n\\;|\-]/;
      var peg$r8 = /^[^[\]\n\\;|><():+o\/\-]/;
      var peg$r9 = /^[a-zA-Z0-9]/;
      var peg$r10 = /^[ \t]/;

      var peg$e0 = peg$otherExpectation("padding");
      var peg$e1 = peg$classExpectation(["\n", " ", "\t"], false, false);
      var peg$e2 = peg$otherExpectation("linebreak");
      var peg$e3 = peg$classExpectation(["\n", ";"], false, false);
      var peg$e4 = peg$literalExpectation("[<", false);
      var peg$e5 = peg$literalExpectation(" ", false);
      var peg$e6 = peg$literalExpectation(">", false);
      var peg$e7 = peg$literalExpectation("[", false);
      var peg$e8 = peg$literalExpectation("]", false);
      var peg$e9 = peg$literalExpectation("|", false);
      var peg$e10 = peg$otherExpectation("Directive");
      var peg$e11 = peg$literalExpectation("#", false);
      var peg$e12 = peg$classExpectation([".", ["a", "z"], ["A", "Z"], ["0", "9"]], false, false);
      var peg$e13 = peg$literalExpectation(":", false);
      var peg$e14 = peg$classExpectation([" "], false, false);
      var peg$e15 = peg$classExpectation(["\n"], true, false);
      var peg$e16 = peg$otherExpectation("AttrList");
      var peg$e17 = peg$otherExpectation("Attr");
      var peg$e18 = peg$literalExpectation("=", false);
      var peg$e19 = peg$otherExpectation("row");
      var peg$e20 = peg$otherExpectation("text");
      var peg$e21 = peg$otherExpectation("escaped");
      var peg$e22 = peg$literalExpectation("\\", false);
      var peg$e23 = peg$literalExpectation(";", false);
      var peg$e24 = peg$literalExpectation("<", false);
      var peg$e25 = peg$literalExpectation("(", false);
      var peg$e26 = peg$literalExpectation(")", false);
      var peg$e27 = peg$literalExpectation("-", false);
      var peg$e28 = peg$literalExpectation("/", false);
      var peg$e29 = peg$otherExpectation("text character");
      var peg$e30 = peg$classExpectation(["[", "]", "\n", "\\", ";", "|", "<", ">"], true, false);
      var peg$e31 = peg$otherExpectation("assoc start label part");
      var peg$e32 = peg$classExpectation(["<", ">", "(", ")", ":", "+", "o", "/"], false, false);
      var peg$e33 = peg$classExpectation(["[", "]", "\n", "\\", ";", "|", "-"], true, false);
      var peg$e34 = peg$classExpectation(["[", "]", "\n", "\\", ";", "|", ">", "<", "(", ")", ":", "+", "o", "/", "-"], true, false);
      var peg$e35 = peg$otherExpectation("assoc end label part");
      var peg$e36 = peg$otherExpectation("assoc start label");
      var peg$e37 = peg$otherExpectation("assoc end label");
      var peg$e38 = peg$otherExpectation("association");
      var peg$e39 = peg$otherExpectation("arrow_start");
      var peg$e40 = peg$literalExpectation("(o", false);
      var peg$e41 = peg$literalExpectation("o<", false);
      var peg$e42 = peg$literalExpectation("o", false);
      var peg$e43 = peg$literalExpectation("+", false);
      var peg$e44 = peg$literalExpectation("<:", false);
      var peg$e45 = peg$otherExpectation("arrow_trunk");
      var peg$e46 = peg$literalExpectation("--", false);
      var peg$e47 = peg$literalExpectation("-/-", false);
      var peg$e48 = peg$otherExpectation("arrow_end");
      var peg$e49 = peg$literalExpectation("o)", false);
      var peg$e50 = peg$literalExpectation(">o", false);
      var peg$e51 = peg$literalExpectation(":>", false);
      var peg$e52 = peg$otherExpectation("arrow");
      var peg$e53 = peg$otherExpectation("identifier");
      var peg$e54 = peg$classExpectation([["a", "z"], ["A", "Z"], ["0", "9"]], false, false);
      var peg$e55 = peg$otherExpectation("space");
      var peg$e56 = peg$classExpectation([" ", "\t"], false, false);

      var peg$f0 = function(g) { return g };
      var peg$f1 = function(a, b) {
        return {
          nodes: concatNodes(a.nodes, b.nodes),
          assocs: [...a.assocs, ...b.assocs],
          lines: [...a.lines, ...b.lines],
          directives: [...a.directives, ...b.directives]
        }
      };
      var peg$f2 = function(g) { return g };
      var peg$f3 = function(ch) { return Part({ nodes: [...ch.nodes], assocs: ch.assocs }) };
      var peg$f4 = function(dir) { return Part({ directives: [dir] }) };
      var peg$f5 = function(row) { return Part({ lines: [row] }) };
      var peg$f6 = function(node) { return Part({ nodes: [node] }) };
      var peg$f7 = function(type, attr) { return { type, attr } };
      var peg$f8 = function(type) { return { type, attr: {} } };
      var peg$f9 = function(attr) { return { type: 'class', attr } };
      var peg$f10 = function() { return { type: 'class', attr: {} } };
      var peg$f11 = function(meta, text, lines, parts) {
        const id = text.trim();
        return {
          id: meta.attr.id ?? id,
          type: meta.type,
          attr: meta.attr,
          parts: [Part({ lines: [id, ...lines.map(e => e.trim())] }), ...parts]
        }
      };
      var peg$f12 = function() { return [] };
      var peg$f13 = function(parts) { return [Part({}), ...parts] };
      var peg$f14 = function(graph, parts) { return [graph, ...parts] };
      var peg$f15 = function(first, assoc, chain) {
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
      };
      var peg$f16 = function(first, assoc, last) {
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
      };
      var peg$f17 = function(key, value) {
        return { key: join(key), value: value.join('') }
      };
      var peg$f18 = function(first, tail) { return { ...first, ...tail } };
      var peg$f19 = function(attr) { return attr };
      var peg$f20 = function(key, value) { return { [key]: value } };
      var peg$f21 = function(text, row) { return text + row };
      var peg$f22 = function(text) { return text.trim() };
      var peg$f23 = function(chars) { return chars.join('') };
      var peg$f24 = function(char) { return char };
      var peg$f25 = function(char) { return char };
      var peg$f26 = function(char) { return char };
      var peg$f27 = function(char) { return char };
      var peg$f28 = function(char) { return char };
      var peg$f29 = function(char) { return char };
      var peg$f30 = function(char) { return char };
      var peg$f31 = function(char) { return char };
      var peg$f32 = function(char) { return char };
      var peg$f33 = function(char) { return char };
      var peg$f34 = function(char) { return char };
      var peg$f35 = function(char) { return char };
      var peg$f36 = function(char) { return char };
      var peg$f37 = function(char) { return char };
      var peg$f38 = function(char) { return char };
      var peg$f39 = function(chars, pad) { return join(chars) + pad };
      var peg$f40 = function(chars, pad) { return join(chars) + pad };
      var peg$f41 = function(chars) { return join(chars) };
      var peg$f42 = function(char) { return char };
      var peg$f43 = function(pad, chars) { return pad + join(chars) };
      var peg$f44 = function(pad, chars) { return pad + join(chars) };
      var peg$f45 = function(chars) { return join(chars) };
      var peg$f46 = function(chunks) { return join(chunks) };
      var peg$f47 = function(chunks) { return join(chunks) };
      var peg$f48 = function(start, arrow, end) {
        return { startLabel: start.trim(), symbol: arrow, endLabel: end.trim() }
      };
      var peg$f49 = function(label, arrow) {
        return { startLabel: label.trim(), symbol: arrow, endLabel: "" }
      };
      var peg$f50 = function(arrow, label) {
        return { startLabel: "", symbol: arrow, endLabel: label.trim() }
      };
      var peg$f51 = function(arrow) {
        return { startLabel: "", symbol: arrow, endLabel: "" }
      };
      var peg$f52 = function(token) { return token };
      var peg$f53 = function(token) { return token };
      var peg$f54 = function(token) { return token };
      var peg$f55 = function(token) { return token };
      var peg$f56 = function(token) { return token };
      var peg$f57 = function(token) { return token };
      var peg$f58 = function(token) { return token };
      var peg$f59 = function(token) { return token };
      var peg$f60 = function(token) { return token };
      var peg$f61 = function(token) { return token };
      var peg$f62 = function(token) { return token };
      var peg$f63 = function(token) { return token };
      var peg$f64 = function(token) { return token };
      var peg$f65 = function(token) { return token };
      var peg$f66 = function(token) { return token };
      var peg$f67 = function(token) { return token };
      var peg$f68 = function(token) { return token };
      var peg$f69 = function(start, trunk, end) { return start+trunk+end };
      var peg$f70 = function(start, trunk) { return start + trunk };
      var peg$f71 = function(trunk, end) { return trunk + end };
      var peg$f72 = function(trunk) { return trunk };
      var peg$f73 = function(id) {
        return id.join('')
      };
      var peg$currPos = 0;
      var peg$posDetailsCache = [{ line: 1, column: 1 }];
      var peg$maxFailPos = 0;
      var peg$maxFailExpected = [];
      var peg$silentFails = 0;

      var peg$result;

      if ("startRule" in options) {
        if (!(options.startRule in peg$startRuleFunctions)) {
          throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
        }

        peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
      }

      function peg$literalExpectation(text, ignoreCase) {
        return { type: "literal", text: text, ignoreCase: ignoreCase };
      }

      function peg$classExpectation(parts, inverted, ignoreCase) {
        return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
      }

      function peg$endExpectation() {
        return { type: "end" };
      }

      function peg$otherExpectation(description) {
        return { type: "other", description: description };
      }

      function peg$computePosDetails(pos) {
        var details = peg$posDetailsCache[pos];
        var p;

        if (details) {
          return details;
        } else {
          p = pos - 1;
          while (!peg$posDetailsCache[p]) {
            p--;
          }

          details = peg$posDetailsCache[p];
          details = {
            line: details.line,
            column: details.column
          };

          while (p < pos) {
            if (input.charCodeAt(p) === 10) {
              details.line++;
              details.column = 1;
            } else {
              details.column++;
            }

            p++;
          }

          peg$posDetailsCache[pos] = details;

          return details;
        }
      }

      function peg$computeLocation(startPos, endPos) {
        var startPosDetails = peg$computePosDetails(startPos);
        var endPosDetails = peg$computePosDetails(endPos);

        return {
          source: peg$source,
          start: {
            offset: startPos,
            line: startPosDetails.line,
            column: startPosDetails.column
          },
          end: {
            offset: endPos,
            line: endPosDetails.line,
            column: endPosDetails.column
          }
        };
      }

      function peg$fail(expected) {
        if (peg$currPos < peg$maxFailPos) { return; }

        if (peg$currPos > peg$maxFailPos) {
          peg$maxFailPos = peg$currPos;
          peg$maxFailExpected = [];
        }

        peg$maxFailExpected.push(expected);
      }

      function peg$buildStructuredError(expected, found, location) {
        return new peg$SyntaxError(
          peg$SyntaxError.buildMessage(expected, found),
          expected,
          found,
          location
        );
      }

      function peg$parseRoot() {
        var s0;

        s0 = peg$parsePaddedGraph();

        return s0;
      }

      function peg$parsePadding() {
        var s0, s1;

        peg$silentFails++;
        s0 = [];
        if (peg$r0.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e1); }
        }
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          if (peg$r0.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e1); }
          }
        }
        peg$silentFails--;
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e0); }

        return s0;
      }

      function peg$parseLinebreak() {
        var s0, s1;

        peg$silentFails++;
        s0 = [];
        if (peg$r1.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e3); }
        }
        if (s1 !== peg$FAILED) {
          while (s1 !== peg$FAILED) {
            s0.push(s1);
            if (peg$r1.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e3); }
            }
          }
        } else {
          s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e2); }
        }

        return s0;
      }

      function peg$parsePaddedGraph() {
        var s0, s2;

        s0 = peg$currPos;
        peg$parsePadding();
        s2 = peg$parseGraph();
        if (s2 !== peg$FAILED) {
          peg$parsePadding();
          s0 = peg$f0(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseGraph() {
        var s0, s1, s3, s6;

        s0 = peg$currPos;
        s1 = peg$parseGraphPart();
        if (s1 !== peg$FAILED) {
          peg$parse_();
          s3 = peg$parseLinebreak();
          if (s3 !== peg$FAILED) {
            peg$parsePadding();
            peg$parse_();
            s6 = peg$parseGraph();
            if (s6 !== peg$FAILED) {
              s0 = peg$f1(s1, s6);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseGraphPart();
          if (s1 !== peg$FAILED) {
            s1 = peg$f2(s1);
          }
          s0 = s1;
        }

        return s0;
      }

      function peg$parseGraphPart() {
        var s0, s1;

        s0 = peg$currPos;
        s1 = peg$parseChain();
        if (s1 !== peg$FAILED) {
          s1 = peg$f3(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseDirective();
          if (s1 !== peg$FAILED) {
            s1 = peg$f4(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseRow();
            if (s1 !== peg$FAILED) {
              s1 = peg$f5(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parseNode();
              if (s1 !== peg$FAILED) {
                s1 = peg$f6(s1);
              }
              s0 = s1;
            }
          }
        }

        return s0;
      }

      function peg$parseNodeStart() {
        var s0, s1, s3, s4, s5, s7;

        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c0) {
          s1 = peg$c0;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e4); }
        }
        if (s1 !== peg$FAILED) {
          peg$parse_();
          s3 = peg$parseIdent();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 32) {
              s4 = peg$c1;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e5); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseAttrList();
              if (s5 !== peg$FAILED) {
                peg$parse_();
                if (input.charCodeAt(peg$currPos) === 62) {
                  s7 = peg$c2;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$e6); }
                }
                if (s7 !== peg$FAILED) {
                  s0 = peg$f7(s3, s5);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c0) {
            s1 = peg$c0;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e4); }
          }
          if (s1 !== peg$FAILED) {
            peg$parse_();
            s3 = peg$parseIdent();
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (input.charCodeAt(peg$currPos) === 62) {
                s5 = peg$c2;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e6); }
              }
              if (s5 !== peg$FAILED) {
                s0 = peg$f8(s3);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c0) {
              s1 = peg$c0;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e4); }
            }
            if (s1 !== peg$FAILED) {
              peg$parse_();
              s3 = peg$parseAttrList();
              if (s3 !== peg$FAILED) {
                s4 = peg$parse_();
                if (input.charCodeAt(peg$currPos) === 62) {
                  s5 = peg$c2;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$e6); }
                }
                if (s5 !== peg$FAILED) {
                  s0 = peg$f9(s3);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 91) {
                s1 = peg$c3;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e7); }
              }
              if (s1 !== peg$FAILED) {
                s1 = peg$f10();
              }
              s0 = s1;
            }
          }
        }

        return s0;
      }

      function peg$parseNode() {
        var s0, s1, s2, s3, s4, s5, s6;

        s0 = peg$currPos;
        s1 = peg$parseNodeStart();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseText();
          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$currPos;
            s5 = peg$parseLinebreak();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseText();
              if (s6 !== peg$FAILED) {
                s4 = s6;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$currPos;
              s5 = peg$parseLinebreak();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseText();
                if (s6 !== peg$FAILED) {
                  s4 = s6;
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            }
            s4 = peg$parseNodeParts();
            if (s4 !== peg$FAILED) {
              s0 = peg$f11(s1, s2, s3, s4);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseNodeParts() {
        var s0, s1, s2, s3, s4;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 93) {
          s1 = peg$c4;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e8); }
        }
        if (s1 !== peg$FAILED) {
          s1 = peg$f12();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsePadding();
          if (input.charCodeAt(peg$currPos) === 124) {
            s2 = peg$c5;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e9); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parsePadding();
            s4 = peg$parseNodeParts();
            if (s4 !== peg$FAILED) {
              s0 = peg$f13(s4);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parsePadding();
            if (input.charCodeAt(peg$currPos) === 124) {
              s2 = peg$c5;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e9); }
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parsePaddedGraph();
              if (s3 !== peg$FAILED) {
                s4 = peg$parseNodeParts();
                if (s4 !== peg$FAILED) {
                  s0 = peg$f14(s3, s4);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          }
        }

        return s0;
      }

      function peg$parseChain() {
        var s0, s1, s2, s3;

        s0 = peg$currPos;
        s1 = peg$parseNode();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseAssoc();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseChain();
            if (s3 !== peg$FAILED) {
              s0 = peg$f15(s1, s2, s3);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseNode();
          if (s1 !== peg$FAILED) {
            s2 = peg$parseAssoc();
            if (s2 !== peg$FAILED) {
              s3 = peg$parseNode();
              if (s3 !== peg$FAILED) {
                s0 = peg$f16(s1, s2, s3);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }

        return s0;
      }

      function peg$parseDirective() {
        var s0, s1, s2, s3, s4, s5, s6;

        peg$silentFails++;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 35) {
          s1 = peg$c6;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e11); }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          if (peg$r2.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e12); }
          }
          if (s3 !== peg$FAILED) {
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              if (peg$r2.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e12); }
              }
            }
          } else {
            s2 = peg$FAILED;
          }
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 58) {
              s3 = peg$c7;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e13); }
            }
            if (s3 === peg$FAILED) {
              s3 = null;
            }
            s4 = [];
            if (peg$r3.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e14); }
            }
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              if (peg$r3.test(input.charAt(peg$currPos))) {
                s5 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e14); }
              }
            }
            s5 = [];
            if (peg$r4.test(input.charAt(peg$currPos))) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e15); }
            }
            while (s6 !== peg$FAILED) {
              s5.push(s6);
              if (peg$r4.test(input.charAt(peg$currPos))) {
                s6 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e15); }
              }
            }
            s0 = peg$f17(s2, s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e10); }
        }

        return s0;
      }

      function peg$parseAttrList() {
        var s0, s1, s2, s3;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseAttr();
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 32) {
            s2 = peg$c1;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e5); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parseAttrList();
            if (s3 !== peg$FAILED) {
              s0 = peg$f18(s1, s3);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseAttr();
          if (s1 !== peg$FAILED) {
            s1 = peg$f19(s1);
          }
          s0 = s1;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e16); }
        }

        return s0;
      }

      function peg$parseAttr() {
        var s0, s1, s2, s3;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseIdent();
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 61) {
            s2 = peg$c8;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e18); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parseIdent();
            if (s3 !== peg$FAILED) {
              s0 = peg$f20(s1, s3);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e17); }
        }

        return s0;
      }

      function peg$parseRow() {
        var s0, s1, s2;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseText();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseRow();
          if (s2 !== peg$FAILED) {
            s0 = peg$f21(s1, s2);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseText();
          if (s1 !== peg$FAILED) {
            s1 = peg$f22(s1);
          }
          s0 = s1;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e19); }
        }

        return s0;
      }

      function peg$parseText() {
        var s0, s1, s2;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseTextChar();
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseTextChar();
          }
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s1 = peg$f23(s1);
        }
        s0 = s1;
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e20); }
        }

        return s0;
      }

      function peg$parseEscaped() {
        var s0, s1, s2;

        peg$silentFails++;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 92) {
          s1 = peg$c9;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e22); }
        }
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 35) {
            s2 = peg$c6;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e11); }
          }
          if (s2 !== peg$FAILED) {
            s0 = peg$f24(s2);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 92) {
            s1 = peg$c9;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e22); }
          }
          if (s1 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 59) {
              s2 = peg$c10;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e23); }
            }
            if (s2 !== peg$FAILED) {
              s0 = peg$f25(s2);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 92) {
              s1 = peg$c9;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e22); }
            }
            if (s1 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 124) {
                s2 = peg$c5;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e9); }
              }
              if (s2 !== peg$FAILED) {
                s0 = peg$f26(s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 92) {
                s1 = peg$c9;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e22); }
              }
              if (s1 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 91) {
                  s2 = peg$c3;
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$e7); }
                }
                if (s2 !== peg$FAILED) {
                  s0 = peg$f27(s2);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 92) {
                  s1 = peg$c9;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$e22); }
                }
                if (s1 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 93) {
                    s2 = peg$c4;
                    peg$currPos++;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$e8); }
                  }
                  if (s2 !== peg$FAILED) {
                    s0 = peg$f28(s2);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 92) {
                    s1 = peg$c9;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$e22); }
                  }
                  if (s1 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 60) {
                      s2 = peg$c11;
                      peg$currPos++;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$e24); }
                    }
                    if (s2 !== peg$FAILED) {
                      s0 = peg$f29(s2);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 92) {
                      s1 = peg$c9;
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$e22); }
                    }
                    if (s1 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 62) {
                        s2 = peg$c2;
                        peg$currPos++;
                      } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$e6); }
                      }
                      if (s2 !== peg$FAILED) {
                        s0 = peg$f30(s2);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 92) {
                        s1 = peg$c9;
                        peg$currPos++;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$e22); }
                      }
                      if (s1 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 40) {
                          s2 = peg$c12;
                          peg$currPos++;
                        } else {
                          s2 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$e25); }
                        }
                        if (s2 !== peg$FAILED) {
                          s0 = peg$f31(s2);
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 92) {
                          s1 = peg$c9;
                          peg$currPos++;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$e22); }
                        }
                        if (s1 !== peg$FAILED) {
                          if (input.charCodeAt(peg$currPos) === 41) {
                            s2 = peg$c13;
                            peg$currPos++;
                          } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$e26); }
                          }
                          if (s2 !== peg$FAILED) {
                            s0 = peg$f32(s2);
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          if (input.charCodeAt(peg$currPos) === 92) {
                            s1 = peg$c9;
                            peg$currPos++;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$e22); }
                          }
                          if (s1 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 45) {
                              s2 = peg$c14;
                              peg$currPos++;
                            } else {
                              s2 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$e27); }
                            }
                            if (s2 !== peg$FAILED) {
                              s0 = peg$f33(s2);
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 92) {
                              s1 = peg$c9;
                              peg$currPos++;
                            } else {
                              s1 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$e22); }
                            }
                            if (s1 !== peg$FAILED) {
                              if (input.charCodeAt(peg$currPos) === 58) {
                                s2 = peg$c7;
                                peg$currPos++;
                              } else {
                                s2 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$e13); }
                              }
                              if (s2 !== peg$FAILED) {
                                s0 = peg$f34(s2);
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              if (input.charCodeAt(peg$currPos) === 92) {
                                s1 = peg$c9;
                                peg$currPos++;
                              } else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$e22); }
                              }
                              if (s1 !== peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 47) {
                                  s2 = peg$c15;
                                  peg$currPos++;
                                } else {
                                  s2 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$e28); }
                                }
                                if (s2 !== peg$FAILED) {
                                  s0 = peg$f35(s2);
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e21); }
        }

        return s0;
      }

      function peg$parseTextChar() {
        var s0, s1;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseEscaped();
        if (s1 !== peg$FAILED) {
          s1 = peg$f36(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (peg$r5.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e30); }
          }
          if (s1 !== peg$FAILED) {
            s1 = peg$f37(s1);
          }
          s0 = s1;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e29); }
        }

        return s0;
      }

      function peg$parseAssocStartPart() {
        var s0, s1, s2;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseEscaped();
        if (s1 !== peg$FAILED) {
          s1 = peg$f38(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = [];
          if (peg$r6.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e32); }
          }
          if (s2 !== peg$FAILED) {
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              if (peg$r6.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e32); }
              }
            }
          } else {
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            if (peg$r7.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e33); }
            }
            if (s2 !== peg$FAILED) {
              s0 = peg$f39(s1, s2);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = [];
            if (peg$r6.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e32); }
            }
            if (s2 !== peg$FAILED) {
              while (s2 !== peg$FAILED) {
                s1.push(s2);
                if (peg$r6.test(input.charAt(peg$currPos))) {
                  s2 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$e32); }
                }
              }
            } else {
              s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseEscaped();
              if (s2 !== peg$FAILED) {
                s0 = peg$f40(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = [];
              if (peg$r8.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e34); }
              }
              if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                  s1.push(s2);
                  if (peg$r8.test(input.charAt(peg$currPos))) {
                    s2 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$e34); }
                  }
                }
              } else {
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s1 = peg$f41(s1);
              }
              s0 = s1;
            }
          }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e31); }
        }

        return s0;
      }

      function peg$parseAssocEndPart() {
        var s0, s1, s2, s3;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseEscaped();
        if (s1 !== peg$FAILED) {
          s1 = peg$f42(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (peg$r7.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e33); }
          }
          if (s1 !== peg$FAILED) {
            s2 = [];
            if (peg$r6.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e32); }
            }
            if (s3 !== peg$FAILED) {
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                if (peg$r6.test(input.charAt(peg$currPos))) {
                  s3 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$e32); }
                }
              }
            } else {
              s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
              s0 = peg$f43(s1, s2);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseEscaped();
            if (s1 !== peg$FAILED) {
              s2 = [];
              if (peg$r6.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e32); }
              }
              if (s3 !== peg$FAILED) {
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  if (peg$r6.test(input.charAt(peg$currPos))) {
                    s3 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$e32); }
                  }
                }
              } else {
                s2 = peg$FAILED;
              }
              if (s2 !== peg$FAILED) {
                s0 = peg$f44(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = [];
              if (peg$r7.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e33); }
              }
              if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                  s1.push(s2);
                  if (peg$r7.test(input.charAt(peg$currPos))) {
                    s2 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$e33); }
                  }
                }
              } else {
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s1 = peg$f45(s1);
              }
              s0 = s1;
            }
          }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e35); }
        }

        return s0;
      }

      function peg$parseAssocStartLabel() {
        var s0, s1, s2;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseAssocStartPart();
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseAssocStartPart();
          }
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s1 = peg$f46(s1);
        }
        s0 = s1;
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e36); }
        }

        return s0;
      }

      function peg$parseAssocEndLabel() {
        var s0, s1, s2;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseAssocEndPart();
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseAssocEndPart();
          }
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s1 = peg$f47(s1);
        }
        s0 = s1;
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e37); }
        }

        return s0;
      }

      function peg$parseAssoc() {
        var s0, s1, s2, s3;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseAssocStartLabel();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseArrow();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseAssocEndLabel();
            if (s3 !== peg$FAILED) {
              s0 = peg$f48(s1, s2, s3);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseAssocStartLabel();
          if (s1 !== peg$FAILED) {
            s2 = peg$parseArrow();
            if (s2 !== peg$FAILED) {
              s0 = peg$f49(s1, s2);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseArrow();
            if (s1 !== peg$FAILED) {
              s2 = peg$parseAssocEndLabel();
              if (s2 !== peg$FAILED) {
                s0 = peg$f50(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parseArrow();
              if (s1 !== peg$FAILED) {
                s1 = peg$f51(s1);
              }
              s0 = s1;
            }
          }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e38); }
        }

        return s0;
      }

      function peg$parseArrowStart() {
        var s0, s1;

        peg$silentFails++;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c16) {
          s1 = peg$c16;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e40); }
        }
        if (s1 !== peg$FAILED) {
          s1 = peg$f52(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 40) {
            s1 = peg$c12;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e25); }
          }
          if (s1 !== peg$FAILED) {
            s1 = peg$f53(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c17) {
              s1 = peg$c17;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e41); }
            }
            if (s1 !== peg$FAILED) {
              s1 = peg$f54(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 111) {
                s1 = peg$c18;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e42); }
              }
              if (s1 !== peg$FAILED) {
                s1 = peg$f55(s1);
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 43) {
                  s1 = peg$c19;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$e43); }
                }
                if (s1 !== peg$FAILED) {
                  s1 = peg$f56(s1);
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 2) === peg$c20) {
                    s1 = peg$c20;
                    peg$currPos += 2;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$e44); }
                  }
                  if (s1 !== peg$FAILED) {
                    s1 = peg$f57(s1);
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 60) {
                      s1 = peg$c11;
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$e24); }
                    }
                    if (s1 !== peg$FAILED) {
                      s1 = peg$f58(s1);
                    }
                    s0 = s1;
                  }
                }
              }
            }
          }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e39); }
        }

        return s0;
      }

      function peg$parseArrowTrunk() {
        var s0, s1;

        peg$silentFails++;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c21) {
          s1 = peg$c21;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e46); }
        }
        if (s1 !== peg$FAILED) {
          s1 = peg$f59(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 3) === peg$c22) {
            s1 = peg$c22;
            peg$currPos += 3;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e47); }
          }
          if (s1 !== peg$FAILED) {
            s1 = peg$f60(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 45) {
              s1 = peg$c14;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e27); }
            }
            if (s1 !== peg$FAILED) {
              s1 = peg$f61(s1);
            }
            s0 = s1;
          }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e45); }
        }

        return s0;
      }

      function peg$parseArrowEnd() {
        var s0, s1;

        peg$silentFails++;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c23) {
          s1 = peg$c23;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e49); }
        }
        if (s1 !== peg$FAILED) {
          s1 = peg$f62(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 111) {
            s1 = peg$c18;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e42); }
          }
          if (s1 !== peg$FAILED) {
            s1 = peg$f63(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c24) {
              s1 = peg$c24;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e50); }
            }
            if (s1 !== peg$FAILED) {
              s1 = peg$f64(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 62) {
                s1 = peg$c2;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e6); }
              }
              if (s1 !== peg$FAILED) {
                s1 = peg$f65(s1);
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 41) {
                  s1 = peg$c13;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$e26); }
                }
                if (s1 !== peg$FAILED) {
                  s1 = peg$f66(s1);
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 43) {
                    s1 = peg$c19;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$e43); }
                  }
                  if (s1 !== peg$FAILED) {
                    s1 = peg$f67(s1);
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 2) === peg$c25) {
                      s1 = peg$c25;
                      peg$currPos += 2;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$e51); }
                    }
                    if (s1 !== peg$FAILED) {
                      s1 = peg$f68(s1);
                    }
                    s0 = s1;
                  }
                }
              }
            }
          }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e48); }
        }

        return s0;
      }

      function peg$parseArrow() {
        var s0, s1, s2, s3;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseArrowStart();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseArrowTrunk();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseArrowEnd();
            if (s3 !== peg$FAILED) {
              s0 = peg$f69(s1, s2, s3);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseArrowStart();
          if (s1 !== peg$FAILED) {
            s2 = peg$parseArrowTrunk();
            if (s2 !== peg$FAILED) {
              s0 = peg$f70(s1, s2);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseArrowTrunk();
            if (s1 !== peg$FAILED) {
              s2 = peg$parseArrowEnd();
              if (s2 !== peg$FAILED) {
                s0 = peg$f71(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parseArrowTrunk();
              if (s1 !== peg$FAILED) {
                s1 = peg$f72(s1);
              }
              s0 = s1;
            }
          }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e52); }
        }

        return s0;
      }

      function peg$parseIdent() {
        var s0, s1, s2;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = [];
        if (peg$r9.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e54); }
        }
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            if (peg$r9.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e54); }
            }
          }
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s1 = peg$f73(s1);
        }
        s0 = s1;
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e53); }
        }

        return s0;
      }

      function peg$parse_() {
        var s0, s1;

        peg$silentFails++;
        s0 = [];
        if (peg$r10.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e56); }
        }
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          if (peg$r10.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e56); }
          }
        }
        peg$silentFails--;
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e55); }

        return s0;
      }

      peg$result = peg$startRuleFunction();

      if (peg$result !== peg$FAILED && peg$currPos === input.length) {
        return peg$result;
      } else {
        if (peg$result !== peg$FAILED && peg$currPos < input.length) {
          peg$fail(peg$endExpectation());
        }

        throw peg$buildStructuredError(
          peg$maxFailExpected,
          peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
          peg$maxFailPos < input.length
            ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
            : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
        );
      }
    }

    var coreParser = {
      SyntaxError: peg$SyntaxError,
      parse: peg$parse
    };

    function parse(source) {
        const withoutComments = source.replace(/\/\/[^\n]*/g, '');
        if (withoutComments.trim() === '')
            return {
                root: { nodes: [], assocs: [], lines: [], directives: [] },
                config: getConfig([]),
            };
        const graph = coreParser.parse(withoutComments);
        return { root: graph, config: getConfig(graph.directives) };
        function directionToDagre(word) {
            if (word == 'down')
                return 'TB';
            if (word == 'right')
                return 'LR';
            else
                return 'TB';
        }
        function parseRanker(word) {
            if (word == 'network-simplex' || word == 'tight-tree' || word == 'longest-path') {
                return word;
            }
            return 'network-simplex';
        }
        function parseCustomStyle(styleDef) {
            var contains = hasSubstring;
            var floatingKeywords = styleDef.replace(/[a-z]*=[^ ]+/g, '');
            var titleDef = last(styleDef.match('title=([^ ]*)') || ['']);
            var bodyDef = last(styleDef.match('body=([^ ]*)') || ['']);
            return {
                title: {
                    bold: contains(titleDef, 'bold') || contains(floatingKeywords, 'bold'),
                    underline: contains(titleDef, 'underline') || contains(floatingKeywords, 'underline'),
                    italic: contains(titleDef, 'italic') || contains(floatingKeywords, 'italic'),
                    center: !(contains(titleDef, 'left') || contains(styleDef, 'align=left')),
                },
                body: {
                    bold: contains(bodyDef, 'bold'),
                    underline: contains(bodyDef, 'underline'),
                    italic: contains(bodyDef, 'italic'),
                    center: contains(bodyDef, 'center'),
                },
                dashed: contains(styleDef, 'dashed'),
                fill: last(styleDef.match('fill=([^ ]*)') || []),
                stroke: last(styleDef.match('stroke=([^ ]*)') || []),
                visual: (last(styleDef.match('visual=([^ ]*)') || []) || 'class'),
                direction: directionToDagre(last(styleDef.match('direction=([^ ]*)') || [])),
            };
        }
        function getConfig(directives) {
            var _a;
            var d = Object.fromEntries(directives.map((e) => [e.key, e.value]));
            var userStyles = {};
            for (var key in d) {
                if (key[0] != '.')
                    continue;
                var styleDef = d[key];
                userStyles[key.substring(1)] = parseCustomStyle(styleDef);
            }
            return {
                arrowSize: +d.arrowSize || 1,
                bendSize: +d.bendSize || 0.3,
                direction: directionToDagre(d.direction),
                gutter: +d.gutter || 20,
                edgeMargin: +d.edgeMargin || 0,
                gravity: +((_a = d.gravity) !== null && _a !== void 0 ? _a : 1),
                edges: d.edges == 'hard' ? 'hard' : 'rounded',
                fill: (d.fill || '#eee8d5;#fdf6e3;#eee8d5;#fdf6e3').split(';'),
                background: d.background || 'transparent',
                fillArrows: d.fillArrows === 'true',
                font: d.font || 'Helvetica',
                fontSize: +d.fontSize || 12,
                leading: +d.leading || 1.25,
                lineWidth: +d.lineWidth || 3,
                padding: +d.padding || 8,
                spacing: +d.spacing || 40,
                stroke: d.stroke || '#33322E',
                title: d.title || '',
                zoom: +d.zoom || 1,
                acyclicer: d.acyclicer === 'greedy' ? 'greedy' : undefined,
                ranker: parseRanker(d.ranker),
                styles: Object.assign(Object.assign({}, styles), userStyles),
            };
        }
    }

    function add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y };
    }
    function diff(a, b) {
        return { x: a.x - b.x, y: a.y - b.y };
    }
    function mult(v, factor) {
        return { x: factor * v.x, y: factor * v.y };
    }
    function mag(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }
    function normalize(v) {
        return mult(v, 1 / mag(v));
    }
    function rot(a) {
        return { x: a.y, y: -a.x };
    }

    const empty = false;
    const filled = true;
    function getPath(config, r) {
        var path = r.path.slice(1, -1);
        var endDir = normalize(diff(path[path.length - 2], last(path)));
        var startDir = normalize(diff(path[1], path[0]));
        var size = (config.spacing * config.arrowSize) / 30;
        var head = 0;
        var end = path.length - 1;
        var copy = path.map((p) => ({ x: p.x, y: p.y }));
        var tokens = r.type.split(/[-_]/);
        copy[head] = add(copy[head], mult(startDir, size * terminatorSize(tokens[0])));
        copy[end] = add(copy[end], mult(endDir, size * terminatorSize(last(tokens))));
        return copy;
    }
    function terminatorSize(id) {
        if (id === '>' || id === '<')
            return 5;
        if (id === ':>' || id === '<:')
            return 10;
        if (id === '+')
            return 14;
        if (id === 'o')
            return 14;
        if (id === '(' || id === ')')
            return 11;
        if (id === '(o' || id === 'o)')
            return 11;
        if (id === '>o' || id === 'o<')
            return 15;
        return 0;
    }
    function drawTerminators(g, config, r) {
        var start = r.path[1];
        var end = r.path[r.path.length - 2];
        var path = r.path.slice(1, -1);
        var tokens = r.type.split(/[-_]/);
        drawArrowEnd(last(tokens), path, end);
        drawArrowEnd(tokens[0], path.reverse(), start);
        function drawArrowEnd(id, path, end) {
            var dir = normalize(diff(path[path.length - 2], last(path)));
            var size = (config.spacing * config.arrowSize) / 30;
            if (id === '>' || id === '<')
                drawArrow(dir, size, filled, end);
            else if (id === ':>' || id === '<:')
                drawArrow(dir, size, empty, end);
            else if (id === '+')
                drawDiamond(dir, size, filled, end);
            else if (id === 'o')
                drawDiamond(dir, size, empty, end);
            else if (id === '(' || id === ')') {
                drawSocket(dir, size, 11, end);
                drawStem(dir, size, 5, end);
            }
            else if (id === '(o' || id === 'o)') {
                drawSocket(dir, size, 11, end);
                drawStem(dir, size, 5, end);
                drawBall(dir, size, 11, end);
            }
            else if (id === '>o' || id === 'o<') {
                drawArrow(dir, size * 0.75, empty, add(end, mult(dir, size * 10)));
                drawStem(dir, size, 8, end);
                drawBall(dir, size, 8, end);
            }
        }
        function drawBall(nv, size, stem, end) {
            var center = add(end, mult(nv, size * stem));
            g.fillStyle(config.fill[0]);
            g.ellipse(center, size * 6, size * 6).fillAndStroke();
        }
        function drawStem(nv, size, stem, end) {
            var center = add(end, mult(nv, size * stem));
            g.path([center, end]).stroke();
        }
        function drawSocket(nv, size, stem, end) {
            var base = add(end, mult(nv, size * stem));
            var t = rot(nv);
            var socket = range([-Math.PI / 2, Math.PI / 2], 12).map((a) => add(base, add(mult(nv, -6 * size * Math.cos(a)), mult(t, 6 * size * Math.sin(a)))));
            g.path(socket).stroke();
        }
        function drawArrow(nv, size, isOpen, end) {
            const x = (s) => add(end, mult(nv, s * size));
            const y = (s) => mult(rot(nv), s * size);
            var arrow = [add(x(10), y(4)), x(isOpen && !config.fillArrows ? 5 : 10), add(x(10), y(-4)), end];
            g.fillStyle(isOpen ? config.stroke : config.fill[0]);
            g.circuit(arrow).fillAndStroke();
        }
        function drawDiamond(nv, size, isOpen, end) {
            const x = (s) => add(end, mult(nv, s * size));
            const y = (s) => mult(rot(nv), s * size);
            var arrow = [add(x(7), y(4)), x(14), add(x(7), y(-4)), end];
            g.save();
            g.fillStyle(isOpen ? config.stroke : config.fill[0]);
            g.circuit(arrow).fillAndStroke();
            g.restore();
        }
    }

    function render(graphics, config, compartment) {
        var g = graphics;
        function renderCompartment(compartment, color, style, level) {
            g.save();
            g.translate(compartment.offset.x, compartment.offset.y);
            g.fillStyle(color || config.stroke);
            compartment.lines.forEach((text, i) => {
                g.textAlign(style.center ? 'center' : 'left');
                var x = style.center ? compartment.width / 2 - config.padding : 0;
                var y = (0.5 + (i + 0.5) * config.leading) * config.fontSize;
                if (text) {
                    g.fillText(text, x, y);
                }
                if (style.underline) {
                    var w = g.measureText(text).width;
                    y += Math.round(config.fontSize * 0.2) + 0.5;
                    if (style.center) {
                        g.path([
                            { x: x - w / 2, y: y },
                            { x: x + w / 2, y: y },
                        ]).stroke();
                    }
                    else {
                        g.path([
                            { x: x, y: y },
                            { x: x + w, y: y },
                        ]).stroke();
                    }
                    g.lineWidth(config.lineWidth);
                }
            });
            g.save();
            g.translate(config.gutter, config.gutter);
            compartment.assocs.forEach((r) => renderRelation(r));
            compartment.nodes.forEach((n) => renderNode(n, level));
            g.restore();
            g.restore();
        }
        function renderNode(node, level) {
            var x = node.x - node.width / 2;
            var y = node.y - node.height / 2;
            var style = config.styles[node.type] || styles.class;
            g.save();
            g.setData('name', node.id);
            g.save();
            g.fillStyle(style.fill || config.fill[level] || last(config.fill));
            g.strokeStyle(style.stroke || config.stroke);
            if (style.dashed) {
                var dash = Math.max(4, 2 * config.lineWidth);
                g.setLineDash([dash, dash]);
            }
            var drawNode = visualizers[style.visual] || visualizers.class;
            drawNode(node, x, y, config, g);
            for (var divider of node.dividers) {
                g.path(divider.map((e) => add(e, { x, y }))).stroke();
            }
            g.restore();
            node.parts.forEach((part, i) => {
                var textStyle = i == 0 ? style.title : style.body;
                g.save();
                g.translate(x + part.x, y + part.y);
                g.setFont(config.font, config.fontSize, textStyle.bold ? 'bold' : 'normal', textStyle.italic ? 'italic' : 'normal');
                renderCompartment(part, style.stroke, textStyle, level + 1);
                g.restore();
            });
            g.restore();
        }
        function strokePath(p) {
            if (config.edges === 'rounded') {
                var radius = config.spacing * config.bendSize;
                g.beginPath();
                g.moveTo(p[0].x, p[0].y);
                for (var i = 1; i < p.length - 1; i++) {
                    g.arcTo(p[i].x, p[i].y, p[i + 1].x, p[i + 1].y, radius);
                }
                g.lineTo(last(p).x, last(p).y);
                g.stroke();
            }
            else
                g.path(p).stroke();
        }
        function renderLabel(label) {
            if (!label || !label.text)
                return;
            var fontSize = config.fontSize;
            var lines = label.text.split('`');
            lines.forEach((l, i) => g.fillText(l, label.x, label.y + fontSize * (i + 1)));
        }
        function renderRelation(r) {
            var path = getPath(config, r);
            g.fillStyle(config.stroke);
            g.setFont(config.font, config.fontSize, 'normal', 'normal');
            renderLabel(r.startLabel);
            renderLabel(r.endLabel);
            if (r.type !== '-/-' && r.type !== '_/_') {
                if (hasSubstring(r.type, '--') || hasSubstring(r.type, '__')) {
                    var dash = Math.max(4, 2 * config.lineWidth);
                    g.save();
                    g.setLineDash([dash, dash]);
                    strokePath(path);
                    g.restore();
                }
                else
                    strokePath(path);
            }
            drawTerminators(g, config, r);
        }
        function setBackground() {
            g.clear();
            g.save();
            g.strokeStyle('transparent');
            g.fillStyle(config.background);
            g.rect(0, 0, compartment.width, compartment.height).fill();
            g.restore();
        }
        g.save();
        g.scale(config.zoom, config.zoom);
        setBackground();
        g.setFont(config.font, config.fontSize, 'bold', 'normal');
        g.lineWidth(config.lineWidth);
        g.lineJoin('round');
        g.lineCap('round');
        g.strokeStyle(config.stroke);
        renderCompartment(compartment, undefined, buildStyle({}, {}).title, 0);
        g.restore();
    }

    function GraphicsCanvas(canvas, callbacks) {
        var ctx = canvas.getContext('2d');
        var mousePos = { x: 0, y: 0 };
        var twopi = 2 * 3.1416;
        function mouseEventToPos(event) {
            var e = canvas;
            return {
                x: event.clientX - e.getBoundingClientRect().left - e.clientLeft + e.scrollLeft,
                y: event.clientY - e.getBoundingClientRect().top - e.clientTop + e.scrollTop,
            };
        }
        if (callbacks) {
            canvas.addEventListener('mousedown', function (event) {
                if (callbacks.mousedown)
                    callbacks.mousedown(mouseEventToPos(event));
            });
            canvas.addEventListener('mouseup', function (event) {
                if (callbacks.mouseup)
                    callbacks.mouseup(mouseEventToPos(event));
            });
            canvas.addEventListener('mousemove', function (event) {
                mousePos = mouseEventToPos(event);
                if (callbacks.mousemove)
                    callbacks.mousemove(mouseEventToPos(event));
            });
        }
        var chainable = {
            stroke: function () {
                ctx.stroke();
                return chainable;
            },
            fill: function () {
                ctx.fill();
                return chainable;
            },
            fillAndStroke: function () {
                ctx.fill();
                ctx.stroke();
                return chainable;
            },
        };
        function tracePath(path, offset, s) {
            s = s === undefined ? 1 : s;
            offset = offset || { x: 0, y: 0 };
            ctx.beginPath();
            ctx.moveTo(offset.x + s * path[0].x, offset.y + s * path[0].y);
            for (var i = 1, len = path.length; i < len; i++)
                ctx.lineTo(offset.x + s * path[i].x, offset.y + s * path[i].y);
            return chainable;
        }
        return {
            mousePos: function () {
                return mousePos;
            },
            width: function () {
                return canvas.width;
            },
            height: function () {
                return canvas.height;
            },
            clear: function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            },
            circle: function (p, r) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, r, 0, twopi);
                return chainable;
            },
            ellipse: function (center, rx, ry, start, stop) {
                if (start === undefined)
                    start = 0;
                if (stop === undefined)
                    stop = twopi;
                ctx.beginPath();
                ctx.save();
                ctx.translate(center.x, center.y);
                ctx.scale(1, ry / rx);
                ctx.arc(0, 0, rx / 2, start, stop);
                ctx.restore();
                return chainable;
            },
            arc: function (x, y, r, start, stop) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.arc(x, y, r, start, stop);
                return chainable;
            },
            roundRect: function (x, y, w, h, r) {
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                return chainable;
            },
            rect: function (x, y, w, h) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + w, y);
                ctx.lineTo(x + w, y + h);
                ctx.lineTo(x, y + h);
                ctx.closePath();
                return chainable;
            },
            path: tracePath,
            circuit: function (path, offset, s) {
                tracePath(path, offset, s);
                ctx.closePath();
                return chainable;
            },
            setFont: function (family, size, weight, style) {
                ctx.font = `${weight} ${style} ${size}pt ${family}, Helvetica, sans-serif`;
            },
            fillStyle: function (s) {
                ctx.fillStyle = s;
            },
            strokeStyle: function (s) {
                ctx.strokeStyle = s;
            },
            textAlign: function (a) {
                ctx.textAlign = a;
            },
            lineCap: function (cap) {
                ctx.lineCap = cap;
            },
            lineJoin: function (join) {
                ctx.lineJoin = join;
            },
            lineWidth: function (w) {
                ctx.lineWidth = w;
            },
            arcTo: function () {
                return ctx.arcTo.apply(ctx, arguments);
            },
            beginPath: function () {
                return ctx.beginPath.apply(ctx, arguments);
            },
            fillText: function () {
                return ctx.fillText.apply(ctx, arguments);
            },
            lineTo: function () {
                return ctx.lineTo.apply(ctx, arguments);
            },
            measureText: function () {
                return ctx.measureText.apply(ctx, arguments);
            },
            moveTo: function () {
                return ctx.moveTo.apply(ctx, arguments);
            },
            restore: function () {
                return ctx.restore.apply(ctx, arguments);
            },
            setData: function (name, value) { },
            save: function () {
                return ctx.save.apply(ctx, arguments);
            },
            scale: function () {
                return ctx.scale.apply(ctx, arguments);
            },
            setLineDash: function () {
                return ctx.setLineDash.apply(ctx, arguments);
            },
            stroke: function () {
                return ctx.stroke.apply(ctx, arguments);
            },
            translate: function () {
                return ctx.translate.apply(ctx, arguments);
            },
        };
    }

    function toAttrString(obj) {
        return Object.entries(obj)
            .filter(([_, val]) => val !== undefined)
            .map(([key, val]) => `${key}="${xmlEncode(val)}"`)
            .join(' ');
    }
    function xmlEncode(str) {
        if ('number' === typeof str)
            return str.toFixed(1);
        return (str !== null && str !== void 0 ? str : '')
            .toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    var charWidths = { "0": 10, "1": 10, "2": 10, "3": 10, "4": 10, "5": 10, "6": 10, "7": 10, "8": 10, "9": 10, " ": 5, "!": 5, "\"": 6, "#": 10, "$": 10, "%": 15, "&": 11, "'": 4, "(": 6, ")": 6, "*": 7, "+": 10, ",": 5, "-": 6, ".": 5, "/": 5, ":": 5, ";": 5, "<": 10, "=": 10, ">": 10, "?": 10, "@": 17, "A": 11, "B": 11, "C": 12, "D": 12, "E": 11, "F": 10, "G": 13, "H": 12, "I": 5, "J": 9, "K": 11, "L": 10, "M": 14, "N": 12, "O": 13, "P": 11, "Q": 13, "R": 12, "S": 11, "T": 10, "U": 12, "V": 11, "W": 16, "X": 11, "Y": 11, "Z": 10, "[": 5, "\\": 5, "]": 5, "^": 8, "_": 10, "`": 6, "a": 10, "b": 10, "c": 9, "d": 10, "e": 10, "f": 5, "g": 10, "h": 10, "i": 4, "j": 4, "k": 9, "l": 4, "m": 14, "n": 10, "o": 10, "p": 10, "q": 10, "r": 6, "s": 9, "t": 5, "u": 10, "v": 9, "w": 12, "x": 9, "y": 9, "z": 9, "{": 6, "|": 5, "}": 6, "~": 10 };
    function GraphicsSvg(document) {
        var initialState = {
            stroke: undefined,
            'stroke-width': 1,
            'stroke-dasharray': undefined,
            'stroke-linecap': undefined,
            'stroke-linejoin': undefined,
            'text-align': 'left',
            font: '12pt Helvetica, Arial, sans-serif',
            'font-size': '12pt',
        };
        var measurementCanvas = document
            ? document.createElement('canvas')
            : null;
        var ctx = measurementCanvas ? measurementCanvas.getContext('2d') : null;
        class Element {
            constructor(name, attr, parent, text) {
                this.elideEmpty = false;
                this.name = name;
                this.attr = attr;
                this.parent = parent;
                this.children = [];
                this.text = text || undefined;
            }
            stroke() {
                this.attr.fill = 'none';
                return this;
            }
            fill() {
                this.attr.stroke = 'none';
                return this;
            }
            fillAndStroke() {
                return this;
            }
            group() {
                return this.parent;
            }
            serialize() {
                var _a;
                const data = (_a = getDefined(this.group(), (e) => e.data)) !== null && _a !== void 0 ? _a : {};
                const attrs = toAttrString(Object.assign(Object.assign({}, this.attr), data));
                const content = this.children.map((o) => o.serialize()).join('\n');
                if (this.text && this.children.length === 0)
                    return `<${this.name} ${attrs}>${xmlEncode(this.text)}</${this.name}>`;
                else if (this.children.length === 0)
                    return this.elideEmpty ? '' : `<${this.name} ${attrs}></${this.name}>`;
                else
                    return `<${this.name} ${attrs}>
	${content.replace(/\n/g, '\n\t')}
</${this.name}>`;
            }
        }
        function getDefined(group, getter) {
            var _a, _b;
            if (!group)
                return getter(syntheticRoot);
            return (_b = (_a = getter(group)) !== null && _a !== void 0 ? _a : getDefined(group.parent, getter)) !== null && _b !== void 0 ? _b : getter(syntheticRoot);
        }
        class GroupElement extends Element {
            constructor(parent) {
                super('g', {}, parent);
                this.elideEmpty = true;
            }
            group() {
                return this;
            }
        }
        const syntheticRoot = new GroupElement({});
        syntheticRoot.attr = initialState;
        var root = new Element('svg', {
            version: '1.1',
            baseProfile: 'full',
            xmlns: 'http://www.w3.org/2000/svg',
            'xmlns:xlink': 'http://www.w3.org/1999/xlink',
            'xmlns:ev': 'http://www.w3.org/2001/xml-events',
        }, undefined);
        var current = new GroupElement(root);
        current.attr = initialState;
        root.children.push(current);
        var inPathBuilderMode = false;
        function tracePath(path, offset = { x: 0, y: 0 }, s = 1) {
            var d = path
                .map((e, i) => (i ? 'L' : 'M') + (offset.x + s * e.x).toFixed(1) + ' ' + (offset.y + s * e.y).toFixed(1))
                .join(' ');
            return el('path', { d: d });
        }
        function el(type, attr, text) {
            var element = new Element(type, attr, current, text);
            current.children.push(element);
            return element;
        }
        return {
            width: function () {
                return 0;
            },
            height: function () {
                return 0;
            },
            clear: function () { },
            circle: function (p, r) {
                return el('circle', { r: r, cx: p.x, cy: p.y });
            },
            ellipse: function (center, w, h, start = 0, stop = 0) {
                if (start || stop) {
                    var path = range([start, stop], 64).map((a) => add(center, { x: (Math.cos(a) * w) / 2, y: (Math.sin(a) * h) / 2 }));
                    return tracePath(path);
                }
                else {
                    return el('ellipse', { cx: center.x, cy: center.y, rx: w / 2, ry: h / 2 });
                }
            },
            arc: function (cx, cy, r) {
                return el('ellipse', { cx, cy, rx: r, ry: r });
            },
            roundRect: function (x, y, width, height, r) {
                return el('rect', { x, y, rx: r, ry: r, height, width });
            },
            rect: function (x, y, width, height) {
                return el('rect', { x, y, height, width });
            },
            path: tracePath,
            circuit: function (path, offset, s) {
                var element = tracePath(path, offset, s);
                element.attr.d += ' Z';
                return element;
            },
            setFont: function (family, size, weight, style) {
                current.attr['font-family'] = family;
                current.attr['font-size'] = size + 'pt';
                current.attr['font-weight'] = weight;
                current.attr['font-style'] = style;
            },
            strokeStyle: function (stroke) {
                current.attr.stroke = stroke;
            },
            fillStyle: function (fill) {
                current.attr.fill = fill;
            },
            arcTo: function (x1, y1, x2, y2) {
                if (inPathBuilderMode)
                    last(current.children).attr.d += 'L' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + ' ';
                else
                    throw new Error('can only be called after .beginPath()');
            },
            beginPath: function () {
                inPathBuilderMode = true;
                return el('path', { d: '' });
            },
            fillText: function (text, x, y) {
                return el('text', {
                    x,
                    y,
                    stroke: 'none',
                    font: undefined,
                    style: undefined,
                    'text-anchor': getDefined(current, (e) => e.attr['text-align']) === 'center' ? 'middle' : undefined,
                }, text);
            },
            lineCap: function (cap) {
                current.attr['stroke-linecap'] = cap;
            },
            lineJoin: function (join) {
                current.attr['stroke-linejoin'] = join;
            },
            lineTo: function (x, y) {
                if (inPathBuilderMode)
                    last(current.children).attr.d += 'L' + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
                else
                    throw new Error('can only be called after .beginPath()');
                return current;
            },
            lineWidth: function (w) {
                current.attr['stroke-width'] = w;
            },
            measureText: function (s) {
                if (ctx) {
                    if (current)
                        ctx.font = `${getDefined(current, (e) => e.attr['font-weight'])} ${getDefined(current, (e) => e.attr['font-style'])} ${getDefined(current, (e) => e.attr['font-size'])} ${getDefined(current, (e) => e.attr['font-family'])}`;
                    else
                        ctx.font = `${initialState['font-weight']} ${initialState['font-style']} ${initialState['font-size']} ${initialState['font-family']}`;
                    return ctx.measureText(s);
                }
                else {
                    return {
                        width: sum(s, function (c) {
                            var _a, _b;
                            const size = (_a = getDefined(current, (e) => e.attr['font-size'])) !== null && _a !== void 0 ? _a : 12;
                            var scale = parseInt(size.toString()) / 12;
                            return ((_b = charWidths[c]) !== null && _b !== void 0 ? _b : 16) * scale;
                        }),
                    };
                }
            },
            moveTo: function (x, y) {
                if (inPathBuilderMode)
                    last(current.children).attr.d += 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
                else
                    throw new Error('can only be called after .beginPath()');
            },
            restore: function () {
                if (current.parent)
                    current = current.parent;
            },
            save: function () {
                var node = new GroupElement(current);
                current.children.push(node);
                current = node;
            },
            setData: function (name, value) {
                var _a;
                current.data = (_a = current.data) !== null && _a !== void 0 ? _a : {};
                current.data['data-' + name] = value;
            },
            scale: function () { },
            setLineDash: function (d) {
                current.attr['stroke-dasharray'] = d.length === 0 ? 'none' : d[0] + ' ' + d[1];
            },
            stroke: function () {
                inPathBuilderMode = false;
                last(current.children).stroke();
            },
            textAlign: function (a) {
                current.attr['text-align'] = a;
            },
            translate: function (dx, dy) {
                if (Number.isNaN(dx) || Number.isNaN(dy)) {
                    throw new Error('dx and dy must be real numbers');
                }
                current.attr.transform = `translate(${dx}, ${dy})`;
            },
            serialize: function (size, desc, title) {
                if (desc) {
                    root.children.unshift(new Element('desc', {}, undefined, desc));
                }
                if (title) {
                    root.children.unshift(new Element('title', {}, undefined, title));
                }
                root.attr = {
                    version: '1.1',
                    baseProfile: 'full',
                    width: size.width,
                    height: size.height,
                    viewbox: '0 0 ' + size.width + ' ' + size.height,
                    xmlns: 'http://www.w3.org/2000/svg',
                    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                    'xmlns:ev': 'http://www.w3.org/2001/xml-events',
                };
                return root.serialize();
            },
        };
    }

    function fitCanvasSize(canvas, rect, zoom) {
        canvas.width = rect.width * zoom;
        canvas.height = rect.height * zoom;
    }
    function createMeasurer(config, graphics) {
        return {
            setFont(family, size, weight, style) {
                graphics.setFont(family, size, weight, style);
            },
            textWidth(s) {
                return graphics.measureText(s).width;
            },
            textHeight() {
                return config.leading * config.fontSize;
            },
        };
    }
    function parseAndRender(code, graphics, canvas, scale) {
        var parsedDiagram = parse(code);
        var config = parsedDiagram.config;
        var measurer = createMeasurer(config, graphics);
        var graphLayout = layout(measurer, config, parsedDiagram.root);
        if (canvas) {
            fitCanvasSize(canvas, graphLayout, config.zoom * scale);
        }
        config.zoom *= scale;
        render(graphics, config, graphLayout);
        return { config: config, layout: graphLayout };
    }
    function draw(canvas, code, scale) {
        return parseAndRender(code, GraphicsCanvas(canvas), canvas, scale || 1);
    }
    function renderSvg(code, document) {
        var skCanvas = GraphicsSvg(document);
        var { config, layout } = parseAndRender(code, skCanvas, null, 1);
        return skCanvas.serialize({
            width: layout.width,
            height: layout.height,
        }, code, config.title);
    }
    class ImportDepthError extends Error {
        constructor() {
            super('max_import_depth exceeded');
        }
    }
    function processAsyncImports(source, loadFile, maxImportDepth = 10) {
        return __awaiter(this, void 0, void 0, function* () {
            if (maxImportDepth == -1) {
                throw new ImportDepthError();
            }
            function lenientLoadFile(key) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        return (yield loadFile(key)) || '';
                    }
                    catch (e) {
                        return '';
                    }
                });
            }
            var imports = [];
            source.replace(/#import: *(.*)/g, (a, file) => {
                var promise = lenientLoadFile(file).then((contents) => processAsyncImports(contents, loadFile, maxImportDepth - 1));
                imports.push({ file, promise });
                return '';
            });
            var imported = {};
            for (var imp of imports) {
                imported[imp.file] = yield imp.promise;
            }
            return source.replace(/#import: *(.*)/g, (a, file) => imported[file]);
        });
    }
    function processImports(source, loadFile, maxImportDepth = 10) {
        if (maxImportDepth == -1) {
            throw new ImportDepthError();
        }
        function lenientLoadFile(key) {
            try {
                return loadFile(key) || '';
            }
            catch (e) {
                return '';
            }
        }
        return source.replace(/#import: *(.*)/g, (a, file) => processImports(lenientLoadFile(file), loadFile, maxImportDepth - 1));
    }
    function compileFile(filepath, maxImportDepth) {
        var fs = require('fs');
        var path = require('path');
        var directory = path.dirname(filepath);
        var rootFileName = filepath.substr(directory.length);
        function loadFile(filename) {
            return fs.readFileSync(path.join(directory, filename), { encoding: 'utf8' });
        }
        return processImports(loadFile(rootFileName), loadFile, maxImportDepth);
    }

    var version = '1.5.3';

    exports.ImportDepthError = ImportDepthError;
    exports.compileFile = compileFile;
    exports.draw = draw;
    exports.layout = layout;
    exports.parse = parse;
    exports.processAsyncImports = processAsyncImports;
    exports.processImports = processImports;
    exports.renderSvg = renderSvg;
    exports.skanaar = util;
    exports.styles = styles;
    exports.version = version;
    exports.visualizers = visualizers;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
