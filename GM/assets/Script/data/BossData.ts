import Random from "../utils/Random";

export default class BossData{
    id = 0;
    resName = 'boss000';
    posIndex:cc.Vec2 = cc.v2(0,0);
    width = 1;//boss为矩形有长宽，单位为tile
    height = 1;
    health:cc.Vec2 = cc.v2(10,10);
    constructor(id:number,resName:string,pos:cc.Vec2,width:number,height:number,health:cc.Vec2){
        this.id = id;
        this.posIndex = pos;
        this.resName = resName;
        this.width = width;
        this.height = height;
        this.health = health;
    }
    valueCopy(data:BossData){
        this.id = data.id;
        this.resName = data.resName;
        this.width = data.width;
        this.height = data.height;
        this.posIndex = cc.v2(data.posIndex.x,data.posIndex.y);
        this.health = cc.v2(data.health.x,data.health.y);
    }
   
    clone():BossData{
        return new BossData(this.id,this.resName,this.posIndex.clone(),this.width,this.height,this.health.clone()); 
    }
    
}