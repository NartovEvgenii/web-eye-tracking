import { Injectable } from "@angular/core";
import { DatasetService } from "./dataset";
import * as tf from '@tensorflow/tfjs';
import { LayersModel, SymbolicTensor } from "@tensorflow/tfjs";

@Injectable()
export class EyeTrackModel {
    currentModel: LayersModel | null = null;
    epochsTrained: number = 0

    constructor(private readonly dataset: DatasetService) {
    }

    public fitModel(){
      const epochs = 10;
  
      let batchSize = Math.floor(this.dataset.train.n * 0.1);
      batchSize = Math.max(2, Math.min(batchSize, 64));
      
      if (this.currentModel == null) {
          this.currentModel = this.createModel(this.dataset.eyeHeight, this.dataset.eyeWidth);
      }
      
      let bestEpoch = -1;
      let bestTrainLoss = Number.MAX_SAFE_INTEGER;
      let bestValLoss = Number.MAX_SAFE_INTEGER;
      const bestModelPath = 'localstorage://best-model';  
      this.currentModel!.compile({
        optimizer: tf.train.adam(0.0005),
        loss: 'meanSquaredError',
      });
      let epochsTrained = this.epochsTrained;
      let currentModel = this.currentModel;
  
      this.currentModel.fit(this.dataset.train.x!, this.dataset.train.y!, {
        batchSize: batchSize,
        epochs: epochs,
        shuffle: true,
        validationData: [this.dataset.val.x!, this.dataset.val.y!],
        callbacks: {
          onEpochEnd: async function(epoch, logs) {
            console.info('Epoch', epoch, 'losses:', logs);
            epochsTrained += 1;  
            if (logs != undefined &&  logs["val_loss"] < bestValLoss) {
              console.log("model save");
              bestEpoch = epoch;
              bestTrainLoss = logs["loss"];
              bestValLoss = logs["val_loss"];
              await currentModel.save(bestModelPath);
            }  
            return await tf.nextFrame();
          },
          onTrainEnd: async function() {
            console.info('Finished training');  
            epochsTrained -= epochs - bestEpoch;
            console.info('best epoch:', epochsTrained);
            console.info('bestTrainLoss:', bestTrainLoss);
            console.info('bestValLoss:', bestValLoss); 
            currentModel = await tf.loadLayersModel(bestModelPath);  
          },
        },
      });
    }

    private createModel(eyeHeight:number, eyeWidth:number): LayersModel {
      const inputImage = tf.input({
        name: 'image',
        shape: [eyeHeight, eyeWidth, 3],
      });
      const inputMeta = tf.input({
        name: 'metaInfos',
        shape: [4],
      });  
      const conv = tf.layers
        .conv2d({
          kernelSize: 5,
          filters: 20,
          strides: 1,
          activation: 'relu',
          kernelInitializer: 'varianceScaling',
        })
        .apply(inputImage);  
      const maxpool = tf.layers
        .maxPooling2d({
          poolSize: [2, 2],
          strides: [2, 2],
        })
        .apply(conv);  
      const flat = tf.layers.flatten().apply(maxpool);  
      const dropout = tf.layers.dropout({rate: 0.2}).apply(flat) as SymbolicTensor;  
      const concat = tf.layers.concatenate().apply([dropout, inputMeta]);  
      const output = tf.layers 
        .dense({
          units: 2,
          activation: 'tanh',
          kernelInitializer: 'varianceScaling',
        })
        .apply(concat) as SymbolicTensor[];
  
      const model = tf.model({
        inputs: [inputImage, inputMeta],
        outputs: output,
      });  
      return model;
    }

    async loadModel(file1:any, file2:any) {
      this.currentModel = await tf.loadLayersModel(
        tf.io.browserFiles([file1, file2]),
      );
      console.log("upload sussess")
    }
}