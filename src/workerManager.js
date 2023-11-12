import Worker from 'web-worker';

/**
 * @typedef {function} resolve_type
 * @param {any} data - The input data.
 * @returns {void}
 */

export class WorkerThread {
	/** @type {Worker} */
	_worker;
	/** @type {number} */
	_id;
	/** @type {resolve_type | null} */
	_resolve;

	/**
	 *
	 * @param {string | URL} scriptURL
	 * @param {number} id
	 */
	constructor(scriptURL, id) {
		this._worker = new Worker(scriptURL);
		//on the actuall onmessage event from the worker we use our wrapper

		this._worker.onmessage = (/** @type {any} */ msg) => {
			this._OnMessage(msg);
		};
		this._worker.onerror = (/** @type {any} */ err) => {
			console.log({ error: true, err });
		};
		this._resolve = null;
		this._id = id;
	}

	/**
	 * @param {any} msg
	 */
	_OnMessage(msg) {
		const resolve = this._resolve;
		this._resolve = null;
		if (resolve) resolve(msg.data);
	}

	get id() {
		return this._id;
	}

	/**
	 * @param {any} worker_msg
	 * @param {resolve_type} resolve
	 */
	postMessage(worker_msg, resolve) {
		this._resolve = resolve;
		this._worker.postMessage(worker_msg);
	}
}

export class WorkerThreadPool {
	/** @type {WorkerThread[]} */
	_workers;
	/** @type {WorkerThread[]} */
	_free;
	/** @type {Object.<string, WorkerThread>}  */
	_busy;
	/** @type {[string, resolve_type][]} */
	_queue;

	/** @type {number} */
	_count;

	/**
	 *
	 * @param {number} amount
	 * @param {string | URL} scriptURL
	 */
	constructor(amount, scriptURL) {
		this._count = 0;
		this._workers = [...Array(amount)].map((_) => new WorkerThread(scriptURL, this._count++));
		this._free = [...this._workers];
		this._busy = {};
		this._queue = [];
	}

	get length() {
		return this._workers.length;
	}

	get Busy() {
		return this._queue.length > 0 || Object.keys(this._busy).length > 0;
	}

	/**
	 *
	 * @param {any} worker_msg
	 * @param {resolve_type} resolve
	 */
	enqueue(worker_msg, resolve) {
		this._queue.push([worker_msg, resolve]);
		this._PumpQueue();
	}

	_PumpQueue() {
		//use all avalible workers
		while (this._free.length > 0 && this._queue.length > 0) {
			//get the free worker
			//no idea why i need to cast it in ts it works without because in the loop we check if its even a valid length
			const worker = /** @type {WorkerThread} */ (this._free.pop());
			this._busy[worker.id] = worker;

			//same here with the casting
			const [worker_msg, worker_resolve] = /** @type {[string, resolve_type]} */ (this._queue.shift());

			//post msg to worker and set the resolve function
			worker.postMessage(worker_msg, (/** @type {any} */ data) => {
				delete this._busy[worker.id];
				this._free.push(worker);
				//call the resolver function (what to happen with the data)
				worker_resolve(data);
				//start with the next in queue
				this._PumpQueue();
			});
		}
	}
}
