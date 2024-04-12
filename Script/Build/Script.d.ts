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
        static talkAs(_character: Character, _text: string, _mood?: Mood, _options?: DialogOption[]): Promise<string | void>;
        constructor();
        private init;
        private initPosition;
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
    class Interactable extends ƒ.ComponentScript {
        name: string;
        image?: string;
        static textProvider: Text;
        constructor(_name: string, _image?: string);
        static getInteractionText(_object: Interactable, _item?: Interactable): string;
        interact(): void;
        tryUseWith(_interactable: Interactable): void;
        getInteractionType(): INTERACTION_TYPE;
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
        static Instance: Inventory;
        private divInventory;
        private divWrapper;
        private preview;
        private itemsToHTMLMap;
        constructor();
        private toggleInventory;
        private updateStorage;
        addItem(_item: Interactable): void;
        removeItem(_item: Interactable): void;
        hasItem(_item: Interactable): Interactable;
        hasItem(_name: string): Interactable;
        hasItemThatStartsWith(_name: string): Interactable;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    export let mainViewport: ƒ.Viewport;
    export let mainNode: ƒ.Node;
    export const interactableItems: Interactable[];
    export let character: CharacterScript;
    export let progress: Progress;
    export let settings: Settings;
    export function setupNewMainNode(_node: ƒ.Node): void;
    export function getClosestWaypoint(_mainNode: ƒ.Node, distanceFunction: (_waypointTranslation: ƒ.Vector3) => number): ƒ.ComponentWaypoint;
    export function foundNode(_event: PointerEvent): void;
    interface Progress {
        fly: {
            intro: boolean;
            done: boolean;
            clean: number;
            drink: number;
            worm: number;
        };
        frog: {
            intro: boolean;
            checked_door: boolean;
            music: boolean;
            key: boolean;
        };
        scene: string;
    }
    interface Settings {
        music: number;
        sounds: number;
    }
    /** Helper function to set up a (deep) proxy object that calls the onChange function __before__ the element is modified*/
    export function onChange(object: any, onChange: Function): any;
    /** Deep merges the _updates object into the _current object. */
    export function merge(_current: any, _updates: any): any;
    export {};
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
    class Text {
        static instance: Text;
        private textData;
        constructor();
        private load;
        get(identifier: string, ...replacements: string[]): string;
    }
}
declare namespace Script {
    class BathroomBucket extends Interactable {
        text: string;
        name: string;
        constructor(_name: string, _image: string);
        interact(): void;
        tryUseWith(_interactable: Interactable): void;
    }
}
declare namespace Script {
    class BathroomValve extends Interactable {
        constructor(_name: string, _image: string);
        getInteractionType(): INTERACTION_TYPE;
        interact(): void;
    }
}
declare namespace Script {
    class Door extends Interactable {
        target: string;
        constructor(_name?: string, _image?: string);
        getInteractionType(): INTERACTION_TYPE;
        interact(): void;
        tryUseWith(_interactable: Interactable): void;
    }
}
declare namespace Script {
    class DoorBar extends Interactable {
        target: string;
        locked: boolean;
        constructor(_name?: string, _image?: string);
        getInteractionType(): INTERACTION_TYPE;
        interact(): void;
        tryUseWith(_interactable: Interactable): void;
    }
}
declare namespace Script {
    class Fly extends Interactable {
        #private;
        private randomDrinkOrLoad;
        getInteractionType(): INTERACTION_TYPE;
        tryUseWith(_interactable: Interactable): void;
        interact(): Promise<void>;
    }
}
declare namespace Script {
    class Frog extends Interactable {
        getInteractionType(): INTERACTION_TYPE;
        tryUseWith(_interactable: Interactable): void;
        interact(): Promise<void>;
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
        position: "left" | "right";
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
        private loadingScreen;
        private mainMenuScreen;
        private optionsScreen;
        private gameOverlay;
        private disableOverlay;
        private itemHover;
        private loadingScreenMinimumVisibleTimeMS;
        constructor();
        private setupListeners;
        private setupDomConnection;
        private showStartScreens;
        private hideLoadingScreen;
        private gameWasStarted;
        private startGame;
        private exit;
        private showOptions;
        private dismissOptions;
        private updateSlider;
        private gameIsLoaded;
        private gameLoaded;
        inputDisable(): void;
        inputEnable(): void;
        hoverStart(_event: PointerEvent, _interactable: Interactable): void;
        hoverEnd(): void;
    }
}
declare namespace Script {
    class SceneManager extends ƒ.ComponentScript {
        static isTransitioning: boolean;
        constructor();
        static load(_name: string, _noTransition?: boolean): void;
        private static loadScene;
        private static getFirstComponentCamera;
    }
}
declare namespace Script {
    class CocktailGlass extends Interactable {
        private emptyGlass;
        private cocktails;
        private currentCocktail;
        constructor(_name: string, _image: string);
        getInteractionType(): INTERACTION_TYPE;
        interact(): Promise<void>;
        setCocktail(_name?: string): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class CocktailInteractableIngredient extends Interactable {
        ingredient: CocktailIngredient;
        cmpAnimator: ƒ.ComponentAnimator;
        constructor(_name: string);
        private pouringDone;
        getInteractionType(): INTERACTION_TYPE;
        private promiseResolver;
        interact(): void;
        getMutatorAttributeTypes(_mutator: ƒ.Mutator): ƒ.MutatorAttributeTypes;
    }
    enum CocktailIngredient {
        Bachwasser = 1,
        Goldnektar = 2,
        Schlammsprudel = 4,
        Seerosenextrakt = 8
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class CocktailManager extends ƒ.ComponentScript {
        static Instance: CocktailManager;
        private static mixTable;
        private currentIngredients;
        static glass: CocktailGlass;
        constructor();
        get currentCocktail(): string;
        addIngredient(_ingredient: CocktailIngredient, _waitFor?: Promise<void>): boolean;
        static mix(..._ingredients: CocktailIngredient[]): string;
        static unmix(_cocktail: string): string[];
        get ingredients(): CocktailIngredient[];
        static get allCocktails(): string[];
        resetCocktail(_bar: boolean, _inventory: boolean): void;
        takeCocktail(): void;
    }
}
declare namespace Script {
    class CocktailTrash extends Interactable {
        getInteractionType(): INTERACTION_TYPE;
        interact(_event?: Event, _fromInventory?: boolean): Promise<void>;
        tryUseWith(_interactable: Interactable): void;
    }
}
