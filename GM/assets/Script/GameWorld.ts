import { EventConstant } from "./EventConstant";
import Logic from "./Logic";
import TileData from "./data/TileData";
import Tile from "./Tile";
import AudioPlayer from "./utils/AudioPlayer";
import BoomData from "./data/BoomData";
import SkillManager from "./manager/SkillManager";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
@ccclass
export default class GameWorld extends cc.Component {

    @property(cc.Prefab)
    playerPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    tilePrefab: cc.Prefab = null;
    private timeDelay = 0;
    private checkTimeDelay = 0;
    actorLayer: cc.Node;
    map: Tile[][] = [];
    blockMap:Tile[][] = [];
    static readonly BOTTOM_LINE_INDEX = 3;
    static readonly TILE_SIZE: number = 80;
    static WIDTH_SIZE: number = 9;
    static HEIGHT_SIZE: number = 9;
    static MAPX: number = -GameWorld.WIDTH_SIZE * GameWorld.TILE_SIZE / 2;
    static MAPY: number = 128;
    static readonly BLOCK_HEIGHT = 3;
    canFall = false;//是否下落
    canFill = false;//是否填充
    isRandoming = false;//是否正在随机
    isTopDown = false;//是否正在下沉
    isSkilling = false;//是否正在使用技能
    boomList: BoomData[] = [];
    speed = 0.1;

    onLoad() {
        cc.log(GameWorld.MAPX);
        cc.director.on(EventConstant.TILE_SWITCH, (event) => {
            this.tileSwitched(event.detail.tapPos, event.detail.targetPos, false);
        })
        cc.director.on(EventConstant.INIT_MAP, (event) => {
            this.initMap();
        })
        
        this.actorLayer = this.node.getChildByName('actorlayer');
        this.actorLayer.zIndex = 2000;
        this.initMap();
    }

