import { Component, OnInit } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { DatabaseService } from 'src/app/services/database/database.service';
import { Storage } from '@ionic/storage';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

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
    private platform:Platform,
    private geolocation:Geolocation,
    private diagnostic:Diagnostic,
    private openNativeSettings:OpenNativeSettings,
    private loader:LoaderService,
    private alert:AlertService,
    private database:DatabaseService,
    private storage:Storage,
    private toastController:ToastController,
    private splashScreen:SplashScreen
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
    this.platform.ready().then(()=> {
      this.platform.backButton.subscribe(()=>{
        navigator['app'].exitApp();
      });
      this.splashScreen.hide();
    });
    this.storage.get('nombre').then(nombre => {
      if(!nombre){
        this.presentAlert();
      } else {
        this.storage.get('id').then(id => {
          if(!id){
            this.presentAlert();
          }
        });
      }
    });
  }

  presentAlert(){
    this.storage.get('nombre').then(nombre => {
      this.storage.get('id').then(id => {
        this.alert.presentAlert(
          'Datos recolector',
          [
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Guardar',
              handler: (data) => {
                if(data.name.trim() != ''){
                  this.storage.set('nombre', data.name);
                }
                if (data.id.trim() != '') {
                  this.storage.set('id', data.id);
                }
              }
            }
          ],
          [
            {
              name: 'name',
              value: nombre,
              placeholder: 'Nombre'
            },
            {
              name: 'id',
              value: id,
              placeholder: 'Cédula'
            }
          ]
        );
      });
    });
  }

  getLocation(){
    return new Promise((resolve, reject) => {
      this.diagnostic.isGpsLocationEnabled().then(resp => {
        if(resp)
          return resolve(this.getCoords());
        else {
          this.loader.presentLoading('Debe activar el gps del dispositivo');
          setTimeout(resp => {
            this.openNativeSettings.open("location").then(resp => {
              this.loader.dismiss();
              reject();
            });
          }, 2000);
        }
      });
    });
  }

  getCoords() {
    return new Promise((resolve, reject) => {
      this.loader.presentLoading('Obteniendo coordenadas');
      this.geolocation.getCurrentPosition().then(data => {
        try{
          this.form.controls.latitud.setValue(data.coords.latitude);
          this.form.controls.longitud.setValue(data.coords.longitude);
          this.loader.dismiss();
          resolve();
        } catch (ex){
          console.log(ex);
          this.loader.dismiss();
          reject();
        }
      }).catch(err => {
        console.log(err);
        this.loader.dismiss();
        reject();
      });
    });
  }

  obtenerUbicacion(){
    this.getLocation();
  }

  guardarEstablecimiento(){
    if(this.form.valid){
      this.storage.get('nombre').then(nombre => {
        if(nombre){
          this.storage.get('id').then(id => {
            if(id) {
              this.getLocation().then(()=>{
                this.loader.presentLoading('Guardando registro');
                let datos = {
                  'razonsocial': this.form.controls.razonsocial.value,
                  'identificador': this.form.controls.identificador.value,
                  'direccion': this.form.controls.direccion.value,
                  'identificador2': this.form.controls.identificador2.value,
                  'latitud': this.form.controls.latitud.value,
                  'longitud': this.form.controls.longitud.value,
                  'id_usuario': id,
                  'nombreusuario': nombre
                };
                this.database.addEstablecimiento(datos).then(data=>{
                  this.form.controls.razonsocial.setValue('');
                  this.form.controls.identificador.setValue('');
                  this.form.controls.identificador2.setValue('');
                  this.form.controls.direccion.setValue('');
                  this.form.controls.latitud.setValue('');
                  this.form.controls.longitud.setValue('');
                  this.form.reset();
                  console.log(data);
                  let message = `Establecimiento guardado<br>
                  Razon social: ${data.razonsocial} <br>
                  Identificador: ${data.identificador} <br>
                  Dirección: ${data.direccion} <br>
                  Identificador 2: ${data.identificador2} <br>
                  Latitud: ${data.latitud} <br>
                  Longitud: ${data.longitud}`;
                  this.alert.presentAlert(
                    'Confirmación',
                    [
                      {
                        text: 'Aceptar'
                      }
                    ], [], true,
                    message
                  );
                  this.loader.dismiss();
                  this.database.getEstablecimientos().then((data:any) => {
                    console.log(data);
                  });
                }).catch(err => {
                  console.log(err);
                  this.loader.dismiss();
                  this.presentToast('Error al guardar establecimiento intente nuevamente.');
                });
              });
            } else {
              this.presentAlert();
            }
          })
        } else {
          this.presentAlert();
        }
      });
    } else {
      if(this.form.controls.razonsocial.invalid){
        this.presentToast('El campo razón social es requerido');
      } else if ( this.form.controls.identificador.invalid ) {
        this.presentToast('El campo identificador es requerido');
      } else if ( this.form.controls.direccion.invalid ){
        this.presentToast('El campo dirección es requerido.');
      }
    }
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }
}
