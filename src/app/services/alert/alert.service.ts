import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  alert = null;

  constructor(
    private alertController:AlertController
  ) { }

  async presentAlert(header:string = null, buttons = null, inputs = null, backdropDismiss = false, message = null){
    this.alert = await this.alertController.create({
      header: header,
      buttons: buttons,
      inputs: inputs,
      backdropDismiss: backdropDismiss,
      message: message
    });
    await this.alert.present();
  }

}
