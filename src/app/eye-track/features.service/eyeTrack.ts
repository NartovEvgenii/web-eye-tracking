import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Rank, Tensor } from "@tensorflow/tfjs";
import { EyeTrackModel } from "./eyeTrackModel";
import { DatasetService } from "./dataset";

class Point {
    x: number;
    y: number;
    constructor(x:number, y:number) {
        this.x = x;
        this.y = y;
      }
}

@Injectable({
    providedIn: 'root',
   })
export class EyeTrack {
    startTracking$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    maxWidth:number  = window.innerWidth;
    maxHeight:number  = window.innerHeight;
    cachedValsLeft: Array<number> = [];
    cachedValsTop: Array<number> = [];

    target$: BehaviorSubject<Point> = new BehaviorSubject<Point>(new Point(0, 0));
    closeRightEye$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    closeLeftEye$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    
    
    
    constructor(private readonly eyeTrackModel: EyeTrackModel,
                private datasetService: DatasetService) {
    }

    public async updatePosition(image: HTMLCanvasElement, metaInfos: Tensor<Rank>, position:any, rect:any){
        this.checkCloseRightEye(image.getContext('2d')?.getImageData(0, 0, image.width, image.height), position, rect);
        this.checkCloseLeftEye(image.getContext('2d')?.getImageData(image.width / 2, 0, image.width / 2, image.height));
        const batchImage = this.datasetService.batchImage(image);
        const img = await this.datasetService.convertImage(batchImage);
        const prediction = this.eyeTrackModel.currentModel!.predict([img, metaInfos]) as any;
        const predictionData = await prediction.data();
        if (this.cachedValsLeft.length >= 6) {
            this.cachedValsLeft.sort((n1,n2) => n1 - n2);
            this.cachedValsTop.sort((n1,n2) => n1 - n2);
            if (!this.closeRightEye$.value) {
                this.target$.next(new Point(this.cachedValsLeft[this.cachedValsLeft.length / 2], 
                                            this.cachedValsTop[this.cachedValsTop.length / 2]))
            }
            this.cachedValsLeft = [];
            this.cachedValsTop = [];
        }
        this.cachedValsLeft.push(predictionData[0]  * this.maxWidth);
        this.cachedValsTop.push(predictionData[1] * this.maxHeight);

        // this.left$.next(predictionData[0]  * this.maxWidth);
        // this.top$.next(predictionData[1] * this.maxHeight);
    }
    
    public set startTracking(value: boolean) {
        this.startTracking$.next(value);
    }

    private async checkCloseRightEye(imageData:any, position:any, rect:any){        
        const minX = position[24][0] - rect[0] - 7;
        const minY = position[24][1] - rect[1];

        const eyeX = position[27][0] - rect[0] - 7;
        const eyeY = position[27][1] - rect[1];
        
        const maxX = position[26][0] - rect[0] - 7;
        const maxY = position[26][1] - rect[1];
        let percent = 0;
        percent += this.getPercentCloseEye(imageData, minX, minY, eyeX, eyeY);
        percent += this.getPercentCloseEye(imageData, eyeX, eyeY, maxX, maxY);
        percent = percent /2;
        if (percent < 25) {
            this.closeRightEye$.next(true);
        } else {
            this.closeRightEye$.next(false);
        }
    }

    private async checkCloseLeftEye(imageData:any){
        if (0 > 98) {
            this.closeLeftEye$.next(true);
        } else {
            this.closeLeftEye$.next(false);
        }
    }

    public getPercentCloseEye(imageData:any, x1:any, y1:any, x2:any, y2:any) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        var length = Math.max(Math.abs(dx), Math.abs(dy));
        let percent = 0;
        for (var i = 0; i <= length; i++) {
            var x = x1 + i / length * dx;
            var y = y1 + i / length * dy;
            percent += this.getPercentPixel(imageData, Math.round(x), Math.round(y));
        }
        return percent / length;
    }

    
  private getPercentPixel(imageData:any, x:any, y:any) {
    let black = 0;
    let white = 0;
    for (var i = -1; i <= 1; i++) {
      for (var j = -1; j <= 1; j++) {
        var index = ((y + j) * imageData.width + x + i) * 4;
        if (115 > this.getAvgColor(imageData.data, index)) {
          black++;
        } else {
          white++;
        }
      }
    }
    return black * 100 / (white + black);
  }

  private getAvgColor(imageData:any, index:number) {
    const R = imageData[index];
    const G = imageData[index + 1];
    const B = imageData[index + 2];

    // Convert RGB to YCbCr
    const Y = 0.299 * R + 0.587 * G + 0.114 * B;
    const Cb = 128 - 0.168736 * R - 0.331264 * G + 0.5 * B;
    const Cr = 128 + 0.5 * R - 0.418688 * G - 0.081312 * B;

    return (Y + Cb + Cr) / 3;
  }
    
}