import Random from "../utils/Random";

export default class TileData{
    tileType = '00';
    resName = 'tile000';
    posIndex:cc.Vec2 = cc.v2(0,0);
    tileSpecial = 0;//0普通 1橫四连 2竖四连 3十字连 4五连
    isEmpty = false;
    isBlock = false;
    constructor(tileType:string,pos:cc.Vec2,resName:string,isEmpty:boolean,isBlock:boolean){
        this.tileType = tileType;
        this.posIndex = pos;
        this.resName = resName;
        this.isEmpty = isEmpty;
        this.isBlock = isBlock;
    }
    valueCopy(data:TileData){
        this.tileType = data.tileType;
        this.resName = data.resName;
        this.posIndex = cc.v2(data.posIndex.x,data.posIndex.y);
        this.isEmpty =data.isEmpty;
        this.isBlock = data.isBlock;
    }
    /**只复制状态，不复制位置 */
    statusCopy(data:TileData){
        this.tileType = data.tileType;
        this.resName = data.resName;
        this.isEmpty = data.isEmpty;
        this.isBlock = data.isBlock;
    }
    clone():TileData{
        return new TileData(this.tileType,this.posIndex.clone(),this.resName,this.isEmpty,this.isBlock); 
    }
    static getEmptyTileData(x:number,y:number):TileData{
        return new TileData('00',cc.v2(x,y),'tile000',true,false);
    }
    static getPlayerTileData():TileData{
        return new TileData('a0',cc.v2(0,0),'player',false,false);
    }
    static getRandomTileData(x:number,y:number):TileData{
        let ran = Random.getRandomNum(1, 6);
        return new TileData('0' + ran, cc.v2(x, y), 'tile00' + ran,false,false);
    }
    static getBlockTileData(x:number,y:number):TileData{
        return new TileData('b0', cc.v2(x, y), 'tile101',false,true);
    }
}