    initMap() {
        this.boomList = [];
        this.actorLayer.removeAllChildren();
        this.map = new Array();
        for (let i = 0; i < GameWorld.WIDTH_SIZE; i++) {
            this.map[i] = new Array();
            for (let j = 0; j < GameWorld.HEIGHT_SIZE; j++) {
                let tile = cc.instantiate(this.tilePrefab).getComponent(Tile);
                tile.initTile(TileData.getRandomTileData(i, j));
                if (j < GameWorld.BLOCK_HEIGHT) {
                    tile.initTile(TileData.getBlockTileData(i, j));
                }
                this.actorLayer.addChild(tile.node);
                this.map[i][j] = tile;
            }
        }
        this.blockMap = new Array();
        for (let i = 0; i < GameWorld.WIDTH_SIZE; i++) {
            this.blockMap[i] = new Array();
            for (let j = 0; j < GameWorld.BLOCK_HEIGHT; j++) {
                let tile = cc.instantiate(this.tilePrefab).getComponent(Tile);
                tile.initTile(TileData.getBlockTileData(i, j-GameWorld.BLOCK_HEIGHT));
                tile.node.opacity = 0;
                this.actorLayer.addChild(tile.node);
                this.blockMap[i][j] = tile;
            }
        }
        this.checkMapValid();
        cc.log(this.showMap());
    }
    /**检查地图有效性并重组 */
    checkMapValid() {
        let boomList = this.getBoomList([],[]);
        for (let i = 0; i < boomList.length; i++) {
            let p = boomList[i];
            if(!this.isPosBlock(cc.v2(p.x,p.y))){
                this.map[p.x][p.y].initTile(TileData.getRandomTileData(p.x, p.y))
            }
        }
        if (boomList.length > 0) {
            this.checkMapValid();
        } else if (!this.checkMapCanBoom()) {
            this.randomSortMap();
        }
    }
    /**打乱顺序 重新排列可移动元素*/
    randomSortMap(isAnim?: boolean) {
        cc.log("randomSortMap");
        this.isRandoming = true;
        let indexs1: cc.Vec2[] = new Array();
        let indexs2: cc.Vec2[] = new Array();
        for (let i = 0; i < this.map.length; i++) {
            for (let j = 0; j < this.map[0].length; j++) {
                if (!this.isBlockOrEmptyType(this.map[i][j].data.tileType)) {
                    indexs1.push(cc.v2(i, j));
                    indexs2.push(cc.v2(i, j));
                }
            }
        }
        indexs2.sort(() => {
            return Math.random() - 0.5;
        })
        for (let i = 0; i < indexs1.length; i++) {
            let pos1 = indexs1[i].clone();
            let pos2 = indexs2[i].clone();
            this.map[pos1.x][pos1.y].data.posIndex = pos2;
            this.map[pos2.x][pos2.y].data.posIndex = pos1;
            let temp = this.map[pos1.x][pos1.y];
            this.map[pos1.x][pos1.y] = this.map[pos2.x][pos2.y];
            this.map[pos2.x][pos2.y] = temp;
        }
        let boomList = this.getBoomList([],[]);
        if (!this.checkMapCanBoom() || boomList.length > 0) {
            cc.log(this.showMap());
            this.randomSortMap(isAnim);
            return;
        }
        let count = 0;
        for (let i = 0; i < indexs1.length; i++) {
            let pos = indexs1[i].clone();
            this.map[pos.x][pos.y].updateTilePosition(isAnim, () => {
                count++;
                if (count == indexs1.length) {
                    this.isRandoming = false;
                }
            });
        }
    }
    /**地图下降 */
    downMap(){
        Logic.level += 3;
        Logic.step += 3;
        let speed = 0.4;
        cc.director.emit(EventConstant.PLAY_AUDIO, { detail: { name: AudioPlayer.FALL_DOWN } });
        this.isTopDown = true;
        for (let i = 0; i < this.map.length; i++) {
            for (let j = 0; j < this.map[0].length; j++) {
                    this.map[i][j].data.posIndex = cc.v2(i,j+GameWorld.BLOCK_HEIGHT);
                    if(j>=GameWorld.HEIGHT_SIZE-GameWorld.BLOCK_HEIGHT){
                        this.map[i][j].node.runAction(cc.fadeOut(speed/2));
                    }else{
                        this.map[i][j].node.runAction(cc.moveTo(speed,GameWorld.getPosInMap(this.map[i][j].data.posIndex)));
                    }
            }
        }
        for (let i = 0; i < this.blockMap.length; i++) {
            for (let j = 0; j < this.blockMap[0].length; j++) {
                    this.blockMap[i][j].data.posIndex = cc.v2(i,j);
                    this.blockMap[i][j].node.opacity = 255;
                    this.blockMap[i][j].node.runAction(cc.moveTo(speed,GameWorld.getPosInMap(this.blockMap[i][j].data.posIndex)));
            }
        }
        this.scheduleOnce(()=>{
            for (let i = 0; i < this.map.length; i++) {
                for (let j = this.map[0].length-1; j-GameWorld.BLOCK_HEIGHT > -1; j--) {
                        let temp = this.map[i][j];
                        this.map[i][j] = this.map[i][j-GameWorld.BLOCK_HEIGHT];
                        this.map[i][j-GameWorld.BLOCK_HEIGHT] = temp;
                }
            }
            for (let i = 0; i < this.blockMap.length; i++) {
                for (let j = 0; j < this.blockMap[0].length; j++) {
                        let temp = this.blockMap[i][j];
                        this.blockMap[i][j] = this.map[i][j];
                        this.map[i][j] = temp;
                        this.blockMap[i][j].initTile(TileData.getBlockTileData(i, j-GameWorld.BLOCK_HEIGHT));
                        this.blockMap[i][j].node.opacity = 0;
                }
            }
            this.isTopDown = false;
        },speed*1.5)
    }
    /**检查地图是否可以消除 */
    checkMapCanBoom(): boolean {
        let mapdata = this.getMapDataClone();
        for (let i = 0; i < mapdata.length; i++) {
            for (let j = 0; j < mapdata[0].length; j++) {
                if (mapdata[i][j].isBlock) {
                    continue;
                }
                let temp = mapdata[i][j];
                if (j < mapdata[0].length - 1 && !mapdata[i][j + 1].isBlock) {
                    //竖排元素交换
                    mapdata[i][j] = mapdata[i][j + 1];
                    mapdata[i][j + 1] = temp;
                    if (this.checkPosHasThree(cc.v2(i, j), mapdata) || this.checkPosHasThree(cc.v2(i, j + 1), mapdata)) {
                        cc.log("CanBoom");
                        return true;
                    }
                    //竖排元素复位
                    temp = mapdata[i][j];
                    mapdata[i][j] = mapdata[i][j + 1];
                    mapdata[i][j + 1] = temp;
                }
                if (i < mapdata.length - 1 && !mapdata[i + 1][j].isBlock) {
                    //横排元素交换
                    temp = mapdata[i][j];
                    mapdata[i][j] = mapdata[i + 1][j];
                    mapdata[i + 1][j] = temp;
                    if (this.checkPosHasThree(cc.v2(i, j), mapdata) || this.checkPosHasThree(cc.v2(i + 1, j), mapdata)) {
                        cc.log("CanBoom");
                        return true;
                    }
                    //横排元素复位
                    temp = mapdata[i][j];
                    mapdata[i][j] = mapdata[i + 1][j];
                    mapdata[i + 1][j] = temp;
                }
            }
        }
        cc.log("NoTileCanBoom");
        return false;
    }
    checkPosHasThree(pos: cc.Vec2, mapdata: TileData[][]): boolean {
        let i = pos.x;
        let j = pos.y;
        if (this.isDataTypeEqual(cc.v2(i, j), cc.v2(i, j + 1), mapdata)
            && this.isDataTypeEqual(cc.v2(i, j), cc.v2(i, j + 2), mapdata)
            || this.isDataTypeEqual(cc.v2(i, j), cc.v2(i, j - 1), mapdata)
            && this.isDataTypeEqual(cc.v2(i, j), cc.v2(i, j - 2), mapdata)
            || this.isDataTypeEqual(cc.v2(i, j), cc.v2(i, j - 1), mapdata)
            && this.isDataTypeEqual(cc.v2(i, j), cc.v2(i, j + 1), mapdata)
            || this.isDataTypeEqual(cc.v2(i, j), cc.v2(i + 1, j), mapdata)
            && this.isDataTypeEqual(cc.v2(i, j), cc.v2(i + 2, j), mapdata)
            || this.isDataTypeEqual(cc.v2(i, j), cc.v2(i - 1, j), mapdata)
            && this.isDataTypeEqual(cc.v2(i, j), cc.v2(i - 2, j), mapdata)
            || this.isDataTypeEqual(cc.v2(i, j), cc.v2(i + 1, j), mapdata)
            && this.isDataTypeEqual(cc.v2(i, j), cc.v2(i - 1, j), mapdata)
        ) {
            return true;
        }
        return false;
    }
    /**检查是否3-9层是否还有障碍 */
    checkMapHasTopBlock():boolean{
        for (let i = 0; i < this.map.length; i++) {
            for (let j = 2; j < this.map[0].length; j++) {
                if(this.isTypeBlock(this.map[i][j].data.tileType)){
                    return true;
                }
            }
        }
        return false;
    }
    getMapDataClone(): TileData[][] {
        let mapdata: TileData[][] = new Array();
        for (let i = 0; i < this.map.length; i++) {
            mapdata[i] = new Array();
            for (let j = 0; j < this.map[0].length; j++) {
                let tileData = this.map[i][j].data.clone();
                mapdata[i][j] = tileData;
            }
        }
        return mapdata;
    }
    showMap(): string {
        let str = '';
        for (let i = 0; i < this.map[0].length; i++) {
            let tempstr = ''
            for (let j = 0; j < this.map.length; j++) {
                tempstr += this.getTileTypeString(this.map[j][i].data.tileType) + ',';
            }
            str = tempstr + '\n' + str;
        }
        return str;
    }
    getTileTypeString(type: string) {
        switch (type) {
            case TileData.RED: return '1';
            case TileData.BLUE: return '2';
            case TileData.PURPLE: return '3';
            case TileData.GREEN: return '4';
            case TileData.OIL: return '5';
            case TileData.COIN: return '6';
            case TileData.BLOCK: return 'b';
            default: return '0';
        }
    }

