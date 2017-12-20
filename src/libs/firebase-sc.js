/* Firebase Simultaneous Contribution */

import firebase from 'firebase';
import Queue from './queue';

export class FirebaseSC {
  _firebaseInstance = null;
  _sessionId = null;
  _queue = null;

  constructor(firebaseInstance) {
    this._firebaseInstance = firebaseInstance;
  }

  init({ sessionId = Date.now(), ...firebaseConfig }) {
    this._sessionId = sessionId;
    this._queue = new Queue();
    this._firebaseInstance.initializeApp(firebaseConfig);

    this._queue.setConsumer((task, callback) => {
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
    });
  }

  set(task) {
    const taskWithSession = {
      session: this._sessionId,
      ref: task.ref,
      value: task.value
    };

    // this._queue.push(taskWithSession);

    this._firebaseInstance
      .database()
      .ref('/__data__' + task.ref)
      .set(task.value)
      .then(() =>
        this._firebaseInstance
          .database()
          .ref('/__tasks__')
          .push(taskWithSession)
      );
  }

  onDataChange(callback) {
    const tasksRef = this._firebaseInstance.database().ref('/__tasks__');
    let isDataLoaded = false;

    tasksRef
      .once('value')
      .then(() => (isDataLoaded = true));

    tasksRef.
      on('child_added', snapshot => {
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
