declare namespace Script {
    import ƒ = FudgeCore;
    type Character = "Tadpole" | "Frog" | "Fly";
    type Mood = "neutral" | "sad" | "angry";
    export class CharacterScript extends ƒ.ComponentScript {
        #private;
        static readonly iSubclass: number;
        private nextTarget;
        private currentTarget;
        private walker;
        private animator;
        private animations;
        static characterIcons: ({
            [key: string]: ({
                [key2: string]: string;
            });
        });
        static characterNames: ({
            [key: string]: string;
        });
        static talkAs(_character: Character, _text: string, _mood?: Mood): Promise<string | void>;
        constructor();
        private init;
        private setCharacter;
        moveTo(_waypoint: ƒ.ComponentWaypoint): Promise<unknown>;
        private actuallyWalk;
        private reachedWaypoint;
        private finishedWalking;
        private resolveOrReject;
    }
    export {};
}
declare namespace Script {
    import ƒ = FudgeCore;
    class GenerateWaypointsScript extends ƒ.ComponentScript {
        #private;
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
        canUseWithItem(): boolean;
    }
    enum INTERACTION_TYPE {
        NONE = 0,
        LOOK_AT = 1,
        PICK_UP = 2,
        TALK_TO = 3,
        DOOR = 4,
        USE = 5
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
    export let mainViewport: ƒ.Viewport;
    export let mainNode: ƒ.Node;
    export let inventory: Inventory;
    export const interactableItems: Interactable[];
    export let character: CharacterScript;
    export let progress: Progress;
    export let settings: Settings;
    export function foundNode(_event: PointerEvent): void;
    interface Progress {
        fly?: {
            intro: boolean;
            clean: number;
            drink: number;
            worm: number;
        };
        test?: boolean;
    }
    interface Settings {
        music: number;
        sounds: number;
    }
    export function onChange(object: any, onChange: Function): any;
    export {};
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
    class BathroomValve extends Interactable {
        text: string;
        name: string;
        constructor(_name: string, _image: string);
        getInteractionType(): INTERACTION_TYPE;
        interact(): void;
        tryUseWith(_interactable: Interactable): void;
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
declare namespace Script {
    class Door extends Interactable {
        target: string;
        constructor(_name: string, _image: string);
        getInteractionType(): INTERACTION_TYPE;
        interact(): void;
        tryUseWith(_interactable: Interactable): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class BathroomManager extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        constructor();
        private init;
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
    class MenuManager {
        static Instance: MenuManager;
        loadingScreen: HTMLElement;
        mainMenuScreen: HTMLElement;
        optionsScreen: HTMLElement;
        constructor();
        private setupListeners;
        private setupDomConnection;
        private showStartScreens;
        loadingTextTimeout: number;
        private updateLoadingText;
        private startGame;
        private exit;
        private showOptions;
        private dismissOptions;
        private updateSlider;
    }
}
declare namespace Script {
    class SceneManager extends ƒ.ComponentScript {
        static isTransitioning: boolean;
        constructor();
        static load(_name: string): void;
        private static loadScene;
    }
}
