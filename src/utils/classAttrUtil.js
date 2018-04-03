
/**
 * [classAttrUtil 判断绑定的class属性的结构]
 * @Author leegsen
 * @time   2018-04-03T10:58:39+0800
 * @param  {[type]}                 exp [description]
 * @return {[type]}                     [description]
 */
// 类json结构
// :class="{active: active}"
const isSameJsonReg = /^\{/
// 类数组结构
// :class="[errorClass,classType > 0 ? 'status1' : 'status0']"
const isSameArrReg = /^\[/
export default function classAttrUtil(exp) {
    let isSameJson = isSameJsonReg.test(exp)
    let isSameArr = isSameArrReg.test(exp)
    // 除去外面的{},[],分割成数组
    let res = exp.substring(1,exp.length - 1).split(',').map(val => {
        if (isSameJson) {
            let [name,nameExp] = val.split(':')
            return {name,nameExp}
        }
        if (isSameArrReg) {
            return val
        }
    })
    return {isSameJson,isSameArr,res}
}