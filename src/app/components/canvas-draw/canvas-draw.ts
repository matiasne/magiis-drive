import { Component, ViewChild, Renderer2 } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { SignBase64Provider } from '../../providers/sign-base64/sign-base64';

@Component({
  selector: 'canvas-draw',
  templateUrl: 'canvas-draw.html',
  styleUrls: ['./canvas-draw.scss'],
})
export class CanvasDraw {

    @ViewChild('myCanvas') canvas: any;

    offsetX: number;
    offsetY: number;
    canvasElement: any;
    lastX: number;
    lastY: number;
    containSign: boolean = false;

    currentColour: string = '#000000';
    brushSize: number = 7;

    constructor(public platform: Platform,
        public renderer: Renderer2,
        public navCtrl: NavController,
      //  public statusBar: StatusBar,
        public signBase64: SignBase64Provider) {
    }

    ngAfterViewInit(){

        this.canvasElement = this.canvas.nativeElement;

        this.renderer.setStyle(this.canvasElement, 'width', '400px');
        this.renderer.setStyle(this.canvasElement, 'height', '500px');

    }

    handleStart(ev){

        this.lastX = ev.touches[0].pageX;
        this.lastY = ev.touches[0].pageY;
    }

    handleMove(ev){

        let ctx = this.canvasElement.getContext('2d');
        let currentX = ev.touches[0].pageX;
        let currentY = ev.touches[0].pageY;

        ctx.beginPath();
        ctx.lineJoin = "round";
        ctx.moveTo(this.lastX, this.lastY);
        ctx.lineTo(currentX, currentY);
        ctx.closePath();
        ctx.strokeStyle = this.currentColour;
        ctx.lineWidth = this.brushSize;
        ctx.stroke();

        this.lastX = currentX;
        this.lastY = currentY;

        this.containSign=true;

    }

    public cleanSignPad(){
        this.canvasElement = this.canvas.nativeElement;
        let ctx = this.canvasElement.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        this.containSign = false;
    }


  saveSign(){
    this.canvasElement = this.canvas.nativeElement;
    var dataUrl = this.canvasElement.toDataURL();
    var data = dataUrl.split(',')[1];
    let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.signBase64.signPassengerBase64.next(data);
    this.signBase64.containSign.next(this.containSign);
    this.navCtrl.pop();
}

}
