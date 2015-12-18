#Index

**Modules**

* [periodicjs.ext.login_mfa](#periodicjs.ext.module_login_mfa)
* [loginMFAController](#module_loginMFAController)

**Functions**

* [totp_callback(req, res)](#totp_callback)
* [totp_success(req, res)](#totp_success)
* [randomKey(len)](#randomKey)
* [findKeyForUserId(user, fn)](#findKeyForUserId)
* [saveKeyForUserId(userid, keydata, cb)](#saveKeyForUserId)
* [mfa_setup_page(req, res)](#mfa_setup_page)
* [mfa_login_page(req, res)](#mfa_login_page)
* [forceAuthLogin(req, res, next)](#forceAuthLogin)
* [skip_mfa_check(req, res, next)](#skip_mfa_check)
* [ensureAuthenticated(req, res)](#ensureAuthenticated)
 
<a name="periodicjs.ext.module_login_mfa"></a>
#periodicjs.ext.login_mfa
Login Multi Factor Authentication (MFA) uses Passportjs' passport_totp authentication stategy to provide TOTP(Time-based One-time Password Algorithm) for Express based periodicjs applications.

**Params**

- periodic `object` - variable injection of resources from current periodic instance  

**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2015 Typesettin. All rights reserved.  
<a name="module_loginMFAController"></a>
#loginMFAController
login mfa controller

**Params**

- resources `object` - variable injection from current periodic instance with references to the active logger and mongo session  

**Returns**: `object` - updated passport, updated ensureAuthenticated  
**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2015 Typesettin. All rights reserved.  
<a name="totp_callback"></a>
#totp_callback(req, res)
passport totp configuration

**Params**

- req `object`  
- res `object`  

**Returns**: `function` - next() callback  
<a name="totp_success"></a>
#totp_success(req, res)
set secondfact success to session and redirect to original url

**Params**

- req `object` - express request  
- res `object` - express reponse  

**Returns**: `null` - does not return a value  
<a name="randomKey"></a>
#randomKey(len)
generates random key for MFA device token

**Params**

- len `number` - number of characters for key  

**Returns**: `string` - generated key  
<a name="findKeyForUserId"></a>
#findKeyForUserId(user, fn)
returns MFA device code generation data, the key, allow_new_code and the time periodic.

**Params**

- user `object` - logged in user object  
- fn `function` - callback function  

**Returns**: `function` - async callback function  
<a name="saveKeyForUserId"></a>
#saveKeyForUserId(userid, keydata, cb)
saves token for MFA device

**Params**

- userid `string` - user mongo id  
- keydata `object` - object that contains, key (MFA device key),period (TOTP timeout period) and allow_new_code (set to false)  
- cb `function` - callback function  

<a name="mfa_setup_page"></a>
#mfa_setup_page(req, res)
generates token for manual entry and qr image for google authenticator TOTP, if a user needs to reset token, user.extensionattibutes.login_mfa.allow_new_code must be set to 'true'

**Params**

- req `object` - express request  
- res `object` - express reponse  

**Returns**: `null` - does not return a value  
<a name="mfa_login_page"></a>
#mfa_login_page(req, res)
log into account with MFA token

**Params**

- req `object` - express request  
- res `object` - express reponse  

**Returns**: `null` - does not return a value  
<a name="forceAuthLogin"></a>
#forceAuthLogin(req, res, next)
forces a user to login to previously requested url path

**Params**

- req `object` - express request  
- res `object` - express reponse  
- next `function` - express next callback  

**Returns**: `null` - does not return a value  
<a name="skip_mfa_check"></a>
#skip_mfa_check(req, res, next)
in order to configure MFA you need to skip MFA check on setup pages

**Params**

- req `object` - express request  
- res `object` - express reponse  
- next `function` - express next callback  

**Returns**: `null` - does not return a value  
<a name="ensureAuthenticated"></a>
#ensureAuthenticated(req, res)
make sure a user is authenticated, if not logged in, send them to login page and return them to original resource after login

**Params**

- req `object`  
- res `object`  

**Returns**: `function` - next() callback  
