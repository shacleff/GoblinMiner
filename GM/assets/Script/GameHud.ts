import Logic from "./Logic";
import { EventConstant } from "./EventConstant";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    steplabel: cc.Label = null;
    @property(cc.Label)
    scorelabel: cc.Label = null;
    @property(cc.Label)
    targetlabel: cc.Label = null;
    @property(cc.Node)
    againDialog:cc.Node = null;
    @property(cc.Sprite)
    dialogPlayer:cc.Sprite = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.on(EventConstant.GAME_OVER, (event) => {
            this.gameOver(event.detail.over);
        })
    }
    //button
    playAgain(){
        this.againDialog.active = false;
        Logic.isPaused = false;
        cc.director.emit(EventConstant.INIT_MAP);
        if(Logic.target<=Logic.score){
            Logic.reset(Logic.target+5000,Logic.maxstep+5);
        }else{
            Logic.reset(Logic.target,Logic.maxstep);
        }
    }
    gameOver(over:boolean){
        this.dialogPlayer.spriteFrame = Logic.spriteFrames[over?'player4':'player']
        this.againDialog.active = true;
        Logic.isPaused = true;
        
    }

    start () {

    }

    update (dt) {
        this.steplabel.string = `步数：${Logic.step}`;
        this.scorelabel.string = `得分：${Logic.score}`;
        this.targetlabel.string = `目标：${Logic.target}`;
    }
}
