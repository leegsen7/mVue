/**
 * [insertAfter 在某个节点后面插入新节点]
 * @Author leegsen
 * @time   2018-04-03T17:43:19+0800
 * @param  {[type]}                 newElement    [description]
 * @param  {[type]}                 targetElement [description]
 * @return {[type]}                               [description]
 */
export default function insertAfter(newElement, targetElement) {
    var parent = targetElement.parentNode; //获取目标节点的父级标签
    if (parent.lastChild === targetElement) { //如果目标节点正好是最后一个节点，使用appendChild插入
        parent.appendChild(newElement);
    }
    else {
        parent.insertBefore(newElement, targetElement.nextSibling); //一般情况下要取得目标节点的下一个节点，再使用insertBefore()方法。
    }
    // console.log(parent)
}