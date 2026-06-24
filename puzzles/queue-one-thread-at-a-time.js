var queue = [];
var running = false;
function addToQueue(runTask) {
  // addToQueue runs when the 'Queue it up!' button is clicked.
  queue.push(runTask);
  // ...

  // Call runTask when the task is ready to start.
  tryRunNextTask();
    // ...
}
function tryRunNextTask () {
  if (!running && queue.length) {
    var task = queue.shift();
    running = true;
    task(done);
  }
}
function done () {
  running = false;
  tryRunNextTask();
}
