import ProfileData from "../data/ProfileData";
import SkillData from "../data/SkillData";

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
export default class ProfileManager{
    data:ProfileData = new ProfileData();
    constructor(){
        this.loadData();
    }
    loadData(){
        //清空当前数据
        this.data = new ProfileData();
        //读取存档
        this.loadProfile();
    }
   
    getSaveData():ProfileData{
        let s = cc.sys.localStorage.getItem('goblindata');
        if(s){
            return JSON.parse(s);
        }
        return null;
    }
    saveData(){
        cc.sys.localStorage.setItem('goblindata',JSON.stringify(this.data));
        console.log('save data');
    }
    clearData(){
        cc.sys.localStorage.setItem('goblindata','');
        this.data.clearData();
        console.log('clear data');
    }
    
    loadProfile(){
        let data = this.getSaveData();
        if(!data){
            return;
        }
        this.data.coins = data.coins;
        this.data.level = data.level;
        if(!data.skillList){
            return;
        }
        //加载技能
        for(let i =0;i<data.skillList.length;i++){
            let sd = new SkillData();
            sd.valueCopy(data.skillList[i]);
            this.data.skillList.push(sd);
        }
        console.log('data',this);
    }
}
