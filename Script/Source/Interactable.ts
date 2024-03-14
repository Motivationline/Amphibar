namespace Script {
    import ƒ = FudgeCore;
    export abstract class Interactable extends ƒ.ComponentScript {
        name: string;
        image?: string;
        abstract getInteractionType(): INTERACTION_TYPE;
        abstract interact(): void;
        abstract tryUseWith(_interactable: Interactable): void;

        constructor(_name: string, _image?: string) {
            super();
            this.name = _name;
            this.image = _image;
            interactableItems.push(this);

            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, () => {
                this.node.addEventListener("click", this.interact.bind(this));
            });
        }

        toHTMLElement(): HTMLElement {
            let div: HTMLDivElement = document.createElement("div");
            div.innerHTML = `<img src="${this.image}" alt="${this.name}"><span>${this.name}</span>`;
            div.classList.add("item");
            div.draggable = true;
            div.addEventListener("dragstart", addData.bind(this));
            div.addEventListener("drop", tryUseWithEvent.bind(this));
            div.addEventListener("dragover", _ev => { _ev.preventDefault() });
            return div;

            function addData(_event: DragEvent): void {
                _event.dataTransfer.setData("interactable", this.name);
            }
            function tryUseWithEvent(_event: DragEvent): void {
                let otherInteractableName: string = _event.dataTransfer.getData("interactable");
                let otherInteractable = interactableItems.find(i => i.name === otherInteractableName);
                if (!otherInteractable) return;
                console.log("try to use", this.name, "with", otherInteractable);
                this.tryUseWith(otherInteractable);
            }
        }
    }
    export enum INTERACTION_TYPE {
        NONE,
        LOOK_AT,
        PICK_UP,
        TALK_TO,
        DOOR,
    }
}