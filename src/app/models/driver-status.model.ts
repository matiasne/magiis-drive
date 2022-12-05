import { DriverStateEnum } from "../services/enum/driver-state.enum";
import { CurrentTripStatusModel } from "./current-trip-status.model";

export class DriverStatusModel {
  operability: boolean;
  outOfService: boolean;
  state: DriverStateEnum;
  incomingTripId: number;
  currentTrip: CurrentTripStatusModel;
}
