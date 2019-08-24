export default class TileData{
    
    tileType = '00';
    resName = 'tile000';
    isGround = false;
    posIndex:cc.Vec2 = cc.v2(0,0);
    constructor(tileType,pos,resName){
        this.tileType = tileType;
        this.posIndex = pos;
        this.resName = resName;
    }
}