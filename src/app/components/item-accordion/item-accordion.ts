import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'item-accordion',
  templateUrl: 'item-accordion.html'
})
export class ItemAccordionComponent {

  @ViewChild('accordionContent') elementView: ElementRef;

  expanded: boolean = false;

  constructor(
    private ref: ChangeDetectorRef,
    public renderer: Renderer2
  ) { }

  ngAfterViewInit() {
    if (!this.expanded) {
      this.renderer.setStyle(this.elementView.nativeElement, 'height', 0 + 'px');
      this.renderer.setStyle(this.elementView.nativeElement, 'padding', 0 + 'px');
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
  public toggleAccordion(): void {
    this.expanded = !this.expanded;
    const newHeight = this.expanded ? 'auto' : '0px';
    const newPadding = this.expanded ? '16px' : '0px';
    this.renderer.setStyle(this.elementView.nativeElement, 'height', newHeight);
    this.renderer.setStyle(this.elementView.nativeElement, 'padding', newPadding);
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

}
