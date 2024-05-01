import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Rank, Tensor } from "@tensorflow/tfjs";
import { EyeTrackModel } from "./eyeTrackModel";
import { DatasetService } from "./dataset";

@Injectable({
    providedIn: 'root',
   })
export class EyeTrack {
    startTracking$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    maxWidth:number  = window.innerWidth;
    maxHeight:number  = window.innerHeight;
    cachedValsLeft: Array<number> = [];
    cachedValsTop: Array<number> = [];

    left$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    top$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    closeRightEye$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    
    
    constructor(private readonly eyeTrackModel: EyeTrackModel,
                private datasetService: DatasetService) {
    }

    public async updatePosition(image: HTMLCanvasElement, metaInfos: Tensor<Rank>){
        this.checkCloseRightEye(image.getContext('2d')?.getImageData(0, 0, image.width / 2, image.height));
        const batchImage = this.datasetService.batchImage(image);
        const img = await this.datasetService.convertImage(batchImage);
        const prediction = this.eyeTrackModel.currentModel!.predict([img, metaInfos]) as any;
        const predictionData = await prediction.data();
        if (this.cachedValsLeft.length >= 6) {
            this.cachedValsLeft.sort((n1,n2) => n1 - n2);
            this.cachedValsTop.sort((n1,n2) => n1 - n2);
            this.left$.next(this.cachedValsLeft[this.cachedValsLeft.length / 2]);
            this.top$.next(this.cachedValsTop[this.cachedValsTop.length / 2]);
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

    private async checkCloseRightEye(imageData:any){
        if (this.imageToYCbCr(imageData) > 96) {
            this.closeRightEye$.next(true);
        } else {
            this.closeRightEye$.next(false);
        }
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
          if (avg > 110) {
            black++;
          } else {
            white++;
          }
        }
        return black * 100 / (white + black);
       }
}