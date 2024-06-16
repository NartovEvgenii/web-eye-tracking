import { DOCUMENT } from '@angular/common';
import {AfterViewInit, Component,  ElementRef,  HostListener,  OnInit, Renderer2 } from '@angular/core';
import { EyeTrackButtonDirective } from './decorators/directive/button-decorator';
import { EyeTrackSelectDirective } from './decorators/directive/select-decorator';
import { CurrentTrainData } from './eye-track/features.service/currentTrainData';
import { TrackAssistent } from './eye-track/features.service/trackAssistent';
import { EyeTrack } from './eye-track/features.service/eyeTrack';
import { EyeTrackHrefDirective } from './decorators/directive/href-decortor';
import { HttpClient } from '@angular/common/http';
import { EyeTrackModel } from './eye-track/features.service/eyeTrackModel';
import { InjectDecorators } from './decorators/features.service/injectDecorators';

declare var chrome: any;

export enum KeyCodes {
  I = 73
}

class Point {
  x: number;
  y: number;
  constructor(x:number, y:number) {
      this.x = x;
      this.y = y;
    }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit  {

  startEyeTracking: boolean=true;

  constructor(private renderer: Renderer2,
              private currentTrainData: CurrentTrainData,
              private eyeTrack: EyeTrack,
              private http: HttpClient,
              private eyeTrackAssist: TrackAssistent,
              private eyeTrackModel:EyeTrackModel,
              private injectDecorators: InjectDecorators
  ){}

  // @HostListener('document:keyup', ['$event'])
  // handleKeyboardEvent(event: any) {
  //     if (event.keyCode == KeyCodes.I) {
  //       for (var i = 0; i <= 10; i++) {
  //         this.eyeTrack.closeRightEye$.next(true);
  //       }
  //     }
  // }

  ngOnInit(): void {
    // document.body.addEventListener('mousemove', (event:any) => {
    //   console.log(new Point(event.clientX, 
    //     event.clientY))
    //     this.eyeTrack.target$.next(new Point(event.clientX, 
    //       event.clientY))
    // });

    //this.loadModelFromChrome();
    this.injectDecorators.injectDecorators(document, this.renderer);
    document.body.addEventListener('DOMNodeInserted', (event:any) => {
        var element = event.target;
        this.injectDecorators.injectDecorators(element, this.renderer);
    });
  }

  private loadModelFromChrome() {
    try {
      const extensionModelUrl = chrome.runtime.getURL('model/model.json'); // Путь к файлу в расширен
      const extensionWeightsUrl = chrome.runtime.getURL('model/model.weights.bin'); // Путь к файлу с весами
      this.http.get(extensionModelUrl, { responseType: 'arraybuffer' })
      .subscribe((file1: any) => {
        // Обработка полученного файла
        const modelFile = new File([file1], 'model.json');
        console.log(modelFile)
        this.http.get(extensionWeightsUrl, { responseType: 'arraybuffer' })
          .subscribe((file2: any) => {
            // Обработка полученного файла
            const weightFile = new File([file2], 'model.weights.bin');
            console.log(weightFile);
            this.eyeTrackModel.loadModel(modelFile, weightFile);
          });
      });
    }
    catch(e:any){
      console.log('Exception')
      console.log(e)
    }
  }

  title = 'web-eye-tracking';
}
