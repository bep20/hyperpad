// grindWorker.js
import { grind } from '../utils/helpers';

// Listen for messages from the main thread
self.addEventListener('message', event => {
  const { id, startsWith, endsWith, caseSensitive } = event.data;
  const matchingKeypairs = grind(startsWith, endsWith, caseSensitive);
  // Send the matching keypairs back to the main thread
  self.postMessage({ matchingKeypairs, id });
});
