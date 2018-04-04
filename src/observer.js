import Dep from './Dep'


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
        var dep = new Dep();
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

export default Observer
