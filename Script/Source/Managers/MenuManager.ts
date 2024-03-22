namespace Script {
    import ƒ = FudgeCore;
    export class MenuManager {
        public static Instance = new MenuManager();
        loadingScreen: HTMLElement;
        mainMenuScreen: HTMLElement;
        optionsScreen: HTMLElement;

        constructor(){
            if(MenuManager.Instance) return MenuManager.Instance;
            this.setupListeners();
            MenuManager.Instance = this;
        }

        private setupListeners(){
            document.addEventListener("DOMContentLoaded", this.setupDomConnection.bind(this))
            ƒ.Project.addEventListener(ƒ.EVENT.RESOURCES_LOADED, ()=>{this.updateLoadingText("Erschaffe Shader...");})
            document.addEventListener("interactiveViewportStarted", ()=>{this.updateLoadingText();});
        }
        
        private setupDomConnection(){
            this.loadingScreen = document.getElementById("loading-screen");
            this.mainMenuScreen = document.getElementById("main-menu-screen");
            this.optionsScreen = document.getElementById("options-screen");
            
            this.mainMenuScreen.querySelector("#main-menu-start").addEventListener("click", this.startGame.bind(this));
            this.mainMenuScreen.querySelector("#main-menu-options").addEventListener("click", this.showOptions.bind(this));
            this.mainMenuScreen.querySelector("#main-menu-exit").addEventListener("click", this.exit.bind(this));

            this.optionsScreen.addEventListener("click", this.dismissOptions.bind(this));

            document.querySelector("dialog").addEventListener("click", this.showStartScreens.bind(this));
        }
        
        private showStartScreens(){
            this.mainMenuScreen.classList.remove("hidden");
            this.updateLoadingText("Lade Ressourcen...");
        }

        loadingTextTimeout: number;
        private updateLoadingText(_text?: string){
            console.log("update loading text", _text)
            if(this.loadingTextTimeout) clearTimeout(this.loadingTextTimeout);
            this.loadingScreen.classList.remove("hidden");
            if(!_text || _text.length === 0){
                console.log("remove loading text")
                this.loadingScreen.classList.add("hidden");
                return;
            }

            (<HTMLElement>this.loadingScreen.querySelector("#loading-text")).innerText = _text;
            // this.loadingTextTimeout = setTimeout(()=>{this.updateLoadingText(_text + ".")}, 1000);
        }

        private startGame(){
            this.mainMenuScreen.classList.add("hidden");
        }

        private exit(){
            window.close();
        }

        private showOptions(){
            this.optionsScreen.classList.remove("hidden");
        }
        
        private dismissOptions(_event: MouseEvent){
            if(_event.target !== this.optionsScreen) return;
            this.optionsScreen.classList.add("hide");
            setTimeout(()=>{
                this.optionsScreen.classList.remove("hide");
                this.optionsScreen.classList.add("hidden");
            }, 400)
        }
        
    }
}