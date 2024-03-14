namespace Script {
    export class SceneManager {
        public static Instance = new DialogManager();

        static load(_name: string){
            console.log("load scene", _name);
            let sceneToLoad = ƒ.Project.getResourcesByName(_name)[0];
            if(!sceneToLoad || !(sceneToLoad instanceof ƒ.Node)) return console.error(`scene ${_name} not found.`)
            mainViewport.setBranch(sceneToLoad);
        }
    }
}