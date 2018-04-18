/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/Compile.js":
/*!************************!*\
  !*** ./src/Compile.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Watcher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Watcher */ "./src/Watcher.js");
/* harmony import */ var _parseExpression__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parseExpression */ "./src/parseExpression.js");
/* harmony import */ var _utils_classAttrUtil__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/classAttrUtil */ "./src/utils/classAttrUtil.js");
/* harmony import */ var _utils_insertAfter__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils/insertAfter */ "./src/utils/insertAfter.js");





// 插值{{}}正则
const interpolationReg = /\{\{([^\}\}]+)\}\}/
// 事件参数正则
const eventArgsReg = /\((.*)\)/
// v-for指令正则
const vForReg = /(.*)\sin\s(.*)/

function Compile(el,vm){
	this.$vm = vm;
	this.$el = this.isElementNode(el) ? el : document.querySelector(el);
	this.init(this.$el);
}

Compile.prototype = {
	construtor:Compile,
	init:function(el){
		if (el){
			var fragment = this.node2Fragment(el);
			this.compileElement(fragment);
			this.$el.appendChild(fragment);
		}
	},
	// 文档碎片拷贝
	node2Fragment: el => {
        var fragment = document.createDocumentFragment(),
            child;

        while(child = el.firstChild){
        	fragment.appendChild(child);
        }

        return fragment;
	},
	compileElement:function(el){
		var child = el.childNodes;
		var reg = /\{\{(.*)\}\}/;
		for (let key of child){
			// 判断元素
			if (this.isElementNode(key)){
				this.compile(key);
			}
			// 判断是否是插值表达式
			else if (this.isTextNode(key) && interpolationReg.test(key.textContent)){
				this.compileText(key)
			}
			// 子节点编译
			if (key.childNodes && key.childNodes.length){
				this.compileElement(key);
			}
		}
	},
	compile:function (node){
		var nodeAttrs = node.attributes;
		[...nodeAttrs].forEach( key => {
			let name = key.nodeName,
				val = key.nodeValue;
			// v- 指令
			if (this.isDirective(name)){
				let dir = name.substring(2);
				if (dir === 'model') {
					compileUtil.model(node,this.$vm,val);
				}
				else if (dir === 'for') {
					vForReg.test(val) && compileUtil.vForBind(node,this.$vm,val);
				}
                else {
                    compileUtil.bind(node,this.$vm,val,dir);
                }
				node.removeAttribute(name);
			}
			// @ 事件指令
			if (this.isEventDirective(name)){
				let event = name.substring(1);
                let fnName = val
                let argList = []
                // 判断绑定的函数里有没有参数
                let matchRes = val.match(eventArgsReg)
                if (matchRes) {
                    fnName = val.substring(0,matchRes.index)
                    argList = matchRes[1].split(',')
                }
				compileUtil.eventHandler(node,this.$vm,event,fnName,argList);
				node.removeAttribute(name);
			}
            // 属性绑定
            if (this.isAttrDirective(name)) {
                let attr = name.substring(1)
                compileUtil.attrBind(node,this.$vm,attr,val);
                node.removeAttribute(name);
            }
		})
	},
    // 编译插值表达式
	compileText:function(node){
        let matchRes = null
        let expList = []
        let gReg = new RegExp(interpolationReg,'g')
        while (matchRes = gReg.exec(node.textContent)) {
            expList.push(matchRes[1])
        }
        compileUtil.braceBind(node, this.$vm, expList)
	},
	isElementNode: el => {
		return el.nodeType === 1;
	},
	isTextNode: el => {
		return el.nodeType === 3;
	},
    // 是否是指令
	isDirective: attr => {
		return attr.indexOf('v-') === 0;
	},
    // 是否是事件绑定
	isEventDirective: attr => {
		return attr.indexOf('@') === 0;
	},
    // 是否是属性绑定
    isAttrDirective: val => val.indexOf(':') === 0
}

