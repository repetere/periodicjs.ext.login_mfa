# periodicjs.ext.login_mfa

Login Multi Factor Authentication (MFA) uses Passportjs' passport_totp authentication stategy to provide TOTP(Time-based One-time Password Algorithm) for Express based periodicjs applications.

 [API Documentation](https://github.com/typesettin/periodicjs.ext.login_mfa/blob/master/doc/api.md)

## Installation

```
$ npm install periodicjs.ext.login_mfa
```

## Usage & Configuration

All you need to do is enable the extension and then add `"requiremfa":true` to your login extension's configuration. 

Login_MFA creates the key and defines the time period for a TOTP authentication token generator like Google Authenticator.

### Example Login Extension Configuration

**settings.json**
`content/config/extensions/periodicjs.ext.login/settings.json`

```json
{
	"production":{
		"settings":{
      "authLoginPath":"/auth/login",
      "authLogoutPath":"/",
			"authLoggedInHomepage":"/p-admin",
			"forgotPasswordEmailNotificationSubject":"Your Account Password has been reset",
			"usepassword":true,
			"requiremfa":true
		},
		"new_user_validation": {
			"checkusername": false,
			"checkpassword": true,
			"length_of_username": 1,
			"length_of_password": 8,
			"send_new_user_email": true
		},
		"passport":{
			"oauth":{
				"facebook":{
					"appid": "FBAPPID",
					"appsecret": "FBAPPSECRET",
					"callbackurl": "http://local.getperiodic.com:8786/auth/facebook/callback",
					"scope":["email", "publish_actions", "offline_access", "user_status", "user_likes", "user_checkins", "user_about_me", "read_stream"]
				}
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