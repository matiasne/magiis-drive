import { Injectable } from '@angular/core';
import { StorageKeyEnum } from '../storage/storageKeyEnum.enum';

@Injectable({providedIn:'root'})
export class SessionService {

    constructor() { }
    setItem(key: StorageKeyEnum, value: any): void {
        sessionStorage.setItem(key.toString(), value);
    }
    getItem(key: StorageKeyEnum): any {
        return sessionStorage.getItem(key.toString());
    }
    removeItem(key: StorageKeyEnum): void {
        sessionStorage.removeItem(key.toString());
    }
    clear(): void {
        sessionStorage.clear();
    }
}
