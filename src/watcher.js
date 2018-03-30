import Dep from './Dep'
import parseExpression from './parseExpression'
/**
 * [Watcher description]
 * @Author leegsen
 * @time   2018-03-29T11:18:01+0800
 * @param  {[type]}                 vm  [实例对象]
 * @param  {[type]}                 exp [表达式]
 * @param  {Function}               cb  [回调函数]
 */
function Watcher(vm,exp,cb){
	this.vm = vm;
	this.exp = exp;
	this.cb = cb;
	this.depIds = {};
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
		}
	},
	// observer getter 执行
	// addDep: function (dep){
	// 	// 没有这个id属性，说明是新的属性
	// 	if (!this.depIds.hasOwnProperty(dep.id)){
	// 		// 将此时的实例对象添加到订阅者数组中
	// 		dep.addSub(this);
	// 		this.depIds[dep.id] = dep;
	// 	}
	// },
	// 触发observer getter
	get:function(){
		Dep.target = this;
		// 这个方法会取值会触发Object.defineProperty get方法
		// Observer line 32
		var value = this.getVMVal();
		Dep.target = null;
		return value;
	},
	getVMVal:function(){
		var data = this.vm.$data
		var exp = this.exp

		return parseExpression(exp,data);
	}
}

export default Watcher
