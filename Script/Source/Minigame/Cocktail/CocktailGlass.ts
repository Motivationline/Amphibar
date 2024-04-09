namespace Script {
    import ƒ = FudgeCore;
    export class CocktailGlass extends Interactable {
        getInteractionType(): INTERACTION_TYPE {
            return INTERACTION_TYPE.USE;
        }

        async interact(): Promise<void> {
            if(CocktailManager.Instance.ingredients.length === 0){
                CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("cocktail.glass.empty"));
                return;
            }
            let result = await CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("cocktail.glass.take"), "neutral", [
                {id: "confirm", text: Interactable.textProvider.get("cocktail.glass.take.confirm")},
                {id: "cancel", text: Interactable.textProvider.get("cocktail.glass.take.cancel")},
            ]);
            if(result !== "confirm") return;
            CocktailManager.Instance.takeCocktail();
        }
    }
}