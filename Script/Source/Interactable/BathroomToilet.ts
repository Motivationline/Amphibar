namespace Script {
    export class BathroomToilet extends Interactable {
        public name: string = "toilet";
        public id: number = 1;

        constructor(_name: string, _image: string) {
            super(_name, _image);

            if (ƒ.Project.mode === ƒ.MODE.EDITOR) return;

            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, () => {
                this.node.addEventListener(ƒ.EVENT.ATTACH_BRANCH, this.checkDirtyness.bind(this), true);
            });
        }
        private checkDirtyness() {
            if (progress.fly.cleaned.toilet1 && this.id == 1) {
                this.clean();
                return;
            }
            if (progress.fly.cleaned.toilet2 && this.id == 2) {
                this.clean();
                return;
            }
            this.node.getChild(0).activate(true);
            this.node.getChild(1).activate(false);
        }

        private clean() {
            this.name = "Toilette_sauber";
            this.node.getChild(0).activate(false);
            this.node.getChild(1).activate(true);
        }

        tryUseWith(_interactable: Interactable): void {
            if (progress.fly.clean === 3 && _interactable.name === "rag_wet") {
                if (this.id === 1 && !progress.fly.cleaned.toilet1) {
                    progress.fly.cleaned.toilet1 = true;
                    this.clean();
                }
                if (this.id === 2 && !progress.fly.cleaned.toilet2) {
                    progress.fly.cleaned.toilet2 = true;
                    this.clean();
                }
                
                let allClean = true;
                for(let key of Object.keys(progress.fly.cleaned)){
                    //@ts-ignore
                    allClean = progress.fly.cleaned[key] && allClean;
                }
                if(allClean) progress.fly.clean = 4;
                return;
            }
            super.tryUseWith(_interactable);
        }

    }
}