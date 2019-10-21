import Random from "../utils/Random";

export default class TileData{
    static readonly EMPTY = 'tile000';
    static readonly RED = 'tile001';
    static readonly BLUE = 'tile002';
    static readonly PURPLE = 'tile003';
    static readonly GREEN = 'tile004';
    static readonly OIL = 'tile005';
    static readonly COIN = 'tile006';
    static readonly OBSTACLE = 'obstacle000';
    static readonly BOSS = 'boss000';
    tileType = TileData.EMPTY;
    resName = 'tile000';
    posIndex:cc.Vec2 = cc.v2(0,0);
    tileSpecial = 0;//0普通 1橫四连 2竖四连 3十字连 4五连
    isEmpty = false;//是否为空
    isObstacle = false;//是否是障碍
    obstacleLevel = 0;//障碍等级，决定障碍需要几次才能消除，只有为0的时候才能消除,该单位大于9999的话代表不可消除
    isBoss = false;//是否是头目障碍,头目出现的情况下无法正常清除，被爆炸的情况下会对头目造成伤害
    constructor(tileType:string,pos:cc.Vec2,resName:string,isEmpty:boolean,isObstacle:boolean,obstacleLevel:number,isBoss:boolean){
        this.tileType = tileType;
        this.posIndex = pos;
        this.resName = resName;
        this.isEmpty = isEmpty;
        this.isObstacle = isObstacle;
        this.obstacleLevel = obstacleLevel;
        this.isBoss = isBoss;
    }
    valueCopy(data:TileData){
        this.posIndex = cc.v2(data.posIndex.x,data.posIndex.y);
        this.statusCopy(data);
    }
    /**只复制状态，不复制位置 */
    statusCopy(data:TileData){
        this.tileType = data.tileType;
        this.resName = data.resName;
        this.isEmpty = data.isEmpty;
        this.isObstacle = data.isObstacle;
        this.obstacleLevel = data.obstacleLevel?data.obstacleLevel:0;
        this.isBoss = data.isBoss;
    }
    clone():TileData{
        return new TileData(this.tileType,this.posIndex.clone(),this.resName,this.isEmpty,this.isObstacle,this.obstacleLevel,this.isBoss); 
    }
    static getEmptyTileData(x:number,y:number):TileData{
        return new TileData(TileData.EMPTY,cc.v2(x,y),TileData.EMPTY,true,false,0,false);
    }
    
    static getRandomTileData(x:number,y:number):TileData{
        let ran = Random.getRandomNum(1, 6);
        let tt = 'tile00' + ran;
        return new TileData(tt, cc.v2(x, y), tt,false,false,0,false);
    }
    static getObstacleTileData(x:number,y:number,level:number):TileData{
        let tt = 'obstacle001';
        return new TileData(tt, cc.v2(x, y), tt,false,true,level,false);
    }
    static getBossTileData(x:number,y:number,level:number):TileData{
        let tt = 'boss000';
        return new TileData(tt, cc.v2(x, y), tt,false,true,0,true);
    }
}