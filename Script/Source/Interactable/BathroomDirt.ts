namespace Script {
    export class BathroomDirt extends Interactable {
        public name: string = "dirt";

        constructor(_name: string, _image: string) {
            super(_name, _image);

            if (ƒ.Project.mode === ƒ.MODE.EDITOR) return;

            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, () => {
                this.node.addEventListener(ƒ.EVENT.ATTACH_BRANCH, this.checkExistance.bind(this), true);
            });
        }
        private checkExistance() {
            if (progress.fly.cleaned.dirt) {
                this.remove();
            }
        }
        private remove() {
            this.node.getParent().removeChild(this.node);
        }

        tryUseWith(_interactable: Interactable): void {
            if (progress.fly.clean >= 3 && _interactable.name === "rag_wet") {
                progress.fly.cleaned.dirt = true;
                this.remove();
                
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