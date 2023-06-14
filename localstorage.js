class BasicEventHandler {
    constructor () {
        const eventPooler = {};

        const getNamespace = (str="")=> {
            const sl = str.split(".");
            var major = sl.shift();
            return {
                "major": major,
                "minor": sl.join(".") || "*"
            }
        }

        var id = 0;
        const makeId = ()=> {
            id++;
            return id;
        }

        this.on = (eventName, fn)=> {
            if (typeof fn !== "function") throw new error("Second parameter must be a function");
            const nameSpace = getNamespace(eventName);
            eventPooler[nameSpace.major] ||= {};
            eventPooler[nameSpace.major][nameSpace.minor] ||= {};
            eventPooler[nameSpace.major][nameSpace.minor][makeId()] = {
                fn:fn
            };

        }

        this.one = (eventName, fn)=> {
            if (typeof fn !== "function") throw new error("Second parameter must be a function")
            const nameSpace = getNamespace(eventName);
            eventPooler[nameSpace.major] ||= {};
            eventPooler[nameSpace.major][nameSpace.minor] ||= {};
            eventPooler[nameSpace.major][nameSpace.minor][makeId()] = {
                fn:fn,
                one:true
            };
        }

        this.off = (eventName)=> {
            if (!eventName.includes(".")) {
                if (!eventPooler[eventName]) return;
                delete eventPooler[eventName];
            } else {
                let nameSpace = getNamespace(eventName);
                try{
                    delete eventPooler[nameSpace.major][nameSpace.minor];
                } catch(e) {

                }
            }

        }

        this.emmit = (eventName, ...args)=> {
            const nameSpace = getNamespace(eventName);
            if (!eventPooler[nameSpace.major]) return;
            if (!eventName.includes(".")) {
                for (let minor in eventPooler[nameSpace.major]) {
                    for (let i in eventPooler[nameSpace.major][minor]) {
                        eventPooler[nameSpace.major][minor][i].fn.apply(this, args);
                        if (eventPooler[nameSpace.major][minor][i].one) {
                            delete eventPooler[nameSpace.major][minor][i];
                            if (Object.keys(eventPooler[nameSpace.major][minor]).length == 0 ) delete eventPooler[nameSpace.major][minor];
                        }
                    }
                }
            } else {
                if (!eventPooler[nameSpace.major][nameSpace.minor]) return;
                for (let i in eventPooler[nameSpace.major][nameSpace.minor]) {
                    eventPooler[nameSpace.major][nameSpace.minor][i].fn.apply(this, args);
                    if (eventPooler[nameSpace.major][nameSpace.minor][i].one) {
                        delete eventPooler[nameSpace.major][nameSpace.minor][i];
                        if (Object.keys(eventPooler[nameSpace.major][nameSpace.minor]).length == 0 ) delete eventPooler[nameSpace.major][nameSpace.minor];

                    }
                }
            }
        }

        this.hasEvent = (eventName) => {
            try {
                const nameSpace = getNamespace(eventName);
                if (!eventPooler[nameSpace.major]) return false;
    
                if (!eventName.includes(".")) {
                    if (Object.keys(eventPooler[nameSpace.major]).length > 0 ) return true;
                } else {
                    if (Object.keys(eventPooler[nameSpace.major][nameSpace.minor]).length > 0) return true;
                }
                return false;
            } catch (e) {
                return false;
            }

        }

        this.trigger = this.emmit;
    }
}



/**
 * A simple indexedDB handler to store [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) like key value pair... except, it is better.
 * The benefits are:
 * - Can store large amount of data.
 * - Asynchronous and non-blocking.
 * - Loaded on demand unlike LocalStorage.
 * - Can store JavaScript object data.
 * @class
 * @param {String} [dbName=commonDB] - The DB name
 * @param {String} [tableName=keyValuePairs] - Table name
 * @memberof common
 * @example <caption>Basic usage</caption>
 * var myStorage = new DB();
 * 
 * //store a value to "someKey"
 * await myStorage.set("someKey", {"someObject" : "with the value"}):
 * 
 * //get the value of "someKey"
 * await myStorage.get("someKey");
 * // will returns:
 * {
 *    "someObject": "with the value"
 * }
 */
