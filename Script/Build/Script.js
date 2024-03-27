"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CharacterScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(CharacterScript);
        nextTarget;
        currentTarget;
        walker;
        animator;
        animations = new Map();
        #currentlyWalking = false;
        #currentPromiseResolve;
        #currentPromiseReject;
        static characterIcons = {
            Tadpole: { neutral: "Assets/UI/Dialog/Charaktere/Kaulquappe.png" },
            Frog: { neutral: "Assets/UI/Dialog/Charaktere/Frosch.png" },
            Fly: { neutral: "Assets/UI/Dialog/Charaktere/Fliege.png" },
        };
        static characterNames = {
            Tadpole: "Assets/UI/Dialog/Namen/Name_Kaulquappe.svg",
            Frog: "Assets/UI/Dialog/Namen/Name_Frosch.svg",
            Fly: "Assets/UI/Dialog/Namen/Name_Fliege.svg",
        };
        static talkAs(_character, _text, _mood = "neutral", _options) {
            return Script.DialogManager.Instance.showDialog({
                icon: this.characterIcons[_character][_mood],
                name: this.characterNames[_character],
                text: _text,
                position: _character === "Tadpole" ? "left" : "right",
                options: _options,
            });
        }
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            ƒ.Project.addEventListener("resourcesLoaded" /* ƒ.EVENT.RESOURCES_LOADED */, this.init.bind(this));
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, () => {
                this.node.addEventListener("attachBranch" /* ƒ.EVENT.ATTACH_BRANCH */, this.setCharacter.bind(this), true);
            });
        }
        init() {
            // this.node.addEventListener("click");
            this.walker = this.node.getComponent(ƒ.ComponentWalker);
            this.walker.addEventListener("waypointReached" /* ƒ.EVENT.WAYPOINT_REACHED */, this.reachedWaypoint.bind(this));
            this.walker.addEventListener("pathingConcluded" /* ƒ.EVENT.PATHING_CONCLUDED */, this.finishedWalking.bind(this));
            this.animator = this.node.getChild(0).getChild(0).getComponent(ƒ.ComponentAnimator);
            // console.log("idle", );
            let animations = ƒ.Project.getResourcesByType(ƒ.Animation);
            for (let anim of animations) {
                this.animations.set(anim.name, anim);
            }
            // this.animations.set("idle", <ƒ.Animation>ƒ.Project.getResourcesByName("Idle")[0])
            // this.animations.set("interact", <ƒ.Animation>ƒ.Project.getResourcesByName("Interact")[0])
            // this.animations.set("walk", <ƒ.Animation>ƒ.Project.getResourcesByName("WalkDerpy")[0])
        }
        setCharacter() {
            Script.character = this;
        }
        moveTo(_waypoint) {
            this.resolveOrReject(false);
            let promise = new Promise((resolve, reject) => {
                this.#currentPromiseResolve = resolve;
                this.#currentPromiseReject = reject;
            });
            if (!this.#currentlyWalking) {
                this.actuallyWalk(_waypoint);
            }
            else {
                this.nextTarget = _waypoint;
            }
            return promise;
        }
        actuallyWalk(_waypoint) {
            if (this.currentTarget && this.currentTarget !== _waypoint) {
                this.#currentlyWalking = true;
                this.animator.animation = this.animations.get("WalkDerpy");
                this.walker.moveTo(this.currentTarget, _waypoint, true).catch(() => {
                    this.#currentlyWalking = false;
                    this.resolveOrReject(true);
                    this.animator.animation = this.animations.get("Idle");
                });
            }
            else {
                this.#currentlyWalking = false;
                this.walker.moveTo(_waypoint);
                this.resolveOrReject(true);
            }
            this.currentTarget = _waypoint;
            this.nextTarget = null;
        }
        reachedWaypoint(_event) {
            // TODO Check if the character is stuck somehow. 
            let currentWaypoint = _event.detail;
            if (this.nextTarget) {
                this.currentTarget = currentWaypoint;
                this.actuallyWalk(this.nextTarget);
            }
            // this.node.getChild(0).cmpTransform.mtxLocal.rotation = this.walker.direction;
            // this.node.getChild(0).cmpTransform.mtxLocal.rotation = ƒ.Matrix4x4.LOOK_AT(this.node.mtxWorld.translation, ƒ.Vector3.SUM(this.walker.direction, this.node.mtxWorld.translation)).rotation;
            // console.log("reacged", _event.detail);
        }
        finishedWalking(_event) {
            this.animator.animation = this.animations.get("Idle");
            this.#currentlyWalking = false;
            let currentWaypoint = _event.detail;
            if (this.nextTarget) {
                this.currentTarget = currentWaypoint;
                this.actuallyWalk(this.nextTarget);
            }
            this.resolveOrReject(true);
        }
        resolveOrReject(_resolve) {
            if (_resolve && this.#currentPromiseResolve)
                this.#currentPromiseResolve();
            if (!_resolve && this.#currentPromiseReject)
                this.#currentPromiseReject();
            this.#currentPromiseReject = null;
            this.#currentPromiseResolve = null;
        }
    }
    Script.CharacterScript = CharacterScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class GenerateWaypointsScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(GenerateWaypointsScript);
        dx = 2;
        dz = 2;
        distance = 0.5;
        #waypoints = [];
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.frame.bind(this));
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.createWaypoints.bind(this));
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, () => {
                // this.node.addEventListener(ƒ.EVENT.ATTACH_BRANCH, this.createWaypoints.bind(this), true);
            });
        }
        createWaypoints(_ev) {
            console.log("create", _ev.type);
            for (let comp of this.node.getComponents(ƒ.ComponentWaypoint)) {
                this.node.removeComponent(comp);
            }
            this.#waypoints = [];
            let connectionDistance = this.distance * this.distance * 2.5 /* slightly more than sqrt(2) = 1.41 */;
            for (let x = 0; x <= this.dx; x += this.distance) {
                for (let z = 0; z <= this.dz; z += this.distance) {
                    let waypoint = new ƒ.ComponentWaypoint(ƒ.Matrix4x4.CONSTRUCTION(new ƒ.Vector3(x, 0, z)));
                    this.node.addComponent(waypoint);
                    for (let w of this.#waypoints) {
                        let distance = ƒ.Vector3.DIFFERENCE(w.mtxWorld.translation, waypoint.mtxWorld.translation).magnitudeSquared;
                        if (distance < connectionDistance)
                            ƒ.ComponentWaypoint.addConnection(w, waypoint, distance, 1, true);
                    }
                    this.#waypoints.push(waypoint);
                }
            }
        }
    }
    Script.GenerateWaypointsScript = GenerateWaypointsScript;
})(Script || (Script = {}));
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
            // document.addEventListener("interactiveViewportStarted", <EventListener>this.init);
        }
        async init() {
            this.inventory = new Script.Inventory();
            return;
            // for(let i = 0; i < 20; i++){
            //   this.inventory.addItem(new Interactable("Item " + i, "items/item.png"));
            // }
            let dm = new Script.DialogManager();
            dm.showDialog({
                icon: "items/item.png",
                name: "Item",
                text: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Natus corporis ipsa eaque earum sint soluta dignissimos ex est, distinctio eveniet sequi nemo ad quas incidunt tempore nulla cum iure. Obcaecati."
            }, 10);
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
                    { id: "option 1", text: "This is option 1" },
                    { id: "option 2", text: "This is a different option" }
                ]
            });
            console.log("chose", result);
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
        canUseWithItem() {
            return false;
        }
    }
    Script.Interactable = Interactable;
    let INTERACTION_TYPE;
    (function (INTERACTION_TYPE) {
        INTERACTION_TYPE[INTERACTION_TYPE["NONE"] = 0] = "NONE";
        INTERACTION_TYPE[INTERACTION_TYPE["LOOK_AT"] = 1] = "LOOK_AT";
        INTERACTION_TYPE[INTERACTION_TYPE["PICK_UP"] = 2] = "PICK_UP";
        INTERACTION_TYPE[INTERACTION_TYPE["TALK_TO"] = 3] = "TALK_TO";
        INTERACTION_TYPE[INTERACTION_TYPE["DOOR"] = 4] = "DOOR";
        INTERACTION_TYPE[INTERACTION_TYPE["USE"] = 5] = "USE";
    })(INTERACTION_TYPE = Script.INTERACTION_TYPE || (Script.INTERACTION_TYPE = {}));
})(Script || (Script = {}));
var Script;
(function (Script) {
    class Inventory {
        divWrapper = document.getElementById("inventory");
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
    var ƒAid = FudgeAid;
    ƒ.Debug.info("Main Program Template running!");
    document.addEventListener("interactiveViewportStarted", start);
    let mouseIsOverInteractable = false;
    Script.interactableItems = [];
    Script.progress = onChange(JSON.parse(localStorage.getItem("progress")) ?? {}, () => { setTimeout(() => { localStorage.setItem("progress", JSON.stringify(Script.progress)); }, 1); });
    Script.settings = onChange(JSON.parse(localStorage.getItem("settings")) ?? {}, () => { setTimeout(() => { localStorage.setItem("settings", JSON.stringify(Script.settings)); }, 1); });
    function start(_event) {
        Script.mainViewport = _event.detail;
        Script.mainViewport.canvas.addEventListener("dragover", isDroppable);
        Script.mainViewport.canvas.addEventListener("drop", drop);
        Script.mainViewport.canvas.addEventListener("pointermove", pointermove);
        Script.mainViewport.canvas.addEventListener("click", mouseclick);
        Script.mainNode = Script.mainViewport.getBranch();
        Script.mainNode.addEventListener("pointermove", foundNode);
        addInteractionSphere(Script.mainNode);
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
        Script.inventory = new Script.Inventory();
        Script.inventory.addItem(new Script.DefaultViewable("test", "items/item.png"));
    }
    function addInteractionSphere(_node) {
        let meshShpere = new ƒ.MeshSphere("BoundingSphere", 40, 40);
        let material = new ƒ.Material("Transparent", ƒ.ShaderLit, new ƒ.CoatColored(ƒ.Color.CSS("white", 0.5)));
        let children = Script.mainNode.getChildren();
        let wrapper = new ƒ.Node("Wrapper");
        for (let child of children) {
            if (child.nChildren > 0) {
                children.push(...child.getChildren());
            }
            let component = child.getComponent(ƒ.ComponentPick);
            if (component && component.isActive && component.pick === ƒ.PICK.RADIUS) {
                let sphere = new ƒAid.Node("BoundingSphere", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2)), material, meshShpere);
                sphere.mtxLocal.scale(ƒ.Vector3.ONE(child.radius));
                sphere.mtxLocal.translation = child.mtxWorld.translation;
                sphere.getComponent(ƒ.ComponentMaterial).sortForAlpha = true;
                wrapper.addChild(sphere);
            }
        }
        _node.addChild(wrapper);
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        Script.mainViewport.draw();
        ƒ.AudioManager.default.update();
    }
    function pointermove(_event) {
        Script.mainViewport.canvas.classList.remove("cursor-talk", "cursor-take", "cursor-look", "cursor-door", "cursor-use");
        mouseIsOverInteractable = false;
        Script.mainViewport.dispatchPointerEvent(_event);
    }
    function mouseclick(_event) {
        // move character
        if (!Script.character) {
            Script.mainViewport.dispatchPointerEvent(_event);
            return;
        }
        let ray = Script.mainViewport.getRayFromClient(new ƒ.Vector2(_event.clientX, _event.clientY));
        if (ray.direction.y > 0)
            return;
        let smallestDistance = Infinity;
        let closestWaypoint;
        let waypointNode = Script.mainNode.getChildrenByName("waypoints")[0];
        for (let waypoint of waypointNode.getComponents(ƒ.ComponentWaypoint)) {
            let distance = ray.getDistance(waypoint.mtxWorld.translation).magnitudeSquared;
            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestWaypoint = waypoint;
            }
        }
        Script.character.moveTo(closestWaypoint).then(() => {
            Script.mainViewport.dispatchPointerEvent(_event);
        }).catch(() => { });
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
            case Script.INTERACTION_TYPE.DOOR:
                Script.mainViewport.canvas.classList.add("cursor-door");
                break;
            case Script.INTERACTION_TYPE.USE:
                Script.mainViewport.canvas.classList.add("cursor-use");
                break;
            default:
                break;
        }
    }
    Script.foundNode = foundNode;
    function isDroppable(_event) {
        let pick = findPickable(_event);
        if (pick) {
            console.log(pick.node.name);
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
            interactable.tryUseWith(otherInteractable);
        }
    }
    function findPickable(_event) {
        // let picks: ƒ.Pick[] = ƒ.Picker.pickViewport(mainViewport, new ƒ.Vector2(_event.clientX, _event.clientY));
        // for (let pick of picks) {
        //   let cmpPick = pick.node.getComponent(ƒ.ComponentPick);
        //   if (cmpPick && cmpPick.isActive) {
        //     return pick;
        //   }
        // }
        // return null;
        let ray = Script.mainViewport.getRayFromClient(new ƒ.Vector2(_event.clientX, _event.clientY));
        let smallestDistance = Infinity;
        let closestItem;
        let items = Script.mainNode.getChildrenByName("items")[0].getChildren();
        for (let item of items) {
            let pick = item.getComponent(ƒ.ComponentPick);
            if (!pick)
                continue;
            if (!pick.isActive)
                continue;
            let interact = findInteractable(item);
            if (!interact || !interact.isActive)
                continue;
            let distance = ray.getDistance(item.mtxWorld.translation).magnitudeSquared;
            if (pick.node.radius * pick.node.radius > distance)
                continue;
            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestItem = pick;
            }
        }
        return closestItem;
    }
    function findInteractable(_node) {
        return _node.getAllComponents().find(i => i instanceof Script.Interactable);
    }
    function onChange(object, onChange) {
        const handler = {
            get(target, property, receiver) {
                try {
                    return new Proxy(target[property], handler);
                }
                catch (err) {
                    return Reflect.get(target, property, receiver);
                }
            },
            defineProperty(target, property, descriptor) {
                onChange();
                return Reflect.defineProperty(target, property, descriptor);
            },
            deleteProperty(target, property) {
                onChange();
                return Reflect.deleteProperty(target, property);
            }
        };
        return new Proxy(object, handler);
    }
    Script.onChange = onChange;
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
    class BathroomValve extends Script.Interactable {
        text = "...";
        name = "Gegenstand";
        constructor(_name, _image) {
            super(_name, _image);
        }
        getInteractionType() {
            let p = Script.progress.fly?.clean ?? 0;
            if (p && p === 1)
                return Script.INTERACTION_TYPE.USE;
            return Script.INTERACTION_TYPE.LOOK_AT;
        }
        interact() {
            let p = Script.progress.fly?.clean ?? 0;
            switch (p) {
                case 0:
                    Script.CharacterScript.talkAs("Fly", "Ich brauche gerade kein Wasser.");
                    break;
                case 1:
                    Script.CharacterScript.talkAs("Frog", "Der Eimer ist schon voll. Mama hat mir beigebracht, kein Wasser zu verschwenden.");
                    // alert("hier wasser eimer auffüllen einfügen");
                    break;
                case 2:
                    Script.CharacterScript.talkAs("Tadpole", "Der Eimer ist schon voll. Mama hat mir beigebracht, kein Wasser zu verschwenden.", "neutral", [
                        { id: "opt1", text: "This is option 1" },
                        { id: "opt2", text: "This is option 2" },
                        { id: "opt3", text: "This is option 3" }
                    ]);
                    break;
            }
            //@ts-ignore
            if (!Script.progress.fly)
                Script.progress.fly = {};
            // progress.fly.clean = Math.min(2, p + 1);
            Script.progress.fly.clean = 2;
        }
        tryUseWith(_interactable) {
        }
    }
    Script.BathroomValve = BathroomValve;
})(Script || (Script = {}));
var Script;
(function (Script) {
    class DefaultViewable extends Script.Interactable {
        text = "...";
        name = "Gegenstand";
        constructor(_name, _image) {
            super(_name, _image);
        }
        getInteractionType() {
            return Script.INTERACTION_TYPE.LOOK_AT;
        }
        interact() {
            Script.DialogManager.Instance.showDialog({
                icon: this.image,
                name: this.name,
                text: this.text,
                position: "right"
            });
        }
        tryUseWith(_interactable) {
            Script.DialogManager.Instance.showDialog({
                icon: this.image,
                name: this.name,
                text: "Das funktioniert nicht.",
                position: "right"
            });
        }
    }
    Script.DefaultViewable = DefaultViewable;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class Door extends Script.Interactable {
        target = "main";
        constructor(_name, _image) {
            super(_name, _image);
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, () => {
                this.node.radius = 1;
            });
        }
        getInteractionType() {
            return Script.INTERACTION_TYPE.DOOR;
        }
        interact() {
            Script.SceneManager.load(this.target);
        }
        tryUseWith(_interactable) { }
    }
    Script.Door = Door;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class BathroomManager extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(BathroomManager);
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.init.bind(this));
        }
        init() {
        }
    }
    Script.BathroomManager = BathroomManager;
})(Script || (Script = {}));
var Script;
(function (Script) {
    class DialogManager {
        static Instance = new DialogManager();
        #nameBox;
        #textBox;
        #optionBox;
        #characterBox;
        #overlayBox;
        #parentBox;
        #continueIcon;
        #currentDialog;
        #textProgress = 0;
        #currentPromiseResolver;
        #dialogQueue = [];
        constructor() {
            if (DialogManager.Instance)
                return DialogManager.Instance;
            document.addEventListener("DOMContentLoaded", this.initHtml.bind(this));
            DialogManager.Instance = this;
        }
        initHtml() {
            console.log("initHtml");
            this.#parentBox = document.getElementById("dialog");
            this.#nameBox = this.#parentBox.querySelector("#dialog-name");
            this.#textBox = this.#parentBox.querySelector("#dialog-text");
            this.#characterBox = this.#parentBox.querySelector("#dialog-icon");
            this.#optionBox = document.getElementById("dialog-options");
            this.#overlayBox = document.getElementById("dialog-overlay");
            this.#continueIcon = document.getElementById("dialog-text-done");
            this.#overlayBox.addEventListener("click", this.clickedOverlay.bind(this));
        }
        setupDisplay() {
            this.#characterBox.src = this.#currentDialog.icon;
            this.#nameBox.src = this.#currentDialog.name;
            this.#optionBox.classList.add("hidden");
            this.#textBox.innerHTML = "";
            this.#textProgress = 0;
            // this.#status = DialogStatus.WRITING;
            switch (this.#currentDialog.position) {
                case "left":
                    this.#nameBox.style.gridArea = "name";
                    this.#characterBox.style.gridArea = "char";
                    break;
                case "right":
                    this.#nameBox.style.gridArea = "name2";
                    this.#characterBox.style.gridArea = "char2";
                    break;
            }
            this.#overlayBox.classList.remove("hidden");
            this.#parentBox.classList.remove("hidden");
            this.#continueIcon.classList.add("hidden");
        }
        clickedOverlay(_event) {
            this.#textProgress = Infinity;
            if (this.#currentPromiseResolver && !this.#currentDialog.options) {
                this.#currentPromiseResolver();
                this.hideDialog();
            }
        }
        showText(_delay = 10) {
            return new Promise((resolve, reject) => {
                if (_delay <= 0) {
                    this.#textProgress = Infinity;
                }
                let interval = setInterval(() => {
                    this.#textProgress++;
                    [this.#textBox.innerHTML] = this.getTextContent(this.#currentDialog.parsedText, this.#textProgress);
                    if (this.#textProgress >= this.#currentDialog.textLength) {
                        this.#continueIcon.classList.remove("hidden");
                        clearInterval(interval);
                        // this.#status = DialogStatus.WAITING_FOR_DISMISSAL;
                        setTimeout(resolve, 250);
                    }
                }, _delay);
            });
        }
        getTextContent(_dialog, _length) {
            let text = `<span class="${_dialog.class}">`;
            for (let i = 0; i < _dialog.content.length && _length > 0; i++) {
                let content = _dialog.content[i];
                if (typeof content === "string") {
                    text += content.substring(0, _length);
                    _length -= content.length;
                }
                else {
                    let [newText, remainingLength] = this.getTextContent(content, _length);
                    _length = remainingLength;
                    text += newText;
                }
            }
            text += "</span>";
            return [text, _length];
        }
        parseText(_text) {
            try {
                this.#currentDialog.textLength = 0;
                let [dialog] = this.findBracketsRecursive(_text);
                return dialog;
            }
            catch (error) {
                console.error(error);
                this.#currentDialog.textLength = _text.length;
                return { class: "", content: [_text] };
            }
        }
        findBracketsRecursive(_remainingString, _currentOpenClass = "") {
            let openRegex = /\[(?!\/)(.+?)]/g;
            let closeRegex = /\[\/(.+?)]/g;
            let resultDialog = { content: [], class: _currentOpenClass };
            while (_remainingString.length > 0) {
                let nextOpenMatch = [..._remainingString.matchAll(openRegex)][0];
                let nextCloseMatch = [..._remainingString.matchAll(closeRegex)][0];
                if (!nextOpenMatch && !nextCloseMatch) {
                    resultDialog.content.push(_remainingString);
                    this.#currentDialog.textLength += _remainingString.length;
                    return [resultDialog, ""];
                }
                if (_currentOpenClass !== "") {
                    if (!nextCloseMatch)
                        throw new Error(`Parsing error: couldn't find closing tag for [${_currentOpenClass}].`);
                    if (nextCloseMatch[1] !== _currentOpenClass && ((nextOpenMatch && nextOpenMatch.index > nextCloseMatch.index) || !nextOpenMatch))
                        throw new Error(`Parsing error: couldn't find closing tag for [${_currentOpenClass}], found [/${nextCloseMatch[1]}] instead.`);
                }
                if (nextCloseMatch && !nextOpenMatch || (nextCloseMatch && nextOpenMatch && nextCloseMatch.index < nextOpenMatch.index)) {
                    // found the correct closing tag, return just text content
                    resultDialog.content.push(_remainingString.substring(0, nextCloseMatch.index));
                    this.#currentDialog.textLength += nextCloseMatch.index + 1;
                    return [resultDialog,
                        _remainingString.substring(nextCloseMatch.index + nextCloseMatch[0].length)];
                }
                // didn't find the correct closing tag next, do recursive search
                this.#currentDialog.textLength += nextOpenMatch.index + 1;
                resultDialog.content.push(_remainingString.substring(0, nextOpenMatch.index));
                let [result, newString] = this.findBracketsRecursive(_remainingString.substring(nextOpenMatch.index + nextOpenMatch[0].length), nextOpenMatch[1]);
                resultDialog.content.push(result);
                _remainingString = newString;
            }
            return [resultDialog, ""];
        }
        showOptions() {
            this.#continueIcon.classList.add("hidden");
            this.#optionBox.classList.remove("hidden");
            return new Promise((resolve, reject) => {
                this.#optionBox.innerHTML = "";
                for (let option of this.#currentDialog.options) {
                    let button = document.createElement("span");
                    button.classList.add("dialog-options-option");
                    this.#optionBox.appendChild(button);
                    button.innerText = option.text;
                    button.addEventListener("click", () => {
                        resolve(option.id);
                        this.hideDialog();
                    });
                }
            });
        }
        hideDialog() {
            this.#overlayBox.classList.add("hidden");
            this.#parentBox.classList.add("hidden");
        }
        async showDialogInternal(_dialog, _delay = 10) {
            // wait for previous dialogs to be done
            await Promise.all(this.#dialogQueue);
            // clear old existing dialog
            // if (this.#currentPromiseResolver) {
            //     this.#currentPromiseResolver();
            this.#currentPromiseResolver = null;
            // }
            // setup current dialog
            this.#currentDialog = { ..._dialog };
            this.#currentDialog.parsedText = this.parseText(_dialog.text);
            this.setupDisplay();
            // show dialog
            await this.showText(_delay);
            if (_dialog.options)
                return this.showOptions();
            return new Promise((resolve, reject) => {
                this.#currentPromiseResolver = resolve;
            });
        }
        async showDialog(_dialog, _delay = 10) {
            let promise = this.showDialogInternal(_dialog, _delay);
            this.#dialogQueue.push(promise);
            return promise;
        }
    }
    Script.DialogManager = DialogManager;
    let DialogStatus;
    (function (DialogStatus) {
        DialogStatus[DialogStatus["HIDDEN"] = 0] = "HIDDEN";
        DialogStatus[DialogStatus["WRITING"] = 1] = "WRITING";
        DialogStatus[DialogStatus["WAITING_FOR_DISMISSAL"] = 2] = "WAITING_FOR_DISMISSAL";
        DialogStatus[DialogStatus["WAITING_FOR_OPTION"] = 3] = "WAITING_FOR_OPTION";
        DialogStatus[DialogStatus["DONE"] = 4] = "DONE";
    })(DialogStatus || (DialogStatus = {}));
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class MenuManager {
        static Instance = new MenuManager();
        loadingScreen;
        mainMenuScreen;
        optionsScreen;
        constructor() {
            if (MenuManager.Instance)
                return MenuManager.Instance;
            this.setupListeners();
            MenuManager.Instance = this;
        }
        setupListeners() {
            document.addEventListener("DOMContentLoaded", this.setupDomConnection.bind(this));
            ƒ.Project.addEventListener("resourcesLoaded" /* ƒ.EVENT.RESOURCES_LOADED */, () => { this.updateLoadingText("Erschaffe Shader..."); });
            document.addEventListener("interactiveViewportStarted", () => { this.updateLoadingText(); });
        }
        setupDomConnection() {
            this.loadingScreen = document.getElementById("loading-screen");
            this.mainMenuScreen = document.getElementById("main-menu-screen");
            this.optionsScreen = document.getElementById("options-screen");
            this.mainMenuScreen.querySelector("#main-menu-start").addEventListener("click", this.startGame.bind(this));
            this.mainMenuScreen.querySelector("#main-menu-options").addEventListener("click", this.showOptions.bind(this));
            this.mainMenuScreen.querySelector("#main-menu-exit").addEventListener("click", this.exit.bind(this));
            this.optionsScreen.addEventListener("click", this.dismissOptions.bind(this));
            this.optionsScreen.querySelector("#options-music input").addEventListener("input", this.updateSlider.bind(this));
            this.optionsScreen.querySelector("#options-sounds input").addEventListener("input", this.updateSlider.bind(this));
            this.optionsScreen.querySelector("#options-music input").value = Script.settings.music?.toString() ?? "100";
            this.optionsScreen.querySelector("#options-sounds input").value = Script.settings.sounds?.toString() ?? "100";
            this.optionsScreen.querySelector("#options-music input").dispatchEvent(new InputEvent("input"));
            this.optionsScreen.querySelector("#options-sounds input").dispatchEvent(new InputEvent("input"));
            let gameOverlay = document.getElementById("game-overlay");
            gameOverlay.querySelector("img").addEventListener("click", this.showOptions.bind(this));
            document.querySelector("dialog").addEventListener("click", this.showStartScreens.bind(this));
        }
        showStartScreens() {
            this.mainMenuScreen.classList.remove("hidden");
            this.updateLoadingText("Lade Ressourcen...");
        }
        loadingTextTimeout;
        updateLoadingText(_text) {
            console.log("update loading text", _text);
            if (this.loadingTextTimeout)
                clearTimeout(this.loadingTextTimeout);
            this.loadingScreen.classList.remove("hidden");
            if (!_text || _text.length === 0) {
                console.log("remove loading text");
                this.loadingScreen.classList.add("hidden");
                return;
            }
            this.loadingScreen.querySelector("#loading-text").innerText = _text;
            // this.loadingTextTimeout = setTimeout(()=>{this.updateLoadingText(_text + ".")}, 1000);
        }
        startGame() {
            this.mainMenuScreen.classList.add("hidden");
        }
        exit() {
            window.close();
        }
        showOptions() {
            this.optionsScreen.classList.remove("hidden");
        }
        dismissOptions(_event) {
            if (_event.target !== this.optionsScreen)
                return;
            this.optionsScreen.classList.add("hide");
            setTimeout(() => {
                this.optionsScreen.classList.remove("hide");
                this.optionsScreen.classList.add("hidden");
            }, 400);
        }
        updateSlider(_event) {
            let inputElement = _event.target;
            let newValue = inputElement.value;
            inputElement.parentElement.querySelector(".options-slider").style.left = `calc(${newValue}% - 24px)`;
            inputElement.parentElement.querySelector(".options-background-filled").style.clipPath = `polygon(0 0, ${newValue}% 0, ${newValue}% 100%, 0 100%)`;
            if (inputElement.dataset.option) {
                //@ts-ignore
                Script.settings[inputElement.dataset.option] = newValue;
            }
        }
    }
    Script.MenuManager = MenuManager;
})(Script || (Script = {}));
var Script;
(function (Script) {
    class SceneManager extends ƒ.ComponentScript {
        static isTransitioning = false;
        constructor() {
            super();
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, () => {
            //     this.node.addEventListener(ƒ.EVENT.ATTACH_BRANCH, this.node.broadcastEvent.bind(this.node));
            // });
        }
        static load(_name) {
            if (this.isTransitioning)
                return;
            console.log("load scene", _name);
            let sceneToLoad = ƒ.Project.getResourcesByName(_name)[0];
            if (!sceneToLoad || !(sceneToLoad instanceof ƒ.Node))
                return console.error(`scene ${_name} not found.`);
            this.isTransitioning = true;
            let overlay = document.getElementById("scene-overlay");
            overlay.classList.add("active");
            setTimeout(() => {
                //@ts-ignore
                this.loadScene(sceneToLoad);
            }, 1000);
            setTimeout(() => {
                overlay.classList.remove("active");
                this.isTransitioning = false;
            }, 1999);
        }
        static loadScene(_scene) {
            Script.mainNode.removeEventListener("pointermove", Script.foundNode);
            // for(let waypoint of ƒ.ComponentWaypoint.waypoints){
            //     waypoint.node.removeComponent(waypoint);
            // }
            Script.character = null;
            Script.mainViewport.setBranch(_scene);
            Script.mainNode = _scene;
            _scene.addEventListener("pointermove", Script.foundNode);
        }
    }
    Script.SceneManager = SceneManager;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map