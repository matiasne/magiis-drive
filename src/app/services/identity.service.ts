
import { Injectable } from '@angular/core';
import { ILogInResponse } from './connection/command/logIn.command';
import { StorageService } from './storage/storage.service';
import { StorageKeyEnum } from './storage/storageKeyEnum.enum';

import { AppSettings, URL } from "./app-settings";
import { DriverSubStateEnum } from './enum/driver-sub-state.enum';
import { AlertsService } from './common/alerts.service';
import { ConnectionServices } from './connection/connection.service';
import { UpdateDriverCommand, IUpdateDriverCommandParameters } from './connection/command/updateDriver.command';
import { PlaceModel } from '../models/place.model';
import { Base } from '../models/base.model';
import { CheckUpdatedVersionCommand, ICheckUpdatedVersionCommandParameters } from './connection/command/check-updated-version.command';
import { ISetOutOfServiceCommandParameters, SetOutOfServiceCommand } from './connection/command/setOutOfService.command';
import { Subject } from 'rxjs';

@Injectable({
    providedIn:'root'
})
export class IdentityService {
    newUser: any;
    private _country = '';
    private _countryCode = '';
    private _userId = '';
    private _email: string;
    private _userImage: string;
    private _fullName: string;
    private _userType: string;
    private _carrierUserId: string = "";
    private _carrierPlace: PlaceModel;
    private _carrierPlaces: Base[];
    private _driverState: string = "";
    public _driverSubState: string = "";
    public _carrierCode: string;
    private _carrierImageLogo: string = "";
    public _carrierName: string;
    private _carrierPhoneNumber: string = "";

    private _telephonePanic: string = "";
    private _telephoneMsg: string = "";
    private _baseScope: string = "";
    private _currentBaseId: number = 0;

    private _operability: boolean = false;
    private _outOfService: boolean = false;
    private _currentCarId: number = 0;
    private _currentCar: string = "";
    private _currentCarType: string = "";
    private _currentBase: Base;
    private _vehicleId: number;
    // Geocerca
    private _geocercaRatio: number = null;

    private showHostCount: number = 0;

    // Navigation App preferences
    private _preferredNavigationApp: string = '';

    constructor(
        private storageService: StorageService,
        private alertService: AlertsService,
        private connectionService: ConnectionServices,
   //     private base64: Base64,
        ) { }

    get currentBase(): Base {
      return this._currentBase;
    }

    set currentBase(base: Base) {
      this._currentBaseId = base ? base.id : 0;
      this._currentBase = base;
    }
    get operability(): boolean {
        return this._operability;
    }
    get outOfService(): boolean {
      return this._outOfService;
  }

    get country(): string {
        return this._country;
    }

    get countryCode(): string {
      return this._countryCode;
    }

    get userId(): string {
        return this._userId;
    }

    get email(): string {
        return this._email;
    }
    public getEmail: Subject<string> = new Subject<string>()

    get fullName(): string {
        return this._fullName;
    }
    public getFullName: Subject<string> = new Subject<string>()
    public get_fullName () {
        return this._fullName;
    }

    get currentCarId(): string {
        return this._currentCar;
    }

    get currentCar(): string {
        return this._currentCar;
    }

    get currentCarType(): string {
        return this._currentCarType;
    }

    public getCurrentCar: Subject<string> = new Subject<string>();

    public getCurrentCarType: Subject<string> = new Subject<string>();

    public getDriverSubstate: Subject<string> = new Subject<string>();

    public getCarrierPlaces: Subject<Base[]> = new Subject<Base[]>();

    public updatePreferences: Subject<void> = new Subject<void>();

    public getCurrentBase: Subject<Base> = new Subject<Base>();

    get userType(): string {
        return this._userType;
    }

    get imageLogo(): string {
        return this._userImage;
    }
    public getImageLogo: Subject<string> = new Subject<string>();

