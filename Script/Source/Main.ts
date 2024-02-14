namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  export let mainViewport: ƒ.Viewport;
  let node: ƒ.Node;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    mainViewport = _event.detail;
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
    mainViewport.dispatchPointerEvent(_event);
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
  
  function mouseclick(_event: PointerEvent): void {
    mainViewport.dispatchPointerEvent(_event);
  }
  
  function foundNode(_event: PointerEvent): void {
    mainViewport.canvas.style.cursor = "pointer";
  }
}