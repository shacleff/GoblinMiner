export default class SkillData {
    name: string = '';
    desc: string = '';
    resName: string = '';
    red: number = 0;
    blue: number = 0;
    purple: number = 0;
    green: number = 0;
    oil: number = 0;
    coin: number = 0;

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
        return data;
    }

}