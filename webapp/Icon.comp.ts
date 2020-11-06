import { el } from "./react-util";

export function Icon(props: { shape?: string }) {
    return el('i', { className: 'icon' },
        el('svg', {
        version: "1.2",
        baseProfile: "tiny",
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        width: "24",
        height: "24"
        },
            el('path', { d: props.shape })
        )
    )
}