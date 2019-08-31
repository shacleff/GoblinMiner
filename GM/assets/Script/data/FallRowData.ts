export default class FallRowData {
    boomPos: cc.Vec2;
    boomRowLength: number;
    constructor(boomPos: cc.Vec2, boomRowLength: number) {
        this.boomPos = boomPos;
        this.boomRowLength = boomRowLength;
    }
}