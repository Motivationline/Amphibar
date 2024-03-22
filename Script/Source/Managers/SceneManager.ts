namespace Script {
    export class SceneManager extends ƒ.ComponentScript {
        static isTransitioning: boolean = false;

        constructor() {
            super();

            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;

            // this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, () => {
            //     this.node.addEventListener(ƒ.EVENT.ATTACH_BRANCH, this.node.broadcastEvent.bind(this.node));
            // });
        }

        static load(_name: string) {
            if (this.isTransitioning) return;
            console.log("load scene", _name);
            let sceneToLoad = ƒ.Project.getResourcesByName(_name)[0];
            if (!sceneToLoad || !(sceneToLoad instanceof ƒ.Node)) return console.error(`scene ${_name} not found.`);
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
            mainNode.removeEventListener("pointermove", <EventListener>foundNode);
            // for(let waypoint of ƒ.ComponentWaypoint.waypoints){
            //     waypoint.node.removeComponent(waypoint);
            // }
            character = null;
            mainViewport.setBranch(_scene);
            mainNode = _scene;
            _scene.addEventListener("pointermove", <EventListener>foundNode);
        }
    }
}