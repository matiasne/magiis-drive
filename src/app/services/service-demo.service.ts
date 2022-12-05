import { Injectable } from '@angular/core';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';

@Injectable({
  providedIn: 'root'
})
export class ServiceDemoService {

  constructor(
    
    private camera: Camera,
    // private platform: Platform
  ) { }
}
