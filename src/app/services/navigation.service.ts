import { AppSettings } from "../services/app-settings";
import { ConnectionServices } from "./connection/connection.service";
import { PlaceModel } from "./../models/place.model";
import { Injectable, ElementRef } from "@angular/core";
import { AlertsService } from "./common/alerts.service";

import { IdentityService } from "./identity.service";
import { ReportNumericLocationCommand } from "./connection/command/reportNumericLocation";
import { TranslateService } from "@ngx-translate/core";
import { DriverStateEnum } from './enum/driver-state.enum';
import { TravelService } from './travel.service';
import { StatusService } from './status.service';
import { TravelStatusEnum } from './enum/travelStatus';
import { Observable } from 'rxjs';
import { StorageService } from "./storage/storage.service";
import { StorageKeyEnum } from "./storage/storageKeyEnum.enum";
import { RouteWaypointModel } from "../models/routeWaypoint.model";
import { AlertController, Platform } from "@ionic/angular";
import { LaunchNavigator, LaunchNavigatorOptions } from '@awesome-cordova-plugins/launch-navigator/ngx';
import BackgroundGeolocation, { Config, GeofenceEvent, HeartbeatEvent } from "cordova-background-geolocation";


declare var google;
//const emailLogger = 'pablorodriguez@uxorit.com';


@Injectable({providedIn:'root'})
export class NavigationService {
  private travelService: TravelService;
  private statusService: StatusService;
  private logger: any;
  private loggerMode = 'DEBUG';
  private lastPosition = {
    latitude: null,
    longitude: null,
  };

  private geofencesList: {
    id: string;
    inside: boolean;
  }[] = [];

  constructor(
    private launchNavigator: LaunchNavigator,
    private alertService: AlertsService,
    private identityService: IdentityService,
    private connectionService: ConnectionServices,
    private alertController: AlertController,
    private translateService: TranslateService,
    private storageService: StorageService,
    private platform: Platform
  ) {

   /* BackgroundGeolocation.configure({
      postTemplate: {
        lat: '@latitude',
        lon: '@longitude',
        foo: 'bar' // you can also add your own properties
      }
    });*/
  }


  // Set instance of travel service (to evit circle dependency)
  public setTravelService(travelS) {
    this.travelService = travelS;
  }

  // Set instance of status service (to evit circle dependency)
  public setStatusService(statusS) {
    this.statusService = statusS;
  }

  public redirectToGoogle(origen: string, destino: string) {
    let options: LaunchNavigatorOptions = {
      //start: origen,

      appSelection: {
        list: [
          this.launchNavigator.APP.GOOGLE_MAPS,
          this.launchNavigator.APP.WAZE,
          this.launchNavigator.APP.APPLE_MAPS,
          this.launchNavigator.TRANSPORT_MODE.DRIVING,
        ],
        dialogHeaderText: "Seleccione app para navegar",
      },
    };

    this.launchNavigator.navigate(destino, options).then(
      (success) => {},
      (error) => {
        this.alertService.show(
          "Atención",
          "Hay dificultades al seleccionar el servicio"
        );
      }
    );
  }

  public goToNavigationApps(destination: string, app: string): Promise<any> {
    const options: LaunchNavigatorOptions = { app };

    return this.launchNavigator.navigate(destination, options);
  }

  public getAvailableApps(): Promise<string[]> {
    return this.launchNavigator
      .availableApps()
      .then((apps) => {
        const appsSupportedByMagiis = [
          this.launchNavigator.APP.GOOGLE_MAPS,
          this.launchNavigator.APP.WAZE,
          this.launchNavigator.APP.APPLE_MAPS,
        ];
        const availableApps = Object.keys(apps).filter(
          (key) =>
            apps.hasOwnProperty(key) &&
            apps[key] &&
            appsSupportedByMagiis.includes(key)
        );

        return availableApps;
      })
      .catch((error) => {
        throw error;
      });
  }


