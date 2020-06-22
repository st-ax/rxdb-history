import { RxDocument } from 'rxdb'
declare module 'rxdb-history' {
  export declare const DocumentHistory: {rxdb:Boolean}
  export declare const getHistoryMap: () => Promise<Map<number, RxDocument>>
}