namespace Script {
    export class ExampleInteractable2 extends Interactable {
        constructor(_name: string, _image: string){
            super(_name, _image);
        }
        getInteractionType(): INTERACTION_TYPE {
            return INTERACTION_TYPE.LOOK_AT;
        }
        interact(): void {
            console.log("look at me! I'm a cube!");
        }
        tryUseWith(_interactable: Interactable): void {
            console.log("using this with a cube? i dunno...");
        }
    }
}