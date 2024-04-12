namespace Script {
    import ƒ = FudgeCore;
    export class Interactable extends ƒ.ComponentScript {
        name: string;
        image?: string;
        static textProvider: Text;

        constructor(_name: string, _image?: string) {
            super();
            this.name = _name;
            this.image = _image;
            interactableItems.push(this);

            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, () => {
                this.node.addEventListener("click", this.interact.bind(this));
            });

            if (!Interactable.textProvider) Interactable.textProvider = new Text();
        }

        static getInteractionText(_object: Interactable, _item?: Interactable): string {
            if (!_object.node) {
                let key = `${_object.name}.interact`;
                let text = Interactable.textProvider.get(key);
                if (text !== key) return text;
                
                key = `interact`;
                text = Interactable.textProvider.get(key);
                if (text !== key) return text;
                
                return `${_object.name}.interact`;
            }
            let base = _object.node.getAncestor();
            
            let key: string = "";
            if (_item) {
                key = `${base.name}.${_object.name}.interact.${_item.name}`;
                let text = Interactable.textProvider.get(key);
                if (text !== key) return text;
                let itemname: string = _item.name.split(".")[0];
                key = `${base.name}.${_object.name}.interact.${itemname}`;
                text = Interactable.textProvider.get(key);
                if (text !== key) return text;
            }
            key = `${base.name}.${_object.name}.interact`;
            let text = Interactable.textProvider.get(key);
            if (key !== text) return text;
            key = `${base.name}.interact`;
            text = Interactable.textProvider.get(key);
            if (key !== text) return text;
            key = `interact`;
            text = Interactable.textProvider.get(key);
            if (key !== text) return text;
            return `${base.name}.${_object.name}.interact.${_item?.name ?? ""}`
        }
        interact(): void {
            CharacterScript.talkAs("Tadpole", Interactable.getInteractionText(this));
        }

        tryUseWith(_interactable: Interactable): void {
            CharacterScript.talkAs("Tadpole", Interactable.getInteractionText(this, _interactable));
        }
        getInteractionType(): INTERACTION_TYPE {
            return INTERACTION_TYPE.LOOK_AT;
        }

        toHTMLElement(): HTMLElement {
            let div: HTMLDivElement = document.createElement("div");
            let name = Interactable.textProvider.get(`item.${this.name}.name`);
            let img: HTMLImageElement = document.createElement("img");
            img.src = this.image;
            img.alt = name;
            div.appendChild(img);
            div.classList.add("item");
            div.draggable = true;
            div.addEventListener("dragstart", addData.bind(this));
            div.addEventListener("drop", tryUseWithEvent.bind(this));
            div.addEventListener("dragover", _ev => { _ev.preventDefault() });
            div.addEventListener("pointermove", _ev => { MenuManager.Instance.hoverStart(_ev, this) });
            div.addEventListener("pointerleave", _ev => { MenuManager.Instance.hoverEnd() });
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

        canUseWithItem(): boolean {
            return false;
        }
    }
    export enum INTERACTION_TYPE {
        NONE,
        LOOK_AT,
        PICK_UP,
        TALK_TO,
        DOOR,
        USE,
    }
}