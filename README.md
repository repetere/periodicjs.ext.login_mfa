# periodicjs.ext.mailer

A basic mailer extension that allows for you to configure custom mail transports, and sends mail via nodemailer.

 [API Documentation](https://github.com/typesettin/periodicjs.ext.mailer/blob/master/doc/api.md)

## Installation

```
$ npm install periodicjs.ext.mailer
```


## Usage

### Sending Test Mail Routes
*JavaScript*
```javascript
module.exports = function(periodic){
	var mailRouter = periodic.express.Router(),
			mailController = require('./controller/mailer')(periodic);
	mailRouter.post('/testmail', mailController.sendmail);
	periodic.app.use('/p-admin/mailer',mailRouter);
};
```
## Configure

you can define your own nodemailer transports, after the extension has been installed, the transport configuration is located in `content/config/extensions/periodicjs.ext.mailer/transport.json`

### Example Transports

**tranport.json**
These are [nodemailer](http://www.nodemailer.com/) transports.

```javascript
{
	"development":{
		"type":"sendmail",
		"transportoptions":{
			"debug":true,
			"args":["-t","-i"]
		}
	},
	"development-example2":{
		"type":"SMTP",
		"transportoptions":{
			"service": "SendGrid",
		  "auth": {
        "user": "username",
        "pass": "password"
		  }
		}
	}
}
```


##Development
*Make sure you have grunt installed*
```
$ npm install -g grunt-cli
```

Then run grunt watch
```
$ grunt watch
```
For generating documentation
```
$ grunt doc
$ jsdoc2md controller/**/*.js index.js install.js uninstall.js > doc/api.md
```
##Notes
* Check out https://github.com/typesettin/periodicjs for the full Periodic Documentation