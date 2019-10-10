import Logic from "./Logic";
import { EventConstant } from "./EventConstant";
import Utils from "./utils/Utils";
import AudioPlayer from "./utils/AudioPlayer";

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
    levellabel: cc.Label = null;
    @property(cc.Label)
    coinlabel: cc.Label = null;
    @property(cc.Node)
    againDialog:cc.Node = null;
    @property(cc.Sprite)
    dialogPlayer:cc.Sprite = null;

    redbar:cc.ProgressBar = null;
    bluebar:cc.ProgressBar = null;
    purplebar:cc.ProgressBar = null;
    greenbar:cc.ProgressBar = null;
    oilbar:cc.ProgressBar = null;
    redlabel:cc.Label = null;
    bluelabel:cc.Label = null;
    purplelabel:cc.Label = null;
    greenlabel:cc.Label = null;
    oillabel:cc.Label = null;
    
    skill01:cc.Node = null;
    skill02:cc.Node = null;
    skill03:cc.Node = null;
    skill04:cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.on(EventConstant.GAME_OVER, (event) => {
            this.gameOver(event.detail.over);
        })
        this.redbar = this.node.getChildByName('bar').getChildByName('redbar').getComponent(cc.ProgressBar);
        this.bluebar = this.node.getChildByName('bar').getChildByName('bluebar').getComponent(cc.ProgressBar);
        this.purplebar = this.node.getChildByName('bar').getChildByName('purplebar').getComponent(cc.ProgressBar);
        this.greenbar = this.node.getChildByName('bar').getChildByName('greenbar').getComponent(cc.ProgressBar);
        this.oilbar = this.node.getChildByName('bar').getChildByName('oilbar').getComponent(cc.ProgressBar);
        this.redlabel = this.node.getChildByName('bar').getChildByName('redbar').getChildByName('label').getComponent(cc.Label);
        this.bluelabel = this.node.getChildByName('bar').getChildByName('bluebar').getChildByName('label').getComponent(cc.Label);
        this.purplelabel = this.node.getChildByName('bar').getChildByName('purplebar').getChildByName('label').getComponent(cc.Label);
        this.greenlabel = this.node.getChildByName('bar').getChildByName('greenbar').getChildByName('label').getComponent(cc.Label);
        this.oillabel = this.node.getChildByName('bar').getChildByName('oilbar').getChildByName('label').getComponent(cc.Label);
        this.skill01 = this.node.getChildByName('skill').getChildByName('skill01');
        this.skill02 = this.node.getChildByName('skill').getChildByName('skill02');
        this.skill03 = this.node.getChildByName('skill').getChildByName('skill03');
        this.skill04 = this.node.getChildByName('skill').getChildByName('skill04');
    }
    //button
    playAgain(){
        this.againDialog.active = false;
        Logic.isPaused = false;
        cc.director.emit(EventConstant.INIT_MAP);
        if(Logic.target<=Logic.level){
            Logic.reset(Logic.target+100,Logic.maxstep+5);
        }else{
            Logic.reset(Logic.target,Logic.maxstep);
        }
    }
    gameOver(over:boolean){
        this.dialogPlayer.spriteFrame = Logic.spriteFrames[over?'player4':'player']
        this.againDialog.active = true;
        Logic.isPaused = true;
        
    }
    changeOil(){
        if(Logic.oil>=3){
            Logic.oil-=3;
            Logic.step+=2;
            cc.director.emit(EventConstant.PLAY_AUDIO, { detail: { name: AudioPlayer.SKILL_001 } });
            this.changeOil();
        }
    }
    boom(){
        if(Logic.redpower>=6){
            Logic.redpower -= 6;
        }
    }
    useSkill(event:cc.Event,customEventData:string){
        if(Logic.isProcessing){
            return;
        }
        switch(customEventData){
            case '0':this.changeOil();break;
            case '1':break;
            case '2':break;
            case '3':break;
        }
    }

    start () {

    }

    update (dt) {
        this.steplabel.string = `步数：${Logic.step}`;
        this.levellabel.string = `深度：${Logic.level}`;
        this.coinlabel.string = `金币：${Logic.coin}`;
        this.redlabel.string = `${Logic.redpower}/${Logic.maxredpower}`
        this.bluelabel.string = `${Logic.bluepower}/${Logic.maxbluepower}`
        this.purplelabel.string = `${Logic.purplepower}/${Logic.maxpurplepower}`
        this.greenlabel.string = `${Logic.greenpower}/${Logic.maxgreenpower}`
        this.oillabel.string = `${Logic.oil}/${Logic.maxoilpower}`
        this.redbar.progress = Utils.lerpnum(this.redbar.progress,Logic.redpower/Logic.maxredpower,dt*5);
        this.bluebar.progress = Utils.lerpnum(this.bluebar.progress,Logic.bluepower/Logic.maxbluepower,dt*5);
        this.purplebar.progress = Utils.lerpnum(this.purplebar.progress,Logic.purplepower/Logic.maxpurplepower,dt*5);
        this.greenbar.progress = Utils.lerpnum(this.greenbar.progress,Logic.greenpower/Logic.maxgreenpower,dt*5);
        this.oilbar.progress = Utils.lerpnum(this.oilbar.progress,Logic.oil/Logic.maxoilpower,dt*5);
        this.skill01.opacity = Logic.isProcessing?128:255;
        this.skill02.opacity = Logic.isProcessing?128:128;
        this.skill03.opacity = Logic.isProcessing?128:128;
        this.skill04.opacity = Logic.isProcessing?128:128;
    }
}
