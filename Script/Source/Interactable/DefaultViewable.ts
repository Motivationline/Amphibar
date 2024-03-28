namespace Script {
    export class DefaultViewable extends Interactable {
        public text: string = "...";
        public name: string = "Gegenstand";

        constructor(_name: string, _image: string){
            super(_name, _image);
        }
        getInteractionType(): INTERACTION_TYPE {
            return INTERACTION_TYPE.LOOK_AT;
        }
        interact(): void {
            CharacterScript.talkAs("Tadpole", this.text);
        }
        tryUseWith(_interactable: Interactable): void {
            CharacterScript.talkAs("Tadpole", "Das funktioniert nicht.");
        }
    }
}