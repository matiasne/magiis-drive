import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";

@Injectable({providedIn:'root'})
export class SignBase64Provider {

  signPassengerBase64 = new BehaviorSubject<string>(null);
  signBase64 = this.signPassengerBase64.asObservable();
  containSign = new BehaviorSubject<boolean>(null);
  contain = this.containSign.asObservable();

  constructor(public http: HttpClient) {}

}
