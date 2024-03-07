declare namespace Script {
    import ƒ = FudgeCore;
    class BathroomManager extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        constructor();
        private init;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class CharacterScript extends ƒ.ComponentScript {
        #private;
        static readonly iSubclass: number;
        private nextTarget;
        private currentTarget;
        private walker;
        private animator;
        private animations;
        constructor();
        private init;
        moveTo(_waypoint: ƒ.ComponentWaypoint): void;
        private actuallyWalk;
        private reachedWaypoint;
        private finishedWalking;
    }
}
declare namespace Script {
    export class DialogManager {
        #private;
        static Instance: DialogManager;
        constructor();
        private initHtml;
        private setupDisplay;
        private clickedOverlay;
        private showText;
        private getTextContent;
        private parseText;
        private findBracketsRecursive;
        private showOptions;
        private hideDialog;
        private showDialogInternal;
        showDialog(_dialog: Dialog, _delay?: number): Promise<void | string>;
    }
    export interface Dialog {
        text: string;
        parsedText?: ParsedDialog;
        textLength?: number;
        name: string;
        icon: string;
        options?: DialogOption[];
    }
    export interface DialogOption {
        text: string;
        id: string;
    }
    interface ParsedDialog {
        class: string;
        content: (string | ParsedDialog)[];
    }
    export {};
}
declare namespace Script {
    import ƒ = FudgeCore;
    class GenerateWaypointsScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        dx: number;
        dz: number;
        distance: number;
        constructor();
        private createWaypoints;
    }
}
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
    let character: CharacterScript;
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
    class DefaultViewable extends Interactable {
        text: string;
        name: string;
        constructor(_name: string, _image: string);
        getInteractionType(): INTERACTION_TYPE;
        interact(): void;
        tryUseWith(_interactable: Interactable): void;
    }
}
