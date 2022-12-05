export class OtherCostDetailItemModel {
  name: string;
  price: number;
  date: Date;

  constructor(name: string, price: number) {
    this.name = name;
    this.price = price;
    this.date = new Date();
  }
}
