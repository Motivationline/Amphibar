namespace Script {
    export class DialogManager {
        public static Instance = new DialogManager();
        #nameBox: HTMLElement;
        #textBox: HTMLElement;
        #optionBox: HTMLElement;
        #characterBox: HTMLImageElement;
        #overlayBox: HTMLElement;
        #parentBox: HTMLElement;

        #currentDialog: Dialog;
        #textProgress: number = 0;
        #currentPromiseResolver: (value: string | void | PromiseLike<string | void>) => void;

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
            this.#optionBox = this.#parentBox.querySelector("#dialog-options");
            this.#overlayBox = document.getElementById("dialog-overlay");

            this.#overlayBox.addEventListener("click", this.clickedOverlay.bind(this));
        }

        private setupDisplay() {
            this.#overlayBox.classList.remove("hidden");
            this.#parentBox.classList.remove("hidden");

            this.#characterBox.src = this.#currentDialog.icon;
            this.#nameBox.innerText = this.#currentDialog.name;
            this.#optionBox.innerHTML = "";
            this.#textBox.innerHTML = "";
            this.#textProgress = 0;

            // this.#status = DialogStatus.WRITING;
        }

        private clickedOverlay(_event: MouseEvent) {
            this.#textProgress = Infinity;
            if (this.#currentPromiseResolver && !this.#currentDialog.options) {
                this.#currentPromiseResolver();
                this.hideDialog();
            }
        }

        private showText(_delay: number = 10): Promise<void> {
            return new Promise((resolve, reject) => {
                if (_delay <= 0) {
                    this.#textProgress = Infinity;
                }
                let interval = setInterval(() => {
                    this.#textProgress++;
                    this.#textBox.innerText = this.#currentDialog.text.substring(0, this.#textProgress);
                    if (this.#textProgress >= this.#currentDialog.text.length) {
                        clearInterval(interval);
                        // this.#status = DialogStatus.WAITING_FOR_DISMISSAL;
                        setTimeout(resolve, 250);
                    }
                }, _delay);
            });
        }

        private showOptions(): Promise<string> {
            return new Promise((resolve, reject) => {
                this.#optionBox.innerHTML = "";
                for (let option of this.#currentDialog.options) {
                    let button = document.createElement("button");
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

        public async showDialog(_dialog: Dialog, _delay: number = 10): Promise<void | string> {
            this.#currentDialog = _dialog;
            if (this.#currentPromiseResolver) {
                this.#currentPromiseResolver();
                this.#currentPromiseResolver = null;
            }
            this.setupDisplay();
            await this.showText(_delay);
            if (_dialog.options)
                return this.showOptions();
            return new Promise((resolve, reject) => {
                this.#currentPromiseResolver = resolve;
            });
        }
    }

    export interface Dialog {
        text: string,
        name: string,
        icon: string,
        options?: DialogOption[],
    }

    export interface DialogOption {
        text: string,
        id: string,
    }

    enum DialogStatus {
        HIDDEN,
        WRITING,
        WAITING_FOR_DISMISSAL,
        WAITING_FOR_OPTION,
        DONE,
    }
}