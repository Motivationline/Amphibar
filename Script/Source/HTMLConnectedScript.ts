namespace Script {
  import ƒ = FudgeCore;
  // import ƒui = FudgeUserInterface;
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

    private async init() {
      this.inventory = new Inventory();
      // for(let i = 0; i < 20; i++){
      //   this.inventory.addItem(new Interactable("Item " + i, "items/item.png"));
      // }
      let dm = new DialogManager();
      // await dm.showDialog({
      //   icon: "items/item.png",
      //   name: "Item",
      //   text: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Natus corporis ipsa eaque earum sint soluta dignissimos ex est, distinctio eveniet sequi nemo ad quas incidunt tempore nulla cum iure. Obcaecati."
      // }, 10) 
      await dm.showDialog({
        icon: "items/item.png",
        name: "Item 2",
        text: "Lorem [bold]ipsum dolor [italic]sit[/italic] amet[/bold], consetetur [shake]sadipscing elitr[/shake], sed diam"
      });
      let result = await dm.showDialog({
        icon: "items/item.png",
        name: "Item 2",
        text: "Lorem",
        options: [
          {id: "option 1", text: "This is option 1"},
          {id: "option 2", text: "This is a different option"}
        ]
      });
      console.log("chose", result);
    }
  }

  /*
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
  */
}