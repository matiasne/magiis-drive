import {Attribute, Directive, ElementRef, HostListener} from '@angular/core';
import {LocalizationService, MeasureUnitsEnum} from '../../services/localization/localization.service';
import {NgControl} from '@angular/forms';

@Directive({
  selector: '[appDistance]'
})
export class DistanceDirective {

  constructor(private _localizationService: LocalizationService,
              protected el: ElementRef,
              protected ngControl: NgControl,
              @Attribute('shortDistance') private shortDistance: boolean = false) {
  }

  @HostListener('ngModelChange', ['$event'])
  onNgModelChange(event) {
    if (this._localizationService.localeData && this._localizationService.localeData.measureUnits === MeasureUnitsEnum.IMPERIAL) {
      // Feet or miles
      let multiplier = this.shortDistance ? 0.3048 : 1.60934;
      let current: number = Math.round((Number(event) * multiplier) * 100) / 100;
      this.ngControl.control.setValue(current, {emitModelToViewChange: false});
      console.log(current);
    }
  }
}
