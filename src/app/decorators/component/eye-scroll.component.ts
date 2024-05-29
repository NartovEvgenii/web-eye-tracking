import {Component, ElementRef, HostBinding, OnInit, Renderer2, ViewChild} from '@angular/core';
import { EyeTrack } from 'src/app/eye-track/features.service/eyeTrack';

@Component({
    selector: 'eye-scroll',
    templateUrl: './eye-scroll.component.html',
    styleUrls: ['./eye-scroll.component.scss']
  })
export class EyeScrollComponent implements OnInit {

  currentScrollVal: number = 0;
  private eyeTargetHeight: number | undefined;

  private upCurrBr: number = 100;
  private downCurrBr: number = 100;

  @ViewChild('eyeDownScroll', {static: true})
  eyeDownScroll!: ElementRef;

  @ViewChild('eyeUpScroll', {static: true})
  eyeUpScroll!: ElementRef;

  constructor(private eyeTrack: EyeTrack
  ) { }

  ngOnInit(): void {
    this.eyeTrack.startTracking = true;
    this.eyeTrack.target$
        .subscribe((point) => {
          console.log("window.scrollY " + window.scrollY)
          if (point.y > window.innerHeight - 50 || point.y < 50) {
            if (point.y < 50 && window.scrollY > 0) {
              this.eyeUpScroll.nativeElement.style.border = '4px solid MidnightBlue';
              this.eyeUpScroll.nativeElement.hidden =  false;
            } else {
              this.eyeUpScroll.nativeElement.style.border = '4px solid SkyBlue';
              this.eyeUpScroll.nativeElement.hidden =  true;            
            }
            if (point.y > window.innerHeight - 50 && document.body.offsetHeight + window.scrollY < document.body.scrollHeight) {
              this.eyeDownScroll.nativeElement.style.border = '4px solid MidnightBlue';
              this.eyeDownScroll.nativeElement.hidden =  false;
            } else {
              this.eyeDownScroll.nativeElement.style.border = '4px solid SkyBlue';
              this.eyeDownScroll.nativeElement.hidden =  true;
            }
            this.eyeTargetHeight = point.y;
          } else {
            this.eyeUpScroll.nativeElement.hidden =  true;
            this.eyeDownScroll.nativeElement.hidden =  true;
            this.eyeTargetHeight = undefined;
          }
        });
    this.eyeTrack.closeRightEye$
    .subscribe((value) => {
      if (this.eyeTargetHeight != undefined && value) {
        if (this.eyeTargetHeight > window.innerHeight - 50) {
          this.updateDownElement();
        } else {
          this.cancelDownElement();
        }
        if (this.eyeTargetHeight < 50) {
          this.updateUpElement();
        } else {
          this.cancelUpElement();
        }
      } else {
        this.cancelDownElement();
        this.cancelUpElement();
      }
    });
  }

  private updateDownElement() {
    this.downCurrBr -= 1;
    if (this.downCurrBr < 60) {
      this.downCurrBr = 100;
      if (document.body.scrollHeight > document.body.offsetHeight + window.scrollY) {
        let nextScrollY = Math.min(document.body.scrollHeight - document.body.offsetHeight, window.scrollY + 50);
        window.scrollTo(0, nextScrollY);
        if (nextScrollY == document.body.scrollHeight - document.body.offsetHeight) {
          this.eyeDownScroll.nativeElement.hidden =  true;   
        }
      }
    }
    this.eyeDownScroll.nativeElement.style.filter = 'brightness('+ this.downCurrBr + '%)';
  }

  private cancelDownElement() {
    this.downCurrBr == 100;
    this.eyeDownScroll.nativeElement.style.filter = 'brightness('+ this.downCurrBr + '%)';
  }

  private updateUpElement() {
    this.upCurrBr -= 1;
    if (this.upCurrBr < 60) {
      this.upCurrBr = 100;
      if (window.scrollY > 0) {
        let nextScrollY = Math.max(0, window.scrollY - 50);
        window.scrollTo(0, nextScrollY);
        if (nextScrollY == 0) {
          this.eyeUpScroll.nativeElement.hidden =  true;   
        }
      }
    }
    this.eyeUpScroll.nativeElement.style.filter = 'brightness('+ this.upCurrBr + '%)';
  }

  private cancelUpElement() {
    this.upCurrBr == 100;
    this.eyeUpScroll.nativeElement.style.filter = 'brightness('+ this.upCurrBr + '%)';
  }

}