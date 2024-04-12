namespace Script {
    export class Frog extends Interactable {

        getInteractionType(): INTERACTION_TYPE {
            return INTERACTION_TYPE.TALK_TO;
        }

        tryUseWith(_interactable: Interactable): void {
            CharacterScript.talkAs("Frog", Interactable.textProvider.get("character.frog.no_item"));
            return;
        }

        async interact(): Promise<void> {
            // frog dialogue
            // intro
            if (!progress.frog.intro) {
                let result = await CharacterScript.talkAs("Frog", Interactable.textProvider.get("character.frog.intro.0"), "neutral", [
                    { id: "intro", text: Interactable.textProvider.get("character.frog.intro.option.intro") },
                    { id: "help", text: Interactable.textProvider.get("character.frog.intro.option.help") },
                ]);
                if (result === "intro") {
                    CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.frog.intro.1"));
                    CharacterScript.talkAs("Frog", Interactable.textProvider.get("character.frog.intro.2"));
                    CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.frog.intro.3"));
                } else {
                    CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.frog.intro.3_2"));
                }
                CharacterScript.talkAs("Frog", Interactable.textProvider.get("character.frog.intro.4"));
                await CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.frog.intro.5"));
                progress.frog.intro = true;
                return;
            }

            // we don't know yet that the door is closed
            if (!progress.frog.music && !progress.frog.checked_door) {
                CharacterScript.talkAs("Frog", Interactable.textProvider.get("character.frog.intro.go_away"));
                return;
            }

            // we know now that the door is closed
            if (!progress.frog.music && progress.frog.checked_door) {
                let result = await CharacterScript.talkAs("Frog", Interactable.textProvider.get("character.frog.dialog.0"), "neutral", [
                    { id: "closed", text: Interactable.textProvider.get("character.frog.dialog.option.door_closed") },
                    { id: "sorry", text: Interactable.textProvider.get("character.frog.dialog.option.sorry") },
                ]);

                if (result !== "closed") return;
                CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.frog.dialog.1"));
                result = await CharacterScript.talkAs("Frog", Interactable.textProvider.get("character.frog.dialog.2"), "neutral", [
                    { id: "door", text: Interactable.textProvider.get("character.frog.dialog.option.door") },
                    { id: "sorry", text: Interactable.textProvider.get("character.frog.dialog.option.sorry") },
                ]);

                if (result === "sorry") {
                    CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.frog.dialog.3"));
                    CharacterScript.talkAs("Frog", Interactable.textProvider.get("character.frog.dialog.4"));
                    return;
                }

                if (result === "door") {
                    CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.frog.dialog.5"));
                    CharacterScript.talkAs("Frog", Interactable.textProvider.get("character.frog.dialog.6"));
                    CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.frog.dialog.7"));
                    CharacterScript.talkAs("Frog", Interactable.textProvider.get("character.frog.dialog.8"));
                    return;
                }
                return;
            }

            // music is playing, but no key yet
            if (progress.frog.music && !progress.frog.key) {

                await CharacterScript.talkAs("Frog", Interactable.textProvider.get("character.frog.music.1"), "neutral", [
                    { id: "help", text: Interactable.textProvider.get("character.frog.music.option.help") },
                ]);
                await CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.frog.music.2"));
                await CharacterScript.talkAs("Frog", Interactable.textProvider.get("character.frog.music.3"));
                await CharacterScript.talkAs("Tadpole", Interactable.textProvider.get("character.frog.music.4"));
                Inventory.Instance.addItem(new Interactable("key", "Assets/UI/Inventar/Item_Key.png"))
                progress.frog.key = true;
                return;
            }

            // we already gave the key
            CharacterScript.talkAs("Frog", Interactable.textProvider.get("character.frog.done"));
        }
    }
}