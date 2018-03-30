
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
    // 判断和收集依赖
    depend: function(){
        // 执行Watcher 里面的方法
        // Dep.target.addDep(this);
        // 判断是否是收集过的依赖
        if (!Dep.target.depIds.hasOwnProperty(this.id)) {
            // Dep.target为Watcher实例
            this.addSub(Dep.target)
            Dep.target.depIds[this.id] = this
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
