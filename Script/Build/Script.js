"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let node;
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        Script.mainViewport = _event.detail;
        Script.mainViewport.canvas.addEventListener("mousemove", mousemove);
        Script.mainViewport.canvas.addEventListener("click", mouseclick);
        node = Script.mainViewport.getBranch();
        node.addEventListener("mousemove", foundNode);
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        Script.mainViewport.draw();
        ƒ.AudioManager.default.update();
    }
    function mousemove(_event) {
        Script.mainViewport.canvas.style.cursor = "default";
        Script.mainViewport.dispatchPointerEvent(_event);
        /*
        let picks: ƒ.Pick[] = ƒ.Picker.pickViewport(mainViewport, new ƒ.Vector2(_event.clientX, _event.clientY));
        let foundPickable = false;
        for(let pick of picks){
          let cmpPick = pick.node.getComponent(ƒ.ComponentPick);
          if(cmpPick && cmpPick.isActive) {
            foundPickable = true;
            break;
          }
        }
        if(foundPickable){
        } else {
        }
        */
    }
    function mouseclick(_event) {
        Script.mainViewport.dispatchPointerEvent(_event);
    }
    function foundNode(_event) {
        Script.mainViewport.canvas.style.cursor = "pointer";
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
            ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, this.frame.bind(this));
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
            console.log(color.a);
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
        #currentHover = null;
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
            if (_event.target instanceof ƒ.Node)
                this.#currentHover = _event.target;
        }
        clicked(_event) {
            console.log(_event.target);
            if (_event.target instanceof ƒ.Node)
                this.#currentHover = _event.target;
        }
        frame() {
        }
    }
    Script.PickingScript = PickingScript;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map