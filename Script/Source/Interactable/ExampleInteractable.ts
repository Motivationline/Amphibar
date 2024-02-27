namespace Script {
    export class ExampleInteractable extends Interactable {
        constructor(_name: string, _image: string){
            super(_name, _image);
        }
        getInteractionType(): INTERACTION_TYPE {
            return INTERACTION_TYPE.TALK_TO;
        }
        interact(): void {
            throw new Error("Method not implemented.");
        }
        tryUseWith(_interactable: Interactable): void {
            throw new Error("Method not implemented.");
        }
    }
}