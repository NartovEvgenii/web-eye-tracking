import {Component, OnInit} from '@angular/core';
import { CurrentTrainData } from 'src/app/features.service/currentTrainData';
import { DatasetService } from 'src/app/features.service/dataset';

@Component({
    selector: 'home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss']
  })
export class HomePage implements OnInit {

  startTraining: boolean=false;

  constructor(
    private readonly datasetservice: DatasetService,
    private currentTrainData: CurrentTrainData
  ) {
  }

  ngOnInit(): void {
  }

  createDataset() {
    this.startTraining = true;
  }

  test() {
    this.datasetservice.addDataToDataset(this.currentTrainData);
  }

  

}