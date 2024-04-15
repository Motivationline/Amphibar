namespace Script {
    import ƒ = FudgeCore;
    export class Bar extends Interactable {
        public name: string = "Getränkebar";
        public target: string = "shelf";

        constructor(_name?: string, _image?: string) {
            super(_name, _image);

            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
        }
        getInteractionType(): INTERACTION_TYPE {
            if(!progress.fly.intro){
                return INTERACTION_TYPE.LOOK_AT;
            }
            return INTERACTION_TYPE.DOOR;
        }
        interact(): void {
            if(!progress.fly.intro){
                super.interact();
                return;
            }
            SceneManager.load(this.target);
        }
        tryUseWith(_interactable: Interactable): void { }
    }
}