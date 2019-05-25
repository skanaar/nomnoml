# Changelog

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
