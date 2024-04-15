namespace Script {
    export class BathroomBucket extends Interactable {
        public name: string = "bucket";

        constructor(_name?: string, _image?: string) {
            super(_name, _image);

            if (ƒ.Project.mode === ƒ.MODE.EDITOR) return;
            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, () => {
                this.node.addEventListener(ƒ.EVENT.ATTACH_BRANCH, this.checkExistance.bind(this), true);
            });
        }
        interact(): void {
            let p: number = progress.fly.clean ?? 0;
            if(p <= 1) {
                CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("bath.bucket.interact.0"));
                return;
            }
            if(p === 2) {
                CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("bath.bucket.interact.1"));
                return;
            }
            if(p === 3) {
                CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("bath.bucket_full.interact.0"));
                return;
            }
            if(p >= 4) {
                CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("bath.bucket_full.interact.1"));
                return;
            }
        }
        
        async tryUseWith(_interactable: Interactable): Promise<void> {
            if(progress.fly.clean >= 3) {
                this.name = "bucket_full";
            }
            if(_interactable.name == "rag" && progress.fly.clean >= 3){
                await CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("bath.bucket_full.interact.rag"));
                Inventory.Instance.removeItem(Inventory.Instance.hasItem(_interactable.name));
                Inventory.Instance.addItem(new Interactable("rag_wet", "Assets/UI/Inventar/Item_Lappen_Nass.png"));
                return;
            }
            super.tryUseWith(_interactable);
        }

        private checkExistance(){
            if(progress.fly.clean >= 3) {
                this.fillBucket();
            } else {
                this.emptyBucket();
            }
        }

        private emptyBucket(){
            this.node.getChild(0).activate(true);
            this.node.getChild(1).activate(false);
        }
        private fillBucket(){
            this.node.getChild(0).activate(false);
            this.node.getChild(1).activate(true);
        }

    }
}