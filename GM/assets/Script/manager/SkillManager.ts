import GameWorld from "../GameWorld";
import SkillData from "../data/SkillData";
import Logic from "../Logic";
import { EventConstant } from "../EventConstant";
import AudioPlayer from "../utils/AudioPlayer";
import BoomData from "../data/BoomData";
import TileData from "../data/TileData";
const { ccclass, property } = cc._decorator;
export default class SkillManager {
    static readonly SKILL001 = "skill001";
    static readonly SKILL002 = "skill002";
    static readonly SKILL003 = "skill003";
    gameWorld: GameWorld;
    doOperator(data: SkillData) {
        if (!this.gameWorld || !Logic.updateElements(data.getElementArr(), true)) {
            return;
        }
        switch (data.resName) {
            case SkillManager.SKILL001:
                Logic.step += 1;
                cc.director.emit(EventConstant.PLAY_AUDIO, { detail: { name: AudioPlayer.SKILL_001 } });
                this.changeOil();
                break;
            case SkillManager.SKILL002: break;
            case SkillManager.SKILL003: 
            this.collectOil();
            break;
        }
    }
    private changeOil(){
        if(Logic.oil>=3){
            Logic.oil-=3;
            Logic.step+=1;
            cc.director.emit(EventConstant.PLAY_AUDIO, { detail: { name: AudioPlayer.SKILL_001 } });
            this.changeOil();
        }
    }
    private collectOil(){
        let blist:BoomData[] = [];
        for (let i = 0; i < this.gameWorld.map.length; i++) {
            for (let j = 0; j < this.gameWorld.map[0].length; j++) {
                   if(this.gameWorld.map[i][j].data.tileType == TileData.OIL){
                    blist.push(new BoomData(i,j,false,this.gameWorld.map[i][j].data.tileSpecial,true));
                   }
            }
        }
        if(blist.length>0){
            this.gameWorld.boomList = this.gameWorld.getBoomList(blist,[]);
            this.gameWorld.boomTiles(this.gameWorld.boomList);
        }
    }
}