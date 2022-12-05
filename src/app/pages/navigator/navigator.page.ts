import { Component, OnInit } from '@angular/core';
import { CallEnum } from 'src/app/services/enum/call.enum';
import { CallService } from '../../services/call.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.page.html',
  styleUrls: ['./navigator.page.scss'],
})
export class NavigatorPage implements OnInit {

  constructor(
    private callService: CallService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  canTouch(){
    const startUrl = this.router.url.substring(0,10);
    // console.log(this.router.url)
    if ( this.router.url === '/navigator/travel-list') { 
      console.log('es travel list')
      return false 
    } else if ( 
      startUrl === '/navigator'      
    ) {
      return true
    }
    
  }

  call(){
    console.log('call plugin ')
    this.callService.call(CallEnum.CALL_CARRIER)
  }

}
