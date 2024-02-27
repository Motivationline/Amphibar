namespace Script {
    export class Inventory {
        divWrapper: HTMLElement = document.getElementById("testtable");
        items: Interactable[] = [];

        addItem(_item: Interactable) {
            if (!this.items.includes(_item))
                this.items.push(_item);
            this.updateInventory();
        }
        removeItem(_item: Interactable) {
            let index = this.items.indexOf(_item);
            if (index >= 0)
                this.items.splice(index, 1);
        }

        private updateInventory() {
            if (!this.divWrapper) return;
            this.divWrapper.innerHTML = "";
            for (let item of this.items) {
                this.divWrapper.appendChild(item.toHTMLElement());
            }
        }
    }
}