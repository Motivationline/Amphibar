namespace Script {
    export class CocktailTrash extends Interactable {
        getInteractionType(): INTERACTION_TYPE {
            return INTERACTION_TYPE.USE;
        }

        async interact(_fromInventory: boolean = false): Promise<void> {
            if (CocktailManager.Instance.ingredients.length === 0 && !_fromInventory) {
                CharacterScript.talkAs("Tadpole", Text.instance.get("cocktail.trash.info"));
                return;
            }
            let result = await CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("cocktail.trash.confirm"), "neutral", [
                { id: "confirm", text: Interactable.textProvider.get("cocktail.trash.option.confirm") },
                { id: "cancel", text: Interactable.textProvider.get("cocktail.trash.option.cancel") },
            ]);
            if (result !== "confirm") return;
            CocktailManager.Instance.resetCocktail();
        }

        tryUseWith(_interactable: Interactable): void {
            if(_interactable.name.startsWith("glass")) this.interact(true);
        }
    }
}