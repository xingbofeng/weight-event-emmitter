const WeightEventEmmitter = require('./../weightEventEmmitter.js');
const assert = require('assert');

describe('WeightEventEmmitter', function() {
  describe('$on', function() {
    const weightEventEmmitter = new WeightEventEmmitter();
    const eventListener = () => 'event';
    const eventListener2 = () => 'event.2';
    const eventListener1 = () => 'event.1';
    const eventListenerNegative1 = () => 'event.-1';
    weightEventEmmitter.$on('event', eventListener);
    weightEventEmmitter.$on('event.2', eventListener2);
    weightEventEmmitter.$on('event.1', eventListener1);
    weightEventEmmitter.$on('event.-1', eventListenerNegative1);
    it('should regist all event', function() {
      assert.equal(weightEventEmmitter.listeners.event['-Infinity'].length, 1);
      assert.equal(weightEventEmmitter.listeners.event['1'].length, 1);
      assert.equal(weightEventEmmitter.listeners.event['2'].length, 1);
      assert.equal(weightEventEmmitter.listeners.event['-1'].length, 1);
      
    });
    it('should regist all event sorted', function() {
      assert.equal(weightEventEmmitter.listeners.event['-Infinity'][0](), 'event');
      assert.equal(weightEventEmmitter.listeners.event['1'][0](), 'event.1');
      assert.equal(weightEventEmmitter.listeners.event['2'][0](), 'event.2');
      assert.equal(weightEventEmmitter.listeners.event['-1'][0](), 'event.-1');
    });
  });

  describe('$emit', function() {
    const weightEventEmmitter = new WeightEventEmmitter();
    let datas = [];
    const eventListener = (d) => datas.push('event');
    const eventListener2 = (d) => datas.push('event.2');
    const eventListener1 = (d) => datas.push('event.1');
    const eventListenerNegative1 = (d) => datas.push('event.-1');
    weightEventEmmitter.$on('event', eventListener);
    weightEventEmmitter.$on('event.2', eventListener2);
    weightEventEmmitter.$on('event.1', eventListener1);
    weightEventEmmitter.$on('event.-1', eventListenerNegative1);
    weightEventEmmitter.$emit('event');
    it('should regist all event emit as true sorted', function() {
      assert.deepEqual(datas, ['event.2', 'event.1', 'event.-1', 'event']);
    });
  });

  describe('$off', function() {
    const weightEventEmmitter = new WeightEventEmmitter();
    let datas = [];
    const eventListener = (d) => datas.push('event');
    const eventListener2 = (d) => datas.push('event.2');
    const eventListener1 = (d) => datas.push('event.1');
    const eventListenerNegative1 = (d) => datas.push('event.-1');
    weightEventEmmitter.$on('event', eventListener);
    weightEventEmmitter.$on('event.2', eventListener2);
    weightEventEmmitter.$on('event.1', eventListener1);
    weightEventEmmitter.$on('event.-1', eventListenerNegative1);
    weightEventEmmitter.$off('event', eventListener);
    weightEventEmmitter.$emit('event');
    console.log('datas', datas);
    it('should regist all event emit after off', function() {
      assert.deepEqual(datas, ['event.2', 'event.1', 'event.-1']);
    });
  });

  describe('$once', function() {
    const weightEventEmmitter = new WeightEventEmmitter();
    let datas = [];
    const eventListener = (d) => datas.push('event');
    const eventListener2 = (d) => datas.push('event.2');
    const eventListener1 = (d) => datas.push('event.1');
    const eventListenerNegative1 = (d) => datas.push('event.-1');
    weightEventEmmitter.$once('event', eventListener);
    weightEventEmmitter.$once('event.2', eventListener2);
    weightEventEmmitter.$once('event.1', eventListener1);
    weightEventEmmitter.$once('event.-1', eventListenerNegative1);
    weightEventEmmitter.$emit('event');
    weightEventEmmitter.$emit('event');
    weightEventEmmitter.$emit('event');
    weightEventEmmitter.$emit('event');
    it('should remove all once event after emit this event', function() {
      assert.deepEqual(datas, ['event.2', 'event.1', 'event.-1', 'event']);
    });
  });
});