  public determineApp(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.identityService.getPreferredNavigationApp().then((app) => {
        if (app) return resolve(app);
        else {
          this.getAvailableApps()
            .then(async (apps) => {
              let alertOptions: any = {
                header: '',
                inputs: [],
                buttons:[]
              };

              alertOptions.header = this.translateService.instant(
                'navigation_app_dialog.label_title'
              );

              apps.forEach((app, index) => {
                alertOptions.inputs.push({
                  type: 'radio',
                  label: this.launchNavigator.getAppDisplayName(app),
                  value: app,
                  checked: index === 0,
                });
              });

              alertOptions.buttons.push({
                text: this.translateService.instant(
                  'navigation_app_dialog.label_btn_cancel'
                ),
                handler: (cancel) => {
                  return reject('El usuario cancelo la acción.');
                },
              });
              alertOptions.buttons.push({
                text: this.translateService.instant(
                  'navigation_app_dialog.label_btn_ok'
                ),
                handler: (appSelected) => {
                  this.identityService.setPreferredNavigationApp(appSelected);
                  return resolve(appSelected);
                },
              });

              const alertRef = await this.alertController.create(alertOptions);

              alertRef.present();
            })
            .catch((error) => {
              this.logAdmin('Error al obtener apps disponibles ' + error);
              return reject('Error al obtener apps disponibles');
            });
        }
      });
    });
  }
  /* BACKGROUND GEOLOCATION */

  /** Initialize Transistorsoft BackgroundGeolocation */
  public initializeBackgroundGeolocation() {
    console.warn("INICIALIZO BACKGROUNDGEOLOCATION");
    BackgroundGeolocation.ready(
      this.getBackgroundGeolocationConfig(),
      (state) => {
        if (!state.enabled) {
          BackgroundGeolocation.onLocation(this.onLocation.bind(this));
          BackgroundGeolocation.onHeartbeat(this.onHeartbeat.bind(this));
          BackgroundGeolocation.onGeofence(this.onGeofence.bind(this));
          BackgroundGeolocation.onHttp(httpEvent => {
            console.log('[http] => ', httpEvent)
          });
          this.logAdmin("BackgroundGeolocation ready => !state.enabled");
          this.startMoving();
        } else {
          this.logAdmin("BackgroundGeolocation ready => already state.enabled");
        }
      }

    );
  }

  /** BackgroundGeolocation Settings */
  getBackgroundGeolocationConfig() {
    //let device = (<any>window).device;
    let config: Config = {
      reset: true,
      debug: false,
      logLevel: BackgroundGeolocation.LOG_LEVEL_ERROR,
      logMaxDays: 1,
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 15,
      stopOnTerminate: true,
      startOnBoot: false,
      notification: {
        title: this.translateService.instant(
          "notifications.geolocation_active.title"
        ),
        text: this.translateService.instant(
          "notifications.geolocation_active.text"
        ),
      },
      foregroundService: true,
      heartbeatInterval: 60,
      preventSuspend: true,
      disableElasticity: true,
      autoSync: true,
      url: AppSettings.Url+
        "drivers/"+
        this.identityService.userId+
        "/reportNumericLocation/"+
        (this.travelService.currentTravel.travelId ? this.travelService.currentTravel.travelId : '0'),
      locationTemplate:'{ "latitude":<%= latitude %>, "longitude":<%= longitude %>, "accuracy":<%= accuracy %> }',
      geofenceTemplate:'{ "latitude":<%= latitude %>, "longitude":<%= longitude %>, "accuracy":<%= accuracy %> }',
      headers: { Authorization: "Bearer " + this.connectionService.getToken() },
      maxRecordsToPersist: 1,
      locationAuthorizationRequest: 'Always',
      backgroundPermissionRationale: {
        title: this.translateService.instant("notifications.geolocation_allow.title"),
        message: this.translateService.instant("notifications.geolocation_allow.message"),
        positiveAction: this.translateService.instant("notifications.geolocation_allow.accept"),
        negativeAction: this.translateService.instant("notifications.geolocation_allow.cancel")
      }
    };

    return config;
  }

  onLocation(location: any) {
    console.log("[location] -", location);
    let distanceWithLastSavedLocation = this.distanceBetweenCoordinates(location.coords, this.lastPosition);

    if (
      this.identityService.driverState != DriverStateEnum.OFFLINE &&
      location.coords.accuracy <= 20 && // dejar en <= 20 para que tenga mejor precision de la localizacion
      location.coords.speed.valueOf() > 0 && // a veces se reciben varios puntos de una misma ubicacion con velocidad 0 y a veces el gps devuelve velocidad -1 con un accuracy < a 20 con una ubicacion que no tiene que ver con la que esta.
      !location.sample &&
      !location.event
    ) {
      if(
        this.travelService.currentTravel.travelStatus == TravelStatusEnum.travelInProgress &&
        (distanceWithLastSavedLocation == -1 || distanceWithLastSavedLocation >= 15)
      ) {


          this.travelService.setWaypoint(
            location.coords.latitude,
            location.coords.longitude,
            location.timestamp
          );

          this.lastPosition = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          this.logAdmin("Localización guardada");

      }
    }
  }

  onHeartbeat(heartbeat: HeartbeatEvent) {
    this.logAdmin("[heartbeat] -"+ JSON.stringify(heartbeat.location));
  }

  onGeofence(geofence: GeofenceEvent): void {
    const element = this.geofencesList.find(
      (gF) => gF.id === geofence.identifier
    );

    if (!element) {
      this.logAdmin(
        `[onGeofence] Identifier not found: [${geofence.identifier}]`
      );
    } else {
      this.logAdmin( '[onGeofence] element detected: '+JSON.stringify(element)+'-'+geofence.action);
      element.inside = geofence.action !== "EXIT";
    }
  }

  /** Start position tracking (BackgroundGeolocation) */
  startPositionTracking() {
    BackgroundGeolocation.getState().then((state) => {
      console.log('start', state);
      
      if (!state.enabled) {
        BackgroundGeolocation.setConfig(this.getBackgroundGeolocationConfig(),
        (success) => {
          this.logAdmin("Starting position tracking...");
          BackgroundGeolocation.start();
        },
        (failure) => {
          this.logAdmin('BackgroundGeolocation failure');
        });
      }
    });
  }

  /** Stop position tracking (BackgroundGeolocation) */
  stopPositionTracking() {
    this.logAdmin("Stopping position tracking...");
    BackgroundGeolocation.stop();
  }

  /** Set if driver is moving (BackgroundGeolocation) */
  startMoving() {
    BackgroundGeolocation.changePace(true, function () {});
  }

  /** Set if driver stopped moving (BackgroundGeolocation) */
  stopMoving() {
    BackgroundGeolocation.changePace(false, function () {});
  }

  /** getCurrentPosition once returning a PlaceModel */
  public getCurrentPosition(): Promise<PlaceModel> {
    return this.getCurrentBackgroundPosition()
      .then((location:any) => {
        let place: PlaceModel = new PlaceModel();
        place.latitude = location.coords.latitude.toString();
        place.longitude = location.coords.longitude.toString();

        return place;
      })
      .catch((error) => error);
  }

  /** This method instructs the native code to fetch exactly one location using maximum power & accuracy. */
  public getCurrentBackgroundPosition() {
    if(
      !this.travelService.currentTravel ||
      this.travelService.currentTravel.travelStatus !== TravelStatusEnum.travelInProgress ||
      this.travelService.isStreetPassengerTravel
    ) {
      return BackgroundGeolocation.getCurrentPosition({
        timeout: 10, // 30 second timeout to fetch location
        maximumAge: 5000, // Accept the last-known-location if not older than 5000 ms.
        desiredAccuracy: 20, // Try to fetch a location with an accuracy of `10` meters.
        samples: 3, // How many location samples to attempt.
      });
    } else {
      return Promise.resolve(null);
    }
  }

  // Devuelve la posicion actual, independientemente del estado del viaje, chofer, etc.
  public getActualPosition() {
    return BackgroundGeolocation.getCurrentPosition({
      timeout: 10, // 10 second timeout to fetch location
      maximumAge: 5000, // Accept the last-known-location if not older than 5000 ms.
      desiredAccuracy: 20, // Try to fetch a location with an accuracy of `20` meters.
      samples: 3, // How many location samples to attempt.
    });
  }

  /**
   * Crea un Geofence.
   * @param id {string}
   * @param radius {number}
   * @param location {PlaceModel}
   * @param notifyOnEntry {boolean}
   * @param notifyOnExit {boolean}
   * @param additionalData {Object}
   */
  public async addGeofence(
    id: string,
    location: PlaceModel,
    radius: number = 999999,
    notifyOnEntry: boolean = true,
    notifyOnExit: boolean = true,
    additionalData: any = {}
  ): Promise<any> {
    return await BackgroundGeolocation.addGeofence({
      identifier: id.toString(),
      radius: radius === null ? 999999 : radius,
      latitude: +location.latitude,
      longitude: +location.longitude,
      notifyOnEntry,
      notifyOnExit,
      extras: Object.assign({}, additionalData),
    })
      .then((success) => {
        console.info("[Geofence] addGeofence SUCCESS (navigationService)");
        this.geofencesList.push({
          id: id.toString(),
          inside: false,
        });
        return success;
      })
      .catch((error) => {
        console.error("[Geofence] addGeofence FALIURE(navigationService): ", error);
        return error;
      });
  }

  /**
   * Elimina un Geofence por su identificador.
   * @param identifier {string} Identificador de geofence.
   */
  public async removeGeofence(identifier: string) {
    return await BackgroundGeolocation.removeGeofence(identifier.toString())
      .then((success) => {
        console.info("[Geofence] remove SUCCESS");
        this.geofencesList = this.geofencesList.filter(
          (geofence) => geofence.id !== identifier.toString()
        );
        return success;
      })
      .catch((error) => {
        console.error("[Geofence] remove FAILURE: ", error);
        return error;
      });
  }

  public inGeofence(identifier: string): boolean {
    const element = this.geofencesList.find(
      (e) => e.id === identifier.toString()
    );
    this.logAdmin("[Geofence]->inGeofence "+JSON.stringify(element));
    console.log("[Geofence]->inGeofence", this.geofencesList);
    return (element ? element.inside : false); //Manejo el indefinido en caso que no encuentre el id dentro de la lista.
  }

  /** Send current driver position to backend log */
  sendNumericLocation(location: any): Promise<any> {
    const reportNumericLocationCommand = new ReportNumericLocationCommand();
    reportNumericLocationCommand.setUrlParameters(this.identityService.userId);
    reportNumericLocationCommand.addCommandBody({
      location: location.coords,
      geofence: location.coords,
      fromId: this.travelService.currentOrigin
        ? this.travelService.currentOrigin.id
        : null,
      segmentNumber: this.travelService.currentTravel.currentSegment
        ? this.travelService.currentTravel.currentSegment
        : null,
    });

    return this.connectionService
      .Request(reportNumericLocationCommand)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        throw error;
      });
  }

  // Purificacion de errores en puntos obtenidos de GPS-------------------------------------------
  //DEPRECATED: Se usa el ROSA method
  public purifyWaypoints() {
    let deletedWaypoints = [];
    if(this.travelService.currentTravel.routeWaypoints != null && this.travelService.currentTravel.routeWaypoints.length > 0) {
      try {
        this.logAdmin("Depurando waypoints. Waypoints originales:"+ JSON.parse(JSON.stringify(this.travelService.currentTravel.routeWaypoints)));
      } catch(err) {
        console.error(err);
      }

      try {
        for(let i = 1; i < (this.travelService.currentTravel.routeWaypoints.length - 1); i++) {
          const previousWaypoint = this.travelService.currentTravel.routeWaypoints[i-1].location;
          const currentWaypoint = this.travelService.currentTravel.routeWaypoints[i].location;
          const nextWaypoint = this.travelService.currentTravel.routeWaypoints[i+1].location;

          const previousAndNextDistance = this.distanceBetweenCoordinates(
            {latitude: previousWaypoint.lat, longitude: previousWaypoint.lng},
            {latitude: nextWaypoint.lat, longitude: nextWaypoint.lng},
          );
          const previousAndCurrentDistance = this.distanceBetweenCoordinates(
            {latitude: previousWaypoint.lat, longitude: previousWaypoint.lng},
            {latitude: currentWaypoint.lat, longitude: currentWaypoint.lng},
          );
          if(previousAndNextDistance <= previousAndCurrentDistance) {
            deletedWaypoints.push(this.travelService.currentTravel.routeWaypoints[i]);
            this.travelService.currentTravel.routeWaypoints.splice(i, 1);
            i--;
          }
        }
      } catch(err) {
        console.error(err);
      }

      try {
        this.logAdmin("Waypoints eliminados:" + deletedWaypoints);
        this.logAdmin("Waypoints finales:" + JSON.parse(JSON.stringify(this.travelService.currentTravel.routeWaypoints)));
      } catch(err) {
        console.error(err);
      }
    } else {
      this.logAdmin("El viaje no tiene puntos guardados");
    }
  }


