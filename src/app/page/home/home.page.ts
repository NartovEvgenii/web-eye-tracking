import {Component, HostListener, OnInit} from '@angular/core';
import { Observable } from 'rxjs';
import { CurrentTrainData } from 'src/app/features.service/currentTrainData';
import { DatasetService } from 'src/app/features.service/dataset';
import { EyeTrackModel } from 'src/app/features.service/eyeTrackModel';

@Component({
    selector: 'home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss']
  })
export class HomePage implements OnInit {

  startTraining: boolean=false;
  startEyeTracking: boolean=false;
  addDataIntervalId: any;

  
  clientX: number=0;  
  clientY: number=0;

  constructor(
    private readonly datasetservice: DatasetService,
    private currentTrainData: CurrentTrainData,
    private eyeTrackModel:EyeTrackModel
  ) {
  }

  @HostListener('mousemove', ['$event']) onMouseMove(event: { clientX: any; clientY: any; }) {
      this.clientX = event.clientX / window.innerWidth;
      this.clientY = event.clientY / window.innerHeight; 
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: any) {
      this.currentTrainData.targetX = this.clientX;
      this.currentTrainData.targetY = this.clientY;
      this.addDataToDataset();    
  }

  ngOnInit(): void {
    this.currentTrainData.startTraining = true;
  }

  createDataset() {
    this.startTraining = true;
    this.currentTrainData.startTraining = true;
    this.addDataIntervalId = setInterval(() => this.addDataToDataset(), 500);
    this.currentTrainData.startTraining$
                .subscribe((val) => {
                  if(!val){
                    this.startTraining = false;
                    clearInterval(this.addDataIntervalId);
                  }
                });
  }

  private addDataToDataset() {
    this.datasetservice.addDataToDataset(this.currentTrainData);
  }

  fitModel() {
    this.eyeTrackModel.fitModel();
  }

  test2() {
    this.startEyeTracking = !this.startEyeTracking;
  }

}