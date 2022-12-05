import { PlaceModel } from "./place.model";

export class TravelUpdate {
  id: number;
  origin: PlaceModel;
  destination: PlaceModel;
  waypoints?: PlaceModel[];
  dateProgrammed?: Date;
  note: string;
  avoidTolls: boolean;
  avoidHighways: boolean;
  roundTrip: boolean;
}
