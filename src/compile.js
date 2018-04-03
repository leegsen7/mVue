import Watcher from './Watcher'
import parseExpression from './parseExpression'
import classAttrUtil from './utils/classAttrUtil'

// 插值{{}}正则
const interpolationReg = /\{\{([^\}\}]+)\}\}/

const eventArgsReg = /\((.*)\)/

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
				if (dir == 'model'){
					compileUtil.model(node,this.$vm,val);
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
    	new Watcher(vm,val,(newVal) => {
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
            new Watcher(vm, exp, newVal => {
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
            let {res,isSameJson,isSameArr} = classAttrUtil(exp)
            if (isSameJson) {
                res.forEach(item => {
                    this.attrHandler(node,{
                        type: (this.getVMVal(vm, item.nameExp) ? 'add' : 'remove'),
                        class: item.name,
                    }, type)
                    new Watcher(vm, item.nameExp, newValue => {
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
                    new Watcher(vm, item, (newValue,oldValue) => {
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
            new Watcher(vm, exp, newValue => {
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
		return parseExpression(val,vm)
    }
}


export default Compile