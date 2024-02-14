namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export class PickingScript extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(PickingScript);
    #currentHover: ƒ.Node = null;


    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      // Listen to this component being added to or removed from a node
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.frame);
    }

    // Activate the functions of this component as response to events
    public hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          break;
        case ƒ.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
          break;
        case ƒ.EVENT.NODE_DESERIALIZED:
          this.node.addEventListener("mousemove", this.hovered.bind(this));
          this.node.addEventListener("click", this.clicked.bind(this));
          console.log({ viewport: mainViewport });
          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          break;
      }
    }

    private hovered(_event: CustomEvent): void {
      // console.log(_event.target);
      if (_event.target instanceof ƒ.Node)
        this.#currentHover = _event.target;
    }
    private clicked(_event: CustomEvent): void {
      console.log(_event.target);
      if (_event.target instanceof ƒ.Node)
        this.#currentHover = _event.target;
    }
    private frame(): void {
      
    }

    // protected reduceMutator(_mutator: ƒ.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties and private fields (#) will not be included by default
    // }
  }
}