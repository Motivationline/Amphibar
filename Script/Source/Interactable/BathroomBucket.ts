namespace Script {
    export class BathroomBucket extends Interactable {
        public text: string = "...";
        public name: string = "Bucket";

        constructor(_name: string, _image: string) {
            super(_name, _image);
        }
        interact(): void {
            let p: number = progress.fly?.clean ?? 0;
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

        tryUseWith(_interactable: Interactable): void {
            if(progress.fly.clean >= 3) {
                this.name = "bucket_full";
            } 
            super.tryUseWith(_interactable);
        }

    }
}