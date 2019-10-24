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
    static readonly SKILL004 = "skill004";
    gameWorld: GameWorld;
    doOperator(data: SkillData, tapPos?: cc.Vec2, targetPos?: cc.Vec2) {
        if (!this.gameWorld || !Logic.updateElements(data.getElementArr(), true)) {
            return;
        }
        switch (data.resName) {
            case SkillManager.SKILL001:
                Logic.step += 1;
                cc.director.emit(EventConstant.PLAY_AUDIO, { detail: { name: AudioPlayer.SKILL_001 } });
                this.changeOil();
                break;
            case SkillManager.SKILL002:
                this.tntBoom(tapPos);
                break;
            case SkillManager.SKILL003:
                this.collectOil();
                break;
            case SkillManager.SKILL004:
                this.pickTile(tapPos);
                break;
        }
    }
    private tntBoom(tapPos: cc.Vec2) {
        let arr = [cc.v2(tapPos.x + 1, tapPos.y), cc.v2(tapPos.x + 1, tapPos.y + 1), cc.v2(tapPos.x + 1, tapPos.y - 1), cc.v2(tapPos.x - 1, tapPos.y)
            , cc.v2(tapPos.x - 1, tapPos.y + 1), cc.v2(tapPos.x - 1, tapPos.y - 1), cc.v2(tapPos.x, tapPos.y + 1), cc.v2(tapPos.x, tapPos.y - 1)
            , tapPos]
        let blist: BoomData[] = [];
        for (let pos of arr) {
            if (GameWorld.isPosIndexValid(pos)) {
                blist.push(new BoomData(pos.x, pos.y, false, this.gameWorld.map[pos.x][pos.y].data.tileSpecial, true,0));
            }
        }
        if (blist.length > 0) {
            this.gameWorld.boomList = this.gameWorld.getBoomList(blist, []);
            this.gameWorld.boomTiles(this.gameWorld.boomList);
        }
    }
    private pickTile(tapPos: cc.Vec2){
        let blist: BoomData[] = [];
        if (GameWorld.isPosIndexValid(tapPos)) {
            blist.push(new BoomData(tapPos.x, tapPos.y, false, this.gameWorld.map[tapPos.x][tapPos.y].data.tileSpecial, true,1));
        }
        if (blist.length > 0) {
            this.gameWorld.boomList = this.gameWorld.getBoomList(blist, []);
            this.gameWorld.boomTiles(this.gameWorld.boomList);
        }
    }
    private changeOil() {
        if (Logic.elements.oil >= 3) {
            Logic.elements.oil -= 3;
            Logic.step += 1;
            cc.director.emit(EventConstant.PLAY_AUDIO, { detail: { name: AudioPlayer.SKILL_001 } });
            this.changeOil();
        }
    }
    private collectOil() {
        let blist: BoomData[] = [];
        for (let i = 0; i < this.gameWorld.map.length; i++) {
            for (let j = 0; j < this.gameWorld.map[0].length; j++) {
                if (this.gameWorld.map[i][j].data.tileType == TileData.OIL) {
                    blist.push(new BoomData(i, j, false, this.gameWorld.map[i][j].data.tileSpecial, true,0));
                }
            }
        }
        if (blist.length > 0) {
            this.gameWorld.boomList = this.gameWorld.getBoomList(blist, []);
            this.gameWorld.boomTiles(this.gameWorld.boomList);
        }
    }
}