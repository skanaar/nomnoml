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

The [nomnoml](http://www.nomnoml.com) standalone javascript library can be used to render diagrams on your own web page. The only dependency  is on [lodash](http://lodash.com). Install it using either *npm*, *Bower* or good old script inclusion.

    npm install nomnoml

    bower install https://github.com/skanaar/nomnoml.git

    <script src="lodash.js"></script>
    <script src="nomnoml.js"></script>

And then in your html:

```html
<script src="my_component_dir/lodash/lodash.js"></script>
<script src="my_component_dir/nomnoml/dist/nomnoml.js"></script>

<canvas id="target-canvas"></canvas>
<script>
    var canvas = document.getElementById('target-canvas');
    var source = '[nomnoml]is->[awesome]';
    nomnoml.draw(canvas, source);
</script>
```

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

## Contributing

If you want to contribute to the project more info is available in [CONTRIBUTING.md](CONTRIBUTING.md).
