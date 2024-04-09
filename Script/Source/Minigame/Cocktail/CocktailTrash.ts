namespace Script {
    import ƒ = FudgeCore;
    export class CocktailTrash extends Interactable {
        getInteractionType(): INTERACTION_TYPE {
            return INTERACTION_TYPE.USE;
        }

        async interact(): Promise<void> {
            let result = await CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("cocktail.trash.confirm"), "neutral", [
                { id: "confirm", text: Interactable.textProvider.get("cocktail.trash.option.confirm") },
                { id: "cancel", text: Interactable.textProvider.get("cocktail.trash.option.cancel") },
            ]);
            if (result !== "confirm") return;
            CocktailManager.Instance.resetCocktail();
        }

        tryUseWith(_interactable: Interactable): void {
            if(_interactable.name.startsWith("glass")) this.interact();
        }
    }
}