import Logic from "./Logic";
import List from "./ui/List";
import ListItem from "./ui/ListItem";

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
export default class MineStage extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    @property(cc.Label)
    levellabel: cc.Label = null;
    @property(List)
    list: List = null;
    data: number[] = [];
    currentLevel = 50;

    onLoad() {
        this.data = [];
        for (let n: number = 0; n < 100; n++) {
            this.data.push(n*30);
        }
        this.list.numItems = this.data.length;
        this.scheduleOnce(()=>{
            this.list.scrollTo(this.currentLevel,2,0.25,false);
        },1);
    }

    start() {
        this.levellabel.string = `当前深度：${Logic.level} \n\n下一目标：${Logic.level + 30}`;
    }
    goHome() {
        cc.director.loadScene('main');
    }
    //网格列表2渲染器
    onListRender(item: cc.Node, idx: number) {
        item.getComponent(ListItem).title.getComponent(cc.Label).string = this.data[idx] + '';
        item.getComponent(ListItem).icon.node.color = idx>this.currentLevel?cc.Color.BLACK:cc.Color.WHITE;
        let finish:cc.Node = item.getComponent(ListItem).node.getChildByName('finish');
        let cover:cc.Node = item.getComponent(ListItem).node.getChildByName('cover');
        cover.opacity = idx>this.currentLevel?200:128;
        finish.opacity = idx>=this.currentLevel?0:200;
        if(idx == this.currentLevel){
            cover.opacity = 0;
        }
    }
    onItemClick(event:cc.Event){
        let item:ListItem = event.target.getComponent(ListItem);
        cc.log(item.listId);
        if(item.listId <= this.currentLevel){
            cc.director.loadScene('loading');
        }
    }

    // update (dt) {}
}
