import { deferred, MuxAsyncIterator } from "../deps.ts";

/**
 * Simple async message queue to be used with for await of loops.
 */
export class Queue<T> {
  private _queue: T[] = [];
  private _isRunning = false;
  private _signal = deferred<T>();

  /**
   * Adds item to the end of the queue and starts its execution if it's not already the case
   * @param item 
  */
  enqueue(item: T): void {
    this._queue.push(item);
    this._run();
  }

  /**
   * Removes the first element in the queue
   */
  dequeue(): T | undefined {
    return this._queue.shift();
  }

  /**
   * Returns the size of the queue
   */
  size(): number {
    return this._queue.length;
  }

  /**
   * Returns a copy of the first element in the queue
   */
  peek(): T {
    return this._queue.slice(0, 1)[0];
  }

  private _run() {
    if (this._isRunning) return;

    this._isRunning = true;

    this._signal.resolve(this.dequeue());
    this._signal = deferred<T>();

    if (this._queue.length === 0) {
      this._isRunning = false;
    } else {
      setTimeout(() => this._run());
    }
  }

  private async *iterateOverQueue(
    mux: MuxAsyncIterator<T>,
  ): AsyncIterableIterator<T> {
    const value = await this._signal;
    mux.add(this.iterateOverQueue(mux));
    yield value;
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    const mux = new MuxAsyncIterator<T>();
    mux.add(this.iterateOverQueue(mux));
    return mux.iterate();
  }
}
