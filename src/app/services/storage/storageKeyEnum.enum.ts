export enum StorageKeyEnum {
  //identity
  tokenUserLogged = "tokenUserLogged",
  userId = "userId",
  carrierUserId = "carrierUserId",
  driverState = "driverState",
  driverSubState = "driverSubState",
  country = "country",
  countryCode = "countryCode",
  carrierPlace = "carrierPlace",
  carrierPlaces = "carrierPlaces",
  email = "email",
  userImage = "userImage",
  fullName = "fullName",
  carrierImageLogo = "carrierImageLogo",
  carrierPhoneNumber = "carrierPhoneNumber",
  telephonePanic = "telephonePanic",
  telephoneMsg = "telephoneMsg",
  baseScope = "baseScope",
  currentBaseId = "currentBaseId",
  operability = "operability",
  inBase = "inBase",
  currentCarId = "currentCarId",
  currentCar = "currentCar",
  currentCarType = "currentCarType",
  carrierName = "carrierName",
  carrierCode = "carrierCode",
  geocercaRatio = "geocercaRatio",
  loginUserEmail = "loginUserEmail",
  loginUserPassword = "loginUserPassword",

  //travel
  currentTravel = "currentTravel",
  pendingTravels = "pendingTravels",
  finishedTravels = "finishedTravels",
  log = "log",
  unreadMessages = "unreadMessages",
  readMessages = "readMessages",
  travelCancellation = "travelCancellation",
  realVisitedWaypoint = "realVisitedWaypoint", 

  // Puntos de recogida y bajada de pasajero
  pickUpPoint = "pickUpPoint",
  dropOffPoint = "dropOffPoint",

  //connection
  logUserId = "logUserId",
 
  //other
  customHost = "customHost",
  outOfService = "outOfService",
  autoShowMapOnTravel = "autoShowMapOnTravel",
  preferredMapService = "preferredMapService",
  showCarrierCircle = "showCarrierCircle",
  highlightAddresses = "highlightAddresses",
  defaultLanguage = "defaultLanguage",
  storageVersion = "storageVersion",//let this at the end always!

  //timer
  initTimer = "initTimer",
  timerOn = "timerOn",
  currentWaitStartTime = "currentWaitStartTime",
  waitEndTime = "waitEndTime",
  startTravelTime = "startTravelTime",

  // Navigation Apps.
  preferredNavigationApp = "preferredNavigationApp",
  isPowerSaveMode = "isPowerSaveMode"
}
