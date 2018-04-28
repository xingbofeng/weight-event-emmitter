const PriorityEventEmmitter = require('./../index.js');
const assert = require('assert');

describe('PriorityEventEmmitter', function() {
  describe('$on', function() {
    const priorityEventEmmitter = new PriorityEventEmmitter();
    const eventListener = () => 'event';
    const eventListener2 = () => 'event.2';
    const eventListener1 = () => 'event.1';
    const eventListenerNegative1 = () => 'event.-1';
    priorityEventEmmitter.$on('event', eventListener);
    priorityEventEmmitter.$on('event.2', eventListener2);
    priorityEventEmmitter.$on('event.1', eventListener1);
    priorityEventEmmitter.$on('event.-1', eventListenerNegative1);
    it('should regist all event', function() {
      assert.equal(priorityEventEmmitter.listeners.event['-Infinity'].length, 1);
      assert.equal(priorityEventEmmitter.listeners.event['1'].length, 1);
      assert.equal(priorityEventEmmitter.listeners.event['2'].length, 1);
      assert.equal(priorityEventEmmitter.listeners.event['-1'].length, 1);
      
    });
    it('should regist all event sorted', function() {
      assert.equal(priorityEventEmmitter.listeners.event['-Infinity'][0](), 'event');
      assert.equal(priorityEventEmmitter.listeners.event['1'][0](), 'event.1');
      assert.equal(priorityEventEmmitter.listeners.event['2'][0](), 'event.2');
      assert.equal(priorityEventEmmitter.listeners.event['-1'][0](), 'event.-1');
    });
  });

  describe('$emit', function() {
    const priorityEventEmmitter = new PriorityEventEmmitter();
    let datas = [];
    const eventListener = (d) => datas.push('event');
    const eventListener2 = (d) => datas.push('event.2');
    const eventListener1 = (d) => datas.push('event.1');
    const eventListenerNegative1 = (d) => datas.push('event.-1');
    priorityEventEmmitter.$on('event', eventListener);
    priorityEventEmmitter.$on('event.2', eventListener2);
    priorityEventEmmitter.$on('event.1', eventListener1);
    priorityEventEmmitter.$on('event.-1', eventListenerNegative1);
    priorityEventEmmitter.$emit('event');
    it('should regist all event emit as true sorted', function() {
      assert.deepEqual(datas, ['event.2', 'event.1', 'event.-1', 'event']);
    });
  });

  describe('$off', function() {
    const priorityEventEmmitter = new PriorityEventEmmitter();
    let datas = [];
    const eventListener = (d) => datas.push('event');
    const eventListener2 = (d) => datas.push('event.2');
    const eventListener1 = (d) => datas.push('event.1');
    const eventListenerNegative1 = (d) => datas.push('event.-1');
    priorityEventEmmitter.$on('event', eventListener);
    priorityEventEmmitter.$on('event.2', eventListener2);
    priorityEventEmmitter.$on('event.1', eventListener1);
    priorityEventEmmitter.$on('event.-1', eventListenerNegative1);
    priorityEventEmmitter.$off('event', eventListener);
    priorityEventEmmitter.$emit('event');
    console.log('datas', datas);
    it('should regist all event emit after off', function() {
      assert.deepEqual(datas, ['event.2', 'event.1', 'event.-1']);
    });
  });

  describe('$once', function() {
    const priorityEventEmmitter = new PriorityEventEmmitter();
    let datas = [];
    const eventListener = (d) => datas.push('event');
    const eventListener2 = (d) => datas.push('event.2');
    const eventListener1 = (d) => datas.push('event.1');
    const eventListenerNegative1 = (d) => datas.push('event.-1');
    priorityEventEmmitter.$once('event', eventListener);
    priorityEventEmmitter.$once('event.2', eventListener2);
    priorityEventEmmitter.$once('event.1', eventListener1);
    priorityEventEmmitter.$once('event.-1', eventListenerNegative1);
    priorityEventEmmitter.$emit('event');
    priorityEventEmmitter.$emit('event');
    priorityEventEmmitter.$emit('event');
    priorityEventEmmitter.$emit('event');
    it('should remove all once event after emit this event', function() {
      assert.deepEqual(datas, ['event.2', 'event.1', 'event.-1', 'event']);
    });
  });
});

