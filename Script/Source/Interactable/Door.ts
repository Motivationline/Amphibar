namespace Script {
    import ƒ = FudgeCore;
    export class Door extends Interactable {
        public target: string = "main";

        constructor(_name: string, _image: string) {
            super(_name, _image);

            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;

            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, ()=> {
                this.node.radius = 1;
            })
        }
        getInteractionType(): INTERACTION_TYPE {
            return INTERACTION_TYPE.DOOR;
        }
        interact(): void {
            SceneManager.load(this.target);
        }
        tryUseWith(_interactable: Interactable): void { }
    }
}