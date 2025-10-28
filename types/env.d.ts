declare namespace NodeJS {
  interface ProcessEnv {
    DB_HOST: string;
      DB_PASSWORD: string;
DB_USERNAME: string;
NODE_ENV : string 

    JWT_SECRET : string;
    EXPIRES_IN : string;

      EMAIL_HOST: string;
EMAIL_USER :string;
     EMAIL_PASSWORD: string;
EMAIL_PORT :string
  }
}
