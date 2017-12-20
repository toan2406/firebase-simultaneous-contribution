const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const LIMIT = 10;

exports.autoCleanTasks = functions.database
  .ref('/__tasks__/{pushId}')
  .onCreate(event => {
    const tasksRef = event.data.ref.parent;

    return tasksRef
      .orderByKey()
      .once('value')
      .then(snapshot => {
        const taskIds = Object.keys(snapshot.val() || {});

        if (taskIds.length > LIMIT) {
          return tasksRef
            .orderByKey()
            .endAt(taskIds[taskIds.length - LIMIT - 1])
            .once('value')
            .then(snapshot => {
              snapshot.forEach(data => {
                tasksRef.child(data.key).remove();
              });
            });
        }
      });
  });
