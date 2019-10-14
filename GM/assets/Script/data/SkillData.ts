export default class SkillData {
    name: string = '';//名称
    desc: string = '';//描述
    resName: string = '';//资源名
    red: number = 0;
    blue: number = 0;
    purple: number = 0;
    green: number = 0;
    oil: number = 0;
    coin: number = 0;
    operator:number = 0;//操作方式：0：点击触发 1：选中触发 2：滑动触发

    init(name: string,desc: string, resName: string,red: number,blue: number,purple: number,green: number,
        oil: number,coin: number,operator: number) {
            this.name = name;
            this.desc = desc;
            this.resName = resName;
            this.red = red;
            this.blue = blue;
            this.purple = purple;
            this.green = green;
            this.oil = oil;
            this.coin = coin;
            this.operator = operator;
    }
    valueCopy(data: SkillData) {
        this.name = data.name ? data.name : '';
        this.desc = data.desc ? data.desc : '';
        this.resName = data.resName ? data.resName : '';
        this.red = data.red ? data.red : 0;
        this.blue = data.blue ? data.blue : 0;
        this.purple = data.purple ? data.purple : 0;
        this.green = data.green ? data.green : 0;
        this.oil = data.oil ? data.oil : 0;
        this.coin = data.coin ? data.coin : 0;
        this.operator = data.operator?data.operator:0;
    }
    clone(): SkillData {
        let data = new SkillData();
        data.name = this.name;
        data.desc = this.desc;
        data.resName = this.resName;
        data.red = this.red;
        data.blue = this.blue;
        data.purple = this.purple;
        data.green = this.green;
        data.oil = this.oil;
        data.coin = this.coin;
        data.operator = this.operator;
        return data;
    }
    getElementArr():number[]{
        return [this.red,this.blue,this.purple,this.green,this.oil,this.coin];
    }

}