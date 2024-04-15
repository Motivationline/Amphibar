namespace Script {
    export class Inventory {
        public static Instance: Inventory = new Inventory();
        private divInventory: HTMLElement;
        private divWrapper: HTMLElement;
        private preview: HTMLElement;
        private itemsToHTMLMap: Map<Interactable, HTMLElement> = new Map();

        constructor() {
            if (Inventory.Instance) return Inventory.Instance;
            Inventory.Instance = this;

            document.addEventListener("DOMContentLoaded", () => {
                this.divInventory = document.getElementById("inventory");
                this.divWrapper = document.getElementById("inventory-wrapper");
                this.divWrapper.addEventListener("click", this.toggleInventory.bind(this));
                this.preview = document.getElementById("inventory-preview");
            });
        }

        private toggleInventory(_event: MouseEvent) {
            let isInventory: boolean = (<HTMLElement>_event.target).classList.contains("inventory");
            if (!isInventory) return;
            this.divWrapper.classList.toggle("visible");
        }

        private updateStorage() {
            let inv = [];
            for (let item of this.itemsToHTMLMap.keys()) {
                inv.push({ name: item.name, image: item.image });
            }
            localStorage.setItem("inventory", JSON.stringify(inv));
        }

        addItem(_item: Interactable) {
            if (!this.itemsToHTMLMap.has(_item)) {
                let element = _item.toHTMLElement();
                this.itemsToHTMLMap.set(_item, element);
                this.updateStorage();
                
                this.preview.innerHTML = "";
                this.preview.appendChild(_item.toHTMLElement());
                this.preview.classList.add("show");
                setTimeout(() => { 
                    this.preview.classList.remove("show") 
                    this.divInventory.appendChild(element);
                }, 1200);
            }
        }

        removeItem(_item: Interactable) {
            let element = this.itemsToHTMLMap.get(_item);
            if (element) {
                this.itemsToHTMLMap.delete(_item);
                this.divInventory.removeChild(element);
                this.updateStorage();
            }
        }

        hasItem(_item: Interactable): Interactable;
        hasItem(_name: string): Interactable;
        hasItem(_nameOrItem: string | Interactable): Interactable {
            if (typeof _nameOrItem === "string") {
                for (let item of this.itemsToHTMLMap.keys()) {
                    if (item.name === _nameOrItem) return item;
                }
            } else {
                if (this.itemsToHTMLMap.has(_nameOrItem)) {
                    return _nameOrItem;
                }
            }
            return null;
        }

        hasItemThatStartsWith(_name: string): Interactable {
            for (let item of this.itemsToHTMLMap.keys()) {
                if (item.name.startsWith(_name)) return item;
            }
            return null;
        }
    }
}