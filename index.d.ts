export = BLS;
type keyValuePair = {[key: string]: any}
type CallbackFunction = (...args: any[]) => void;


declare class BLS {
    constructor(dbName?: string, tableName?: string);

    // props
    dbName: string;
    tableName: string;
    db: IDBDatabase;
    indexedDB: IDBFactory;
    connection: IDBOpenDBRequest;
    tx:IDBTransaction;
    store:IDBObjectStore;
    isInitialized:boolean;

    // methods
    untilReady(): Promise<BLS>;
    set(key:string, value:any): Promise<Event>;
    setItem(key:string, value:any): Promise<Event>;
    get(key:string): Promise<any>;
    getItem(key:string): Promise<any>;
    getAll(): Promise<keyValuePair>;
    delete(key:string): Promise<Event>;
    clear(): Promise<Event>;
    drop(): Promise<Event>;
    on(eventName:string, callback:CallbackFunction): void;
    one(eventName:string, callback:CallbackFunction): void;
    off(eventName:string): void;

}
