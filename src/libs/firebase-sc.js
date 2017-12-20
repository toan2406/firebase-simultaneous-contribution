/* Firebase Simultaneous Contribution */

import firebase from 'firebase';
import debounce from 'lodash.debounce';
import Queue from './queue';

export class FirebaseSC {
  _firebaseInstance = null;
  _sessionId = null;
  _queue = null;

  _setToFirebase = (task, callback) => {
    this._firebaseInstance
      .database()
      .ref('/__data__' + task.ref)
      .set(task.value)
      .then(() =>
        this._firebaseInstance
          .database()
          .ref('/__tasks__')
          .push(task, callback)
      );
  };

  constructor(firebaseInstance) {
    this._firebaseInstance = firebaseInstance;
  }

  init({
    sessionId = Date.now(),
    debounceTime = 500,
    enableQueue = false,
    ...firebaseConfig
  }) {
    this._sessionId = sessionId;
    this.set = debounce(this.set, debounceTime);
    this._firebaseInstance.initializeApp(firebaseConfig);

    if (enableQueue) {
      this._queue = new Queue();
      this._queue.setConsumer(this._setToFirebase);
    }
  }

  set(task) {
    const taskWithSession = {
      session: this._sessionId,
      ref: task.ref,
      value: task.value
    };

    if (this._queue) {
      this._queue.push(taskWithSession);
    } else {
      this._setToFirebase(taskWithSession);
    }
  }

  onDataChange(callback) {
    const tasksRef = this._firebaseInstance.database().ref('/__tasks__');
    let isDataLoaded = false;

    tasksRef
      .once('value')
      .then(() => (isDataLoaded = true));

    tasksRef
      .on('child_added', snapshot => {
        const task = snapshot.val();
        const { session, ...values } = task;
        if (isDataLoaded && session !== this._sessionId) callback(values);
      });
  }

  fetchData() {
    return this._firebaseInstance
      .database()
      .ref('/__data__')
      .once('value')
      .then(snapshot => snapshot.val());
  }
}

export default new FirebaseSC(firebase);
