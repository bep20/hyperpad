/* eslint-disable no-shadow */
/* eslint-disable no-loop-func */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-webpack-loader-syntax */
// import AppWorker from 'worker-loader!../app.worker';
import Worker from 'worker-loader!../workers/grinder';

let workersList = [];
let isGrinding = false;

export const terminateAllWorkers = () => {
  for (let i = 0; i < workersList.length; i++) {
    workersList[i].terminate();
  }
};

export const generateCsAddress = (
  startsWith,
  endsWith,
  caseSensitive,
  threadCount,
) => {
  const id = parseInt(Math.random() * 1000);

  if (isGrinding) {
    terminateAllWorkers();
  }
  workersList = [];
  isGrinding = true;
  return new Promise(resolve => {
    for (let i = 0; i < threadCount; i++) {
      const grindWorker = new Worker(Worker);
      grindWorker.onmessage = event => {
        const { id, ...data } = event.data;
        isGrinding = false;
        resolve(data?.matchingKeypairs);
        terminateAllWorkers();
      };
      workersList.push(grindWorker);
    }

    for (let i = 0; i < workersList.length; i++) {
      workersList[i].postMessage({
        id,
        startsWith,
        endsWith,
        caseSensitive,
      });
    }
  });
};
