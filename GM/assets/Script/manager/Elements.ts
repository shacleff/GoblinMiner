export default class Elements {
    redmax: number = 20;
    bluemax: number = 20;
    purplemax: number = 20;
    greenmax: number = 20;
    oilmax: number = 50;

    red: number = 0;
    blue: number = 0;
    purple: number = 0;
    green: number = 0;
    oil: number = 0;
    coin: number = 0;

    valueCopy(data: Elements) {
        this.redmax = data.redmax ? data.redmax : 0;
        this.bluemax = data.bluemax ? data.bluemax : 0;
        this.purplemax = data.purplemax ? data.purplemax : 0;
        this.greenmax = data.greenmax ? data.greenmax : 0;
        this.oilmax = data.oilmax ? data.oilmax : 0;

        this.red = data.red ? data.red : 0;
        this.blue = data.blue ? data.blue : 0;
        this.purple = data.purple ? data.purple : 0;
        this.green = data.green ? data.green : 0;
        this.oil = data.oil ? data.oil : 0;
        this.coin = data.coin ? data.coin : 0;
    }
    clone(): Elements {
        let data = new Elements();
        data.redmax = this.redmax;
        data.bluemax = this.bluemax;
        data.purplemax = this.purplemax;
        data.greenmax = this.greenmax;
        data.oilmax = this.oilmax;

        data.red = this.red;
        data.blue = this.blue;
        data.purple = this.purple;
        data.green = this.green;
        data.oil = this.oil;
        data.coin = this.coin;
        return data;
    }
    getElementArr():number[]{
        return [this.red,this.blue,this.purple,this.green,this.oil,this.coin];
    }
    getElementNumber(value:number,max:number,offset:number):cc.Vec2{
        if(value-offset<0){
            return cc.v2(value,0);
        }
        if(max!=-1&&value-offset>max){
            value = max;
        }
        return cc.v2(value-offset,1);
    }

    updateElements(arr:number[],needChange:boolean):boolean{
        let r = this.getElementNumber(this.red,this.redmax,arr[0]);
        let b = this.getElementNumber(this.blue,this.bluemax,arr[1]);
        let p = this.getElementNumber(this.purple,this.purplemax,arr[2]);
        let g = this.getElementNumber(this.green,this.greenmax,arr[3]);
        let o = this.getElementNumber(this.oil,this.oilmax,arr[4]);
        let c = this.getElementNumber(this.coin,-1,arr[5]);
        if(r.y<1||b.y<1||p.y<1||g.y<1||o.y<1||c.y<1){
            return false;
        }
        if(needChange){
            this.red = r.x;
            this.blue = b.x;
            this.green = g.x;
            this.purple = p.x;
            this.oil = o.x;
            this.coin = c.x;
        }
        return true;
    }

}