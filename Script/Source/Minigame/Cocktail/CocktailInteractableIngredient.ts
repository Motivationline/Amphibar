namespace Script {
    import ƒ = FudgeCore;
    export class CocktailInteractableIngredient extends Interactable {
        ingredient: CocktailIngredient = CocktailIngredient.Bachwasser;
        cmpAnimator: ƒ.ComponentAnimator;

        constructor(_name: string) {
            super(_name);
            if (ƒ.Project.mode === ƒ.MODE.EDITOR) return;

            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, () => {
                this.cmpAnimator = this.node.getComponent(ƒ.ComponentAnimator);
                if(!this.cmpAnimator){
                    for(let child of this.node.getChildren()){
                        this.cmpAnimator = child.getComponent(ƒ.ComponentAnimator);
                        if(this.cmpAnimator) break;
                    }
                }
                this.cmpAnimator?.addEventListener("LiquidPour", this.animationDone.bind(this))
            });
        }

        private animationDone() {
            if (this.promiseResolver) {
                this.promiseResolver();
                this.promiseResolver = null;
            }
        }

        getInteractionType(): INTERACTION_TYPE {
            if (CocktailManager.Instance.ingredients.length >= 3)
                return INTERACTION_TYPE.LOOK_AT;
            return INTERACTION_TYPE.USE;
        }

        // tryUseWith(_interactable: Interactable): void {

        // }

        private promiseResolver: any;
        interact(): void {
            if (CocktailManager.Instance.ingredients.length >= 3) {
                CharacterScript.talkAs("Tadpole", Text.instance.get("cocktails.full"));
                return;
            }

            let promise = new Promise<void>((resolve) => {
                this.promiseResolver = resolve;
            });
            if (!CocktailManager.Instance.addIngredient(this.ingredient, promise)) {
                return;
            }
            MenuManager.Instance.inputDisable();
            //TODO: play animation and enable interaction after animation instead of after timeout
            if (this.cmpAnimator) {
                this.cmpAnimator.jumpTo(0);
                setTimeout(()=>{
                    MenuManager.Instance.inputEnable();
                }, this.cmpAnimator.animation.totalTime);
            } else {
                setTimeout(() => {
                    this.animationDone();
                    MenuManager.Instance.inputEnable();
                }, 1000);
            }
        }

        public getMutatorAttributeTypes(_mutator: ƒ.Mutator): ƒ.MutatorAttributeTypes {
            let types: ƒ.MutatorAttributeTypes = super.getMutatorAttributeTypes(_mutator);
            if (types.ingredient)
                types.ingredient = CocktailIngredient;
            return types;
        }

    }


    export enum CocktailIngredient {
        Bachwasser = 1,
        Goldnektar = 2,
        Schlammsprudel = 4,
        Seerosenextrakt = 8,
    }
}