    tileSwitched(tapPos: cc.Vec2, targetPos: cc.Vec2, isFall: boolean) {
        if (targetPos.x > this.map.length - 1 || targetPos.x < 0 || targetPos.y > this.map[0].length - 1 || targetPos.y < 0) {
            return;
        }
        if (this.map[targetPos.x][targetPos.y].data.isBlock) {
            return;
        }
        if (this.canFall || this.canFill) {
            return;
        }
        Logic.isProcessing = true;
        if (this.map[tapPos.x][tapPos.y].data.isEmpty || this.map[targetPos.x][targetPos.y].data.isEmpty) {
            return;
        }
        this.switchTileData(tapPos, targetPos);
        let boomList = this.getBoomList([],[tapPos, targetPos]);
        this.boomList = boomList;
        if (boomList.length > 0) {
            Logic.step--;
            this.map[tapPos.x][tapPos.y].node.runAction(cc.moveTo(this.speed, GameWorld.getPosInMap(cc.v2(tapPos.x, tapPos.y))));
            this.map[targetPos.x][targetPos.y].node.runAction(cc.moveTo(this.speed, GameWorld.getPosInMap(cc.v2(targetPos.x, targetPos.y))));
            this.boomTiles(boomList);
        } else {
            this.switchTileData(tapPos, targetPos);
            this.map[tapPos.x][tapPos.y].node.runAction(cc.sequence(cc.moveTo(this.speed, GameWorld.getPosInMap(cc.v2(targetPos.x, targetPos.y)))
                , cc.moveTo(this.speed, GameWorld.getPosInMap(cc.v2(tapPos.x, tapPos.y)))));
            this.map[targetPos.x][targetPos.y].node.runAction(cc.sequence(cc.moveTo(this.speed, GameWorld.getPosInMap(cc.v2(tapPos.x, tapPos.y)))
                , cc.moveTo(this.speed, GameWorld.getPosInMap(cc.v2(targetPos.x, targetPos.y)))));
        }
    }

