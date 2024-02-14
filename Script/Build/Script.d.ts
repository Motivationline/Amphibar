declare namespace Script {
    import ƒ = FudgeCore;
    let mainViewport: ƒ.Viewport;
}
declare namespace Script {
    import ƒ = FudgeCore;
    class PickableObjectScript extends ƒ.ComponentScript {
        #private;
        static readonly iSubclass: number;
        constructor();
        private frame;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class PickingScript extends ƒ.ComponentScript {
        #private;
        static readonly iSubclass: number;
        constructor();
        hndEvent: (_event: Event) => void;
        private hovered;
        private clicked;
        private frame;
    }
}
