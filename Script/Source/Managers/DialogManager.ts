namespace Script {
    export class DialogManager {
        public static Instance = new DialogManager();
        #nameBox: HTMLImageElement;
        #textBox: HTMLElement;
        #optionBox: HTMLElement;
        #characterBox: HTMLImageElement;
        #overlayBox: HTMLElement;
        #parentBox: HTMLElement;
        #continueIcon: HTMLElement;

        #currentDialog: Dialog;
        #textProgress: number = 0;
        #currentPromiseResolver: (value: string | void | PromiseLike<string | void>) => void;

        #dialogQueue: Promise<void | string>[] = [];

        constructor() {
            if (DialogManager.Instance) return DialogManager.Instance;
            document.addEventListener("DOMContentLoaded", this.initHtml.bind(this));
            DialogManager.Instance = this;
        }
        private initHtml() {
            console.log("initHtml");
            this.#parentBox = document.getElementById("dialog");
            this.#nameBox = this.#parentBox.querySelector("#dialog-name");
            this.#textBox = this.#parentBox.querySelector("#dialog-text");
            this.#characterBox = this.#parentBox.querySelector("#dialog-icon");
            this.#optionBox = document.getElementById("dialog-options");
            this.#overlayBox = document.getElementById("dialog-overlay");
            this.#continueIcon = document.getElementById("dialog-text-done");

            this.#overlayBox.addEventListener("click", this.clickedOverlay.bind(this));
        }

        private setupDisplay() {
            this.#characterBox.src = this.#currentDialog.icon;
            this.#nameBox.src = this.#currentDialog.name;
            this.#optionBox.classList.add("hidden");
            this.#textBox.innerHTML = "";
            this.#textProgress = 0;

            // this.#status = DialogStatus.WRITING;
            switch (this.#currentDialog.position) {
                case "left":
                    this.#nameBox.style.gridArea = "name";
                    this.#characterBox.style.gridArea = "char";
                    break;
                case "right":
                    this.#nameBox.style.gridArea = "name2";
                    this.#characterBox.style.gridArea = "char2";
                    break;
            }

            this.#overlayBox.classList.remove("hidden");
            this.#parentBox.classList.remove("hidden");
            this.#continueIcon.classList.add("hidden");
        }

        private clickedOverlay(_event: MouseEvent) {
            this.#textProgress = Infinity;
            if (this.#currentPromiseResolver && !this.#currentDialog.options) {
                this.#currentPromiseResolver();
                this.hideDialog();
            }
        }

        private showText(_delay: number = 10): Promise<void> {
            return new Promise((resolve) => {
                if (_delay <= 0) {
                    this.#textProgress = Infinity;
                }
                let interval = setInterval(() => {
                    this.#textProgress++;
                    [this.#textBox.innerHTML] = this.getTextContent(this.#currentDialog.parsedText, this.#textProgress);
                    if (this.#textProgress >= this.#currentDialog.textLength) {
                        this.#continueIcon.classList.remove("hidden");
                        clearInterval(interval);
                        // this.#status = DialogStatus.WAITING_FOR_DISMISSAL;
                        setTimeout(resolve, 250);
                    }
                }, _delay);
            });
        }

        private getTextContent(_dialog: ParsedDialog, _length: number): [string, number] {
            let text = `<span class="${_dialog.class}">`;
            for (let i = 0; i < _dialog.content.length && _length > 0; i++) {
                let content = _dialog.content[i];
                if (typeof content === "string") {
                    text += content.substring(0, _length);
                    _length -= content.length;
                } else {
                    let [newText, remainingLength] = this.getTextContent(content, _length);
                    _length = remainingLength;
                    text += newText;
                }
            }
            text += "</span>"
            return [text, _length];
        }

        private parseText(_text: string): ParsedDialog {
            try {
                this.#currentDialog.textLength = 0;
                let [dialog] = this.findBracketsRecursive(_text);
                return dialog;
            } catch (error) {
                console.error(error);
                this.#currentDialog.textLength = _text.length;
                return { class: "", content: [_text] }
            }
        }

        private findBracketsRecursive(_remainingString: string, _currentOpenClass: string = ""): [ParsedDialog, string] {
            let openRegex: RegExp = /\[(?!\/)(.+?)]/g;
            let closeRegex: RegExp = /\[\/(.+?)]/g;
            let resultDialog: ParsedDialog = { content: [], class: _currentOpenClass };

            while (_remainingString.length > 0) {
                let nextOpenMatch = [..._remainingString.matchAll(openRegex)][0];
                let nextCloseMatch = [..._remainingString.matchAll(closeRegex)][0];
                if (!nextOpenMatch && !nextCloseMatch) {
                    resultDialog.content.push(_remainingString);
                    this.#currentDialog.textLength += _remainingString.length;
                    return [resultDialog, ""];
                }
                if (_currentOpenClass !== "") {
                    if (!nextCloseMatch)
                        throw new Error(`Parsing error: couldn't find closing tag for [${_currentOpenClass}].`);
                    if (nextCloseMatch[1] !== _currentOpenClass && ((nextOpenMatch && nextOpenMatch.index > nextCloseMatch.index) || !nextOpenMatch))
                        throw new Error(`Parsing error: couldn't find closing tag for [${_currentOpenClass}], found [/${nextCloseMatch[1]}] instead.`);
                }
                if (nextCloseMatch && !nextOpenMatch || (nextCloseMatch && nextOpenMatch && nextCloseMatch.index < nextOpenMatch.index)) {
                    // found the correct closing tag, return just text content
                    resultDialog.content.push(_remainingString.substring(0, nextCloseMatch.index));
                    this.#currentDialog.textLength += nextCloseMatch.index + 1;
                    return [resultDialog,
                        _remainingString.substring(nextCloseMatch.index + nextCloseMatch[0].length)];
                }
                // didn't find the correct closing tag next, do recursive search
                this.#currentDialog.textLength += nextOpenMatch.index + 1;
                resultDialog.content.push(_remainingString.substring(0, nextOpenMatch.index));
                let [result, newString] = this.findBracketsRecursive(_remainingString.substring(nextOpenMatch.index + nextOpenMatch[0].length), nextOpenMatch[1]);
                resultDialog.content.push(result);
                _remainingString = newString;
            }
            return [resultDialog, ""];
        }

        private showOptions(): Promise<string> {
            this.#continueIcon.classList.add("hidden");
            this.#optionBox.classList.remove("hidden");
            return new Promise((resolve) => {
                this.#optionBox.innerHTML = "";
                for (let option of this.#currentDialog.options) {
                    let button = document.createElement("span");
                    button.classList.add("dialog-options-option");
                    this.#optionBox.appendChild(button);
                    button.innerText = option.text;
                    button.addEventListener("click", () => {
                        resolve(option.id);
                        this.hideDialog();
                    });
                }
            });

        }

        private hideDialog() {
            this.#overlayBox.classList.add("hidden");
            this.#parentBox.classList.add("hidden");
        }

        private async showDialogInternal(_dialog: Dialog, _delay: number = 10): Promise<void | string> {
            // wait for previous dialogs to be done
            await Promise.all(this.#dialogQueue);

            // clear old existing dialog
            // if (this.#currentPromiseResolver) {
            //     this.#currentPromiseResolver();
            this.#currentPromiseResolver = null;
            // }

            // setup current dialog
            this.#currentDialog = { ..._dialog };
            this.#currentDialog.parsedText = this.parseText(_dialog.text);
            this.setupDisplay();

            // show dialog
            MenuManager.Instance.hoverEnd();
            await this.showText(_delay);
            if (_dialog.options)
                return this.showOptions();
            return new Promise((resolve) => {
                this.#currentPromiseResolver = resolve;
            });
        }

        public async showDialog(_dialog: Dialog, _delay: number = 10): Promise<void | string> {
            let promise = this.showDialogInternal(_dialog, _delay);
            this.#dialogQueue.push(promise);
            return promise;
        }
    }

    export interface Dialog {
        text: string,
        parsedText?: ParsedDialog,
        textLength?: number,
        name: string,
        icon: string,
        position: "left" | "right",
        options?: DialogOption[],
    }

    export interface DialogOption {
        text: string,
        id: string,
    }

    interface ParsedDialog {
        class: string,
        content: (string | ParsedDialog)[],
    }

    enum DialogStatus {
        HIDDEN,
        WRITING,
        WAITING_FOR_DISMISSAL,
        WAITING_FOR_OPTION,
        DONE,
    }
}