import { PlaceModel } from "./place.model";
import { PredictionModel } from "./prediction.model";
import { Subject } from "rxjs";
import { Subscription } from "rxjs";

export class TravelEditionPlaceItem {
  displayList: boolean;
  input: string;
  place: PlaceModel;
  predictions: PredictionModel[];
  inputEvent: Subject<string>;
  inputEventSubscriptor?: Subscription;
  editable: boolean; // If true, the item is editable.
}
