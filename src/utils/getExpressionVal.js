/**
 * [getExpressionVal 全局函数,获取字符表达式的值]
 * @Author leegsen
 * @time   2018-03-29T11:08:15+0800
 * @param  {[type]}                 str  [description]
 * @param  {[type]}                 data [description]
 * @return {[type]}                      [description]
 */
function getExpressionVal(str,data){
    var reg = /\<|\=\=|\>|\+|\-|\*|\//g,
        reg1 = /^-?[1-9]\d*|\'?\'|\"?\"$/;
        code = '',
        cursor = 0,
        match = '';

    // 去空格
    str = str.replace(/(^\s+)|(\s+$)/g,"").replace(/\s/g,"");
    var res = reg.exec(str)
    console.log(res)
    return '@'
    // while(match = reg.exec(str)){
    //     var str1 = str.slice(cursor,match.index);
    //     code += reg1.test(str1) ? str1 : 'this.'+str1;
    //     cursor = match.index + match[0].length;
    //     code += match[0];
    // }
    // var str2 = str.substr(cursor, str.length - cursor);
    // code += reg1.test(str2) ? str2 : 'this.'+str2;

    // return new Function("return "+code).apply(data)
}