    boomTiles(boomList: BoomData[]) {
        let count = 0;
        if (boomList.length > 0) {
            cc.director.emit(EventConstant.PLAY_AUDIO, { detail: { name: AudioPlayer.BOOM_TILE } });
        }
        for (let i = 0; i < boomList.length; i++) {
            // if (Logic.score >= Logic.target && Logic.step >= 0) {
            //     cc.director.emit(EventConstant.GAME_OVER, { detail: { over: false } });
            // }
            let offset = 10;
            let speed = 0.05;
            let p = boomList[i];
            let more = 1;
            switch (this.map[p.x][p.y].data.tileSpecial) {
                case Tile.SPECIAL_NORMAL: break;
                case Tile.SPECIAL_VERTICAL: more = 4; break;
                case Tile.SPECIAL_HORIZONTAL: more = 4; break;
                case Tile.SPECIAL_CROSS: more = 6; break;
                case Tile.SPECIAL_FIVE: more = 10; break;
            }
            if(this.map[p.x][p.y].data.tileType == '05'){
                Logic.oil +=more;
                if(Logic.oil>Logic.maxoilpower){
                    Logic.oil=Logic.maxoilpower;
                }
            }else if(this.map[p.x][p.y].data.tileType == '06'){
                Logic.coin +=more;
            }else if(this.isTypeBlock(this.map[p.x][p.y].data.tileType)){
            }else if(this.map[p.x][p.y].data.tileType == '01'){
                Logic.redpower +=more;
                if(Logic.redpower>Logic.maxredpower){
                    Logic.redpower = Logic.maxredpower;
                }
            }else if(this.map[p.x][p.y].data.tileType == '02'){
                Logic.bluepower +=more;
                if(Logic.bluepower>Logic.maxbluepower){
                    Logic.bluepower = Logic.maxbluepower;
                }
            }else if(this.map[p.x][p.y].data.tileType == '03'){
                Logic.purplepower +=more;
                if(Logic.purplepower>Logic.maxpurplepower){
                    Logic.purplepower = Logic.maxpurplepower;
                }
            }else if(this.map[p.x][p.y].data.tileType == '04'){
                Logic.greenpower +=more;
                if(Logic.greenpower>Logic.maxgreenpower){
                    Logic.greenpower = Logic.maxgreenpower;
                }
            }
            this.map[p.x][p.y].node.runAction(cc.sequence(
                cc.callFunc(()=>{
                    if(p.isExtraBoom&&!this.isPosBlock(cc.v2(p.x,p.y))){
                        this.map[p.x][p.y].showBoomEffect();
                    }
                    if(this.isPosBlock(cc.v2(p.x,p.y))){
                        this.map[p.x][p.y].showBoomBlockEffect();
                    }
                }),
                cc.delayTime(p.isExtraBoom?this.speed*5:0),
                cc.moveBy(speed, 0, offset)
                , cc.moveBy(speed, 0, -offset)
                , cc.moveBy(speed, 0, offset)
                , cc.moveBy(speed, 0, -offset)
                , cc.moveBy(speed / 2, offset, 0)
                , cc.moveBy(speed / 2, -offset, 0)
                , cc.moveBy(speed / 2, offset, 0)
                , cc.moveBy(speed / 2, -offset, 0)
                , cc.fadeOut(speed)
                , cc.callFunc(() => {
                    if (p.tileSpecial > 0 && p.isCenter) {
                        this.map[p.x][p.y].data.tileSpecial = p.tileSpecial;
                        this.map[p.x][p.y].node.opacity = 255;
                        this.map[p.x][p.y].updateTile();
                        cc.log(p);
                    } else {
                        this.map[p.x][p.y].node.opacity = 0;
                        this.map[p.x][p.y].data = TileData.getEmptyTileData(p.x, p.y);
                    }
                    count++;
                    if (count == boomList.length) {
                        this.canFall = true;
                    }
                })));
        }
    }
    fallTiles() {
        this.canFall = false;
        let fallList = this.getFallList();
        if (fallList.length > 0) {
            cc.director.emit(EventConstant.PLAY_AUDIO, { detail: { name: AudioPlayer.FALL_TILE } });
        }
        let count = 0;
        for (let i = 0; i < fallList.length; i++) {
            let p = fallList[i];
            this.switchTileData(cc.v2(p.x, p.y), cc.v2(p.x, p.y - p.z));
            this.map[p.x][p.y - p.z].node.runAction(cc.sequence(cc.delayTime(this.speed*p.y/4), cc.moveTo(this.speed*p.z, GameWorld.getPosInMap(cc.v2(p.x, p.y - p.z))).easing(cc.easeBackIn()), cc.callFunc(() => {
                count++;
                if (count == fallList.length) {
                    this.canFill = true;
                }
            })));
        }
        if (fallList.length < 1) {
            this.canFill = true;
        }
    }
    fillTiles() {
        this.canFill = false;
        let emptyList = this.getEmptyList();
        let count = 0;
        for (let i = 0; i < emptyList.length; i++) {
            let p = emptyList[i];
            this.map[p.x][p.y].node.runAction(cc.sequence(cc.delayTime(this.speed*p.y/2),cc.moveTo(this.speed, GameWorld.getPosInMap(cc.v2(p.x, GameWorld.HEIGHT_SIZE*2))), cc.fadeIn(this.speed), cc.moveTo(this.speed *(1+p.y/2), GameWorld.getPosInMap(cc.v2(p.x, p.y))).easing(cc.easeBackIn()), cc.callFunc(() => {
                count++;
                if (count == emptyList.length) {
                    let boomList = this.getBoomList([],[]);
                    this.boomList = boomList;
                    this.boomTiles(boomList);
                    if (boomList.length < 1 && Logic.step < 1) {
                        Logic.profile.data.coins += Logic.coin;
                        if(Logic.level - Logic.profile.data.level>10){
                            Logic.profile.data.level = Logic.level; 
                        }
                        Logic.profile.saveData();
                        cc.director.emit(EventConstant.GAME_OVER, { detail: { over: true } });
                    } else if (boomList.length < 1 && !this.checkMapCanBoom()) {
                        this.scheduleOnce(() => {
                            this.randomSortMap(true);
                        }, 1)
                    } else if(boomList.length < 1 && !this.checkMapHasTopBlock()){
                        this.downMap();
                    }
                }
            })));
            this.map[p.x][p.y].initTile(TileData.getRandomTileData(p.x, p.y));
        }
    }

