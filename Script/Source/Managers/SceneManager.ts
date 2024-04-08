namespace Script {
    export class SceneManager extends ƒ.ComponentScript {
        static isTransitioning: boolean = false;

        constructor() {
            super();

            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;

        }

        static load(_name: string, _noTransition: boolean = false) {
            if (this.isTransitioning) return;
            console.log("load scene", _name);
            let sceneToLoad = ƒ.Project.getResourcesByName(_name)[0];
            if (!sceneToLoad || !(sceneToLoad instanceof ƒ.Node)) return console.error(`scene ${_name} not found.`);
            progress.scene = _name;

            if(_noTransition) {
                this.loadScene(sceneToLoad);
                return;
            }
            this.isTransitioning = true;
            let overlay = document.getElementById("scene-overlay");
            overlay.classList.add("active");
            setTimeout(() => {
                //@ts-ignore
                this.loadScene(sceneToLoad);
            }, 1000)
            setTimeout(() => {
                overlay.classList.remove("active");
                this.isTransitioning = false;
            }, 1999)
        }

        private static loadScene(_scene: ƒ.Node) {
            // for(let waypoint of ƒ.ComponentWaypoint.waypoints){
            //     waypoint.node.removeComponent(waypoint);
            // }
            character = null;
            mainViewport.setBranch(_scene);
            mainViewport.camera = this.getFirstComponentCamera(_scene);
            setupNewMainNode(_scene);

            _scene.addEventListener("pointermove", <EventListener>foundNode);
        }

        private static getFirstComponentCamera(node: ƒ.Node): ƒ.ComponentCamera{
          for(let n of node.getChildren()){
            let cam = n.getComponent(ƒ.ComponentCamera);
            if(cam) return cam;
            
            let childCam = SceneManager.getFirstComponentCamera(n);
            if(childCam) return cam;
          }
          return null;
        }
    }
}