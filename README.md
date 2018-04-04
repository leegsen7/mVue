## mVue 学习Vue.js开发一个mvvm库
> 重要说明: 此项目基于[DMQ/mvvm](https://github.com/DMQ/mvvm)的项目改造

#### 本项目对比原项目的新增功能
1. [x] 引入webpack模块化构建
2. [x] 支持复杂的表达式,例如: `v-show="curVal === 'show' && num > 50"`
3. [x] 支持多个插值表达式,例如:
```javascript
<div>我的名字是{{person.name}},今年{{person.age}}岁</div>
<button @click="toggleClick">点击{{curVal === 'show' ? '隐藏' : '显示'}}</button>
```
4. [x] 属性绑定: class、title、href、src，例如:
```javascript
<div class="text1" :class="{active: active}"></div>
<div class="text2" :class="[errorClass,classType > 0 ? 'status1' : 'status0']"></div>
<a :href="hrefVal" :title="titleVal" target="_blank">点击跳转</a>
```
5. [x] 事件绑定传值，例如：`@click="clickEventTest(inputVal_2)"`
#### <a href="https://leegsen7.github.io/mVue/index.html" target="_blank">Demo</a>