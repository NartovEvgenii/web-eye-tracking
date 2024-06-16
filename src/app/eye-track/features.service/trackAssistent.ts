import { ElementRef, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Rank, Tensor } from "@tensorflow/tfjs";
import { EyeTrackModel } from "./eyeTrackModel";
import { DatasetService } from "./dataset";
import { EyeTrack } from "./eyeTrack";

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
export class TrackAssistent {
    startTracking$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    maxWidth:number  = window.innerWidth;
    maxHeight:number  = window.innerHeight;
    currentElements: Array<ElementRef> = [];
    OFFSET_LENGTH:number = 50;

    target$: BehaviorSubject<Point> = new BehaviorSubject<Point>(new Point(0, 0));
    closeRightEye$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    closeLeftEye$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    
    
    
    constructor(private eyeTrack: EyeTrack) {
        this.eyeTrack.target$
            .subscribe((point) => {
                let minPoint = this.getNearestElem(point);
                if (minPoint == null) {
                    minPoint = point
                }
                console.log(minPoint);
                this.target$.next(minPoint);
        });
        this.eyeTrack.closeRightEye$
            .subscribe((value) => {
                this.closeRightEye$.next(value);
        });
    }


    private getNearestElem(point:Point){
        let minLength = Number.MAX_VALUE;
        let minPoint = null;
        for(var elem in this.currentElements) {
            let rect = this.currentElements[elem].nativeElement.getBoundingClientRect();
            if (this.isInsideRect(point, rect)) {
                return null;
            }
            let elemCen = new Point(rect.x + rect.width / 2, rect.y + rect.height / 2);
            let offsetPoint = this.getMinLength(point, rect);
            let currenLen = this.getLength(offsetPoint);
            if (currenLen < minLength && currenLen < this.OFFSET_LENGTH) {
                minLength = currenLen;
                minPoint = new Point(point.x + offsetPoint.x, point.y + offsetPoint.y);;
            }
        }
        return minPoint;
    }

    private getLength(point:Point){
        return Math.sqrt(Math.pow((point.x), 2) + Math.pow((point.y), 2));
    }

    private getMinLength(point:Point, rect:any){
        let minX = 0;
        if (point.x < rect.x) {
            minX = (rect.x - point.x);
        } else if (point.x > (rect.x + rect.width)) {
            minX = (rect.x + rect.width) - point.x;
        }
        let minY = 0;
        if (point.y < rect.y) {
            minY = (rect.y - point.y);
        } else if (point.y > (rect.y + rect.height)) {
            minY =(rect.y + rect.height) - point.y;
        }
        return new Point(minX, minY);
    }

    private isInsideRect(point:Point, rect:any){
        return (point.x >= rect.x && point.x <= (rect.x + rect.width) 
                && point.y >= rect.y && point.y <= (rect.y + rect.height))
    }

    public addDecorElement(element:ElementRef) {
        this.currentElements.push(element);
    }
    
}