import { Directive, ElementRef, Renderer2 } from '@angular/core';
import { EyeTrack } from 'src/app/eye-track/features.service/eyeTrack';

@Directive({
  selector: '[eyeTrackButton]'
})
export class EyeTrackButtonDirective {

  private minWidth: number = 50;
  private minHeight: number = 50;
  private eyeTarget: boolean = false;
  private originBorder:String | undefined;
  private progress:any | undefined;
  private parenArea:any | undefined;

  constructor(private elementRef: ElementRef,
              private renderer: Renderer2,
              private eyeTrack: EyeTrack){
    this.apply();
  }

  private apply() {
    console.log('DECOR ' + this.elementRef);
    console.log(this.elementRef);
    if (this.elementRef.nativeElement.minWidth == undefined || this.elementRef.nativeElement.minWidth < this.minWidth) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'min-width', this.minWidth + 'px');
    }
    if (this.elementRef.nativeElement.minWidth == undefined || this.elementRef.nativeElement.minHeight < this.minHeight) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'min-height', this.minHeight + 'px');
    }
    this.originBorder = this.elementRef.nativeElement.style.border;
    this.createProgressBar();
    this.eyeTrack.target$
      .subscribe((point) => {
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        let minLeft = rect.left - 5;
        let minTop = rect.top - 5;
        let maxLeft = rect.left + rect.width + 5;
        let maxTop = rect.top + rect.height + 5;
        if (minLeft < point.x && point.x < maxLeft &&
            minTop < point.y && point.y < maxTop) {
            if (!this.eyeTarget) {
              this.renderer.setStyle(this.elementRef.nativeElement, 'border', '4px solid green');
            }
            this.eyeTarget = true;
        } else {
          if (this.eyeTarget) {
            this.renderer.setStyle(this.elementRef.nativeElement, 'border', this.originBorder);
          }
          this.eyeTarget = false;
        }
      });     
    this.eyeTrack.closeRightEye$
      .subscribe((value) => {
        if (value && this.eyeTarget) {
          this.updateProgressBar();
        } else {
          this.hideProgressBar();
        }
      });
  }

  private createProgressBar() {    
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    this.parenArea = document.createElement('div');
    this.parenArea.style.paddingLeft = '0px';
    this.parenArea.style.position = 'fixed';
    this.parenArea.style.top = rect.top + 'px';
    this.parenArea.style.left = rect.left + 'px';
    this.parenArea.style.width = (this.elementRef.nativeElement.offsetWidth) + 'px';
    this.parenArea.style.height = '15px';
    this.parenArea.style.zIndex = 99;
    //this.parenArea.hidden = true;

    this.progress = this.renderer.createElement('progress');
    this.progress.style.width = (this.elementRef.nativeElement.offsetWidth) + 'px';     
    this.progress.style.height = '15px';   
    this.progress.style.backgroundColor = 'green';
    this.progress.style.position = 'relative';
    this.progress.max = 60;
    this.progress.value = 1;

    this.parenArea.appendChild(this.progress);
    this.renderer.insertBefore(this.elementRef.nativeElement.parentNode, this.parenArea, this.elementRef.nativeElement.nextSibling);
  }

  private updateProgressBar() {
    if (this.parenArea.hidden) {
      this.parenArea.hidden = false;
    }
    this.progress.hidden = false;
    this.progress.value += 1;
    if (this.progress.value == this.progress.max) {
      this.elementRef.nativeElement.click();
      this.parenArea.hidden = true;
      this.progress.value = 1;
    }
  }

  private hideProgressBar() {
    this.progress.value = 1;
    //this.parenArea.hidden = true;
  }

}