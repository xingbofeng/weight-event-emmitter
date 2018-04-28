# PriorityEventEmmitter
`PriorityEventEmmitter`是客户端与服务端均可复用的事件监听器。支持带权事件注册与触发。

## 使用

```bash
npm install priorityeventemmitter
```

安装了`priorityeventemmitter`后，你可以在任何一处业务代码里使用`priorityeventemmitter`。

## 测试

```bash
npm run test
```

## 示例

```javascript
const EventHub = require('priorityeventemmitter');

const eventHub = new EventHub();

const eventListener = () => console.log('event')

eventHub.$on('event', eventListener);
eventHub.$on('event.-1', () => console.log('event.-1'));
eventHub.$on('event.2', () => console.log('event.2'));
eventHub.$on('event.1', () => console.log('event.1'));

eventHub.$emit('event');
// print event.2
// print event.1
// print event.-1
// print event
eventHub.$off('event', eventListener);

eventHub.$emit('event');
// no longer print event

eventHub.$once('event.1', () => console.log('once'));
eventHub.$emit('event');
// print event.2
// print event.1
// print once
// print event.-1
```

## API
首先需要在需要使用`PriorityEventEmmitter`的任意一处，创建`PriorityEventEmmitter`实例：

```javascript
const EventHub = require('priorityeventemmitter');

const eventHub = new EventHub();
```

### $on
`$on`方法注册一个事件监听器。
#### 参数
* `eventName`：事件名称，支持权重添加。如未添加权重，则认为权重为最低。
事件名称举例：
  * `'event'`：注册一个名为`event`的事件，权重级别为最低，即`-Infinity`，它等同于创建一个名为`event.-Infinity`的事件监听器。
  * `'event.1'`：注册一个名为`event`的事件，权重级别为`1`。
  * `'event.1.1'`：注册一个名为`event`的事件，权重级别为`1.1`。
  * `'event.1.1.1'`：不合法，不能创建权重为`1.1.1`的事件监听器。
  * `'event.e'`：合法，注册一个名为`event.e`的事件，权重级别为`-Infinity`，但不推荐，不能为此类事件增加权重。
* `listener`：事件监听回调函数。

#### 返回值
* 返回`PriorityEventEmmitter`实例，以便于链式调用。

### $emit
`$emit`方法触发一个事件。

#### 参数
* `eventName`：触发的事件名称，如`event`，不需要带权重。
* 第`1~n`个参数：传递给事件监听器回调函数的参数。

#### 返回值
* 返回`PriorityEventEmmitter`实例，以便于链式调用。

### $off
`$off`方法取消一个事件监听器。
#### 参数
* `eventName`：触发的事件名称，如`event`，不需要带权重。
* `listener`：事件监听回调函数。

#### 返回值
* 返回`PriorityEventEmmitter`实例，以便于链式调用。

### $once
`$once`方法参数类似于`$on`方法，在事件触发一次后取消。

