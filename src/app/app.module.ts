import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { LoginMetaMaskComponent } from "./metamask/login-metamask/login-metamask.component";
import { LogoutMetamaskComponent } from './metamask/logout-metamask/logout-metamask.component';
import { SendTransactionMetamaskComponent } from './metamask/send-transaction-metamask/send-transaction-metamask.component';
import { CheckTransactionMetamaskComponent } from './metamask/check-transaction-metamask/check-transaction-metamask.component';
import { ConnectMetamaskComponent } from './metamask/connect-metamask/connect-metamask.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginMetaMaskComponent, 
    LogoutMetamaskComponent, SendTransactionMetamaskComponent, CheckTransactionMetamaskComponent, ConnectMetamaskComponent],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
