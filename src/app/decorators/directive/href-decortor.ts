import { Directive, ElementRef, Renderer2 } from '@angular/core';
import { TrackAssistent } from 'src/app/eye-track/features.service/trackAssistent';
import { EyetrackDecoratorI } from './interface-decorator';

@Directive({
  selector: '[eyeTrackHref]'
})
export class EyeTrackHrefDirective implements EyetrackDecoratorI{

  private eyeTarget: boolean = false;
  private originBorder:String | undefined;
  private originBackgroundColor:String | undefined;
  private originFilter:String | undefined;
  private currBr: number = 100;

  constructor(private elementRef: ElementRef,
              private renderer: Renderer2,
              private eyeTrackAssist: TrackAssistent){ }

  injectElement(rootElement: any, renderer: Renderer2, eyeTrackAssist: TrackAssistent): void {
    const hrefs = rootElement.querySelectorAll('*[href]');
    hrefs.forEach((hrefElem: any) => {
      const elementRef = new ElementRef(hrefElem);
      let dir = new EyeTrackHrefDirective(elementRef, renderer, eyeTrackAssist);  
      try {
        dir.apply();
      }
      catch(e:any){
        console.log('Exception')
        console.log(e)
      }   
    });
  }

  private apply() {
    console.log('HREF ' + this.elementRef);
    console.log(this.elementRef);
    console.log(this.elementRef.nativeElement.getBoundingClientRect());
    this.originBorder = this.elementRef.nativeElement.style.border;
    this.originBackgroundColor = this.elementRef.nativeElement.style.backgroundColor;
    this.originFilter = this.elementRef.nativeElement.style.filter;
    this.eyeTrackAssist.target$
      .subscribe((point) => {
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        let minLeft = rect.left - 5;
        let minTop = rect.top - 5;
        let maxLeft = rect.left + rect.width + 5;
        let maxTop = rect.top + rect.height + 5;
        if (minLeft < point.x && point.x < maxLeft &&
            minTop < point.y && point.y < maxTop 
            && (50 < document.body.offsetHeight - rect.top)) {
            if (!this.eyeTarget) {
              this.elementRef.nativeElement.style.border = '4px solid green';
              this.elementRef.nativeElement.style.backgroundColor = 'SkyBlue';
              this.elementRef.nativeElement.style.filter = 'brightness('+ this.currBr + '%)';
            }
            this.eyeTarget = true;
        } else {
          if (this.eyeTarget) {
            this.elementRef.nativeElement.style.border = this.originBorder;
            this.elementRef.nativeElement.style.backgroundColor = this.originBackgroundColor;
            this.elementRef.nativeElement.style.filter = this.originFilter;
          }
          this.eyeTarget = false;
        }
      });     
    this.eyeTrackAssist.closeRightEye$
      .subscribe((value) => {
        if (value && this.eyeTarget) {
            this.currBr -= 1;
            if (this.currBr < 60) {
              this.currBr = 100;
              this.elementRef.nativeElement.click();              
            }
            this.elementRef.nativeElement.style.filter = 'brightness('+ this.currBr + '%)';
        } else {            
            this.currBr == 100;
            this.elementRef.nativeElement.style.filter = 'brightness('+ this.currBr + '%)';
        }
      });
      this.eyeTrackAssist.currentElements.push(this.elementRef);
  }

}