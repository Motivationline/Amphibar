namespace Script {
    export class SceneManager {
        public static Instance = new SceneManager();
        static isTransitioning: boolean = false;

        constructor(){
            if(SceneManager.Instance) return SceneManager.Instance;
            SceneManager.Instance = this;
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
            }, 2000)
        }

        private static loadScene(_scene: ƒ.Node) {
            mainViewport.setBranch(_scene);

        }
    }
}