/**
   * devuelve el angulo (en Grados) representados entre 2 puntos (lat,lng)
   * @param lat1
   * @param long1
   * @param lat2
   * @param long2
   * @returns Angulo en grados entre los dos puntos pasados por parametros.
   */
 private angleFromCoordinate(lat1, long1, lat2, long2) {
  const dLon = (long2 - long1);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = Math.atan2(y, x);
  const degrees = brng * 180 / Math.PI;
  const rsta = (degrees + 360) % 360;
  return Math.round(rsta);
}


/**
 * sirve para determinar si un vehiculo yendo en una direccion reporta un punto en una direccion totalmente opuesta.
 * @param previousDegrees
 * @param currentDegrees
 * @returns FALSE= si los grados de un angulo (currentDegrees) esta totalemnte opuesto a otro angulo (previousDegrees)
 */
private validateDirection(previousDegrees, currentDegrees){
  const maxDgr = 210;
  const minDrg = 150;
  const diffAngles = Math.abs(currentDegrees - previousDegrees);
  return !(diffAngles>=minDrg && diffAngles<=maxDgr)
}

/**
 * Valida si la direccion en la que se estaba avanzando es la misma con una diferencia de + - 15 grados.
 * @param previousDirection
 * @param currentDirection
 * @param angle
 * @returns True: en caso que la direccion sea la misma, False: se tiene un desvio mayor al angulo pasado por parametro
 */
