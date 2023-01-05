import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getRemoteConfig } from "firebase-admin/remote-config";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";

// eslint-disable-next-line valid-jsdoc
/**
 *  @property {FirebaseAdmin} instance
 */
class FirebaseAdmin {
  app;
  auth;
  db;
  rtdb;
  remoteConfig;
  /**
   * firebase admin service
   */
  constructor() {
    this.app = initializeApp();
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.rtdb = getDatabase(this.app);
    this.remoteConfig = getRemoteConfig(this.app);
  }

  getUser = async (uid) => {
    return await this.auth.getUser(uid);
  };

  getUserDocument = async (uid) => {
    return await this.db.collection("users").doc(uid).get();
  };

}

export default new FirebaseAdmin();
