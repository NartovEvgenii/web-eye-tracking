import {Component, ElementRef, HostBinding, OnInit, ViewChild} from '@angular/core';
import { EyeTrack } from 'src/app/features.service/eyeTrack';

@Component({
    selector: 'eye-target',
    templateUrl: './eye-target.component.html',
    styleUrls: ['./eye-target.component.scss']
  })
export class EyeTargeComponent implements OnInit {

  left: number = 0;
  top: number = 0;

  @ViewChild('eyetarget', {static: true})
  target!: ElementRef;

  constructor(private eyeTrack: EyeTrack) { }

  ngOnInit(): void {
    this.eyeTrack.startTracking = true;
    
    this.eyeTrack.left$
        .subscribe((val) => {
          console.log("left" + val);
          this.left = val;
        });
    this.eyeTrack.top$
        .subscribe((val) => {
          console.log("top" + val);
          this.top = val;
    });
  }
    

}