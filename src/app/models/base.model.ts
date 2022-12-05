import { PlaceModel } from "./place.model";
import { BranchTypeEnum } from "../services/enum/branch-type.enum";

export interface Base {
    branchName: string;
    branchType: BranchTypeEnum;
    id: number;
    locationPlace: PlaceModel;
    phone: string;
  }