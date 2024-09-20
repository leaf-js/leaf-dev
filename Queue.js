export class Queue {

    queue = [];

    /**
     * Adds a new element to the end of the queue.
     *
     * @param {*} element - the element to be added to the queue
     * @return {undefined} this function does not return any value
     */
    enqueue(element) {
        this.queue.push(element);
    }

    /**
     * Removes and returns the front element from the queue.
     *
     * @return {*} The front element from the queue, or undefined if the queue is empty.
     */
    dequeue() {
        return this.queue.shift();
    }

    /**
     * Returns the front element from the queue without removing it.
     *
     * @return {*} The front element from the queue, or undefined if the queue is empty.
     */
    peek() {
        return $this.queue[0];
    }

    /**
     * Checks if the queue is empty.
     *
     * @return {boolean} True if the queue is empty, false otherwise.
     */
    isEmpty() {
        return this.queue.length === 0;
    }

    /**
     * Returns the number of elements in the queue.
     *
     * @return {number} The size of the queue.
     */
    size() {
        return this.queue.length;
    }

}