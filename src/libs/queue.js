/* Auto-Empty Queue */

import promisify from './promisify';

class Queue {
  _list = [];
  _isEmptying = false;
  _consumer = () => Promise.resolve();

  push = element => {
    this._list.push(element);

    if (!this._isEmptying) {
      this._isEmptying = true;
      this.empty().then(() => (this._isEmptying = false));
    }

    return this._list;
  };

  shift = () => {
    return this._list.shift();
  };

  empty = () => {
    if (!this._list.length) return;
    return this._consumer(this.shift()).then(this.empty);
  };

  setConsumer = consumer => {
    this._consumer = promisify(consumer);
  };
}

export default Queue;
