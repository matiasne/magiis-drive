import { Injectable } from '@angular/core';

/*
  Generated class for the GlobalProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable({providedIn:'root'})
export class GlobalProvider {

  public appVersion: string = "%%VERSION%%";

  constructor() {
  }

}
