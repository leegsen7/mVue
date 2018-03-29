
var uid = 0;

function Dep() {
    this.subs = [];
    this.id = ++uid; // 添加唯一值
}
Dep.prototype = {
    addSub: function(sub){
        this.subs.push(sub);
    },
    depend: function(){
        // 执行Watcher 里面的方法
        Dep.target.addDep(this);
    },
    notify: function(){
        console.log('发布者发布-----');
        this.subs.forEach(sub => {
            // 执行Watcher 里面的方法
            sub.update();
        });
    }
};

Dep.target = null;

export default Dep
