import Random from "../utils/Random";

export default class TileData{
    
    tileType = '00';
    resName = 'tile000';
    posIndex:cc.Vec2 = cc.v2(0,0);
    isEmpty = false;
    constructor(tileType:string,pos:cc.Vec2,resName:string,isEmpty:boolean){
        this.tileType = tileType;
        this.posIndex = pos;
        this.resName = resName;
        this.isEmpty = isEmpty;
    }
    valueCopy(data:TileData){
        this.tileType = data.tileType;
        this.resName = data.resName;
        this.posIndex = cc.v2(data.posIndex.x,data.posIndex.y);
        this.isEmpty =data.isEmpty;
    }
    /**只复制状态，不复制位置 */
    statusCopy(data:TileData){
        this.tileType = data.tileType;
        this.resName = data.resName;
        this.isEmpty = data.isEmpty;
    }
    static getEmptyTileData():TileData{
        return new TileData('00',cc.v2(0,0),'tile000',true);
    }
    static getPlayerTileData():TileData{
        return new TileData('a0',cc.v2(0,0),'player',false);
    }
    static getRandomTileData(x:number,y:number):TileData{
        let ran = Random.getRandomNum(1, 6);
        return new TileData('0' + ran, cc.v2(x, y), 'tile00' + ran,false);
    }
}