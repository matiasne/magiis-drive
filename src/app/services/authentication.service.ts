import { Injectable } from "@angular/core"
import { ConnectionServices } from "./connection/connection.service"
import { ILogInCommandParameters, LogInCommand, ILogInResponse } from "./connection/command/logIn.command"
import { IdentityService } from "./identity.service"
import { IRegistrationDriverInterface } from "./connection/interfaces/apiInterfaces"
import { RequestHeader } from "./connection/requestHeader"
import { SignUpDriverCommand, ISignUpDriverCommandParameters } from "./connection/command/signUpDriver.command"

import { RestorePassCommand, IRestorePassParameters } from "./connection/command/restorePass.command";
import { GetDriverCommand, IGetDriverCommandParameters } from "./connection/command/getDriver.command";
import { RefreshTokenCommand, IRefreshTokenCommandCommandParameters } from "./connection/command/refreshToken.command";
import { StorageService } from "./storage/storage.service";
import { StorageKeyEnum } from "./storage/storageKeyEnum.enum";
import { DriverStateEnum } from "./enum/driver-state.enum";
import { DriverSubStateEnum }  from "./enum/driver-sub-state.enum";
import {GetCarrierBasesCommand, IGetCarrierBasesCommandParameters} from "./connection/command/getCarrierBases.command";
import { Base } from "../models/base.model"
import { PlaceModel } from "../models/place.model"

@Injectable({
  providedIn:'root'
})
export class AuthenticationService {
    constructor(
        private connectionService: ConnectionServices,
        private identityService: IdentityService,
        private storageService: StorageService,
    ) { }

    //Generates login in server, and save token and data
    public refreshToken(token: string, userId: string, driverState: string, driverSubState: string, latitud: string, longitude: string): Promise<any> {
        let refreshTokenCommand = new RefreshTokenCommand();
        refreshTokenCommand.setParameters(<IRefreshTokenCommandCommandParameters>{
            driverUserId: userId,
            firebaseToken: token,
            platform: this.identityService.userType,
            driverState: driverState,
            driverSubState: driverSubState,
            latitud: latitud,
            longitud: longitude,
            outOfService: this.identityService.outOfService
        })

        return this.connectionService.Request(refreshTokenCommand).then(response => {
            return response;
        })
        .catch(error => {
            throw error;
        })
    }

    public login(username: string, password: string, rol: string): Promise<any> {

        const loginCommand = new LogInCommand()
        loginCommand.setParameters(<ILogInCommandParameters>{
            username: username,
            password: password
        })

        var headers = new Array<RequestHeader>()
        headers.push(<RequestHeader>{
            name: "RoleToAttempt",
            value: rol
        })

        loginCommand.addCustomHeaders(headers)
        return this.connectionService.Request(loginCommand).then(loginResponse => {
            let response = loginResponse as ILogInResponse;
            console.log(response)
            //save login info and then get user info and save it all to local storage
            this.identityService.setLoginInfo(response)
            
            return this.getUserInfo(response.userId);
           
        });
    }

    public getUserInfo(driverUserId: string): Promise<any> {
      let getDriverCommand = new GetDriverCommand()
      getDriverCommand.setParameters(<IGetDriverCommandParameters>{
        driverUserId: driverUserId,
      });
      let infouser;
      return this.connectionService.Request(getDriverCommand).then(userInfo => {
        console.log("getUserInfo", userInfo);
        this.identityService.setNewLoginInfo(userInfo);
        infouser = userInfo;
        return this.identityService.setUserInfo(
            userInfo.carrier.phoneNumber,
            userInfo.carrier.carrierImageLogo,
            userInfo.driverState,
            userInfo.driverSubState,
            userInfo.carrier.id,
            userInfo.carrier.country,
            userInfo.countryCode,
            userInfo.carrier.locationPlace,
            userInfo.imageDriver,
            userInfo.firstName + " " + userInfo.lastName,
            userInfo.driverUserEmail,
            userInfo.telephonePanic,
            userInfo.telephoneMsg,
            userInfo.baseScope,
            userInfo.currentBaseId,
            userInfo.driverUserId,
            userInfo.operability,
            userInfo.vehicle.id,
            userInfo.vehicle.identificationCard.domain + " "
            + userInfo.vehicle.identificationCard.mark + " "
            + userInfo.vehicle.identificationCard.model,
            userInfo.carrier.firstName,
            userInfo.carrier.code,
            userInfo.vehicle.identificationCard.transportType.name,
            userInfo.geocercaRatio,
            userInfo.vehicle.vehicleId
        ).then(() => this.getCarrierBases(infouser.carrier.id))
      });
    }

