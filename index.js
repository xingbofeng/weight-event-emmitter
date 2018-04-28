/**
 * Create by https://github.com/xingbofeng at 2018-04-27
 * 支持自定义事件顺序的eventHub
 */

class PriorityEventEmmitter {
  constructor() {
    this.listeners = {};
  }

  /**
   * _isValidListener：判断listener事件监听器是否合法
   * @param  {Function}  listener 事件监听器
   * @return {Boolean}            事件监听器合法性
   */
  _isValidListener(listener) {
    if (!listener) {
      return false;
    }
    const type = Object.prototype.toString.call(listener);
    if (type === '[object Function]' || type === '[object RegExp]') {
      return true;
    }
    if (type === '[object Object]') {
      return this._isValidListener(listener.listener);
    }
    return false;
  }

  /**
   * _isValidEventName：判断eventName是否合法
   * @param  {String}  eventName 事件名称
   * 事件名称举例：
   * 1. 'event'：注册一个名为event的事件，权重级别为最低，即-Infinity
   * 2. 'event.1'：注册一个名为event的事件，权重级别为1
   * 3. 'event.1.1'：注册一个名为event的事件，权重级别为1.1
   * 4. 'event.1.1.1'：不合法
   * 5. 'event.e'：合法，注册一个名为event.e的事件，权重级别为-Infinity，但不推荐，不能为此类事件增加权重
   * @return {Boolean}           [description]
   */
  _isValidEventName(eventName) {
    if (!eventName) {
      return false;
    }
    const type = Object.prototype.toString.call(eventName);
    const reg = /^([^\.]+\.(\-|\+)?(\d+\.)?\d+)$|^([^\.]+)$/;
    if (type === '[object String]' && reg.test(eventName)) {
      return true;
    }
    return false;
  }

  /**
   * _stricterParseFloat：用于严格的parseFloat，因为原生的parseFloat不支持对于-Infinity和Infinity的转换
   * @param  {String} value 传入需要转换的字符串
   * @return {Number}       返回float转换的参数
   */
  _stricterParseFloat(value) {
    if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/
      .test(value))
      return Number(value);
    return NaN;
  }

  /**
   * _findIndexOfListeners：用于$off方法，找到一个权重的事件监听器集合中的指定事件监听器下标
   * @param  {Array} priorityListeners  指定权重事件监听器集合
   * @param  {Function} listener        事件监听器
   * @return {Number}                   事件监听器下标，如果没找到则返回-1
   */
  _findIndexOfListeners(priorityListeners, listener) {
    return priorityListeners.findIndex((value) => value === listener);
  }

  /**
   * $once：注册一次性的事件监听器，事件名称规则类似于$emit
   * @param  {String} eventName   事件名称
   * @param  {Function} listener  事件监听器
   * @return {Object}             返回this以便链式调用
   */
  $once(eventName, listener) {
    listener._once = true;
    return this.$on(eventName, listener);
  }

  /**
   * $off：取消事件监听器
   * @param  {String} eventName   事件名称
   * @param  {Function} listener  事件监听器函数
   * @return {Object}             返回this以便链式调用
   */
  $off(eventName, listener) {
    if (!this.listeners[eventName]) {
      return;
    }
    // 拿到该事件的所有事件监听器，这个监听器为一个对象，key为其权重
    const originEventListeners = this.listeners[eventName];

    // 遍历所有该事件名下的所有权重的listeners
    for (let priority in originEventListeners) {
      if (originEventListeners.hasOwnProperty(priority)) {
        // listeners为任意权重的事件监听器集合
        const priorityListeners = originEventListeners[priority];
        let index = this._findIndexOfListeners(priorityListeners, listener);
        if (index === -1) {
          continue;
        } else {
          priorityListeners.splice(index, 1);
        }
      }
    }

    // 返回this以便链式调用
    return this;
  }

  /**
   * $emit：触发一个事件
   * @param  {String}    eventName 触发一个事件
   * @param  {...Array}  args      事件传递的参数
   * @return {Object}              返回this以便链式调用
   */
  $emit(eventName, ...args) {
    if (!this.listeners[eventName]) {
      return;
    }
    // 拿到该事件的所有事件监听器，这个监听器为一个对象，key为其权重
    const originEventListeners = this.listeners[eventName];
    // 遍历所有的当前listeners，并且保证必须遍历到为自己添加的具有权重listener，没有权重的listener并不遍历
    let prioritys = Object.keys(originEventListeners)
      .filter((priority) => Object.prototype.toString.call(priority) === '[object String]')
      .sort((a, b) => this._stricterParseFloat(b) - this._stricterParseFloat(a));

    // 排序后的事件监听队列
    let listeners = [];
    // 开始组装事件监听队列
    prioritys.forEach((priority) => {
      listeners.push(...originEventListeners[priority]);
    });
    // 拿到了排序后的事件监听队列
    listeners.forEach((listener) => {
      listener.apply(this, args);
      // 如果是once触发，则触发完成后off
      if (listener._once) {
        this.$off(eventName, listener);
      }
    });
    
    // 返回this以便链式调用
    return this;
  }

  /**
   * $on：监听一个事件
   * @param  {String} eventName   事件名称
   * 事件名称举例：
   * 1. 'event'：注册一个名为event的事件，权重级别为最低，即-Infinity
   * 2. 'event.1'：注册一个名为event的事件，权重级别为1
   * 3. 'event.1.1'：注册一个名为event的事件，权重级别为1.1
   * 4. 'event.1.1.1'：不合法
   * 5. 'event.e'：合法，注册一个名为event.e的事件，权重级别为-Infinity，但不推荐，不能为此类事件增加权重
   * @param  {Function} listener  事件监听器
   * @return {Object}             返回this以便链式调用
   */
  $on(eventName, listener) {
    if (!this._isValidListener(listener)) {
      throw new TypeError('listener is not valid, must be a funtion or valid object');
    }
    if (!this._isValidEventName(eventName)) {
      throw new TypeError('eventName is not valid, must be valid static string or string which includes eventName and priority, such as `event` or `event.1` or `event.1.1`');
    }
    let priority, event;
    const reg = /^([^\.]+\.(\-|\+)?(\d+\.)?\d+)$/;
    // 如果是具备有权重的eventName
    if (reg.test(eventName)) {
      event = /^[^\.]+/.exec(eventName)[0]
      priority = eventName.split(/^[^\.]+\./)[1];
    } else {
      event = eventName;
      // 如果没有权重参数传入，则把传入的eventName作为事件名称，权重为负无穷
      priority = -Infinity;
    }

    if (!this.listeners[event]) {
      this.listeners[event] = {
        [priority]: [listener],
      };
    } else {
      if (!this.listeners[event][priority]) {
        this.listeners[event][priority] = [listener];
      } else {
        this.listeners[event][priority].push(listener);
      }
    }
    // 返回this以便链式调用
    return this;
  }
}

module.exports = PriorityEventEmmitter;

