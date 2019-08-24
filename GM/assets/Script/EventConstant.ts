
const {ccclass, property} = cc._decorator;
@ccclass
export class EventConstant extends cc.Component{
    public static readonly PLAYER_MOVE = 'PLAYER_MOVE';
    public static readonly TIME_CHANGE = 'TIME_CHANGE';
    public static readonly ZOOM_UP = 'ZOOM_UP';
    public static readonly PLAYER_LEVEL_UPDATE = 'PLAYER_LEVEL_UPDATE';
    public static readonly GAME_FINISHED = 'GAME_FINISHED';
    public static readonly GAME_OVER = 'GAME_OVER';
    public static readonly GAME_START = 'GAME_START';
    public static readonly PLAY_AUDIO = 'PLAY_AUDIO';
    
    public static eventHandler:cc.Node = new cc.Node();
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    // start () {

    // }

    // update (dt) {}
}
