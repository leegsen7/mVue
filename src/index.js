import Observer from './Observer'
import Compile from './Compile'
import Watcher from './Watcher'
import Dep from './Dep'

function Vue(options){
	this.$options = options;
	this.$data = this.$options.data();

    new Observer(this.$data);
    this.$proxy()
    this.initComputed()
	new Compile(this.$options.el || document.body,this);
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
    let watcher = new Watcher(owner, fn, null)
    return function computedGetter() {
        if (Dep.target) {
            watcher.depend()
        }
        return watcher.value
    }
}

window.Vue = Vue

export default Vue
