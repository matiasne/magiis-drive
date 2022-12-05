export const AppSettings = Object.freeze({
  "ENVIROMENT_SELECTION_ENABLED": false,
  "SUPER_ADMIN_EMAIL": "mobileAdmin@mail.com",
  "ENVIROMENTS": [
    {
      type: 'radio',
      label: 'PROD',
      value: 'https://api.apps.magiis.com/'
    },
    {
      type: 'radio',
      label: 'DEMO',
      value: 'https://magiisdev.azulado.com.ar/magiis-v0.2/'
    },
    {
      type: 'radio',
      label: 'TEST',
      value: 'https://apps-test.magiis.com/magiis-v0.2/'
    }
  ],
  "IS_FIREBASE_ENABLED": false,
  "SHOW_START_WIZARD": false,
  "SUBSCRIBE": false,
  // "Url": "%%API_URL%%",
  "Url": 'https://apps-uat.magiis.com/magiis-v0.2/',

  "TOAST": {
    "duration": 1000,
    "position": "buttom"
  },


  //"FIREBASE_CONFIG": JSON.parse('%%FIREBASE_CONFIG%%'),
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyCh55T1rexUL7VlikFZJvFqBN-FfV8eYHM",
    authDomain: "magiis-uat.firebaseapp.com",
    databaseURL: "https://magiis-uat.firebaseio.com",
    projectId: "magiis-uat",
    storageBucket: "magiis-uat.appspot.com",
    messagingSenderId: "892730106075",
    appId: "1:892730106075:web:7f6f73843adf99c3446cfe",
    measurementId: "G-Q7HCDBD5HD"
  },
  // "MAP_KEY": {
  //     "apiKey": '%%GOOGLE_API_KEY%%'
  // },
  MAP_KEY: {
    apiKey: 'AIzaSyCW5AcW8JtfzshogJShjM9Tm0HFazeahZI',
  },
});

export const URL = { "value": "" };