private perfectDirection(previousDirection, currentDirection, angle){
  const validAngleDirection = angle;
  const diffAngles = Math.abs(currentDirection - previousDirection) % 360; //Ejemplo: 112° y 114°
  const diffAngles1 = Math.abs(Math.abs(currentDirection - previousDirection)-360) % 360; // Ejemplo: 2° y 358°
  return (diffAngles<=validAngleDirection || diffAngles1<=validAngleDirection);
}

/**  Valida 2 situaciones
*   Caso 1: Direccion esta en un angulo similar al que venia el vehiculo (+-30°)
*           Y la distancia con el ultimo punto valido es como maximo 4 veces la distancia tolerada
*   Caso 2: La distancia con el ultimo punto valido esta dentro del margen tolerado
*           Y la direccion en la que se dirige el vehiculo no esta totalmente opuesta.
*   Caso 3: Direccion esta en un angulo similar al que venia el vehiculo (+-14°)
*           Y la distancia con el ultimo punto valido es como maximo 10 veces la distancia tolerada
*   Caso 4: Varios puntos con error a iniciar una vuelta.
*   Si se cumple 1 o 2 el currentPoint es correcto.
* @param pivotAndCurrentDistance
* @param validQtyPoints
* @param mtsBetweenPoints
* @param previousDirection
* @param currentDirection
* @returns True: si se cumplen alguno de los 3 casos. False: Caso contrario
*/
private validDirectionAndDistance(pivotAndCurrentDistance, validQtyPoints, mtsBetweenPoints, previousDirection, currentDirection, applyDirection){
  let case1 = (this.perfectDirection(previousDirection, currentDirection,135) && pivotAndCurrentDistance <= ((validQtyPoints)*mtsBetweenPoints)); //direccion en angulo actual, y maximo de distancia entre puntos +4
  let case2 = (pivotAndCurrentDistance <= ((validQtyPoints)*mtsBetweenPoints) && this.validateDirection(previousDirection,currentDirection)); //maxima distancia tolerable y angulo y cuadrante no opuesto.
  let case3 = (this.perfectDirection(previousDirection, currentDirection,14) && pivotAndCurrentDistance <= ((validQtyPoints+10)*mtsBetweenPoints)); //direccion en angulo perfecto, y maximo de distancia entre puntos +10.
  let case4 = (!applyDirection && (pivotAndCurrentDistance <= mtsBetweenPoints)); //varios puntos con error a la vuelta.
  return case1 || case2 || case3 || case4;
}