    public setUserImage(filePath: string) {
     /*   this.base64.encodeFile(filePath).then((base64File: string) => {
            this._userImage = base64File;
            this.getImageLogo.next(this._userImage);
            this.updateDriver();
        }, (err) => {
            console.error(err);
        });*/
    }

    get carrierUserId(): string {
        return this._carrierUserId;
    }

    get carrierPlace(): PlaceModel {
        return this._carrierPlace;
    }

    get carrierPlaces(): Base[] {
        return this._carrierPlaces;
    }

    public getCarrierName: Subject<string> = new Subject<string>();
    public carrierName(): string {
        return this._carrierName;
    }

    public getCarrierCode: Subject<string> = new Subject<string>();
    public carrierCode(): string {
        return this._carrierCode;
    }

    get driverState(): string {
        return this._driverState;
    }

    get driverSubState(): string {
        return this._driverSubState;
    }

    get carrierImageLogo(): string {
        return this._carrierImageLogo;
    }
    public getCarrierImageLogo: Subject<string> = new Subject<string>();

    public getCarrierImage(): string {
        return this._carrierImageLogo;
    }

    public getCarrierPhoneNumber(): string {
        return this._carrierPhoneNumber;
    }

    public getTelephonePanic(): string {
        return this._telephonePanic;
    }

    public getTelephoneMsg(): string {
        return this._telephoneMsg;
    }

    public getBaseScope(): string {
        return this._baseScope;
    }

    public getCurrentBaseId(): number {
        return this._currentBaseId;
    }

    public getGeocercaRatio(): number {
      return this._geocercaRatio;
    }

    get vehicleId(): number {
        return this._vehicleId;
    }

    set vehicleId(vehicleId: number) {
        this._vehicleId = vehicleId;
    }
    //save minimum login info to local storage
    public setLoginInfo(loginResponse: ILogInResponse) {
        this.connectionService.setToken(loginResponse.token);
        this.connectionService.setLogUserId(loginResponse.userId);

        this.storageService.setData(StorageKeyEnum.logUserId, loginResponse.userId);
        this.storageService.setData(StorageKeyEnum.tokenUserLogged, loginResponse.token);
    }

