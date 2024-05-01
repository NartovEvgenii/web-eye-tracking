import {Component, OnInit} from '@angular/core';
import { CurrentTrainData } from 'src/app/features.service/currentTrainData';
import { DatasetService } from 'src/app/features.service/dataset';
import { EyeTrack } from 'src/app/features.service/eyeTrack';

declare var clm: any;

@Component({
    selector: 'camera',
    templateUrl: './camera.component.html',
    styleUrls: ['./camera.component.scss']
  })
export class CameraComponent implements OnInit {

  private ctrack: any;
  private video: any;
  private overlay: any;
  private overlayCC: any;

  private eyesCanvas!: HTMLCanvasElement;
  private eyesCtx: any;
  private currentEyeRect: any;

  private oneEyeCtx: any;
  
  constructor(private currentTrainData: CurrentTrainData,
              private eyeTrack: EyeTrack,
              private datasetService: DatasetService) { }
  
  public ngOnInit(): void {
    this.video = document.getElementById('webcam');
    this.overlay = document.getElementById('overlay');
    this.overlayCC = this.overlay.getContext('2d', { willReadFrequently: true });

    this.eyesCanvas = document.getElementById('eyes') as HTMLCanvasElement;
    this.eyesCtx = this.eyesCanvas.getContext('2d', { willReadFrequently: true });

    let oneeyeCanvas = document.getElementById('oneeye') as HTMLCanvasElement;
    this.oneEyeCtx = oneeyeCanvas.getContext('2d', { willReadFrequently: true });

    this.datasetService.eyeWidth = this.eyesCanvas.width;
    this.datasetService.eyeHeight = this.eyesCanvas.height;

    this.ctrack = new clm.tracker();
    this.ctrack.init();
    if (navigator.mediaDevices) {
        navigator.mediaDevices
          .getUserMedia({
            video: {
              width: 400,
              height: 300
            }
          })
          .then(stream => this.gumSuccess(stream))
          .catch(() => this.gumFail());
    } else {            
      console.log('Your browser does not seem to support getUserMedia. ');
    }

    this.video.addEventListener('canplay', this.startVideo(), false);
  
  }

  private gumSuccess(stream: MediaStream) {  
      // add camera stream if getUserMedia succeeded
      if ('srcObject' in this.video) {
        this.video.srcObject = stream;
        this.video.play();
      }

      this.video.onresize = function() {
        if (this.trackingStarted) {
          this.ctrack.stop();
          this.ctrack.reset();
          this.ctrack.start(this.video);
        }
      };

    }

    private gumFail() {
      console.log('Problem with getUserMedia. ');
    }

    private startVideo() {
      this.ctrack.start(this.video);
      this.currentTrainData.widthEye = this.eyesCanvas.width;
      this.currentTrainData.heightEye = this.eyesCanvas.height;
      this.positionLoop();
    }

    private positionLoop() {
      requestAnimationFrame(this.positionLoop.bind(this));
      const currentPosition = this.ctrack.getCurrentPosition();
      this.overlayCC.clearRect(
        0,
        0,
        this.video.videoWidth,
        this.video.videoHeight,
      );
      if (currentPosition) {
        this.trackFace(currentPosition);
        if(this.currentTrainData.startTraining$.value){
          this.setCurrData();
        }
        if(this.eyeTrack.startTracking$.value){
          this.updateEyeTrackPosition();
        }
        this.ctrack.draw(this.overlay);
      }
    }

    private trackFace(position:any) {
      const rect = this.getEyesRect(position);
      this.currentEyeRect = rect;

      this.overlayCC.strokeStyle = 'red';   
      this.overlayCC.drawImage(
        this.video,
        0,
        0,
      );   
      this.overlayCC.strokeRect(rect[0], rect[1], rect[2], rect[3]);
      this.eyesCtx.drawImage(
        this.video,
        rect[0],
        rect[1],
        rect[2],
        rect[3],
        0,
        0,
        this.eyesCanvas.width,
        this.eyesCanvas.height,
      );
      this.oneEyeCtx.putImageData(this.imageToYCbCr(
                                  this.eyesCtx.getImageData(0, 0, this.eyesCanvas.width / 2, this.eyesCanvas.height)), 
      0, 0);
      const img = this.overlay as HTMLCanvasElement;
      this.currentTrainData.fullimage = img.toDataURL("image/png");
    }

    private getEyesRect(position:any) {
      const minX = position[19][0] + 3;
      const maxX = position[15][0] - 3;
      const minY =
        Math.min(
          position[20][1],
          position[21][1],
          position[17][1],
          position[16][1],
        ) + 6;
      const maxY =
        Math.max(
          position[23][1],
          position[26][1],
          position[31][1],
          position[28][1],
        ) + 3;

      const width = maxX - minX;
      const height = maxY - minY - 5;

      return [minX, minY, width, height * 1.25];
    }

    private setCurrData() {
      let x = this.currentEyeRect[0] + this.currentEyeRect[2] / 2;
      let y = this.currentEyeRect[1] + this.currentEyeRect[3] / 2;
  
      this.currentTrainData.middleEyeX = (x / this.video.videoWidth) * 2 - 1;
      this.currentTrainData.middleEyeY = (y / this.video.videoHeight) * 2 - 1;
  
      this.currentTrainData.rectWidthEye = this.currentEyeRect[2] / this.video.videoWidth;
      this.currentTrainData.rectHeightEye = this.currentEyeRect[3] / this.video.videoHeight;
      
      this.currentTrainData.image = this.eyesCanvas;
    }

    private updateEyeTrackPosition(){
      let x = this.currentEyeRect[0] + this.currentEyeRect[2] / 2;
      let y = this.currentEyeRect[1] + this.currentEyeRect[3] / 2;
  
      x = (x / this.video.videoWidth) * 2 - 1;
      y = (y / this.video.videoHeight) * 2 - 1;
  
      let rectWidthEye = this.currentEyeRect[2] / this.video.videoWidth;
      let rectHeightEye = this.currentEyeRect[3] / this.video.videoHeight;

      const metaInfos = this.datasetService.getMetaInfos(x, y, rectWidthEye, rectHeightEye);
      const image = this.eyesCanvas;
      this.eyeTrack.updatePosition(image, metaInfos);
    }

   public imageToYCbCr(imageData:any){
    const data = imageData.data;
    let black = 0;
    let white = 0;
    for (let i = 0; i < data.length; i += 4) {
      const R = data[i];
      const G = data[i + 1];
      const B = data[i + 2];
  
      // Convert RGB to YCbCr
      const Y = 0.299 * R + 0.587 * G + 0.114 * B;
      const Cb = 128 - 0.168736 * R - 0.331264 * G + 0.5 * B;
      const Cr = 128 + 0.5 * R - 0.418688 * G - 0.081312 * B;
  
      const avg = (Y + Cb + Cr) / 3;
      const color = avg > 110 ? 255 : 0;
      if (avg > 110) {
        black++;
      } else {
        white++;
      }
      data[i] = color;
      data[i + 1] = color;
      data[i + 2] = color;
    }
    console.log("PERCENT " + (black * 100 / (white + black)));
    return imageData;
   }

}