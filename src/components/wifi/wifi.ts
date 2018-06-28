import { Component } from '@angular/core';
import { Network } from '@ionic-native/network';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Http, Headers} from "@angular/http";

/**
 * Generated class for the WifiComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
declare var WifiWizard: any;

@Component({
  selector: 'wifi',
  templateUrl: 'wifi.html'
})

export class WifiComponent {

  text: string;
  listSSIDS:any;
  redirectURL : string;
  uamip:string;
  ssid:string;
  apmac:string;
  nasId:string;
  clientMac:string;
  qv :string;
  constructor(private network: Network, private iab: InAppBrowser, private http:Http) {
    this.text = 'Hello World';
    this.connectGivenSSID("Cambium_test");
    let connectSubscription = this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      // We just got a connection but we need to wait briefly
      // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.
      setTimeout(() => {
        if (this.network.type === 'wifi') {
          this.autoConnectSSID("Cambium_test");
          console.log('we got a wifi connection, woohoo!');
        }
      }, 3000);
    });

    let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      console.log('network was disconnected :-(');
    });


  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.getRedirectURL();
    }, 3000);
    //this.getRedirectURL();
    // Put here the code you want to execute
  }


  errorHandler(err: any) {
    console.log(err);
  }

  getCurrentSsidName() {
    WifiWizard.getCurrentSSID((ssid: string) => alert(`Your SSID: ${ssid}`), this.errorHandler);
  }
  autoConnectSSID(tagetSSD) {
    WifiWizard.listNetworks(function(listSSIDS){
      for (let ssid of listSSIDS) {
        WifiWizard.getCurrentSSID(function (ssidcurrent) {
          let newssid = ssid.replace('"', '').replace('"','');
          if(ssid ===ssidcurrent && newssid===tagetSSD){
            //this logic for login or sign up
          }
        }, function (err) {
          console.log(err)
        });
      }

    } , this.errorHandler);
  }

  connectGivenSSID(ssid){WifiWizard.connectNetwork(ssid, function (result) {
      console.log(result);
      alert(result);
    }, this.errorHandler);
  }
  isWifiEnabled() {
    WifiWizard.isWifiEnabled(truthy => alert(`Wifi Enabled: ${truthy}`), this.errorHandler);
  }

  listNetworks() {
    WifiWizard.listNetworks(networks => alert(`Networks: ${networks}`), this.errorHandler);
  }

  getRedirectURL(){
    let options = "hidden=yes,location=yes";
    let browser = this.iab.create("http://www.adaderana.lk/",'_blank',options);
    browser.on('loadstop').subscribe((event:any)=>
    {
      this.redirectURL = event.url;
      this.auloLogin(this.getJsonFromUrl(this.redirectURL));
      var closeUrl = 'https://www.dreamvisionary.com/thankyou';
      if(event.url == closeUrl)
      {
        browser.close();       //This will close InAppBrowser Automatically when closeUrl Started
      }
    });

  }

  getJsonFromUrl(url) {
    let result = {};
    url.split("&").forEach(function(part) {
      var item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
  }

  auloLogin(param){
   this.uamip = param.ga_srvr;
   this.ssid = param.ga_ssid;
   this.apmac = param.ga_ap_mac;
   this.nasId = param.ga_nas_id;
   this.clientMac = param.ga_cmac;
   this.qv = param.ga_Qv;

   let loginPaylod = {
     action : "login",
     username : "shan@gmail.com",
     passowrd: "12345",
     apMAC : this.apmac,
     deviceMAC :this.clientMac.replace(":", "-").toUpperCase()
   };
   let BASE_URL = "https://www.vamps.vedicsoft.net/portal/mobile/index.php";
    let headers = new Headers();
    console.log(loginPaylod);
    this.http.post(BASE_URL , JSON.stringify(loginPaylod) , {headers:headers}).
    subscribe(res=>{
      console.log(res.json());
      if(res.json().response.reason ==="allowed"){
        this.loginToGateway(this.clientMac, this.clientMac.replace(/-/g,"") , "cambium");
      }
    }, (err)=>{
      console.log(err);
    });
  }

  loginToGateway(username, password, vender){
    if (vender ==="ruckus7372" || vender==="ruckus"){
      //loginRadiusGet(loginurl);
    }else if (vender==="mkt"){
      //loginRadiusGet(loginurl);
    }else if (vender==="zebra"){
      //loginRadiusGet(loginurl);
    }else if(vender==="cambium"){
      let url="http://"+this.uamip+":880/cgi-bin/hotspot_login.cgi?"+"ga_ssid="+this.ssid+"&ga_ap_mac="+this.apmac+"&ga_nas_id="+this.nasId+"&ga_srvr="+this.uamip+"&ga_cmac="+this.clientMac+"&ga_Qv="+this.qv;
      let loginpaylod ={
        username : username,
        password : password
      };
      this.loginRadiusPost(url, loginpaylod);
      //loginRadiusPost(loginurl , payload);
    }
  }

  loginRadiusPost(url , paylod){
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let body = "ga_user=" +paylod.username+ "&ga_pass=" + paylod.password;
    this.http.post(url , body , {headers:headers}).
    subscribe(res=>{
      console.log(res.json());
    }, (err)=>{
      console.log(err);
    });
  }
}
