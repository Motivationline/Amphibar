namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  export let mainViewport: ƒ.Viewport;
  let node: ƒ.Node;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);
  let mouseIsOverInteractable: boolean = false;

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
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    mainViewport.draw();
    ƒ.AudioManager.default.update();
  }

  function mousemove(_event: PointerEvent): void {
    mainViewport.canvas.style.cursor = "default";
    mouseIsOverInteractable = false;
    mainViewport.dispatchPointerEvent(_event);
  }

  function mouseclick(_event: PointerEvent): void {
    mainViewport.dispatchPointerEvent(_event);
  }

  function foundNode(_event: PointerEvent): void {
    mouseIsOverInteractable = true;
    mainViewport.canvas.style.cursor = "pointer";
  }

  function isDroppable(_event: DragEvent): void {
    let pick = findPickable(_event);
    if (pick) {
      _event.preventDefault();
    }
  }
  function drop(_event: DragEvent): void {
    let pick = findPickable(_event);
    if(pick){
      console.log("dropped", _event.dataTransfer.getData("item"), "onto", pick.node.name);
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
}