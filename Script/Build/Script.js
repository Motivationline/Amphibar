"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    // import ƒui = FudgeUserInterface;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class HTMLConnectedScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(HTMLConnectedScript);
        inventory;
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            document.addEventListener("interactiveViewportStarted", this.init);
        }
        init() {
            this.inventory = new Script.Inventory();
            // for(let i = 0; i < 20; i++){
            //   this.inventory.addItem(new Interactable("Item " + i, "items/item.png"));
            // }
        }
    }
    Script.HTMLConnectedScript = HTMLConnectedScript;
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
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class Interactable extends ƒ.ComponentScript {
        name;
        image;
        constructor(_name, _image) {
            super();
            this.name = _name;
            this.image = _image;
            Script.interactableItems.push(this);
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, () => {
                this.node.addEventListener("click", this.interact.bind(this));
            });
        }
        toHTMLElement() {
            let div = document.createElement("div");
            div.innerHTML = `<img src="${this.image}" alt="${this.name}"><span>${this.name}</span>`;
            div.classList.add("item");
            div.draggable = true;
            div.addEventListener("dragstart", addData.bind(this));
            div.addEventListener("drop", tryUseWithEvent.bind(this));
            div.addEventListener("dragover", _ev => { _ev.preventDefault(); });
            return div;
            function addData(_event) {
                _event.dataTransfer.setData("interactable", this.name);
            }
            function tryUseWithEvent(_event) {
                let otherInteractableName = _event.dataTransfer.getData("interactable");
                let otherInteractable = Script.interactableItems.find(i => i.name === otherInteractableName);
                if (!otherInteractable)
                    return;
                console.log("try to use", this.name, "with", otherInteractable);
                this.tryUseWith(otherInteractable);
            }
        }
    }
    Script.Interactable = Interactable;
    let INTERACTION_TYPE;
    (function (INTERACTION_TYPE) {
        INTERACTION_TYPE[INTERACTION_TYPE["NONE"] = 0] = "NONE";
        INTERACTION_TYPE[INTERACTION_TYPE["LOOK_AT"] = 1] = "LOOK_AT";
        INTERACTION_TYPE[INTERACTION_TYPE["PICK_UP"] = 2] = "PICK_UP";
        INTERACTION_TYPE[INTERACTION_TYPE["TALK_TO"] = 3] = "TALK_TO";
    })(INTERACTION_TYPE = Script.INTERACTION_TYPE || (Script.INTERACTION_TYPE = {}));
})(Script || (Script = {}));
var Script;
(function (Script) {
    class Inventory {
        divWrapper = document.getElementById("testtable");
        items = [];
        addItem(_item) {
            if (!this.items.includes(_item))
                this.items.push(_item);
            this.updateInventory();
        }
        removeItem(_item) {
            let index = this.items.indexOf(_item);
            if (index >= 0)
                this.items.splice(index, 1);
        }
        updateInventory() {
            if (!this.divWrapper)
                return;
            this.divWrapper.innerHTML = "";
            for (let item of this.items) {
                this.divWrapper.appendChild(item.toHTMLElement());
            }
        }
    }
    Script.Inventory = Inventory;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let node;
    document.addEventListener("interactiveViewportStarted", start);
    let mouseIsOverInteractable = false;
    Script.interactableItems = [];
    function start(_event) {
        Script.mainViewport = _event.detail;
        Script.mainViewport.canvas.addEventListener("dragover", isDroppable);
        Script.mainViewport.canvas.addEventListener("drop", drop);
        Script.mainViewport.canvas.addEventListener("mousemove", mousemove);
        Script.mainViewport.canvas.addEventListener("click", mouseclick);
        node = Script.mainViewport.getBranch();
        node.addEventListener("mousemove", foundNode);
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
        Script.inventory = new Script.Inventory();
        Script.inventory.addItem(new Script.ExampleInteractable("test", "items/item.png"));
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        Script.mainViewport.draw();
        ƒ.AudioManager.default.update();
    }
    function mousemove(_event) {
        Script.mainViewport.canvas.classList.remove("cursor-talk", "cursor-take", "cursor-look");
        mouseIsOverInteractable = false;
        Script.mainViewport.dispatchPointerEvent(_event);
    }
    function mouseclick(_event) {
        Script.mainViewport.dispatchPointerEvent(_event);
    }
    function foundNode(_event) {
        mouseIsOverInteractable = true;
        let node = _event.target;
        let interactable = findInteractable(node);
        if (!interactable)
            return;
        let type = interactable.getInteractionType();
        switch (type) {
            case Script.INTERACTION_TYPE.LOOK_AT:
                Script.mainViewport.canvas.classList.add("cursor-look");
                break;
            case Script.INTERACTION_TYPE.PICK_UP:
                Script.mainViewport.canvas.classList.add("cursor-take");
                break;
            case Script.INTERACTION_TYPE.TALK_TO:
                Script.mainViewport.canvas.classList.add("cursor-talk");
                break;
            default:
                break;
        }
    }
    function isDroppable(_event) {
        let pick = findPickable(_event);
        if (pick) {
            _event.preventDefault();
        }
    }
    function drop(_event) {
        let pick = findPickable(_event);
        if (pick) {
            let interactable = findInteractable(pick.node);
            if (!interactable)
                return;
            let otherInteractableName = _event.dataTransfer.getData("interactable");
            let otherInteractable = Script.interactableItems.find(i => i.name === otherInteractableName);
            console.log("dropped", otherInteractable.name, "onto", interactable.name);
        }
    }
    function findPickable(_event) {
        let picks = ƒ.Picker.pickViewport(Script.mainViewport, new ƒ.Vector2(_event.clientX, _event.clientY));
        for (let pick of picks) {
            let cmpPick = pick.node.getComponent(ƒ.ComponentPick);
            if (cmpPick && cmpPick.isActive) {
                return pick;
            }
        }
        return null;
    }
    function findInteractable(_node) {
        return _node.getAllComponents().find(i => i instanceof Script.Interactable);
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class PickableObjectScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(PickableObjectScript);
        #material;
        #direction = -1;
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.frame.bind(this));
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, () => {
                this.#material = this.node.getComponent(ƒ.ComponentMaterial);
            });
        }
        frame() {
            let delay = 4;
            let color = this.#material.material.coat.color;
            color.a += ƒ.Loop.timeFrameGame / 1000 / delay * this.#direction;
            if (color.a >= 1) {
                this.#direction = -1;
                color.a = 1;
            }
            else if (color.a <= 0) {
                this.#direction = 1;
                color.a = 0;
            }
            // console.log(color.a);
        }
    }
    Script.PickableObjectScript = PickableObjectScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class PickingScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(PickingScript);
        // #currentHover: ƒ.Node = null;
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
            ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, this.frame);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* ƒ.EVENT.COMPONENT_ADD */:
                    break;
                case "componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                    this.node.addEventListener("mousemove", this.hovered.bind(this));
                    this.node.addEventListener("click", this.clicked.bind(this));
                    console.log({ viewport: Script.mainViewport });
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
        hovered(_event) {
            // console.log(_event.target);
            // if (_event.target instanceof ƒ.Node)
            // this.#currentHover = _event.target;
        }
        clicked(_event) {
            console.log(_event.target);
            // if (_event.target instanceof ƒ.Node)
            // this.#currentHover = _event.target;
        }
        frame() {
        }
    }
    Script.PickingScript = PickingScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    class ExampleInteractable extends Script.Interactable {
        constructor(_name, _image) {
            super(_name, _image);
        }
        getInteractionType() {
            return Script.INTERACTION_TYPE.TALK_TO;
        }
        interact() {
            throw new Error("Method not implemented.");
        }
        tryUseWith(_interactable) {
            throw new Error("Method not implemented.");
        }
    }
    Script.ExampleInteractable = ExampleInteractable;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map