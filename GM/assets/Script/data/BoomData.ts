/**爆炸数据 */
export default class BoomData{
    x:number=0;
    y:number=0;
    isCenter:boolean = false;//中心点
    tileSpecial:number=0;//0普通 1橫四连 2竖四连 3十字连 4五连
    isExtraBoom:boolean = false;//是否是连带的爆炸，连带爆炸动画执行慢一拍
    constructor(x:number,y:number,isCenter:boolean,tileSpecial:number,isExtraBoom:boolean){
        this.x = x;
        this.y = y;
        this.isCenter = isCenter;
        this.tileSpecial = tileSpecial;
        this.isExtraBoom = isExtraBoom;
    }
}