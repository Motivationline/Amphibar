namespace Script {
    export class Rag extends Interactable {
        public name: string = "rag";
        public image: string = "Assets/UI/Inventar/Item_Lappen.png";

        constructor(_name: string, _image: string) {
            super(_name, _image);

            if (ƒ.Project.mode === ƒ.MODE.EDITOR) return;
            
            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, () => {
                this.node.addEventListener(ƒ.EVENT.ATTACH_BRANCH, this.checkExistance.bind(this), true);
            });
        }
        private checkExistance(){
            if(progress.fly.clean >= 2){
                this.remove();
            }
        }
        private remove(){
            this.node.getParent().removeChild(this.node);
        }

        getInteractionType(): INTERACTION_TYPE {
            if (!progress.fly.intro) {
                return INTERACTION_TYPE.LOOK_AT;
            }
            return INTERACTION_TYPE.PICK_UP;
        }

        async interact(): Promise<void> {
            if (!progress.fly.intro) {
                CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("bath.rag.no_need"));
                return;
            } else {
                await CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("bath.rag.pickup"));
                progress.fly.clean = 2;
                Inventory.Instance.addItem(this);
                this.remove();
                return;
            }
        }

    }
}