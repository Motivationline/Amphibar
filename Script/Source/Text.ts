namespace Script {
    export class Text {
        public static instance: Text = new Text();
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

        public get(identifier: string, ...replacements: string[]): string {
            let text: string | string[] = this.textData[identifier];
            if (!text) return identifier;
            if (typeof text !== "string") 
                text = text[Math.floor(Math.random() * text.length)];
            while(replacements.length > 0){
                text = text.replace("%s", replacements.shift());
            }
            return text;
        }
    }
}