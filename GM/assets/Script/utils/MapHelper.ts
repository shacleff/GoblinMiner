import TileData from "../data/TileData";
import GameWorld from "../GameWorld";

const { ccclass, property } = cc._decorator;
export default class MapHelper {
    /**检查地图是否可以消除 */
    static checkMapCanBoom(mapdata: TileData[][]): boolean {
        for (let i = 0; i < mapdata.length; i++) {
            for (let j = 0; j < mapdata[0].length; j++) {
                if (mapdata[i][j].isObstacle) {
                    continue;
                }
                let temp = mapdata[i][j];
                if (j < mapdata[0].length - 1 && !mapdata[i][j + 1].isObstacle) {
                    //竖排元素交换
                    mapdata[i][j] = mapdata[i][j + 1];
                    mapdata[i][j + 1] = temp;
                    if (MapHelper.checkPosHasThree(cc.v2(i, j), mapdata) || MapHelper.checkPosHasThree(cc.v2(i, j + 1), mapdata)) {
                        return true;
                    }
                    //竖排元素复位
                    temp = mapdata[i][j];
                    mapdata[i][j] = mapdata[i][j + 1];
                    mapdata[i][j + 1] = temp;
                }
                if (i < mapdata.length - 1 && !mapdata[i + 1][j].isObstacle) {
                    //横排元素交换
                    temp = mapdata[i][j];
                    mapdata[i][j] = mapdata[i + 1][j];
                    mapdata[i + 1][j] = temp;
                    if (MapHelper.checkPosHasThree(cc.v2(i, j), mapdata) || MapHelper.checkPosHasThree(cc.v2(i + 1, j), mapdata)) {
                        return true;
                    }
                    //横排元素复位
                    temp = mapdata[i][j];
                    mapdata[i][j] = mapdata[i + 1][j];
                    mapdata[i + 1][j] = temp;
                }
            }
        }
        cc.log("NoTileCanBoom");
        return false;
    }
    static checkPosHasThree(pos: cc.Vec2, mapdata: TileData[][]): boolean {
        let i = pos.x;
        let j = pos.y;
        if (MapHelper.isDataTypeEqual(cc.v2(i, j), cc.v2(i, j + 1), mapdata)
            && MapHelper.isDataTypeEqual(cc.v2(i, j), cc.v2(i, j + 2), mapdata)
            || MapHelper.isDataTypeEqual(cc.v2(i, j), cc.v2(i, j - 1), mapdata)
            && MapHelper.isDataTypeEqual(cc.v2(i, j), cc.v2(i, j - 2), mapdata)
            || MapHelper.isDataTypeEqual(cc.v2(i, j), cc.v2(i, j - 1), mapdata)
            && MapHelper.isDataTypeEqual(cc.v2(i, j), cc.v2(i, j + 1), mapdata)
            || MapHelper.isDataTypeEqual(cc.v2(i, j), cc.v2(i + 1, j), mapdata)
            && MapHelper.isDataTypeEqual(cc.v2(i, j), cc.v2(i + 2, j), mapdata)
            || MapHelper.isDataTypeEqual(cc.v2(i, j), cc.v2(i - 1, j), mapdata)
            && MapHelper.isDataTypeEqual(cc.v2(i, j), cc.v2(i - 2, j), mapdata)
            || MapHelper.isDataTypeEqual(cc.v2(i, j), cc.v2(i + 1, j), mapdata)
            && MapHelper.isDataTypeEqual(cc.v2(i, j), cc.v2(i - 1, j), mapdata)
        ) {
            return true;
        }
        return false;
    }
    static isDataTypeEqual(pos1: cc.Vec2, pos2: cc.Vec2, mapdata: TileData[][]): boolean {
        if (!GameWorld.isPosIndexValid(pos1)) { return false; }
        if (!GameWorld.isPosIndexValid(pos2)) { return false; }
        if (MapHelper.isPosIndexValid(pos1,mapdata) || MapHelper.isPosIndexValid(pos2,mapdata)) {
            return false;
        }
        return mapdata[pos1.x][pos1.y].tileType == mapdata[pos2.x][pos2.y].tileType;
    }
    static isPosIndexValid(pos:cc.Vec2,mapdata: TileData[][]): boolean {
        if (mapdata[pos.x][pos.y].isObstacle||mapdata[pos.x][pos.y].isEmpty||mapdata[pos.x][pos.y].isBoss) {
            return true;
        }
        return false;
    }
    /** 交换数据位置 */
    static switchTileData(mapdata: TileData[][],tapPos: cc.Vec2, targetPos: cc.Vec2) {
        let tile1 = mapdata[tapPos.x][tapPos.y];
        let tile2 = mapdata[targetPos.x][targetPos.y];
        let pos = tile1.posIndex;
        tile1.posIndex = tile2.posIndex.clone();
        tile2.posIndex = pos.clone();
        mapdata[tapPos.x][tapPos.y] = tile2;
        mapdata[targetPos.x][targetPos.y] = tile1;
    }
}