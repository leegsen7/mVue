import Observe from './Observer'
import Compile from './Compile'

function Vue(options){
	this.$options = options;
	this.$data = this.$options.data();
    this.$proxy()

	new Observe(this.$data);
	new Compile(this.$options.el || document.body,this);
}
// 把data,method代理到当前实例上去
Vue.prototype.$proxy = function() {
    Object.keys(this.$data).forEach(key => {
        this[key] = this.$data[key]
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
    })
    Object.keys(this.$options.methods).forEach(key => {
        this[key] = this.$options.methods[key]
    })
}

window.Vue = Vue

export default Vue
