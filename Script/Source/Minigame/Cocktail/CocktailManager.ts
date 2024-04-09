namespace Script {
    import ƒ = FudgeCore;
    export class CocktailManager extends ƒ.ComponentScript {
        public static Instance = new CocktailManager();
        private static mixTable: string[] = [
            /*1*/ "bachwasser",
            /*2*/ "goldnektar",
            /*3*/ "goldwasser",
            /*4*/ "schlammsprudel",
            /*5*/ "schlammfluss",
            /*6*/ "matschsaft",
            /*7*/ "nektarquelle",
            /*8*/ "seerosenextrakt",
            /*9*/ "bachblütenzauber",
            /*10*/ "goldrosenelixir",
            /*11*/ "bachblütennektar",
            /*12*/ "sumpfrosensprudel",
            /*13*/ "supfrosenschorle",
            /*14*/ "goldrosenmatsch",
        ]

        private currentIngredients: CocktailIngredient[] = [];

        constructor() {
            super();
            if (CocktailManager.Instance) return CocktailManager.Instance;
            CocktailManager.Instance = this;

            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
        }

        get currentCocktail(): string {
            return CocktailManager.mix(...this.currentIngredients);
        }

        public addIngredient(_ingredient: CocktailIngredient): boolean {
            if (this.currentIngredients.length >= 3) {
                CharacterScript.talkAs("Tadpole", Text.instance.get("cocktail.full"));
                return false;
            }
            this.currentIngredients.push(_ingredient);
            return true;
        }

        public static mix(..._ingredients: CocktailIngredient[]): string {
            let set = new Set(_ingredients);
            let result = Array.from(set).reduce((prev, current) => prev + current, -1);
            if (this.mixTable[result]) return this.mixTable[result];
            return "unknown";
        }

        public get ingredients() {
            return Array.from(this.currentIngredients);
        }

        public resetCocktail() {
            let glassInInventory = Inventory.Instance.hasItemThatStartsWith("glass");
            if (glassInInventory) {
                Inventory.Instance.removeItem(glassInInventory);
            }

            this.currentIngredients.length = 0;
            // TODO update visuals of glass

        }

        public takeCocktail() {
            let current = this.currentCocktail;
            this.resetCocktail();
            Inventory.Instance.addItem(new Interactable(`glass.${current}`, `Assets/UI/Inventar/${current}.png`));
        }
    }
}