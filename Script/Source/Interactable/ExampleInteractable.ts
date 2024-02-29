namespace Script {
    export class ExampleInteractable extends Interactable {
        constructor(_name: string, _image: string){
            super(_name, _image);
        }
        getInteractionType(): INTERACTION_TYPE {
            return INTERACTION_TYPE.TALK_TO;
        }
        interact(): void {
            alert("you're trying to talk to a cube?");
        }
        tryUseWith(_interactable: Interactable): void {
            alert("you can't use that here.")
        }
    }
}