namespace Script {
    export class BathroomValve extends Interactable {
        private drop: ƒ.Node;
        private open: ƒ.Node;

        constructor(_name: string, _image: string) {
            super(_name, _image);

            if (ƒ.Project.mode === ƒ.MODE.EDITOR) return;
            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, () => {
                this.node.addEventListener(ƒ.EVENT.ATTACH_BRANCH, this.setAnimations.bind(this), true);
            });
        }
        getInteractionType(): INTERACTION_TYPE {
            let p: number = progress.fly.clean ?? 0;
            if (p && p === 1)
                return INTERACTION_TYPE.USE;
            return INTERACTION_TYPE.LOOK_AT;
        }
        interact(): void {
            let p: number = progress.fly.clean;
            switch (p) {
                case 0:
                case 1:
                    CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("bath.valve.interact.0"));
                    break;
                case 2:
                    this.open.activate(true);
                    this.drop.activate(false);
                    
                    let anim = this.open.getComponent(ƒ.ComponentAnimator);
                    anim.jumpTo(0);
                    
                    setTimeout(()=> {
                        this.open.activate(false);
                        this.drop.activate(true);
                        this.drop.getComponent(ƒ.ComponentAnimator).jumpTo(0);
                        // TODO: wasser eimer visuell anpassen
                        // this.node.getParent().getChildrenByName("bucket")[0].
                    }, anim.animation.totalTime);


                    CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("bath.valve.interact.1"));
                    progress.fly.clean = 3;
                    break;
                case 3:
                    CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("bath.valve.interact.2"));
                    break;
            }
        }

        private setAnimations() {
            let animsprites = this.node.getAncestor().getChildrenByName("animationsprites")[0];
            this.drop = animsprites.getChildrenByName("WaterDrop")[0];
            this.open = animsprites.getChildrenByName("WaterFall")[0];
            this.open.activate(false);
        }
    }
}