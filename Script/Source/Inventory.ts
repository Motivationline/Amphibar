namespace Script {
    export class Inventory {
        public static Instance: Inventory = new Inventory();
        private divInventory: HTMLElement;
        private divWrapper: HTMLElement;
        private itemsToHTMLMap: Map<Interactable, HTMLElement> = new Map();
        constructor() {
            if(Inventory.Instance) return Inventory.Instance;
            Inventory.Instance = this;

            document.addEventListener("DOMContentLoaded", ()=> {
                this.divInventory = document.getElementById("inventory");
                this.divWrapper = document.getElementById("inventory-wrapper");
                this.divWrapper.addEventListener("click", this.toggleInventory.bind(this));
            });
        }

        private toggleInventory(_event: MouseEvent) {
            let isInventory: boolean = (<HTMLElement>_event.target).classList.contains("inventory");
            if (!isInventory) return;
            this.divWrapper.classList.toggle("visible");
        }

        addItem(_item: Interactable) {
            if (!this.itemsToHTMLMap.has(_item)) {
                let element = _item.toHTMLElement();
                this.divInventory.appendChild(element);
                this.itemsToHTMLMap.set(_item, element);
            }
        }

        removeItem(_item: Interactable) {
            let element = this.itemsToHTMLMap.get(_item);
            if (element) {
                this.itemsToHTMLMap.delete(_item);
                this.divInventory.removeChild(element);
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