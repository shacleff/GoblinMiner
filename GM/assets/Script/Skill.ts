import SkillData from "./data/SkillData";

export default class Skill{
    static readonly SKILL_COLLECT_OIL = "SKILL_COLLECT_OIL";
    static readonly SKILL_COLLECT_OIL_ARR = [-6,-6,-6,-6,0,0];
    static readonly SKILL_TNT = "SKILL_TNT";
    static readonly SKILL_TNT_ARR = [-12,-6,0,0,0,0];
    list: { [key: string]: SkillData[] } = {};
}