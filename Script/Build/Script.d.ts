declare namespace Script {
    import ƒ = FudgeCore;
    class HTMLConnectedScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        inventory: Inventory;
        constructor();
        private init;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    abstract class Interactable extends ƒ.ComponentScript {
        name: string;
        image?: string;
        abstract getInteractionType(): INTERACTION_TYPE;
        abstract interact(): void;
        abstract tryUseWith(_interactable: Interactable): void;
        constructor(_name: string, _image?: string);
        toHTMLElement(): HTMLElement;
    }
    enum INTERACTION_TYPE {
        NONE = 0,
        LOOK_AT = 1,
        PICK_UP = 2,
        TALK_TO = 3
    }
}
declare namespace Script {
    class Inventory {
        divWrapper: HTMLElement;
        items: Interactable[];
        addItem(_item: Interactable): void;
        removeItem(_item: Interactable): void;
        private updateInventory;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    let mainViewport: ƒ.Viewport;
    let inventory: Inventory;
    const interactableItems: Interactable[];
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
        static readonly iSubclass: number;
        constructor();
        hndEvent: (_event: Event) => void;
        private hovered;
        private clicked;
        private frame;
    }
}
declare namespace Script {
    class ExampleInteractable extends Interactable {
        constructor(_name: string, _image: string);
        getInteractionType(): INTERACTION_TYPE;
        interact(): void;
        tryUseWith(_interactable: Interactable): void;
    }
}
