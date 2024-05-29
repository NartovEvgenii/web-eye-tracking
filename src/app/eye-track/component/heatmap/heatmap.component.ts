import {Component, ElementRef, HostBinding, OnInit, ViewChild} from '@angular/core';
import { DatasetService } from 'src/app/eye-track/features.service/dataset';
import { EyeTrackModel } from 'src/app/eye-track/features.service/eyeTrackModel';

@Component({
    selector: 'heatmap',
    templateUrl: './heatmap.component.html',
    styleUrls: ['./heatmap.component.scss']
  })
export class HeatMapComponent implements OnInit {

  private heatmapCtx: any;

  constructor(
    private readonly datasetservice: DatasetService,
    private readonly eyeTrackModel:EyeTrackModel
  ) {
  }

  ngOnInit(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    let eyesCanvas = document.getElementById('heatMap') as HTMLCanvasElement;
    eyesCanvas.width = width;
    eyesCanvas.height = height;
    this.heatmapCtx = eyesCanvas.getContext('2d', { willReadFrequently: true });
    
    this.heatmapCtx.clearRect(0, 0, width, height);    
    this.fillHeatmap(this.datasetservice.val, width, height, 30);
    this.fillHeatmap(this.datasetservice.train, width, height, 15);
  }

  fillHeatmap(data: any, width:number, height:number, radius:number) {
   
    let predictions = this.eyeTrackModel.currentModel!.predict(data.x) as any;
    predictions = predictions.arraySync();
    let trueX, trueY, predX, predY, errorX, errorY, error, pointX, pointY;
    for (let i = 0; i < data.n; i++) {
      const dataY = data.y.arraySync();
      trueX = dataY[i][0];
      trueY = dataY[i][1];
      predX = predictions[i][0];
      predY = predictions[i][1];
      errorX = Math.pow(predX - trueX, 2);
      errorY = Math.pow(predY - trueY, 2);
      error = Math.min(Math.sqrt(Math.sqrt(errorX + errorY)), 1);

      pointX = Math.floor(trueX * width);
      pointY = Math.floor(trueY * height);

      this.heatmapCtx.beginPath();
      this.heatmapCtx.fillStyle = this.getHeatColor(error, 0.5);
      this.heatmapCtx.arc(pointX, pointY, radius, 0, 2 * Math.PI);
      this.heatmapCtx.fill();
    }
  }

  private getHeatColor(value: number, alpha:number) {
    if (typeof alpha == 'undefined') {
      alpha = 1.0;
    }
    const hue = ((1 - value) * 120).toString(10);
    return 'hsla(' + hue + ',100%,50%,' + alpha + ')';
  }

}