// 指令处理集合
var compileUtil = {
    model: function(node, vm, val) {
        this.bind(node, vm, val, 'model');

		var cpLock = false,
			self = this;

        node.addEventListener('compositionstart', function(){
            cpLock = true;
        })
        node.addEventListener('input',Func);
        node.addEventListener('compositionend', function(e){
            cpLock = false;
            Func(e);
        })

        function Func(e){
            if (!cpLock){
                var newValue = e.target.value;
                self.setVMVal(vm, val, newValue);
            }
        }
    },
    bind:function(node,vm,val,dir){
    	var value = this.getVMVal(vm,val);
    	this.dirHandler(node,value,dir);
    	// 实例化一个watcher对象和回调函数
    	new _Watcher__WEBPACK_IMPORTED_MODULE_0__["default"](vm,val,(newVal) => {
    		this.dirHandler(node,newVal,dir);
    	})
    },
    // 事件处理
    eventHandler:function(node,vm,event,fnName,argList){
    	let fn = vm[fnName]
    	if (fn && event){
    		// 绑定@函数
    		node.addEventListener(event,() => {
                fn.apply(vm,argList.map(item => this.getVMVal(vm, item)))
            });
    	}
    },
    // 插值绑定
    braceBind: function (node, vm, expList) {
        let backupText = node.textContent
        this.braceHandler(node, vm, backupText)
        expList.forEach(exp => {
            // 实例化一个watcher对象和回调函数
            new _Watcher__WEBPACK_IMPORTED_MODULE_0__["default"](vm, exp, newVal => {
                this.braceHandler(node, vm, backupText)
            })
        })
    },
    // 插值处理
    braceHandler: function (node, vm, backupText) {
        node.textContent = backupText.replace(new RegExp(interpolationReg,'g'),(val,p1) => {
            return this.getVMVal(vm,p1)
        })
    },
    // 属性绑定
    attrBind(node, vm, type, exp) {
        if (type === 'class') {
            let {res,isSameJson,isSameArr} = Object(_utils_classAttrUtil__WEBPACK_IMPORTED_MODULE_2__["default"])(exp)
            if (isSameJson) {
                res.forEach(item => {
                    this.attrHandler(node,{
                        type: (this.getVMVal(vm, item.nameExp) ? 'add' : 'remove'),
                        class: item.name,
                    }, type)
                    new _Watcher__WEBPACK_IMPORTED_MODULE_0__["default"](vm, item.nameExp, newValue => {
                        this.attrHandler(node,{
                            type: (newValue ? 'add' : 'remove'),
                            class: item.name,
                        }, type)
                    })
                })
            }
            else if (isSameArr) {
                res.forEach(item => {
                    this.attrHandler(node,{
                        type: 'add',
                        class: this.getVMVal(vm, item),
                    }, type)
                    new _Watcher__WEBPACK_IMPORTED_MODULE_0__["default"](vm, item, (newValue,oldValue) => {
                        this.attrHandler(node,{
                            type: 'add',
                            class: newValue,
                        }, type)
                        this.attrHandler(node,{
                            type: 'remove',
                            class: oldValue,
                        }, type)
                    })
                })
            }
            else {
                throw(`${exp} 无效的class绑定`)
            }
        }
        else {
            this.attrHandler(node, this.getVMVal(vm, exp), type)
            new _Watcher__WEBPACK_IMPORTED_MODULE_0__["default"](vm, exp, newValue => {
                this.attrHandler(node, newValue, type)
            })
        }
    },
    // 属性处理
    attrHandler: function(node,val,type) {
        if (type === 'class') {
            node.classList[val.type](val.class)
        }
        else {
            node.setAttribute(type,val)
        }
    },
    // v-for指令绑定
    vForBind(node, vm, val) {
        let [,forKey,forVal] = val.match(vForReg)
        let vmVal = this.getVMVal(vm, forVal)
        this.dirForHandler(node, vmVal)
    },
    // v-for指令处理
    dirForHandler(node,val) {
        // console.log(node,val)
        for (let i in val) {
            if (val.hasOwnProperty(i)) {
                Object(_utils_insertAfter__WEBPACK_IMPORTED_MODULE_3__["default"])(node,node)
            }
        }
    },
    // 指令处理
    dirHandler:function(node,val,type){
    	switch (type){
    		case "text":
    			node.innerText = val || '';
    			break;
    		case "html":
    			node.innerHTML = val || '';
    			break;
    		case "show":
    			if (typeof val == 'undefined'){
    				node.style.display = '';
    			}
    			else {
    				node.style.display = val ? '' : "none";
    			}
    			break;
    		case "hide":
    			if (typeof val == 'undefined'){
    				node.style.display = '';
    			}
    			else {
    				node.style.display = val ? 'none' : "";
    			}
    			break;
    		case "model":
    			node.value = val || '';
    			break;
    	}
    },
    setVMVal:function(vm, val, newValue){
    	new Function("this."+val+"=\'"+newValue+"\'").apply(vm);
    },
    getVMVal:function(vm,val){
		return Object(_parseExpression__WEBPACK_IMPORTED_MODULE_1__["default"])(val,vm)
    }
}


