import Player from "./Player";
import { EventConstant } from "./EventConstant";
import Random from "./utils/Random";
import Logic from "./Logic";
import TileData from "./data/TileData";
import Tile from "./Tile";
import FallRowData from "./data/FallRowData";

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
    static readonly BOTTOM_LINE_INDEX = 5;
    static readonly TILE_SIZE: number = 80;
    static WIDTH_SIZE: number = 9;
    static HEIGHT_SIZE: number = 11;
    static MAPX: number = -GameWorld.WIDTH_SIZE * GameWorld.TILE_SIZE / 2;
    static MAPY: number = 64;
    boomList: cc.Vec2[] = [];
    fallMap: { [key: string]: FallRowData } = {};
    onLoad() {
        cc.log(GameWorld.MAPX);
        cc.director.on(EventConstant.TILE_SWITCH, (event) => {
            this.tileSwitched(event.detail.tapPos, event.detail.targetPos, false);
        })
        this.actorLayer = this.node.getChildByName('actorlayer');
        this.actorLayer.zIndex = 2000;
        // this.player = cc.instantiate(this.playerPrefab).getComponent(Player);
        // this.player.node.parent = this.node;
        // this.player.node.zIndex = 3000;
        // this.player.node.position = GameWorld.getPosInMap(cc.v2(Math.floor(GameWorld.WIDTH_SIZE/2),GameWorld.HEIGHT_SIZE));
        this.initMap();
    }

    initMap() {
        this.map = new Array();
        for (let i = 0; i < GameWorld.WIDTH_SIZE; i++) {
            this.map[i] = new Array();
            for (let j = 0; j < GameWorld.HEIGHT_SIZE; j++) {
                let tile = cc.instantiate(this.tilePrefab).getComponent(Tile);
                tile.initTile(TileData.getRandomTileData(i, j));
                this.actorLayer.addChild(tile.node);
                this.map[i][j] = tile;
            }
        }
        cc.log(this.showMap());
    }
    showMap():string{
        let str = '';
        for (let i = 0; i < this.map[0].length; i++) {
            let tempstr = ''
            for (let j = 0; j < this.map.length; j++) {
                tempstr+=this.map[j][i].data.tileType+',';
            }
            str=tempstr+'\n'+str;
        }
        return str;
    }
    tileSwitched(tapPos: cc.Vec2, targetPos: cc.Vec2, isFall: boolean) {
        if (targetPos.x > this.map.length - 1 || targetPos.x < 0 || targetPos.y > this.map[0].length - 1 || targetPos.y < 0) {
            return;
        }
        let tile1 = this.map[tapPos.x][tapPos.y];
        let tile2 = this.map[targetPos.x][targetPos.y];
        if (tile1.data.isEmpty || tile2.data.isEmpty) {
            return;
        }
        this.switchTileData(tapPos, targetPos);
        if (this.isValidSwitch(tapPos, targetPos)) {
            tile1.node.runAction(cc.moveTo(0.1, GameWorld.getPosInMap(tile1.data.posIndex)));
            tile2.node.runAction(cc.moveTo(0.1, GameWorld.getPosInMap(tile2.data.posIndex)));
            cc.log(this.showMap());
            this.boomTiles(targetPos.x, targetPos.y, this.boomList);
        } else {
            this.switchTileData(tapPos, targetPos);
            tile1.node.runAction(cc.sequence(cc.moveTo(0.1, GameWorld.getPosInMap(tile2.data.posIndex))
                , cc.moveTo(0.1, GameWorld.getPosInMap(tile1.data.posIndex))));
            tile2.node.runAction(cc.sequence(cc.moveTo(0.1, GameWorld.getPosInMap(tile1.data.posIndex))
                , cc.moveTo(0.1, GameWorld.getPosInMap(tile2.data.posIndex))));
            this.scheduleOnce(() => { Logic.isProcessing = false }, 0.2);
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
    boomTiles(x: number, y: number, boomList: cc.Vec2[]) {
        // Logic.isProcessing = true;
        for (let i = 0; i < boomList.length; i++) {
            let pos = this.boomList[i];
            let tile = this.map[pos.x][pos.y];
            tile.data.isEmpty = true;
            tile.node.runAction(cc.sequence(cc.fadeOut(0.2), cc.callFunc(() => {
            })));
        }
        for (let key in this.fallMap) {
            let data = this.fallMap[key];
            for (let i = data.boomPos.y; i + data.boomRowLength < GameWorld.HEIGHT_SIZE; i++) {
                this.scheduleOnce(()=>{
                    this.fallTile(cc.v2(data.boomPos.x, i), cc.v2(data.boomPos.x, i + data.boomRowLength));
                },1)
            }
            this.scheduleOnce(()=>{
                let count = data.boomRowLength;
                while(count>0){
                    let tile = this.map[data.boomPos.x][GameWorld.HEIGHT_SIZE - 1];
                    tile.node.opacity = 255;
                    tile.initTile(TileData.getRandomTileData(data.boomPos.x, GameWorld.HEIGHT_SIZE - 1));
                    this.switchTileData(tile.data.posIndex,cc.v2(data.boomPos.x,GameWorld.HEIGHT_SIZE-count));
                    tile.node.runAction(cc.moveTo(0.1, GameWorld.getPosInMap(tile.data.posIndex)));
                    count--;
                }
            },3);

        }
        cc.log(this.showMap());

    }

    fallTile(pos1: cc.Vec2, pos2: cc.Vec2) {
        let tile1= this.map[pos1.x][pos1.y];
        let tile2 = this.map[pos2.x][pos2.y];
        this.switchTileData(pos1, pos2);
        tile1.node.runAction(cc.moveTo(0.1, GameWorld.getPosInMap(tile1.data.posIndex)));
        tile2.node.runAction(cc.moveTo(0.1, GameWorld.getPosInMap(tile2.data.posIndex)));

    }
    isValidSwitch(tapPos: cc.Vec2, targetPos: cc.Vec2): boolean {
        this.boomList = new Array();
        let boomList1: cc.Vec2[] = new Array();
        let boomList2: cc.Vec2[] = new Array();
        let boomList3: cc.Vec2[] = new Array();
        let boomList4: cc.Vec2[] = new Array();
        boomList1 = this.findBoomTile(boomList1, tapPos.x, tapPos.y, 0);
        boomList1 = this.findBoomTile(boomList1, tapPos.x, tapPos.y, 1);
        boomList2 = this.findBoomTile(boomList2, tapPos.x, tapPos.y, 2);
        boomList2 = this.findBoomTile(boomList2, tapPos.x, tapPos.y, 3);
        boomList3 = this.findBoomTile(boomList3, targetPos.x, targetPos.y, 0);
        boomList3 = this.findBoomTile(boomList3, targetPos.x, targetPos.y, 1);
        boomList4 = this.findBoomTile(boomList4, targetPos.x, targetPos.y, 2);
        boomList4 = this.findBoomTile(boomList4, targetPos.x, targetPos.y, 3);
        let isfind1 = false;
        let isfind2 = false;
        if (boomList1.length > 1 || boomList2.length > 1) {
            isfind1 = true;
            this.boomList.push(tapPos);
        }
        if (boomList3.length > 1 || boomList4.length > 1) {
            isfind2 = true;
            this.boomList.push(targetPos);
        }

        if (isfind1) {
            this.boomList = this.boomList.concat(boomList1);
            this.boomList = this.boomList.concat(boomList2);
        }
        if (isfind2) {
            this.boomList = this.boomList.concat(boomList3);
            this.boomList = this.boomList.concat(boomList4);
        }
        cc.log(this.boomList);
        this.fallMap = {};
        for (let i = 0; i < this.boomList.length; i++) {
            let pos = this.boomList[i];
            this.map[pos.x][pos.y].data.isEmpty = true;
        }
        for (let i = 0; i < this.boomList.length; i++) {
            let pos = this.boomList[i];
            let count = 0;
            for (let j = pos.y; j < GameWorld.HEIGHT_SIZE; j++) {
                if (this.map[pos.x][j].data.isEmpty) {
                    count++;
                }
            }
            let fallData = this.fallMap[`x=${pos.x}`];
            if (fallData) {
                if(fallData.boomRowLength < count){
                    this.fallMap[`x=${pos.x}`].boomRowLength = count;
                    this.fallMap[`x=${pos.x}`].boomPos = pos;
                }
            } else {
                this.fallMap[`x=${pos.x}`] = new FallRowData(pos, 1);
            }
        }
        cc.log(this.fallMap);
        return isfind1 || isfind2;
    }
    findBoomTile(boomList: cc.Vec2[], x: number, y: number, dir: number): cc.Vec2[] {
        let i = x;
        let j = y;
        switch (dir) {
            case 0: j = y + 1; break;
            case 1: j = y - 1; break;
            case 2: i = x - 1; break;
            case 3: i = x + 1; break;
        }
        if (this.isTypeEqual(cc.v2(x, y), cc.v2(i, j))) {
            boomList.push(cc.v2(i, j));
            return this.findBoomTile(boomList, i, j, dir);
        } else {
            return boomList;
        }
    }
    isTypeEqual(pos1: cc.Vec2, pos2: cc.Vec2): boolean {
        if (pos1.x > this.map.length - 1 || pos1.x < 0 || pos1.y > this.map[0].length - 1 || pos1.y < 0) {
            return false;
        }
        if (pos2.x > this.map.length - 1 || pos2.x < 0 || pos2.y > this.map[0].length - 1 || pos2.y < 0) {
            return false;
        }
        return this.map[pos1.x][pos1.y].data.tileType == this.map[pos2.x][pos2.y].data.tileType;
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

    }

    //获取地图里下标的坐标
    static getPosInMap(pos: cc.Vec2) {
        let x = GameWorld.MAPX + pos.x * GameWorld.TILE_SIZE + GameWorld.TILE_SIZE / 2;
        let y = GameWorld.MAPY + pos.y * GameWorld.TILE_SIZE;
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
