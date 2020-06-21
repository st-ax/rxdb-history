import { RxDocument } from 'rxdb'
declare module 'rxdb-history' {
  export const DocumentHistory: RxDB = {  }
  export type getHistoryMap = () => Promise<Map<number, RxDocument>>
}