/* harmony default export */ __webpack_exports__["default"] = (Compile);

/***/ }),

/***/ "./src/Dep.js":
/*!********************!*\
  !*** ./src/Dep.js ***!
  \********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

var uid = 0;

function Dep() {
    // 依赖数组
    this.subs = [];
     // 添加唯一值
    this.id = ++uid;
}
Dep.prototype = {
    // 导入依赖数组
    addSub: function(sub){
        this.subs.push(sub);
    },
    // 收集依赖
    depend: function(){
        // Compile初始化也会触发get方法，但此时Dep.target为null
        // 触发Watcher里面的getVMVal时，Dep.target有值，是Watcher的当前实例
        // Watcher line 42
        if (Dep.target) {
            // Watcher addDep执行
            Dep.target.addDep(this);
        }
    },
    // 触发依赖
    notify: function(){
        console.log('发布者发布-----');
        this.subs.forEach(sub => {
            // 执行Watcher 里面的update方法
            sub.update();
        });
    }
};

Dep.target = null;

/* harmony default export */ __webpack_exports__["default"] = (Dep);


/***/ }),

/***/ "./src/Observer.js":
/*!*************************!*\
  !*** ./src/Observer.js ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Dep__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Dep */ "./src/Dep.js");



function Observer(data) {
    this.data = data;
    this.beforeInt();
};

Observer.prototype = {
    constructor:Observer,
    beforeInt:function (){
        var data = this.data;
        if (!data || typeof data !== 'object') {
            return;
        }
        this.init();
    },
    init: function(){
        var data = this.data;
        // 取出所有属性遍历
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key]);
        });
    },
    defineReactive: function(data,key,val){
        var dep = new _Dep__WEBPACK_IMPORTED_MODULE_0__["default"]();
        new Observer(val); // 监听子属性

        Object.defineProperty(data, key, {
            enumerable: true, // 可枚举
            configurable: false, // 不能再define
            get: () => {
                // 收集依赖
                dep.depend();
                return val;
            },
            set: newVal => {
                if (val === newVal) return;
                console.log('监听到值变化了 ', val, ' --> ', newVal);
                val = newVal;
                new Observer(newVal);
                // 触发依赖
                dep.notify();
            }
        });
    }

}

/* harmony default export */ __webpack_exports__["default"] = (Observer);


/***/ }),

/***/ "./src/Watcher.js":
/*!************************!*\
  !*** ./src/Watcher.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Dep__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Dep */ "./src/Dep.js");
/* harmony import */ var _parseExpression__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parseExpression */ "./src/parseExpression.js");


/**
 * [Watcher description]
 * @Author leegsen
 * @time   2018-03-29T11:18:01+0800
 * @param  {[type]}                 vm  [实例对象]
 * @param  {[type]}                 exp [表达式]
 * @param  {Function}               cb  [回调函数]
 */
let uid = 0

function Watcher(vm,exp,cb){
	this.vm = vm;
	this.exp = exp;
	this.cb = cb;
	this.dep = []
	this.newDepIds = {}
	this.depIds = {};
	this.uid = ++uid
	this.value = this.get();
}

Watcher.prototype = {
	constructor:Watcher,
	// observer setter 更新
	update:function(){
		var oldVal = this.value
		var newVal = this.get()
		 // 值发生改变就赋值回调
		if (oldVal !== newVal) {
			this.value = newVal;
			typeof this.cb === 'function' && this.cb.call(this.vm,newVal,oldVal);
			this.dep.forEach(item => {
				item.update()
			})
		}
	},
    // 判断和收集依赖
    addDep: function (dep) {
    	// 判断是否是收集过的依赖
     	// 没有这个id属性，说明是新的属性
     	if (!this.depIds.hasOwnProperty(dep.id)){
            // 将此时的实例对象添加到订阅者数组中
            dep.addSub(this);
            this.depIds[dep.id] = dep;
     	}
    },
    depend() {
    	if (!this.newDepIds.hasOwnProperty(this.uid)) {
    		this.newDepIds[this.uid] = this.uid
    		this.dep.push(_Dep__WEBPACK_IMPORTED_MODULE_0__["default"].target)
    	}
    },
	// 触发observer getter
	get:function(){
		_Dep__WEBPACK_IMPORTED_MODULE_0__["default"].target = this;
		// 这个方法会取值会触发Object.defineProperty get方法
		// Observer line 32
		var value = this.getVMVal();
		_Dep__WEBPACK_IMPORTED_MODULE_0__["default"].target = null;
		return value;
	},
	getVMVal:function(){
		return (typeof this.exp === 'function' ? this.exp.call(this.vm) : Object(_parseExpression__WEBPACK_IMPORTED_MODULE_1__["default"])(this.exp, this.vm))
	}
}

