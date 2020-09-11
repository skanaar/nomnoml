# Changelog

## [1.0.0] - 2020-09-11

## Improved text measurement in SVG documents
- better heuristic for text width when no rendering context is available
- better text measurement when rendering context is available

## [0.10.0] - 2020-08-31

### New features
- Table is a new classifier type that displays its compartments in a uniform grid.
  Set the first row-break with a double pipe `||`.
- Non-boxy shapes are laid out properly. Ellipses, rhombuses, and cylinders (<usecase>, <choice>, and <database>) no longer intersect awkwardly with the arrows.

### Bug fixes
- fixed bug where SVG did not support bold text
- fixed bug where SVG did not track lineWidth in push/pop of graphic state

## [0.9.0] - 2020-08-26

- fixed bug where labels could extend outside bounding box

## [0.8.0] - 2020-07-09

- #background directive to specify background color

## [0.7.3] - 2020-07-08

- fixed incomplete rendering when edges extended outside bounding box

## [0.7.2] - 2020-05-14

- upgraded dependencies

## [0.7.1] - 2020-04-26

- fixed bug in compileFile()

## [0.7.0] - 2020-04-26

- expose compileFile to allow usage in a NodeJS environment

## [0.6.2] - 2019-10-27

- fix bug where SVG output did not get the correct text color

## [0.6.1] - 2019-07-22

- upgrade Lodash to fix a security vulnerability

## [0.6.0] - 2019-05-25

- fixed crash when two relations had the same start and end

## [0.5.0] - 2019-05-01

- improved text centering in SVG output

## [0.4.0] - 2019-04-26

### Library

- dagre library upgraded to 0.8.4
- version published as a `nomnoml.version` property

### www.nomnoml.com

- ie/edge support for downloading png images
- when new code results in parsing error, render last successful code.

### Known regressions

- self referential associations are broken