    public setUserInfo(
        carrierPhoneNumber: string,
        carrierImageLogo: string,
        driverState: string,
        driverSubState: string,
        carrierUserId: string,
        country: string,
        countryCode: string,
        carrierPlace: PlaceModel,
        userImage: string,
        fullName: string,
        email: string,
        telephonePanic: string,
        telephoneMsg: string,
        baseScope: string,
        currentBaseId: number,
        driverId: string,
        operability: boolean,
        currentCarId: number,
        currentCar: string,
        carrierName: string,
        carrierCode: string,
        currentCarType: string,
        geocercaRatio: number,
        vehicleId: number,
    ): Promise<boolean> {

        this._carrierUserId =  carrierUserId;
        this._driverState =  driverState;
        this._driverSubState =  driverSubState;
        this._country = country;
        this._countryCode = countryCode;
        this._email = email;
        this._userImage = userImage;
        this._fullName = fullName;
        this._currentCarId = currentCarId;
        this._currentCar = currentCar;
        this._carrierCode = carrierCode;
        this._carrierImageLogo = carrierImageLogo;
        this._carrierName = carrierName;
        this._carrierPhoneNumber = carrierPhoneNumber;
        this._carrierPlace = carrierPlace;
        this._telephonePanic = telephonePanic;
        this._telephoneMsg = telephoneMsg;
        this._baseScope = baseScope;
        this._currentBaseId = currentBaseId;
        this._userId = driverId;
        this._operability = operability;
        this._currentCarType = currentCarType;
        this._geocercaRatio = geocercaRatio;
        this._vehicleId = vehicleId;
        this.setValueForMenu();

        //save to local storage
        return new Promise( (resolve, reject) => {
            Promise.all([
                this.storageService.setData(StorageKeyEnum.userId, this._userId),
                this.storageService.setData(StorageKeyEnum.carrierUserId, this._carrierUserId),
                this.storageService.setData(StorageKeyEnum.driverState, this._driverState),
                this.storageService.setData(StorageKeyEnum.driverSubState, this._driverSubState),
                this.storageService.setData(StorageKeyEnum.country, this._country),
                this.storageService.setData(StorageKeyEnum.countryCode, this._countryCode),
                this.storageService.setData(StorageKeyEnum.carrierPlace, JSON.stringify(this._carrierPlace)),
                this.storageService.setData(StorageKeyEnum.email, this._email),
                this.storageService.setData(StorageKeyEnum.userImage, this._userImage),
                this.storageService.setData(StorageKeyEnum.fullName, this._fullName),
                this.storageService.setData(StorageKeyEnum.currentCarId, this._currentCarId),
                this.storageService.setData(StorageKeyEnum.currentCar, this._currentCar),
                this.storageService.setData(StorageKeyEnum.carrierCode, this._carrierCode),
                this.storageService.setData(StorageKeyEnum.carrierImageLogo, this._carrierImageLogo),
                this.storageService.setData(StorageKeyEnum.carrierName, this._carrierName),
                this.storageService.setData(StorageKeyEnum.carrierPhoneNumber, this._carrierPhoneNumber),
                this.storageService.setData(StorageKeyEnum.telephonePanic, this._telephonePanic),
                this.storageService.setData(StorageKeyEnum.telephoneMsg, this._telephoneMsg),
                this.storageService.setData(StorageKeyEnum.baseScope, this._baseScope),
                this.storageService.setData(StorageKeyEnum.currentBaseId, this._currentBaseId),
                this.storageService.setData(StorageKeyEnum.operability, this._operability),
                this.storageService.setData(StorageKeyEnum.outOfService, this._outOfService),
                this.storageService.setData(StorageKeyEnum.currentCarType, this._currentCarType),
                this.storageService.setData(StorageKeyEnum.geocercaRatio, this._geocercaRatio),
            ]).then(r => {
                resolve(null);
            }).catch(error => {
                reject(error);
            });
        });
    }

    public setDriverState(driverState: string){
        this._driverState =  driverState;
        this.storageService.setData(StorageKeyEnum.driverState, this._driverState);
    }

    public setDriverSubState(driverSubState: string){
        this._driverSubState =  driverSubState;
        this.storageService.setData(StorageKeyEnum.driverSubState, this._driverSubState);
    }

    public setOperability(operability: boolean){
        this._operability = operability;
        this.storageService.setData(StorageKeyEnum.operability, this._operability);
    }

    public setOutOfService(outOfService: boolean) {
      if(outOfService != this._outOfService) {
        this._outOfService = outOfService;
        let setOutOfServiceCommand = new SetOutOfServiceCommand();
        setOutOfServiceCommand.setParameters(<ISetOutOfServiceCommandParameters>{
          enabled: outOfService,
          driverUserId: +this._userId,
          carrierUserId: +this._carrierUserId
        })

        return this.connectionService.Request(setOutOfServiceCommand).then(() => {
          this.storageService.setData(StorageKeyEnum.outOfService, this._outOfService);
        })
        .catch(error => {
          throw error;
        })
      } else {
        this._outOfService = outOfService;
        this.storageService.setData(StorageKeyEnum.outOfService, this._outOfService);
      }
    }

    public setCarrierPlaces(bases: Base[]){
        this._carrierPlaces =  bases;
        this.storageService.setData(StorageKeyEnum.carrierPlaces, JSON.stringify(this._carrierPlaces));
        this.getCarrierPlaces.next(this.carrierPlaces);
    }

