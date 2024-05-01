import {Component, ElementRef, HostBinding, OnInit, Renderer2, ViewChild} from '@angular/core';
import { EyeTrack } from 'src/app/features.service/eyeTrack';

@Component({
    selector: 'eye-target',
    templateUrl: './eye-target.component.html',
    styleUrls: ['./eye-target.component.scss']
  })
export class EyeTargeComponent implements OnInit {

  left: number = 0;
  top: number = 0;
  moveIntervalId: any;

  @ViewChild('eyetarget', {static: true})
  target!: ElementRef;
  constructor(private eyeTrack: EyeTrack,
              private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.eyeTrack.startTracking = true;
    this.eyeTrack.left$
        .subscribe((val) => {
          this.left = val - 20;
        });
    this.eyeTrack.top$
        .subscribe((val) => {
          this.top = Math.max(0, Math.min(val - 20, window.innerHeight));
    });
    this.eyeTrack.closeRightEye$
        .subscribe((val) => {
          if (val) {
            this.renderer.setStyle(this.target.nativeElement, 'background-color', 'green');
          } else {
            this.renderer.setStyle(this.target.nativeElement, 'background-color', 'red');
          }
        });
  }

}