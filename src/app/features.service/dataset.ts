import { Injectable } from "@angular/core";
import * as tf from '@tensorflow/tfjs';
import { CurrentTrainData } from "./currentTrainData";
import { Rank, Tensor } from "@tensorflow/tfjs";

interface DataItem {
  n: number;
  x: Tensor<Rank>[] | null;
  y: Tensor<Rank> | null;
}

@Injectable({
    providedIn: 'root'
  })
  export class DatasetService {    

    train: DataItem  = {n: 0,x: null,y: null };

    val: DataItem  = {n: 0,x: null,y: null };

    eyeHeight:number = 0; 
    eyeWidth: number = 0;
    
    public addDataToDataset(currentTrainData: CurrentTrainData) {
      tf.tidy(() => {
        const img = this.batchImage(currentTrainData.image);
        const targetPos = [currentTrainData.targetX, currentTrainData.targetY];
        const metaInfos = tf.keep(this.getMetaInfosByCurr(currentTrainData));
        console.log(currentTrainData);
        this.addExample(img, metaInfos, targetPos);
      });
    }

    public batchImage(image: HTMLCanvasElement) {
      const img = image;
      return tf.tidy(function() {
        const image = tf.browser.fromPixels(img);
        const batchedImage = image.expandDims(0);
        return batchedImage
          .toFloat()
          .div(tf.scalar(127))
          .sub(tf.scalar(1));
      });
    }

    
    private getMetaInfosByCurr(currentTrainData: CurrentTrainData) {
      let x = currentTrainData.middleEyeX;
      let y = currentTrainData.middleEyeY;
  
      const rectWidth  = currentTrainData.rectWidthEye;
      const rectHeight = currentTrainData.rectHeightEye;
  
      return this.getMetaInfos(x, y, rectWidth, rectHeight);
    }

    public getMetaInfos(x:number, y:number, rectWidth:number, rectHeight:number) {  
      return tf.tidy(() => {
        return tf.tensor1d([x, y, rectWidth, rectHeight]).expandDims(0);
      });
    }

    private async addExample(image:Tensor<Rank>, 
      metaInfos:Tensor<Rank>, target:any) {
      target = tf.keep(
        tf.tidy(function() {
          return tf.tensor1d(target).expandDims(0);
        }),
      );
  
      const convertedImage = await this.convertImage(image);
  
      this.addToDataset(convertedImage, metaInfos, target);
  
    }

    public async convertImage(image:any) {
      const imageShape = image.shape;
      const imageArray = await image.array();
      const w = imageShape[1];
      const h = imageShape[2];
  
      const data = [new Array(w)];
      const promises: any[] = [];
      for (let x = 0; x < w; x++) {
        data[0][x] = new Array(h);
  
        for (let y = 0; y < h; y++) {
          const grayValue = this.rgbToGrayscale(imageArray, 0, x, y);
          data[0][x][y] = [grayValue, (x / w) * 2 - 1, (y / h) * 2 - 1];
        }
      }
  
      await Promise.all(promises);
  
      return tf.tensor(data);
    }

    private rgbToGrayscale(imageArray:any, n:any, x:any, y:any) {
      let r = (imageArray[n][x][y][0] + 1) / 2;
      let g = (imageArray[n][x][y][1] + 1) / 2;
      let b = (imageArray[n][x][y][2] + 1) / 2;
  
      const exponent = 1 / 2.2;
      r = Math.pow(r, exponent);
      g = Math.pow(g, exponent);
      b = Math.pow(b, exponent);
  
      const gleam = (r + g + b) / 3;
      return gleam * 2 - 1;
    }

    private addToDataset(image:Tensor<Rank>, metaInfos:Tensor<Rank>, target:Tensor<Rank>) {
      const set = Math.random() < 0.2 ? this.val : this.train;
  
      if (set.x == null) {
        set.x = [tf.keep(image), tf.keep(metaInfos)];
        set.y = tf.keep(target);
      } else {
        const oldImage = set.x[0];
        set.x[0] = tf.keep(oldImage.concat(image, 0));
  
        const oldEyePos = set.x[1];
        set.x[1] = tf.keep(oldEyePos.concat(metaInfos, 0));
  
        const oldY = set.y;
        set.y = tf.keep(oldY!.concat(target, 0));
  
        tf.dispose([oldImage, oldEyePos, oldY!, target]);
      }
  
      set.n += 1;
    }

    public toJSON() { 
      console.log("save to json");
      return {
        inputWidth: this.eyeWidth,
        inputHeight: this.eyeHeight,
        train: {
          shapes: {
            x0: this.train.x![0].shape,
            x1: this.train.x![1].shape,
            y: this.train.y!.shape,
          },
          n: this.train.n,
          x: this.train.x && [
            this.tensorToArray(this.train.x[0]),
            this.tensorToArray(this.train.x[1]),
          ],
          y: this.tensorToArray(this.train.y!),
        },
        val: {
          shapes: {
            x0: this.val.x![0].shape,
            x1: this.val.x![1].shape,
            y: this.val.y!.shape,
          },
          n: this.val.n,
          x: this.val.x && [
            this.tensorToArray(this.val.x[0]),
            this.tensorToArray(this.val.x[1]),
          ],
          y: this.tensorToArray(this.val.y!),
        },
      };
    };

    public fromJSON(data:any) {
      this.eyeWidth = data.inputWidth;
      this.eyeHeight = data.inputHeight;
      this.train.n = data.train.n;
      this.train.x = data.train.x && [
        tf.tensor(data.train.x[0], data.train.shapes.x0),
        tf.tensor(data.train.x[1], data.train.shapes.x1),
      ];
      this.train.y = tf.tensor(data.train.y, data.train.shapes.y);
      this.val.n = data.val.n;
      this.val.x = data.val.x && [
        tf.tensor(data.val.x[0], data.val.shapes.x0),
        tf.tensor(data.val.x[1], data.val.shapes.x1),
      ];
      this.val.y = tf.tensor(data.val.y, data.val.shapes.y);
  
    };

    private tensorToArray(t:Tensor<Rank>) {
      const typedArray = t.dataSync();
      return Array.prototype.slice.call(typedArray);
    };
    
}