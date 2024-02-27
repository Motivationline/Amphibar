namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  export let mainViewport: ƒ.Viewport;
  let node: ƒ.Node;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);
  let mouseIsOverInteractable: boolean = false;
  export let inventory: Inventory;
  export const interactableItems: Interactable[] = [];

  function start(_event: CustomEvent): void {
    mainViewport = _event.detail;
    mainViewport.canvas.addEventListener("dragover", isDroppable)
    mainViewport.canvas.addEventListener("drop", drop)
    mainViewport.canvas.addEventListener("mousemove", <EventListener>mousemove);
    mainViewport.canvas.addEventListener("click", <EventListener>mouseclick);


    node = mainViewport.getBranch();
    node.addEventListener("mousemove", <EventListener>foundNode);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a

    inventory = new Inventory();
    inventory.addItem(new ExampleInteractable("test", "items/item.png"))
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    mainViewport.draw();
    ƒ.AudioManager.default.update();
  }

  function mousemove(_event: PointerEvent): void {
    mainViewport.canvas.classList.remove("cursor-talk", "cursor-take", "cursor-look");
    mouseIsOverInteractable = false;
    mainViewport.dispatchPointerEvent(_event);
  }

  function mouseclick(_event: PointerEvent): void {
    mainViewport.dispatchPointerEvent(_event);
  }

  function foundNode(_event: PointerEvent): void {
    mouseIsOverInteractable = true;
    let node = <ƒ.Node>_event.target;
    let interactable = findInteractable(node);
    if (!interactable) return;
    let type = interactable.getInteractionType();
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

      default:
        break;
    }
  }

  function isDroppable(_event: DragEvent): void {
    let pick = findPickable(_event);
    if (pick) {
      _event.preventDefault();
    }
  }
  function drop(_event: DragEvent): void {
    let pick = findPickable(_event);
    if (pick) {
      let interactable: Interactable = findInteractable(pick.node);
      if (!interactable) return;
      let otherInteractableName: string = _event.dataTransfer.getData("interactable");
      let otherInteractable = interactableItems.find(i => i.name === otherInteractableName);
      console.log("dropped", otherInteractable.name, "onto", interactable.name);
    }
  }

  function findPickable(_event: MouseEvent): ƒ.Pick {
    let picks: ƒ.Pick[] = ƒ.Picker.pickViewport(mainViewport, new ƒ.Vector2(_event.clientX, _event.clientY));
    for (let pick of picks) {
      let cmpPick = pick.node.getComponent(ƒ.ComponentPick);
      if (cmpPick && cmpPick.isActive) {
        return pick;
      }
    }
    return null;
  }

  function findInteractable(_node: ƒ.Node): Interactable {
    return <Interactable>_node.getAllComponents().find(i => i instanceof Interactable);
  }
}