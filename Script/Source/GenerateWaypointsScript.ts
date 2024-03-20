namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export class GenerateWaypointsScript extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(GenerateWaypointsScript);

    public dx: number = 2;
    public dz: number = 2;
    public distance: number = 0.5;

    #waypoints: ƒ.ComponentWaypoint[] = [];

    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.frame.bind(this));
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.createWaypoints.bind(this));
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, ()=>{
        // this.node.addEventListener(ƒ.EVENT.ATTACH_BRANCH, this.createWaypoints.bind(this), true);
      });
    }

    private createWaypoints(_ev: Event) {
      console.log("create", _ev.type)
      for (let comp of this.node.getComponents(ƒ.ComponentWaypoint)) {
        this.node.removeComponent(comp);
      }
      this.#waypoints = [];
      let connectionDistance = this.distance * this.distance * 2.5 /* slightly more than sqrt(2) = 1.41 */;

      for (let x: number = 0; x <= this.dx; x += this.distance) {
        for (let z: number = 0; z <= this.dz; z += this.distance) {
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
}