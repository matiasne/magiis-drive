import {Pipe, PipeTransform} from '@angular/core';
import {LocalizationService, MeasureUnitsEnum} from '../services/localization/localization.service';

/**
 * Converts the one and only real measure system (Metric) to the subpar imperial system
 * set as impure pipe since it's used on so many views with so many problems and there's so
 * little time before the project ends that... you know the drill.
 */
@Pipe({
  name: 'distance',
  pure: true
})
export class DistancePipe implements PipeTransform {

  constructor(private _localizationService: LocalizationService) {
  }

  transform(value: any, shortDistance?: boolean): any {
    if (!value || isNaN(value)) {
      return 0;
    }
    value = Number(value);
    // Metric as default
    if (!this._localizationService.localeData || this._localizationService.localeData.measureUnits === MeasureUnitsEnum.METRIC) {
      return value;
    } else {
      if (shortDistance) {
        // Conversion to feet
        return Math.round((value / 0.3048) * 100) / 100;
      } else {
        // Conversion to miles
        return Math.round((value / 1.60934) * 100) / 100;
      }
    }
  }

}
