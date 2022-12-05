import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'maggis-fab-button',
  templateUrl: 'maggis-fab-button.html'
})
export class MaggisFabButtonComponent {
  
  @Input() img: string;
  @Input() isDisabled: boolean;
  @Output() touch = new EventEmitter<void>()

  constructor(
  ) {}

  touchEmmiter(): void {
    this.touch.emit();
  }

}
