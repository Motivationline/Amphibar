namespace Script {
    export class MusicManager extends ƒ.ComponentScript {
        public static Instance: MusicManager = new MusicManager();
        private background = new ƒ.Audio("Assets/Music/Amphibar_GameMusic.mp3");
        private grammophone = new ƒ.Audio("Assets/Music/Heavy_Riffs.mp3");
        private cmpAudio: ƒ.ComponentAudio;
        private listener = this.start.bind(this);

        constructor() {
            if (MusicManager.Instance) return MusicManager.Instance;
            super();
            MusicManager.Instance = this;

            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;


            window.addEventListener("click", this.listener);
        }

        private start() {
            window.removeEventListener("click", this.listener);
            this.cmpAudio = new ƒ.ComponentAudio(progress.frog.music ? this.grammophone : this.background, true, true);
            this.cmpAudio.connect(true);
            this.changeVolume(settings.music / 100);
        }

        public startGrammophone(_fadeOut: number = 0) {
            let startVol = this.cmpAudio.volume;

            let interval: number; 
            if (_fadeOut > 0) {
                interval = setInterval(() => {
                    this.cmpAudio.volume -= 0.01;
                    if (this.cmpAudio.volume <= 0)
                        clearInterval(interval)
                }, _fadeOut / 2 / (startVol * 100));
            }
            setTimeout(
                () => {
                    clearInterval(interval);
                    this.cmpAudio.play(false);
                    this.cmpAudio.setAudio(this.grammophone);
                    this.cmpAudio.volume = startVol;
                    this.cmpAudio.play(true);
                }, _fadeOut
            )
        }

        public changeVolume(_vol: number){
            if(!this.cmpAudio) return;
            this.cmpAudio.volume = _vol;
        }
    }
}