/* harmony default export */ __webpack_exports__["default"] = (Watcher);


/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Observer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Observer */ "./src/Observer.js");
/* harmony import */ var _Compile__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Compile */ "./src/Compile.js");
/* harmony import */ var _Watcher__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Watcher */ "./src/Watcher.js");
/* harmony import */ var _Dep__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Dep */ "./src/Dep.js");





function Vue(options){
	this.$options = options;
	this.$data = this.$options.data();

    new _Observer__WEBPACK_IMPORTED_MODULE_0__["default"](this.$data);
    this.$proxy()
    this.initComputed()
    if (typeof options.created === 'function') {
        options.created.call(this)
    }
	new _Compile__WEBPACK_IMPORTED_MODULE_1__["default"](this.$options.el || document.body,this);
    if (typeof options.mounted === 'function') {
        options.mounted.call(this)
    }
}
// 把data,method代理到当前实例上去
Vue.prototype.$proxy = function() {
    for (let key in this.$data) {
        Object.defineProperty(this, key, {
            enumerable: true,
            configurable: true,
            get: () => {
                return this.$data[key]
            },
            set: newVal => {
                this.$data[key] = newVal
            }
        });
    }
    for (let key in this.$options.methods) {
        this[key] = this.$options.methods[key]
    }
}
// 初始化属性计算
Vue.prototype.initComputed = function() {
    let {computed} = this.$options
    if (typeof computed === 'object') {
        for (let key in computed) {
            let item = computed[key]
            if (typeof item === 'function') {
                Object.defineProperty(this, key, {
                    enumerable: true,
                    configurable: true,
                    get: makeComputedGetter(item, this),
                    set: () => {},
                })
            }
        }
    }
}

function makeComputedGetter(fn, owner) {
    let watcher = new _Watcher__WEBPACK_IMPORTED_MODULE_2__["default"](owner, fn, null)
    return function computedGetter() {
        if (_Dep__WEBPACK_IMPORTED_MODULE_3__["default"].target) {
            watcher.depend()
        }
        return watcher.value
    }
}

window.Vue = Vue

/* harmony default export */ __webpack_exports__["default"] = (Vue);


/***/ }),

/***/ "./src/parseExpression.js":
/*!********************************!*\
  !*** ./src/parseExpression.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return parseExpression; });
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

function parseExpression (exp, vm) {
    return compileGetter(exp)(vm)
}

/***/ }),

/***/ "./src/utils/classAttrUtil.js":
/*!************************************!*\
  !*** ./src/utils/classAttrUtil.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return classAttrUtil; });

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
function classAttrUtil(exp) {
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

/***/ }),

/***/ "./src/utils/insertAfter.js":
/*!**********************************!*\
  !*** ./src/utils/insertAfter.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return insertAfter; });
/**
 * [insertAfter 在某个节点后面插入新节点]
 * @Author leegsen
 * @time   2018-04-03T17:43:19+0800
 * @param  {[type]}                 newElement    [description]
 * @param  {[type]}                 targetElement [description]
 * @return {[type]}                               [description]
 */
function insertAfter(newElement, targetElement) {
    var parent = targetElement.parentNode; //获取目标节点的父级标签
    if (parent.lastChild === targetElement) { //如果目标节点正好是最后一个节点，使用appendChild插入
        parent.appendChild(newElement);
    }
    else {
        parent.insertBefore(newElement, targetElement.nextSibling); //一般情况下要取得目标节点的下一个节点，再使用insertBefore()方法。
    }
    // console.log(parent)
}

/***/ }),

/***/ 0:
/*!***********************************!*\
  !*** multi ./src/index.js ./src/ ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! D:\document\Web\javascript\vue\mVue\src\index.js */"./src/index.js");
module.exports = __webpack_require__(/*! D:\document\Web\javascript\vue\mVue\src\ */"./src/index.js");


/***/ })

/******/ });
//# sourceMappingURL=mVue.js.map