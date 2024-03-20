namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  ƒ.Debug.info("Main Program Template running!");

  export let mainViewport: ƒ.Viewport;
  export let mainNode: ƒ.Node;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);
  let mouseIsOverInteractable: boolean = false;
  export let inventory: Inventory;
  export const interactableItems: Interactable[] = [];
  export let character: CharacterScript;

  function start(_event: CustomEvent): void {
    mainViewport = _event.detail;
    mainViewport.canvas.addEventListener("dragover", isDroppable)
    mainViewport.canvas.addEventListener("drop", drop)
    mainViewport.canvas.addEventListener("pointermove", <EventListener>pointermove);
    mainViewport.canvas.addEventListener("click", <EventListener>mouseclick);


    mainNode = mainViewport.getBranch();
    mainNode.addEventListener("pointermove", <EventListener>foundNode);

    addInteractionSphere(mainNode);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a

    inventory = new Inventory();
    inventory.addItem(new DefaultViewable("test", "items/item.png"))
  }

  function addInteractionSphere(_node: ƒ.Node){
    let meshShpere: ƒ.MeshSphere = new ƒ.MeshSphere("BoundingSphere", 40, 40);
    let material: ƒ.Material = new ƒ.Material("Transparent", ƒ.ShaderLit, new ƒ.CoatColored(ƒ.Color.CSS("white", 0.5)));
    let children = mainNode.getChildren();
    let wrapper = new ƒ.Node("Wrapper");
    for(let child of children){
      if(child.nChildren > 0) {
        children.push(...child.getChildren());
      }
      let component = child.getComponent(ƒ.ComponentPick);
      if(component && component.isActive && component.pick === ƒ.PICK.RADIUS){
        let sphere = new ƒAid.Node("BoundingSphere", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2)), material, meshShpere);
        sphere.mtxLocal.scale(ƒ.Vector3.ONE(child.radius));
        sphere.mtxLocal.translation =  child.mtxWorld.translation;
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

  function pointermove(_event: PointerEvent): void {
    mainViewport.canvas.classList.remove("cursor-talk", "cursor-take", "cursor-look", "cursor-door");
    mouseIsOverInteractable = false;
    mainViewport.dispatchPointerEvent(_event);
  }

  function mouseclick(_event: PointerEvent): void {
    // move character
    if(!character) {
      mainViewport.dispatchPointerEvent(_event);
      return;
    }
    let ray = mainViewport.getRayFromClient(new ƒ.Vector2(_event.clientX, _event.clientY));
    if(ray.direction.y > 0) return;
    let smallestDistance = Infinity;
    let closestWaypoint: ƒ.ComponentWaypoint;
    let waypointNode = mainNode.getChildrenByName("waypoints")[0]
    for(let waypoint of waypointNode.getComponents(ƒ.ComponentWaypoint)){
      let distance = ray.getDistance(waypoint.mtxWorld.translation).magnitudeSquared;
      if(distance < smallestDistance) {
        smallestDistance = distance;
        closestWaypoint = waypoint;
      }
    }
    character.moveTo(closestWaypoint).then(()=>{
      mainViewport.dispatchPointerEvent(_event);
    }).catch(()=>{});
  }

  export function foundNode(_event: PointerEvent): void {
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
      case INTERACTION_TYPE.DOOR:
        mainViewport.canvas.classList.add("cursor-door");
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
      interactable.tryUseWith(otherInteractable);
    }
  }

  function findPickable(_event: MouseEvent): ƒ.ComponentPick {
    // let picks: ƒ.Pick[] = ƒ.Picker.pickViewport(mainViewport, new ƒ.Vector2(_event.clientX, _event.clientY));
    // for (let pick of picks) {
    //   let cmpPick = pick.node.getComponent(ƒ.ComponentPick);
    //   if (cmpPick && cmpPick.isActive) {
    //     return pick;
    //   }
    // }
    // return null;
    
    let ray = mainViewport.getRayFromClient(new ƒ.Vector2(_event.clientX, _event.clientY));
    let smallestDistance = Infinity;
    let closestItem: ƒ.ComponentPick;
    let items = mainNode.getChildrenByName("items")[0].getChildren()
    for(let item of items){
      let pick = item.getComponent(ƒ.ComponentPick);
      if(!pick) continue;
      if(!pick.isActive) continue;
      let distance = ray.getDistance(item.mtxWorld.translation).magnitudeSquared;
      if(pick.node.radius * pick.node.radius > distance) continue;
      if(distance < smallestDistance) {
        smallestDistance = distance;
        closestItem = pick;
      }
    }
    
    return closestItem;
  }

  function findInteractable(_node: ƒ.Node): Interactable {
    return <Interactable>_node.getAllComponents().find(i => i instanceof Interactable);
  }
}