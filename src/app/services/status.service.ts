import { ConnectionServices } from './connection/connection.service';
import { IdentityService } from './identity.service';
import { Injectable } from '@angular/core';
import {
  IDriverStatusCommandParameters,
  DriverStatusCommand
} from './connection/command/driverStatus.command';
import {
  ICurrentTripDataCommandParameters,
  CurrentTripDataCommand
} from './connection/command/currentTripData.command';
import {
  IIncomingTripDataCommandParameters,
  IncomingTripDataCommand
} from './connection/command/incomingTripData.command';
import { CurrentTravelModel } from '../models/current-travel.model';
import { Subject } from 'rxjs';
import { Base } from '../models/base.model';
import { DriverSubStateEnum } from './enum/driver-sub-state.enum';
import { TravelService } from './travel.service';
import { NavigationService } from './navigation.service';
import { FirebaseService } from './firebase.service';
import { Observable } from 'rxjs';
import { DriverStatusModel } from '../models/driver-status.model';

@Injectable({providedIn:'root'})
export class StatusService {
  setDriverSubstate: Subject<boolean> = new Subject<boolean>();
  private calculating = false;
  private calculatingTimeout;

  constructor(
    private identityService: IdentityService,
    private connectionService: ConnectionServices,
    private travelService: TravelService,
    private navigationService: NavigationService,
    private firebaseService: FirebaseService
  ) {}

  /**get driver status from server */
  getDriverStatus(): Promise<DriverStatusModel> {
    let driverStatusCommand = new DriverStatusCommand();
    driverStatusCommand.setParameters(<IDriverStatusCommandParameters>{
      carrierId: +this.identityService.carrierUserId,
      driverId: +this.identityService.userId
    });

    return this.connectionService.Request(driverStatusCommand);
  }

  getQueuePositionInBase(): Observable<any> {
    return this.firebaseService.afDB.object(`/drivers/${this.identityService.userId}/in_base_position`).valueChanges();
  }

  /**get incoming travel data from server */
  getIncomingTripData(travelId: number) {
    var parameters = <IIncomingTripDataCommandParameters>{
      //carrierUserId: +this.identityService.carrierUserId,
      carrierId: +this.identityService.carrierUserId,
      driverId: +this.identityService.userId,
      travelId: travelId
    };
    const incomingTripDataCommand = new IncomingTripDataCommand();
    incomingTripDataCommand.setParameters(parameters);

    return this.connectionService
      .Request(incomingTripDataCommand)
      .then(incomingTrip => {
        return incomingTrip;
      })
      .catch(error => {
        throw error;
      });
  }

  /**get current travel data from server */
  getCurrentTripData(travelId: number) {
    var parameters = <ICurrentTripDataCommandParameters>{
      carrierUserId: +this.identityService.carrierUserId,
      travelId: travelId,
      driverId: +this.identityService.userId
    };
    const currentTripDataCommand = new CurrentTripDataCommand();
    currentTripDataCommand.setParameters(parameters);

    return this.connectionService
      .Request(currentTripDataCommand)
      .then((response: CurrentTravelModel) => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  resetCalculateInBaseRange() {
    this.calculating = false;
    clearTimeout(this.calculatingTimeout);
  }

  calculateInBaseRange(lat: number, lng: number) {
    if (this.calculating) {
      return;
    } else {
      this.calculating = true;
      this.calculatingTimeout = setTimeout(() => this.calculating = false,1500);
    }
    const currentLatLng = new google.maps.LatLng(lat, lng);
    let nearestBase = this.identityService.currentBase;

    if (!nearestBase || this.identityService.driverSubState === DriverSubStateEnum.IN_STREET) {
      const bases = this.identityService.carrierPlaces;
      if(!bases) return;

      nearestBase = this.getNeareastBase(bases, currentLatLng);
    }
    const isInRange = this.isInBaseRange(nearestBase, currentLatLng);
    this.calculating = !(this.identityService.currentBase && !isInRange);

    this.identityService.updateCurrentBase(isInRange ? nearestBase : null);

    this.setDriverSubstate.next(isInRange);
  }

  private getNeareastBase(bases: Base[], currentLatLng: google.maps.LatLng): Base {
    const nearestBase = bases.reduce((baseA, baseB) => google.maps.geometry.spherical.computeDistanceBetween(
      currentLatLng,
      new google.maps.LatLng(
        +baseA.locationPlace.latitude,
        +baseA.locationPlace.longitude
      )) <= google.maps.geometry.spherical.computeDistanceBetween(
      currentLatLng,
      new google.maps.LatLng(
        +baseB.locationPlace.latitude,
        +baseB.locationPlace.longitude
      )) ? baseA : baseB
    );

    return nearestBase;
  }

  public getNeareastBaseDistance(currentLatLng: google.maps.LatLng): number {
    const nearestBase = this.getNeareastBase(this.identityService.carrierPlaces, currentLatLng);
    return google.maps.geometry.spherical.computeDistanceBetween(
      currentLatLng,
      new google.maps.LatLng(
        +nearestBase.locationPlace.latitude,
        +nearestBase.locationPlace.longitude
      )
    );
  }

  private isInBaseRange(base: Base, currentLatLng: google.maps.LatLng): boolean {
    const carrierPlace = new google.maps.LatLng(
      +base.locationPlace.latitude,
      +base.locationPlace.longitude
    );
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      currentLatLng,
      carrierPlace
    );

    return distance < +this.identityService.getBaseScope();
  }

  private isInrangePickUp(lat: number, lon: number, ratio: number): boolean {
    const currentPlace = new google.maps.LatLng(+lat, +lon);
    const pickupPlace = new google.maps.LatLng(
      +this.travelService.currentTravel.fromLat,
      +this.travelService.currentTravel.fromLong
    );
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      currentPlace,
      pickupPlace
    );

    try {
      this.travelService.currentTravel.auditInfo.driverPickupPosition = `{"lat":${pickupPlace.lat()},"lng":${pickupPlace.lng()}}`;
      this.travelService.currentTravel.auditInfo.driverPickupDistance = distance;
    } catch(error) {
      console.log("Error al guardar datos de auditoria");
      console.error(error);
    }

    return distance < ratio;
  }


  public canPickUp(): Promise<boolean> {
    const geoCercaRatio = +this.identityService.getGeocercaRatio();

    if(!geoCercaRatio
      || (this.travelService.currentTravel.usesGeofence !== null
        && this.travelService.currentTravel.usesGeofence !== undefined
        && !this.travelService.currentTravel.usesGeofence)
    ) return Promise.resolve(true);

    return this.navigationService.getCurrentBackgroundPosition()
      .then(location => {
        return this.isInrangePickUp(
            +location.coords.latitude,
            +location.coords.longitude,
            geoCercaRatio
          );
      }).catch(err => {
        return false;
      });

  }

  getDriverStatusRTDB(): Observable<any> {
    return this.firebaseService.afDB.object(`/driver_status/${this.identityService.carrierUserId}/${this.identityService.userId}/status`).valueChanges();
  }
}
