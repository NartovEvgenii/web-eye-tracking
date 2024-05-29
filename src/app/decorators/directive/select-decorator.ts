import { Directive, ElementRef, Renderer2 } from '@angular/core';
import { EyeTrack } from 'src/app/eye-track/features.service/eyeTrack';

@Directive({
  selector: '[eyeTrackSelect]'
})
export class EyeTrackSelectDirective {

  private minWidth: number = 100;
  private minHeight: number = 50;
  private eyeTargetHeight: number | undefined;
  private originBorder:String | undefined;

  private progress:any | undefined;
  private parenArea:any | undefined;
  private parentOptionsArea:any | undefined;
  private listOptions:any | undefined;

  private options: Array<HTMLOptionElement> = [];
  private lastIndexOption: number = 0;

  private upElement:any | undefined;
  private downElement:any | undefined;
  private upCurrBr: number = 100;
  private downCurrBr: number = 100;
  
  private lastMaxTop: number = 100;

  constructor(private elementRef: ElementRef,
      private renderer: Renderer2,
      private eyeTrack: EyeTrack){
    this.apply();
  }

  private apply() {
    if (this.elementRef.nativeElement.minWidth == undefined || this.elementRef.nativeElement.minWidth < this.minWidth) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'min-width', this.minWidth + 'px');
    }
    if (this.elementRef.nativeElement.minWidth == undefined || this.elementRef.nativeElement.minHeight < this.minHeight) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'min-height', this.minHeight + 'px');
    }
    this.originBorder = this.elementRef.nativeElement.style.border;
    this.createOptionsArea();
    this.createProgressBar();
    this.lastMaxTop = this.getLastMaxTop();
    this.eyeTrack.target$
      .subscribe((point) => {
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        let minLeft = rect.left - 5;
        let minTop = rect.top - 5;
        let maxLeft = rect.left + rect.width + 5;
        let firstMaxTop = rect.bottom;
        if (minLeft < point.x && point.x < maxLeft &&
            minTop < point.y && point.y < (rect.bottom + this.lastMaxTop + 55)) {
            if (point.y < firstMaxTop) {
              this.renderer.setStyle(this.elementRef.nativeElement, 'border', '4px solid green');
            } else {
              this.renderer.setStyle(this.elementRef.nativeElement, 'border', this.originBorder);
            }
            if (point.y > firstMaxTop && point.y < (firstMaxTop + 55)) {
              this.downElement.style.border = '4px solid MidnightBlue';
            } else {
              this.downElement.style.border = '4px solid SkyBlue';
            }
            
            if (point.y > this.lastMaxTop && point.y < (rect.bottom + this.lastMaxTop + 55)) {
              this.upElement.style.border = '4px solid MidnightBlue';
            } else {
              this.upElement.style.border = '4px solid SkyBlue';
            }
            this.eyeTargetHeight = point.y;
        } else {
          if (this.eyeTargetHeight != undefined) {
            this.renderer.setStyle(this.elementRef.nativeElement, 'border', this.originBorder);
            this.downElement.style.border = '4px solid SkyBlue';
            this.upElement.style.border = '4px solid SkyBlue';
          }
          this.eyeTargetHeight = undefined;
        }
      });     
    this.eyeTrack.closeRightEye$
      .subscribe((value) => {
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        let firstMaxTop = rect.bottom;
        if (this.eyeTargetHeight != undefined && value) {        
          if (this.eyeTargetHeight < firstMaxTop) {
            this.updateProgressBar();
          } else {
            this.hideProgressBar();
          }
          if (this.eyeTargetHeight > firstMaxTop && this.eyeTargetHeight < (firstMaxTop + 55)) {
            this.updateDownElement();
          } else {
            this.cancelDownElement();
          }
          if (this.eyeTargetHeight > this.lastMaxTop && this.eyeTargetHeight < (rect.bottom + this.lastMaxTop + 55)) {
            this.updateUpElement();
          } else {
            this.cancelUpElement();
          }
        } else {
          this.hideProgressBar();
          this.cancelDownElement();
          this.cancelUpElement();
        }
      });
  }

  private createProgressBar() {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    console.log(rect)
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
      this.parenArea.hidden = true;
      this.progress.value = 1;
      this.parentOptionsArea.hidden = !this.parentOptionsArea.hidden;
      this.updateSelectOption(this.elementRef.nativeElement.selectedIndex);
    }
  }

  private hideProgressBar() {
    this.progress.value = 1;
    //this.parenArea.hidden = true;
  }

  private createOptionsArea() {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    this.parentOptionsArea = document.createElement('div');
    this.parentOptionsArea.style.paddingLeft = '0px';
    this.parentOptionsArea.style.border = '4px solid green';
    this.parentOptionsArea.style.position = 'fixed';
    this.parentOptionsArea.style.top = rect.bottom + 'px';
    this.parentOptionsArea.style.left = rect.left + 'px';
    this.parentOptionsArea.style.zIndex = 99;
    this.parentOptionsArea.style.width = (this.elementRef.nativeElement.offsetWidth) + 'px';
    //this.parentOptionsArea.hidden = true;

    let downArea = this.createDownArea();
    this.parentOptionsArea.appendChild(downArea);

    let listOptions = this.createListOptions();
    this.parentOptionsArea.appendChild(listOptions); 

    let upArea = this.createUpArea();
    this.parentOptionsArea.appendChild(upArea);

    this.renderer.insertBefore(this.elementRef.nativeElement.parentNode, this.parentOptionsArea, this.elementRef.nativeElement.nextSibling);
  }

  private createListOptions() {
    let allOptions = this.elementRef.nativeElement.querySelectorAll('option');
    this.listOptions = document.createElement('div');
    this.listOptions.style.position = 'relative';
    this.listOptions.style.width = (this.elementRef.nativeElement.offsetWidth - 7) + 'px';
    this.listOptions.style.padding = '0px';
    this.listOptions.style.minHeight = '100px';
    this.listOptions.style.maxHeight = '250px';
    this.listOptions.style.overflowY = 'scroll';
    this.listOptions.style.overflowX = 'hidden';
    allOptions.forEach((option: any) => {
        let newOptionElement = this.createOptionForEye(option);
        this.listOptions.appendChild(newOptionElement);
        this.options.push(newOptionElement);
    });
    this.updateSelectOption(this.elementRef.nativeElement.selectedIndex);
    return this.listOptions;
  }

  private createOptionForEye(option: any) {
    let newOptionElement = document.createElement('option');
    newOptionElement.text = option.text;
    newOptionElement.value = option.value;
    newOptionElement.style.width = (this.elementRef.nativeElement.offsetWidth - 7) + 'px';
    newOptionElement.style.position = 'relative';
    newOptionElement.style.height = '50px';
    return newOptionElement;
  }

  private createUpArea() {
    this.upElement = document.createElement('div');
    this.upElement.style.position = 'relative';
    this.upElement.style.width = (this.elementRef.nativeElement.offsetWidth - 7) + 'px';
    this.upElement.style.height = '50px';
    this.upElement.style.backgroundColor = 'SkyBlue';
    this.upElement.style.border = '4px solid SkyBlue';
    this.upCurrBr = 100; 
    this.upElement.style.filter = 'brightness('+ this.upCurrBr + '%)';
    return this.upElement;
  }

  private createDownArea() {
    this.downElement = document.createElement('div');
    this.downElement.style.position = 'relative';
    this.downElement.style.width = (this.elementRef.nativeElement.offsetWidth - 7) + 'px';
    this.downElement.style.height = '50px';
    this.downElement.style.backgroundColor = 'SkyBlue';
    this.downElement.style.border = '4px solid SkyBlue';
    this.downCurrBr = 100; 
    this.downElement.style.filter = 'brightness('+ this.downCurrBr + '%)'; 
    return this.downElement;
  }
  
  private updateSelectOption(index:number) {
    this.elementRef.nativeElement.selectedIndex = index;
    this.options[this.lastIndexOption].style.backgroundColor = 'white';
    this.options[index].style.backgroundColor = 'Blue';
    this.lastIndexOption = index;
    this.listOptions.scrollTop = Math.max(0, (index - 2) * 50);
  }

  private getLastMaxTop() {
    return 50 + Math.min(250, (this.options.length * 50))
  }

  private updateDownElement() {
    this.downCurrBr -= 1;
    if (this.downCurrBr < 60) {
      this.downCurrBr = 100;
      this.updateSelectOption(Math.max(this.lastIndexOption - 1, 0));
    }
    this.downElement.style.filter = 'brightness('+ this.downCurrBr + '%)';
  }

  private cancelDownElement() {
    this.downCurrBr == 100;
    this.downElement.style.filter = 'brightness('+ this.downCurrBr + '%)';
  }

  private updateUpElement() {
    this.upCurrBr -= 1;
    if (this.upCurrBr < 60) {
      this.upCurrBr = 100;
      this.updateSelectOption(Math.min(this.lastIndexOption + 1, this.options.length - 1));
    }
    this.upElement.style.filter = 'brightness('+ this.upCurrBr + '%)';
  }

  private cancelUpElement() {
    this.upCurrBr == 100;
    this.upElement.style.filter = 'brightness('+ this.upCurrBr + '%)';
  }

}