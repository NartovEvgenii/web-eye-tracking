import { Injectable } from "@angular/core";
import * as tf from '@tensorflow/tfjs';
import { CurrentTrainData } from "./currentTrainData";
import { Rank, Tensor } from "@tensorflow/tfjs";

interface DataItem {
  n: number;
  x: any[] | null;
  y: Tensor<Rank> | null;
}

@Injectable({
    providedIn: 'root'
  })
  export class DatasetService {    

    train: DataItem  = {n: 0,x: null,y: null };

    val: DataItem  = {n: 0,x: null,y: null };
    
    public addDataToDataset(currentTrainData: CurrentTrainData) {
      tf.tidy(() => {
        const img = this.batchImage(currentTrainData);
        const targetPos = [currentTrainData.targetX, currentTrainData.targetY];
        const metaInfos = tf.keep(this.getMetaInfos(currentTrainData));
        console.log(currentTrainData);
        this.addExample(img, metaInfos, targetPos);
        console.log("ok");
        console.log(this.train);
        console.log(this.val);
      });
    }

    private batchImage(currentTrainData: CurrentTrainData) {
      // Capture the current image in the eyes canvas as a tensor.
      const img = currentTrainData.image;
      return tf.tidy(function() {
        const image = tf.browser.fromPixels(img);
        const batchedImage = image.expandDims(0);
        return batchedImage
          .toFloat()
          .div(tf.scalar(127))
          .sub(tf.scalar(1));
      });
    }

    
    private getMetaInfos(currentTrainData: CurrentTrainData) {
      let x = currentTrainData.middleEyeX;
      let y = currentTrainData.middleEyeY;
  
      const rectWidth  = currentTrainData.rectWidthEye;
      const rectHeight = currentTrainData.rectHeightEye;
  
      return tf.tidy(() => {
        return tf.tensor1d([x, y, rectWidth, rectHeight]).expandDims(0);
      });
    }

    private async addExample(image:any, metaInfos:any, target:any) {
      // Given an image, eye pos and target coordinates, adds them to our dataset.
      target = tf.keep(
        tf.tidy(function() {
          return tf.tensor1d(target).expandDims(0);
        }),
      );
  
      const convertedImage = await this.convertImage(image);
  
      this.addToDataset(convertedImage, metaInfos, target);
  
    }

    private async convertImage(image:any) {
      // Convert to grayscale and add spatial info
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
      // Given an rgb array and positions, returns a grayscale value.
      // Inspired by http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0029740
      let r = (imageArray[n][x][y][0] + 1) / 2;
      let g = (imageArray[n][x][y][1] + 1) / 2;
      let b = (imageArray[n][x][y][2] + 1) / 2;
  
      // Gamma correction:
      const exponent = 1 / 2.2;
      r = Math.pow(r, exponent);
      g = Math.pow(g, exponent);
      b = Math.pow(b, exponent);
  
      // Gleam:
      const gleam = (r + g + b) / 3;
      return gleam * 2 - 1;
    }

    private addToDataset(image:any, metaInfos:any, target:any) {
      // Add the given x, y to either 'train' or 'val'.
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
  
        tf.dispose([oldImage, oldEyePos, oldY, target]);
      }
  
      set.n += 1;
    }
    
  }