const BLS = function(dbName="commonDB", tableName="keyValuePairs") {
    const evt = new BasicEventHandler();
	this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
	this.dbName = dbName || "commonDB";
	this.tableName = tableName || "keyValuePairs";
	this.readyPromise = new Promise((resolve) => {
		this.resolver = resolve;
	});

    
    const initTransaction = async () => {
        this.tx = this.db.transaction(this.tableName, "readwrite");
        this.store = this.tx.objectStore(this.tableName);
    }

    const init = async () => {
        return new Promise((resolve, reject) => {
            this.connection = indexedDB.open(this.dbName, 1);
            this.connected = false;
        
            this.connection.onupgradeneeded = () =>{
                this.db = this.connection.result;
                this.store = this.db.createObjectStore(this.tableName, {keyPath: "id"});
                //this.index = this.store.createIndex("NameIndex", ["name.last", "name.first"]);
            };
        
            this.connection.onsuccess = () => {
                // Start a new transaction
                this.db = this.connection.result;
                this.tx = this.db.transaction(this.tableName, "readwrite");
                this.store = this.tx.objectStore(this.tableName);
                //this.index = this.store.index("NameIndex");
                this.isInitialized = true;
                this.resolver(this);
                resolve(this);
            }
        })
    }

    this.untilReady = async () => {
        if (this.isInitialized) return this;
        return init();
    }

    /**
     * Set a value to the local DB
     * @async
     * @param {String} key - key of the key-value pair
     * @param {*} value - Value of the key-value pair. Value can be anything. Unlike LocalStorage, if you can also store object in the DB.
     * @returns {Promise<Event>} - Transaction event
     */
    this.set = async (key, value) => {
        if (typeof key !== "string") throw new Error("Invalid key. Key must be a string!")

        await this.untilReady();
        evt.trigger("beforeSet", key, value);
        var isChanged = false;
        var prevValue
        if (evt.hasEvent("change")) {
            prevValue = await this.get(key);
            if (JSON.stringify(prevValue) !== JSON.stringify(value)) isChanged = true;
        }
        return new Promise(async (resolve, reject) => {
            await initTransaction();
            var request = this.store.put({id: key, value: value});
            request.onsuccess = (e)=> {
                evt.trigger("set", key, value);
                if (isChanged) {
                    evt.trigger("change", key, value, prevValue);
                }
                resolve(e)
            }
            request.onerror = (e)=> {
                reject(e)
            }
        })
    }
    this.setItem = this.set;

    /**
     * Get a value from local DB.
     * @async
     * @param {String} key  - key of the key-value pair
     * @returns {Promise<*>} - The value
     */
    this.get = async (key) => {
        if (typeof key !== "string") throw new Error("Invalid key. Key must be a string!")

        await this.untilReady();
        return new Promise(async (resolve, reject) => {
            await initTransaction();
            var request = this.store.get(key);
            request.onsuccess = (e)=> {
                if (!request.result) return resolve();
                resolve(request.result.value)
            }
            request.onerror = (e)=> {
                reject(e)
            }
        })
    }

    this.getItem = this.get;

    this.getAll = async () => {
        await this.untilReady();
        return new Promise(async (resolve, reject) => {
            await initTransaction();
            var request = this.store.getAll();
            request.onsuccess = (e)=> {
                if (!request.result) return resolve();
                let result = {}
                for (let i=0; i<request.result.length; i++) {
                    result[request.result[i].id] = request.result[i].value;
                }

                resolve(result)
            }
            request.onerror = (e)=> {
                reject(e)
            }
        })
    }


    /**
     * Delete a record from local DB.
     * @async
     * @param {String} key  - key of the key-value pair
     * @returns {Promise<Event>} - Transaction event
     */
    this.delete = async (key) => {
        if (typeof key !== "string") throw new Error("Invalid key. Key must be a string!")

        await this.untilReady();
        evt.trigger("beforeDelete", key);

        return new Promise(async (resolve, reject) => {
            await initTransaction();
            var request = this.store.delete(key);
            request.onsuccess = (e)=> {
                evt.trigger("delete", key);
                resolve(e)
            }
            request.onerror = (e)=> {
                reject(e)
            }
        })
    }
    this.removeItem = this.delete;

    /**
     * Clear a database.
     * @returns {Promise<Event>} - Transaction event
     */
    this.clear = async () => {
        await this.untilReady();
        evt.trigger("beforeClear");

        return new Promise(async (resolve, reject) => {
            await initTransaction();
            var request = this.store.clear();
            request.onsuccess = (e)=> {
                evt.trigger("clear", key);
                resolve(e)
            }
            request.onerror = (e)=> {
                reject(e)
            }
        })
    }

    this.on = (eventName, fn)=> {
        evt.on(eventName, fn);
    }

    this.one = (eventName, fn)=> {
        evt.one(eventName, fn);
    }

    this.off = (eventName) => {
        evt.off(eventName);
    }
}


module.exports = BLS;