    public isLogged(): Promise<boolean> {
        return new Promise( (resolve, reject) => {
            Promise.all([
                this.storageService.getData(StorageKeyEnum.tokenUserLogged).then(token => { if(token != null) this.connectionService.setToken(token); }),
                this.storageService.getData(StorageKeyEnum.logUserId).then(logUserId => { if(logUserId != null) this.connectionService.setLogUserId(logUserId); }),
                this.storageService.getData(StorageKeyEnum.userId).then(userId => { if(userId != null) this._userId = userId; }),
                this.storageService.getData(StorageKeyEnum.carrierUserId).then(carrierUserId => { this._carrierUserId = carrierUserId;}),
                this.storageService.getData(StorageKeyEnum.driverState).then(driverState => { this._driverState = driverState; }),
                this.storageService.getData(StorageKeyEnum.driverSubState).then(driverSubState => { this._driverSubState = driverSubState; }),
                this.storageService.getData(StorageKeyEnum.country).then(country => { this._country = country; }),
                this.storageService.getData(StorageKeyEnum.email).then(email => { this._email = email; }),
                this.storageService.getData(StorageKeyEnum.userImage).then(userImage => { this._userImage = userImage; }),
                this.storageService.getData(StorageKeyEnum.fullName).then(fullName => { this._fullName = fullName; }),
                this.storageService.getData(StorageKeyEnum.currentCarId).then(currentCarId => { this._currentCarId = currentCarId; }),
                this.storageService.getData(StorageKeyEnum.currentCar).then(currentCar => { this._currentCar = currentCar; }),
                this.storageService.getData(StorageKeyEnum.carrierCode).then(carrierCode => { this._carrierCode = carrierCode; }),
                this.storageService.getData(StorageKeyEnum.carrierImageLogo).then(carrierImageLogo => { this._carrierImageLogo = carrierImageLogo; }),
                this.storageService.getData(StorageKeyEnum.carrierName).then(carrierName => { this._carrierName = carrierName; }),
                this.storageService.getData(StorageKeyEnum.carrierPhoneNumber).then(carrierPhoneNumber => { this._carrierPhoneNumber = carrierPhoneNumber; }),
                this.storageService.getData(StorageKeyEnum.carrierPlace).then(carrierPlace => { this._carrierPlace = JSON.parse(carrierPlace); }),
                this.storageService.getData(StorageKeyEnum.carrierPlaces).then(carrierPlaces => { this._carrierPlaces = JSON.parse(carrierPlaces); }),
                this.storageService.getData(StorageKeyEnum.telephonePanic).then(telephonePanic => { this._telephonePanic = telephonePanic; }),
                this.storageService.getData(StorageKeyEnum.telephoneMsg).then(telephoneMsg => { this._telephoneMsg = telephoneMsg; }),
                this.storageService.getData(StorageKeyEnum.baseScope).then(baseScope => { this._baseScope = baseScope; }),
                this.storageService.getData(StorageKeyEnum.currentBaseId).then(currentBaseId => { this._currentBaseId = currentBaseId; }),
                this.storageService.getData(StorageKeyEnum.operability).then(operability => { this._operability = operability; }),
                this.storageService.getData(StorageKeyEnum.outOfService).then(outOfService => { this._outOfService = outOfService; }),
                this.storageService.getData(StorageKeyEnum.currentCarType).then(currentCarType => { this._currentCarType = currentCarType; }),
            ]).then((results:any[]) => {
                //tokenUserLogged and userId not empty
                if((this.connectionService.getToken() != "") && (this._userId != "")) {
                    this.setValueForMenu();
                    resolve(true);//is logged
                }
                else {
                    resolve(false);//is not logged
                }
            }).catch(error => {
                reject(error);//is not logged
            });
        });

    }

    public setUserType(userType: string): Promise<boolean> {
        this._userType = userType;
        return new Promise((resolve) => {
            resolve(true)
        });
    }


    public checkSubState(driverState) {
        if (this.driverSubState == DriverSubStateEnum.IN_BASE) {
            this._driverSubState = DriverSubStateEnum.IN_STREET;
            this.getDriverSubstate.next(this._driverSubState);
        }
    }

