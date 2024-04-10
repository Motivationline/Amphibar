namespace Script {
    import ƒ = FudgeCore;
    export class CocktailGlass extends Interactable {
        private emptyGlass: ƒ.Node;
        private cocktails: Map<string, ƒ.Graph> = new Map();
        private currentCocktail: ƒ.Node;

        constructor(_name: string, _image: string) {
            super(_name, _image);

            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;

            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, () => {
                this.emptyGlass = this.node.getChild(0);
            });
            CocktailManager.glass = this;
            ƒ.Project.addEventListener(ƒ.EVENT.RESOURCES_LOADED, () => {
                for (let name of CocktailManager.allCocktails) {
                    this.cocktails.set(name, <ƒ.Graph>ƒ.Project.getResourcesByName(name)[0]);
                }
            })
        }

        getInteractionType(): INTERACTION_TYPE {
            if (CocktailManager.Instance.ingredients.length === 0) {
                return INTERACTION_TYPE.LOOK_AT;
            }
            return INTERACTION_TYPE.PICK_UP;
        }

        async interact(): Promise<void> {
            if (CocktailManager.Instance.ingredients.length === 0) {
                CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("cocktail.glass.empty"));
                return;
            }
            let result = await CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("cocktail.glass.take"), "neutral", [
                { id: "confirm", text: Interactable.textProvider.get("cocktail.glass.take.confirm") },
                { id: "cancel", text: Interactable.textProvider.get("cocktail.glass.take.cancel") },
            ]);
            if (result !== "confirm") return;
            CocktailManager.Instance.takeCocktail();
        }

        setCocktail(_name?: string) {
            if (this.currentCocktail)
                this.node.removeChild(this.currentCocktail);
            if (!_name || !this.cocktails.has(_name)) {
                this.emptyGlass.activate(true);
                this.currentCocktail = null;
                return;
            }
            this.emptyGlass.activate(false);
            let newCocktail = this.cocktails.get(_name);
            this.node.addChild(newCocktail);
            this.currentCocktail = newCocktail;
        }
    }
}