    private getCarrierBases(carrierId: string): Promise<any> {
        let getCarrierBasesCommand = new GetCarrierBasesCommand()
        getCarrierBasesCommand.setParameters(<IGetCarrierBasesCommandParameters>{
          carrierId: carrierId,
        });
        return this.connectionService.Request(getCarrierBasesCommand).then((res: Base[]) => {
            if (this.identityService.getCurrentBaseId()) {
                const base = res.find(b => b.id === this.identityService.getCurrentBaseId());
                this.identityService.updateCurrentBase(base);
            }
          this.identityService.setCarrierPlaces(res);
        })
    }

    public logout(currentPosition?: PlaceModel): Promise<boolean> {
      return new Promise( (resolve, reject) => {
        let promises: any = [];
        promises.push(this.storageService.deleteData(StorageKeyEnum.tokenUserLogged));
        promises.push(this.storageService.deleteData(StorageKeyEnum.userId));
        promises.push(this.storageService.deleteData(StorageKeyEnum.carrierUserId));
        promises.push(this.storageService.deleteData(StorageKeyEnum.country));
        promises.push(this.storageService.deleteData(StorageKeyEnum.email));
        promises.push(this.storageService.deleteData(StorageKeyEnum.userImage));
        promises.push(this.storageService.deleteData(StorageKeyEnum.fullName));
        promises.push(this.storageService.deleteData(StorageKeyEnum.carrierCode));
        promises.push(this.storageService.deleteData(StorageKeyEnum.carrierImageLogo));
        promises.push(this.storageService.deleteData(StorageKeyEnum.carrierName));
        promises.push(this.storageService.deleteData(StorageKeyEnum.carrierPhoneNumber));
        promises.push(this.storageService.deleteData(StorageKeyEnum.carrierPlace));
        promises.push(this.storageService.deleteData(StorageKeyEnum.telephonePanic));
        promises.push(this.storageService.deleteData(StorageKeyEnum.telephoneMsg));
        promises.push(this.storageService.deleteData(StorageKeyEnum.baseScope));
        promises.push(this.storageService.deleteData(StorageKeyEnum.operability));
        promises.push(this.storageService.deleteData(StorageKeyEnum.inBase));
        promises.push(this.identityService.setDriverState(DriverStateEnum.OFFLINE));
        promises.push(this.identityService.setDriverSubState(DriverSubStateEnum.IN_STREET));
        this.refreshToken(
          this.connectionService.getToken(),
          this.identityService.userId,
          DriverStateEnum.OFFLINE,
          DriverSubStateEnum.IN_STREET,
          currentPosition ? currentPosition.latitude : '',
          currentPosition ? currentPosition.longitude : ''
        );

        Promise.all(promises).then((results:any[]) => {
          resolve(true);
        }).catch(error => {
          reject(error.message ? error.message : error);
        });
      });
    }

    public restorePass(email: string): Promise<any> {
        const restorePassCommand = new RestorePassCommand()
        restorePassCommand.setParameters(<IRestorePassParameters>{
            email: email,
        })

        return this.connectionService.Request(restorePassCommand).then(response => {

        })
        .catch(error => {
            throw error;
        })
    }

    public signUp(data: IRegistrationDriverInterface): Promise<boolean> {
        const signUpCommand = new SignUpDriverCommand()
        signUpCommand.setParameters(<ISignUpDriverCommandParameters>{
        country: data.country,
        tributeNumber: data.tributeNumber,
        companyName: data.companyName,
        userName: data.userName,
        password: data.password,
        bankName: data.bankName,
        bankUniqueNumber: data.bankUniqueNumber,
        email: data.email,
        comercialLicense: data.comercialLicense,
        tributeCondition: data.tributeCondition,
        imageLogo: data.imageLogo,
        state: data.state,
        countryChecked: false,
        tributeNumberChecked: false,
        companyNameChecked: false,
        userNameChecked: false,
        bankNameChecked: false,
        bankUniqueChecked: false,
        emailChecked: false,
        comercialLicenseChecked: false,
        tributeConditionChecked: false,
        imageLogoChecked: false,
        observations: ""
    })
      return this.connectionService.Request(signUpCommand).then(signUpResponse => {
        return true;
      }).catch(error => {
        throw error;
      })
    }

}
