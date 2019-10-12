import SkillData from "./SkillData";

export default class ProfileData{
    coins:number=0;
    level:number=0;
    skillList:SkillData[];
    clearData(){
        cc.sys.localStorage.setItem('profileData','');
        this.coins = 0;
        this.level = 0;
        this.skillList = [];
        console.log('clear data');
    }
}