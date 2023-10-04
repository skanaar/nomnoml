import { styles, visualizers, layouters, buildStyle } from './visuals'
import { NodeLayouter, Visual, Visualizer } from "./domain";
export {
  draw,
  renderSvg,
  compileFile,
  processImports,
  processAsyncImports,
  ImportDepthError,
} from './nomnoml'
export var version = '1.6.2'

export * as skanaar from './util'
export { parse, ParseError } from './parser'
export { layout } from './layouter'
export { styles, visualizers }
export type Component = {
    name: Visual,
    layout: NodeLayouter,
    visualizer: Visualizer
}
export function registerComponent(component: Component) {
    const name = String(component.name);
    Object.assign(layouters, { [name]: component.layout } );
    Object.assign(visualizers, { [name]: component.visualizer } );
    Object.assign(
        styles,
        {
            [name]: buildStyle({ visual: component.name },
                { center:true },
                { center: true }
            )
        }
    );
}
