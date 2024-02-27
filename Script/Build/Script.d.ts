declare namespace Script {
    import ƒ = FudgeCore;
    export class HTMLConnectedScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        inventory: Inventory;
        constructor();
        private init;
    }
    class Inventory {
        divWrapper: HTMLElement;
        items: Item[];
        addItem(_item: Item): void;
        removeItem(_item: Item): void;
        private updateInventory;
    }
    class Item {
        #private;
        name: string;
        image: string;
        constructor(_name: string, _image: string);
        toHTMLElement(): HTMLElement;
        addData(_ev: DragEvent): void;
        tryCombine(_ev: DragEvent): void;
    }
    export {};
}
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