    /** 交换数据位置 */
    switchTileData(tapPos: cc.Vec2, targetPos: cc.Vec2) {
        let tile1 = this.map[tapPos.x][tapPos.y];
        let tile2 = this.map[targetPos.x][targetPos.y];
        let pos = tile1.data.posIndex;
        tile1.data.posIndex = tile2.data.posIndex.clone();
        tile2.data.posIndex = pos.clone();
        this.map[tapPos.x][tapPos.y] = tile2;
        this.map[targetPos.x][targetPos.y] = tile1;
    }
    /**获取可消除方块坐标列表 */
    getBoomList(extraList:BoomData[],manualList: cc.Vec2[]): BoomData[] {
        let boomList: BoomData[] = new Array();
        let boomList1: BoomData[] = new Array();
        let boomList2: BoomData[] = new Array();
        let boomMap: { [key: string]: BoomData } = {};
        for (let i = 0; i < this.map.length; i++) {
            let templist: cc.Vec2[] = new Array();
            let startIndex = 0;
            for (let j = 0; j < this.map[0].length; j++) {
                if (!this.isTypeEqual(cc.v2(i, j), cc.v2(i, startIndex))) {
                    boomList1 = this.getTempBoomList(boomList1, templist, true, manualList);
                    templist = new Array();
                    startIndex = j;
                }
                templist.push(cc.v2(i, j));
                if (j == this.map[0].length - 1) {
                    boomList1 = this.getTempBoomList(boomList1, templist, true, manualList);
                }
            }
        }
        for (let j = 0; j < this.map[0].length; j++) {
            let templist: cc.Vec2[] = new Array();
            let startIndex = 0;
            for (let i = 0; i < this.map.length; i++) {
                if (!this.isTypeEqual(cc.v2(i, j), cc.v2(startIndex, j))) {
                    boomList2 = this.getTempBoomList(boomList2, templist, false, manualList);
                    templist = new Array();
                    startIndex = i;
                }
                templist.push(cc.v2(i, j));
                if (i == this.map.length - 1) {
                    boomList2 = this.getTempBoomList(boomList2, templist, false, manualList);
                }
            }
        }
        let list = boomList1.concat(boomList2);
        list = list.concat(extraList);
        for (let p of list) {
            let bm = boomMap[`x=${p.x}y=${p.y}`];
            if (bm) {
                if (bm.tileSpecial != Tile.SPECIAL_FIVE && bm.tileSpecial != Tile.SPECIAL_CROSS) {
                    boomMap[`x=${p.x}y=${p.y}`].tileSpecial = Tile.SPECIAL_CROSS;
                    boomMap[`x=${p.x}y=${p.y}`].isCenter = true;
                }
            } else {
                boomMap[`x=${p.x}y=${p.y}`] = p;
            }
        }
        
        //去重
        for (let k in boomMap) {
            let pos = boomMap[k];
            if (!this.map[pos.x][pos.y].data.isBlock) {
                boomList.push(pos);
            }
        }
        boomList = this.getExBoomList(boomList);
        let exboomlist = new Array();
        //添加四周爆掉的砖块
        for (let i = 0; i < boomList.length; i++) {
            let pos0 = cc.v2(boomList[i].x, boomList[i].y);
            let pos1 = cc.v2(boomList[i].x + 1, boomList[i].y);
            let pos2 = cc.v2(boomList[i].x - 1, boomList[i].y);
            let pos3 = cc.v2(boomList[i].x, boomList[i].y + 1);
            let pos4 = cc.v2(boomList[i].x, boomList[i].y - 1);
            if (this.isPosBlock(pos1)&&!this.isPosBlock(pos0)) {
                exboomlist.push(new BoomData(pos1.x, pos1.y, false, 0,boomList[i].isExtraBoom));
            }
            if (this.isPosBlock(pos2)&&!this.isPosBlock(pos0)) {
                exboomlist.push(new BoomData(pos2.x, pos2.y, false, 0,boomList[i].isExtraBoom));
            }
            if (this.isPosBlock(pos3)&&!this.isPosBlock(pos0)) {
                exboomlist.push(new BoomData(pos3.x, pos3.y, false, 0,boomList[i].isExtraBoom));
            }
            if (this.isPosBlock(pos4)&&!this.isPosBlock(pos0)) {
                exboomlist.push(new BoomData(pos3.x, pos4.y, false, 0,boomList[i].isExtraBoom));
            }
        }
        let exboomMap: { [key: string]: BoomData } = {};
        for (let p of exboomlist) {
            exboomMap[`x=${p.x}y=${p.y}`] = p;
        }
        //去重
        for (let k in exboomMap) {
            let pos = exboomMap[k];
            boomList.push(pos);
        }
        return boomList;
    }
    getExBoomList(boomList: BoomData[]):BoomData[]{
        let boomMap: { [key: string]: BoomData } = {};
        for (let p of boomList) {
            boomMap[`x=${p.x}y=${p.y}`] = p;
        }
        let hasSpecial = false;
        for(let k in boomMap){
            let p = boomMap[k];
            if(this.map[p.x][p.y].data.tileSpecial == Tile.SPECIAL_VERTICAL){
                for(let i = 0;i < this.map.length;i++){
                    if(!boomMap[`x=${i}y=${p.y}`]&&!this.isPosBlock(cc.v2(i,p.y))){
                        hasSpecial = true;
                        boomMap[`x=${i}y=${p.y}`]= new BoomData(i, p.y, false, this.map[i][p.y].data.tileSpecial,true);
                    }else if(boomMap[`x=${i}y=${p.y}`]){
                        boomMap[`x=${i}y=${p.y}`].isExtraBoom = true;
                    }
                }
            }
            if(this.map[p.x][p.y].data.tileSpecial == Tile.SPECIAL_HORIZONTAL){
                for(let j = 0;j < this.map[0].length;j++){
                    if(!boomMap[`x=${p.x}y=${j}`]&&!this.isPosBlock(cc.v2(p.x, j))){
                        hasSpecial = true;
                        boomMap[`x=${p.x}y=${j}`] = new BoomData(p.x, j, false, this.map[p.x][j].data.tileSpecial,true);
                    }else if(boomMap[`x=${p.x}y=${j}`]){
                        boomMap[`x=${p.x}y=${j}`].isExtraBoom = true;
                    }
                }
            }
            if(this.map[p.x][p.y].data.tileSpecial == Tile.SPECIAL_CROSS){
                let indexs = [cc.v2(p.x-2,p.y),cc.v2(p.x-1,p.y),cc.v2(p.x+1,p.y),cc.v2(p.x+2,p.y)
                    ,cc.v2(p.x,p.y-2),cc.v2(p.x,p.y-1),cc.v2(p.x,p.y+1),cc.v2(p.x,p.y+2)
                    ,cc.v2(p.x+1,p.y+1),cc.v2(p.x+1,p.y-1),cc.v2(p.x-1,p.y+1),cc.v2(p.x-1,p.y+1)]
                for(let i = 0;i < indexs.length;i++){
                    if(!boomMap[`x=${indexs[i].x}y=${indexs[i].y}`]&&GameWorld.isPosIndexValid(indexs[i])&&!this.isPosBlock(indexs[i])){
                        hasSpecial = true;
                        boomMap[`x=${indexs[i].x}y=${indexs[i].y}`] = new BoomData(indexs[i].x, indexs[i].y, false, this.map[indexs[i].x][indexs[i].y].data.tileSpecial,true);
                    }else if(boomMap[`x=${indexs[i].x}y=${indexs[i].y}`]){
                        boomMap[`x=${indexs[i].x}y=${indexs[i].y}`].isExtraBoom = true;
                    }
                }
            }
            if(this.map[p.x][p.y].data.tileSpecial == Tile.SPECIAL_FIVE){
                for(let i = 0;i < this.map.length;i++){
                    for(let j = 0;j < this.map[0].length;j++){
                        if(!boomMap[`x=${i}y=${j}`]&&!this.isPosBlock(cc.v2(i, j))&&this.isTypeEqual(cc.v2(p.x,p.y),cc.v2(i,j))){
                            hasSpecial = true;
                            boomMap[`x=${i}y=${j}`]=new BoomData(i, j, false, this.map[i][j].data.tileSpecial,true);
                        }else if(boomMap[`x=${i}y=${j}`]){
                            boomMap[`x=${i}y=${j}`].isExtraBoom = true;
                        }
                    }
                }
                
            }
        }
        //去重
        boomList = [];
        for (let k in boomMap) {
            let pos = boomMap[k];
            if (!this.map[pos.x][pos.y].data.isBlock) {
                boomList.push(pos);
            }
        }
        cc.log(boomList);
        if(hasSpecial){
            boomList = this.getExBoomList(boomList);
        }
        return boomList;
    }
    /**获取相同可爆炸方块 */
    getTempBoomList(boomList: BoomData[], templist: cc.Vec2[], isVertical: boolean, manualList?: cc.Vec2[]): BoomData[] {
        let type = Tile.SPECIAL_NORMAL;
        let hasCenter = false;
        //四消
        if (templist.length > 3) {
            type = isVertical ? Tile.SPECIAL_VERTICAL : Tile.SPECIAL_HORIZONTAL;
        }
        //五消
        if (templist.length > 4) {
            type = Tile.SPECIAL_FIVE;
        }
        //三个或者以上的列表才添加到数组
        if (templist.length > 2) {
            for (let i = 0; i < templist.length; i++) {
                let isCenter = false;
                let p = cc.v2(templist[i].x, templist[i].y);
                //设置手动交换的中心点
                if (manualList) {
                    for (let temp of manualList) {
                        if (temp.equals(p)) {
                            isCenter = true;
                            break;
                        }
                    }
                }
                //如果不是手动交换设置中间为中心点
                if (!isCenter) {
                    isCenter = i == Math.floor(templist.length / 2);
                }
                boomList.push(new BoomData(templist[i].x, templist[i].y, isCenter && !hasCenter && templist.length > 3, type,false));
                if (isCenter) {
                    hasCenter = true;
                }
            }
        }
        return boomList;
    }
    setBoomMapData(boomMap: { [key: string]: cc.Vec3 }, p: cc.Vec3): { [key: string]: cc.Vec3 } {
        if (boomMap[`x=${p.x}y=${p.y}`]) {
            if (boomMap[`x=${p.x}y=${p.y}`].z <= p.z) {
                boomMap[`x=${p.x}y=${p.x}`] = p.clone();
            }
        } else {
            boomMap[`x=${p.x}y=${p.y}`] = p.clone();
        }
        return boomMap;
    }
    /**获取可下落方块坐标列表 其中z代表下落格数 */
    getFallList(): cc.Vec3[] {
        let fallList: cc.Vec3[] = new Array();
        for (let i = 0; i < this.map.length; i++) {
            let count = 0;
            let countSingle = 0;
            let isSave = false;
            for (let j = 0; j < this.map[0].length; j++) {
                //由下往上查找是否有空方块，如果有计数+1，继续遍历到空方块继续+1，不是空方块且计数不为0，保存该点，继续寻找下一个
                if (this.map[i][j].data.isEmpty) {
                    if (isSave) {
                        isSave = false;
                        countSingle = 0;
                    }
                    countSingle++;
                } else {
                    if (countSingle > 0) {
                        if(!isSave){
                            count+=countSingle;
                        }
                        isSave = true;
                        fallList.push(cc.v3(i, j, count));
                    }
                }
            }
        }
        return fallList;
    }
    /**获取空的下标列表 */
    getEmptyList(): cc.Vec2[] {
        let emptyList = new Array();
        for (let i = 0; i < this.map.length; i++) {
            for (let j = 0; j < this.map[0].length; j++) {
                if (this.map[i][j].data.isEmpty) {
                    emptyList.push(cc.v2(i, j));
                }
            }
        }
        return emptyList;
    }
    /**查找指定方向的相同方块 */
    findBoomTile(boomList: cc.Vec3[], x: number, y: number, dir: number): cc.Vec3[] {
        let i = x;
        let j = y;
        switch (dir) {
            case 0: j = y + 1; break;
            case 1: j = y - 1; break;
            case 2: i = x - 1; break;
            case 3: i = x + 1; break;
        }
        if (this.isTypeEqual(cc.v2(x, y), cc.v2(i, j))) {
            boomList.push(cc.v3(i, j, 0));
            return this.findBoomTile(boomList, i, j, dir);
        } else {
            return boomList;
        }
    }
    /**方块是否相同，空白方块忽略 障碍方块忽略 */
    isTypeEqual(pos1: cc.Vec2, pos2: cc.Vec2): boolean {
        if (!GameWorld.isPosIndexValid(pos1)) { return false; }
        if (!GameWorld.isPosIndexValid(pos2)) { return false; }

        if (this.isBlockOrEmptyType(this.map[pos1.x][pos1.y].data.tileType) || this.isBlockOrEmptyType(this.map[pos2.x][pos2.y].data.tileType)) {
            return false;
        }
        return this.map[pos1.x][pos1.y].data.tileType == this.map[pos2.x][pos2.y].data.tileType;
    }
    isDataTypeEqual(pos1: cc.Vec2, pos2: cc.Vec2, mapdata: TileData[][]): boolean {
        if (!GameWorld.isPosIndexValid(pos1)) { return false; }
        if (!GameWorld.isPosIndexValid(pos2)) { return false; }
        if (this.isBlockOrEmptyType(mapdata[pos1.x][pos1.y].tileType) || this.isBlockOrEmptyType(mapdata[pos2.x][pos2.y].tileType)) {
            return false;
        }
        return mapdata[pos1.x][pos1.y].tileType == mapdata[pos2.x][pos2.y].tileType;
    }
    private isBlockOrEmptyType(tileType: string): boolean {
        if (tileType == '00' || tileType == 'b0') {
            return true;
        }
        return false;
    }
    private isPosBlock(pos: cc.Vec2): boolean {
        if (GameWorld.isPosIndexValid(pos)) {
            if (this.isTypeBlock(this.map[pos.x][pos.y].data.tileType)) {
                return true;
            }
        }

        return false;
    }
    private isTypeBlock(tileType: string): boolean {
        if (tileType == 'b0') {
            return true;
        }
        return false;
    }

