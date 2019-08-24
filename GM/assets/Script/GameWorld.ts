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
    player: Player = null;
    map:Tile[][] = [];
    static readonly TILE_SIZE: number = 64;
    static WIDTH_SIZE: number = 11;
    static HEIGHT_SIZE: number = 15;
    static MAPX: number = -GameWorld.WIDTH_SIZE*GameWorld.TILE_SIZE/2;
    static MAPY: number = 32;
    onLoad() {
        cc.log(GameWorld.MAPX);
        this.actorLayer = this.node.getChildByName('actorlayer');
        this.actorLayer.zIndex = 2000;
        this.player = cc.instantiate(this.playerPrefab).getComponent(Player);
        this.player.node.parent = this.node;
        this.player.node.zIndex = 3000;
        this.player.node.position = GameWorld.getPosInMap(cc.v2(Math.floor(GameWorld.WIDTH_SIZE/2),GameWorld.HEIGHT_SIZE));
        this.initMap();
    }

    initMap(){
        this.map = new Array();
        for(let i = 0;i < GameWorld.WIDTH_SIZE;i++){
            this.map[i] = new Array();
            for(let j = 0;j< GameWorld.HEIGHT_SIZE;j++){
                let tile = cc.instantiate(this.tilePrefab).getComponent(Tile);
                tile.initTile(new TileData('00',cc.v2(i,j),'tile000',j==GameWorld.HEIGHT_SIZE-1));
                this.actorLayer.addChild(tile.node);
                this.map[i][j] = tile;
            }
        }
    }
    start() {
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
