namespace Script {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export class HTMLConnectedScript extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(HTMLConnectedScript);
    inventory: Inventory;


    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      document.addEventListener("interactiveViewportStarted", <EventListener>this.init);

    }

    private init() {
      this.inventory = new Inventory();
      for(let i = 0; i < 20; i++){
        this.inventory.addItem(new Item("Item " + i, "items/item.png"));
      }
    }
  }

  class Inventory {
    divWrapper: HTMLElement = document.getElementById("testtable");
    items: Item[] = [];

    addItem(_item: Item) {
      if (!this.items.includes(_item))
        this.items.push(_item);
      this.updateInventory();
    }
    removeItem(_item: Item) {
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

  class Item {
    name: string;
    image: string;
    #element: HTMLDivElement;

    constructor(_name: string, _image: string) {
      this.name = _name;
      this.image = _image;
    }

    toHTMLElement(): HTMLElement {
      let div: HTMLDivElement = document.createElement("div");
      div.innerHTML = `<img src="${this.image}" alt="${this.name}"><span>${this.name}</span>`;
      div.classList.add("item");
      div.draggable = true;
      div.addEventListener("dragstart", this.addData.bind(this));
      // div.addEventListener("dragend", (_ev) => { div.style.pointerEvents = "initial" });
      div.addEventListener("drop", this.tryCombine.bind(this));
      div.addEventListener("dragover", _ev => { _ev.preventDefault() });
      this.#element = div;
      return div;
    }
    addData(_ev: DragEvent) {
      _ev.dataTransfer.setData("item", this.name);
      // this.#element.style.pointerEvents = "none";
    }
    tryCombine(_ev: DragEvent) {
      let otherItem = _ev.dataTransfer.getData("item");
      console.log("combine items", this.name, otherItem);
    }
  }
}