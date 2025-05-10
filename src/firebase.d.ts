declare module 'firebase/firestore' {
  export interface DocumentData {
    [field: string]: any;
  }

  export interface DocumentReference {
    id: string;
    path: string;
  }

  export interface QueryDocumentSnapshot<T = DocumentData> {
    id: string;
    ref: DocumentReference;
    data(): T;
  }

  export interface QuerySnapshot<T = DocumentData> {
    docs: QueryDocumentSnapshot<T>[];
    empty: boolean;
    size: number;
    forEach(callback: (result: QueryDocumentSnapshot<T>) => void): void;
  }

  export function collection(firestore: any, path: string, ...pathSegments: string[]): any;
  export function doc(firestore: any, path: string, ...pathSegments: string[]): any;
  export function addDoc(reference: any, data: any): Promise<any>;
  export function getDocs(query: any): Promise<QuerySnapshot>;
  export function setDoc(reference: any, data: any): Promise<void>;
  export function updateDoc(reference: any, data: any): Promise<void>;
  export function deleteDoc(reference: any): Promise<void>;
  export function writeBatch(firestore: any): any;
  export function getFirestore(app?: any): any;
}