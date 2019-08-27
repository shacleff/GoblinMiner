export default class TileData{
    
    tileType = '00';
    resName = 'tile000';
    isGround = false;
    posIndex:cc.Vec2 = cc.v2(0,0);
    constructor(tileType:string,pos:cc.Vec2,resName:string,isGround:boolean){
        this.tileType = tileType;
        this.posIndex = pos;
        this.resName = resName;
        this.isGround = isGround;
    }
    valueCopy(data:TileData){
        this.tileType = data.tileType;
        this.resName = data.resName;
        this.isGround = data.isGround;
        this.posIndex = cc.v2(data.posIndex.x,data.posIndex.y);
    }
    /**只复制状态，不复制位置 */
    statusCopy(data:TileData){
        this.tileType = data.tileType;
        this.resName = data.resName;
        this.isGround = data.isGround;
    }
    static getEmptyTileData():TileData{
        return new TileData('00',cc.v2(0,0),'tile000',true);
    }
    static getPlayerTileData():TileData{
        return new TileData('a0',cc.v2(0,0),'player',false);
    }
}