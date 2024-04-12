namespace Script {
    import ƒ = FudgeCore;
    export class DoorBar extends Interactable {
        public target: string = "done";
        public locked: boolean = true;

        constructor(_name?: string, _image?: string) {
            super(_name, _image);

            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
        }
        getInteractionType(): INTERACTION_TYPE {
            return INTERACTION_TYPE.DOOR;
        }
        interact(): void {
            progress.frog.checked_door = true;
            if(this.locked) {
                CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.tadpole.door_locked"));
                return;
            }
            SceneManager.load(this.target);
        }
        tryUseWith(_interactable: Interactable): void {
            if(_interactable.name === "key"){
                CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.tadpole.door_unlocked"));
                this.locked = false;
                Inventory.Instance.removeItem(_interactable);
                return;
            }
         }
    }
}