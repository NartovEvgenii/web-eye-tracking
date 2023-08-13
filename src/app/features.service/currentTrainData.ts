import { Injectable, NgModule } from "@angular/core";

@Injectable({
    providedIn: 'root',
   })
export class CurrentTrainData {

    private _startTraining: boolean = false;

    private _image: HTMLCanvasElement | undefined;

    private _targetX: number = 0;
    private _targetY: number = 0;

    private _middleEyeX: number = 0;
    private _middleEyeY: number = 0;
    private _rectWidthEye: number = 0;
    private _rectHeightEye: number = 0;


    public get image(): HTMLCanvasElement {
        return this._image!;
    }
    public set image(value: HTMLCanvasElement) {
        this._image = value;
    }

    public get targetX(): number {
        return this._targetX;
    }
    public set targetX(value: number) {
        this._targetX = value;
    }
    
    public get targetY(): number {
        return this._targetY;
    }
    public set targetY(value: number) {
        this._targetY = value;
    }

    public get middleEyeX(): number {
        return this._middleEyeX;
    }
    public set middleEyeX(value: number) {
        this._middleEyeX = value;
    }

    public get middleEyeY(): number {
        return this._middleEyeY;
    }
    public set middleEyeY(value: number) {
        this._middleEyeY = value;
    }
    
    public get rectWidthEye(): number {
        return this._rectWidthEye;
    }
    public set rectWidthEye(value: number) {
        this._rectWidthEye = value;
    }
    
    public get rectHeightEye(): number {
        return this._rectHeightEye;
    }
    public set rectHeightEye(value: number) {
        this._rectHeightEye = value;
    }

    public get startTraining(): boolean {
        return this._startTraining;
    }
    public set startTraining(value: boolean) {
        this._startTraining = value;
    }


}