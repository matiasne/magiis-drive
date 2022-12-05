import { Component, Input, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'travel-item-details',
  templateUrl: 'travel-item-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TravelItemDetailsComponent implements AfterViewInit {

  @Input() label: string;
  @Input() amount: string;
  @Input() expandable: boolean;
  @Input() visible: boolean;

  @ViewChild('accordionContent') elementView: ElementRef;

  viewHeight: number;
  expanded: boolean = false;

  constructor(
    private ref: ChangeDetectorRef,
    public renderer: Renderer2,

  ) {}

  ngAfterViewInit() {
    this.viewHeight = this.elementView.nativeElement.offsetHeight;

    if (!this.expanded) {
      this.renderer.setStyle(this.elementView.nativeElement, 'height', 0 + 'px');
      this.renderer.setStyle(this.elementView.nativeElement, 'overflow', 'hidden');
    }
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  /**
   * If the item is expandable (this.expandable === true),
   * expand the container to display the items inside.
   */
  public toggleAccordion() {
    if(this.expandable) {
      this.expanded = !this.expanded;
      const newHeight = this.expanded ? 'auto' : '0px';
      this.renderer.setStyle(this.elementView.nativeElement, 'height', newHeight);
    }
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

}
