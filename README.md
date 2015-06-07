nomnoml
=======

Hello, this is [nomnoml][nomnoml], a tool for drawing UML diagrams based on a simple syntax. It tries to keep its syntax visually as close as possible to the generated UML diagram without resorting to ASCII drawings.

Created by <a href="mailto:daniel.kallin@gmail.com">Daniel Kallin</a>.</p>

###Nomnoml was made possible by these cool projects

- [jison](http://zaach.github.io/jison/)
- [dagre](https://github.com/cpettitt/dagre)
- [lodash](http://lodash.com)
- [typicons](http://typicons.com/)
- [zepto](http://zeptojs.com/)
- [solarized](http://ethanschoonover.com/solarized)

##Library

The [nomnoml][nomnoml] standalone javascript library can be used to render diagrams on your own web page. The only dependency currently is on [lodash](http://lodash.com). Easiest way to get started is by using [Bower](http://bower.io), like this:

    bower install nomnoml

> **Note:** Not yet registered with bower, use instead:
>
>   `bower install https://github.com/skanaar/nomnoml.git`

And then in your html:

```html
<script id="noml" type="text/plain">
    [nomnoml]is->[awesome]
</script>
<canvas id="target-canvas"></canvas>
<script src="bower_components/lodash/lodash.js"></script>
<script src="bower_components/nomnoml/dist/nomnoml.js"></script>
<script>
    var canvas = document.getElementById('target-canvas');
    var noml = document.getElementById('noml').innerHTML;
    nomnoml.draw(canvas, noml);
</script>
```

##Web application

The [nomnoml][nomnoml] web application is a simple editor with a live preview. It is purely client side and changes are saved to the browser's _localStorage_, so your diagram should be here the next time, (but no guarantees).

###Interaction

The canvas can be panned and zoomed by dragging and scrolling in the right hand third of the canvas. Downloaded image files will be given the filename in the `#title` directive.

###Example

This is how the Decorator pattern looks like in nomnoml syntax:

    [<frame>Decorator pattern|
      [<abstract>Component||+ operation()]
      [Client] depends --> [Component]
      [Decorator|- next: Component]
      [Decorator] decorates -- [ConcreteComponent]
      [Component] <:- [Decorator]
      [Component] <:- [ConcreteComponent]
    ]

###Association types
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

###Classifier types
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

###Directives
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

[nomnoml]: http://www.nomnoml.com
