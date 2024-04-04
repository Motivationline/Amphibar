namespace Script {
    export class Text {
        private static instance: Text;
        private textData: { [key: string]: string | string[] };
        constructor() {
            if (Text.instance) return Text.instance;
            Text.instance = this;

            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.load();
        }

        private async load() {
            let response = await fetch("./Assets/Text/de_de.json");
            this.textData = await response.json();
        }

        public get(identifier: string): string {
            let text: string | string[] = this.textData[identifier];
            if (!text) return identifier;
            if (typeof text === "string") return text;
            return text[Math.floor(Math.random() * text.length)];
        }
    }
}