namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export class CharacterScript extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(CharacterScript);
    private nextTarget: ƒ.ComponentWaypoint;
    private currentTarget: ƒ.ComponentWaypoint;
    private walker: ƒ.ComponentWalker;
    private animator: ƒ.ComponentAnimator;
    private animations: Map<string, ƒ.Animation> = new Map();

    #currentlyWalking: boolean = false;
    #currentPromiseResolve: (value?: unknown) => void;
    #currentPromiseReject: (value?: unknown) => void;

    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      ƒ.Project.addEventListener(ƒ.EVENT.RESOURCES_LOADED, this.init.bind(this));
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, () => {
        this.node.addEventListener(ƒ.EVENT.ATTACH_BRANCH, this.setCharacter.bind(this), true);
      });
    }

    private init() {
      // this.node.addEventListener("click");
      this.walker = this.node.getComponent(ƒ.ComponentWalker);
      this.walker.addEventListener(ƒ.EVENT.WAYPOINT_REACHED, this.reachedWaypoint.bind(this));
      this.walker.addEventListener(ƒ.EVENT.PATHING_CONCLUDED, this.finishedWalking.bind(this));

      this.animator = this.node.getChild(0).getChild(0).getComponent(ƒ.ComponentAnimator);

      // console.log("idle", );
      let animations = ƒ.Project.getResourcesByType(ƒ.Animation);
      for (let anim of animations) {
        this.animations.set(anim.name, <ƒ.Animation>anim);
      }
      // this.animations.set("idle", <ƒ.Animation>ƒ.Project.getResourcesByName("Idle")[0])
      // this.animations.set("interact", <ƒ.Animation>ƒ.Project.getResourcesByName("Interact")[0])
      // this.animations.set("walk", <ƒ.Animation>ƒ.Project.getResourcesByName("WalkDerpy")[0])
    }

    private setCharacter() {
      character = this;
    }

    public moveTo(_waypoint: ƒ.ComponentWaypoint): Promise<unknown> {
      this.resolveOrReject(false);

      let promise = new Promise((resolve, reject) => {
        this.#currentPromiseResolve = resolve;
        this.#currentPromiseReject = reject;
      })
      if (!this.#currentlyWalking) {
        this.actuallyWalk(_waypoint);
      } else {
        this.nextTarget = _waypoint;
      }
      return promise;
    }

    private actuallyWalk(_waypoint: ƒ.ComponentWaypoint) {
      if (this.currentTarget && this.currentTarget !== _waypoint) {
        this.#currentlyWalking = true;
        this.animator.animation = this.animations.get("WalkDerpy");
        this.walker.moveTo(this.currentTarget, _waypoint, true).catch(() => {
          this.#currentlyWalking = false;
          this.resolveOrReject(true);
          this.animator.animation = this.animations.get("Idle");
        });
      } else {
        this.#currentlyWalking = false;
        this.walker.moveTo(_waypoint);
        this.resolveOrReject(true);
      }

      this.currentTarget = _waypoint;
      this.nextTarget = null;
    }

    private reachedWaypoint(_event: CustomEvent) {
      // TODO Check if the character is stuck somehow. 
      let currentWaypoint: ƒ.ComponentWaypoint = _event.detail;
      if (this.nextTarget) {
        this.currentTarget = currentWaypoint;
        this.actuallyWalk(this.nextTarget);
      }
      // this.node.getChild(0).cmpTransform.mtxLocal.rotation = this.walker.direction;
      // this.node.getChild(0).cmpTransform.mtxLocal.rotation = ƒ.Matrix4x4.LOOK_AT(this.node.mtxWorld.translation, ƒ.Vector3.SUM(this.walker.direction, this.node.mtxWorld.translation)).rotation;
      // console.log("reacged", _event.detail);
    }

    private finishedWalking(_event: CustomEvent) {
      this.animator.animation = this.animations.get("Idle");
      this.#currentlyWalking = false;

      let currentWaypoint: ƒ.ComponentWaypoint = _event.detail;
      if (this.nextTarget) {
        this.currentTarget = currentWaypoint;
        this.actuallyWalk(this.nextTarget);
      }
      this.resolveOrReject(true);
    }

    private resolveOrReject(_resolve: boolean) {
      if (_resolve && this.#currentPromiseResolve) this.#currentPromiseResolve();
      if (!_resolve && this.#currentPromiseReject) this.#currentPromiseReject();
      this.#currentPromiseReject = null;
      this.#currentPromiseResolve = null;
    }
  }
}