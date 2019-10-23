import SkillData from "./data/SkillData";
import Logic from "./Logic";
import GameWorld from "./GameWorld";
import SkillManager from "./manager/SkillManager";
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

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkillIcon extends cc.Component {
    static readonly OPERATOR_TAP = 0;
    static readonly OPERATOR_CHOOSE = 1;
    static readonly OPERATOR_SWIPE = 2;
    effectChoose: cc.Node;
    sprite: cc.Sprite;
    data: SkillData = new SkillData();
    isActive: boolean = false;
    skillManager: SkillManager;
    skillTipsNode: cc.Node = null;
    isLongPress = false;
    touchStart = false;
    onLoad() {
        this.effectChoose = this.node.getChildByName('effectChoose');
        this.sprite = this.node.getChildByName('sprite').getComponent(cc.Sprite);
        this.effectChoose.active = false;
        cc.director.on(EventConstant.USE_SKILL, (event) => {
            if (this.isActive) {
                this.doOperator(event.detail.tapPos, event.detail.targetPos);
            }
        })
        this.node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            this.touchStart = true;
            this.isLongPress = false;
            this.scheduleOnce(() => {
                if (this.touchStart && this.skillTipsNode) {
                    this.isLongPress = true;
                    let info = `${this.data.name}\n\n${this.data.desc}\n\n\n需要 红方：${this.data.red} 蓝星：${this.data.blue} 紫圆：${this.data.purple} 绿角：${this.data.green} 燃料：${this.data.oil}`
                    this.skillTipsNode.getChildByName('label').getComponent(cc.Label).string = info;
                    this.skillTipsNode.opacity = 255;
                }
            }, 0.3)
            if (this.node.opacity != 255) {
                return;
            }
            this.node.runAction(cc.scaleTo(0.2, 1.2));
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            if (this.skillTipsNode) { this.skillTipsNode.opacity = 0; }
            this.node.runAction(cc.scaleTo(0.2, 1));
            this.touchStart = false;
            if(this.isLongPress){
                this.isLongPress = false;
                return;
            }
            if (this.node.opacity != 255) {
                return;
            }
            switch (this.data.operator) {
                case SkillIcon.OPERATOR_TAP:
                    this.doOperator();
                    break;
                case SkillIcon.OPERATOR_CHOOSE:
                    this.isActive = !this.isActive;
                    Logic.isUseSkillChoose = this.isActive;
                    break;
                case SkillIcon.OPERATOR_SWIPE:
                    this.isActive = !this.isActive;
                    Logic.isUseSkillSwipe = this.isActive;
                    break;
            }
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch) => {
            this.touchStart = false;
            if (this.skillTipsNode) { this.skillTipsNode.opacity = 0; }
            this.node.runAction(cc.scaleTo(0.2, 1));
            if(this.isLongPress){
                this.isLongPress = false;
                return;
            }
            
        }, this);
    }
    init(skillManager: SkillManager, skillTipsNode: cc.Node) {
        this.skillManager = skillManager;
        this.skillTipsNode = skillTipsNode;
        this.changeRes();
    }
    changeRes() {
        this.sprite.spriteFrame = Logic.spriteFrames[this.data.resName];
    }
    doOperator(tapPos?: cc.Vec2, targetPos?: cc.Vec2) {
        this.isActive = false;
        Logic.isUseSkillChoose = false;
        Logic.isUseSkillSwipe = false;
        if (!this.skillManager) {
            return;
        }
        this.skillManager.doOperator(this.data, tapPos, targetPos);
    }
    start() {

    }
    checkTimeDelay = 0;
    isCheckTimeDelay(dt: number): boolean {
        this.checkTimeDelay += dt;
        if (this.checkTimeDelay > 0.2) {
            this.checkTimeDelay = 0;
            return true;
        }
        return false;
    }

    update(dt: number) {
        if (this.isCheckTimeDelay(dt)) {
            this.effectChoose.active = this.isActive;
            this.node.opacity = Logic.updateElements(this.data.getElementArr(), false) && !Logic.isProcessing ? 255 : 128;
        }
    }
}
