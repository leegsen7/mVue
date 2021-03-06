/**
 * 计算表达式的值,代码来自vue源码src/parsers/expression.js
 */

const allowedKeywords =
    'Math,Date,this,true,false,null,undefined,Infinity,NaN,' +
    'isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,' +
    'encodeURIComponent,parseInt,parseFloat'
const allowedKeywordsRE =
    new RegExp('^(' + allowedKeywords.replace(/,/g, '\\b|') + '\\b)')

const wsRE = /\s/g
const newlineRE = /\n/g
const saveRE = /[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\"']|\\.)*`|`(?:[^`\\]|\\.)*`)|new |typeof |void /g
const restoreRE = /"(\d+)"/g
const pathTestRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/
const identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g
const literalValueRE = /^(?:true|false|null|undefined|Infinity|NaN)$/

/**
 * Save / Rewrite / Restore
 *
 * When rewriting paths found in an expression, it is
 * possible for the same letter sequences to be found in
 * strings and Object literal property keys. Therefore we
 * remove and store these parts in a temporary array, and
 * restore them after the path rewrite.
 */

var saved = []

/**
 * Save replacer
 *
 * The save regex can match two possible cases:
 * 1. An opening object literal
 * 2. A string
 * If matched as a plain string, we need to escape its
 * newlines, since the string needs to be preserved when
 * generating the function body.
 *
 * @param {String} str
 * @param {String} isString - str if matched as a string
 * @return {String} - placeholder with index
 */

function save (str, isString) {
    var i = saved.length
    saved[i] = isString
        ? str.replace(newlineRE, '\\n')
        : str
    return '"' + i + '"'
}

/**
 * Path rewrite replacer
 *
 * @param {String} raw
 * @return {String}
 */

function rewrite (raw) {
    var c = raw.charAt(0)
    var path = raw.slice(1)
    if (allowedKeywordsRE.test(path)) {
        return raw
    } else {
        path = path.indexOf('"') > -1
            ? path.replace(restoreRE, restore)
            : path
        return c + 'scope.' + path
    }
}

/**
 * Restore replacer
 *
 * @param {String} str
 * @param {String} i - matched save index
 * @return {String}
 */

function restore (str, i) {
    return saved[i]
}

function compileGetter (exp) {
    // if (improperKeywordsRE.test(exp)) {
    //   process.env.NODE_ENV !== 'production' && warn(
    //     'Avoid using reserved keywords in expression: ' + exp
    //   )
    // }
    // reset state
    saved.length = 0
    // save strings and object literal keys
    var body = exp
        .replace(saveRE, save)
        .replace(wsRE, '')
    // rewrite all paths
    // pad 1 space here because the regex matches 1 extra char
    body = (' ' + body)
        .replace(identRE, rewrite)
        .replace(restoreRE, restore)
    return makeGetterFn(body)
}

function makeGetterFn (body) {
    return new Function('scope', 'return ' + body + ';')
}

export default function parseExpression (exp, vm) {
    return compileGetter(exp)(vm)
}