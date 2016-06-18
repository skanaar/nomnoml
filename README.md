nomnoml
=======

Hello, this is [nomnoml](http://www.nomnoml.com), a tool for drawing UML diagrams based on a simple syntax. It tries to keep its syntax visually as close as possible to the generated UML diagram without resorting to ASCII drawings.

Created by [Daniel Kallin](https://github.com/skanaar). Contributions by [Alexander Moosbrugger](https://github.com/amoosbr) and [korroz](https://github.com/korroz).

### Nomnoml was made possible by these cool projects

- [jison](http://zaach.github.io/jison/)
- [dagre](https://github.com/cpettitt/dagre)
- [lodash](http://lodash.com)
- [typicons](http://typicons.com/)
- [zepto](http://zeptojs.com/)
- [codemirror](https://codemirror.net/)
- [solarized](http://ethanschoonover.com/solarized)

## Library

The [nomnoml](http://www.nomnoml.com) standalone javascript library can be used to render diagrams on your own web page. The only dependencies are [lodash](http://lodash.com) and [dagre](https://github.com/cpettitt/dagre). Install it using either *npm* or good old script inclusion.

NodeJS usage with SVG output:

    npm install nomnoml

    var nomnoml = require('nomnoml');
    var src = '[nomnoml] is -> [awesome]';
    console.log(nomnoml.renderSvg(src));

Html usage with a Canvas rendering target:

```html
<script src="lodash.js"></script>
<script src="dagre.js"></script>
<script src="nomnoml.js"></script>

<canvas id="target-canvas"></canvas>
<script>
    var canvas = document.getElementById('target-canvas');
    var source = '[nomnoml] is -> [awesome]';
    nomnoml.draw(canvas, source);
</script>
```

## SVG support

An experimental (and not fully featured) SVG rendering mode is available as the `nomnoml.renderSvg` function.

## Web application

The [nomnoml](http://www.nomnoml.com) web application is a simple editor with a live preview. It is purely client side and changes are saved to the browser's _localStorage_, so your diagram should be here the next time, (but no guarantees).

### Interaction

The canvas can be panned and zoomed by dragging and scrolling in the right hand third of the canvas. Downloaded image files will be given the filename in the `#title` directive.

### Example

This is how the Decorator pattern looks like in nomnoml syntax:

    [<frame>Decorator pattern|
      [<abstract>Component||+ operation()]
      [Client] depends --> [Component]
      [Decorator|- next: Component]
      [Decorator] decorates -- [ConcreteComponent]
      [Component] <:- [Decorator]
      [Component] <:- [ConcreteComponent]
    ]

### Association types

    -    association
    ->   association
    <->  association
    -->  dependency
    <--> dependency
    -:>  generalization
    <:-  generalization
    --:> implementation
    <:-- implementation
    +-   composition
    +->  composition
    o-   aggregation
    o->  aggregation
    --   note
    -/-  hidden

### Classifier types

    [name]
    [<abstract> name]
    [<instance> name]
    [<reference> name]
    [<note> name]
    [<package> name]
    [<frame> name]
    [<database> name]
    [<start> name]
    [<end> name]
    [<state> name]
    [<choice> name]
    [<input> name]
    [<sender> name]
    [<receiver> name]
    [<actor> name]
    [<usecase> name]
    [<label> name]
    [<hidden> name]

### Directives

    #arrowSize: 1
    #bendSize: 0.3
    #direction: down | right
    #gutter: 5
    #edgeMargin: 0
    #edges: hard | rounded
    #fill: #eee8d5; #fdf6e3
    #fillArrows: false
    #font: Calibri
    #fontSize: 12
    #leading: 1.25
    #lineWidth: 3
    #padding: 8
    #spacing: 40
    #stroke: #33322E
    #title: filename
    #zoom: 1

### Custom classifier styles

A directive that starts with "." define a classifier style.

    #.box: fill=#88ff88
    #.blob: fill=pink visual=ellipse italic bold dashed
    [<box> GreenBox]
    [<blob> HideousBlob]

Available visuals are

    visual=actor
    visual=class
    visual=database
    visual=ellipse
    visual=end
    visual=frame
    visual=hidden
    visual=input
    visual=none
    visual=note
    visual=package
    visual=receiver
    visual=rhomb
    visual=roundrect
    visual=sender
    visual=start

Available modifiers are

    center
    bold
    underline
    italic
    dashed
    empty

## Contributing

If you want to contribute to the project more info is available in [CONTRIBUTING.md](CONTRIBUTING.md).
