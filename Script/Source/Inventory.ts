namespace Script {
    export class Inventory {
        divInventory: HTMLElement = document.getElementById("inventory");
        divWrapper: HTMLElement = document.getElementById("inventory-wrapper");
        itemsToHTMLMap: Map<Interactable, HTMLElement> = new Map();
        constructor(){
            this.divWrapper.addEventListener("click", this.toggleInventory.bind(this));
        }

        addItem(_item: Interactable) {
            if (!this.itemsToHTMLMap.has(_item)){
                let element = _item.toHTMLElement();
                this.divInventory.appendChild(element);
                this.itemsToHTMLMap.set(_item, element);
            }
        }
        removeItem(_item: Interactable) {
            let element = this.itemsToHTMLMap.get(_item);
            if (element){
                this.itemsToHTMLMap.delete(_item);
                this.divInventory.removeChild(element);
            }
        }

        private toggleInventory(_event: MouseEvent){
            let isInventory: boolean = (<HTMLElement>_event.target).classList.contains("inventory");
            if(!isInventory) return;
            this.divWrapper.classList.toggle("visible");
        }
    }
}