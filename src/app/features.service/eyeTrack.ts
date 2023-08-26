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

    left$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    top$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    
    
    constructor(private readonly eyeTrackModel: EyeTrackModel,
                private datasetService: DatasetService) {
    }

    public async updatePosition(image: HTMLCanvasElement, metaInfos: Tensor<Rank>){
        const batchImage = this.datasetService.batchImage(image);
        const img = await this.datasetService.convertImage(batchImage);
        const prediction = this.eyeTrackModel.currentModel!.predict([img, metaInfos]) as any;
        const predictionData = await prediction.data();

        this.left$.next(predictionData[0]  * this.maxWidth);
        this.top$.next(predictionData[1] * this.maxHeight);
    }
    
    public set startTracking(value: boolean) {
        this.startTracking$.next(value);
    }
}