import { TravelImages } from "../../enum/travel-images.enum";

export interface VehicleInsurance {
  policy: string;
  company: string;
  type: string;
  expirationDate: Date;
}

export interface VehicleVerification {
  number: string;
  type: string;
  expirationDate: Date;
}
export interface VehicleProperties {
  headline: string;
  idNumber: number;
  address: string;
  authIdName: string;
  authIdNumber: number;
  fileNameAuthIdFront: string;
  fileNameAuthIdReverse: string;
}

export interface VehicleICard {
  domain: string;
  mark: string;
  model: number;
  type: VehicleType;
  use: string;
  chassis: string;
  motor: string;
  expirationDate: Date;
  iCardImageFront: string;
  iCardImageReverse: string;
}
export interface VehicleCharacteristics {
  haveAirConditioner: boolean;
  haveGas: boolean;
  haveDiesel: boolean;
  haveLuggage: boolean;
  kmsTraveled: number;
}

export interface ConfirmPasswordRecoveryRequestDTO {
  newPassword?: string;
  token?: string;
}
export interface ErrorDetails {
  code?: string;
  details?: string;
  message?: string;
  status?: number; // int32
  timestamp?: string; // date-time
}
export interface GetMeResponseDTO {
  features?: string[];
  name?: string;
  userType?: string;
  username?: string;
}
export interface CountriesResponseDTO {
  name?: string;
}
export interface PagesByCountryResponseDTO {
  name?: string;
  pages?: PagesResponseDTO[];
}
export interface AddVehicleResponseDTO { }
export interface PagesResponseDTO {
  name?: string;
  data?: TextDataResponseDto[];
}
export interface TextDataResponseDto {
  id?: number;
  key?: string;
  value?: string;
  validationRegex?: string;
}
export interface LoginRequestDTO {
  password?: string;
  username?: string;
}
export interface LoginResponseDTO {
  token?: string;
  username?: string;
}
export interface PasswordRecoveryRequestDTO {
  username?: string;
}
export interface PasswordRecoveryResponseDTO {
  token?: string;
}
export interface ProfileEditRequestDTO {
  address?: string;
  cbu?: string;
  cellphone?: string;
  descriptions?: TextI18NDTO[];
  fiscalAddress?: string;
  logo?: string;
  name?: string;
  phone?: string;
}
export interface RegistrationRequestDTO {
  cuit?: string;
  email?: string;
  password?: string;
}
export interface RegistrationResponseDTO {
  cuit?: string;
  email?: string;
  name?: string;
  validationCode?: string;
}
export interface TextI18NDTO {
  id?: number; // int64
  language?: string;
  text?: string;
}

export interface DriverRegistrationRequestDTO {
  email?: String;
  carrier?: string;
  firtsName?: String;
  lastName?: String;
  document?: String;
  genre?: String;
  age?: number;
  tributeIdentification?: String;
  address?: String;
  city?: String;
  vehicle?: AddVehicleResponseDTO;
  license?: LicenseDTO;
  languages?: Array<LenguageInterface>;
}


export interface DriverRegistrationResponseDTO {
  email?: String;
  carrier?: string;
  firstName?: String;
  lastName?: String;
  document?: String;
  genre?: String;
  age?: number;
  tributeIdentification?: String;
  address?: String;
  city?: String;
  vehicle?: AddVehicleResponseDTO;
  license?: LicenseDTO;
  languages?: Array<LenguageInterface>;
  id?: number;
}

export interface LenguageInterface {
  id?: number;
  name?: String;
  level?: number;
}

export interface LicenseDTO {
  id?: number;
  licenseNumber?: number;
  expirationDate?: Date;
  city?: String;
  licensePhotoFront?: String;
  licensePhotoBack?: String;
}

export interface DriversRequestDTO {
  carrier: string;
  page?: number;
  size?: number;
  column?: string;
  sort?: string;
}


export interface VehiclesResponse {
  id?: number;
  insurance?: VehicleInsurance;
  vtv?: VehicleVerification;
  identificationCard?: VehicleICard;
  properties?: VehicleProperties;
  characteristics?: VehicleCharacteristics;
}

export interface VehicleTypeResponseDto {
  name?: string;
  id?: string;
}
export interface VehicleType {
  name?: string;
  id?: number;
}
export interface VehicleTypePrice {
  type?: VehicleType;
  cost?: number;
}
export interface VehicleTypeListResponseDto {
  type: string;
}

export interface TravelGrid {
  content?: TravelsGridResponseDTO[];
  totalPages?: number;
}

export interface TravelsGridResponseDTO {
  firstName?: String;
  lastName?: string;
  startPoint?: String;
  endPoint?: String;
  vehicleId?: String;
  vehicleModel?: String;
  carrier?: number;
  airConditioner?: String;
  luggage?: String;
  mascots?: String;
  id?: number;
  estimatePrice?: number;
}
export interface Place {
  lat: string,
  longitude: string,
  shortName: string
}

export interface ModalConfirmationTravelResponse {
  imageDriver?: string;
  firstNameDriver?: String;
  lastNameDriver?: String;
  locationDriver?: string;
  firstNamePassenger?: String;
  lastNamePassenger?: String;
  startPointPassenger?: string;
  endPointPassenger?: string;
  vehicle?: string;
  arriveEstimate?: string;
  driverId: number;
  travelId: number;
}

export interface ModalConfirmationTravelDto {
  imageDriver?: string;
  NameDriver?: String;
  lastNameDriver?: String;
  locationDriver?: string;
  firstNamePassenger?: String;
  lastNamePassenger?: String;
  startPointPassenger?: string;
  endPointPassenger?: string;
  vehicle?: string;
}

export interface DriverImageResponseDto {
  id?: number;
  imageLogo?: String;
}
export interface IRegistrationDriverInterface {
  country?: string
  tributeNumber?: string
  companyName?: string
  userName?: string
  password?: string
  bankName?: string
  bankUniqueNumber?: string
  email?: string
  comercialLicense?: string
  tributeCondition?: string
  imageLogo?: string
  state?: string
}

export interface SetAdditionalRequestDTO {
  travelId?: number;
  delay?: string;
  roadToll?: string;
  parking?: string;
  comments?: string;
}

export interface ChangeTravelStatusRequestDTO {
  state?: string;
  driverEmail?: string;
}

export interface PriceForWaitingResponse {
  price: number;
}

export interface PagesResponseDTO {
  name?: string;
  data?: TextDataResponseDto[];
}

export interface TextDataResponseDto {
  id?: number;
  key?: string;
  value?: string;
  validationRegex?: string;
  requiredField?: boolean;
  placeHolder: string;
  max: number;
  min: number;
  mask: string;
}

export interface ITollDetailResponse {
  id: number;
  date: Date;
  name: string;
  price: number;
  image: string;
}

export interface IParkingDetailResponse {
  id: number;
  date: Date;
  name: string;
  price: number;
  image: string;
}

export interface IOtherCostDetailResponse {
  id: number;
  date: Date;
  name: string;
  price: number;
}

export interface TimezoneResponse {
  id: number,
  name: string
}
