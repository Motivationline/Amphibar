namespace Script {
    import ƒ = FudgeCore;
    export class CocktailInteractableIngredient extends Interactable {
        ingredient: CocktailIngredient = CocktailIngredient.Bachwasser;

        getInteractionType(): INTERACTION_TYPE {
            if (CocktailManager.Instance.ingredients.length >= 3)
                return INTERACTION_TYPE.LOOK_AT;
            return INTERACTION_TYPE.PICK_UP;
        }

        // tryUseWith(_interactable: Interactable): void {

        // }

        interact(): void {
            if (CocktailManager.Instance.ingredients.length >= 3) {
                CharacterScript.talkAs("Tadpole", Text.instance.get("cocktails.full"));
                return;
            }
            if (!CocktailManager.Instance.addIngredient(this.ingredient)) {
                return;
            }
            MenuManager.Instance.inputDisable();
            //TODO: play animation and enable interaction after animation instead of after timeout
            setTimeout(()=> {MenuManager.Instance.inputEnable()}, 1000);
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
