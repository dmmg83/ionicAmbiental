import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  loading:any = null;

  constructor(
    private loadingController:LoadingController
  ) { }

  public async presentLoading(message = null){
    this.loading = await this.loadingController.create({
      message: message,
      spinner: 'dots'
    });
    await this.loading.present();
  }

  public dismiss(){
    if(this.loading){
      this.loading.dismiss();
      this.loading = null;
    }
  }

}
