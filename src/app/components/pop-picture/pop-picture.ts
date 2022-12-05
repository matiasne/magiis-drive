import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'pop-picture',
  templateUrl: 'pop-picture.html'
})
export class PopPictureComponent {

  @ViewChild('modal') modal: ElementRef;

  picture: string | SafeUrl = '';
  caption: string = '';

  constructor(
    private _renderer: Renderer2,
    private _sanitizer: DomSanitizer
  ) {}

  close() :void {
    this._renderer.setStyle(this.modal.nativeElement, 'display', 'none');
    this.picture = '';
  }

  open(picture: string, caption: string): void {
    this.picture = this.sanitize(picture);
    this.caption = caption;
    this._renderer.setStyle(this.modal.nativeElement, 'display', 'flex');
  }

  private sanitize(img: string) {
    return this._sanitizer.bypassSecurityTrustUrl(img);
  }

}
