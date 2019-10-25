/**下落数据 */
export default class FallData{
    fx:number=0;//起点x
    fy:number=0;//起点y
    tx:number=0;//终点x
    ty:number=0;//终点y
    list:cc.Vec2[] = [];//中间点
    constructor(fx:number,fy:number,tx:number,ty:number){
        this.fx = fx;
        this.fy = fy;
        this.tx = tx;
        this.ty = ty;
    }
}