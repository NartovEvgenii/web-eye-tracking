import {Component, ElementRef, HostBinding, OnInit, ViewChild} from '@angular/core';
import { CurrentTrainData } from 'src/app/features.service/currentTrainData';

declare var clm: any;

@Component({
    selector: 'train-target',
    templateUrl: './train-target.component.html',
    styleUrls: ['./train-target.component.scss']
  })
export class TrainTargeComponent implements OnInit {

  private _left: number = 0;
  private _top: number = 0;

  moveId: any;

  currentDirection: number = 0;
  
  // [0] - >
  // [1] - <
  // [2] - \/
  // [3] - /\
  directionArr: Array<boolean> = [false, false, false, false];

  maxWidth:number  = window.innerWidth - 5;
  maxHeight:number  = window.innerHeight - 5;
  
  deltaWidth:number = 10; 
  deltaHeight:number = 10;

  startWidth:number = 0;
  endWidth:number = this.maxWidth;

  startHeight:number = 0;
  endHeight:number = this.maxHeight;

  @ViewChild('target', {static: true})
  target!: ElementRef;

  constructor(private currentTrainData: CurrentTrainData) { }

  ngOnInit(): void {
    this.left = 0;
    this.top = 0;
    this.currentTrainData.startTraining = true;
    this.directionArr[0] = true;
    this.moveId = setInterval(() => this.moveTargetByDirection(), 80);
  }


  private moveTargetByDirection() {
    let sw = this.moveTarget();    
    if(sw){
      switch(this.currentDirection){        
        case 1: case 7: case 15:{
          this.directionArr[2] = true;
          break;
        }
        case 2: case 16:{
          this.directionArr[1] = true;
          break;
        }
        case 3: case 17:{
          this.directionArr[3] = true;
          break;
        }
        case 4:{
          this.directionArr[0] = true;
          this.directionArr[2] = true;
          this.deltaHeight = ((this.maxHeight - this.target.nativeElement.offsetHeight) * this.deltaWidth) 
                              / (this.maxWidth - this.target.nativeElement.offsetWidth);
          break;
        }
        case 6:{
          this.directionArr[1] = true;
          this.directionArr[3] = true;
          this.startHeight = (this.maxHeight - this.target.nativeElement.offsetHeight)/ 2;
          break;
        }
        case 9:{
          this.directionArr[0] = true;
          this.directionArr[3] = true;
          this.startHeight = 0;
          break;
        }
        case 11:{
          this.directionArr[1] = true;
          this.startWidth = (this.maxWidth - this.target.nativeElement.offsetWidth) / 4;
          this.directionArr[2] = true;
          this.endHeight = (this.maxHeight - this.target.nativeElement.offsetHeight) / 2;
          this.startHeight = (this.maxHeight - this.target.nativeElement.offsetHeight) / 4;
          break;
        }
        case 12:{
          this.directionArr[3] = true;
          this.endHeight = (this.maxHeight - this.target.nativeElement.offsetHeight) * 3 / 4;
          this.endWidth = (this.maxWidth - this.target.nativeElement.offsetWidth) * 3 / 4;
          break;
        }
        case 14:{
          this.directionArr[0] = true;
          break;
        }
      }
      if(this.directionArr.every(element => element === false)){
        clearInterval(this.moveId);
      }
    }
  }

  private moveTarget() {
    let sw = false;
    if(this.directionArr[0]){
      if(this.left < this.endWidth - this.target.nativeElement.offsetWidth){
        this.left+=this.deltaWidth;
      } else  {
        this.left = this.endWidth - this.target.nativeElement.offsetWidth;
        this.directionArr[0] = false;
        this.currentDirection++;
        sw = true;
      }
    }
    if(this.directionArr[1]){
      if(this.left > this.startWidth){
        this.left-=this.deltaWidth;
      } else  {
        this.left = this.startWidth;
        this.directionArr[1] = false;
        this.currentDirection++;
        sw = true;
      }
    }
    if(this.directionArr[2]){
      if(this.top < this.endHeight - this.target.nativeElement.offsetHeight){
        this.top+=this.deltaHeight;
      } else  {
        this.top = this.endHeight - this.target.nativeElement.offsetHeight;
        this.directionArr[2] = false;
        this.currentDirection++;
        sw = true;
      }
    }
    if(this.directionArr[3]){
      if(this.top > this.startHeight){
        this.top-=this.deltaHeight;
      } else  {
        this.top = this.startHeight;
        this.directionArr[3] = false;
        this.currentDirection++;
        sw = true;
      }
    }
    return sw;
  }

  
  public get left(): number {
    return this._left;
  }

  public set left(value: number) {
    this.setCurrDataTargetX(value);
    this._left = value;
  }

  
  public get top(): number {
    return this._top;
  }

  public set top(value: number) {
    this.setCurrDataTargetY(value);
    this._top = value;
  }

  private setCurrDataTargetX(value: number) {
    this.currentTrainData.targetX = value + this.target.nativeElement.offsetWidth / 2;
  }

  private setCurrDataTargetY(value: number) {
    this.currentTrainData.targetY = value + this.target.nativeElement.offsetHeight / 2;
  }
  

}