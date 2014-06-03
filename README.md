nomnoml
=======

Hello, this is [nomnoml](http://www.nomnoml.com), a tool for drawing UML diagrams based on a simple syntax. It tries to keep its syntax visually as close as possible to the generated UML diagram without resorting to ASCII drawings. It is purely client side and uses the browser's _localStorage_, and quite a lot of other HTML5 standards.

Created by <a href="mailto:daniel.kallin@gmail.com">Daniel Kallin</a>.</p>

###Nomnoml was made possible by these cool projects

- [jison](http://zaach.github.io/jison/)
- [dagre](https://github.com/cpettitt/dagre)
- [underscore](http://underscorejs.org)
- [typicons](http://typicons.com/)
- [zepto](http://zeptojs.com/)
- [solarized](http://ethanschoonover.com/solarized)

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