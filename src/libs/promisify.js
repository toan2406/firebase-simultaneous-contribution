const maybePromise = obj =>
  obj && typeof obj.then === 'function' && typeof obj.catch === 'function';

export default function promisify(original) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      args.push(function callback(err, ...values) {
        if (err) {
          reject(err);
        } else {
          resolve(values);
        }
      });

      const response = original.apply(null, args);

      if (maybePromise(response)) {
        resolve(response);
      }
    });
  };
}
