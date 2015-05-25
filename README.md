nomnoml
=======

Hello, this is [nomnoml](http://www.nomnoml.com), a tool for drawing UML diagrams based on a simple syntax. It tries to keep its syntax visually as close as possible to the generated UML diagram without resorting to ASCII drawings. It is purely client side and changes are saved to the browser's _localStorage_, so your diagram should be here the next time, (but no guarantees).

Created by <a href="mailto:daniel.kallin@gmail.com">Daniel Kallin</a>.</p>

###Nomnoml was made possible by these cool projects

- [jison](http://zaach.github.io/jison/)
- [dagre](https://github.com/cpettitt/dagre)
- [underscore](http://underscorejs.org)
- [typicons](http://typicons.com/)
- [zepto](http://zeptojs.com/)
- [solarized](http://ethanschoonover.com/solarized)


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