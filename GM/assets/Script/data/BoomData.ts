/**爆炸数据 */
export default class BoomData{
    x:number=0;
    y:number=0;
    isCenter:boolean = false;//中心点
    tileSpecial:number=0;//0普通 1橫四连 2竖四连 3十字连 4五连
    constructor(x:number,y:number,isCenter:boolean,tileSpecial:number){
        this.x = x;
        this.y = y;
        this.isCenter = isCenter;
        this.tileSpecial = tileSpecial;
    }
}