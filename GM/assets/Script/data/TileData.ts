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
}