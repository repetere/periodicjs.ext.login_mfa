'use strict';
var qr = require('qr-image');
var	merge = require('utils-merge'),
	TotpStrategy = require('passport-totp').Strategy,
	base32 = require('thirty-two'),
	User,
	passport,
	loginExtSettings,
	appSettings,
	appenvironment,
	mongoose,
	logger,
	CoreUtilities,
	CoreController,
	CoreMailer;

var totp_callback = function(req,res,next){
	loginExtSettings.settings.authMFALoginPath = '/auth/login-otp';
	var loginFailureUrl = (req.session.return_url) ? req.session.return_url : loginExtSettings.settings.authMFALoginPath + '?return_url=' + req.session.return_url;

	passport.authenticate('totp',{ 
		failureRedirect: loginFailureUrl, 
		failureFlash: 'Invalid MFA Token.' 
	})(req,res,next);
};

var totp_success = function(req,res){
	var loginUrl = (req.session.return_url) ? req.session.return_url : loginExtSettings.settings.authLoggedInHomepage;
	req.session.secondFactor = 'totp';

	res.redirect(loginUrl);
};

var randomKey = function(len) {
  var buf = [], 
  	chars = 'abcdefghijklmnopqrstuvwxyz0123456789', 
  	charlen = chars.length,
  	getRandomInt = function(min, max) {
		  return Math.floor(Math.random() * (max - min + 1)) + min;
		};

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

var findKeyForUserId =  function(user, fn) {
	var mfa_data ={};
	if(user && user.extensionattributes && user.extensionattributes.login_mfa&& user.extensionattributes.login_mfa.key){
		mfa_data.key = user.extensionattributes.login_mfa.key;
		mfa_data.period = user.extensionattributes.login_mfa.period;
	}
  return fn(null, mfa_data);
};

var saveKeyForUserId = function(userid, keydata, cb) {
	User.findOne({
		'_id': userid
	}, function (err, user) {
		if (err) {
			logger.error('error finding the user for saving mfa token');
			cb(err, null);
		}
		else {
			user.markModified('extensionattributes');
			user.extensionattributes.login_mfa = keydata;
			user.extensionattributes.login_mfa.allow_new_code = false;

			user.save(function (err, usr) {
				if (err) {
					cb(err, null);
				}
				cb(null, usr);
			});
		}
	});
};

var mfa_setup_page = function(req,res){
	var otpUrl,qrImage,encodedKey;
	findKeyForUserId(req.user, function(err, obj) {
    if (err) { 
			CoreController.handleDocumentQueryErrorResponse({
				err: err,
				res: res,
				req: req
			});
		}
   else if (obj && obj.key) {
   		if(obj.allow_new_code!==true){
   			var mfaError = new Error('User is not accessible to new mfa token setup');
   			logger.error(mfaError);
   			CoreController.handleDocumentQueryErrorResponse({
					err: mfaError,
					res: res,
					req: req
				});
   		}
   		else{
      // two-factor auth has already been setup
      encodedKey = base32.encode(obj.key);
      
      // generate QR code for scanning into Google Authenticator
      // reference: https://code.google.com/p/google-authenticator/wiki/KeyUriFormat
      otpUrl = 'otpauth://totp/' + req.user.email + '?secret=' + encodedKey + '&period=' + (obj.period || 30)+'&issuer='+encodeURIComponent(appSettings.name);
var svg_string = qr.imageSync((otpUrl), { type: 'svg' });

      qrImage = 'https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=' + encodeURIComponent(otpUrl);
      
      var viewtemplate = {
					viewname: 'user/login-mfa-setup',
					themefileext: appSettings.templatefileextension,
					extname: 'periodicjs.ext.login_mfa'
				},
				viewdata = {
					pagedata: {
						title: 'Multi-Factor Authenticator Setup',
						toplink: '&raquo; Multi-Factor Authenticator Setup',
						extensions: CoreUtilities.getAdminMenu()
					},
					key: encodedKey, 
					qrImage: qrImage,
					svg_string: svg_string, 
					user: req.user
				};

			CoreController.renderView(req, res, viewtemplate, viewdata);
   		}
    } 
    else {
      // new two-factor setup.  generate and save a secret key
      var key = randomKey(10);
      encodedKey = base32.encode(key);
      
      // generate QR code for scanning into Google Authenticator
      // reference: https://code.google.com/p/google-authenticator/wiki/KeyUriFormat
      otpUrl = 'otpauth://totp/' + req.user.email + '?secret=' + encodedKey + '&period=30&issuer='+encodeURIComponent(appSettings.name);
var new_svg_string = qr.imageSync((otpUrl), { type: 'svg' });
      qrImage = 'https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=' + encodeURIComponent(otpUrl);
  
      saveKeyForUserId(req.user, { key: key, period: 30 }, function(err) {
        if (err) { 
        	CoreController.handleDocumentQueryErrorResponse({
						err: err,
						res: res,
						req: req
					});
        }
        else{
	    		var viewtemplate = {
							viewname: 'user/login-mfa-setup',
							themefileext: appSettings.templatefileextension,
							extname: 'periodicjs.ext.login_mfa'
						},
						viewdata = {
							pagedata: {
								title: 'Multi-Factor Authenticator Setup',
								toplink: '&raquo; Multi-Factor Authenticator Setup',
								extensions: CoreUtilities.getAdminMenu()
							},
							key: encodedKey, 
							qrImage: qrImage, 
							new_svg_string: new_svg_string,
							user: req.user
						};

					CoreController.renderView(req, res, viewtemplate, viewdata);
        }
      });
    }
  });
};

var mfa_login_page = function(req,res){
    findKeyForUserId(req.user, function(err, obj) {
	// console.log('obj',obj);
      if (err) { 
      	CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
      }
      else if (!obj || (obj && !obj.key)) { 
      	return res.redirect('/auth/login-otp-setup'); 
      }
      else{
    		var viewtemplate = {
						viewname: 'user/login-mfa-otp',
						themefileext: appSettings.templatefileextension,
						extname: 'periodicjs.ext.login_mfa'
					},
					viewdata = {
						pagedata: {
							title: 'Multi-Factor Authenticator',
							toplink: '&raquo; Multi-Factor Authenticator',
							extensions: CoreUtilities.getAdminMenu()
						},
						user: req.user
					};

				CoreController.renderView(req, res, viewtemplate, viewdata);
      }
    });
};

var forceAuthLogin = function (req, res) {
	if (req.originalUrl) {
		req.session.return_url = req.originalUrl;
		res.redirect(loginExtSettings.settings.authLoginPath + '?return_url=' + req.originalUrl);
	}
	else {
		res.redirect(loginExtSettings.settings.authLoginPath);
	}
};

var skip_mfa_check = function(req,res,next){
	req.controllerData = (req.controllerData) ? req.controllerData : {};
	req.controllerData.skip_mfa_check = true;
	next();
};

/**
 * make sure a user is authenticated, if not logged in, send them to login page and return them to original resource after login
 * @param  {object} req
 * @param  {object} res
 * @return {Function} next() callback
 */
var ensureAuthenticated = function (req, res, next) {
	req.controllerData = (req.controllerData) ? req.controllerData : {};
	/* if a user is logged in, and requires to link account, update the user document with social credentials and then pass to the next express middleware */
	if (req.isAuthenticated()) {
		if (req.session.linkaccount === true) {
			var updateuser = {};
			updateuser.attributes = merge(req.user.attributes, req.session.linkaccountdata);
			CoreController.updateModel({
				cached: req.headers.periodicCache !== 'no-periodic-cache',
				model: User,
				id: req.user._id,
				updatedoc: updateuser,
				res: res,
				req: req,
				callback: function (err /* , updateduser */ ) {
					if (err) {
						next(err);
					}
					else {
						logger.verbose('linked ', req.session.linkaccountservice, ' account for ', req.user.id, req.user.email, req.user.username);
						req.session.linkaccount = false;
						delete req.session.linkaccount;
						delete req.session.linkaccountdata;
						delete req.session.linkaccountservice;
						next();
					}
				}
			});

			// next(new Error('cannot link '+req.session.linkaccountservice+' account'));
			// res.redirect('/user/linkaccount?service='+req.session.linkaccountservice);
		}
		else if (loginExtSettings && loginExtSettings.settings.disablesocialsignin === true && req.user.accounttype === 'social-sign-in' && req.query.required !== 'social-sign-in' && req.method === 'GET') {
			res.redirect('/auth/user/finishregistration?reason=social-sign-in-pending');
		}
		else if (loginExtSettings && loginExtSettings.settings.requireusername !== false && !req.user.username && req.query.required !== 'username' && req.method === 'GET') {
			res.redirect('/auth/user/finishregistration?required=username');
			// return next();
		}
		else if (loginExtSettings && loginExtSettings.settings.requireemail !== false && !req.user.email && req.query.required !== 'email' && req.method === 'GET') {
			res.redirect('/auth/user/finishregistration?required=email');
		}
		else if (loginExtSettings && loginExtSettings.settings.requireemail !== false && !req.user.email && req.query.required !== 'email' && req.method === 'GET') {
			res.redirect('/auth/user/finishregistration?required=email');
		}
		else if (loginExtSettings && loginExtSettings.settings.requireuseractivation && req.user.activated === false && req.query.required !== 'activation' && req.method === 'GET') {
			res.redirect('/auth/user/finishregistration?required=activation');
		}
		else if(loginExtSettings && loginExtSettings.settings.requiremfa !== false && req.controllerData.skip_mfa_check!==true && req.method === 'GET'){
			if (req.session.secondFactor === 'totp') { 
				return next(); 
			}
			else{
				res.redirect('/auth/login-otp');
			}
		}
		else {
			return next();
		}
	}
	else {
		if (req.query.format === 'json') {
			res.send({
				'result': 'error',
				'data': {
					error: 'authentication requires '
				}
			});
		}
		else {
			logger.verbose('controller - login/user.js - ' + req.originalUrl);
			forceAuthLogin(req, res);
		}
	}
};

/**
 * mailer controller
 * @module mailerController
 * @{@link https://github.com/typesettin/periodic}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @requires module:fs
 * @requires module:util-extent
 * @param  {object} resources variable injection from current periodic instance with references to the active logger and mongo session
 * @return {object}           sendmail
 */
var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
  CoreController = resources.core.controller;
  passport = resources.app.controller.extension.login.auth.passport;
  CoreUtilities = resources.core.utilities;
	// CoreExtension = resources.core.extension;
	loginExtSettings = resources.app.controller.extension.login.loginExtSettings;
	CoreMailer = resources.core.mailer;
	appenvironment = appSettings.application.environment;
	User = mongoose.model('User');


	passport.use(new TotpStrategy(
	  function(user, done) {
	    // setup function, supply key and period to done callback
	    findKeyForUserId(user, function(err, obj) {
	      if (err) { 
	      	return done(err); 
	      }
	      else{
		      return done(null, obj.key, obj.period);
	      }
	    });
	  }
	));


	return{
		passport: passport,
		totp_callback: totp_callback,
		totp_success: totp_success,
		skip_mfa_check: skip_mfa_check,
		mfa_login_page: mfa_login_page,
		mfa_setup_page: mfa_setup_page,
		ensureAuthenticated: ensureAuthenticated
	};
};

module.exports = controller;