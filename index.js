'use strict';

/**
 * Login Multi Factor Authentication (MFA) uses Passportjs' passport_totp authentication stategy to provide TOTP(Time-based One-time Password Algorithm) for Express based periodicjs applications.
 * @{@link https://github.com/typesettin/periodicjs.ext.mailer}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2015 Typesettin. All rights reserved.
 * @license MIT
 * @exports periodicjs.ext.login_mfa
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