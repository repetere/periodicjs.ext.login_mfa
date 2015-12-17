'use strict';

/**
 * A basic mailer extension that allows for you to configure custom mail transports, and sends mail via nodemailer.
 * @{@link https://github.com/typesettin/periodicjs.ext.mailer}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @exports periodicjs.ext.mailer
 * @requires module:path
 * @param  {object} periodic variable injection of resources from current periodic instance
 */
module.exports = function(periodic){
	// express,app,logger,config,db,mongoose
	periodic.app.controller.extension.login_mfa = require('./controller/login_mfa')(periodic);
	periodic.app.controller.extension.login.auth.passport = periodic.app.controller.extension.login_mfa.passport;
	periodic.app.controller.extension.login.auth.ensureAuthenticated = periodic.app.controller.extension.login_mfa.ensureAuthenticated;

	var mfaAuthRouter = periodic.express.Router(),
		mfa_controller = periodic.app.controller.extension.login_mfa;
	
	mfaAuthRouter.get('*', global.CoreCache.disableCache);
	mfaAuthRouter.post('*', global.CoreCache.disableCache);

	mfaAuthRouter.get('/login-otp-setup', mfa_controller.skip_mfa_check, mfa_controller.ensureAuthenticated, mfa_controller.mfa_setup_page);
	mfaAuthRouter.get('/login-otp', mfa_controller.skip_mfa_check, mfa_controller.ensureAuthenticated, mfa_controller.mfa_login_page);
	mfaAuthRouter.post('/login-otp', mfa_controller.totp_callback, mfa_controller.totp_success);
/*
	*/
	periodic.app.use('/auth', mfaAuthRouter);

	return periodic;
};