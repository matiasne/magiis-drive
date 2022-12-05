import { PlaceModel } from "./place.model";

export class FrequentDestinationModel {
    name: string;
    origin: PlaceModel;
    destiny: PlaceModel;
    radioOrigin: number;
    priceUnit: string;
    price: number;
}