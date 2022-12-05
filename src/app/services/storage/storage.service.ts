import { Injectable } from '@angular/core';
import { StorageKeyEnum } from './storageKeyEnum.enum';

@Injectable({providedIn:'root'})
export class StorageService {
    currentStorageVersion:string = "2"; //hard;

    constructor() { }

    getData(key: StorageKeyEnum): any {

        return localStorage.getItem(key.toString());
    }

    setData(key: StorageKeyEnum, data: any): any {
        return localStorage.setItem(key.toString(), data);
    }

    deleteData(key: StorageKeyEnum): any {
        return localStorage.remove(key.toString());
    }

    setObject(key: StorageKeyEnum, data: any): any {
        return localStorage.setItem(key.toString(), JSON.stringify(data));
    }

    clearStorage(): any {
        return localStorage.clear();
    }

    /**
     * Clean storage if there's a new version of it.
     * Current version is Strongly parametrized in storageService.currentStorageVersion
     */
    checkStorageVersion(): any {
        return this.getData(StorageKeyEnum.storageVersion);
    }

}

