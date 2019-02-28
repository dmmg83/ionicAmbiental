import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  latitude:number;
  longitude:number;

  form:FormGroup;
  subs_form:Subscription = null;

  constructor(
    private geolocation:Geolocation,
    private diagnostic:Diagnostic,
    private openNativeSettings:OpenNativeSettings,
    private loader:LoaderService,
    private alert:AlertService
  ){
    this.form = new FormGroup({
      'razonsocial': new FormControl('', Validators.required),
      'identificador': new FormControl('', Validators.required),
      'direccion': new FormControl('', Validators.required),
      'identificador2': new FormControl(''),
      'latitud': new FormControl({value: '', disabled: true}, Validators.required),
      'longitud': new FormControl({value: '', disabled: true}, Validators.required)
    });
  }

  ngOnInit(){
    this.alert.presentAlert(
      'Alert',
      [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            console.log(data);
          }
        }
      ],
      [
        {
          name: 'name',
          placeholder: 'Nombre'
        },
        {
          name: 'id',
          placeholder: 'Cédula'
        }
      ]
    );
  }

  getLocation(){
    this.diagnostic.isGpsLocationEnabled().then(resp => {
      if(resp)
        this.getCoords();
      else {
        this.loader.presentLoading('Debe activar el gps del dispositivo');
        setTimeout(resp => {
          this.openNativeSettings.open("location").then(resp => {
            this.loader.dismiss();
          });
        }, 2000);
      }
    });
  }

  getCoords() {
    this.geolocation.getCurrentPosition().then(data => {
      try{
        this.form.controls.latitud.setValue(data.coords.latitude);
        this.form.controls.longitud.setValue(data.coords.longitude);
      } catch (ex){
        console.log(ex);
      }
    }).catch(err => {
      console.log(err);
    });
  }

  guardarEstablecimiento(){
    if(this.form.valid){
      this.getLocation();
    } else {

    }
  }
}
