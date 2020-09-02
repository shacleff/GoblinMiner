// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Bottle extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Graphics)
    graphics: cc.Graphics = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.drawWater(0.5);
    }
    drawWater(percent:number){
        let angle = 360*percent;
        let radius = 57;
        if(angle == 360){
            angle = 359;
        }
        let startAngle = -90+angle/2;
        let endAngle = -90-angle+angle/2;
        this.graphics.arc(0,0,radius,startAngle*Math.PI/180,endAngle*Math.PI/180);
        this.graphics.fillColor = cc.color(255,255,0,200);
        this.graphics.fill();
        let tempangle = angle/2;
        let tempy = -Math.cos(tempangle*Math.PI/180)*radius;
        let tempx = Math.sqrt(radius*radius-Math.abs(tempy*tempy));
        let wavelength = 20;
        let count = Math.floor(tempx*2/wavelength);
        cc.log(tempangle);
        cc.log(tempx);
        cc.log(tempy);
        cc.log(count);
        this.graphics.fillColor = cc.color(255,255,0,150);
        this.drawWave(-tempx,tempy+4,count,wavelength,8,false);
        this.drawWave(-tempx+wavelength/4*3,tempy+4,count,wavelength,8,true);
    }
    private drawWave(offsetX:number,y:number,count:number,wavelength:number,waveHeight:number,isReverse:boolean){
        this.graphics.moveTo(offsetX,y);
        for(let i=0;i<count;i++){
            let x = offsetX+wavelength*i;
            this.graphics.bezierCurveTo(x+wavelength/2,y+(isReverse?-waveHeight:waveHeight)
            ,x+wavelength/2,y+(isReverse?waveHeight:-waveHeight)
            ,x+wavelength,y);
            if(i==count-1){
                this.graphics.lineTo(x+wavelength,y-waveHeight/2);
            }
        }
        this.graphics.lineTo(offsetX,y-waveHeight/2);
        this.graphics.lineTo(offsetX,y);
        this.graphics.fill();
    }

    start () {

    }

    // update (dt) {}
}
