'use strict';
var asyncadminInstalled;
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
	var fs = require('fs-extra'),
		login_mfa,
		login_check,
		login_idx;

	periodic.app.controller.extension.login_mfa = require('./controller/login_mfa')(periodic);
	periodic.app.controller.extension.login.auth.passport = periodic.app.controller.extension.login_mfa.passport;
	periodic.app.controller.extension.login.auth.ensureAuthenticated = periodic.app.controller.extension.login_mfa.ensureAuthenticated;
	for (var x = 0; x < periodic.settings.extconf.extensions.length; x++) {
		if (periodic.settings.extconf.extensions[x].name === 'periodicjs.ext.asyncadmin') {
			asyncadminInstalled = true;
		}

		if (periodic.settings.extconf.extensions[x].name === 'periodicjs.ext.login') {
 			if (periodic.settings.extconf.extensions[x+1].name !== 'periodicjs.ext.login_mfa') {
				login_check = false;
				console.log(login_check);
				login_idx = x;
			}
		}

		if (login_check === false && periodic.settings.extconf.extensions[x].name === 'periodicjs.ext.login_mfa') {
			login_mfa = periodic.settings.extconf.extensions.splice(x, 1);
			periodic.settings.extconf.extensions.splice(login_idx+1, 0, login_mfa[0]);
		}
	}

	if (login_check === false) {
		var newJson = {
			extensions: periodic.settings.extconf.extensions
		};
		fs.outputJson(periodic.core.extension.getExtensionConfFilePath(), newJson, function(err) {
			if (err) {
				throw new Error(err);
			} else {
				console.log('Login_MFA moved - App Restarting');
				periodic.core.utilities.restart_app();
			}
		});
	}

	var mfaAuthRouter = periodic.express.Router(),
		userController = periodic.app.controller.native.user,
		mfa_controller = periodic.app.controller.extension.login_mfa;

	mfaAuthRouter.get('*', global.CoreCache.disableCache);
	mfaAuthRouter.post('*', global.CoreCache.disableCache);

	mfaAuthRouter.get('/login-otp-setup', mfa_controller.skip_mfa_check, mfa_controller.ensureAuthenticated, mfa_controller.mfa_setup_page);
	mfaAuthRouter.get('/login-otp', mfa_controller.skip_mfa_check, mfa_controller.ensureAuthenticated, mfa_controller.mfa_login_page);
	mfaAuthRouter.post('/login-otp', mfa_controller.totp_callback, mfa_controller.totp_success);

	if(asyncadminInstalled){
		var	uacController = require('../periodicjs.ext.user_access_control/controller/uac')(periodic);

		mfaAuthRouter.get('/login-mfa',
			global.CoreCache.disableCache,
			mfa_controller.ensureAuthenticated,
			uacController.loadUserRoles,
			uacController.check_user_access,
			userController.loadUsersWithCount,
			userController.loadUsersWithDefaultLimit,
			userController.loadUsers,
			mfa_controller.userEditor);
		mfaAuthRouter.post('/login-mfa/user/:id/:set_mfa_status',
			global.CoreCache.disableCache,
			mfa_controller.ensureAuthenticated,
			uacController.loadUserRoles,
			uacController.check_user_access,
			userController.loadUser,
			mfa_controller.set_mfa_status,
			userController.update);
	}
/*
	*/
	periodic.app.use('/auth', mfaAuthRouter);

	return periodic;
};
