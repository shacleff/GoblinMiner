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
    actorLayer:cc.Node;
    // player: Player = null;
    playerIndex:cc.Vec2 = cc.v2(Math.floor(GameWorld.WIDTH_SIZE/2),GameWorld.HEIGHT_SIZE-1);
    map:Tile[][] = [];
    static readonly BOTTOM_LINE_INDEX = 5;
    static readonly TILE_SIZE: number = 80;
    static WIDTH_SIZE: number = 9;
    static HEIGHT_SIZE: number = 11;
    static MAPX: number = -GameWorld.WIDTH_SIZE*GameWorld.TILE_SIZE/2;
    static MAPY: number = 64;
    onLoad() {
        cc.log(GameWorld.MAPX);
        cc.director.on(EventConstant.TILE_SWITCH,(event)=>{
            this.tileSwitched(event.detail.tapPos,event.detail.targetPos);
        })
        this.actorLayer = this.node.getChildByName('actorlayer');
        this.actorLayer.zIndex = 2000;
        // this.player = cc.instantiate(this.playerPrefab).getComponent(Player);
        // this.player.node.parent = this.node;
        // this.player.node.zIndex = 3000;
        // this.player.node.position = GameWorld.getPosInMap(cc.v2(Math.floor(GameWorld.WIDTH_SIZE/2),GameWorld.HEIGHT_SIZE));
        this.initMap();
    }

    initMap(){
        this.map = new Array();
        for(let i = 0;i < GameWorld.WIDTH_SIZE;i++){
            this.map[i] = new Array();
            for(let j = 0;j< GameWorld.HEIGHT_SIZE;j++){
                let tile = cc.instantiate(this.tilePrefab).getComponent(Tile);
                let ran = Random.getRandomNum(1,6);
                tile.initTile(new TileData('0'+ran,cc.v2(i,j),'tile00'+ran,j==GameWorld.HEIGHT_SIZE-2));
                
                if(this.playerIndex.x == i&& this.playerIndex.y-1 == j){
                    tile.initTile(new TileData('0'+ran,cc.v2(i,j),'tile00'+ran,true));
                }
                if(j==GameWorld.HEIGHT_SIZE-1){
                    tile.initTile(new TileData('00',cc.v2(i,j),'tile000',true));
                }
                if(this.playerIndex.x == i&& this.playerIndex.y == j){
                    tile.initTile(new TileData('a0',cc.v2(i,j),'player',false));
                }
                this.actorLayer.addChild(tile.node);
                this.map[i][j] = tile;
            }
        }
    }
    tileSwitched(tapPos:cc.Vec2,switchPos:cc.Vec2){
        if(switchPos.x>this.map.length-1||switchPos.x<0||switchPos.y>this.map[0].length-1||switchPos.y<0){
            return;
        }
        let tile1 = this.map[tapPos.x][tapPos.y];
        let tile2 = this.map[switchPos.x][switchPos.y];
        if(this.isValidSwitch(tapPos,switchPos)){
            tile1.node.runAction(cc.moveTo(0.1,GameWorld.getPosInMap(tile2.data.posIndex)));
            tile2.node.runAction(cc.moveTo(0.1,GameWorld.getPosInMap(tile1.data.posIndex)));
            let pos = tile1.data.posIndex;
            tile1.data.posIndex = tile2.data.posIndex.clone();
            tile2.data.posIndex = pos.clone();
            this.map[tapPos.x][tapPos.y] = tile2;
            this.map[switchPos.x][switchPos.y] = tile1;
        }else{
            tile1.node.runAction(cc.sequence(cc.moveTo(0.1,GameWorld.getPosInMap(tile2.data.posIndex))
            ,cc.moveTo(0.1,GameWorld.getPosInMap(tile1.data.posIndex))));
            tile2.node.runAction(cc.sequence(cc.moveTo(0.1,GameWorld.getPosInMap(tile1.data.posIndex))
            ,cc.moveTo(0.1,GameWorld.getPosInMap(tile2.data.posIndex))));
        }
    }
    isValidSwitch(tapPos:cc.Vec2,switchPos:cc.Vec2):boolean{
        let tile1 = this.map[tapPos.x][tapPos.y];
        let tile2 = this.map[switchPos.x][switchPos.y];
        let dir = 0;
        if(switchPos.x - tapPos.x == 1){
            dir = 3;
        }
        if(switchPos.x - tapPos.x == -1){
            dir = 2;
        }
        if(switchPos.y - tapPos.y == -1){
            dir = 1;
        }
        if(switchPos.y - tapPos.y == 1){
            dir = 0;
        }
        
        if(this.isTypeEqual(cc.v2(switchPos.x+1,switchPos.y),tapPos)&&this.isTypeEqual(cc.v2(switchPos.x-1,switchPos.y),tapPos)){
            return true;
        }
        if(this.isTypeEqual(cc.v2(switchPos.x,switchPos.y+1),tapPos)&&this.isTypeEqual(cc.v2(switchPos.x,switchPos.y-1),tapPos)){
            return true;
        }
        return false;
    }
    isTypeEqual(pos1:cc.Vec2,pos2:cc.Vec2):boolean{
        if(pos1.x>this.map.length-1||pos1.x<0||pos1.y>this.map[0].length-1||pos1.y<0){
            return false;
        }
        if(pos2.x>this.map.length-1||pos2.x<0||pos2.y>this.map[0].length-1||pos2.y<0){
            return false;
        }
        return this.map[pos1.x][pos1.y].data.tileType == this.map[pos2.x][pos2.y].data.tileType;
    }
    updateMap() {
        for(let i = GameWorld.WIDTH_SIZE-1;i >=0;i--){
            for(let j = GameWorld.HEIGHT_SIZE-1;j>=0;j--){
                if(j>0){
                    this.map[i][j].data.statusCopy(this.map[i][j-1].data);
                }else{
                    let ran = Random.getRandomNum(1,6);
                    let d = new TileData('0'+ran,cc.v2(i,j),'tile00'+ran,j==GameWorld.HEIGHT_SIZE-2);
                    this.map[i][j].data.statusCopy(d);
                }
                this.map[i][j].updateTile();
            }
        }
        this.playerIndex.y+=1;
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
        let x = GameWorld.MAPX + pos.x * GameWorld.TILE_SIZE+GameWorld.TILE_SIZE/2;
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
