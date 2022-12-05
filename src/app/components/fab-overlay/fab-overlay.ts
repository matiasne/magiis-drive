import { Component } from '@angular/core';
import { CallService } from '../../services/call.service';

@Component({
  selector: 'fab-overlay',
  templateUrl: 'fab-overlay.html'
})
export class FabOverlay {
  showFabOverlay: boolean = false;
  showFabOverlayClass: string = '';

  constructor(
    private callService: CallService
  ) {}

  toggleFabOverlay() {
    this.showFabOverlay = !this.showFabOverlay;
    if (this.showFabOverlay) this.showFabOverlayClass = 'fab-show-overlay';
    else this.showFabOverlayClass = 'fab-hide-overlay';
  }

  call(callTo: string) {
    this.callService.call(callTo);
    this.toggleFabOverlay();
  }
}
