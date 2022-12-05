import {Pipe, PipeTransform} from '@angular/core';
import {LocalizationService, MeasureUnitsEnum} from '../services/localization/localization.service';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
  name: 'distanceDescription',
  pure: false
})
export class DistanceDescriptionPipe implements PipeTransform {

  constructor(
    private _localizationService: LocalizationService,
    private _translateService: TranslateService
  ) {}

  transform(value: any, shortDescription?: boolean): any {
    if (!value) {
      return
    }
    // Metric as default
    if (this._localizationService.localeData && this._localizationService.localeData.measureUnits.toString() === MeasureUnitsEnum.METRIC.toString()) {
      return value;
    } else {
      if (!this._localizationService.localeData) {
        return value;
      }
      let kmsMask = new RegExp(shortDescription ? 'kms' : this._translateService.instant('length_unit.kms.name'), 'ig');
      let mtsMask = new RegExp(shortDescription ? 'mts' : 'metros', 'ig');
      value = value.replace(kmsMask, this._translateService.instant(shortDescription ? 'length_unit.miles.abbr' : 'Miles'));
      return value.replace(mtsMask, this._translateService.instant(shortDescription ? 'length_unit.feet.abbr' : 'Feet'));
    }
  }

}
