# OAuth2 Google Drive File Uploader

## Installation



### Install the packages

```bash
$ npm install
```

### Configuration

<br>
set the following environment variables

export CLIENT_ID= < GCP API application client ID>  
export CLIENT_SECRET=< GCP API application client secret>  
export LOGIN_REDIRECT_URL=< GCP API application post login redirect url >  eg: "/auth/google/callback"  
export SECRET_KEY=< Session secret key>
export PORT=< Node JS server port>


### Run the server

```bash
$ node index.js

```