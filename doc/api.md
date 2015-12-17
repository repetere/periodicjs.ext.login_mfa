#Index

**Modules**

* [periodicjs.ext.mailer](#periodicjs.ext.module_mailer)
* [mailerController](#module_mailerController)

**Functions**

* [sendmail(req, res)](#sendmail)
 
<a name="periodicjs.ext.module_mailer"></a>
#periodicjs.ext.mailer
A basic mailer extension that allows for you to configure custom mail transports, and sends mail via nodemailer.

**Params**

- periodic `object` - variable injection of resources from current periodic instance  

**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  
<a name="module_mailerController"></a>
#mailerController
mailer controller

**Params**

- resources `object` - variable injection from current periodic instance with references to the active logger and mongo session  

**Returns**: `object` - sendmail  
**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  
<a name="sendmail"></a>
#sendmail(req, res)
send a test email from a form submission

**Params**

- req `object`  
- res `object`  

**Returns**: `object` - reponds with an error page or email sent status  
