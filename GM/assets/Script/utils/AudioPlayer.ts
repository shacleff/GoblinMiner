import { EventConstant } from "../EventConstant";
import Random from "./Random";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioPlayer extends cc.Component {

    public static readonly PLAYER_UPGRADE = 'PLAYER_UPGRADE';
    public static readonly GAME_OVER = 'GAME_OVER';
    public static readonly PLAYER_HIT = 'PLAYER_HIT';
    public static readonly STOP_BG = 'STOP_BG';
    public static readonly PLAY_BG = 'PLAY_BG';
    @property({ type: cc.AudioClip })
    hit: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    upgrade: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    over: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    bg01: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    bg02: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    bg03: cc.AudioClip = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.director.on(EventConstant.PLAY_AUDIO
            , (event) => { this.play(event.detail.name) });
    }
    playbg() {
        let clip = Random.getHalfChance() ? this.bg01 : this.bg03;
        cc.audioEngine.playMusic(clip, true);
    }
    play(name: string) {
        switch (name) {
            case AudioPlayer.PLAYER_UPGRADE:
                cc.audioEngine.playEffect(this.upgrade, false);
                break;
            case AudioPlayer.GAME_OVER:
                cc.audioEngine.playEffect(this.over, false);
                break;
            case AudioPlayer.PLAYER_HIT:
                cc.audioEngine.playEffect(this.hit, false);
                break;
            
            case AudioPlayer.STOP_BG:
                cc.audioEngine.stopMusic();
                break;
            case AudioPlayer.PLAY_BG:
                this.playbg();
                break;
        }
    }

    start() {

    }

    // update (dt) {}
}
