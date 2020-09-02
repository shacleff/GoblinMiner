// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Utils from "../utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Bottle extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Graphics)
    graphics: cc.Graphics = null;
    @property(cc.Node)
    bubble:cc.Node = null;
    // LIFE-CYCLE CALLBACKS:
    private index = 0;
    private isReverse = false;
    progress = 0;
    onLoad() {
    }
    drawWater(percent: number, index: number) {
        let angle = 360 * percent;
        let radius = 57;
        if (angle == 360) {
            angle = 359;
        }
        this.graphics.clear();
        let startAngle = -90 + angle / 2;
        let endAngle = -90 - angle + angle / 2;
        this.graphics.arc(0, 0, radius, startAngle * Math.PI / 180, endAngle * Math.PI / 180);
        this.graphics.fillColor = cc.color(101, 66, 42, 200);
        this.graphics.fill();
        let tempangle = angle / 2;
        let tempy = -Math.cos(tempangle * Math.PI / 180) * radius;
        let tempx = Math.sqrt(radius * radius - Math.abs(tempy * tempy));
        let wavelength = tempx/6;
        let offset = wavelength*0.7;
        let count = Math.floor(tempx * 2 / wavelength)-1;
        this.graphics.fillColor = cc.color(101, 66, 42, 150);
        this.drawWave(-tempx + offset*index*0.1, tempy + offset*0.26, count, wavelength, offset*0.53);
        this.drawWave(-tempx + offset - offset*index*0.1, tempy + offset*0.26, count, wavelength, 8*0.53);
    }
    private drawWave(offsetX: number, y: number, count: number, wavelength: number, waveHeight: number) {
        this.graphics.moveTo(offsetX, y);
        for (let i = 0; i < count; i++) {
            let x = offsetX + wavelength * i;
            if (i == count - 1) {
                this.graphics.bezierCurveTo(x + wavelength / 2, y - waveHeight
                    , x + wavelength / 2, y + waveHeight
                    , x + wavelength, y);
                this.graphics.lineTo(x + wavelength, y - waveHeight / 2);
            } else {
                this.graphics.bezierCurveTo(x + wavelength / 2, y + waveHeight
                    , x + wavelength / 2, y - waveHeight
                    , x + wavelength, y);
            }
        }
        this.graphics.lineTo(offsetX, y - waveHeight / 2);
        this.graphics.close();
        this.graphics.fill();
    }

    start() {

    }
    checkTimeDelay = 0;
    isCheckTimeDelay(dt: number): boolean {
        this.checkTimeDelay += dt;
        if (this.checkTimeDelay > 0.15) {
            this.checkTimeDelay = 0;
            return true;
        }
        return false;
    }
    update(dt: number) {
        if (this.isCheckTimeDelay(dt)) {
            if (this.index > 10) {
                this.isReverse = true;
                this.index = 10;
            } else if (this.index < 0) {
                this.index = 0;
                this.isReverse = false;
            }
            this.drawWater(this.progress, this.index);
            if (this.isReverse) {
                this.index--;
            } else {
                this.index++;
            }
            this.bubble.opacity = this.progress>0.5?255:0;
        }

    }
}
