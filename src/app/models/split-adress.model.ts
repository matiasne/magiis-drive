export class SplitAdressModel {

  line_one: string;
  line_two: string;

  constructor(line_one: string = '', line_two: string = '') {
    this.line_one = line_one;
    this.line_two = line_two;
  }
}
