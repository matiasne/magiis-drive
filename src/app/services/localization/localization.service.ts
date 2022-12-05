import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { GooglePlacesService } from '../google-places.service';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs';
import { TimezoneResponse } from '../connection/interfaces/apiInterfaces';
import { ListTimezonesCommand } from './command/list-timezones.command';
import { ConnectionServices } from '../connection/connection.service';
import { IdentityService } from '../identity.service';
import { Location } from '../../models/location.model';
import { map, catchError, tap, concatMap,  } from 'rxjs/operators';
import {from} from 'rxjs'

registerLocaleData(localeEsAr);

export enum MeasureUnitsEnum {
  METRIC = 'METRIC',
  IMPERIAL = 'IMPERIAL'
}

export interface ILocaleData {
  currency: {
    name: string,
    name_plural: string,
    symbol: string,
    key: string,
    decimalPlaces
  },
  culture: string,
  locale: string,
  dateFormat: string,
  dateFormatCalendar?: string,
  measureUnits: MeasureUnitsEnum,
  timezoneOffset?: string,
  timezoneOffsetMinutes?: number,
  taxLanguage: {
    taxCodes: any[],
    [key: string]: any
  }
}

export const DEFAULT_LOCALE_VALUE = {
  currency: {
    name: 'Dollar',
    name_plural: 'Dollars',
    symbol: '$',
    key: 'USD',
    decimalPlaces: 2
  },
  culture: 'en',
  locale: 'en-US',
  dateFormat: 'MM/dd/yyyy',
  dateFormatCalendar: 'mm/dd/yy',
  measureUnits: MeasureUnitsEnum.IMPERIAL,
  taxLanguage: {
    taxCodes: [
      {
        value: 'USA-C1',
        label: 'Cat 1'
      },
      {
        value: 'USA-C2',
        label: 'Cat 2'
      },
      {
        value: 'USA-C2',
        label: 'Cat 3'
      }
    ],
    specific_tax_lang_key_EXAMPLE: 'Specific language key example for taxary language'
  }
};

@Injectable({providedIn:'root'})
export class LocalizationService {

  public countries$: { id: number, code: string, name: string }[];
  public timezones$: TimezoneResponse[];

  constructor(
    private _httpClient: HttpClient,
    private _placesService: GooglePlacesService,
    private _connectionService: ConnectionServices,
    private _identityService: IdentityService
  ) {}

  // tslint:disable-next-line:member-ordering
  private _localeData: BehaviorSubject<ILocaleData> = new BehaviorSubject<ILocaleData>(DEFAULT_LOCALE_VALUE);

  public get localeData(): ILocaleData {
    return this._localeData.getValue();
  }

  public set localeData(value: ILocaleData) {
    this._localeData.next(value);
  }

  // tslint:disable-next-line:member-ordering
  public localeChanges: Observable<void> = this._localeData.pipe(map(val => null));

  getCountryLocaleSettings(localeCode: string, currentPosition: Location): Observable<any> {
    localeCode = !localeCode || localeCode === 'null' ? 'us' : localeCode;
    return this._httpClient.get(`./assets/l10n/${localeCode}.json`)
      .pipe(catchError(err => {
        return this._httpClient.get(`./assets/l10n/us.json`)
      }))
      .pipe(
        tap(value => {
          this.setupCalendarDateFormat(value);
        }),
        concatMap(value => {
          // Use countries from carrier.
          return [this.setUTCOffset(currentPosition), this.getCountries()];
        }),
        tap(res => {
          this.countries$ = res[1];
        }),
        catchError(err => {
          // Show error in dialog.
          return of(null)
        })
      );
  }

  // TODO: Ver como resolver el tema del country, se tendria que sacar de la carrier.
  getCountries() {

    const currentCountry = {
      id: 0,
      code: this._identityService.countryCode
        ? this._identityService.countryCode
        : 'AR',
      name: this._identityService.country
    };

    return of([currentCountry]);
  }

  setUTCOffset(location: Location): Observable<any> {

    // TODO: Enviar posicion actual del usuario.
    return this._placesService
      .getUTCOffsetByPlaceLatLng(location.lat, location.lng)
      .pipe(map(res => {
        this.localeData.timezoneOffsetMinutes = res;
        this.localeData.timezoneOffset = this._placesService.getTimezoneOffset(res);
        return this.localeData;
      }));
  }

  public makeUTCDate(date: Date): Date {
    const actualOffset = this.localeData.timezoneOffsetMinutes * 60 * 1000;
    const browserOffset = new Date().getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() + actualOffset + browserOffset)
  }

  public makeLocalizedDate(date: Date): Date {
    const actualOffset = this.localeData.timezoneOffsetMinutes * 60 * 1000;
    const browserOffset = new Date().getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - actualOffset - browserOffset)
  }

  public getTimeZones(): Observable<TimezoneResponse[]> {
    if (this.timezones$) {
      return of(this.timezones$);
    }
    const listTimezonesCommand = new ListTimezonesCommand();

    return from(this._connectionService
      .Request(listTimezonesCommand)
      .then(response => {
        this.timezones$ = response;
        return response;
      })
      .catch(error => {
        // Show error in dialog.
       // Observable.throw(false);
        return error;
      }));
  }

  public getCountryCurrencySymbol(countryCode: string) {

  }

  private setupCalendarDateFormat(value: Object) {
    this.localeData = value as ILocaleData;
    let tempData = this.localeData;
    if (this.localeData.dateFormat.substr(0, 2).toLowerCase() === 'mm') {
      tempData.dateFormatCalendar = 'mm/dd/yy';
    } else {
      tempData.dateFormatCalendar = 'dd/mm/yy';
    }
    this.localeData = tempData;
  }
}
