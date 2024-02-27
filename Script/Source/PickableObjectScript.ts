namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export class PickableObjectScript extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(PickableObjectScript);
    #material: ƒ.ComponentMaterial;
    #direction: number = -1;

    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.frame.bind(this));
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, () => {
        this.#material = this.node.getComponent(ƒ.ComponentMaterial)
      });
    }

    private frame(): void {
      let delay: number = 4;
      let color: ƒ.Color = (<ƒ.CoatColored>this.#material.material.coat).color;
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

    // protected reduceMutator(_mutator: ƒ.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties and private fields (#) will not be included by default
    // }
  }
}