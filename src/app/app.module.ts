import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { LoginMetaMaskComponent } from "./metamask/login-metamask/login-metamask.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [LoginMetaMaskComponent],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [LoginMetaMaskComponent]
})
export class AppModule {}
