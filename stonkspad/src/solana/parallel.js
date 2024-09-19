export class Parallel {
  constructor() {}
  static withLimit(promises, limit, itemCb) {
    return new Promise((resolve, reject) => {
      let currentIndex = -1;
      let totalResolved = 0;
      let totalFailed = 0;

      const executeNext = () => {
        currentIndex += 1;
        if (
          currentIndex >= promises?.length &&
          totalResolved + totalFailed == promises?.length
        ) {
          resolve('done');
        } else if (currentIndex < promises?.length) {
          new Promise(promises[currentIndex])
            .then(res => {
              totalResolved += 1;
              itemCb && itemCb(null, res);
            })
            .catch(err => {
              totalFailed += 1;
              itemCb && itemCb(err, null);
            })
            .finally(() => {
              executeNext();
            });
        }
      };
      for (let i = 0; i < Math.min(limit, promises?.length); i++) {
        executeNext();
      }
    });
  }
}
