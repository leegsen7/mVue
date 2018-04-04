
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

export default Dep