    private setValueForMenu() {
        this.getEmail.next(this._email);
        this.getImageLogo.next(this._userImage);
        this.getCarrierImageLogo.next(this._carrierImageLogo);
        this.getFullName.next(this._fullName);
        this.getCurrentCar.next(this._currentCar);
        this.getDriverSubstate.next(this._driverSubState);
        this.getCarrierName.next(this._carrierName);
        this.getCarrierCode.next(this._carrierCode);
        this.getCurrentCarType.next(this._currentCarType);
    }

    public setLoginUserEmail(email: string): void {
      this.storageService.setData(StorageKeyEnum.loginUserEmail, email);
    }
    public setLoginUserPassword(password: string): void {
      this.storageService.setData(StorageKeyEnum.loginUserPassword, password);
    }

    public async getLoginUserEmail(): Promise<string> {
      const userEmail = await this.storageService.getData(StorageKeyEnum.loginUserEmail);
      return userEmail ? userEmail : '';
    }
    public async getLoginUserPassword(): Promise<string> {
      const userPassword = await this.storageService.getData(StorageKeyEnum.loginUserPassword);
      return userPassword ? userPassword : '';
    }

    public showHost(){
        if (AppSettings.ENVIROMENT_SELECTION_ENABLED) {
            if (this.showHostCount < 5) {
                this.showHostCount = this.showHostCount + 1;
            }
            else {
                this.showHostCount = 0;
                let currentHost = (URL.value !== "") ? URL.value : AppSettings.Url;
                this.alertService.toast(currentHost);
            }
        }
    }

    public updateCurrentBase(base: Base) {
        this.currentBase = base;
        this.getCurrentBase.next(this.currentBase);
    }

    //updates driver on server
    public updateDriver() {
        const updateDriverCommand = new UpdateDriverCommand();
        updateDriverCommand.setParameters(<IUpdateDriverCommandParameters>{
            driverUserId: +this._userId,
            newImage: this._userImage,
        });

        return this.connectionService.Request(updateDriverCommand).then(response => {
            return response;
        }).catch(error => {
            throw error;
        });
    }

    notifyUpdatePreferences() {
        this.updatePreferences.next();
    }

    isIPhoneXModel(): boolean {
        const device = (window as any).device;
        const modelsX = ['iPhone10,3','iPhone10,6','iPhone11,2','iPhone11,4','iPhone11,6','iPhone11,8','iPhone12,1','iPhone12,3','iPhone12,5'];
        return device && modelsX.includes(device.model);
    }

    /**
     * Set the preferred navigation application used in launchnavigator.
     * @param app LaunchNavigator.APP
     */
    setPreferredNavigationApp(app: string) {
      this._preferredNavigationApp = app;
      this.storageService.setData(StorageKeyEnum.preferredNavigationApp, this._preferredNavigationApp);
    }

    /**
     * Return the preferred navigation application used in launchnavigator.
     */
    getPreferredNavigationApp(): Promise<string> {
      return new Promise((resolve, reject) => {
        if (this._preferredNavigationApp && this._preferredNavigationApp !== '') {
          return resolve(this._preferredNavigationApp);
        }
        else {
          this.storageService.getData(StorageKeyEnum.preferredNavigationApp)
          .then(data => {
            this._preferredNavigationApp = data;
            return resolve(this._preferredNavigationApp);
          })
        }
      });
    }

    /**
     * Check if current app version is updated and return if update is required or optional
     */
    checkAppVersionUpdated(platform: string, version: string | number) {
      const checkVersionUpdated = new CheckUpdatedVersionCommand();
      checkVersionUpdated.setParameters(<ICheckUpdatedVersionCommandParameters> {
        appName: 'DRIVER',
        platform: platform,
        version: version,
      });

      return this.connectionService.Request(checkVersionUpdated).then(response => {
        return response;
      }).catch(error => {
        throw error;
      });
    }

    setNewLoginInfo(info){
        this.newUser = info;
    }
    getUserInfo(){
        return this.newUser;
    }
    
}
