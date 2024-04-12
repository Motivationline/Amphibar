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
        initPosition() {
            if (!this.currentTarget) {
                ƒ.Render.prepare(this.node.getAncestor());
                let closestWaypoint = Script.getClosestWaypoint(this.node.getAncestor(), (_translation) => ƒ.Vector3.DIFFERENCE(_translation, this.node.mtxWorld.translation).magnitudeSquared);
                if (!closestWaypoint)
                    return;
                this.moveTo(closestWaypoint);
            }
        }
        setCharacter() {
            Script.character = this;
            this.initPosition();
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
    class Interactable extends ƒ.ComponentScript {
        name;
        image;
        static textProvider;
        constructor(_name, _image) {
            super();
            this.name = _name;
            this.image = _image;
            Script.interactableItems.push(this);
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, () => {
                this.node.addEventListener("click", this.interact.bind(this));
            });
            if (!Interactable.textProvider)
                Interactable.textProvider = new Script.Text();
        }
        static getInteractionText(_object, _item) {
            if (!_object.node) {
                let key = `${_object.name}.interact`;
                let text = Interactable.textProvider.get(key);
                if (text !== key)
                    return text;
                key = `interact`;
                text = Interactable.textProvider.get(key);
                if (text !== key)
                    return text;
                return `${_object.name}.interact`;
            }
            let base = _object.node.getAncestor();
            let key = "";
            if (_item) {
                key = `${base.name}.${_object.name}.interact.${_item.name}`;
                let text = Interactable.textProvider.get(key);
                if (text !== key)
                    return text;
                let itemname = _item.name.split(".")[0];
                key = `${base.name}.${_object.name}.interact.${itemname}`;
                text = Interactable.textProvider.get(key);
                if (text !== key)
                    return text;
            }
            key = `${base.name}.${_object.name}.interact`;
            let text = Interactable.textProvider.get(key);
            if (key !== text)
                return text;
            key = `${base.name}.interact`;
            text = Interactable.textProvider.get(key);
            if (key !== text)
                return text;
            key = `interact`;
            text = Interactable.textProvider.get(key);
            if (key !== text)
                return text;
            return `${base.name}.${_object.name}.interact.${_item?.name ?? ""}`;
        }
        interact() {
            Script.CharacterScript.talkAs("Tadpole", Interactable.getInteractionText(this));
        }
        tryUseWith(_interactable) {
            Script.CharacterScript.talkAs("Tadpole", Interactable.getInteractionText(this, _interactable));
        }
        getInteractionType() {
            return INTERACTION_TYPE.LOOK_AT;
        }
        toHTMLElement() {
            let div = document.createElement("div");
            let name = Interactable.textProvider.get(`item.${this.name}.name`);
            let img = document.createElement("img");
            img.src = this.image;
            img.alt = name;
            div.appendChild(img);
            div.classList.add("item");
            div.draggable = true;
            div.addEventListener("dragstart", addData.bind(this));
            div.addEventListener("drop", tryUseWithEvent.bind(this));
            div.addEventListener("dragover", _ev => { _ev.preventDefault(); });
            div.addEventListener("pointermove", _ev => { Script.MenuManager.Instance.hoverStart(_ev, this); });
            div.addEventListener("pointerleave", _ev => { Script.MenuManager.Instance.hoverEnd(); });
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
        static Instance = new Inventory();
        divInventory;
        divWrapper;
        preview;
        itemsToHTMLMap = new Map();
        constructor() {
            if (Inventory.Instance)
                return Inventory.Instance;
            Inventory.Instance = this;
            document.addEventListener("DOMContentLoaded", () => {
                this.divInventory = document.getElementById("inventory");
                this.divWrapper = document.getElementById("inventory-wrapper");
                this.divWrapper.addEventListener("click", this.toggleInventory.bind(this));
                this.preview = document.getElementById("inventory-preview");
            });
        }
        toggleInventory(_event) {
            let isInventory = _event.target.classList.contains("inventory");
            if (!isInventory)
                return;
            this.divWrapper.classList.toggle("visible");
        }
        updateStorage() {
            let inv = [];
            for (let item of this.itemsToHTMLMap.keys()) {
                inv.push({ name: item.name, image: item.image });
            }
            localStorage.setItem("inventory", JSON.stringify(inv));
        }
        addItem(_item) {
            if (!this.itemsToHTMLMap.has(_item)) {
                let element = _item.toHTMLElement();
                this.divInventory.appendChild(element);
                this.itemsToHTMLMap.set(_item, element);
                this.updateStorage();
                this.preview.innerHTML = "";
                this.preview.appendChild(_item.toHTMLElement());
                this.preview.classList.add("show");
                setTimeout(() => { this.preview.classList.remove("show"); }, 1200);
            }
        }
        removeItem(_item) {
            let element = this.itemsToHTMLMap.get(_item);
            if (element) {
                this.itemsToHTMLMap.delete(_item);
                this.divInventory.removeChild(element);
                this.updateStorage();
            }
        }
        hasItem(_nameOrItem) {
            if (typeof _nameOrItem === "string") {
                for (let item of this.itemsToHTMLMap.keys()) {
                    if (item.name === _nameOrItem)
                        return item;
                }
            }
            else {
                if (this.itemsToHTMLMap.has(_nameOrItem)) {
                    return _nameOrItem;
                }
            }
            return null;
        }
        hasItemThatStartsWith(_name) {
            for (let item of this.itemsToHTMLMap.keys()) {
                if (item.name.startsWith(_name))
                    return item;
            }
            return null;
        }
    }
    Script.Inventory = Inventory;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    document.addEventListener("interactiveViewportStarted", start);
    Script.interactableItems = [];
    let progressDefault = { fly: { clean: 0, drink: 0, intro: false, worm: 0, done: false }, scene: "bath", frog: { intro: false, music: false, checked_door: false, key: false } };
    let settingsDefault = { music: 100, sounds: 100 };
    Script.progress = onChange(merge(progressDefault, (JSON.parse(localStorage.getItem("progress")) ?? {})), () => { setTimeout(() => { localStorage.setItem("progress", JSON.stringify(Script.progress)); }, 1); });
    Script.settings = onChange(merge(settingsDefault, (JSON.parse(localStorage.getItem("settings")) ?? {})), () => { setTimeout(() => { localStorage.setItem("settings", JSON.stringify(Script.settings)); }, 1); });
    function start(_event) {
        let invFromStorage = JSON.parse(localStorage.getItem("inventory")) ?? [];
        for (let item of invFromStorage) {
            Script.Inventory.Instance.addItem(new Script.Interactable(item.name, item.image));
        }
        Script.mainViewport = _event.detail;
        Script.mainViewport.canvas.addEventListener("dragover", dragOverViewport);
        Script.mainViewport.canvas.addEventListener("drop", dropOverViewport);
        Script.mainViewport.canvas.addEventListener("pointermove", pointermove);
        Script.mainViewport.canvas.addEventListener("click", mouseclick);
        setupNewMainNode(Script.mainViewport.getBranch());
        // addInteractionSphere(mainNode);
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function setupNewMainNode(_node) {
        if (Script.mainNode) {
            Script.mainNode.removeEventListener("pointermove", foundNode);
            Script.mainNode.removeEventListener("dragover", dragOverNode);
            Script.mainNode.removeEventListener("drop", dropOverNode);
            Script.mainNode.removeEventListener("clickOnInteraction", clickOnInteraction);
        }
        Script.mainNode = _node;
        Script.mainNode.addEventListener("pointermove", foundNode);
        Script.mainNode.addEventListener("dragover", dragOverNode);
        Script.mainNode.addEventListener("drop", dropOverNode);
        Script.mainNode.addEventListener("clickOnInteraction", clickOnInteraction);
    }
    Script.setupNewMainNode = setupNewMainNode;
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
    let hoveredInteractable;
    function pointermove(_event) {
        hoveredInteractable = null;
        Script.mainViewport.dispatchPointerEvent(_event);
        Script.mainViewport.canvas.classList.remove("cursor-talk", "cursor-take", "cursor-look", "cursor-door", "cursor-use");
        if (!hoveredInteractable) {
            Script.MenuManager.Instance.hoverEnd();
            return;
        }
        ;
        let type = hoveredInteractable.getInteractionType();
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
    let clickedInteractionWaypoint;
    function mouseclick(_event) {
        // move character
        if (!Script.character) {
            Script.mainViewport.dispatchPointerEvent(_event);
            return;
        }
        clickedInteractionWaypoint = null;
        Script.mainViewport.dispatchPointerEvent(new PointerEvent("clickOnInteraction", { clientX: _event.clientX, clientY: _event.clientY, bubbles: true }));
        if (!clickedInteractionWaypoint) {
            let ray = Script.mainViewport.getRayFromClient(new ƒ.Vector2(_event.clientX, _event.clientY));
            if (ray.direction.y > 0)
                return;
            clickedInteractionWaypoint = getClosestWaypoint(Script.mainNode, (_translation) => ray.getDistance(_translation).magnitudeSquared);
        }
        Script.character.moveTo(clickedInteractionWaypoint).then(() => {
            Script.mainViewport.dispatchPointerEvent(_event);
        }).catch(() => { });
    }
    function clickOnInteraction(_event) {
        let nodeTranslation = _event.target.mtxWorld.translation;
        clickedInteractionWaypoint = getClosestWaypoint(Script.mainNode, (_translation) => ƒ.Vector3.DIFFERENCE(nodeTranslation, _translation).magnitudeSquared);
    }
    function getClosestWaypoint(_mainNode, distanceFunction) {
        let smallestDistance = Infinity;
        let closestWaypoint;
        let waypointNode = _mainNode.getChildrenByName("waypoints")[0];
        for (let waypoint of waypointNode.getComponents(ƒ.ComponentWaypoint)) {
            let distance = distanceFunction(waypoint.mtxWorld.translation);
            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestWaypoint = waypoint;
            }
        }
        return closestWaypoint;
    }
    Script.getClosestWaypoint = getClosestWaypoint;
    function foundNode(_event) {
        let node = _event.target;
        let interactable = findInteractable(node);
        if (!interactable)
            return;
        hoveredInteractable = interactable;
        Script.MenuManager.Instance.hoverStart(_event, interactable);
    }
    Script.foundNode = foundNode;
    //#region Drag & Drop
    function dragOverViewport(_event) {
        //@ts-ignore
        Script.mainViewport.dispatchPointerEvent(_event);
    }
    function dragOverNode(_event) {
        _event.preventDefault();
    }
    function dropOverViewport(_event) {
        //@ts-ignore
        Script.mainViewport.dispatchPointerEvent(_event);
    }
    function dropOverNode(_event) {
        let node = _event.target;
        let interactable = findInteractable(node);
        if (!interactable)
            return;
        let otherInteractableName = _event.dataTransfer.getData("interactable");
        let otherInteractable = Script.interactableItems.find(i => i.name === otherInteractableName);
        console.log("dropped", otherInteractable.name, "onto", interactable.name);
        interactable.tryUseWith(otherInteractable);
    }
    //#endregion
    function findInteractable(_node) {
        return _node.getAllComponents().find(i => i instanceof Script.Interactable);
    }
    //#endregion
    //#region Helper Functions
    /** Helper function to set up a (deep) proxy object that calls the onChange function __before__ the element is modified*/
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
    /** Deep merges the _updates object into the _current object. */
    function merge(_current, _updates) {
        for (let key of Object.keys(_updates)) {
            if (!_current.hasOwnProperty(key) || typeof _updates[key] !== 'object')
                _current[key] = _updates[key];
            else
                merge(_current[key], _updates[key]);
        }
        return _current;
    }
    Script.merge = merge;
    //#endregion
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
    class Text {
        static instance = new Text();
        textData;
        constructor() {
            if (Text.instance)
                return Text.instance;
            Text.instance = this;
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.load();
        }
        async load() {
            let response = await fetch("./Assets/Text/de_de.json");
            this.textData = await response.json();
        }
        get(identifier, ...replacements) {
            let text = this.textData[identifier];
            if (!text)
                return identifier;
            if (typeof text !== "string")
                text = text[Math.floor(Math.random() * text.length)];
            while (replacements.length > 0) {
                text = text.replace("%s", replacements.shift());
            }
            return text;
        }
    }
    Script.Text = Text;
})(Script || (Script = {}));
var Script;
(function (Script) {
    class BathroomBucket extends Script.Interactable {
        text = "...";
        name = "Bucket";
        constructor(_name, _image) {
            super(_name, _image);
        }
        interact() {
            let p = Script.progress.fly?.clean ?? 0;
            if (p <= 1) {
                Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("bath.bucket.interact.0"));
                return;
            }
            if (p === 2) {
                Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("bath.bucket.interact.1"));
                return;
            }
            if (p === 3) {
                Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("bath.bucket_full.interact.0"));
                return;
            }
            if (p >= 4) {
                Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("bath.bucket_full.interact.1"));
                return;
            }
        }
        tryUseWith(_interactable) {
            if (Script.progress.fly.clean >= 3) {
                this.name = "bucket_full";
            }
            super.tryUseWith(_interactable);
        }
    }
    Script.BathroomBucket = BathroomBucket;
})(Script || (Script = {}));
var Script;
(function (Script) {
    class BathroomValve extends Script.Interactable {
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
            let p = Script.progress.fly.clean;
            switch (p) {
                case 0:
                case 1:
                    Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("bath.valve.interact.0"));
                    break;
                case 2:
                    // TODO: hier wasser eimer auffüllen einfügen
                    // progress.fly.clean = Math.min(2, p + 1);
                    Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("bath.valve.interact.1"));
                    Script.progress.fly.clean++;
                    break;
                case 3:
                    Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("bath.valve.interact.2"));
                    break;
            }
        }
    }
    Script.BathroomValve = BathroomValve;
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
    class DoorBar extends Script.Interactable {
        target = "done";
        locked = true;
        constructor(_name, _image) {
            super(_name, _image);
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
        }
        getInteractionType() {
            return Script.INTERACTION_TYPE.DOOR;
        }
        interact() {
            Script.progress.frog.checked_door = true;
            if (this.locked) {
                Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.tadpole.door_locked"));
                return;
            }
            Script.SceneManager.load(this.target);
        }
        tryUseWith(_interactable) {
            if (_interactable.name === "key") {
                Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.tadpole.door_unlocked"));
                this.locked = false;
                Script.Inventory.Instance.removeItem(_interactable);
                return;
            }
        }
    }
    Script.DoorBar = DoorBar;
})(Script || (Script = {}));
var Script;
(function (Script) {
    class Fly extends Script.Interactable {
        #wantedIngredients = this.randomDrinkOrLoad();
        randomDrinkOrLoad() {
            let result = JSON.parse(localStorage.getItem("fly_wants") ?? "[]");
            if (result.length >= 2)
                return result;
            let amtIngredients = Math.floor(Math.random() * 2) + 2;
            let allIngredients = ["bachwasser", "goldnektar", "schlammsprudel", "seerosenextrakt"];
            let ingredients = [];
            while (amtIngredients > 0) {
                ingredients.push(...allIngredients.splice(Math.floor(Math.random() * allIngredients.length), 1));
                amtIngredients--;
            }
            localStorage.setItem("fly_wants", JSON.stringify(ingredients));
            return ingredients;
        }
        getInteractionType() {
            return Script.INTERACTION_TYPE.TALK_TO;
        }
        tryUseWith(_interactable) {
            if (!_interactable.name.startsWith("glass.")) {
                Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.no_item"));
                return;
            }
            if (Script.progress.fly.drink == 2) {
                Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.drink.done"));
                return;
            }
            Script.Inventory.Instance.removeItem(_interactable);
            let cocktail = _interactable.name.split(".")[1];
            let ingredients = new Set(Script.CocktailManager.unmix(cocktail));
            let wanted = new Set(this.#wantedIngredients);
            for (let ingredient of wanted) {
                if (ingredients.has(ingredient)) {
                    ingredients.delete(ingredient);
                    wanted.delete(ingredient);
                }
            }
            if (wanted.size > 0) {
                Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.drink.too_little", Script.Interactable.textProvider.get(`item.glass.${[...wanted][0]}.name`)));
                return;
            }
            if (ingredients.size > 0) {
                Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.drink.too_much", Script.Interactable.textProvider.get(`item.glass.${[...ingredients][0]}.name`)));
                return;
            }
            Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.drink.like"));
            Script.progress.fly.drink = 2;
        }
        async interact() {
            // fly dialogue
            // intro
            if (!Script.progress.fly.intro) {
                Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.intro.0"));
                Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.fly.intro.1"));
                Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.intro.2"));
                Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.fly.intro.3"));
                let result = await Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.intro.4"), "neutral", [
                    { id: "offer", text: Script.Interactable.textProvider.get("character.fly.intro.offer_help") },
                    { id: "request", text: Script.Interactable.textProvider.get("character.fly.intro.request_help") },
                ]);
                if (result === "request") {
                    Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.fly.intro.5"));
                    Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.intro.6"));
                }
                Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.fly.intro.7"));
                Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.intro.8"));
                Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.fly.intro.9"));
            }
            // is there still something to help with?
            let options = [];
            // cleaning?
            if (Script.progress.fly.clean <= 4) {
                options.push({ id: "clean", "text": Script.Interactable.textProvider.get("character.fly.intro.option.clean") });
            }
            else if (Script.progress.fly.clean === 5) {
                options.push({ id: "clean-done", "text": Script.Interactable.textProvider.get("character.fly.intro.option.clean.done") });
            }
            // drink?
            if (Script.progress.fly.drink <= 1) {
                options.push({ id: "drink", "text": Script.Interactable.textProvider.get("character.fly.intro.option.drink") });
            }
            // polite or not?
            if (Script.progress.fly.intro) {
                options.push({ id: "cancel", "text": Script.Interactable.textProvider.get("character.fly.intro.option.cancel") });
            }
            else {
                options.push({ id: "bye", "text": Script.Interactable.textProvider.get("character.fly.intro.option.bye") });
            }
            if (options.length > 1) {
                let choice;
                while (choice !== "cancel" && choice !== "bye" && options.length > 1) {
                    if (!Script.progress.fly.intro) {
                        choice = await Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.intro.help"), "neutral", options);
                    }
                    else {
                        choice = await Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.dialog"), "neutral", options);
                    }
                    switch (choice) {
                        case "clean":
                            Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.fly.clean.question"));
                            Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.clean.info"));
                            Script.progress.fly.clean = 1;
                            break;
                        case "drink":
                            Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.fly.drink.question"));
                            Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.drink.info"));
                            Script.progress.fly.drink = 1;
                            break;
                        case "clean-done":
                            Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.fly.clean.done.1"));
                            Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.clean.done.2"));
                            options.splice(options.findIndex((opt) => opt.id === "clean-done"));
                            Script.progress.fly.clean = 6;
                            break;
                    }
                    options[options.length - 1] = { id: "bye", "text": Script.Interactable.textProvider.get("character.fly.intro.option.bye") };
                    Script.progress.fly.intro = true;
                }
                if (choice === "cancel")
                    Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.fly.intro.cancel"));
                if (choice === "bye")
                    Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.fly.intro.bye"));
                return;
            }
            // nothing to help with anymore but text wasn't seen yet.
            if (!Script.progress.fly.done) {
                Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.dialog"));
                Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.fly.dialog.done.0"));
                Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.dialog.done.1"));
                Script.progress.fly.done = true;
                Script.progress.frog.music = true;
                // TODO: play music animation
                return;
            }
            Script.CharacterScript.talkAs("Fly", Script.Interactable.textProvider.get("character.fly.dialog.done.filler"));
        }
    }
    Script.Fly = Fly;
})(Script || (Script = {}));
var Script;
(function (Script) {
    class Frog extends Script.Interactable {
        getInteractionType() {
            return Script.INTERACTION_TYPE.TALK_TO;
        }
        tryUseWith(_interactable) {
            Script.CharacterScript.talkAs("Frog", Script.Interactable.textProvider.get("character.frog.no_item"));
            return;
        }
        async interact() {
            // frog dialogue
            // intro
            if (!Script.progress.frog.intro) {
                let result = await Script.CharacterScript.talkAs("Frog", Script.Interactable.textProvider.get("character.frog.intro.0"), "neutral", [
                    { id: "intro", text: Script.Interactable.textProvider.get("character.frog.intro.option.intro") },
                    { id: "help", text: Script.Interactable.textProvider.get("character.frog.intro.option.help") },
                ]);
                if (result === "intro") {
                    Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.frog.intro.1"));
                    Script.CharacterScript.talkAs("Frog", Script.Interactable.textProvider.get("character.frog.intro.2"));
                    Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.frog.intro.3"));
                }
                else {
                    Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.frog.intro.3_2"));
                }
                Script.CharacterScript.talkAs("Frog", Script.Interactable.textProvider.get("character.frog.intro.4"));
                await Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.frog.intro.5"));
                Script.progress.frog.intro = true;
                return;
            }
            // we don't know yet that the door is closed
            if (!Script.progress.frog.music && !Script.progress.frog.checked_door) {
                Script.CharacterScript.talkAs("Frog", Script.Interactable.textProvider.get("character.frog.intro.go_away"));
                return;
            }
            // we know now that the door is closed
            if (!Script.progress.frog.music && Script.progress.frog.checked_door) {
                let result = await Script.CharacterScript.talkAs("Frog", Script.Interactable.textProvider.get("character.frog.dialog.0"), "neutral", [
                    { id: "closed", text: Script.Interactable.textProvider.get("character.frog.dialog.option.door_closed") },
                    { id: "sorry", text: Script.Interactable.textProvider.get("character.frog.dialog.option.sorry") },
                ]);
                if (result !== "closed")
                    return;
                Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.frog.dialog.1"));
                result = await Script.CharacterScript.talkAs("Frog", Script.Interactable.textProvider.get("character.frog.dialog.2"), "neutral", [
                    { id: "door", text: Script.Interactable.textProvider.get("character.frog.dialog.option.door") },
                    { id: "sorry", text: Script.Interactable.textProvider.get("character.frog.dialog.option.sorry") },
                ]);
                if (result === "sorry") {
                    Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.frog.dialog.3"));
                    Script.CharacterScript.talkAs("Frog", Script.Interactable.textProvider.get("character.frog.dialog.4"));
                    return;
                }
                if (result === "door") {
                    Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.frog.dialog.5"));
                    Script.CharacterScript.talkAs("Frog", Script.Interactable.textProvider.get("character.frog.dialog.6"));
                    Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.frog.dialog.7"));
                    Script.CharacterScript.talkAs("Frog", Script.Interactable.textProvider.get("character.frog.dialog.8"));
                    return;
                }
                return;
            }
            // music is playing, but no key yet
            if (Script.progress.frog.music && !Script.progress.frog.key) {
                await Script.CharacterScript.talkAs("Frog", Script.Interactable.textProvider.get("character.frog.music.1"), "neutral", [
                    { id: "help", text: Script.Interactable.textProvider.get("character.frog.music.option.help") },
                ]);
                await Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.frog.music.2"));
                await Script.CharacterScript.talkAs("Frog", Script.Interactable.textProvider.get("character.frog.music.3"));
                await Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("character.frog.music.4"));
                Script.Inventory.Instance.addItem(new Script.Interactable("key", "Assets/UI/Inventar/Item_Key.png"));
                Script.progress.frog.key = true;
                return;
            }
            // we already gave the key
            Script.CharacterScript.talkAs("Frog", Script.Interactable.textProvider.get("character.frog.done"));
        }
    }
    Script.Frog = Frog;
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
            return new Promise((resolve) => {
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
            return new Promise((resolve) => {
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
            return new Promise((resolve) => {
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
        gameOverlay;
        disableOverlay;
        itemHover;
        loadingScreenMinimumVisibleTimeMS = 4000;
        constructor() {
            if (MenuManager.Instance)
                return MenuManager.Instance;
            MenuManager.Instance = this;
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.setupListeners();
        }
        setupListeners() {
            document.addEventListener("DOMContentLoaded", this.setupDomConnection.bind(this));
            // ƒ.Project.addEventListener(ƒ.EVENT.RESOURCES_LOADED, () => { this.updateLoadingText("Erschaffe Shader..."); })
            document.addEventListener("interactiveViewportStarted", this.gameLoaded.bind(this));
        }
        setupDomConnection() {
            this.loadingScreen = document.getElementById("loading-screen");
            this.mainMenuScreen = document.getElementById("main-menu-screen");
            this.optionsScreen = document.getElementById("options-screen");
            this.disableOverlay = document.getElementById("disable-overlay");
            this.itemHover = document.getElementById("hover-item-name");
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
            this.gameOverlay = document.getElementById("game-overlay");
            this.gameOverlay.querySelector("img").addEventListener("click", this.showOptions.bind(this));
            document.querySelector("dialog").addEventListener("click", this.showStartScreens.bind(this));
        }
        showStartScreens() {
            this.mainMenuScreen.classList.remove("hidden");
            // this.updateLoadingText("Lade Ressourcen...");
            this.loadingScreen.classList.remove("hidden");
        }
        hideLoadingScreen() {
            this.loadingScreen.classList.add("hidden");
            this.gameOverlay.classList.remove("hidden");
            Script.SceneManager.load(Script.progress.scene, true);
        }
        gameWasStarted = false;
        startGame() {
            this.mainMenuScreen.classList.add("hidden");
            setTimeout(() => {
                this.gameWasStarted = true;
                if (this.gameIsLoaded) {
                    this.hideLoadingScreen();
                    return;
                }
            }, this.loadingScreenMinimumVisibleTimeMS);
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
        gameIsLoaded = false;
        gameLoaded() {
            this.gameIsLoaded = true;
            if (this.gameWasStarted) {
                this.hideLoadingScreen();
            }
        }
        inputDisable() {
            this.disableOverlay.classList.remove("hidden");
            this.hoverEnd();
        }
        inputEnable() {
            this.disableOverlay.classList.add("hidden");
        }
        //#region Item hover
        hoverStart(_event, _interactable) {
            this.itemHover.innerText = Script.Interactable.textProvider.get(`item.${_interactable.name}.name`);
            this.itemHover.style.top = _event.clientY + "px";
            this.itemHover.style.left = _event.clientX + "px";
            this.itemHover.classList.remove("hidden");
        }
        hoverEnd() {
            this.itemHover.classList.add("hidden");
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
        }
        static load(_name, _noTransition = false) {
            if (this.isTransitioning)
                return;
            console.log("load scene", _name);
            let sceneToLoad = ƒ.Project.getResourcesByName(_name)[0];
            if (!sceneToLoad || !(sceneToLoad instanceof ƒ.Node))
                return console.error(`scene ${_name} not found.`);
            Script.progress.scene = _name;
            if (_noTransition) {
                this.loadScene(sceneToLoad);
                return;
            }
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
            // for(let waypoint of ƒ.ComponentWaypoint.waypoints){
            //     waypoint.node.removeComponent(waypoint);
            // }
            Script.character = null;
            Script.mainViewport.setBranch(_scene);
            Script.mainViewport.camera = this.getFirstComponentCamera(_scene);
            Script.setupNewMainNode(_scene);
            _scene.addEventListener("pointermove", Script.foundNode);
        }
        static getFirstComponentCamera(node) {
            for (let n of node.getChildren()) {
                let cam = n.getComponent(ƒ.ComponentCamera);
                if (cam)
                    return cam;
                let childCam = SceneManager.getFirstComponentCamera(n);
                if (childCam)
                    return cam;
            }
            return null;
        }
    }
    Script.SceneManager = SceneManager;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class CocktailGlass extends Script.Interactable {
        emptyGlass;
        cocktails = new Map();
        currentCocktail;
        constructor(_name, _image) {
            super(_name, _image);
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, () => {
                this.emptyGlass = this.node.getChild(0);
            });
            Script.CocktailManager.glass = this;
            ƒ.Project.addEventListener("resourcesLoaded" /* ƒ.EVENT.RESOURCES_LOADED */, () => {
                for (let name of Script.CocktailManager.allCocktails) {
                    this.cocktails.set(name, ƒ.Project.getResourcesByName(name)[0]);
                }
            });
        }
        getInteractionType() {
            if (Script.CocktailManager.Instance.ingredients.length === 0) {
                return Script.INTERACTION_TYPE.LOOK_AT;
            }
            return Script.INTERACTION_TYPE.PICK_UP;
        }
        async interact() {
            if (Script.CocktailManager.Instance.ingredients.length === 0) {
                Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("cocktail.glass.empty"));
                return;
            }
            let result = await Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("cocktail.glass.take"), "neutral", [
                { id: "confirm", text: Script.Interactable.textProvider.get("cocktail.glass.take.confirm") },
                { id: "cancel", text: Script.Interactable.textProvider.get("cocktail.glass.take.cancel") },
            ]);
            if (result !== "confirm")
                return;
            Script.CocktailManager.Instance.takeCocktail();
        }
        setCocktail(_name) {
            if (this.currentCocktail)
                this.node.removeChild(this.currentCocktail);
            if (!_name || !this.cocktails.has(_name)) {
                this.emptyGlass.activate(true);
                this.currentCocktail = null;
                this.name = "glass";
                return;
            }
            this.emptyGlass.activate(false);
            let newCocktail = this.cocktails.get(_name);
            this.node.addChild(newCocktail);
            this.currentCocktail = newCocktail;
            this.name = _name;
        }
    }
    Script.CocktailGlass = CocktailGlass;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class CocktailInteractableIngredient extends Script.Interactable {
        ingredient = CocktailIngredient.Bachwasser;
        cmpAnimator;
        constructor(_name) {
            super(_name);
            if (ƒ.Project.mode === ƒ.MODE.EDITOR)
                return;
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, () => {
                this.cmpAnimator = this.node.getComponent(ƒ.ComponentAnimator);
                if (!this.cmpAnimator) {
                    for (let child of this.node.getChildren()) {
                        this.cmpAnimator = child.getComponent(ƒ.ComponentAnimator);
                        if (this.cmpAnimator)
                            break;
                    }
                }
                this.cmpAnimator?.addEventListener("LiquidPour", this.pouringDone.bind(this));
            });
        }
        pouringDone() {
            if (this.promiseResolver) {
                this.promiseResolver();
                this.promiseResolver = null;
            }
        }
        getInteractionType() {
            if (Script.CocktailManager.Instance.ingredients.length >= 3)
                return Script.INTERACTION_TYPE.LOOK_AT;
            return Script.INTERACTION_TYPE.USE;
        }
        // tryUseWith(_interactable: Interactable): void {
        // }
        promiseResolver;
        interact() {
            if (Script.CocktailManager.Instance.ingredients.length >= 3) {
                Script.CharacterScript.talkAs("Tadpole", Script.Text.instance.get("cocktails.full"));
                return;
            }
            let promise = new Promise((resolve) => {
                this.promiseResolver = resolve;
            });
            if (!Script.CocktailManager.Instance.addIngredient(this.ingredient, promise)) {
                return;
            }
            Script.MenuManager.Instance.inputDisable();
            //TODO: play animation and enable interaction after animation instead of after timeout
            if (this.cmpAnimator) {
                this.cmpAnimator.jumpTo(0);
                setTimeout(() => {
                    Script.MenuManager.Instance.inputEnable();
                }, this.cmpAnimator.animation.totalTime);
            }
            else {
                setTimeout(() => {
                    this.pouringDone();
                    Script.MenuManager.Instance.inputEnable();
                }, 1000);
            }
        }
        getMutatorAttributeTypes(_mutator) {
            let types = super.getMutatorAttributeTypes(_mutator);
            if (types.ingredient)
                types.ingredient = CocktailIngredient;
            return types;
        }
    }
    Script.CocktailInteractableIngredient = CocktailInteractableIngredient;
    let CocktailIngredient;
    (function (CocktailIngredient) {
        CocktailIngredient[CocktailIngredient["Bachwasser"] = 1] = "Bachwasser";
        CocktailIngredient[CocktailIngredient["Goldnektar"] = 2] = "Goldnektar";
        CocktailIngredient[CocktailIngredient["Schlammsprudel"] = 4] = "Schlammsprudel";
        CocktailIngredient[CocktailIngredient["Seerosenextrakt"] = 8] = "Seerosenextrakt";
    })(CocktailIngredient = Script.CocktailIngredient || (Script.CocktailIngredient = {}));
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class CocktailManager extends ƒ.ComponentScript {
        static Instance = new CocktailManager();
        static mixTable = [
            /*1*/ "bachwasser",
            /*2*/ "goldnektar",
            /*3*/ "goldwasser",
            /*4*/ "schlammsprudel",
            /*5*/ "schlammfluss",
            /*6*/ "matschsaft",
            /*7*/ "nektarquelle",
            /*8*/ "seerosenextrakt",
            /*9*/ "bachblütenzauber",
            /*10*/ "goldrosenelixir",
            /*11*/ "bachblütennektar",
            /*12*/ "sumpfrosensprudel",
            /*13*/ "sumpfrosenschorle",
            /*14*/ "goldrosenmatsch",
        ];
        currentIngredients = [];
        static glass;
        constructor() {
            super();
            if (CocktailManager.Instance)
                return CocktailManager.Instance;
            CocktailManager.Instance = this;
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
        }
        get currentCocktail() {
            return CocktailManager.mix(...this.currentIngredients);
        }
        addIngredient(_ingredient, _waitFor) {
            if (this.currentIngredients.length >= 3) {
                Script.CharacterScript.talkAs("Tadpole", Script.Text.instance.get("cocktail.full"));
                return false;
            }
            this.currentIngredients.push(_ingredient);
            if (CocktailManager.glass) {
                if (_waitFor) {
                    _waitFor.then(() => {
                        CocktailManager.glass.setCocktail(this.currentCocktail);
                    });
                }
                else {
                    CocktailManager.glass.setCocktail(this.currentCocktail);
                }
            }
            return true;
        }
        static mix(..._ingredients) {
            let set = new Set(_ingredients);
            let result = Array.from(set).reduce((prev, current) => prev + current, -1);
            if (this.mixTable[result])
                return this.mixTable[result];
            return "unknown";
        }
        static unmix(_cocktail) {
            let index = this.mixTable.indexOf(_cocktail) + 1;
            if (index === 0)
                return [];
            let pow = getPowersOf2(index);
            let ingredients = [];
            pow.forEach(p => ingredients.push(this.mixTable[p - 1]));
            return ingredients;
            function getPowersOf2(_num) {
                let factors = [];
                let nums = _num.toString(2).split("");
                nums.forEach((element, index) => { if (Number(element) > 0)
                    factors.push(Math.pow(2, nums.length - 1 - index)); });
                return factors;
            }
        }
        get ingredients() {
            return Array.from(this.currentIngredients);
        }
        static get allCocktails() {
            return Array.from(this.mixTable);
        }
        resetCocktail(_bar, _inventory) {
            let glassInInventory = Script.Inventory.Instance.hasItemThatStartsWith("glass");
            if (glassInInventory && _inventory) {
                Script.Inventory.Instance.removeItem(glassInInventory);
            }
            if (!_bar)
                return;
            this.currentIngredients.length = 0;
            // TODO update visuals of glass
            if (CocktailManager.glass) {
                CocktailManager.glass.setCocktail();
            }
        }
        takeCocktail() {
            let current = this.currentCocktail;
            this.resetCocktail(true, true);
            Script.Inventory.Instance.addItem(new Script.Interactable(`glass.${current}`, `Assets/UI/Inventar/Cocktail/${current}.png`));
        }
    }
    Script.CocktailManager = CocktailManager;
})(Script || (Script = {}));
var Script;
(function (Script) {
    class CocktailTrash extends Script.Interactable {
        getInteractionType() {
            return Script.INTERACTION_TYPE.USE;
        }
        async interact(_event, _fromInventory = false) {
            if (Script.CocktailManager.Instance.ingredients.length === 0 && !_fromInventory) {
                Script.CharacterScript.talkAs("Tadpole", Script.Text.instance.get("cocktail.trash.info"));
                return;
            }
            let result = await Script.CharacterScript.talkAs("Tadpole", Script.Interactable.textProvider.get("cocktail.trash.confirm"), "neutral", [
                { id: "confirm", text: Script.Interactable.textProvider.get("cocktail.trash.option.confirm") },
                { id: "cancel", text: Script.Interactable.textProvider.get("cocktail.trash.option.cancel") },
            ]);
            if (result !== "confirm")
                return;
            Script.CocktailManager.Instance.resetCocktail(!_fromInventory, _fromInventory);
        }
        tryUseWith(_interactable) {
            if (_interactable.name.startsWith("glass"))
                this.interact(null, true);
        }
    }
    Script.CocktailTrash = CocktailTrash;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map