import Player from "./Player";
import { EventConstant } from "./EventConstant";
import Random from "./utils/Random";
import Logic from "./Logic";
import TileData from "./data/TileData";
import Tile from "./Tile";

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
    boomList:cc.Vec2[] = [];
    onLoad() {
        cc.log(GameWorld.MAPX);
        cc.director.on(EventConstant.TILE_SWITCH, (event) => {
            this.tileSwitched(event.detail.tapPos, event.detail.targetPos,false);
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
                let tile = this.getRandomTile(i,j);
                this.actorLayer.addChild(tile.node);
                this.map[i][j] = tile;
            }
        }
    }
    getRandomTile(i:number,j:number): Tile {
        let tile = cc.instantiate(this.tilePrefab).getComponent(Tile);
        let ran = Random.getRandomNum(1, 6);
        tile.initTile(new TileData('0' + ran, cc.v2(i, j), 'tile00' + ran));
        return tile;
    }
   
    tileSwitched(tapPos: cc.Vec2, switchPos: cc.Vec2,isFall:boolean) {
        if (switchPos.x > this.map.length - 1 || switchPos.x < 0 || switchPos.y > this.map[0].length - 1 || switchPos.y < 0) {
            return;
        }
        let tile1 = this.map[tapPos.x][tapPos.y];
        let tile2 = this.map[switchPos.x][switchPos.y];
        if (this.isValidSwitch(tapPos, switchPos)) {
            tile1.node.runAction(cc.moveTo(0.1, GameWorld.getPosInMap(tile2.data.posIndex)));
            tile2.node.runAction(cc.moveTo(0.1, GameWorld.getPosInMap(tile1.data.posIndex)));
            this.switchTileData(tapPos,switchPos);
            this.boomTile(switchPos.x,switchPos.y);
        } else {
            tile1.node.runAction(cc.sequence(cc.moveTo(0.1, GameWorld.getPosInMap(tile2.data.posIndex))
            , cc.moveTo(0.1, GameWorld.getPosInMap(tile1.data.posIndex))));
            tile2.node.runAction(cc.sequence(cc.moveTo(0.1, GameWorld.getPosInMap(tile1.data.posIndex))
            , cc.moveTo(0.1, GameWorld.getPosInMap(tile2.data.posIndex))));
            this.scheduleOnce(() => { Logic.isProcessing = false }, 0.2);
        }
    }
    switchTileData(tapPos: cc.Vec2, switchPos: cc.Vec2){
        let tile1 = this.map[tapPos.x][tapPos.y];
        let tile2 = this.map[switchPos.x][switchPos.y];
        let pos = tile1.data.posIndex;
            tile1.data.posIndex = tile2.data.posIndex.clone();
            tile2.data.posIndex = pos.clone();
            this.map[tapPos.x][tapPos.y] = tile2;
            this.map[switchPos.x][switchPos.y] = tile1;
    }
    boomTile(x:number,y:number){
        let tile:Tile =  this.map[x][y];
        Logic.isProcessing = true;
        tile.node.runAction(cc.sequence(cc.fadeOut(0.2),cc.callFunc(()=>{
            this.fallTile(x,y);
        })));
    }
    fallTile(x:number,y:number){
        if(y>GameWorld.HEIGHT_SIZE-1){
            Logic.isProcessing = false;
            return;
        }
        if(y==GameWorld.HEIGHT_SIZE-1){
            let ran = Random.getRandomNum(1, 6);
            this.map[x][y].initTile(new TileData('0' + ran, cc.v2(x, y), 'tile00' + ran));
            this.map[x][y].node.runAction(cc.sequence(cc.fadeIn(0.1),cc.callFunc(()=>{Logic.isProcessing = false;})));
            return;
        }
        let tiletop = this.map[x][y+1];
        let tilebottom = this.map[x][y];
        tiletop.node.runAction(cc.sequence(cc.moveTo(0.1, GameWorld.getPosInMap(tilebottom.data.posIndex)),cc.callFunc(()=>{
            this.switchTileData(cc.v2(x,y),cc.v2(x,y+1));
            this.fallTile(x,y+1);
        })));
        tilebottom.node.runAction(cc.moveTo(0.1, GameWorld.getPosInMap(tiletop.data.posIndex)));
            
    }
    isValidSwitch(tapPos: cc.Vec2, switchPos: cc.Vec2): boolean {
        //先交换试算
        this.switchTileData(tapPos,switchPos);
        this.boomList = new Array();
        let boomList1:cc.Vec2[] = new Array();
        let boomList2:cc.Vec2[] = new Array();
        let boomList3:cc.Vec2[] = new Array();
        let boomList4:cc.Vec2[] = new Array();
        boomList1 = this.findBoomTile(boomList1,tapPos.x,tapPos.y,0);
        boomList2 = this.findBoomTile(boomList2,tapPos.x,tapPos.y,1);
        boomList3 = this.findBoomTile(boomList3,tapPos.x,tapPos.y,2);
        boomList4 = this.findBoomTile(boomList4,tapPos.x,tapPos.y,3);
        let isfindx = false;
        let isfindy = false;
        if(boomList1.length+boomList2.length>1){
            isfindx = true;
        }
        if(boomList3.length+boomList4.length>1){
            isfindy = true;
        }
        if(isfindx||isfindy){
            this.boomList.push(tapPos);
        }
        if(isfindx){
            this.boomList.concat(boomList1);
            this.boomList.concat(boomList2);
        }
        if(isfindy){
            this.boomList.concat(boomList3);
            this.boomList.concat(boomList4);
        }
        this.switchTileData(tapPos,switchPos);
        return isfindx||isfindy;
    }
    findBoomTile(boomList:cc.Vec2[],x:number,y:number,dir:number):cc.Vec2[]{
        let i = x;
        let j = y;
        switch(dir){
            case 0:j = y+1;break;
            case 1:j = y-1;break;
            case 2:i = x-1;break;
            case 3:i = x+1;break;
        }
        if(this.isTypeEqual(cc.v2(x,y),cc.v2(i,j))){
            boomList.push(cc.v2(i,j));
            return this.findBoomTile(boomList,i,j,dir);
        }else{
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