    isTimeDelay(dt: number): boolean {
        this.timeDelay += dt;
        if (this.timeDelay > 0.016) {
            this.timeDelay = 0;
            return true;
        }
        return false;
    }
    isCheckTimeDelay(dt: number): boolean {
        this.checkTimeDelay += dt;
        if (this.checkTimeDelay > 1) {
            this.checkTimeDelay = 0;
            return true;
        }
        return false;
    }

    update(dt) {
        if (this.isTimeDelay(dt)) {
            if (this.canFall) {
                this.fallTiles();
            }
            if (this.canFill) {
                this.fillTiles();
            }
            Logic.isProcessing = this.boomList.length > 0 || this.isRandoming || this.isTopDown;
        }
    }
    /**查看坐标是否有效 */
    static isPosIndexValid(pos: cc.Vec2): boolean {
        return pos.x < GameWorld.WIDTH_SIZE && pos.x > -1 && pos.y < GameWorld.HEIGHT_SIZE && pos.y > -1;
    }
    //获取地图里下标的坐标
    static getPosInMap(pos: cc.Vec2) {
        let x = GameWorld.MAPX + pos.x * GameWorld.TILE_SIZE + GameWorld.TILE_SIZE / 2;
        let y = GameWorld.MAPY + pos.y * GameWorld.TILE_SIZE - GameWorld.TILE_SIZE;
        return cc.v2(x, y);
    }
    //获取坐标在地图里的下标,canOuter:是否可以超出
    static getIndexInMap(pos: cc.Vec2, canOuter?: boolean) {
        let x = (pos.x - GameWorld.MAPX) / GameWorld.TILE_SIZE;
        let y = (pos.y - GameWorld.MAPY) / GameWorld.TILE_SIZE;
        x = Math.round(x);
        y = Math.round(y);
        if (!canOuter) {
            if (x < 0) { x = 0 }; if (x >= GameWorld.WIDTH_SIZE) { x = GameWorld.WIDTH_SIZE - 1 };
            if (y < 0) { y = 0 }; if (y >= GameWorld.HEIGHT_SIZE) { y = GameWorld.HEIGHT_SIZE - 1 };
        }
        return cc.v2(x, y);
    }
    //获取不超出地图的坐标
    static fixOuterMap(pos: cc.Vec2): cc.Vec2 {
        let x = (pos.x - GameWorld.MAPX) / GameWorld.TILE_SIZE;
        let y = (pos.y - GameWorld.MAPY) / GameWorld.TILE_SIZE;
        x = Math.round(x);
        y = Math.round(y);
        let isOuter = false;
        if (x < 0) { x = 0; isOuter = true; }
        if (x >= GameWorld.WIDTH_SIZE) { x = GameWorld.WIDTH_SIZE - 1; isOuter = true; }
        if (y < 0) { y = 0; isOuter = true; }
        if (y >= GameWorld.HEIGHT_SIZE) { y = GameWorld.HEIGHT_SIZE - 1; isOuter = true; }
        if (isOuter) {
            return GameWorld.getPosInMap(cc.v2(x, y));
        } else {
            return pos;
        }
    }
}
