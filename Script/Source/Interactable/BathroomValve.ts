namespace Script {
    export class BathroomValve extends Interactable {
        public text: string = "...";
        public name: string = "Gegenstand";

        constructor(_name: string, _image: string) {
            super(_name, _image);
        }
        getInteractionType(): INTERACTION_TYPE {
            let p: number = progress.fly?.clean ?? 0;
            if (p && p === 1)
                return INTERACTION_TYPE.USE;
            return INTERACTION_TYPE.LOOK_AT;
        }
        interact(): void {
            let p: number = progress.fly.clean;
            switch (p) {
                case 0:
                case 1:
                    CharacterScript.talkAs("Tadpole", "Ich brauche gerade kein Wasser.");
                    break;
                case 2:
                    // TODO: hier wasser eimer auffüllen einfügen
                    // progress.fly.clean = Math.min(2, p + 1);
                    progress.fly.clean++;
                    break;
                case 3:
                    CharacterScript.talkAs("Tadpole", "Der Eimer ist schon voll. Mama hat mir beigebracht, kein Wasser zu verschwenden.");
                    break;
            }
        }
        tryUseWith(_interactable: Interactable): void {
            
        }
    }
}