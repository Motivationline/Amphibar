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
            let p: number = progress.fly?.clean ?? 0;
            switch (p) {
                case 0:
                    CharacterScript.talkAs("Tadpole", "Ich brauche gerade kein Wasser.");
                    break;
                case 1:
                    alert("hier wasser eimer auffüllen einfügen");
                    break;
                case 2:
                    CharacterScript.talkAs("Tadpole", "Der Eimer ist schon voll. Mama hat mir beigebracht, kein Wasser zu verschwenden.");
                    break;
            }
            //@ts-ignore
            if(!progress.fly) progress.fly = {};
            progress.fly.clean = Math.min(2, p + 1);
        }
        tryUseWith(_interactable: Interactable): void {
            
        }
    }
}