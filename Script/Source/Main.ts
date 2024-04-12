namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  export let mainViewport: ƒ.Viewport;
  export let mainNode: ƒ.Node;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);
  export const interactableItems: Interactable[] = [];
  export let character: CharacterScript;

  let progressDefault: Progress = { fly: { clean: 0, drink: 0, intro: false, worm: 0, done: false }, scene: "bath", frog: { intro: false, music: false, checked_door: false, key: false } };
  let settingsDefault: Settings = { music: 100, sounds: 100 };
  export let progress: Progress = onChange(
    merge(progressDefault, (JSON.parse(localStorage.getItem("progress")) ?? {})),
    () => { setTimeout(() => { localStorage.setItem("progress", JSON.stringify(progress)) }, 1) });
  export let settings: Settings = onChange(
    merge(settingsDefault, (JSON.parse(localStorage.getItem("settings")) ?? {})),
    () => { setTimeout(() => { localStorage.setItem("settings", JSON.stringify(settings)) }, 1) });


  function start(_event: CustomEvent): void {
    let invFromStorage = JSON.parse(localStorage.getItem("inventory")) ?? [];
    for (let item of invFromStorage) {
      Inventory.Instance.addItem(new Interactable(item.name, item.image));
    }
    mainViewport = _event.detail;
    mainViewport.canvas.addEventListener("dragover", dragOverViewport)
    mainViewport.canvas.addEventListener("drop", dropOverViewport)
    mainViewport.canvas.addEventListener("pointermove", <EventListener>pointermove);
    mainViewport.canvas.addEventListener("click", <EventListener>mouseclick);

    setupNewMainNode(mainViewport.getBranch());

    // addInteractionSphere(mainNode);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  export function setupNewMainNode(_node: ƒ.Node) {
    if (mainNode) {
      mainNode.removeEventListener("pointermove", <EventListener>foundNode);
      mainNode.removeEventListener("dragover", <EventListener>dragOverNode);
      mainNode.removeEventListener("drop", <EventListener>dropOverNode);
      mainNode.removeEventListener("clickOnInteraction", <EventListener>clickOnInteraction);
    }

    mainNode = _node;
    mainNode.addEventListener("pointermove", <EventListener>foundNode);
    mainNode.addEventListener("dragover", <EventListener>dragOverNode);
    mainNode.addEventListener("drop", <EventListener>dropOverNode);
    mainNode.addEventListener("clickOnInteraction", <EventListener>clickOnInteraction);
  }

  function addInteractionSphere(_node: ƒ.Node) {
    let meshShpere: ƒ.MeshSphere = new ƒ.MeshSphere("BoundingSphere", 40, 40);
    let material: ƒ.Material = new ƒ.Material("Transparent", ƒ.ShaderLit, new ƒ.CoatColored(ƒ.Color.CSS("white", 0.5)));
    let children = mainNode.getChildren();
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

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    mainViewport.draw();
    ƒ.AudioManager.default.update();
  }

  let hoveredInteractable: Interactable;
  function pointermove(_event: PointerEvent): void {
    hoveredInteractable = null;
    mainViewport.dispatchPointerEvent(_event);
    mainViewport.canvas.classList.remove("cursor-talk", "cursor-take", "cursor-look", "cursor-door", "cursor-use");
    if (!hoveredInteractable) {
      MenuManager.Instance.hoverEnd();
      return;
    };
    let type = hoveredInteractable.getInteractionType();
    switch (type) {
      case INTERACTION_TYPE.LOOK_AT:
        mainViewport.canvas.classList.add("cursor-look");
        break;
      case INTERACTION_TYPE.PICK_UP:
        mainViewport.canvas.classList.add("cursor-take");
        break;
      case INTERACTION_TYPE.TALK_TO:
        mainViewport.canvas.classList.add("cursor-talk");
        break;
      case INTERACTION_TYPE.DOOR:
        mainViewport.canvas.classList.add("cursor-door");
        break;
      case INTERACTION_TYPE.USE:
        mainViewport.canvas.classList.add("cursor-use");
        break;

      default:
        break;
    }
  }

  let clickedInteractionWaypoint: ƒ.ComponentWaypoint;
  function mouseclick(_event: PointerEvent): void {
    // move character
    if (!character) {
      mainViewport.dispatchPointerEvent(_event);
      return;
    }
    clickedInteractionWaypoint = null;
    mainViewport.dispatchPointerEvent(new PointerEvent("clickOnInteraction", { clientX: _event.clientX, clientY: _event.clientY, bubbles: true }));
    if (!clickedInteractionWaypoint) {
      let ray = mainViewport.getRayFromClient(new ƒ.Vector2(_event.clientX, _event.clientY));
      if (ray.direction.y > 0) return;
      clickedInteractionWaypoint = getClosestWaypoint(mainNode, (_translation) => ray.getDistance(_translation).magnitudeSquared);
    }
    character.moveTo(clickedInteractionWaypoint).then(() => {
      mainViewport.dispatchPointerEvent(_event);
    }).catch(() => { });
  }

  function clickOnInteraction(_event: PointerEvent) {
    let nodeTranslation = (<ƒ.Node>_event.target).mtxWorld.translation;
    clickedInteractionWaypoint = getClosestWaypoint(mainNode, (_translation) => ƒ.Vector3.DIFFERENCE(nodeTranslation, _translation).magnitudeSquared);
  }

  export function getClosestWaypoint(_mainNode: ƒ.Node, distanceFunction: (_waypointTranslation: ƒ.Vector3) => number): ƒ.ComponentWaypoint {
    let smallestDistance = Infinity;
    let closestWaypoint: ƒ.ComponentWaypoint;
    let waypointNode = _mainNode.getChildrenByName("waypoints")[0]
    for (let waypoint of waypointNode.getComponents(ƒ.ComponentWaypoint)) {
      let distance = distanceFunction(waypoint.mtxWorld.translation);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestWaypoint = waypoint;
      }
    }
    return closestWaypoint;
  }


  export function foundNode(_event: PointerEvent): void {
    let node = <ƒ.Node>_event.target;
    let interactable = findInteractable(node);
    if (!interactable) return;
    hoveredInteractable = interactable;
    MenuManager.Instance.hoverStart(_event, interactable)
  }

  //#region Drag & Drop

  function dragOverViewport(_event: DragEvent): void {
    //@ts-ignore
    mainViewport.dispatchPointerEvent(_event);
  }

  function dragOverNode(_event: DragEvent): void {
    _event.preventDefault();
  }

  function dropOverViewport(_event: DragEvent): void {
    //@ts-ignore
    mainViewport.dispatchPointerEvent(_event);
  }
  function dropOverNode(_event: DragEvent): void {
    let node: ƒ.Node = <ƒ.Node>_event.target;
    let interactable: Interactable = findInteractable(node);
    if (!interactable) return;
    let otherInteractableName: string = _event.dataTransfer.getData("interactable");
    let otherInteractable = interactableItems.find(i => i.name === otherInteractableName);
    console.log("dropped", otherInteractable.name, "onto", interactable.name);
    interactable.tryUseWith(otherInteractable);
  }

  //#endregion

  function findInteractable(_node: ƒ.Node): Interactable {
    return <Interactable>_node.getAllComponents().find(i => i instanceof Interactable);
  }

  //#region Interfaces
  interface Progress {
    fly: {
      intro: boolean,
      done: boolean,
      clean: number,
      drink: number,
      worm: number,
    },
    frog: {
      intro: boolean,
      checked_door: boolean,
      music: boolean,
      key: boolean,
    }
    scene: string,
  }

  interface Settings {
    music: number,
    sounds: number,
  }
  //#endregion


  //#region Helper Functions
  /** Helper function to set up a (deep) proxy object that calls the onChange function __before__ the element is modified*/
  export function onChange(object: any, onChange: Function) {
    const handler = {
      get(target: any, property: any, receiver: any): any {
        try {
          return new Proxy(target[property], handler);
        } catch (err) {
          return Reflect.get(target, property, receiver);
        }
      },
      defineProperty(target: any, property: any, descriptor: any): boolean {
        onChange();
        return Reflect.defineProperty(target, property, descriptor);
      },
      deleteProperty(target: any, property: any): boolean {
        onChange();
        return Reflect.deleteProperty(target, property);
      }
    };

    return new Proxy(object, handler);
  }

  /** Deep merges the _updates object into the _current object. */
  export function merge(_current: any, _updates: any) {
    for (let key of Object.keys(_updates)) {
      if (!_current.hasOwnProperty(key) || typeof _updates[key] !== 'object') _current[key] = _updates[key];
      else merge(_current[key], _updates[key]);
    }
    return _current;
  }
  //#endregion
}