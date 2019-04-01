import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject } from 'rxjs';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private database:SQLiteObject;
  private dbReady = new BehaviorSubject<boolean>(false);
  private name:string = 'establecimientos.db';

  constructor(
    private platform:Platform,
    private sqlite:SQLite
  ) {
    this.platform.ready().then(()=>{
      this.sqlite.create({
        name: this.name,
        location: 'default'
      }).then((db:SQLiteObject) => {
        this.database = db;
        this.createTables().then(()=>{
          this.dbReady.next(true);
        }).catch(err => console.log("Error creando tablas", err));
      }).catch(err => console.log("Error abriendo basee de datos", err));
    });
  }

  private createTables(){
    return this.database.executeSql(`
      CREATE TABLE IF NOT EXISTS establecimientos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        razonsocial TEXT,
        identificador TEXT,
        direccion TEXT,
        identificador2 TEXT,
        latitud REAL,
        longitud REAL,
        id_usuario TEXT,
        nombreusuario TEXT
      );
    `, []
    ).catch((err) => console.log("error creating tables", err));
  }

  private isReady(){
    return new Promise((resolve, reject) => {
      if(this.dbReady.getValue()){
        resolve();
      }
      else {
        this.dbReady.subscribe((ready) => {
          if(ready){
            resolve();
          } else {
            reject("Error"); // Quitar
          }
        });
      }
    });
  }

  getEstablecimientos(){
    return this.isReady().then(()=>{
      return this.database.executeSql(`SELECT * FROM establecimientos;`, []).then(data => {
        let list = [];
        for(let i=0; i<data.rows.length; i++){
          list.push(data.rows.item(i));
        }
        return list;
      })
    });
  }

  getEstablecimiento(id:number){
    return this.isReady().then(()=>{
      return this.database.executeSql(`SELECT * FROM establecimientos where id = ${id};`, []).then(data => {
        if(data.rows.length){
          return data.rows.item(0);
        }
      })
    });
  }

  addEstablecimiento(data:any){
    return this.isReady().then(()=>{
      return this.database.executeSql(`INSERT INTO establecimientos(razonsocial, identificador, direccion, identificador2, latitud, longitud, id_usuario, nombreusuario)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?);`, [data.razonsocial, data.identificador, data.direccion, data.identificador2, data.latitud, data.longitud, data.id_usuario, data.nombreusuario]).then(result => {
        if(result.insertId){
          return this.getEstablecimiento(result.insertId);
        }
      });
    }).catch(err =>
      console.log(err)
    );
  }

}
