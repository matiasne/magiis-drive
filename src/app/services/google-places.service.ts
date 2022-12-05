import { Injectable } from "@angular/core";
import { PredictionModel } from "../models/prediction.model";
import { PlaceModel } from "../models/place.model";
import { Observable, of } from "rxjs";
import { TravelService } from './travel.service';
import * as ts from '@mapbox/timespace';
import * as ct from 'countries-and-timezones';

declare var google;

@Injectable({providedIn:'root'})
export class GooglePlacesService {
  private _autocompleteService: google.maps.places.AutocompleteService;
  private _geocoder: google.maps.Geocoder;

  get autocompleteService(): google.maps.places.AutocompleteService {
    if (!this._autocompleteService) {
      this._autocompleteService = new google.maps.places.AutocompleteService();
    }

    return this._autocompleteService;
  }

  get geocoderService(): google.maps.Geocoder {
    if (!this._geocoder) {
      this._geocoder = new google.maps.Geocoder();
    }

    return this._geocoder;
  }

  constructor(
    private travelService: TravelService
  ) {}

  getUTCOffsetByPlaceLatLng(lat: number, lon: number): Observable<number> {

    let siny = Math.sin(lat * Math.PI / 180);
    let TILE_SIZE = 256;

    // Truncating to 0.9999 effectively limits latitude to 89.189. This is
    // about a third of a tile past the edge of the world tile.
    siny = Math.min(Math.max(siny, -0.9999), 0.9999);

    let tile = [
      Math.floor(TILE_SIZE * (0.5 + lon / 360)),
      Math.floor(TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI))),
      8
    ];
    let timezone1 = ts.getFuzzyTimezoneFromTile(tile);
    return of(ct.getTimezone(timezone1).utcOffset);
  }

  getUTCOffsetByTimezoneName(timezoneName: string): Observable<number> {

    return of(ct.getTimezone(timezoneName).utcOffset);
  }

  public getTimezoneOffset(offset: number): string {
    offset = offset / 60;
    let sign = offset >= 0 ? '+' : '-';
    let minutes = '00' + (((Math.abs(offset) - Math.floor(offset)) * 60) % 60).toFixed(2).toString();
    minutes = minutes.substr(minutes.length - 2);
    let hours = '00' + Math.floor(Math.abs(offset)).toString();
    hours = hours.substr(hours.length - 2);

    return sign + hours + minutes;
  }

  //#region GOOGLE API
  runGoogleAutocomplete(input: string): Promise<PredictionModel[]> {
    const request: google.maps.places.AutocompletionRequest = {
      input: input,
      location: new google.maps.LatLng(
        +this.travelService.currentOrigin.latitude,
        +this.travelService.currentOrigin.longitude
      ),
      radius: 10000
    };

    return this.makeGoogleRequest(request).then(predictions => {
      const collection = predictions.map(element =>
        this.mapPreditionToPlace(element)
      );

      return collection;
    });
  }

  geocode(address: PredictionModel): Promise<PlaceModel> {
    return new Promise((resolve, reject) => {
      this.geocoderService.geocode(
        { placeId: address.placeId },
        (results, status) => {
          if (status == google.maps.GeocoderStatus.OK) {
            const place = new PlaceModel();
            place.latitude = results[0].geometry.location.lat().toString();
            place.longitude = results[0].geometry.location.lng().toString();
            place.placeId = address.placeId;
            place.shortName = address.shortName;

            resolve(place);
          } else {
            console.log("# AddressesPage.selectPlace.address geocoder failure");
            reject(status);
          }
        }
      );
    });
  }

  private makeGoogleRequest(
    request: google.maps.places.AutocompletionRequest
  ): Promise<google.maps.places.AutocompletePrediction[]> {
    return new Promise((resolve, reject) => {
      // Invokes getPlacePredictions method of Google Maps API places.
      this.autocompleteService.getPlacePredictions(
        request,
        (
          placesCollection: google.maps.places.AutocompletePrediction[],
          placesServiceStatus: google.maps.places.PlacesServiceStatus
        ) => {
          if (
            placesServiceStatus == google.maps.places.PlacesServiceStatus.OK &&
            placesCollection != undefined
          ) {
            resolve(placesCollection);
          } else if (google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            console.log(
              "Places service: places predictions failed due to: " + status
            );
            reject(status);
          }
        }
      );
    });
  }

  private mapPreditionToPlace(
    element: google.maps.places.AutocompletePrediction
  ): PredictionModel {
    const place = new PredictionModel();
    place.placeId = element.place_id;
    place.shortName = element.description;
    place.mainText = element.structured_formatting.main_text;
    place.secondaryText = element.structured_formatting.secondary_text;
    place.placeId = element.place_id;

    return place;
  }
}
