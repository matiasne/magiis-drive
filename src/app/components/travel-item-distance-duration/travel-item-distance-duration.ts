import { Component, ElementRef, ViewChild,  Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit, Renderer2 } from '@angular/core';
import { PlaceModel } from '../../models/place.model';

@Component({
  selector: 'travel-item-distance-duration',
  templateUrl: 'travel-item-distance-duration.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TravelItemDistanceDurationComponent implements AfterViewInit, OnInit{

  get duration(): number {
    return this._duration;
  }
  @Input()
  set duration(value: number) {
    if (this._duration !== value) {
      this._duration = value;
      this.travelDuration = this.parseTravelDuration(this._duration);
      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
    }
  }
  @Input() passenger: string = '';
  @Input() travel: string = '';
  @Input() distance: number = 0;
  @Input() originPlace: string = '';
  @Input() destinationPlace: string = '';
  @Input() waypoints: PlaceModel[] = [];
  @Input() highlightAddresses: boolean = false;

  @ViewChild('accordionContent') elementView: ElementRef;

  private _duration: number = 0;
  public expanded: boolean = false;
  public isAnHour: boolean = false;
  public travelDuration: string = '';

  constructor(
    private ref: ChangeDetectorRef,
    public renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.travelDuration = this.parseTravelDuration(this.duration);
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

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
  public toggleAccordion() {
    this.expanded = !this.expanded;
    const newHeight = this.expanded ? 'auto' : '0px';
    const newPadding = this.expanded ? '16px' : '0px';
    this.renderer.setStyle(this.elementView.nativeElement, 'height', newHeight);
    this.renderer.setStyle(this.elementView.nativeElement, 'padding', newPadding);
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  //converts minutes to 00:00 horas/minutos
  public parseTravelDuration(travelDuration: number): string {
    const hours: number = Math.floor(travelDuration / 60);
    const minutes: number = travelDuration % 60;
    let time: string = '';
    if (hours < 1) {
      time = minutes.toString();
    } else {
      this.isAnHour = true;
      time = ('00' + hours).substr(-2) + ':' + (minutes < 10 ? '0' : '') + minutes;
    }

    return time;
  }

}
