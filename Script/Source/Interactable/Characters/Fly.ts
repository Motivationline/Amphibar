namespace Script {
    export class Fly extends Interactable {
        #wantedIngredients: string[] = this.randomDrinkOrLoad();
        #animator: ƒ.ComponentAnimator;
        private animations: Map<string, ƒ.Animation> = new Map();

        constructor(_name?: string, _image?: string) {
            super(_name, _image);


            ƒ.Project.addEventListener(ƒ.EVENT.RESOURCES_LOADED, this.init.bind(this));
            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, () => {
                this.node.addEventListener(ƒ.EVENT.ATTACH_BRANCH, this.setAnimation.bind(this), true);
            });
        }

        private init() {
            this.#animator = this.node.getChild(0).getComponent(ƒ.ComponentAnimator);
            let animations = ƒ.Project.getResourcesByType(ƒ.Animation);
            for (let anim of animations) {
                this.animations.set(anim.name, <ƒ.Animation>anim);
            }
        }

        private async setAnimation() {
            if (!progress.fly.done) {
                this.#animator.animation = this.animations.get("IdleSad");
            } else {
                this.#animator.animation = this.animations.get("IdleHappy");
                this.node.getParent().getChildrenByName("baarkeeper")[0].getChild(0).getComponent(ƒ.ComponentAnimator).animation = <ƒ.AnimationGLTF>await ƒ.Project.getResource("AnimationGLTF|2024-04-15T19:23:48.182Z|13254");
            }
            this.#animator.jumpTo(0);
        }

        private randomDrinkOrLoad(): string[] {
            let result: string[] = JSON.parse(localStorage.getItem("fly_wants") ?? "[]");
            if (result.length >= 2) return result;

            let amtIngredients: number = Math.floor(Math.random() * 2) + 2;
            let allIngredients: string[] = ["bachwasser", "goldnektar", "schlammsprudel", "seerosenextrakt"];
            let ingredients: string[] = [];
            while (amtIngredients > 0) {
                ingredients.push(...allIngredients.splice(Math.floor(Math.random() * allIngredients.length), 1));
                amtIngredients--;
            }
            localStorage.setItem("fly_wants", JSON.stringify(ingredients));
            return ingredients;
        }
        getInteractionType(): INTERACTION_TYPE {
            return INTERACTION_TYPE.TALK_TO;
        }

        tryUseWith(_interactable: Interactable): void {
            if (!_interactable.name.startsWith("glass.")) {
                CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.no_item"));
                return;
            }
            if (progress.fly.drink == 2) {
                CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.drink.done"));
                return;
            }

            Inventory.Instance.removeItem(_interactable);
            let cocktail = _interactable.name.split(".")[1];
            let ingredients = new Set(CocktailManager.unmix(cocktail));
            let wanted = new Set(this.#wantedIngredients);
            for (let ingredient of wanted) {
                if (ingredients.has(ingredient)) {
                    ingredients.delete(ingredient);
                    wanted.delete(ingredient);
                }
            }
            if (wanted.size > 0) {
                CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.drink.too_little", Interactable.textProvider.get(`item.glass.${[...wanted][0]}.name`)));
                return;
            }
            if (ingredients.size > 0) {
                CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.drink.too_much", Interactable.textProvider.get(`item.glass.${[...ingredients][0]}.name`)));
                return;
            }
            CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.drink.like"));
            progress.fly.drink = 2;
        }

        async interact(): Promise<void> {
            // fly dialogue
            // intro
            if (!progress.fly.intro) {
                CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.intro.0"));
                CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.fly.intro.1"));
                CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.intro.2"));
                CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.fly.intro.3"));
                let result = await CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.intro.4"), "neutral", [
                    { id: "offer", text: Interactable.textProvider.get("character.fly.intro.offer_help") },
                    { id: "request", text: Interactable.textProvider.get("character.fly.intro.request_help") },
                ]);

                if (result === "request") {
                    CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.fly.intro.5"));
                    CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.intro.6"));
                }
                CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.fly.intro.7"));
                CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.intro.8"));
                CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.fly.intro.9"));
            }
            // is there still something to help with?
            let options: DialogOption[] = [];
            // cleaning?
            if (progress.fly.clean <= 3) {
                options.push({ id: "clean", "text": Interactable.textProvider.get("character.fly.intro.option.clean") });
            }
            else if (progress.fly.clean === 4) {
                options.push({ id: "clean-done", "text": Interactable.textProvider.get("character.fly.intro.option.clean.done") });
            }

            // drink?
            if (progress.fly.drink <= 1) {
                options.push({ id: "drink", "text": Interactable.textProvider.get("character.fly.intro.option.drink") });
            }

            // bye option
            options.push({ id: "bye", "text": Interactable.textProvider.get("character.fly.intro.option.bye") });

            let firstTime = true;
            if (options.length > 1) {
                let choice: string | void;
                while (choice !== "bye" && options.length > 1) {
                    if (!progress.fly.intro) {
                        choice = await CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.intro.help"), "neutral", options);
                    }
                    else {
                        if (firstTime) {
                            choice = await CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.dialog"), "neutral", options);
                        } else {
                            choice = await CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.dialog.repeat"), "neutral", options);
                        }
                    }

                    switch (choice) {
                        case "clean":
                            CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.fly.clean.question"));
                            CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.clean.info"));
                            progress.fly.clean = Math.max(1, progress.fly.clean);
                            break;
                        case "drink":
                            CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.fly.drink.question"));
                            CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.drink.info"));
                            progress.fly.drink = 1;
                            break;
                        case "clean-done":
                            CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.fly.clean.done.1"));
                            CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.clean.done.2"));
                            options.splice(options.findIndex((opt) => opt.id === "clean-done"), 1);
                            progress.fly.clean = 6;
                            break;
                    }
                    progress.fly.intro = true;
                    firstTime = false;
                }

                if (choice === "bye") CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.fly.intro.bye"));
                if (options.length > 1)
                    return;
            }

            // nothing to help with anymore but text wasn't seen yet.
            if (!progress.fly.done) {
                if (firstTime)
                    CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.dialog"));
                else
                    CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.dialog.repeat"));
                CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.fly.dialog.done.0"));
                await CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.dialog.done.1"));
                progress.fly.done = true;
                progress.frog.music = true;
                // TODO: play music animation
                this.#animator.animation = <ƒ.Animation>await ƒ.Project.getResource("AnimationGLTF|2024-04-15T11:39:39.877Z|33975");
                this.#animator.jumpTo(0);

                this.node.getParent().getChildrenByName("items")[0].getChildrenByName("Grammophon")[0].getChild(0).getComponent(ƒ.ComponentAnimator).jumpTo(0);
                setTimeout(async () => {
                    this.setAnimation();
                }, this.#animator.animation.totalTime);
                MusicManager.Instance.startGrammophone(this.#animator.animation.totalTime);
                return;
            }
            CharacterScript.talkAs("Fly", Interactable.textProvider.get("character.fly.dialog.done.filler"));
        }
    }
}