//ROSA Method to purify Waypoints without route
public sanatizeWaypointsROSA():boolean{
  try{
    this.travelService.currentTravel.sortedRouteWaypoints = [...this.travelService.currentTravel.routeWaypoints];
    this.travelService.currentTravel.origRouteWaypoints = [...this.travelService.currentTravel.sortedRouteWaypoints];
    // Ordenamos los puntos generados por el transistor en forma ascendente por fecha y hora registracion transistor
    this.orderTransistorPointsByTimestamp();
    // Borramos los puntos anteriores a la fecha y hora del pick up del viaje
    this.deletePointsBeforeTravelDate(this.travelService.pickUpPoint.timestamp);
  } catch(err){
    console.error("Ocurrio un error al sanatizar los puntos del viaje: " + err);
  }

  let useDistanceMatrix = false;          // Se usa para determinar si los puntos son suficientes o necesito llamar a Distance Matrix
  let vm = this.travelService.currentTravel;

  if(vm.sortedRouteWaypoints != null && vm.sortedRouteWaypoints.length > 1) {

    const totalRouteWaypoints = vm.sortedRouteWaypoints.length;
    //Inicializo variables de control.
    let i, pivot = 0;                      // Punto base valido con el que comienzo a analizar
    let lastValidPivot = 0;                // Ultimo pivot valido que uso para analizar
    let qtyAnalize = 3;                    // Lote de puntos que voy a analizar
    let pointsToAnalize = qtyAnalize;      // Puntos a tomar en cada ciclo.
    let validQtyPoints = 0;                // Puntos validos procesacos en un ciclo
    let mtsBetweenPoints = 35;             // Rango de aceptacion de puntos +- 35mts
    let shiftError = 0;                    // Cantidad de errores
    let previousDirection;                 // Angulo de direccion en que se dirigia el vehiculo
    let depuratedRoutePoints = [];         // Arreglo de puntos depurados.
    let firstInvalidPoint = 0;             // Nro de orden primer punto invalido
    let invalidPoints = 0;                 // Puntos invalidos desde el ultimo valido
    let compareAngle = true;               // Sirve para determinar si aplica el caso 4 de validDirectionAndDistance
    let errorDrirection = false;           // En caso que haya 2 o mas de un puntos con error, se usa para ver si la direccion entre ellos es correcta.
    let currErrorDirection, prevErrorDirection; //Se usa para calcular el errorDrirection.
    let prevAndCurrDistance=0;             // Distancia entre el punto actual y el anterior.
    //let pickUpPoint = new RouteWaypointModel({"lat":Number.parseFloat(vm.origin.latitude),"lng":Number.parseFloat(vm.origin.longitude)},1,1, vm.startTravelTime.toISOString()); //Agrego el pickup a la ruta.


    try {
        //vm.sortedRouteWaypoints.unshift(pickUpPoint); //Pick up point se guarda en confirm() (navigation.service.ts) por pedido de Gustavo


        //Inicializo el previo
        previousDirection = this.angleFromCoordinate(vm.sortedRouteWaypoints[0].location.lat, vm.sortedRouteWaypoints[0].location.lng,
                                                     vm.sortedRouteWaypoints[1].location.lat, vm.sortedRouteWaypoints[1].location.lng);

        //Inicializo arreglo de puntos depurados con el primer punto siempre valido.
        depuratedRoutePoints.push(vm.sortedRouteWaypoints[0]);

        //Ciclo por todos los puntos del arreglo.
        while (pivot + shiftError < (totalRouteWaypoints - 1)) {

              // Evaluo cuantos puntos tengo para analizar antes de llegar al final del vector
              if (totalRouteWaypoints - pivot <= (qtyAnalize*2-1))
                  pointsToAnalize = totalRouteWaypoints - pivot
              else
                  pointsToAnalize = qtyAnalize;

              // tomo punto de referencia (pivot)
              const pivotWaypoint = vm.sortedRouteWaypoints[pivot].location;

              // inicializo los puntos validos procesados en el ciclo
              validQtyPoints = 1

              // Recorro los puntos y verifico si estan por debajo de la media - esos son los que quedan.
              for(i = pivot + 1 + shiftError ; i < pivot + pointsToAnalize + shiftError && i < totalRouteWaypoints ; i++) {
                  const currentWaypoint = vm.sortedRouteWaypoints[i].location; //Punto a comparar
                  const previusWaypoint = vm.sortedRouteWaypoints[lastValidPivot].location; // Punto previo al actual
                  const pivotAndCurrentDistance = this.distanceBetweenCoordinates(
                      {latitude: pivotWaypoint.lat, longitude: pivotWaypoint.lng},
                      {latitude: currentWaypoint.lat, longitude: currentWaypoint.lng},
                  );

                  //Calculo angulo de direccion en que circula el vehiculo
                  const currentDirection = this.angleFromCoordinate(previusWaypoint.lat, previusWaypoint.lng, currentWaypoint.lat, currentWaypoint.lng);

                  if (this.validDirectionAndDistance(pivotAndCurrentDistance, validQtyPoints, mtsBetweenPoints, previousDirection, currentDirection,compareAngle)) {
                      depuratedRoutePoints.push(vm.sortedRouteWaypoints[i]);
                      this.logAdmin(pivot+','+i+','+((validQtyPoints)*mtsBetweenPoints)+' P:' +previousDirection+'° C:'+currentDirection+'°'+Math.round(pivotAndCurrentDistance)+ ' FIP: '+firstInvalidPoint+' IPN:'+invalidPoints+' OK');
                      validQtyPoints ++;
                      lastValidPivot = i;
                      invalidPoints = 0;
                      firstInvalidPoint = 0;
                      previousDirection = currentDirection;
                      compareAngle = true;
                  } else {
                      //Cuento la cantidad de puntos invalidos desde el ultimo punto valido.
                      prevAndCurrDistance = this.distanceBetweenCoordinates({latitude: vm.sortedRouteWaypoints[i-1].location.lat, longitude: vm.sortedRouteWaypoints[i-1].location.lng},
                        {latitude: currentWaypoint.lat, longitude: currentWaypoint.lng});

                      if (invalidPoints >= 1){
                        //Calcular los vectores de i-2 a i-1 vs i-1 a i
                        prevErrorDirection = this.angleFromCoordinate(vm.sortedRouteWaypoints[i-2].location.lat, vm.sortedRouteWaypoints[i-2].location.lng,
                                                                      vm.sortedRouteWaypoints[i-1].location.lat, vm.sortedRouteWaypoints[i-1].location.lng);

                        currErrorDirection = this.angleFromCoordinate(vm.sortedRouteWaypoints[i-1].location.lat, vm.sortedRouteWaypoints[i-1].location.lng,
                                                                      vm.sortedRouteWaypoints[i].location.lat, vm.sortedRouteWaypoints[i].location.lng);

                        errorDrirection =  this.validDirectionAndDistance(prevAndCurrDistance, 2, mtsBetweenPoints, prevErrorDirection, currErrorDirection,true);
                      } else {
                        errorDrirection = (prevAndCurrDistance<=mtsBetweenPoints);
                      }

                      if (errorDrirection){
                        invalidPoints++;
                        if (invalidPoints == 1)
                           firstInvalidPoint = i;
                      } else {
                        firstInvalidPoint = i;
                        invalidPoints = 0;
                      }

                      this.logAdmin(pivot+','+i+','+((validQtyPoints)*mtsBetweenPoints)+' P:' +previousDirection+'° C:'+currentDirection+'°'+Math.round(pivotAndCurrentDistance)+ ' FIP: '+firstInvalidPoint+' IPN:'+invalidPoints+'  ERR');

                      //Si sumo mas de 5 seguidos tomo como valido el primero de ellos y reproceso.(estoy en un hueco)
                      if (invalidPoints>=5) {
                        depuratedRoutePoints.push(vm.sortedRouteWaypoints[firstInvalidPoint]);
                        lastValidPivot = firstInvalidPoint;
                        invalidPoints = 0;
                        firstInvalidPoint = 0;
                        compareAngle = false;

                        //VErifico distancia entre firstInvalidPoint y anterior no haya un hueco de mas de 2000mts
                        /* const prevLastDepurated = { "latitude": depuratedRoutePoints[depuratedRoutePoints.length-2].location.lat, "longitude": vm.sortedRouteWaypoints[depuratedRoutePoints.length-2].location.lng};
                        const lastDepurated = { "latitude": depuratedRoutePoints[depuratedRoutePoints.length-1].location.lat, "longitude": vm.sortedRouteWaypoints[depuratedRoutePoints.length-1].location.lng};
                        if (this.distanceBetweenCoordinates(prevLastDepurated, lastDepurated)>=2000)
                            useDistanceMatrix= true; //Al menos un hueco tiene mas de 2000 metros.*/
                      }

                      if (i >= (totalRouteWaypoints - 1))
                         lastValidPivot = totalRouteWaypoints
                      else
                         break;
                  }

              }
              //Desplazo el inicio del proximo ciclo en la cantidad de errores que aparecieron despues del ultimo OK.
              if (pivot == lastValidPivot)
                 shiftError ++;
              else
                 shiftError = 0;

              //Actualizo pivot con el ultimo valido
              pivot = lastValidPivot;
          }

    } catch(err) {
        this.logAdmin('error en:'+i);
        console.error(err);
    }

    //Si tuve que depurar mas de un 10% debo usar DitanceMatrix
    if((depuratedRoutePoints.length/totalRouteWaypoints) < 0.8){
      useDistanceMatrix = true;
    }
    console.log("Puntos insuficientes",totalRouteWaypoints, depuratedRoutePoints.length, useDistanceMatrix);

    vm.sortedRouteWaypoints = [];
    vm.sortedRouteWaypoints = [...depuratedRoutePoints];

    //Logueo Final de arreglo filtrado
    try {
       for(let s=0; s < depuratedRoutePoints.length; s++)
         console.log(s+','+depuratedRoutePoints[s].location.lat + ',' +depuratedRoutePoints[s].location.lng);
    } catch(err) {
        console.error(err);
    }

  } else {
    this.logAdmin("El viaje no tiene puntos guardados o solo 1 punto");
    useDistanceMatrix = true;
  }

  // Le agregamos el punto destino a los waypoints en caso de que el ROSA lo haya eliminado
  if(this.travelService.currentTravel.sortedRouteWaypoints && this.travelService.currentTravel.sortedRouteWaypoints.length>-1){
    this.travelService.currentTravel.sortedRouteWaypoints.push(
      new RouteWaypointModel(
        {
          lat: Number(this.travelService.currentTravel.finalDestination.latitude),
          lng: Number(this.travelService.currentTravel.finalDestination.longitude)
        },
        this.travelService.currentTravel.currentSegment ? this.travelService.currentOrigin.id : null,
        this.travelService.currentTravel.currentSegment,
        new Date().toISOString()
      )
    );
  }

  if(useDistanceMatrix == false){
    // Solo en el caso de que ROSA no haya indicado el uso de distancematrix hacemos una ultima validacion
    // Esto sirve para controlar los casos donde, por ejemplo, el gps registro puntos solo durante los primeros metros del viaje
    if(this.travelHasEnoughPoints(this.travelService.currentTravel.sortedRouteWaypoints)){
      useDistanceMatrix = false;
    } else {
      useDistanceMatrix = true;
    }
  }

  return useDistanceMatrix;
}

  travelHasEnoughPoints(locations){
    // Check if travel has the minimun quantity of points according to distance
    if(locations && locations.length>0){
      let distance        = 0;
      let minPointsByKM   = 50; // Cantidad de puntos minimos que debe haber cada 1 km
      for(let i=0;i<locations.length-1;i++){
        const distanceBetweenCoordinates = this.distanceBetweenCoordinates(
          {latitude: locations[i].location.lat, longitude: locations[i].location.lng},
          {latitude: locations[i+1].location.lat, longitude: locations[i+1].location.lng},
        );
        distance+= distanceBetweenCoordinates;
      }

      if(locations.length / (distance / 1000) > minPointsByKM){
        // Tenemos mas de minPointsByKM por kilometro
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }



  public logAdmin(dataLog:String){
    try{
      if (this.loggerMode == 'DEBUG')
        console.log(dataLog);
      else if (this.loggerMode == 'PRODDEBUG')
        console.log(dataLog);
        // BackgroundGeolocation.logger.error((new Date())+" - "+dataLog);
    }catch(err){
      console.error(err);
    }
  }

 /* TODO: Agregar envio de emails con logs registrados en el ultimo dia.
   public sendLogEmail(){
    return this.logger.emailLog(emailLogger).then((success) => {
      console.log("[emailLog] success");
      return true;
    }).catch((error) => {
      console.log("[emailLog] FAILURE: ", error);
      return false;
    });
  }*/

  /* Google maps */

  public loadMap(
    latitude: number,
    longitude: number,
    mapElement: ElementRef
  ): Observable<any> {
    let latLng = new google.maps.LatLng(latitude, longitude);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      streetViewControl: false,
      mapTypeControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };
    return Observable.create(function (observer) {
      observer.next(new google.maps.Map(mapElement.nativeElement, mapOptions));
    });
  }

  //Load a map with center in latLng
  public loadMapCenter(mapElement: ElementRef, latLng: any): Observable<any> {
    let mapOptions = {
      center: latLng,
      zoom: 15,
      streetViewControl: false,
      mapTypeControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };
    return Observable.create(function (observer) {
      observer.next(new google.maps.Map(mapElement.nativeElement, mapOptions));
    });
  }

  /** HELPERS */

  degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  distanceBetweenCoordinates(location1, location2) {
    let result = -1;
    if(location1.latitude && location1.longitude && location2.latitude && location2.longitude) {
      let earthRadiusM = 6371000;

      let dLat = this.degreesToRadians(location2.latitude-location1.latitude);
      let dLon = this.degreesToRadians(location2.longitude-location1.longitude);

      let lat1 = this.degreesToRadians(location1.latitude);
      let lat2 = this.degreesToRadians(location2.latitude);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      result = earthRadiusM * c;
    }

    return result;
  }

  checkBatterySavingMode(): void {

    let isEnabledStorage: boolean;
    let isEnabledBG: boolean;

    setInterval(async () => {
      isEnabledStorage = await this.storageService.getData(StorageKeyEnum.isPowerSaveMode);
      if (!this.platform.is('desktop') && !this.platform.is('mobileweb')) {
        isEnabledBG = await BackgroundGeolocation.isPowerSaveMode();
      }else{
        isEnabledBG = false;
      }

      /* Save var in Local Storage**/
      if (isEnabledStorage !== isEnabledBG) this.storageService.setData(StorageKeyEnum.isPowerSaveMode, isEnabledBG);

      /* Show toast when in battery saving mode**/
      await this.createAlert(isEnabledBG)

    }, 5000);
  }

  async createAlert(isEnable: boolean): Promise<void> {

    if(!isEnable) {
      if (this.alertService.showingMessage) this.alertService.showingMessage = false;
      return;
    }

    const confirmAction = () => {
      this.alertService.clear();
      this.alertService.showingMessage = false;
    };

    if(!this.alertService.showingMessage) {

      this.alertService.dialog(
        this.translateService.instant('alerts.alert_saving_mode_title'),
        this.translateService.instant('alerts.alert_saving_mode_text'),
        this.translateService.instant('buttons.ok'),
        null,
        confirmAction,
        null
      );
    }

    isEnable && this.alertService.dialog(
      this.translateService.instant('alerts.alert_saving_mode_title'),
      this.translateService.instant('alerts.alert_saving_mode_text'),
      this.translateService.instant('buttons.ok'),
      null,
      confirmAction,
      null
    );

  }

  getLinearDistance(waypoints: google.maps.LatLng[]): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const lenght = google.maps.geometry.spherical.computeLength(waypoints);
        resolve(lenght);
      } catch(error) {
        resolve(0);
      }
    })
  }

  /* Ordena los puntos capturados por el transistor de forma ascendente por su timestamp*/
  public orderTransistorPointsByTimestamp(): void{
    console.log("Ordenando puntos por timestamp");
    if(!this.travelService.currentTravel.sortedRouteWaypoints){
      this.travelService.currentTravel.sortedRouteWaypoints = [];
      this.travelService.currentTravel.sortedRouteWaypoints.push(this.travelService.pickUpPoint);
    }

    if(this.travelService.currentTravel.sortedRouteWaypoints.length>1){
      this.travelService.currentTravel.sortedRouteWaypoints.sort((a, b) => {
        if(new Date(a.timestamp) < new Date(b.timestamp)) return -1;
        if(new Date(a.timestamp) > new Date(b.timestamp)) return 1;
        return 0;
      });
    }
  }

  /* Limpia el transistors points buffer */
  public async clearTransistorPointsBuffer(): Promise<void>{
    console.log("Limpiando buffer de puntos del transistor");
    return await BackgroundGeolocation.destroyLocations(
      () => {
        console.info("Buffer de transistor eliminados");
      },
      () => {
        console.error("Error al eliminar buffer de transistor");
      }
    );
  }

  /* Elimina los puntos que son anteriores a la fecha indicada
    Al llamar a esta funcion los puntos deben estar ordenados */
  public deletePointsBeforeTravelDate(pickUpDate: string): void{
    console.log("Borrando puntos anteriores a la fecha de inicio del viaje");
    if(this.travelService.currentTravel.sortedRouteWaypoints.length>2){
      let cont = 0;
      let pickupDateDte = new Date(pickUpDate);
      while(new Date(this.travelService.currentTravel.sortedRouteWaypoints[cont].timestamp) < pickupDateDte){
        cont++;
      }
      this.travelService.currentTravel.sortedRouteWaypoints.splice(0, cont);
    }

  }
}
