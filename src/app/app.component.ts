import { DOCUMENT } from '@angular/common';
import {AfterViewInit, Component,  ElementRef,  HostListener,  OnInit, Renderer2 } from '@angular/core';
import { EyeTrackButtonDirective } from './decorators/directive/button-decorator';
import { EyeTrack } from './eye-track/features.service/eyeTrack';
import { EyeTrackSelectDirective } from './decorators/directive/select-decorator';
import { CurrentTrainData } from './eye-track/features.service/currentTrainData';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit,AfterViewInit  {
  startEyeTracking: boolean=true;

  constructor(private renderer: Renderer2,
              private butDir: EyeTrackButtonDirective,
              private currentTrainData: CurrentTrainData,
              private eyeTrack: EyeTrack
  ){}

  ngOnInit(): void {
    this.parseButtons();
    this.parseSelect();
  }

  private parseButtons() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      console.log(button);
      const elementRef = new ElementRef(button);
      let dir = new EyeTrackButtonDirective(elementRef, this.renderer, this.eyeTrack);      
    });
  }

  private parseSelect() {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
      console.log(select);
      const elementRef = new ElementRef(select);
      let dir = new EyeTrackSelectDirective(elementRef, this.renderer, this.eyeTrack);      
    });
  }

  ngAfterViewInit() {
    // this.currentTrainData.startTraining$.subscribe(
    //   (val) => {
    //     this.startEyeTracking = val;
    //   }
    // );
  }

  title = 'web-eye-tracking';
}
