import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { AuthStorage } from "./metamask.service";

@Injectable({
  providedIn: "root",
})
export class InMemoryAuthStorageService extends AuthStorage {
  protected _address$: any = new BehaviorSubject<string | undefined>(undefined);
  protected _payload$: any = new BehaviorSubject<any>(undefined);

  get address(): Observable<string | undefined> {
    return this._address$.asObservable();
  }

  get payload(): Observable<any> {
    return this._payload$.asObservable();
  }

  constructor() {
    super();
  }

  setAuthentication(address: string, payload: any) {
    this._address$.next(address);
    this._payload$.next(payload);
  }

  resetAuthentication(): void {
    this._address$.next(undefined);
    this._payload$.next(undefined);
  }
}
