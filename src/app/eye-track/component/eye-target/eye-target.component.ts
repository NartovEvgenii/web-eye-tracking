import {Component, ElementRef, HostBinding, OnInit, Renderer2, ViewChild} from '@angular/core';
import { EyeTrack } from 'src/app/eye-track/features.service/eyeTrack';

@Component({
    selector: 'eye-target',
    templateUrl: './eye-target.component.html',
    styleUrls: ['./eye-target.component.scss']
  })
export class EyeTargeComponent implements OnInit {

  left: number = 0;
  top: number = 0;
  moveIntervalId: any;

  closeRight:boolean = false;
  closeLeft:boolean = false;

  @ViewChild('eyetarget', {static: true})
  target!: ElementRef;
  constructor(private eyeTrack: EyeTrack,
              private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.eyeTrack.startTracking = true;
    this.eyeTrack.target$
        .subscribe((point) => {
          this.left = Math.max(0, point.x - 20);
          this.top = Math.max(0, Math.min(point.y - 20, window.innerHeight));
        });
    this.eyeTrack.closeRightEye$
        .subscribe((val) => {
          if (val) {
            this.closeRight = true;
            this.renderer.setStyle(this.target.nativeElement, 'background-color', 'green');
          } else {
            this.closeRight = false;
            if (!this.closeLeft) {
              this.renderer.setStyle(this.target.nativeElement, 'background-color', 'red');
            }
          }
        });
    this.eyeTrack.closeLeftEye$
    .subscribe((val) => {
      if (val) {
        this.closeLeft = true;
        this.renderer.setStyle(this.target.nativeElement, 'background-color', 'yellow');
      } else {
        this.closeLeft = false;
        if (!this.closeRight) {
          this.renderer.setStyle(this.target.nativeElement, 'background-color', 'red');
        }
      }
    });
  }

}