
(function ($, window, ko, crossroads, hasher) {
	
	'use strict';
	
	var
		/**
		 * @type {Object}
		 */
		Consts = {},
	
		/**
		 * @type {Object}
		 */
		Enums = {},
	
		/**
		 * @type {Object.<Function>}
		 */
		Utils = {},
	
		/**
		 * @type {Object.<Function>}
		 */
		Validator = {},
	
		/**
		 * @type {Object}
		 */
		I18n = window.pSevenI18N || {},
	
		/**
		 * @type {CApp|Object}
		 */
		App = {},
		
		/**
		 * @type {Object.<Function>}
		 */
		AfterLogicApi = {},
	
		/**
		 * @type {AjaxAppDataResponse|Object}
		 */
		AppData = window.pSevenAppData || {},
	
		/**
		 * @type {boolean}
		 */
		bExtApp = false,
	
		$html = $('html'),
	
		/**
		 * @type {boolean}
		 */
		bIsIosDevice = -1 < navigator.userAgent.indexOf('iPhone') ||
			-1 < navigator.userAgent.indexOf('iPod') ||
			-1 < navigator.userAgent.indexOf('iPad'),
	
		/**
		 * @type {boolean}
		 */
		bIsAndroidDevice = -1 < navigator.userAgent.toLowerCase().indexOf('android'),
	
		/**
		 * @type {boolean}
		 */
		bMobileDevice = bIsIosDevice || bIsAndroidDevice,
	
		aViewMimeTypes = [
			'image/jpeg', 'image/png', 'image/gif',
			'text/plain', 'text/css',
			'text/rfc822-headers', 'message/delivery-status',
			'application/x-httpd-php', 'application/javascript'
		]
	;
	
	if (window.Modernizr && navigator)
	{
		// v = 15;
		window.Modernizr.addTest('pdf', function(){
			var mimes = navigator.mimeTypes;
			for (var i = 0, i_len = mimes.length; i < i_len; i++) {
				if (mimes[i].type === 'application/pdf') {
					return true;
				}
			}
			return false;
		});
	}
	
	
	/**
	 * @constructor
	 */
	function CBrowser()
	{
		this.ie = /msie/.test(navigator.userAgent.toLowerCase()) && !window.opera;
		this.ie8AndBelow = this.ie && this.getIeVersion() <= 8;
		this.ie9AndBelow = this.ie && this.getIeVersion() <= 9;
		this.opera = !!window.opera;
		this.firefox = /firefox/.test(navigator.userAgent.toLowerCase());
		this.chrome = /chrome/.test(navigator.userAgent.toLowerCase());
	}
	
	CBrowser.prototype.getIeVersion = function ()
	{
		var
			sUa = navigator.userAgent.toLowerCase(),
			iVersion = Utils.pInt(sUa.slice(sUa.indexOf('msie') + 4, sUa.indexOf(';', sUa.indexOf('msie') + 4)))
		;
		
		return iVersion;
	};
	
	
	/**
	 * @constructor
	 */
	function CAjax()
	{
		this.sUrl = '?/Ajax/';
		this.aRequests = [];
		
		this.hasOpenedRequests = false;
		
		$(document).ajaxStart(_.bind(function () {
			this.hasOpenedRequests = true;
		}, this));
		
		$(document).ajaxStop(_.bind(function () {
			this.hasOpenedRequests = false;
		}, this));
	}
	
	/**
	 * @param {string} sAction
	 */
	CAjax.prototype.isAllowedActionWithoutAuth = function (sAction)
	{
		var aActionsWithoutAuth = ['Login', 'LoginLanguageUpdate', 'Logout', 'AccountCreate'];
		
		return _.indexOf(aActionsWithoutAuth, sAction) !== -1;
	};
	
	CAjax.prototype.isAllowedExtAction = function (sAction)
	{
		return sAction === 'HelpdeskRegister' || sAction === 'HelpdeskForgot' || sAction === 'HelpdeskLogin' || sAction === 'Logout';
	};
	
	/**
	 * @param {Object} oParameters
	 * @param {Function=} fResponseHandler
	 * @param {Object=} oContext
	 * @param {Function=} fDone
	 */
	CAjax.prototype.doSend = function (oParameters, fResponseHandler, oContext, fDone)
	{
		var
			doneFunc = _.bind((fDone || null), this, oParameters, fResponseHandler, oContext),
			failFunc = _.bind(this.fail, this, oParameters, fResponseHandler, oContext),
			alwaysFunc = _.bind(this.always, this, oParameters),
			oXhr = null
		;
		
		if (AfterLogicApi.runPluginHook)
		{
			AfterLogicApi.runPluginHook('ajax-default-request', [oParameters.Action, oParameters]);
		}
		
		if (AppData.Token)
		{
			oParameters.Token = AppData.Token;
		}
	
		this.abortRequests(oParameters);
	
		oXhr = $.ajax({
			url: this.sUrl,
			type: 'POST',
			async: true,
			dataType: 'json',
			data: oParameters,
			success: doneFunc,
			error: failFunc,
			complete: alwaysFunc
		});
	
		this.aRequests.push({Parameters: oParameters, Xhr: oXhr});
	};
	
	/**
	 * @param {Object} oParameters
	 * @param {Function=} fResponseHandler
	 * @param {Object=} oContext
	 */
	CAjax.prototype.send = function (oParameters, fResponseHandler, oContext)
	{
		var
			bCurrentAccountId = oParameters.AccountID === undefined,
			bAccountExists = bCurrentAccountId || AppData.Accounts.hasAccountWithId(oParameters.AccountID)
		;
		
		if (oParameters && (AppData.Auth && bAccountExists || this.isAllowedActionWithoutAuth(oParameters.Action)))
		{
			if (bCurrentAccountId && oParameters.Action !== 'Login')
			{
				oParameters.AccountID = AppData.Accounts.currentId();
			}
			
			this.doSend(oParameters, fResponseHandler, oContext, this.done);
		}
	};
	
	/**
	 * @param {Object} oParameters
	 * @param {Function=} fResponseHandler
	 * @param {Object=} oContext
	 */
	CAjax.prototype.sendExt = function (oParameters, fResponseHandler, oContext)
	{	
		var
			aActionsWithoutAuth = [
				'HelpdeskRegister', 
				'HelpdeskForgot', 
				'HelpdeskLogin',
				'HelpdeskForgotChangePassword',
				'Logout',
				'CalendarList',
				'EventList'
			],
			bAllowWithoutAuth = _.indexOf(aActionsWithoutAuth, oParameters.Action) !== -1
		;
		
		if (oParameters && (AppData.Auth || bAllowWithoutAuth))
		{
			if (AppData.TenantHash)
			{
				oParameters.TenantHash = AppData.TenantHash;
			}
			
			this.doSend(oParameters, fResponseHandler, oContext, this.doneExt);
		}
	};
	
	/**
	 * @param {Object} oParameters
	 */
	CAjax.prototype.abortRequests = function (oParameters)
	{
		switch (oParameters.Action)
		{
			case 'MessageMove':
			case 'MessageDelete':
				this.abortRequestByActionName('MessageList', oParameters.Folder);
				this.abortRequestByActionName('Message');
				break;
			case 'MessageList':
			case 'MessageSetSeen':
				this.abortRequestByActionName('MessageList', oParameters.Folder);
				break;
			case 'FolderClear':
				this.abortRequestByActionName('MessageList', oParameters.Folder);
				
				// FolderCounts-request aborted during folder cleaning, not to get the wrong information.
				this.abortRequestByActionName('FolderCounts');
				break;
			case 'ContactList':
			case 'GlobalContactList':
				this.abortRequestByActionName('ContactList');
				this.abortRequestByActionName('GlobalContactList');
				break;
			case 'Contact':
			case 'GlobalContact':
				this.abortRequestByActionName('Contact');
				this.abortRequestByActionName('GlobalContact');
				break;
		}
	};
	
	/**
	 * @param {string} sAction
	 * @param {string=} sFolder
	 */
	CAjax.prototype.abortRequestByActionName = function (sAction, sFolder)
	{
		_.each(this.aRequests, function (oReq, iIndex) {
			if (oReq && oReq.Parameters.Action === sAction && 
				(sAction !== 'MessageList' || sFolder === oReq.Parameters.Folder))
			{
				oReq.Xhr.abort();
				this.aRequests[iIndex] = undefined;
			}
		}, this);
		
		this.aRequests = _.compact(this.aRequests);
	};
	
	CAjax.prototype.abortAllRequests = function ()
	{
		_.each(this.aRequests, function (oReq) {
			if (oReq)
			{
				oReq.Xhr.abort();
			}
		}, this);
		
		this.aRequests = [];
	};
	
	/**
	 * @param {Object} oParameters
	 * @param {Function} fResponseHandler
	 * @param {Object} oContext
	 * @param {{Result:boolean}} oData
	 * @param {string} sType
	 * @param {Object} oXhr
	 */
	CAjax.prototype.done = function (oParameters, fResponseHandler, oContext, oData, sType, oXhr)
	{
		var
			bAllowedActionWithoutAuth = this.isAllowedActionWithoutAuth(oParameters.Action),
			bAccountExists = AppData.Accounts.hasAccountWithId(oParameters.AccountID),
			bDefaultAccount = (oParameters.AccountID === AppData.Accounts.defaultId())
		;
		
		if (bAllowedActionWithoutAuth || bAccountExists)
		{
			if (oData && !oData.Result)
			{
				switch (oData.ErrorCode)
				{
					case Enums.Errors.InvalidToken:
						if (!bAllowedActionWithoutAuth)
						{
							App.tokenProblem();
						}
						break;
					case Enums.Errors.AuthError:
						if (bDefaultAccount && !bAllowedActionWithoutAuth)
						{
							this.abortAllRequests();
							App.authProblem();
						}
						break;
				}
			}
	
			this.executeResponseHandler(fResponseHandler, oContext, oData, oParameters);
		}
	};
	
	/**
	 * @param {Object} oParameters
	 * @param {Function} fResponseHandler
	 * @param {Object} oContext
	 * @param {{Result:boolean}} oData
	 * @param {string} sType
	 * @param {Object} oXhr
	 */
	CAjax.prototype.doneExt = function (oParameters, fResponseHandler, oContext, oData, sType, oXhr)
	{
		this.executeResponseHandler(fResponseHandler, oContext, oData, oParameters);
	};
	
	/**
	 * @param {Object} oParameters
	 * @param {Function} fResponseHandler
	 * @param {Object} oContext
	 * @param {Object} oXhr
	 * @param {string} sType
	 * @param {string} sErrorText
	 */
	CAjax.prototype.fail = function (oParameters, fResponseHandler, oContext, oXhr, sType, sErrorText)
	{
		var oData = {'Result': false, 'ErrorCode': 0};
		
		switch (sType)
		{
			case 'abort':
				oData = {'Result': false, 'ErrorCode': Enums.Errors.NotDisplayedError};
				break;
			default:
			case 'error':
			case 'parseerror':
				if (sErrorText === '')
				{
					oData = {'Result': false, 'ErrorCode': Enums.Errors.NotDisplayedError};
				}
				else
				{
					oData = {'Result': false, 'ErrorCode': Enums.Errors.DataTransferFailed};
				}
				break;
		}
		
		this.executeResponseHandler(fResponseHandler, oContext, oData, oParameters);
	};
	
	/**
	 * @param {Function} fResponseHandler
	 * @param {Object} oContext
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CAjax.prototype.executeResponseHandler = function (fResponseHandler, oContext, oData, oParameters)
	{
		if (!oData)
		{
			oData = {'Result': false, 'ErrorCode': 0};
		}
		
		if (AfterLogicApi.runPluginHook)
		{
			AfterLogicApi.runPluginHook('ajax-default-response', [oParameters.Action, oData]);
		}
		
		if (typeof fResponseHandler === 'function')
		{
			fResponseHandler.apply(oContext, [oData, oParameters]);
		}
	};
	
	/**
	 * @param {Object} oXhr
	 * @param {string} sType
	 * @param {{Action:string}} oParameters
	 */
	CAjax.prototype.always = function (oParameters, oXhr, sType)
	{
		_.each(this.aRequests, function (oReq, iIndex) {
			if (oReq && _.isEqual(oReq.Parameters, oParameters))
			{
				this.aRequests[iIndex] = undefined;
			}
		}, this);
		
		this.aRequests = _.compact(this.aRequests);
	};
	
	
	
	/**
	 * @enum {string}
	 */
	Enums.Screens = {
		'Login': 'login',
		'Information': 'information',
		'Header': 'header',
		'Mailbox': 'mailbox',
		'BottomMailbox': 'bottommailbox',
		'SingleMessageView': 'single-message-view',
		'Compose': 'compose',
		'SingleCompose': 'single-compose',
		'Settings': 'settings',
		'Contacts': 'contacts',
		'Calendar': 'calendar',
		'FileStorage': 'files',
		'Helpdesk': 'helpdesk',
		'SingleHelpdesk': 'single-helpdesk'
	};
	
	/**
	 * @enum {number}
	 */
	Enums.MailboxLayout = {
		'Side': 0,
		'Bottom': 1
	};
	
	/**
	 * @enum {number}
	 */
	Enums.CalendarDefaultTab = {
		'Day': 1,
		'Week': 2,
		'Month': 3
	};
	
	/**
	 * @enum {number}
	 */
	Enums.TimeFormat = {
		'F24': 0,
		'F12': 1
	};
	
	/**
	 * @enum {number}
	 */
	Enums.Errors = {
		'InvalidToken': 101,
		'AuthError': 102,
		'DataBaseError': 104,
		'LicenseProblem': 105,
		'DemoLimitations': 106,
		'Recaptcha': 107,
		'AccessDenied': 108,
		'CanNotGetMessage': 202,
		'ImapQuota': 205,
		'NotSavedInSentItems': 304,
		'CanNotChangePassword': 502,
		'AccountOldPasswordNotCorrect': 503,
		'FetcherIncServerNotAvailable': 702,
		'FetcherLoginNotCorrect': 703,
		'HelpdeskThrowInWebmail': 805,
		'HelpdeskUserNotExists': 807,
		'HelpdeskUserNotActivated': 808,
		'MailServerError': 901,
		'DataTransferFailed': 1100,
		'NotDisplayedError': 1155
	};
	
	/**
	 * @enum {number}
	 */
	Enums.FolderTypes = {
		'Inbox': 1,
		'Sent': 2,
		'Drafts': 3,
		'Spam': 4,
		'Trash': 5,
		'Virus': 6,
		'Starred': 7,
		'System': 9,
		'User': 10
	};
	
	/**
	 * @enum {string}
	 */
	Enums.FolderFilter = {
		'Flagged': 'flagged'
	};
	
	/**
	 * @enum {number}
	 */
	Enums.LoginFormType = {
		'Email': 0,
		'Login': 3,
		'Both': 4
	};
	
	/**
	 * @enum {number}
	 */
	Enums.LoginSignMeType = {
		'DefaultOff': 0,
		'DefaultOn': 1,
		'Unuse': 2
	};
	
	/**
	 * @enum {string}
	 */
	Enums.ReplyType = {
		'Reply': 'reply',
		'ReplyAll': 'reply-all',
		'Forward': 'forward'
	};
	
	/**
	 * @enum {number}
	 */
	Enums.Importance = {
		'Low': 5,
		'Normal': 3,
		'High': 1
	};
	
	/**
	 * @enum {number}
	 */
	Enums.Sensivity = {
		'Nothing': 0,
		'Confidential': 1,
		'Private': 2,
		'Personal': 3
	};
	
	/**
	 * @enum {string}
	 */
	Enums.ContactEmailType = {
		'Personal': 'Personal',
		'Business': 'Business',
		'Other': 'Other'
	};
	
	/**
	 * @enum {string}
	 */
	Enums.ContactPhoneType = {
		'Mobile': 'Mobile',
		'Personal': 'Personal',
		'Business': 'Business'
	};
	
	/**
	 * @enum {string}
	 */
	Enums.ContactAddressType = {
		'Personal': 'Personal',
		'Business': 'Business'
	};
	
	/**
	 * @enum {string}
	 */
	Enums.ContactSortType = {
		'Email': 'Email',
		'Name': 'Name',
		'Frequency': 'Frequency'
	};
	
	/**
	 * @enum {number}
	 */
	Enums.SaveMail = {
		'Hidden': 0,
		'Checked': 1,
		'Unchecked': 2
	};
	
	/**
	 * @enum {string}
	 */
	Enums.SettingsTab = {
		'Common': 'common',
		'EmailAccounts': 'accounts',
		'Calendar': 'calendar',
		'MobileSync': 'mobile_sync',
		'OutLookSync': 'outlook_sync',
		'Helpdesk': 'helpdesk'
	};
	
	/**
	 * @enum {string}
	 */
	Enums.AccountSettingsTab = {
		'Properties': 'properties',
		'Signature': 'signature',
		'Filters': 'filters',
		'Autoresponder': 'autoresponder',
		'Forward': 'forward',
		'Folders': 'folders',
		'FetcherInc': 'fetcher-inc',
		'FetcherOut': 'fetcher-out',
		'FetcherSig': 'fetcher-sig'
	};
	/**
	 * @enum {number}
	 */
	Enums.ContactsGroupListType = {
		'Personal': 0,
		'SubGroup': 1,
		'Global': 2
	};
	
	/**
	 * @enum {string}
	 */
	Enums.IcalType = {
		Request: 'REQUEST',
		Reply: 'REPLY',
		Cancel: 'CANCEL',
		Save: 'SAVE'
	};
	
	/**
	 * @enum {string}
	 */
	Enums.IcalConfig = {
		Accepted: 'ACCEPTED',
		Declined: 'DECLINED',
		Tentative: 'TENTATIVE',
		NeedsAction: 'NEEDS-ACTION'
	};
	
	/**
	 * @enum {number}
	 */
	Enums.IcalConfigInt = {
		Accepted: 1,
		Declined: 2,
		Tentative: 3,
		NeedsAction: 0
	};
	
	/**
	 * @enum {number}
	 */
	Enums.Key = {
		'Tab': 9,
		'Enter': 13,
		'Shift': 16,
		'Ctrl': 17,
		'Space': 32,
		'PageUp': 33,
		'PageDown': 34,
		'End': 35,
		'Home': 36,
		'Up': 38,
		'Down': 40,
		'Left': 37,
		'Right': 39,
		'Del': 46,
		'a': 65,
		'c': 67,
		'f': 70,
		'n': 78,
		'p': 80,
		'q': 81,
		'r': 82,
		's': 83,
		'v': 86,
		'F5': 116,
		'Comma': 188,
		'Dot': 190
	};
	
	/**
	 * @enum {number}
	 */
	Enums.FileStorageType = {
		'Private': 0,
		'Corporate': 1
	};
	
	/**
	 * @enum {number}
	 */
	Enums.HelpdeskThreadStates = {
		'None': 0,
		'Pending': 1,
		'Waiting': 2,
		'Answered': 3,
		'Resolved': 4,
		'Deferred': 5
	};
	
	/**
	 * @enum {number}
	 */
	Enums.HelpdeskPostType = {
		'Normal': 0,
		'Internal': 1,
		'System': 2
	};
	
	/**
	 * @enum {number}
	 */
	Enums.HelpdeskFilters = {
		'All': 0,
		'Pending': 1,
		'Resolved': 2,
		'InWork': 3,
		'Open': 4,
		'Archived': 9
	};
	
	/**
	 * @enum {number}
	 */
	Enums.CalendarAccess = {
		'Full': 0,
		'Write': 1,
		'Read': 2
	};
	
	/**
	 * @enum {number}
	 */
	Enums.CalendarEditRecurrenceEvent = {
		'None': 0,
		'OnlyThisInstance': 1,
		'AllEvents': 2
	};
	
	/**
	 * @enum {number}
	 */
	Enums.CalendarRepeatPeriod = {
		'None': 0,
		'Daily': 1,
		'Weekly': 2,
		'Monthly': 3,
		'Yearly': 4
	};
	
	Enums.DesktopNotifications = {
		'Allowed': 0,
		'NotAllowed': 1,
		'Denied': 2,
		'NotSupported': 9
	};
	
	Enums.PhoneAction = {
		'Settings': 'settings',
		'Incoming': 'incoming',
		'Outgoing': 'outgoing'
	};
	
	Enums.HtmlEditorImageSizes = {
		'Small': 'small',
		'Medium': 'medium',
		'Large': 'large',
		'Original': 'original'
	};
	
	ko.bindingHandlers.command = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel) {
			var
				jqElement = $(oElement),
				oCommand = fValueAccessor()
			;
	
			if (!oCommand || !oCommand.enabled || !oCommand.canExecute)
			{
				throw new Error('You are not using command function');
			}
	
			jqElement.addClass('command');
			ko.bindingHandlers[jqElement.is('form') ? 'submit' : 'click'].init.apply(oViewModel, arguments);
		},
	
		'update': function (oElement, fValueAccessor) {
	
			var
				bResult = true,
				jqElement = $(oElement),
				oCommand = fValueAccessor()
			;
	
			bResult = oCommand.enabled();
			jqElement.toggleClass('command-not-enabled', !bResult);
	
			if (bResult)
			{
				bResult = oCommand.canExecute();
				jqElement.toggleClass('unavailable', !bResult);
			}
	
			jqElement.toggleClass('command-disabled disable disabled', !bResult);
	
			jqElement.toggleClass('command-disabled', !bResult);
	//		if (jqElement.is('input') || jqElement.is('button'))
	//		{
	//			jqElement.prop('disabled', !bResult);
	//		}
		}
	};
	
	ko.bindingHandlers.onEnter = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel) {
			ko.bindingHandlers.event.init(oElement, function () {
				return {
					'keyup': function (oData, oEvent) {
						if (oEvent && 13 === window.parseInt(oEvent.keyCode, 10))
						{
							$(oElement).trigger('change');
							fValueAccessor().call(this, oData);
						}
					}
				};
			}, fAllBindingsAccessor, oViewModel);
		}
	};
	ko.bindingHandlers.onCtrlEnter = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel) {
			ko.bindingHandlers.event.init(oElement, function () {
				return {
					'keydown': function (oData, oEvent) {
						if (oEvent && 13 === window.parseInt(oEvent.keyCode, 10) && oEvent.ctrlKey)
						{
							$(oElement).trigger('change');
							fValueAccessor().call(this, oData);
	
							return false;
						}
	
						return true;
					}
				};
			}, fAllBindingsAccessor, oViewModel);
		}
	};
	
	ko.bindingHandlers.onEsc = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel) {
			ko.bindingHandlers.event.init(oElement, function () {
				return {
					'keyup': function (oData, oEvent) {
						if (oEvent && 27 === window.parseInt(oEvent.keyCode, 10))
						{
							$(oElement).trigger('change');
							fValueAccessor().call(this, oData);
						}
					}
				};
			}, fAllBindingsAccessor, oViewModel);
		}
	};
	
	ko.bindingHandlers.onFocusSelect = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel) {
			ko.bindingHandlers.event.init(oElement, function () {
				return {
					'focus': function () {
						oElement.select();
					},
					'mouseup': function () {
						return false;
					}
				};
			}, fAllBindingsAccessor, oViewModel);
		}
	};
	
	ko.bindingHandlers.onFocusMoveCaretToEnd = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel) {
			ko.bindingHandlers.event.init(oElement, function () {
				return {
					'focus': function () {
						Utils.moveCaretToEnd(oElement);
					}
				};
			}, fAllBindingsAccessor, oViewModel);
		}
	};
	
	ko.bindingHandlers.onEnterChange = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel) {
			ko.bindingHandlers.event.init(oElement, function () {
				return {
					'keyup': function (oData, oEvent) {
						if (oEvent && 13 === window.parseInt(oEvent.keyCode, 10))
						{
							$(oElement).trigger('change');
						}
					}
				};
			}, fAllBindingsAccessor, oViewModel);
		}
	};
	
	ko.bindingHandlers.jhasfocus = {
		'init': function (oElement, fValueAccessor) {
			$(oElement).on('focus', function () {
				fValueAccessor()(true);
			}).on('blur', function () {
				fValueAccessor()(false);
			});
		},
		'update': function (oElement, fValueAccessor) {
			if (ko.utils.unwrapObservable(fValueAccessor()))
			{
				if (!$(oElement).is(':focus'))
				{
					$(oElement).focus();
				}
			}
			else
			{
				if ($(oElement).is(':focus'))
				{
					$(oElement).blur();
				}
			}
		}
	};
	
	ko.bindingHandlers.fadeIn = {
		'update': function (oElement, fValueAccessor) {
			if (ko.utils.unwrapObservable(fValueAccessor()))
			{
				$(oElement).hide().fadeIn('fast');
			}
		}
	};
	
	ko.bindingHandlers.fadeOut = {
		'update': function (oElement, fValueAccessor) {
			if (ko.utils.unwrapObservable(fValueAccessor()))
			{
				$(oElement).fadeOut();
			}
		}
	};
	
	ko.bindingHandlers.i18n = {
		'init': function (oElement, fValueAccessor) {
	
			var
				sKey = $(oElement).data('i18n'),
				sValue = sKey ? Utils.i18n(sKey) : sKey
			;
	
			if ('' !== sValue)
			{
				switch (fValueAccessor()) {
				case 'value':
					$(oElement).val(sValue);
					break;
				case 'text':
					$(oElement).text(sValue);
					break;
				case 'html':
					$(oElement).html(sValue);
					break;
				case 'title':
					$(oElement).attr('title', sValue);
					break;
				case 'placeholder':
					$(oElement).attr({'placeholder': sValue});
					break;
				}
			}
		}
	};
	
	ko.bindingHandlers.link = {
		'init': function (oElement, fValueAccessor) {
			$(oElement).attr('href', ko.utils.unwrapObservable(fValueAccessor()));
		}
	};
	
	ko.bindingHandlers.title = {
		'init': function (oElement, fValueAccessor) {
			$(oElement).attr('title', ko.utils.unwrapObservable(fValueAccessor()));
		}
	};
	
	ko.bindingHandlers.initDom = {
		'init': function (oElement, fValueAccessor) {
			if (fValueAccessor()) {
				if (_.isArray(fValueAccessor()))
				{
					var
						aList = fValueAccessor(),
						iIndex = aList.length - 1
					;
	
					for (; 0 <= iIndex; iIndex--)
					{
						aList[iIndex]($(oElement));
					}
				}
				else
				{
					fValueAccessor()($(oElement));
				}
			}
		}
	};
	
	ko.bindingHandlers.customScrollbar = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel) {
			var
				jqElement = $(oElement),
				oCommand = fValueAccessor()
			;
			
			oCommand = /** @type {{scrollToTopTrigger:{subscribe:Function},scrollToBottomTrigger:{subscribe:Function},scrollTo:{subscribe:Function},reset:Function}}*/ oCommand;
			
			jqElement.addClass('scroll-wrap').customscroll(oCommand);
			
			if (!Utils.isUnd(oCommand.reset)) {
				oElement._customscroll_reset = _.throttle(function () {
					jqElement.data('customscroll').reset();
				}, 100);
			}
			
			if (!Utils.isUnd(oCommand.scrollToTopTrigger) && Utils.isFunc(oCommand.scrollToTopTrigger.subscribe)) {
				oCommand.scrollToTopTrigger.subscribe(function () {
					if (jqElement.data('customscroll')) {
						jqElement.data('customscroll')['scrollToTop']();
					}
				});
			}
			
			if (!Utils.isUnd(oCommand.scrollToBottomTrigger) && Utils.isFunc(oCommand.scrollToBottomTrigger.subscribe)) {
				oCommand.scrollToBottomTrigger.subscribe(function () {
					if (jqElement.data('customscroll')) {
						jqElement.data('customscroll')['scrollToBottom']();
					}
				});
			}
			
			if (!Utils.isUnd(oCommand.scrollTo) && Utils.isFunc(oCommand.scrollTo.subscribe)) {
				oCommand.scrollTo.subscribe(function () {
					if (jqElement.data('customscroll')) {
						jqElement.data('customscroll')['scrollTo'](oCommand.scrollTo());
					}
				});
			}
		},
		
		'update': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel, bindingContext) {
			if (oElement._customscroll_reset) {
				oElement._customscroll_reset();
			}
			if (!Utils.isUnd(fValueAccessor().top)) {
				$(oElement).data('customscroll')['vertical'].set(fValueAccessor().top);
			}
		}
	};
	
	ko.bindingHandlers.customOptions = {
		'init': function () {
			return {
				'controlsDescendantBindings': true
			};
		},
	
		'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var i = 0, j = 0;
			var previousSelectedValues = ko.utils.arrayMap(ko.utils.arrayFilter(element.childNodes, function (node) {
				return node.tagName && node.tagName === 'OPTION' && node.selected;
			}), function (node) {
				return ko.selectExtensions.readValue(node) || node.innerText || node.textContent;
			});
			var previousScrollTop = element.scrollTop;
			var value = ko.utils.unwrapObservable(valueAccessor());
	
			// Remove all existing <option>s.
			while (element.length > 0)
			{
				ko.cleanNode(element.options[0]);
				element.remove(0);
			}
	
			if (value)
			{
				if (typeof value.length !== 'number')
				{
					value = [value];
				}
	
				var optionsBind = allBindingsAccessor()['optionsBind'];
				for (i = 0, j = value.length; i < j; i++)
				{
					var option = document.createElement('OPTION');
					var optionValue = ko.utils.unwrapObservable(value[i]);
					ko.selectExtensions.writeValue(option, optionValue);
					option.appendChild(document.createTextNode(optionValue));
					element.appendChild(option);
					if (optionsBind)
					{
						option.setAttribute('data-bind', optionsBind);
						ko.applyBindings(bindingContext['createChildContext'](optionValue), option);
					}
				}
	
				var newOptions = element.getElementsByTagName('OPTION');
				var countSelectionsRetained = 0;
				var isIe = navigator.userAgent.indexOf("MSIE 6") >= 0;
				for (i = 0, j = newOptions.length; i < j; i++)
				{
					if (ko.utils.arrayIndexOf(previousSelectedValues, ko.selectExtensions.readValue(newOptions[i])) >= 0)
					{
						 if (isIe) {
							 newOptions[i].setAttribute("selected", true);
						 } else {
							newOptions[i].selected = true;
						 }
	
						countSelectionsRetained++;
					}
				}
	
				element.scrollTop = previousScrollTop;
	
				if (countSelectionsRetained < previousSelectedValues.length)
				{
					ko.utils.triggerEvent(element, 'change');
				}
			}
		}
	};
	
	ko.bindingHandlers.splitter = {
		'init': function (oElement, fValueAccessor) {
			var
				jqElement = $(oElement),
				oCommand = fValueAccessor()
			;
	
			setTimeout(function(){
				jqElement.splitter(_.defaults(
					oCommand,
					{
						'name': '',
						'sizeLeft': 200,
						'minLeft': 20,
						'minRight': 40
					}
				));
			}, 1);
		}
	};
	
	ko.bindingHandlers.dropdown = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel) {
			var
				jqElement = $(oElement),
				oCommand = _.defaults(
					fValueAccessor(), {
						'disabled': 'disabled',
						'expand': 'expand',
						'control': true,
						'container': '.dropdown_content',
						'passClick': true,
						'trueValue': true
					}
				),
				element = oCommand['control'] ? jqElement.find('.control') : jqElement,
				oDocument = $(document),
				callback = function () {
					if (!Utils.isUnd(oCommand['callback'])) {
						oCommand['callback'].call(
							oViewModel,
							jqElement.hasClass(oCommand['expand']) ? oCommand['trueValue'] : false,
							jqElement
						);
					}
				},
				stop = function (event) {
					event.stopPropagation();
				}
			;
			
			if (!oCommand['passClick']) {
				jqElement.find(oCommand['container']).click(stop);
				element.click(stop);
			}
			
			jqElement.removeClass(oCommand['expand']);
			
			if (oCommand['close'] && oCommand['close']['subscribe']) {
				oCommand['close'].subscribe(function (bValue) {
					if (!bValue) {
						oDocument.unbind('click.dropdown');
						jqElement.removeClass(oCommand['expand']);
					}
					
					callback();
				});
			}
	
			//TODO fix data-bind click
			element.click(function(){
				if (!jqElement.hasClass(oCommand['disabled'])) {
					
					jqElement.toggleClass(oCommand['expand']);
					
					_.defer(function(){
						callback();
					});
					
					if (jqElement.hasClass(oCommand['expand'])) {
						
						if (oCommand['close'] && oCommand['close']['subscribe']) {
							oCommand['close'](true);
						}
						
						_.defer(function(){
							oDocument.one('click.dropdown', function () {
								if (oCommand['close'] && oCommand['close']['subscribe']) {
									oCommand['close'](false);
								}
								jqElement.removeClass(oCommand['expand']);
								
								callback();
							});
						});
					}
				}
			});
		}
	};
	
	ko.bindingHandlers.customSelect = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel) {
			var
				jqElement = $(oElement),
				oCommand = _.defaults(
					fValueAccessor(), {
						'disabled': 'disabled',
						'selected': 'selected',
						'expand': 'expand',
						'control': true,
						'input': false
					}
				),
				aOptions = [],
				oControl = oCommand['control'] ? jqElement.find('.control') : jqElement,
				oContainer = jqElement.find('.dropdown_content'),
				oText = jqElement.find('.link'),
				
				updateField = function (value) {
					_.each(aOptions, function (item) {
						item.removeClass(oCommand['selected']);
					});
					var item = _.find(oCommand['options'], function (item) {
						return item[oCommand['optionsValue']] === value;
					});
					if (Utils.isUnd(item)) {
						item = oCommand['options'][0];
					}
					aOptions[_.indexOf(oCommand['options'], item)].addClass(oCommand['selected']);
					oText.text($.trim(item[oCommand['optionsText']]));
					
					return item[oCommand['optionsValue']];
				}
			;
	
			var updateList = function () {
				oContainer.empty();
				aOptions = [];
	
				_.each(oCommand['options'], function (item) {
					var
						oOption = $('<span class="item"></span>')
							.text(item[oCommand['optionsText']])
							.data('value', item[oCommand['optionsValue']]),
						isDisabled = item['isDisabled']
						;
	
					if (isDisabled)
					{
						oOption.data('isDisabled', isDisabled).addClass('disabled');
					}
					else
					{
						oOption.data('isDisabled', isDisabled).removeClass('disabled');
					}
	
					aOptions.push(oOption);
					oContainer.append(oOption);
				}, this);
			};
			updateList();
	
			oContainer.on('click', '.item', function () {
				var jqItem = $(this);
	
				if(!jqItem.data('isDisabled'))
				{
					oCommand.value(jqItem.data('value'));
				}
			});
	
			if (!oCommand.input && oCommand['value'] && oCommand['value'].subscribe)
			{
				oCommand['value'].subscribe(function () {
					var mValue = updateField(oCommand['value']());
					if (oCommand['value']() !== mValue)
					{
						oCommand['value'](mValue);
					}
				}, oViewModel);
	
				oCommand['value'].valueHasMutated();
			}
	
			if(oCommand.alarmOptions)
			{
				oCommand.alarmOptions.subscribe(function () {
					updateList();
				}, oViewModel);
			}
	
			//TODO fix data-bind click
			jqElement.removeClass(oCommand['expand']);
			oControl.click(function(ev){
				if (!jqElement.hasClass(oCommand['disabled'])) {
					jqElement.toggleClass(oCommand['expand']);
	
					if (jqElement.hasClass(oCommand['expand'])) {
	//				if (jqElement.hasClass(oCommand['expand']) && !$(ev.target).hasClass('disabled')) {
						_.defer(function(){
							$(document).one('click', function () {
								jqElement.removeClass(oCommand['expand']);
							});
						});
					}
	//				else
	//				{
	//					jqElement.addClass(oCommand['expand']);
	//				}
				}
			});
		}
	};
	
	ko.bindingHandlers.moveToFolderFilter = {
		
		'init': function (oElement, fValueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var
				jqElement = $(oElement),
				oCommand = _.defaults(
					fValueAccessor(), {
						'disabled': 'disabled',
						'selected': 'selected',
						'expand': 'expand',
						'control': true,
						'container': '.content'
					}
				),
				oControl = oCommand['control'] ? jqElement.find('.control') : jqElement,
				oContainer = jqElement.find(oCommand['container']),
				text = jqElement.find('.link')
			;
	
			jqElement.removeClass(oCommand['expand']);
	
			oCommand['options'].subscribe(function (aValue) {
				var
					sValue = oCommand['value'](),
					oFolderItem = _.find(aValue, function (oItem) {
						return oItem.id === sValue;
					})
				;
	
				if (!oFolderItem)
				{
					oCommand['value']('');
				}
			});
	
			if (oCommand['value'] && oCommand['value'].subscribe)
			{
				oCommand['value'].subscribe(function (sValue) {
					var
						aOptions = _.isArray(oCommand['options']) ? oCommand['options'] : oCommand['options'](),
						oFindItem = _.find(aOptions, function (oItem) {
							return oItem[oCommand['optionsValue']] === sValue;
						})
					;
	
					if (!oFindItem)
					{
						oFindItem = _.find(aOptions, function (oItem) {
							return oItem[oCommand['optionsValue']] === '';
						});
	
						if (oFindItem && '' !== sValue)
						{
							oCommand['value']('');
						}
					}
	
					if (oFindItem)
					{
						text.text($.trim(oFindItem[oCommand['optionsText']]));
					}
				});
	
				oCommand['value'].valueHasMutated();
			}
	
			oContainer.on('click', '.item', function () {
				var sFolderName = $(this).data('value');
				oCommand['value'](sFolderName);
			});
	
			oControl.click(function(){
				if (!jqElement.hasClass(oCommand['disabled'])) {
					jqElement.toggleClass(oCommand['expand']);
					if (jqElement.hasClass(oCommand['expand'])) {
						_.defer(function(){
							$(document).one('click', function () {
								jqElement.removeClass(oCommand['expand']);
							});
						});
					}
				}
			});
		},
		'update': function (oElement, fValueAccessor) {
			var
				oCommand = _.defaults(
					fValueAccessor(), {
						'disabled': 'disabled',
						'selected': 'selected',
						'expand': 'expand',
						'control': true,
						'container': '.content'
					}
				),
				oContainer = $(oElement).find(oCommand['container']),
				aOptions = _.isArray(oCommand['options']) ? oCommand['options'] : oCommand['options'](),
				sFolderName = oCommand['value'] ? oCommand['value']() : ''
			;
	
			oContainer.empty();
	
			_.each(aOptions, function (item) {
				var oOption = $('<span class="item"></span>')
					.text(item[oCommand['optionsText']])
					.data('value', item[oCommand['optionsValue']]);
	
				if (sFolderName === item[oCommand['optionsValue']])
				{
					oOption.addClass('selected');
				}
	
				oContainer.append(oOption);
			});
		}
	};
	
	ko.bindingHandlers.contactcard = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel) {
			var
				jqElement = $(oElement),
				bShown = false,
				oCommand = _.defaults(
					fValueAccessor(), {
						'disabled': 'disabled',
						'expand': 'expand',
						'control': true
					}
				),
				element = oCommand['control'] ? jqElement.find('.control') : jqElement
			;
	
			if (oCommand['trigger'] !== undefined && oCommand['trigger'].subscribe !== undefined) {
				
				jqElement.removeClass(oCommand['expand']);
				
				element.bind({
					'mouseover': function() {
						if (!jqElement.hasClass(oCommand['disabled']) && oCommand['trigger']()) {
							bShown = true;
							_.delay(function () {
								if (bShown) {
									jqElement.addClass(oCommand['expand']);
								}
							}, 200);
						}
					},
					'mouseout': function() {
						if (oCommand['trigger']()) {
							bShown = false;
							_.delay(function () {
								if (!bShown) {
									jqElement.removeClass(oCommand['expand']);
								}
							}, 200);
						}
					}
				});
	
			}
		}
	};
	
	ko.bindingHandlers.checkmail = {
		'update': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel, bindingContext) {
				
			var
				oOptions = oElement.oOptions || null,
				jqElement = oElement.jqElement || null,
				oIconIE = oElement.oIconIE || null,
				values = fValueAccessor(),
				state = values.state
			;
	
			if (values.state !== undefined) {
				if (!jqElement)
				{
					oElement.jqElement = jqElement = $(oElement);
				}
	
				if (!oOptions)
				{
					oElement.oOptions = oOptions = _.defaults(
						values, {
							'activeClass': 'process',
							'duration': 800
						}
					);
				}
	
				Utils.deferredUpdate(jqElement, state, oOptions['duration'], function(element, state){
					if (App.browser.ie9AndBelow)
					{
						if (!oIconIE)
						{
							oElement.oIconIE = oIconIE = jqElement.find('.icon');
						}
	
						if (!oIconIE.__intervalIE && !!state)
						{
							var
								i = 0,
								style = ''
							;
	
							oIconIE.__intervalIE = setInterval(function() {
								style = '0px -' + (20 * i) + 'px';
								i = i < 7 ? i + 1 : 0;
								oIconIE.css({'background-position': style});
							} , 1000/12);
						}
						else
						{
							oIconIE.css({'background-position': '0px 0px'});
							clearInterval(oIconIE.__intervalIE);
							oIconIE.__intervalIE = null;
						}
					}
					else
					{
						element.toggleClass(oOptions['activeClass'], state);
					}
				});
			}
		}
	};
	
	ko.bindingHandlers.heightAdjust = {
		'update': function (oElement, fValueAccessor, fAllBindingsAccessor) {
				
			var 
				jqElement = oElement.jqElement || null,
				height = 0,
				sLocation = fValueAccessor().location
			;
	
			if (!jqElement) {
				oElement.jqElement = jqElement = $(oElement);
			}
	
			_.delay(function () {
				_.each(fValueAccessor().elements, function (mItem) {
					var element = mItem();
					if (element) {
						height += element.is(':visible') ? element.outerHeight() : 0;
					}
				});
				
				if (sLocation === 'top' || sLocation === undefined) {
					jqElement.css({
						'padding-top': height,
						'margin-top': -height
					});
				} else if (sLocation === 'bottom') {
					jqElement.css({
						'padding-bottom': height,
						'margin-bottom': -height
					});
				}
			}, 400);
		}
	};
	
	ko.bindingHandlers.triggerInview = {
		'update': function (oElement, fValueAccessor) {
			if (fValueAccessor().trigger().length <= 0 )
			{
				return;
			}
			
			_.defer(function () {
				var 
					$element = $(oElement),
					frameHeight = $element.height(),
					oCommand = fValueAccessor(),
					elements = null
				;
				
				oCommand = /** @type {{selector:string}}*/ oCommand;
				elements = $element.find(oCommand.selector);
				
				elements.each(function () {
					this.$el = $(this);
					this.inviewHeight = this.$el.height();
					this.inview = false;
				});
				
				var delayedScroll = _.debounce(function () {
					
					elements.each(function () {
						var inview = this.inview || false;
						
						var elOffset = this.$el.position().top + parseInt(this.$el.css('margin-top'), 10);
						if (elOffset > 0 && elOffset < frameHeight)
						{
							if (!inview)
							{
								this.inview = true;
								this.$el.trigger('inview');                        
							}
						}
						else
						{
							this.inview = false;
						}
					});
				}, 2000);
				
				$element.scroll(delayedScroll);
				
				delayedScroll();
			});
		}
	};
	
	ko.bindingHandlers.watchWidth = {
		'init': function (oElement, fValueAccessor) {
			$(window).bind('resize', function () {
				fValueAccessor()($(oElement).outerWidth());
			});
		}
	};
	
	ko.bindingHandlers.columnCalc = {
		'init': function (oElement, fValueAccessor) {
	
			var
				$oElement = $(oElement),
				oProp = fValueAccessor()['prop'],
				$oItem = null,
				iWidth = 0
			;
				
			$oItem = $oElement.find(fValueAccessor()['itemSelector']);
	
			if ($oItem[0] === undefined) {
				return;
			}
			
			iWidth = $oItem.outerWidth(true);
			iWidth = 1 >= iWidth ? 1 : iWidth;
			
			if (oProp)
			{
				$(window).bind('resize', function () {
					var iW = $oElement.width();
					oProp(0 < iW ? Math.floor(iW / iWidth) : 1);
				});
			}
		}
	};
	
	ko.bindingHandlers.quickReplyAnim = {
		'update': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel, bindingContext) {
	
			var
				jqTextarea = oElement.jqTextarea || null,
				jqStatus = oElement.jqStatus || null,
				jqButtons = oElement.jqButtons || null,
				jqElement = oElement.jqElement || null,
				oPrevActions = oElement.oPrevActions || null,
				values = fValueAccessor(),
				oActions = null
			;
	
			oActions = _.defaults(
				values, {
					'saveAction': false,
					'sendAction': false,
					'activeAction': false
				}
			);
	
			if (!jqElement)
			{
				oElement.jqElement = jqElement = $(oElement);
				oElement.jqTextarea = jqTextarea = jqElement.find('textarea');
				oElement.jqStatus = jqStatus = jqElement.find('.status');
				oElement.jqButtons = jqButtons = jqElement.find('.buttons');
				
				oElement.oPrevActions = oPrevActions = {
					'saveAction': null,
					'sendAction': null,
					'activeAction': null
				};
			}
	
			if (jqElement.is(':visible'))
			{
				if (App.browser.ie9AndBelow)
				{
					if (jqTextarea && !jqElement.defualtHeight && !jqTextarea.defualtHeight)
					{
						jqElement.defualtHeight = jqElement.outerHeight();
						jqTextarea.defualtHeight = jqTextarea.outerHeight();
						jqStatus.defualtHeight = jqButtons.outerHeight();
						jqButtons.defualtHeight = jqButtons.outerHeight();
					}
	
					_.defer(function () {
						var 
							activeChanged = oPrevActions.activeAction !== oActions['activeAction'],
							sendChanged = oPrevActions.sendAction !== oActions['sendAction'],
							saveChanged = oPrevActions.saveAction !== oActions['saveAction']
						;
	
						if (activeChanged)
						{
							if (oActions['activeAction'])
							{
								jqTextarea.animate({
									'height': jqTextarea.defualtHeight + 50
								}, 300);
								jqElement.animate({
									'max-height': jqElement.defualtHeight + jqButtons.defualtHeight + 50
								}, 300);
							}
							else
							{
								jqTextarea.animate({
									'height': jqTextarea.defualtHeight
								}, 300);
								jqElement.animate({
									'max-height': jqElement.defualtHeight
								}, 300);
							}
						}
	
						if (sendChanged || saveChanged)
						{
							if (oActions['sendAction'])
							{
								jqElement.animate({
									'max-height': '30px'
								}, 300);
								jqStatus.animate({
									'max-height': '30px',
									'opacity': 1
								}, 300);
							}
							else if (oActions['saveAction'])
							{
								jqElement.animate({
									'max-height': 0
								}, 300);
							}
							else
							{
								jqElement.animate({
									'max-height': jqElement.defualtHeight + jqButtons.defualtHeight + 50
								}, 300);
								jqStatus.animate({
									'max-height': 0,
									'opacity': 0
								}, 300);
							}
						}
					});
				}
				else
				{
					jqElement.toggleClass('saving', oActions['saveAction']);
					jqElement.toggleClass('sending', oActions['sendAction']);
					jqElement.toggleClass('active', oActions['activeAction']);
				}
			}
	
			_.defer(function () {
				oPrevActions = oActions;
			});
		}
	};
	
	ko.extenders.reversible = function (oTarget)
	{
		var mValue = oTarget();
	
		oTarget.commit = function ()
		{
			mValue = oTarget();
		};
	
		oTarget.revert = function ()
		{
			oTarget(mValue);
		};
	
		oTarget.commitedValue = function ()
		{
			return mValue;
		};
	
		oTarget.changed = function ()
		{
			return mValue !== oTarget();
		};
		
		return oTarget;
	};
	
	ko.extenders.autoResetToFalse = function (oTarget, iOption)
	{
		oTarget.iTimeout = 0;
		oTarget.subscribe(function (bValue) {
			if (bValue)
			{
				window.clearTimeout(oTarget.iTimeout);
				oTarget.iTimeout = window.setTimeout(function () {
					oTarget.iTimeout = 0;
					oTarget(false);
				}, Utils.pInt(iOption));
			}
		});
	
		return oTarget;
	};
	
	/**
	 * @param {(Object|null|undefined)} oContext
	 * @param {Function} fExecute
	 * @param {(Function|boolean|null)=} fCanExecute
	 * @return {Function}
	 */
	Utils.createCommand = function (oContext, fExecute, fCanExecute)
	{
		var
			fResult = fExecute ? function () {
				if (fResult.canExecute && fResult.canExecute())
				{
					return fExecute.apply(oContext, Array.prototype.slice.call(arguments));
				}
				return false;
			} : function () {}
		;
	
		fResult.enabled = ko.observable(true);
	
		fCanExecute = Utils.isUnd(fCanExecute) ? true : fCanExecute;
		if (Utils.isFunc(fCanExecute))
		{
			fResult.canExecute = ko.computed(function () {
				return fResult.enabled() && fCanExecute.call(oContext);
			});
		}
		else
		{
			fResult.canExecute = ko.computed(function () {
				return fResult.enabled() && !!fCanExecute;
			});
		}
	
		return fResult;
	};
	
	ko.bindingHandlers.autocomplete = {
		'init': function (oElement, fValueAccessor) {
			
			function split(val)
			{
				return val.split(/,\s*/);
			}
	
			function extractLast(term)
			{
				return split(term).pop();
			}
	
			var 
				fCallback = fValueAccessor(),
				oJqElement = $(oElement)
			;
			
			if (fCallback && oJqElement && oJqElement[0])
			{
				oJqElement.autocomplete({
					'minLength': 1,
					
					'source': function (request, response) {
						fCallback(extractLast(request['term']), response);
					},
					'search': function () {
						var term = extractLast(this.value);
						if (term.length < 1) {
							return false;
						}
	
						return true;
					},
					'focus': function () {
						return false;
					},
					'select': function (event, ui) {
						var terms = split(this.value);
	
						terms.pop();
						terms.push(ui['item']['value']);
						terms.push('');
	
						this.value = terms.join(', ').slice(0, -2);
	
						oJqElement.trigger('change');
	
						// Move to the end of the input string
						var moveCursorToEnd = function(el) {
							var endIndex = el.value.length;
	
							//Chrome
							el.blur();
							el.focus();
							//IE, firefox and Opera
							if (el.setSelectionRange) {
								el.setSelectionRange(endIndex, endIndex);
							}
						};
						moveCursorToEnd(oJqElement[0]);
	
						return false;
					}
				});
			}
		}
	};
	
	ko.bindingHandlers.autocompleteSimple = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel, bindingContext) {
	
			var
				jqEl = $(oElement),
				oOptions = fValueAccessor(),
				fCallback = oOptions['callback'],
				oDataAccessor = oOptions.dataAccessor ? oOptions.dataAccessor : null
			;
	
			if (fCallback && jqEl && jqEl[0])
			{
				jqEl.autocomplete({
					'minLength': 1,
					'source': function (request, response) {
						fCallback(request['term'], response);
					},
					'focus': function () {
						return false;
					},
					'select': function (oEvent, oItem) {
						_.delay(function () {
							jqEl.trigger('change');
						}, 5);
	
						if (oDataAccessor)
						{
							oDataAccessor(oItem.item);
						}
	
						return true;
					}
				});
			}
		}
	};
	
	ko.bindingHandlers.draggablePlace = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel, bindingContext) {
			var oAllBindingsAccessor = fAllBindingsAccessor ? fAllBindingsAccessor() : null;
			$(oElement).draggable({
				'distance': 20,
				'handle': '.dragHandle',
				'cursorAt': {'top': 0, 'left': 0},
	//			'cursorAt': {'top': 22, 'left': 3},
				'helper': function (oEvent) {
					return fValueAccessor().call(oViewModel, oEvent && oEvent.target ? ko.dataFor(oEvent.target) : null);
				},
				'start': (oAllBindingsAccessor && oAllBindingsAccessor['draggableDragStartCallback']) ? oAllBindingsAccessor['draggableDragStartCallback'] : Utils.emptyFunction,
				'stop': (oAllBindingsAccessor && oAllBindingsAccessor['draggableDragStopCallback']) ? oAllBindingsAccessor['draggableDragStopCallback'] : Utils.emptyFunction
			}).on('mousedown', function () {
				Utils.removeActiveFocus();
			});
		}
	};
	
	ko.bindingHandlers.droppable = {
		'init': function (oElement, fValueAccessor) {
			var fValueFunc = fValueAccessor();
			if (false !== fValueFunc)
			{
				$(oElement).droppable({
					'hoverClass': 'droppableHover',
					'drop': function (oEvent, oUi) {
						fValueFunc(oEvent, oUi);
					}
				});
			}
		}
	};
	
	ko.bindingHandlers.draggable = {
		'init': function (oElement, fValueAccessor) {
			$(oElement).attr('draggable', ko.utils.unwrapObservable(fValueAccessor()));
		}
	};
	
	ko.bindingHandlers.autosize = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel, bindingContext) {
	
			var
				jqEl = $(oElement),
				oOptions = fValueAccessor(),
				iHeight = jqEl.height(),
				iOuterHeight = jqEl.outerHeight(),
				iInnerHeight = jqEl.innerHeight(),
				iBorder = iOuterHeight - iInnerHeight,
				iPaddingTB = iInnerHeight - iHeight,
				iMinHeight = oOptions.minHeight ? oOptions.minHeight : 0,
				iMaxHeight = oOptions.maxHeight ? oOptions.maxHeight : 0,
				iScrollableHeight = oOptions.scrollableHeight ? oOptions.scrollableHeight : 1000,// max-height of .scrollable_field
				oAutosizeTrigger = oOptions.autosizeTrigger ? oOptions.autosizeTrigger : null,
					
				/**
				 * @param {boolean=} bIgnoreScrollableHeight
				 */
				fResize = function (bIgnoreScrollableHeight) {
					var iPadding = 0;
	
					if (App.browser.firefox)
					{
						iPadding = parseInt(jqEl.css('padding-top'), 10) * 2;
					}
	
					if (iMaxHeight)
					{
						/* 0-timeout to get the already changed text */
						setTimeout(function () {
							if (jqEl.prop('scrollHeight') < iMaxHeight)
							{
								jqEl.height(iMinHeight - iPaddingTB - iBorder);
								jqEl.height(jqEl.prop('scrollHeight') + iPadding - iPaddingTB);
							}
							else
							{
								jqEl.height(iMaxHeight - iPaddingTB - iBorder);
							}
						}, 100);
					}
					else if (bIgnoreScrollableHeight || jqEl.prop('scrollHeight') < iScrollableHeight)
					{
						setTimeout(function () {
							jqEl.height(iMinHeight - iPaddingTB - iBorder);
							jqEl.height(jqEl.prop('scrollHeight') + iPadding - iPaddingTB);
	//						$('.calendar_event .scrollable_field').scrollTop(jqEl.height('scrollHeight'))
						}, 100);
					}
				}
			;
	
			jqEl.on('keydown', function(oEvent, oData) {
				fResize();
			});
			jqEl.on('paste', function(oEvent, oData) {
				fResize();
			});
	//		jqEl.on('input', function(oEvent, oData) {
	//			fResize();
	//		});
	//		ko.bindingHandlers.event.init(oElement, function () {
	//			return {
	//				'keydown': function (oData, oEvent) {
	//					fResize();
	//					return true;
	//				}
	//			};
	//		}, fAllBindingsAccessor, oViewModel);
	
			if (oAutosizeTrigger)
			{
				oAutosizeTrigger.subscribe(function (arg) {
					fResize(arg);
				}, this);
			}
	
			fResize();
		}
	};
	
	ko.bindingHandlers.customBind = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel, bindingContext) {
	
			var
				jqEl = $(oElement),
				oOptions = fValueAccessor(),
				oKeydown = oOptions.onKeydown ? oOptions.onKeydown : null,
				oKeyup = oOptions.onKeyup ? oOptions.onKeyup : null,
				oPaste = oOptions.onPaste ? oOptions.onPaste : null,
				oInput = oOptions.onInput ? oOptions.onInput : null,
				oValueObserver = oOptions.valueObserver ? oOptions.valueObserver : null
			;
	
			ko.bindingHandlers.event.init(oElement, function () {
				return {
					'keydown': function (oData, oEvent) {
						if(oKeydown)
						{
							oKeydown.call(this, oElement, oEvent, oValueObserver);
						}
						return true;
					},
					'keyup': function (oData, oEvent) {
						if(oKeyup)
						{
							oKeyup.call(this, oElement, oEvent, oValueObserver);
						}
						return true;
					},
					'paste': function (oData, oEvent) {
						if(oPaste)
						{
							oPaste.call(this, oElement, oEvent, oValueObserver);
						}
						return true;
					},
					'input': function (oData, oEvent) {
						if(oInput)
						{
							oInput.call(this, oElement, oEvent, oValueObserver);
						}
						return true;
					}
				};
			}, fAllBindingsAccessor, oViewModel);
		}
	};
	
	ko.bindingHandlers.fade = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel, bindingContext) {
	
			var jqEl = $(oElement),
				jqElFaded = $('<span class="faded"></span>'),
				oOptions = fValueAccessor(),
				oColor = oOptions.color ? oOptions.color : null
			;
			
			jqEl.parent().addClass('fade');
			jqEl.after(jqElFaded);
	
			updateColor(oColor());
	
			oColor.subscribe(function (sColor) {
				updateColor(sColor);
			}, this);
	
			function updateColor(sColor)
			{
				var
					oHex2Rgb = hex2Rgb(sColor),
					sRGBColor = "rgba("+oHex2Rgb.r+","+oHex2Rgb.g+","+oHex2Rgb.b
				;
	
				colorIt(sColor, sRGBColor);
			}
	
			function hex2Rgb(sHex) {
				// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
				var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
				sHex = sHex.replace(shorthandRegex, function(m, r, g, b) {
					return r + r + g + g + b + b;
				});
	
				var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(sHex);
				return result ? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16)
				} : null;
			}
	
			function colorIt (hex, rgb)
			{
				if(Utils.isRTL)
				{
					jqElFaded
						.css("filter", "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + hex + "', endColorstr='" + hex + "',GradientType=1 )")
						.css("background-image", "-webkit-gradient(linear, left top, right top, color-stop(0%," + rgb + ",1)" + "), color-stop(100%," + rgb + ",0)" + "))")
						.css("background-image", "-moz-linear-gradient(left, " + rgb + ",1)" + "0%, " + rgb + ",0)" + "100%)")
						.css("background-image", "-webkit-linear-gradient(left, " + rgb + "1)" + "0%," + rgb + ",0)" + "100%)")
						.css("background-image", "-o-linear-gradient(left, " + rgb + ",1)" + "0%," + rgb + ",0)" + "100%)")
						.css("background-image", "-ms-linear-gradient(left, " + rgb + ",1)" + "0%," + rgb + ",0)" + "100%)")
						.css("background-image", "linear-gradient(left, " + rgb + ",1)" + "0%," + rgb + ",0)" + "100%)");
				}
				else
				{
					jqElFaded
						.css("filter", "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + hex + "', endColorstr='" + hex + "',GradientType=1 )")
						.css("background-image", "-webkit-gradient(linear, left top, right top, color-stop(0%," + rgb + ",0)" + "), color-stop(100%," + rgb + ",1)" + "))")
						.css("background-image", "-moz-linear-gradient(left, " + rgb + ",0)" + "0%, " + rgb + ",1)" + "100%)")
						.css("background-image", "-webkit-linear-gradient(left, " + rgb + ",0)" + "0%," + rgb + ",1)" + "100%)")
						.css("background-image", "-o-linear-gradient(left, " + rgb + ",0)" + "0%," + rgb + ",1)" + "100%)")
						.css("background-image", "-ms-linear-gradient(left, " + rgb + ",0)" + "0%," + rgb + ",1)" + "100%)")
						.css("background-image", "linear-gradient(left, " + rgb + ",0)" + "0%," + rgb + ",1)" + "100%)");
				}
			}
		}
	};
	
	ko.bindingHandlers.highlighter = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel, bindingContext) {
	
			var
				jqEl = $(oElement),
				oOptions = fValueAccessor(),
				oValueObserver = oOptions.valueObserver ? oOptions.valueObserver : null,
				oHighlighterValueObserver = oOptions.highlighterValueObserver ? oOptions.highlighterValueObserver : null,
				oHighlightTrigger = oOptions.highlightTrigger ? oOptions.highlightTrigger : null,
				aWords = ['from:', 'to:', 'subject:', 'text:'],
				rPattern = getRegExp(),
				iPrevKeyCode = -1,
				qqq = 0
			;
	
			oHighlightTrigger.notifySubscribers();
	
			oHighlightTrigger.subscribe(function () {
				setTimeout(function () {
					highlight(false);
				}, 0);
			}, this);
	
			oHighlighterValueObserver.subscribe(function () {
				jqEl.text(oValueObserver());
			}, this);
	
	
	//		// http://jsfiddle.net/tG9Qa/
	//		jqEl.on('input', function(oEvent) {
	//			return filter_newlines(jqEl);
	//		});
	//		function filter_newlines(div) {
	//			var node, prev, _i, _len, _ref, _results;
	//			prev = null;
	//			_ref = div.contents();
	//			_results = [];
	//			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	//				node = _ref[_i];
	//				if (node.nodeType === 3) {
	//					node.nodeValue = node.nodeValue.replace('\n', '');
	//					if (prev) {
	//						node.nodeValue = prev.nodeValue + node.nodeValue;
	//						$(prev).remove();
	//					}
	//					_results.push(prev = node);
	//				} else if (node.tagName.toLowerCase() === 'br') {
	//					_results.push($(node).remove());
	//				} else {
	//					$(node).css('display', 'inline');
	//					filter_newlines($(node));
	//					_results.push(prev = null);
	//				}
	//			}
	//			return _results;
	//		}
	
			ko.bindingHandlers.event.init(oElement, function () {
				return {
					'keydown': function (oData, oEvent) {
	//					if (oEvent.keyCode === Enums.Key.Enter)
	//					{
	//						oEvent.preventDefault();
	//
	//					}
	//					return true;
						return oEvent.keyCode !== Enums.Key.Enter;
					},
					'keyup': function (oData, oEvent) {
						var
							aMoveKeys = [Enums.Key.Left, Enums.Key.Right, Enums.Key.Home, Enums.Key.End],
							bMoveKeys = -1 !== Utils.inArray(oEvent.keyCode, aMoveKeys)
						;
	
						if (!(
								oEvent.keyCode === Enums.Key.Enter ||
								oEvent.keyCode === Enums.Key.Ctrl ||
								((oEvent.ctrlKey || iPrevKeyCode === Enums.Key.Ctrl) && oEvent.keyCode === Enums.Key.a) ||
								oEvent.keyCode === Enums.Key.Shift ||
								((oEvent.shiftKey || iPrevKeyCode === Enums.Key.Shift) && bMoveKeys)
							))
						{
							oValueObserver(jqEl.text());
							highlight(false);
						}
						iPrevKeyCode = oEvent.keyCode;
						return true;
					},
					'paste': function (oData, oEvent) {
						setTimeout(function () {
							oValueObserver(oEvent.target.innerText);
							highlight(false);
						}, 0);
						return true;
					}
				};
			}, fAllBindingsAccessor, oViewModel);
	
			function highlight(bNotRestoreSel) {
				var
					iCaretPos = 0,
					sContent = jqEl.text(),
					aContent = sContent.split(rPattern),
					aDividedContent = [],
					sReplaceWith = '<span class="search_highlight"' + '>$&</span>'
				;
	
				//sContent = sContent.replace(/\u00a0/g, " ");
				//sContent = sContent.replace(/\s/g, "\u00a0");
	
				$.each(aContent, function (i, sEl) {
					if (_.any(aWords, function (oAnyEl) {return oAnyEl === sEl;}))
					{
						$.each(sEl, function (i, sElem) {
							aDividedContent.push($(sElem.replace(/(.)/, sReplaceWith)));
						});
					}
					else
					{
						$.each(sEl, function(i, sElem) {
							aDividedContent.push(document.createTextNode(sElem));
						});
					}
				});
	
				if (bNotRestoreSel)
				{
					jqEl.empty().append(aDividedContent);
				}
				else
				{
					iCaretPos = getCaretOffset();
					jqEl.empty().append(aDividedContent);
					setCursor(iCaretPos);
				}
			}
	
			function getRegExp()
			{
				var sPatt = '';
	
				$.each(aWords, function(i, oEl)
				{
					sPatt = (!i) ? (sPatt + '\\b' + oEl) : (sPatt + '|\\b' + oEl);
				});
	
				return new RegExp('(' + sPatt + ')', 'g');
			}
	
			function getCaretOffset()
			{
				var caretOffset = 0,
					range,
					preCaretRange,
					textRange,
					preCaretTextRange
				;
	
				if (typeof window.getSelection !== "undefined")
				{
					range = window.getSelection().getRangeAt(0);
					preCaretRange = range.cloneRange();
					preCaretRange.selectNodeContents(oElement);
					preCaretRange.setEnd(range.endContainer, range.endOffset);
					caretOffset = preCaretRange.toString().length;
				}
				else if (typeof document.selection !== "undefined" && document.selection.type !== "Control")
				{
					textRange = document.selection.createRange();
					preCaretTextRange = document.body.createTextRange();
					preCaretTextRange.moveToElementText(oElement);
					preCaretTextRange.setEndPoint("EndToEnd", textRange);
					caretOffset = preCaretTextRange.text.length;
				}
				qqq = caretOffset;
				return caretOffset;
			}
	
			function setCursor(iCaretPos)
			{
				var range,
					selection,
					textRange
				;
	
				if (!oElement)
				{
					return false;
				}
				else if(document.createRange)
				{
					range = document.createRange();
					range.selectNodeContents(oElement);
					range.setStart(oElement, iCaretPos);
					range.setEnd(oElement, iCaretPos);
					selection = window.getSelection();
					selection.removeAllRanges();
					selection.addRange(range);
				}
				else if(oElement.createTextRange)
				{
					textRange = oElement.createTextRange();
					textRange.collapse(true);
					textRange.moveEnd(iCaretPos);
					textRange.moveStart(iCaretPos);
					textRange.select();
					return true;
				}
				else if(oElement.setSelectionRange)
				{
					oElement.setSelectionRange(iCaretPos, iCaretPos);
					return true;
				}
	
				return false;
			}
	
	
	
	
	//		function setCursorPosition (iStartOffset)
	//		{
	//			if (document.createRange && window.getSelection)
	//			{
	//				var
	//					oRange = document.createRange(),
	//					oSel = window.getSelection()
	//					;
	//
	//				oSel.removeAllRanges();
	//				oRange.setStart(oElement, iStartOffset);
	//				oRange.setEnd(oElement, iStartOffset);
	//				oRange.collapse(true);
	//				oSel.addRange(oRange);
	//			}
	//		}
	//		function getSelectionRanges ()
	//		{
	//			var
	//				aRanges = []
	//				;
	//
	//
	//			if (window.getSelection)
	//			{
	//				var
	//					oSel = window.getSelection(),
	//					oRange = null,
	//					iIndex = 0,
	//					iLen = oSel.rangeCount
	//					;
	//
	//				for (; iIndex < iLen; ++iIndex)
	//				{
	//					oRange = oSel.getRangeAt(iIndex);
	//					aRanges.push(oRange);
	//				}
	//			}
	//
	//			return aRanges;
	//		}
	//		function setSelectionRanges (aRanges)
	//		{
	//			var
	//				oSel = null,
	//				iIndex = 0,
	//				iLen = 0,
	//				sRangeText = ''
	//				;
	//
	//			if (window.getSelection && $.isArray(aRanges))
	//			{
	//				oSel = window.getSelection();
	//				iLen = aRanges.length;
	//
	//				oSel.removeAllRanges();
	//
	//				for (; iIndex < iLen; ++iIndex)
	//				{
	//					sRangeText += aRanges[iIndex];
	//					oSel.addRange(aRanges[iIndex]);
	//				}
	//			}
	//
	//			return sRangeText;
	//		}
		}
	};
	
	/*ko.bindingHandlers.buttonText = {
		'init': function (oElement, fValueAccessor, fAllBindingsAccessor, oViewModel, bindingContext) {
	
			var
				jqEl = $(oElement),
				oOptions = fAllBindingsAccessor().buttonText,
				oValueObserver = oOptions.valueObserver ? oOptions.valueObserver : null,
				oTextTrigger = oOptions.textTrigger ? oOptions.textTrigger : null,
				sAction = oOptions.action ? oOptions.action : null,
				aText = []
			;
	
			switch (sAction)
			{
				case 'save':
					aText = ['Save', 'Saving...'];
					break;
				case 'send':
					aText = ['Send', 'Sending...'];
					break;
			}
	
			jqEl.text(aText[0]);
	
			oTextTrigger.subscribe(function(bState)
			{
				if(bState)
				{
					sAction ? jqEl.text(aText[1]) : jqEl.addClass('');
				}
				else
				{
					sAction ? jqEl.text(aText[0]) : jqEl.addClass('');
				}
			}, this);
		}
	};*/
	
	
	
	/**
	 * @constructor
	 */
	function CRouting()
	{
		var $win = $(window);
		this.resizeAll = _.debounce(function () {
			$win.resize();
		}, 100);
	
		this.defaultScreen = Enums.Screens.Mailbox;
		this.currentScreen = Enums.Screens.Mailbox;
		this.lastMailboxRouting = '';
	
		this.currentHash = '';
		this.previousHash = '';
	}
	
	/**
	 * Initializes object.
	 * 
	 * @param {string} sDefaultScreen
	 */
	CRouting.prototype.init = function (sDefaultScreen)
	{
		this.defaultScreen = sDefaultScreen;
		hasher.initialized.removeAll();
		hasher.changed.removeAll();
		hasher.initialized.add(this.parseRouting, this);
		hasher.changed.add(this.parseRouting, this);
		hasher.init();
		hasher.initialized.removeAll();
	};
	
	/**
	 * Finalizes the object and puts an empty hash.
	 */
	CRouting.prototype.finalize = function ()
	{
		hasher.dispose();
		this.setHashFromString('');
	};
	
	/**
	 * Sets a new hash.
	 * 
	 * @param {string} sNewHash
	 * 
	 * @return {boolean}
	 */
	CRouting.prototype.setHashFromString = function (sNewHash)
	{
		var bSame = (location.hash === sNewHash);
		
		if (!bSame)
		{
			location.hash = sNewHash;
		}
		
		return bSame;
	};
	
	/**
	 * Sets a new hash.
	 * 
	 * @param {string} sNewHash
	 */
	CRouting.prototype.replaceHashFromString = function (sNewHash)
	{
		if (location.hash !== sNewHash)
		{
			location.replace(sNewHash);
		}
	};
	
	/**
	 * Sets a new hash made ​​up of an array.
	 * 
	 * @param {Array} aRoutingParts
	 * 
	 * @return boolean
	 */
	CRouting.prototype.setHash = function (aRoutingParts)
	{
		return this.setHashFromString(this.buildHashFromArray(aRoutingParts));
	};
	
	/**
	 * @param {Array} aRoutingParts
	 */
	CRouting.prototype.replaceHash = function (aRoutingParts)
	{
		this.replaceHashFromString(this.buildHashFromArray(aRoutingParts));
	};
	
	CRouting.prototype.setLastMailboxHash = function ()
	{
		this.setHashFromString(this.lastMailboxRouting);
	};
	
	CRouting.prototype.setPreviousHash = function ()
	{
		location.hash = this.previousHash;
	};
	
	/**
	 * Makes a hash of a string array.
	 *
	 * @param {(string|Array)} aRoutingParts
	 * 
	 * @return {string}
	 */
	CRouting.prototype.buildHashFromArray = function (aRoutingParts)
	{
		var
			iIndex = 0,
			iLen = 0,
			sHash = ''
		;
	
		if (_.isArray(aRoutingParts))
		{
			for (iLen = aRoutingParts.length; iIndex < iLen; iIndex++)
			{
				aRoutingParts[iIndex] = encodeURIComponent(aRoutingParts[iIndex]);
			}
		}
		else
		{
			aRoutingParts = [encodeURIComponent(aRoutingParts.toString())];
		}
		
		sHash = aRoutingParts.join('/');
		
		if (sHash !== '')
		{
			sHash = '#' + sHash;
		}
	
		return sHash;
	};
	
	/**
	 * Returns the value of the hash string of location.href.
	 * location.hash returns the decoded string and location.href - not, so it uses location.href.
	 * 
	 * @return {string}
	 */
	CRouting.prototype.getHashFromHref = function ()
	{
		var
			iPos = location.href.indexOf('#'),
			sHash = ''
		;
	
		if (iPos !== -1)
		{
			sHash = location.href.substr(iPos + 1);
		}
	
		return sHash;
	};
	
	CRouting.prototype.isSingleMode = function ()
	{
		var
			sHash = this.getHashFromHref(),
			aHash = sHash.split('/'),
			sScreen = decodeURIComponent(aHash.shift()) || Enums.Screens.Mailbox,
			bSingleMode = (sScreen === Enums.Screens.SingleMessageView || sScreen === Enums.Screens.SingleCompose || 
				sScreen === Enums.Screens.SingleHelpdesk)
		;
		
		this.currentScreen = sScreen;
		
		return bSingleMode;
	};
	
	/**
	 * @param {Array} aRoutingParts
	 * @param {Array} aAddParams
	 */
	CRouting.prototype.goDirectly = function (aRoutingParts, aAddParams)
	{
		hasher.stop();
		this.setHash(aRoutingParts);
		this.parseRouting(aAddParams);
		hasher.init();
	};
	
	/**
	 * Parses the hash string and opens the corresponding routing screen.
	 * 
	 * @param {Array} aAddParams
	 */
	CRouting.prototype.parseRouting = function (aAddParams)
	{
		var
			sHash = this.getHashFromHref(),
			aHash = sHash.split('/'),
			sScreen = decodeURIComponent(aHash.shift()) || this.defaultScreen,
			bScreenInEnum = _.find(Enums.Screens, function (sScreenInEnum) {
				return sScreenInEnum === sScreen;
			}, this),
			iIndex = 0,
			iLen = aHash.length
		;
	
		if (sScreen === Enums.Screens.Mailbox)
		{
			this.lastMailboxRouting = sHash;
		}
		this.previousHash = this.currentHash;
		this.currentHash = sHash;
		
		for (; iIndex < iLen; iIndex++)
		{
			aHash[iIndex] = decodeURIComponent(aHash[iIndex]);
		}
		
		if ($.isArray(aAddParams))
		{
			aHash = _.union(aHash, aAddParams);
		}
		
		this.currentScreen = sScreen;
		
		switch (sScreen)
		{
			case Enums.Screens.SingleMessageView:
			case Enums.Screens.SingleCompose:
			case Enums.Screens.SingleHelpdesk:
				AppData.SingleMode = true;
				App.Screens.showCurrentScreen(sScreen, aHash);
				break;
			default:
				if (!bScreenInEnum)
				{
					sScreen = this.defaultScreen;
				}
				AppData.SingleMode = false;
				App.Screens.showNormalScreen(Enums.Screens.Header);
				App.Screens.showCurrentScreen(sScreen, aHash);
				break;
			case Enums.Screens.Mailbox:
				AppData.SingleMode = false;
				App.Screens.showNormalScreen(Enums.Screens.Header);
				if (AppData.User.Layout === Enums.MailboxLayout.Side)
				{
					App.Screens.showCurrentScreen(Enums.Screens.Mailbox, aHash);
				}
				else
				{
					App.Screens.showCurrentScreen(Enums.Screens.BottomMailbox, aHash);
				}
				break;
		}
	
		this.resizeAll();
	};
	
	
	/**
	 * @constructor
	 */
	function CLinkBuilder()
	{
	}
	
	/**
	 * @param {string=} sFolder = 'INBOX'
	 * @param {number=} iPage = 1
	 * @param {string=} sUid = ''
	 * @param {string=} sSearch = ''
	 * @param {string=} sFilters = ''
	 * @return {Array}
	 */
	CLinkBuilder.prototype.mailbox = function (sFolder, iPage, sUid, sSearch, sFilters)
	{
		var	aResult = [Enums.Screens.Mailbox];
		
		iPage = Utils.isNormal(iPage) ? Utils.pInt(iPage) : 1;
		sUid = Utils.isNormal(sUid) ? Utils.pString(sUid) : '';
		sSearch = Utils.isNormal(sSearch) ? Utils.pString(sSearch) : '';
		sFilters = Utils.isNormal(sFilters) ? Utils.pString(sFilters) : '';
	
		if (sFolder && '' !== sFolder)
		{
			if (sFilters && '' !== sFilters)
			{
				aResult.push('filter:' + sFilters);
			}
			else
			{
				aResult.push(sFolder);
			}
		}
		
		if (1 < iPage)
		{
			aResult.push('p' + iPage);
		}
	
		if (sUid && '' !== sUid)
		{
			aResult.push('msg' + sUid);
		}
	
		if (sSearch && '' !== sSearch)
		{
			aResult.push(sSearch);
		}
		
		return aResult;
	};
	
	/**
	 * @return {Array}
	 */
	CLinkBuilder.prototype.inbox = function ()
	{
		return this.mailbox();
	};
	
	/**
	 * @param {Array} aParams
	 * 
	 * @return {Object}
	 */
	CLinkBuilder.prototype.parseMailbox = function (aParams)
	{
		var
			sFolder = 'INBOX',
			iPage = 1,
			sUid = '',
			sSearch = '',
			sFilters = '',
			sTemp = ''
		;
		
		if (aParams.length > 0)
		{
			if (Utils.isNormal(aParams[0]))
			{
				sFolder = Utils.pString(aParams[0]);
				if (sFolder === 'filter:' + Enums.FolderFilter.Flagged)
				{
					sFolder = 'INBOX';
					sFilters = Enums.FolderFilter.Flagged;
				}
			}
	
			if (aParams[1])
			{
				sTemp = Utils.pString(aParams[1]);
				if (this.isPageParam(sTemp))
				{
					iPage = Utils.pInt(sTemp.substr(1));
					if (iPage <= 0)
					{
						iPage = 1;
					}
				}
				else if (this.isMsgParam(sTemp))
				{
					sUid = sTemp.substr(3);
				}
				else
				{
					sSearch = sTemp;
				}
			}
	
			if ('' === sSearch)
			{
				if (aParams[2])
				{
					sTemp = Utils.pString(aParams[2]);
					if (this.isMsgParam(sTemp))
					{
						sUid = sTemp.substr(3);
					}
					else
					{
						sSearch = sTemp;
					}
				}
	
				if (aParams[3])
				{
					sSearch = Utils.pString(aParams[3]);
				}
			}
		}
		
		return {
			'Folder': sFolder,
			'Page': iPage,
			'Uid': sUid,
			'Search': sSearch,
			'Filters': sFilters
		};
	};
	
	/**
	 * @param {string} sTemp
	 * 
	 * @return {boolean}
	 */
	CLinkBuilder.prototype.isPageParam = function (sTemp)
	{
		return ('p' === sTemp.substr(0, 1) && (/^[1-9][\d]*$/).test(sTemp.substr(1)));
	};
	
	/**
	 * @param {string} sTemp
	 * 
	 * @return {boolean}
	 */
	CLinkBuilder.prototype.isMsgParam = function (sTemp)
	{
		return ('msg' === sTemp.substr(0, 3) && (/^[1-9][\d]*$/).test(sTemp.substr(3)));
	};
	
	/**
	 * @return {Array}
	 */
	CLinkBuilder.prototype.compose = function ()
	{
		var sScreen = (AppData.SingleMode) ? Enums.Screens.SingleCompose : Enums.Screens.Compose;
		
		return [sScreen];
	};
	
	/**
	 * @param {string} sType
	 * @param {string} sFolder
	 * @param {string} sUid
	 * 
	 * @return {Array}
	 */
	CLinkBuilder.prototype.composeFromMessage = function (sType, sFolder, sUid)
	{
		var sScreen = (AppData.SingleMode) ? Enums.Screens.SingleCompose : Enums.Screens.Compose;
		
		return [sScreen, sType, sFolder, sUid];
	};
	
	/**
	 * @param {string} sTo
	 * 
	 * @return {Array}
	 */
	CLinkBuilder.prototype.composeWithToField = function (sTo)
	{
		var sScreen = (AppData.SingleMode) ? Enums.Screens.SingleCompose : Enums.Screens.Compose;
		
		return [sScreen, 'to', sTo];
	};
	
	
	
	/**
	 * @constructor
	 */
	function CMessageSender()
	{
		this.replyText = ko.observable('');
		this.replyDraftUid = ko.observable('');
		
		this.postponedMailData = null;
	}
	
	
	/**
	 * @param {string} sReplyText
	 * @param {string} sDraftUid
	 */
	CMessageSender.prototype.setReplyData = function (sReplyText, sDraftUid)
	{
		this.replyText(sReplyText);
		this.replyDraftUid(sDraftUid);
	};
	
	/**
	 * @param {string} sAction
	 * @param {Object} oParameters
	 * @param {boolean} bSaveMailInSentItems
	 * @param {boolean} bShowLoading
	 * @param {Function} fMessageSendResponseHandler
	 * @param {Object} oMessageSendResponseContext
	 * @param {boolean=} bPostponedSending = false
	 */
	CMessageSender.prototype.send = function (sAction, oParameters, bSaveMailInSentItems, bShowLoading,
							fMessageSendResponseHandler, oMessageSendResponseContext, bPostponedSending)
	{
		var
			sLoadingMessage = '',
			sSentFolder = App.MailCache.folderList().sentFolderFullName(),
			sDraftFolder = App.MailCache.folderList().draftsFolderFullName()
		;
		
		oParameters.Action = sAction;
		oParameters.IsHtml = '1';
		oParameters.ShowReport = bShowLoading;
		
		switch (sAction)
		{
			case 'MessageSend':
				sLoadingMessage = Utils.i18n('COMPOSE/INFO_SENDING');
				if (bSaveMailInSentItems)
				{
					oParameters.SentFolder = sSentFolder;
				}
				if (oParameters.DraftUid !== '')
				{
					oParameters.DraftFolder = sDraftFolder;
				}
				break;
			case 'MessageSave':
				sLoadingMessage = Utils.i18n('COMPOSE/INFO_SAVING');
				oParameters.DraftFolder = sDraftFolder;
				break;
		}
		
		if (bShowLoading)
		{
			App.Api.showLoading(sLoadingMessage);
		}
		
		if (bPostponedSending)
		{
			this.postponedMailData = {
				'Parameters': oParameters,
				'MessageSendResponseHandler': fMessageSendResponseHandler,
				'MessageSendResponseContext': oMessageSendResponseContext
			};
		}
		else
		{
			App.Ajax.send(oParameters, fMessageSendResponseHandler, oMessageSendResponseContext);
		}
	};
	
	/**
	 * @param {string} sDraftUid
	 */
	CMessageSender.prototype.sendPostponedMail = function (sDraftUid)
	{
		var
			oData = this.postponedMailData,
			sDraftFolder = App.MailCache.folderList().draftsFolderFullName()
		;
		
		if (sDraftUid !== '')
		{
			oData.Parameters.DraftUid = sDraftUid;
			oData.Parameters.DraftFolder = sDraftFolder;
		}
		
		if (this.postponedMailData)
		{
			App.Ajax.send(oData.Parameters, oData.MessageSendResponseHandler, oData.MessageSendResponseContext);
			this.postponedMailData = null;
		}
	};
	
	/**
	 * @param {string} sAction
	 * @param {string} sText
	 * @param {string} sDraftUid
	 * @param {Function} fMessageSendResponseHandler
	 * @param {Object} oMessageSendResponseContext
	 */
	CMessageSender.prototype.sendReplyMessage = function (sAction, sText, sDraftUid, fMessageSendResponseHandler, 
															oMessageSendResponseContext)
	{
		var oParameters = null;
		
		if (App.MailCache.currentMessage())
		{
			oParameters = this.getReplyDataFromMessage(App.MailCache.currentMessage(), 
				Enums.ReplyType.ReplyAll, AppData.Accounts.currentId(), null, sText, sDraftUid);
	
			oParameters.Bcc = '';
			oParameters.Importance = Enums.Importance.Normal;
			oParameters.Sensivity = Enums.Sensivity.Nothing;
			oParameters.ReadingConfirmation = '0';
			oParameters.IsQuickReply = true;
	
			oParameters.Attachments = this.convertAttachmentsForSending(oParameters.Attachments);
	
			this.send(sAction, oParameters, AppData.User.getSaveMailInSentItems(), false,
				fMessageSendResponseHandler, oMessageSendResponseContext);
		}
	};
	
	/**
	 * @param {Array} aAttachments
	 * 
	 * @return {Object}
	 */
	CMessageSender.prototype.convertAttachmentsForSending = function (aAttachments)
	{
		var oAttachments = {};
		
		_.each(aAttachments, function (oAttach) {
			oAttachments[oAttach.tempName()] = [
				oAttach.fileName(),
				oAttach.cid(),
				oAttach.inline() ? '1' : '0',
				oAttach.linked() ? '1' : '0'
			];
		});
		
		return oAttachments;
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 * 
	 * @return {Object}
	 */
	CMessageSender.prototype.onMessageSendResponse = function (oResponse, oRequest)
	{
		var
			oParentApp = (AppData.SingleMode) ? window.opener.App : App,
			bResult = !!oResponse.Result,
			sFullName, sUid, sReplyType
		;
	
		App.Api.hideLoading();
		switch (oRequest.Action)
		{
			case 'MessageSave':
				if (!bResult)
				{
					if (oRequest.ShowReport)
					{
						App.Api.showErrorByCode(oResponse.ErrorCode, Utils.i18n('COMPOSE/ERROR_MESSAGE_SAVING'));
					}
				}
				else
				{
					if (oRequest.ShowReport)
					{
						App.Api.showReport(Utils.i18n('COMPOSE/REPORT_MESSAGE_SAVED'));
					}
	
					if (!oResponse.Result.NewUid)
					{
						AppData.App.AutoSave = false;
					}
				}
				break;
			case 'MessageSend':
				if (!bResult && oResponse.ErrorCode !== Enums.Errors.NotSavedInSentItems)
				{
					App.Api.showErrorByCode(oResponse.ErrorCode, Utils.i18n('COMPOSE/ERROR_MESSAGE_SENDING'));
				}
				else
				{
					if (!bResult && oResponse.ErrorCode === Enums.Errors.NotSavedInSentItems)
					{
						App.Api.showError(Utils.i18n('WARNING/SENT_EMAIL_NOT_SAVED'));
					}
					else if (oRequest.IsQuickReply)
					{
						App.Api.showReport(Utils.i18n('COMPOSE/REPORT_MESSAGE_SENT'));
					}
					else
					{
						oParentApp.Api.showReport(Utils.i18n('COMPOSE/REPORT_MESSAGE_SENT'));
					}
	
					if (_.isArray(oRequest.DraftInfo) && oRequest.DraftInfo.length === 3)
					{
						sReplyType = oRequest.DraftInfo[0];
						sUid = oRequest.DraftInfo[1];
						sFullName = oRequest.DraftInfo[2];
						App.MailCache.markMessageReplied(oRequest.AccountID, sFullName, sUid, sReplyType);
					}
				}
				
				if (oRequest.SentFolder)
				{
					oParentApp.MailCache.removeMessagesFromCacheForFolder(oRequest.SentFolder);
				}
				
				break;
		}
	
		if (oRequest.DraftFolder)
		{
			oParentApp.MailCache.removeMessagesFromCacheForFolder(oRequest.DraftFolder);
		}
		
		return {Action: oRequest.Action, Result: bResult, NewUid: oResponse.Result ? oResponse.Result.NewUid : ''};
	};
	
	/**
	 * @param {Object} oMessage
	 * @param {string} sReplyType
	 * @param {number} iAccountId
	 * @param {Object} oFetcher
	 * @param {string} sText
	 * @param {string} sDraftUid
	 * 
	 * @return {Object}
	 */
	CMessageSender.prototype.getReplyDataFromMessage = function (oMessage, sReplyType, iAccountId, 
														oFetcher, sText, sDraftUid)
	{
		var
			oReplyData = {
				DraftInfo: [],
				DraftUid: '',
				To: '',
				Cc: '',
				Subject: '',
				Attachments: [],
				InReplyTo: oMessage.messageId(),
				References: this.getReplyReferences(oMessage)
			},
			sToAddr = oMessage.oReplyTo.getFull()
		;
		
		if (sToAddr === '')
		{
			sToAddr = oMessage.oFrom.getFull();
		}
		
		if (!sText || sText === '')
		{
			sText = this.replyText();
			this.replyText('');
		}
		
		if (sReplyType === 'forward')
		{
			oReplyData.Text = sText + this.getForwardMessageBody(oMessage);
		}
		else
		{
			oReplyData.Text = sText + this.getReplyMessageBody(oMessage, iAccountId, oFetcher);
		}
		
		if (sDraftUid)
		{
			oReplyData.DraftUid = sDraftUid;
		}
		else
		{
			oReplyData.DraftUid = this.replyDraftUid();
			this.replyDraftUid('');
		}
		
		switch (sReplyType)
		{
			case Enums.ReplyType.Reply:
				oReplyData.DraftInfo = [Enums.ReplyType.Reply, oMessage.uid(), oMessage.folder()];
				oReplyData.To = sToAddr;
				oReplyData.Subject = this.replySubjectAdd(Utils.i18n('COMPOSE/REPLY_PREFIX'), oMessage.subject());
				oReplyData.Attachments = _.filter(oMessage.attachments(), function (oAttach) {
					return oAttach.linked();
				});
				break;
			case Enums.ReplyType.ReplyAll:
				oReplyData.DraftInfo = [Enums.ReplyType.ReplyAll, oMessage.uid(), oMessage.folder()];
				oReplyData.To = sToAddr;
				oReplyData.Cc = this.getReplyAllCcAddr(oMessage, iAccountId, oFetcher);
				oReplyData.Subject = this.replySubjectAdd(Utils.i18n('COMPOSE/REPLY_PREFIX'), oMessage.subject());
				oReplyData.Attachments = _.filter(oMessage.attachments(), function (oAttach) {
					return oAttach.linked();
				});
				break;
			case Enums.ReplyType.Forward:
				oReplyData.DraftInfo = [Enums.ReplyType.Forward, oMessage.uid(), oMessage.folder()];
				oReplyData.Subject = this.replySubjectAdd(Utils.i18n('COMPOSE/FORWARD_PREFIX'), oMessage.subject());
				oReplyData.Attachments = oMessage.attachments();
				break;
		}
		
		return oReplyData;
	};
	
	/**
	 * Prepares and returns references for reply message.
	 *
	 * @param {Object} oMessage
	 * 
	 * @return {string}
	 */
	CMessageSender.prototype.getReplyReferences = function (oMessage)
	{
		var
			sRef = oMessage.references(),
			sInR = oMessage.messageId(),
			sPos = sRef.indexOf(sInR)
		;
	
		if (sPos === -1)
		{
			sRef += ' ' + sInR;
		}
	
		return sRef;
	};
	
	/**
	 * @param {Object} oMessage
	 * @param {number} iAccountId
	 * @param {Object} oFetcher
	 * 
	 * @return {string}
	 */
	CMessageSender.prototype.getReplyMessageBody = function (oMessage, iAccountId, oFetcher)
	{
		var
			oDomText = oMessage.getDomText(),
			sText = oDomText.length > 0 ? oDomText.html() : '',
			sReplyTitle = Utils.i18n('COMPOSE/REPLY_MESSAGE_TITLE', {
				'DATE': oMessage.oDateModel.getDate(),
				'TIME': oMessage.oDateModel.getTime(),
				'SENDER': Utils.encodeHtml(oMessage.oFrom.getFull())
			}),
			sReplyBody = '<br /><br />' + this.getSignatureText(iAccountId, oFetcher) + '<br /><br />' +
				sReplyTitle + '<blockquote>' + sText + '</blockquote>'
		;
	
		return sReplyBody;
	};
	
	/**
	 * @param {number} iAccountId
	 * @param {Object} oFetcher
	 * 
	 * @return {string}
	 */
	CMessageSender.prototype.getSignatureText = function (iAccountId, oFetcher)
	{
		var
			oAccount = AppData.Accounts.getAccount(iAccountId),
			oSignature = oAccount.signature(),
			sSignature = (oSignature && oSignature.options()) ?
				'<div data-anchor="signature">' + oSignature.signature() + '</div>' : ''
		;
		
		if (oFetcher && oFetcher.idAccount() === iAccountId && oFetcher.signature() !== null)
		{
			sSignature = '<div data-anchor="signature">' + oFetcher.signature() + '</div>';
		}
		
		return sSignature;
	};
	
	/**
	 * @param {Array} aRecipients
	 * @param {number} iAccountId
	 * 
	 * @return Object
	 */
	CMessageSender.prototype.getFetcherByRecipients = function (aRecipients, iAccountId)
	{
		var
			oAccount = AppData.Accounts.getDefault(),
			oFetcher = null
		;
		
		if (oAccount && iAccountId === oAccount.id() && oAccount.fetchers())
		{
			oFetcher = _.find(oAccount.fetchers().collection(), function (oFtch) {
				var
					oAddress = _.find(aRecipients, function (oAddr) {
						return oAddr.sEmail === oFtch.email();
					}),
					bHasAddress = !!oAddress
				;
				return bHasAddress;
			});
		}
		
		return oFetcher;
	};
	
	/**
	 * @param {Object} oMessage
	 * 
	 * @return {string}
	 */
	CMessageSender.prototype.getForwardMessageBody = function (oMessage)
	{
		var
			oDomText = oMessage.getDomText(),
			sText = oDomText.length > 0 ? oDomText.html() : '',
			sCcAddr = Utils.encodeHtml(oMessage.oCc.getFull()),
			sCcPart = (sCcAddr !== '') ? Utils.i18n('COMPOSE/FORWARD_MESSAGE_BODY_CC', {'CCADDR': sCcAddr}) : '',
			sForwardTitle = Utils.i18n('COMPOSE/FORWARD_MESSAGE_TITLE', {
				'FROMADDR': Utils.encodeHtml(oMessage.oFrom.getFull()),
				'TOADDR': Utils.encodeHtml(oMessage.oTo.getFull()),
				'CCPART': sCcPart,
				'FULLDATE': oMessage.oDateModel.getFullDate(),
				'SUBJECT': oMessage.subject()
			}),
			sForwardBody = '<br /><br />' + sForwardTitle + '<br /><br />' + sText
		;
	
		return sForwardBody;
	};
	
	/**
	 * Prepares and returns cc address for reply message.
	 *
	 * @param {Object} oMessage
	 * @param {number} iAccountId
	 * @param {Object} oFetcher
	 * 
	 * @return {string}
	 */
	CMessageSender.prototype.getReplyAllCcAddr = function (oMessage, iAccountId, oFetcher)
	{
		var
			oAddressList = new CAddressListModel(),
			aAddrCollection = _.union(oMessage.oTo.aCollection, oMessage.oCc.aCollection, 
				oMessage.oBcc.aCollection),
			oCurrAccount = _.find(AppData.Accounts.collection(), function (oAccount) {
				return oAccount.id() === iAccountId;
			}, this),
			oCurrAccAddress = new CAddressModel(),
			oFetcherAddress = new CAddressModel()
		;
	
		oCurrAccAddress.sEmail = oCurrAccount.email();
		oFetcherAddress.sEmail = oFetcher ? oFetcher.email() : '';
		oAddressList.addCollection(aAddrCollection);
		oAddressList.excludeCollection(_.union(oMessage.oFrom.aCollection, [oCurrAccAddress, oFetcherAddress]));
	
		return oAddressList.getFull();
	};
	
	/**
	 * @param {string} sPrefix
	 * @param {string} sSubject
	 * 
	 * @return {string}
	 */
	CMessageSender.prototype.replySubjectAdd = function (sPrefix, sSubject)
	{
		
		var
			oMatch = null,
			sResult = Utils.trim(sSubject)
		;
	
		if (null !== (oMatch = (new window.RegExp('^' + sPrefix + '[\\s]?\\:(.*)$', 'gi')).exec(sSubject)) && !Utils.isUnd(oMatch[1]))
		{
			sResult = sPrefix + '[2]: ' + oMatch[1];
		}
		else if (null !== (oMatch = (new window.RegExp('^(' + sPrefix + '[\\s]?[\\[\\(]?)([\\d]+)([\\]\\)]?[\\s]?\\:.*)$', 'gi')).exec(sSubject)) &&
			!Utils.isUnd(oMatch[1]) && !Utils.isUnd(oMatch[2]) && !Utils.isUnd(oMatch[3]))
		{
			sResult = oMatch[1] + (Utils.pInt(oMatch[2]) + 1) + oMatch[3];
			sResult = oMatch[1] + (Utils.pInt(oMatch[2]) + 1) + oMatch[3];
		}
		else
		{
			sResult = sPrefix + ': ' + sSubject;
		}
	
		return sResult;
	};
	
	/**
	 * @return {string}
	 */
	CMessageSender.prototype.getHtmlFromText = function (sPlain)
	{
		return sPlain
			.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;')
			.replace(/\r/g, '').replace(/\n/g, '<br />')
		;
	};
	
	
	/**
	 * @constructor
	 */
	function CPrefetcher()
	{
		this.prefetchStarted = ko.observable(false);
		
		this.init();
	}
	
	CPrefetcher.prototype.init = function ()
	{
		setInterval(_.bind(function () {
			this.prefetchStarted(false);
			this.start();
		}, this), 2000);
	};
	
	CPrefetcher.prototype.start = function ()
	{
		var oFolderList = App.MailCache.folderList();
		
		if (!AppData.SingleMode && !App.Ajax.hasOpenedRequests && !this.prefetchStarted())
		{
			if (oFolderList && oFolderList.inboxFolder())
			{
				App.MailCache.requestMessageList(oFolderList.inboxFolder().fullName(), 1, '', Enums.FolderFilter.Flagged, false, false);
			}
			
			if (AppData.App.AllowPrefetch)
			{
				this.startMessagesPrefetch();
	
				this.startOtherPagesPrefetch();
	
				this.startOtherFoldersPrefetch();
			}
		}
	};
	
	CPrefetcher.prototype.startOtherPagesPrefetch = function ()
	{
		var oCurrFolder = App.MailCache.folderList().currentFolder();
		
		this.startPagePrefetch(oCurrFolder, App.MailCache.page() + 1);
		
		this.startPagePrefetch(oCurrFolder, App.MailCache.page() - 1);
	};
	
	/**
	 * @param {Object} oCurrFolder
	 * @param {number} iPage
	 */
	CPrefetcher.prototype.startPagePrefetch = function (oCurrFolder, iPage)
	{
		if (!this.prefetchStarted() && oCurrFolder)
		{
			var
				oUidList = App.MailCache.uidList(),
				iOffset = (iPage - 1) * AppData.User.MailsPerPage,
				bPageExists = iPage > 0 && iOffset < oUidList.resultCount(),
				oParams = {
					folder: oCurrFolder.fullName(),
					page: iPage,
					search: oUidList.search()
				},
				oRequestData = null
			;
			
			if (bPageExists && !oCurrFolder.hasListBeenRequested(oParams))
			{
				oRequestData = App.MailCache.requestMessageList(oParams.folder, oParams.page, oParams.search, '', false, false);
	
				if (oRequestData && oRequestData.RequestStarted)
				{
					this.prefetchStarted(true);
				}
			}
		}
	};
	
	CPrefetcher.prototype.startOtherFoldersPrefetch = function ()
	{
		if (!this.prefetchStarted())
		{
			var
				oSent = App.MailCache.folderList().sentFolder(),
				oDrafts = App.MailCache.folderList().draftsFolder(),
				oInbox = App.MailCache.folderList().inboxFolder(),
				aInboxSubFolders = oInbox ? oInbox.subfolders() : [],
				aOtherFolders = _.filter(App.MailCache.folderList().collection(), function (oFolder) {
					return !oFolder.isSystem();
				}, this),
				aFolders = _.union(aInboxSubFolders, aOtherFolders),
				o1Folder = (aFolders.length > 0) ? aFolders[0] : null,
				o2Folder = (aFolders.length > 1) ? aFolders[1] : null,
				o3Folder = (aFolders.length > 2) ? aFolders[2] : null
			;
	
			this.startFolderPrefetch(oInbox);
			this.startFolderPrefetch(oSent);
			this.startFolderPrefetch(oDrafts);
			this.startFolderPrefetch(o1Folder);
			this.startFolderPrefetch(o2Folder);
			this.startFolderPrefetch(o3Folder);
		}
	};
	
	/**
	 * @param {Object} oFolder
	 */
	CPrefetcher.prototype.startFolderPrefetch = function (oFolder)
	{
		if (!this.prefetchStarted() && oFolder)
		{
			var
				iPage = 1,
				sSearch = '',
				oParams = {
					folder: oFolder.fullName(),
					page: iPage,
					search: sSearch
				},
				oRequestData = null
			;
	
			if (!oFolder.hasListBeenRequested(oParams))
			{
				oRequestData = App.MailCache.requestMessageList(oParams.folder, oParams.page, oParams.search, '', false, false);
	
				if (oRequestData && oRequestData.RequestStarted)
				{
					this.prefetchStarted(true);
				}
			}
		}
	};
	
	CPrefetcher.prototype.startMessagesPrefetch = function ()
	{
		var
			iAccountId = App.MailCache.currentAccountId(),
			oCurrFolder = App.MailCache.getCurrentFolder(),
			iTotalSize = 0,
			iMaxSize = AppData.App.MaxPrefetchBodiesSize,
			aUids = [],
			oParameters = null,
			iJsonSizeOf1Message = 2048,
			fFillUids = function (oMsg) {
				var
					bNotFilled = (!oMsg.deleted() && !oMsg.completelyFilled()),
					bUidNotAdded = !_.find(aUids, function (sUid) {
						return sUid === oMsg.uid();
					}, this),
					bHasNotBeenRequested = !oCurrFolder.hasUidBeenRequested(oMsg.uid())
				;
				
				if ((iTotalSize + oMsg.textSize() + iJsonSizeOf1Message) < iMaxSize && bNotFilled && bUidNotAdded && bHasNotBeenRequested)
				{
					aUids.push(oMsg.uid());
					iTotalSize += oMsg.textSize() + iJsonSizeOf1Message;
				}
			}
		;
		
		if (oCurrFolder && oCurrFolder.selected() && !this.prefetchStarted())
		{
			_.each(App.MailCache.messages(), fFillUids);
			_.each(oCurrFolder.oMessages, fFillUids);
			
			if (aUids.length > 0)
			{
				oCurrFolder.addRequestedUids(aUids);
				
				oParameters = {
					'AccountID': iAccountId,
					'Action': 'Messages',
					'Folder': oCurrFolder.fullName(),
					'Uids': aUids
				};
				
				App.Ajax.send(oParameters, this.onPrefetchResponse, this);
				this.prefetchStarted(true);
			}
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CPrefetcher.prototype.onPrefetchResponse = function (oData, oParameters)
	{
		var
			oFolder = App.MailCache.getFolderByFullName(oParameters.AccountID, oParameters.Folder)
		;
		
		if (_.isArray(oData.Result))
		{
			_.each(oData.Result, function (oRawMsg) {
				var
					sUid = oRawMsg.Uid.toString(),
					oMsg = oFolder.oMessages[sUid] || new CMessageModel()
				;
				
				oMsg.parse(oRawMsg, oData.AccountID, oMsg.threadPart());
				
				oFolder.oMessages[sUid] = oMsg;
			});
		}
	};
	
	
	/**
	 * @type {Function}
	 */
	Utils.inArray = $.inArray;
	
	/**
	 * @type {Function}
	 */
	Utils.isFunc = $.isFunction;
	
	/**
	 * @type {Function}
	 */
	Utils.trim = $.trim;
	
	/**
	 * @type {Function}
	 */
	Utils.emptyFunction = function () {};
	
	/**
	 * @param {*} mValue
	 * 
	 * @return {boolean}
	 */
	Utils.isUnd = function (mValue)
	{
		return undefined === mValue;
	};
	
	/**
	 * @param {*} oValue
	 * 
	 * @return {boolean}
	 */
	Utils.isNull = function (oValue)
	{
		return null === oValue;
	};
	
	/**
	 * @param {*} oValue
	 * 
	 * @return {boolean}
	 */
	Utils.isNormal = function (oValue)
	{
		return !Utils.isUnd(oValue) && !Utils.isNull(oValue);
	};
	
	/**
	 * @param {(string|number)} mValue
	 * 
	 * @return {boolean}
	 */
	Utils.isNumeric = function (mValue)
	{
		return Utils.isNormal(mValue) ? (/^[1-9]+[0-9]*$/).test(mValue.toString()) : false;
	};
	
	/**
	 * @param {*} mValue
	 * 
	 * @return {number}
	 */
	Utils.pInt = function (mValue)
	{
		return Utils.isNormal(mValue) && '' !== mValue ? window.parseInt(mValue, 10) : 0;
	};
	
	/**
	 * @param {*} mValue
	 * 
	 * @return {string}
	 */
	Utils.pString = function (mValue)
	{
		return Utils.isNormal(mValue) ? mValue.toString() : '';
	};
	
	/**
	 * @param {*} aValue
	 * 
	 * @return {boolean}
	 */
	Utils.isNonEmptyArray = function (aValue)
	{
		return _.isArray(aValue) && 0 < aValue.length;
	};
	
	/**
	 * @param {Object} oObject
	 * @param {string} sName
	 * @param {*} mValue
	 */
	Utils.pImport = function (oObject, sName, mValue)
	{
		oObject[sName] = mValue;
	};
	
	/**
	 * @param {Object} oObject
	 * @param {string} sName
	 * @param {*} mDefault
	 * @return {*}
	 */
	Utils.pExport = function (oObject, sName, mDefault)
	{
		return Utils.isUnd(oObject[sName]) ? mDefault : oObject[sName];
	};
	
	/**
	 * @param {string} sText
	 * 
	 * @return {string}
	 */
	Utils.encodeHtml = function (sText)
	{
		return (sText) ? sText.toString()
			.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;').replace(/'/g, '&#039;') : '';
	};
	
	/**
	 * @param {string} sKey
	 * @param {?Object=} oValueList
	 * @param {?string=} sDefaulValue
	 * @param {number=} nPluralCount
	 * 
	 * @return {string}
	 */
	Utils.i18n = function (sKey, oValueList, sDefaulValue, nPluralCount) {
	
		var
			sValueName = '',
			sResult = Utils.isUnd(I18n[sKey]) ? (Utils.isNormal(sDefaulValue) ? sDefaulValue : sKey) : I18n[sKey]
		;
	
		if (!Utils.isUnd(nPluralCount))
		{
			sResult = (function (nPluralCount, sResult) {
				var
					nPlural = Utils.getPlural(AppData.User.DefaultLanguage, nPluralCount),
					aPluralParts = sResult.split('|')
				;
	
				return (aPluralParts && aPluralParts[nPlural]) ? aPluralParts[nPlural] : (
					aPluralParts && aPluralParts[0] ? aPluralParts[0] : sResult);
	
			}(nPluralCount, sResult));
		}
	
		if (Utils.isNormal(oValueList))
		{
			for (sValueName in oValueList)
			{
				if (oValueList.hasOwnProperty(sValueName))
				{
					sResult = sResult.replace('%' + sValueName + '%', oValueList[sValueName]);
				}
			}
		}
	
		return sResult;
	};
	
	/**
	 * @param {number} iNum
	 * @param {number} iDec
	 * 
	 * @return {number}
	 */
	Utils.roundNumber = function (iNum, iDec)
	{
		return Math.round(iNum * Math.pow(10, iDec)) / Math.pow(10, iDec);
	};
	
	/**
	 * @param {(number|string)} iSizeInBytes
	 * 
	 * @return {string}
	 */
	Utils.friendlySize = function (iSizeInBytes)
	{
		var
			iBytesInKb = 1024,
			iBytesInMb = iBytesInKb * iBytesInKb,
			iBytesInGb = iBytesInKb * iBytesInKb * iBytesInKb
		;
	
		iSizeInBytes = Utils.pInt(iSizeInBytes);
	
		if (iSizeInBytes >= iBytesInGb)
		{
			return Utils.roundNumber(iSizeInBytes / iBytesInGb, 1) + Utils.i18n('MAIN/GIGABYTES');
		}
		else if (iSizeInBytes >= iBytesInMb)
		{
			return Utils.roundNumber(iSizeInBytes / iBytesInMb, 1) + Utils.i18n('MAIN/MEGABYTES');
		}
		else if (iSizeInBytes >= iBytesInKb)
		{
			return Utils.roundNumber(iSizeInBytes / iBytesInKb, 0) + Utils.i18n('MAIN/KILOBYTES');
		}
	
		return iSizeInBytes + Utils.i18n('MAIN/BYTES');
	};
	
	Utils.timeOutAction = (function () {
	
		var oTimeOuts = {};
	
		return function (sAction, fFunction, iTimeOut) {
			if (Utils.isUnd(oTimeOuts[sAction]))
			{
				oTimeOuts[sAction] = 0;
			}
	
			window.clearTimeout(oTimeOuts[sAction]);
			oTimeOuts[sAction] = window.setTimeout(fFunction, iTimeOut);
		};
	}());
	
	/**
	 * @param {...*} mArgs javascript annotation for variable numbers of arguments
	 */
	Utils.log = function (mArgs)
	{
	//	if (window.console && window.console.log)
	//	{
	//		window.console.log(mArgs);
	//	}
	};
	
	/**
	 * @param {string} sFullEmail
	 * 
	 * @return {Object}
	 */
	Utils.getEmailParts = function (sFullEmail)
	{
		var
			iQuote1Pos = sFullEmail.indexOf('"'),
			iQuote2Pos = sFullEmail.indexOf('"', iQuote1Pos + 1),
			iLeftBrocketPos = sFullEmail.indexOf('<', iQuote2Pos),
			iPrevLeftBroketPos = -1,
			iRightBrocketPos = -1,
			sName = '',
			sEmail = ''
		;
	
		while (iLeftBrocketPos !== -1)
		{
			iPrevLeftBroketPos = iLeftBrocketPos;
			iLeftBrocketPos = sFullEmail.indexOf('<', iLeftBrocketPos + 1);
		}
	
		iLeftBrocketPos = iPrevLeftBroketPos;
		iRightBrocketPos = sFullEmail.indexOf('>', iLeftBrocketPos + 1);
	
		if (iLeftBrocketPos === -1)
		{
			sEmail = $.trim(sFullEmail);
		}
		else
		{
			sName = (iQuote1Pos === -1) ?
				$.trim(sFullEmail.substring(0, iLeftBrocketPos)) :
				$.trim(sFullEmail.substring(iQuote1Pos + 1, iQuote2Pos));
	
			sEmail = $.trim(sFullEmail.substring(iLeftBrocketPos + 1, iRightBrocketPos));
		}
	
		return {
			'name': sName,
			'email': sEmail,
			'FullEmail': sFullEmail
		};
	};
	
	/**
	 * @param {string} sValue
	 * 
	 * @return {boolean}
	 */
	Utils.isCorrectEmail = function (sValue)
	{
		return !!(sValue.match(/^[A-Z0-9\"!#\$%\^\{\}`~&'\+\-=_\.]+@[A-Z0-9\.\-]+$/i));
	};
	
	/**
	 * @param {string} sAddresses
	 * 
	 * @return {Array}
	 */
	Utils.getIncorrectEmailsFromAddressString = function (sAddresses)
	{
		var
			aEmails = sAddresses.replace(/"[^"]*"/g, '').replace(/;/g, ',').split(','),
			aIncorrectEmails = [],
			iIndex = 0,
			iLen = aEmails.length,
			sFullEmail = '',
			oEmailParts = null
		;
	
		for (; iIndex < iLen; iIndex++)
		{
			sFullEmail = $.trim(aEmails[iIndex]);
			if (sFullEmail.length > 0)
			{
				oEmailParts = Utils.getEmailParts($.trim(aEmails[iIndex]));
				if (!Utils.isCorrectEmail(oEmailParts.email))
				{
					aIncorrectEmails.push(oEmailParts.email);
				}
			}
		}
	
		return aIncorrectEmails;
	};
	
	/**
	 * Gets link for contacts inport.
	 *
	 * @return {string}
	 */
	Utils.getImportContactsLink = function ()
	{
		return '?/ImportContacts/';
	};
	
	/**
	 * Gets link for contacts export.
	 *
	 * @return {string}
	 */
	Utils.getExportContactsLink = function ()
	{
		return '?/Raw/Contacts/';
	};
	
	/**
	 * Gets link for calendar export by hash.
	 *
	 * @param {number} iAccountId
	 * @param {string} sHash
	 * 
	 * @return {string}
	 */
	Utils.getExportCalendarLinkByHash = function (iAccountId, sHash)
	{
		return '?/Raw/Calendar/' + iAccountId + '/' + sHash;
	};
	
	/**
	 * Gets link for download by hash.
	 *
	 * @param {number} iAccountId
	 * @param {string} sHash
	 * @param {boolean=} bIsExt = false
	 * @param {string=} sTenatHash = ''
	 * 
	 * @return {string}
	 */
	Utils.getDownloadLinkByHash = function (iAccountId, sHash, bIsExt, sTenatHash)
	{
		bIsExt = Utils.isUnd(bIsExt) ? false : !!bIsExt;
		sTenatHash = Utils.isUnd(sTenatHash) ? '' : sTenatHash;
	
		return '?/Raw/Download/' + iAccountId + '/' + sHash + '/' + (bIsExt ? '1' : '0') + ('' === sTenatHash ? '' : '/' + sTenatHash);
	};
	
	/**
	 * Gets link for view by hash.
	 *
	 * @param {number} iAccountId
	 * @param {string} sHash
	 * @param {boolean=} bIsExt = false
	 * @param {string=} sTenatHash = ''
	 * 
	 * @return {string}
	 */
	Utils.getViewLinkByHash = function (iAccountId, sHash, bIsExt, sTenatHash)
	{
		bIsExt = Utils.isUnd(bIsExt) ? false : !!bIsExt;
		sTenatHash = Utils.isUnd(sTenatHash) ? '' : sTenatHash;
		
		return '?/Raw/View/' + iAccountId + '/' + sHash + '/' + (bIsExt ? '1' : '0') + ('' === sTenatHash ? '' : '/' + sTenatHash);
	};
	
	/**
	 * Gets link for thumbnail by hash.
	 *
	 * @param {number} iAccountId
	 * @param {string} sHash
	 *
	 * @return {string}
	 */
	Utils.getViewThumbnailLinkByHash = function (iAccountId, sHash)
	{
		return '?/Raw/Thumbnail/' + iAccountId + '/' + sHash;
	};
	
	/**
	 * Gets link for download by hash.
	 *
	 * @param {number} iAccountId
	 * @param {string} sHash
	 * 
	 * @return {string}
	 */
	Utils.getFilestorageDownloadLinkByHash = function (iAccountId, sHash)
	{
		return '?/Raw/FilesDownload/' + iAccountId + '/' + sHash;
	};
	
	/**
	 * Gets link for download by hash.
	 *
	 * @param {number} iAccountId
	 * @param {string} sHash
	 * 
	 * @return {string}
	 */
	Utils.getFilestorageViewLinkByHash = function (iAccountId, sHash)
	{
		return '?/Raw/FilesView/' + iAccountId + '/' + sHash;
	};
	
	/**
	 * Gets link for public by hash.
	 *
	 * @param {string} sHash
	 * 
	 * @return {string}
	 */
	Utils.getFilestoragePublicViewLinkByHash = function (sHash)
	{
		return '?/Window/Files/0/' + sHash;
	};
	
	/**
	 * Gets link for public by hash.
	 *
	 * @param {string} sHash
	 * 
	 * @return {string}
	 */
	Utils.getFilestoragePublicDownloadLinkByHash = function (sHash)
	{
		return '?/Raw/FilesPub/0/' + sHash;
	};
	
	/**
	 * @param {number} iMonth
	 * @param {number} iYear
	 * 
	 * @return {number}
	 */
	Utils.daysInMonth = function (iMonth, iYear)
	{
		if (0 < iMonth && 13 > iMonth && 0 < iYear)
		{
			return new Date(iYear, iMonth, 0).getDate();
		}
	
		return 31;
	};
	
	/** 
	 * @return {string}
	 */
	Utils.getAppPath = function ()
	{
		return window.location.protocol + '//' + window.location.host + window.location.pathname;
	};
	
	Utils.WindowOpener = {
	
		_iDefaultRatio: 0.8,
		_aOpenedWins: [],
		
		/**
		 * @param {{folder:Function, uid:Function}} oMessage
		 * @param {boolean=} bDrafts
		 */
		openMessage: function (oMessage, bDrafts)
		{
			if (oMessage)
			{
				var
					sFolder = oMessage.folder(),
					sUid = oMessage.uid(),
					sHash = '',
					oWin = null
				;
				
				if (bDrafts)
				{
					sHash = App.Routing.buildHashFromArray([Enums.Screens.SingleCompose, 'drafts', sFolder, sUid]);
				}
				else
				{
					sHash = App.Routing.buildHashFromArray([Enums.Screens.SingleMessageView, sFolder, 'msg' + sUid]);
				}
	
				oWin = this.openTab(sHash);
			}
		},
	
		/**
		 * @param {string} sUrl
		 * 
		 * @return Object
		 */
		openTab: function (sUrl)
		{
			var oWin = null;
	
			oWin = window.open(sUrl, '_blank');
			oWin.focus();
			oWin.name = AppData.Accounts.currentId();
	
			this._aOpenedWins.push(oWin);
			
			return oWin;
		},
		
		/**
		 * @param {string} sUrl
		 * @param {string} sPopupName
		 * @param {boolean=} bMenubar = false
		 * 
		 * @return Object
		 */
		open: function (sUrl, sPopupName, bMenubar)
		{
			var
				sMenubar = (bMenubar) ? ',menubar=yes' : ',menubar=no',
				sParams = 'location=no,toolbar=no,status=no,scrollbars=yes,resizable=yes' + sMenubar,
				oWin = null
			;
	
			sPopupName = sPopupName.replace(/\W/g, ''); // forbidden characters in the name of the window for ie
			sParams += this._getSizeParameters();
	
			oWin = window.open(sUrl, sPopupName, sParams);
			oWin.focus();
			oWin.name = AppData.Accounts.currentId();
	
			this._aOpenedWins.push(oWin);
			
			return oWin;
		},
	
		closeAll: function ()
		{
			var
				iLen = this._aOpenedWins.length,
				iIndex = 0,
				oWin = null
			;
	
			for (; iIndex < iLen; iIndex++)
			{
				oWin = this._aOpenedWins[iIndex];
				if (!oWin.closed)
				{
					oWin.close();
				}
			}
	
			this._aOpenedWins = [];
		},
	
		/**
		 * @return string
		 */
		_getSizeParameters: function ()
		{
			var
				iScreenWidth = window.screen.width,
				iWidth = Math.ceil(iScreenWidth * this._iDefaultRatio),
				iLeft = Math.ceil((iScreenWidth - iWidth) / 2),
	
				iScreenHeight = window.screen.height,
				iHeight = Math.ceil(iScreenHeight * this._iDefaultRatio),
				iTop = Math.ceil((iScreenHeight - iHeight) / 2)
			;
	
			return ',width=' + iWidth + ',height=' + iHeight + ',top=' + iTop + ',left=' + iLeft;
		}
	};
	
	/**
	 * @param {Object} oInput
	 */
	Utils.moveCaretToEnd = function (oInput)
	{
		var oTextRange, iLen;
	
		if (oInput.createTextRange)
		{
			//ie6-8
			oTextRange = oInput.createTextRange();
			oTextRange.collapse(false);
			oTextRange.select();
		}
		else if (oInput.setSelectionRange)
		{
			// ff, opera, ie9
			// Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
			iLen = oInput.value.length * 2;
			oInput.setSelectionRange(iLen, iLen);
		}
	};
	
	/**
	 * @param {?} oObject
	 * @param {string} sDelegateName
	 * @param {Array=} aParameters
	 */
	Utils.delegateRun = function (oObject, sDelegateName, aParameters)
	{
		if (oObject && oObject[sDelegateName])
		{
			oObject[sDelegateName].apply(oObject, _.isArray(aParameters) ? aParameters : []);
		}
	};
	
	/**
	 * @param {string} input
	 * @param {number} multiplier
	 * @return {string}
	 */
	Utils.strRepeat = function (input, multiplier)
	{
		return (new Array(multiplier + 1)).join(input);
	};
	
	
	Utils.deferredUpdate = function (element, state, duration, callback) {
		
		if (!element.__interval && !!state)
		{
			element.__state = true;
			callback(element, true);
	
			element.__interval = window.setInterval(function () {
				if (!element.__state)
				{
					callback(element, false);
					window.clearInterval(element.__interval);
					element.__interval = null;
				}
			}, duration);
		}
		else if (!state)
		{
			element.__state = false;
		}
	};
	
	Utils.draggableMessages = function ()
	{
		return $('<div class="draggable draggableMessages"><div class="content"><span class="count-text"></span></div></div>').appendTo('#pSevenHidden');
	};
	
	Utils.draggableContacts = function ()
	{
		return $('<div class="draggable draggableContacts"><div class="content"><span class="count-text"></span></div></div>').appendTo('#pSevenHidden');
	};
	
	Utils.removeActiveFocus = function ()
	{
		if (document && document.activeElement && document.activeElement.blur)
		{
			var oA = $(document.activeElement);
			if (oA.is('input') || oA.is('textarea'))
			{
				document.activeElement.blur();
			}
		}
	};
	
	Utils.uiDropHelperAnim = function (oEvent, oUi)
	{
		var 
			helper = oUi.helper.clone().appendTo('#pSevenHidden'),
			target = $(oEvent.target).find('.animGoal'),
			position = target[0] ? target.offset() : $(oEvent.target).offset()
		;
	
		helper.animate({
			'left': position.left + 'px',
			'top': position.top + 'px',
			'font-size': '0px',
			'opacity': 0
		}, 800, 'easeOutQuint', function() {
			 $(this).remove();
		});
	};
	
	Utils.inFocus = function ()
	{
		var
			mTagName = document && document.activeElement ? document.activeElement.tagName : null,
			mContentEditable = document && document.activeElement ? document.activeElement.contentEditable : null
		;
		return 'INPUT' === mTagName || 'TEXTAREA' === mTagName || 'IFRAME' === mTagName || mContentEditable === 'true';
	};
	
	Utils.removeSelection = function ()
	{
		if (window.getSelection)
		{
			window.getSelection().removeAllRanges();
		}
		else if (document.selection)
		{
			document.selection.empty();
		}
	};
	
	Utils.getMonthNamesArray = function ()
	{
		var
			aMonthes = Utils.i18n('DATETIME/MONTH_NAMES').split(' '),
			iLen = 12,
			iIndex = aMonthes.length
		;
		
		for (; iIndex < iLen; iIndex++)
		{
			aMonthes[iIndex] = '';
		}
		
		return aMonthes;
	};
	
	/**
	 * http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html?id=l10n/pluralforms
	 * 
	 * @param {string} sLang
	 * @param {number} iNumber
	 * 
	 * @return {number}
	 */
	Utils.getPlural = function (sLang, iNumber)
	{
		var iResult = 0;
		iNumber = Utils.pInt(iNumber);
	
		switch (sLang)
		{
			case 'Arabic':
				iResult = (iNumber === 0 ? 0 : iNumber === 1 ? 1 : iNumber === 2 ? 2 : iNumber % 100 >= 3 && iNumber % 100 <= 10 ? 3 : iNumber % 100 >= 11 ? 4 : 5);
				break;
			case 'Bulgarian':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'Chinese-Simplified':
				iResult = 0;
				break;
			case 'Chinese-Traditional':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'Czech':
				iResult = (iNumber === 1) ? 0 : (iNumber >= 2 && iNumber <= 4) ? 1 : 2;
				break;
			case 'Danish':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'Dutch':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'English':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'Estonian':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'Finish':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'French':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'German':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'Greek':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'Hebrew':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'Hungarian':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'Italian':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'Japanese':
				iResult = 0;
				break;
			case 'Korean':
				iResult = 0;
				break;
			case 'Latvian':
				iResult = (iNumber % 10 === 1 && iNumber % 100 !== 11 ? 0 : iNumber !== 0 ? 1 : 2);
				break;
			case 'Lithuanian':
				iResult = (iNumber % 10 === 1 && iNumber % 100 !== 11 ? 0 : iNumber % 10 >= 2 && (iNumber % 100 < 10 || iNumber % 100 >= 20) ? 1 : 2);
				break;
			case 'Norwegian':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'Persian':
				iResult = 0;
				break;
			case 'Polish':
				iResult = (iNumber === 1 ? 0 : iNumber % 10 >= 2 && iNumber % 10 <= 4 && (iNumber % 100 < 10 || iNumber % 100 >= 20) ? 1 : 2);
				break;
			case 'Portuguese-Portuguese':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'Portuguese-Brazil':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'Romanian':
				iResult = (iNumber === 1 ? 0 : (iNumber === 0 || (iNumber % 100 > 0 && iNumber % 100 < 20)) ? 1 : 2);
				break;
			case 'Russian':
				iResult = (iNumber % 10 === 1 && iNumber % 100 !== 11 ? 0 : iNumber % 10 >= 2 && iNumber % 10 <= 4 && (iNumber % 100 < 10 || iNumber % 100 >= 20) ? 1 : 2);
				break;
			case 'Serbian':
				iResult = (iNumber % 10 === 1 && iNumber % 100 !== 11 ? 0 : iNumber % 10 >= 2 && iNumber % 10 <= 4 && (iNumber % 100 < 10 || iNumber % 100 >= 20) ? 1 : 2);
				break;
			case 'Spanish':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'Swedish':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'Thai':
				iResult = 0;
				break;
			case 'Turkish':
				iResult = (iNumber === 1 ? 0 : 1);
				break;
			case 'Ukrainian':
				iResult = (iNumber % 10 === 1 && iNumber % 100 !== 11 ? 0 : iNumber % 10 >= 2 && iNumber % 10 <= 4 && (iNumber % 100 < 10 || iNumber % 100 >= 20) ? 1 : 2);
				break;
			default:
				iResult = 0;
				break;
		}
	
		return iResult;
	};
	
	/**
	 * @param {string} sFile
	 * 
	 * @return {string}
	 */
	Utils.getFileExtension = function (sFile)
	{
		var 
			sResult = '',
			iIndex = sFile.lastIndexOf('.')
		;
		
		if (iIndex > -1)
		{
			sResult = sFile.substr(iIndex + 1);
		}
	
		return sResult;
	};
	
	/**
	 * @param {string} sFile
	 * 
	 * @return {string}
	 */
	Utils.getFileNameWithoutExtension = function (sFile)
	{
		var 
			sResult = sFile,
			iIndex = sFile.lastIndexOf('.')
		;
		if (iIndex > -1)
		{
			sResult = sFile.substr(0, iIndex);	
		}
		return sResult;
	};
	
	/**
	 * @param {Object} oElement
	 * @param {Object} oItem
	 */
	Utils.defaultOptionsAfterRender = function (oElement, oItem)
	{
		if (oItem)
		{
			if (!Utils.isUnd(oItem.disable))
			{
				ko.applyBindingsToNode(oElement, {
					'disable': oItem.disable
				}, oItem);
			}
		}
	};
	
	/**
	 * @param {string} sDateFormat
	 * 
	 * @return string
	 */
	Utils.getDateFormatForMoment = function (sDateFormat)
	{
		var sMomentDateFormat = 'MM/DD/YYYY';
		
		switch (sDateFormat)
		{
			case 'MM/DD/YYYY':
				sMomentDateFormat = 'MM/DD/YYYY';
				break;
			case 'DD/MM/YYYY':
				sMomentDateFormat = 'DD/MM/YYYY';
				break;
			case 'DD Month YYYY':
				sMomentDateFormat = 'DD MMMM YYYY';
				break;
		}
		
		return sMomentDateFormat;
	};
	
	/**
	 * @param {string} sDateFormat
	 * 
	 * @return string
	 */
	Utils.getDateFormatForDatePicker = function (sDateFormat)
	{
		var sDatePickerDateFormat = 'mm/dd/yy';
		
		switch (sDateFormat)
		{
			case 'MM/DD/YYYY':
				sDatePickerDateFormat = 'mm/dd/yy';
				break;
			case 'DD/MM/YYYY':
				sDatePickerDateFormat = 'dd/mm/yy';
				break;
			case 'DD Month YYYY':
				sDatePickerDateFormat = 'dd MM yy';
				break;
		}
		
		return sDatePickerDateFormat;
	};
	
	/**
	 * @return Array
	 */
	Utils.getDateFormatsForSelector = function ()
	{
		return _.map(AppData.App.DateFormats, function (sDateFormat) {
			switch (sDateFormat)
			{
				case 'MM/DD/YYYY':
					return {name: Utils.i18n('DATETIME/DATEFORMAT_MMDDYYYY'), value: sDateFormat};
				case 'DD/MM/YYYY':
					return {name: Utils.i18n('DATETIME/DATEFORMAT_DDMMYYYY'), value: sDateFormat};
				case 'DD Month YYYY':
					return {name: Utils.i18n('DATETIME/DATEFORMAT_DDMONTHYYYY'), value: sDateFormat};
				default:
					return {name: sDateFormat, value: sDateFormat};
			}
		});
	};
	
	/**
	 * @param {string} sSubject
	 * 
	 * @return {string}
	 */
	Utils.getTitleForEvent = function (sSubject)
	{
		var
			sTitle = Utils.trim(sSubject.replace(/[\n\r]/, ' ')),
			iFirstSpacePos = sTitle.indexOf(' ', 180)
		;
		
		if (iFirstSpacePos >= 0)
		{
			sTitle = sTitle.substring(0, iFirstSpacePos) + '...';
		}
		
		if (sTitle.length > 200)
		{
			sTitle = sTitle.substring(0, 200) + '...';
		}
		
		return sTitle;
	};
	
	/**
	 * @param {string} sPhone
	 */
	Utils.getFormattedPhone = function (sPhone)
	{
		var
			oPrefixes = {
				'+7': '8'
			},
			sCleanedPhone = (/#/g).test(sPhone) ? sPhone.split('#')[1] : sPhone.replace(/[()\s_\-]/g, ''), //sPhone.replace(/\D \+/g, "")
			sFirstTwoSymbols = (sPhone + '').slice(0,2),
			bIsInList
		;
	
		bIsInList = _.any(oPrefixes, function (val, key) {
			return key === sFirstTwoSymbols;
		}, this);
	
		return bIsInList ? sCleanedPhone.replace(sFirstTwoSymbols, oPrefixes[sFirstTwoSymbols]) : sCleanedPhone.replace(/[+]/g, '');
	};
	
	Utils.desktopNotify = (function () {
	
		var notification,
			timeoutID = 0
		;
	
		/**
		 * @param {string} sAction
		 * @param {string=} sTitle
		 * @param {string=} sBody
		 * @param {string=} sIcon
		 * @param {Function=} fnCallback
		 * @param {number=} iTimeout
		 */
		return function (sAction, sTitle, sBody, sIcon, fnCallback, iTimeout)
		{
			if (sAction === 'show')
			{
				var self = this,
					winNotification = null,
					iPermission,
					oIcon = {
						'phone': 'skins/Default/images/logo.png'
					},
					oOptions = { // https://developer.mozilla.org/en-US/docs/Web/API/Notification
						body: sBody,
						//dir: "auto",// The direction of the notification; it can be auto, ltr, or rtl
						//lang: "",// Specify the lang used within the notification. This string must be a valid BCP 47 language tag
						//tag: 'test',// An ID for a given notification that allows to retrieve, replace or remove it if necessary
						icon: oIcon[sIcon] || false
					}
				;
	
				if (window.Notification && window.Notification.permission)
				{
					winNotification = window.Notification;
	
					switch (window.Notification.permission.toLowerCase())
					{
						case 'granted':
							iPermission = Enums.DesktopNotifications.Allowed;// 0
							break;
						case 'denied':
							iPermission = Enums.DesktopNotifications.Denied;// 2
							break;
						case 'default':
							iPermission = Enums.DesktopNotifications.NotAllowed;// 1
							break;
					}
				}
				else if (window.webkitNotifications && window.webkitNotifications.checkPermission)
				{
					winNotification = window.webkitNotifications;
					iPermission = window.webkitNotifications.checkPermission();
				}
	
				//	if (winNotification && iPermission !== Enums.DesktopNotifications.Allowed) {winNotification.requestPermission()}
	
				if (winNotification && iPermission === Enums.DesktopNotifications.Allowed)
				{
					if (notification) {
						notification.close();
					}
	
					notification = new window.Notification(sTitle, oOptions);
	
					clearTimeout(timeoutID);
					if(iTimeout) {
						timeoutID = setTimeout(function() { notification.close(); }, iTimeout);
					}
	
					// events
					notification.onclick = function ()
					{
						if(fnCallback)
						{
							fnCallback();
						}
						notification.close();
					};
					/*notification.onshow = function () {};
					notification.onclose = function () {};
					notification.onerror = function () {};*/
				}
			}
			else if (sAction === 'hide' && notification)
			{
				notification.close();
			}
		};
	}());
	
	/**
	 * @return {boolean}
	 */
	Utils.isRTL = function ()
	{
		return $html.hasClass('rtl');
	};
	
	
	/**
	 * @param {Function} list (knockout)
	 * @param {Function=} fSelectCallback
	 * @param {Function=} fDeleteCallback
	 * @param {Function=} fDblClickCallback
	 * @param {Function=} fEnterCallback
	 * @param {Function=} multiplyLineFactor (knockout)
	 * @param {boolean=} bResetCheckedOnClick = false
	 * @param {boolean=} bCheckOnSelect = false
	 * @param {boolean=} bUnselectOnCtrl = false
	 * @param {boolean=} bDisableMultiplySelection = false
	 * @constructor
	 */
	function CSelector(list, fSelectCallback, fDeleteCallback, fDblClickCallback, fEnterCallback, multiplyLineFactor,
		bResetCheckedOnClick, bCheckOnSelect, bUnselectOnCtrl, bDisableMultiplySelection)
	{
		this.fBeforeSelectCallback = null;
		this.fSelectCallback = fSelectCallback || function() {};
		this.fDeleteCallback = fDeleteCallback || function() {};
		this.fDblClickCallback = fDblClickCallback || function() {};
		this.fEnterCallback = fEnterCallback || function() {};
		this.bResetCheckedOnClick = Utils.isUnd(bResetCheckedOnClick) ? false : !!bResetCheckedOnClick;
		this.bCheckOnSelect = Utils.isUnd(bCheckOnSelect) ? false : !!bCheckOnSelect;
		this.bUnselectOnCtrl = Utils.isUnd(bUnselectOnCtrl) ? false : !!bUnselectOnCtrl;
		this.bDisableMultiplySelection = Utils.isUnd(bDisableMultiplySelection) ? false : !!bDisableMultiplySelection;
	
		this.useKeyboardKeys = ko.observable(false);
	
		this.list = ko.observableArray([]);
	
		if (list && list['subscribe'])
		{
			list['subscribe'](function (mValue) {
				this.list(mValue);
			}, this);
		}
		
		this.multiplyLineFactor = multiplyLineFactor;
		
		this.oLast = null;
		this.oListScope = null;
		this.oScrollScope = null;
	
		this.iTimer = 0;
		this.iFactor = 1;
	
		this.KeyUp = Enums.Key.Up;
		this.KeyDown = Enums.Key.Down;
		this.KeyLeft = Enums.Key.Up;
		this.KeyRight = Enums.Key.Down;
	
		if (this.multiplyLineFactor)
		{
			if (this.multiplyLineFactor.subscribe)
			{
				this.multiplyLineFactor.subscribe(function (iValue) {
					this.iFactor = 0 < iValue ? iValue : 1;
				}, this);
			}
			else
			{
				this.iFactor = Utils.pInt(this.multiplyLineFactor);
			}
	
			this.KeyUp = Enums.Key.Up;
			this.KeyDown = Enums.Key.Down;
			this.KeyLeft = Enums.Key.Left;
			this.KeyRight = Enums.Key.Right;
	
			if ($('html').hasClass('rtl'))
			{
				this.KeyLeft = Enums.Key.Right;
				this.KeyRight = Enums.Key.Left;
			}
		}
	
		this.sActionSelector = '';
		this.sSelectabelSelector = '';
		this.sCheckboxSelector = '';
	
		var self = this;
	
		// reading returns a list of checked items.
		// recording (bool) puts all checked, or unchecked.
		this.listChecked = ko.computed({
			'read': function () {
				var aList = _.filter(this.list(), function (oItem) {
					var
						bC = oItem.checked(),
						bS = oItem.selected()
					;
	
					return bC || (self.bCheckOnSelect && bS);
				});
	
				return aList;
			},
			'write': function (bValue) {
				bValue = !!bValue;
				_.each(this.list(), function (oItem) {
					oItem.checked(bValue);
				});
				this.list.valueHasMutated();
			},
			'owner': this
		});
	
		this.checkAll = ko.computed({
			'read': function () {
				return 0 < this.listChecked().length;
			},
	
			'write': function (bValue) {
				this.listChecked(!!bValue);
			},
			'owner': this
		});
	
		this.selectorHook = ko.observable(null);
	
		this.selectorHook.subscribe(function () {
			var oPrev = this.selectorHook();
			if (oPrev)
			{
				oPrev.selected(false);
			}
		}, this, 'beforeChange');
	
		this.selectorHook.subscribe(function (oGroup) {
			if (oGroup)
			{
				oGroup.selected(true);
			}
		}, this);
	
		this.itemSelected = ko.computed({
	
			'read': this.selectorHook,
	
			'write': function (oItemToSelect) {
	
				this.selectorHook(oItemToSelect);
	
				if (oItemToSelect)
				{
	//				self.scrollToSelected();
					this.oLast = oItemToSelect;
				}
			},
			'owner': this
		});
	
		this.list.subscribe(function (aList) {
			if (_.isArray(aList))
			{
				var	oSelected = this.itemSelected();
				if (oSelected)
				{
					if (!_.find(aList, function (oItem) {
						return oSelected === oItem;
					}))
					{
						this.itemSelected(null);
					}
				}
			}
			else
			{
				this.itemSelected(null);
			}
		}, this);
	
		this.listCheckedOrSelected = ko.computed({
			'read': function () {
				var
					oSelected = this.itemSelected(),
					aChecked = this.listChecked()
				;
				return 0 < aChecked.length ? aChecked : (oSelected ? [oSelected] : []);
			},
			'write': function (bValue) {
				if (!bValue)
				{
					this.itemSelected(null);
					this.listChecked(false);
				}
				else
				{
					this.listChecked(true);
				}
			},
			'owner': this
		});
	
		this.listCheckedAndSelected = ko.computed({
			'read': function () {
				var
					oSelected = this.itemSelected(),
					aChecked = this.listChecked()
				;
				
				if (oSelected && _.indexOf(aChecked, oSelected) === -1)
				{
					aChecked.push(oSelected);
				}
				
				return aChecked;
			},
			'write': function (bValue) {
				if (!bValue)
				{
					this.itemSelected(null);
					this.listChecked(false);
				}
				else
				{
					this.listChecked(true);
				}
			},
			'owner': this
		});
	
		this.isIncompleteChecked = ko.computed(function () {
			var
				iM = this.list().length,
				iC = this.listChecked().length
			;
			return 0 < iM && 0 < iC && iM > iC;
		}, this);
	
		this.onKeydownBinded = _.bind(this.onKeydown, this);
	}
	
	CSelector.prototype.iTimer = 0;
	CSelector.prototype.bResetCheckedOnClick = false;
	CSelector.prototype.bCheckOnSelect = false;
	CSelector.prototype.bUnselectOnCtrl = false;
	CSelector.prototype.bDisableMultiplySelection = false;
	
	/**
	 * @param {Function} fBeforeSelectCallback
	 */
	CSelector.prototype.setBeforeSelectCallback = function (fBeforeSelectCallback)
	{
		this.fBeforeSelectCallback = fBeforeSelectCallback || null;
	};
	
	/**
	 * @return {boolean}
	 */
	/*CSelector.prototype.inFocus = function ()
	{
		var mTagName = document && document.activeElement ? document.activeElement.tagName : null;
		return 'INPUT' === mTagName || 'TEXTAREA' === mTagName || 'IFRAME' === mTagName;
	};*/
	
	/**
	 * @param {string} sActionSelector css-selector for the active for pressing regions of the list
	 * @param {string} sSelectabelSelector css-selector to the item that was selected
	 * @param {string} sCheckboxSelector css-selector to the element that checkbox in the list
	 * @param {*} oListScope
	 * @param {*} oScrollScope
	 */
	CSelector.prototype.initOnApplyBindings = function (sActionSelector, sSelectabelSelector, sCheckboxSelector, oListScope, oScrollScope)
	{
		$(document).on('keydown', this.onKeydownBinded);
	
		this.oListScope = oListScope;
		this.oScrollScope = oScrollScope;
		this.sActionSelector = sActionSelector;
		this.sSelectabelSelector = sSelectabelSelector;
		this.sCheckboxSelector = sCheckboxSelector;
	
		var
			self = this,
	
			fEventClickFunction = function (oItem, oEvent) {
	
				var
					iIndex = 0,
					iLength = 0,
					oListItem = null,
					bChangeRange = false,
					bIsInRange = false,
					aList = [],
					bChecked = false
				;
	
				oItem = oItem ? oItem : null;
				if (oEvent && oEvent.shiftKey)
				{
					if (null !== oItem && null !== self.oLast && oItem !== self.oLast)
					{
						aList = self.list();
						bChecked = oItem.checked();
	
						for (iIndex = 0, iLength = aList.length; iIndex < iLength; iIndex++)
						{
							oListItem = aList[iIndex];
	
							bChangeRange = false;
							if (oListItem === self.oLast || oListItem === oItem)
							{
								bChangeRange = true;
							}
	
							if (bChangeRange)
							{
								bIsInRange = !bIsInRange;
							}
	
							if (bIsInRange || bChangeRange)
							{
								oListItem.checked(bChecked);
							}
						}
					}
				}
	
				if (oItem)
				{
					self.oLast = oItem;
				}
			}
		;
	
		$(this.oListScope).on('dblclick', sActionSelector, function (oEvent) {
			var oItem = ko.dataFor(this);
			if (oItem && oEvent && !oEvent.ctrlKey && !oEvent.altKey && !oEvent.shiftKey)
			{
				self.onDblClick(oItem);
			}
		});
	
		if (bMobileDevice)
		{
			$(this.oListScope).on('touchstart', sActionSelector, function (e) {
	
				if (!e)
				{
					return;
				}
	
				var
					t2 = e.timeStamp,
					t1 = $(this).data('lastTouch') || t2,
					dt = t2 - t1,
					fingers = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches.length : 0
				;
	
				$(this).data('lastTouch', t2);
				if (!dt || dt > 250 || fingers > 1)
				{
					return;
				}
	
				e.preventDefault();
				$(this).trigger('dblclick');
			});
		}
	
		$(this.oListScope).on('click', sActionSelector, function (oEvent) {
	
			var
				bClick = true,
				oSelected = null,
				oItem = ko.dataFor(this)
			;
	
			if (oItem && oEvent)
			{
				if (oEvent.shiftKey)
				{
					bClick = false;
					if (!self.bDisableMultiplySelection)
					{
						if (null === self.oLast)
						{
							self.oLast = oItem;
						}
	
						oItem.checked(!oItem.checked());
						fEventClickFunction(oItem, oEvent);
					}
				}
				else if (oEvent.ctrlKey)
				{
					bClick = false;
					if (!self.bDisableMultiplySelection)
					{
						self.oLast = oItem;
						oSelected = self.itemSelected();
						if (oSelected && !oSelected.checked() && !oItem.checked())
						{
							oSelected.checked(true);
						}
	
						if (self.bUnselectOnCtrl && oItem === self.itemSelected())
						{
							oItem.checked(!oItem.selected());
							self.itemSelected(null);
						}
						else
						{
							oItem.checked(!oItem.checked());
						}
					}
				}
	
				if (bClick)
				{
					self.onSelect(oItem);
				}
			}
		});
	
		$(this.oListScope).on('click', sCheckboxSelector, function (oEvent) {
	
			var oItem = ko.dataFor(this);
			if (oItem && oEvent && !self.bDisableMultiplySelection)
			{
				if (oEvent.shiftKey)
				{
					if (null === self.oLast)
					{
						self.oLast = oItem;
					}
	
					fEventClickFunction(oItem, oEvent);
				}
				else
				{
					self.oLast = oItem;
				}
			}
	
			if (oEvent && oEvent.stopPropagation)
			{
				oEvent.stopPropagation();
			}
		});
	
		$(this.oListScope).on('dblclick', sCheckboxSelector, function (oEvent) {
			if (oEvent && oEvent.stopPropagation)
			{
				oEvent.stopPropagation();
			}
		});
	};
	
	/**
	 * @param {Object} oSelected
	 * @param {number} iEventKeyCode
	 * 
	 * @return {Object}
	 */
	CSelector.prototype.getResultSelection = function (oSelected, iEventKeyCode)
	{
		var
			self = this,
			bStop = false,
			bNext = false,
			oResult = null,
			iPageStep = this.iFactor,
			bMultiply = !!this.multiplyLineFactor,
			iIndex = 0,
			iLen = 0,
			aList = []
		;
	
		if (!oSelected && -1 < Utils.inArray(iEventKeyCode, [this.KeyUp, this.KeyDown, this.KeyLeft, this.KeyRight,
			Enums.Key.PageUp, Enums.Key.PageDown, Enums.Key.Home, Enums.Key.End]))
		{
			aList = this.list();
			if (aList && 0 < aList.length)
			{
				if (-1 < Utils.inArray(iEventKeyCode, [this.KeyDown, this.KeyRight, Enums.Key.PageUp, Enums.Key.Home]))
				{
					oResult = aList[0];
				}
				else if (-1 < Utils.inArray(iEventKeyCode, [this.KeyUp, this.KeyLeft, Enums.Key.PageDown, Enums.Key.End]))
				{
					oResult = aList[aList.length - 1];
				}
			}
		}
		else if (oSelected)
		{
			aList = this.list();
			iLen = aList ? aList.length : 0;
	
			if (0 < iLen)
			{
				if (
					Enums.Key.Home === iEventKeyCode || Enums.Key.PageUp === iEventKeyCode ||
					Enums.Key.End === iEventKeyCode || Enums.Key.PageDown === iEventKeyCode ||
					(bMultiply && (Enums.Key.Left === iEventKeyCode || Enums.Key.Right === iEventKeyCode)) ||
					(!bMultiply && (Enums.Key.Up === iEventKeyCode || Enums.Key.Down === iEventKeyCode))
				)
				{
					_.each(aList, function (oItem) {
						if (!bStop)
						{
							switch (iEventKeyCode) {
								case self.KeyUp:
								case self.KeyLeft:
									if (oSelected === oItem)
									{
										bStop = true;
									}
									else
									{
										oResult = oItem;
									}
									break;
								case Enums.Key.Home:
								case Enums.Key.PageUp:
									oResult = oItem;
									bStop = true;
									break;
								case self.KeyDown:
								case self.KeyRight:
									if (bNext)
									{
										oResult = oItem;
										bStop = true;
									}
									else if (oSelected === oItem)
									{
										bNext = true;
									}
									break;
								case Enums.Key.End:
								case Enums.Key.PageDown:
									oResult = oItem;
									break;
							}
						}
					});
				}
				else if (bMultiply && this.KeyDown === iEventKeyCode)
				{
					for (; iIndex < iLen; iIndex++)
					{
						if (oSelected === aList[iIndex])
						{
							iIndex += iPageStep;
							if (iLen - 1 < iIndex)
							{
								iIndex -= iPageStep;
							}
	
							oResult = aList[iIndex];
							break;
						}
					}
				}
				else if (bMultiply && this.KeyUp === iEventKeyCode)
				{
					for (iIndex = iLen; iIndex >= 0; iIndex--)
					{
						if (oSelected === aList[iIndex])
						{
							iIndex -= iPageStep;
							if (0 > iIndex)
							{
								iIndex += iPageStep;
							}
	
							oResult = aList[iIndex];
							break;
						}
					}
				}
			}
		}
	
		return oResult;
	};
	
	/**
	 * @param {Object} oResult
	 * @param {Object} oSelected
	 * @param {number} iEventKeyCode
	 */
	CSelector.prototype.shiftClickResult = function (oResult, oSelected, iEventKeyCode)
	{
		if (oSelected)
		{
			var
				bMultiply = !!this.multiplyLineFactor,
				bInRange = false,
				bSelected = false
			;
	
			if (-1 < Utils.inArray(iEventKeyCode,
				bMultiply ? [Enums.Key.Left, Enums.Key.Right] : [Enums.Key.Up, Enums.Key.Down]))
			{
				oSelected.checked(!oSelected.checked());
			}
			else if (-1 < Utils.inArray(iEventKeyCode, bMultiply ?
				[Enums.Key.Up, Enums.Key.Down, Enums.Key.PageUp, Enums.Key.PageDown, Enums.Key.Home, Enums.Key.End] :
				[Enums.Key.Left, Enums.Key.Right, Enums.Key.PageUp, Enums.Key.PageDown, Enums.Key.Home, Enums.Key.End]
			))
			{
				bSelected = !oSelected.checked();
	
				_.each(this.list(), function (oItem) {
					var Add = false;
					if (oItem === oResult || oSelected === oItem)
					{
						bInRange = !bInRange;
						Add = true;
					}
	
					if (bInRange || Add)
					{
						oItem.checked(bSelected);
						Add = false;
					}
				});
				
				if (bMultiply && oResult && (iEventKeyCode === Enums.Key.Up || iEventKeyCode === Enums.Key.Down))
				{
					oResult.checked(!oResult.checked());
				}
			}
		}	
	};
	
	/**
	 * @param {number} iEventKeyCode
	 * @param {boolean} bShiftKey
	 */
	CSelector.prototype.clickNewSelectPosition = function (iEventKeyCode, bShiftKey)
	{
		var
			self = this,
			iTimeout = 0,
			oResult = null,
			oSelected = this.itemSelected()
		;
	
		oResult = this.getResultSelection(oSelected, iEventKeyCode);
	
		if (oResult)
		{
			if (bShiftKey)
			{
				this.shiftClickResult(oResult, oSelected, iEventKeyCode);
			}
	
			if (oResult && this.fBeforeSelectCallback)
			{
				this.fBeforeSelectCallback(oResult, function (bResult) {
					if (bResult)
					{
						self.itemSelected(oResult);
	
						iTimeout = 0 === self.iTimer ? 50 : 150;
						if (0 !== self.iTimer)
						{
							window.clearTimeout(self.iTimer);
						}
	
						self.iTimer = window.setTimeout(function () {
							self.iTimer = 0;
							self.onSelect(oResult, false);
						}, iTimeout);
					}
				});
	
				this.scrollToSelected();
			}
			else
			{
				this.itemSelected(oResult);
	
				iTimeout = 0 === this.iTimer ? 50 : 150;
				if (0 !== this.iTimer)
				{
					window.clearTimeout(this.iTimer);
				}
	
				this.iTimer = window.setTimeout(function () {
					self.iTimer = 0;
					self.onSelect(oResult);
				}, iTimeout);
	
				this.scrollToSelected();
			}
		}
		else if (oSelected)
		{
			if (bShiftKey && (-1 < Utils.inArray(iEventKeyCode, [this.KeyUp, this.KeyDown, this.KeyLeft, this.KeyRight,
				Enums.Key.PageUp, Enums.Key.PageDown, Enums.Key.Home, Enums.Key.End])))
			{
				oSelected.checked(!oSelected.checked());
			}
		}
	};
	
	/**
	 * @param {Object} oEvent
	 * 
	 * @return {boolean}
	 */
	CSelector.prototype.onKeydown = function (oEvent)
	{
		var
			bResult = true,
			iCode = 0
		;
	
		if (this.useKeyboardKeys() && oEvent && !Utils.inFocus())
		{
			iCode = oEvent.keyCode;
			if (!oEvent.ctrlKey &&
				(
					this.KeyUp === iCode || this.KeyDown === iCode ||
					this.KeyLeft === iCode || this.KeyRight === iCode ||
					Enums.Key.PageUp === iCode || Enums.Key.PageDown === iCode ||
					Enums.Key.Home === iCode || Enums.Key.End === iCode
				)
			)
			{
				this.clickNewSelectPosition(iCode, oEvent.shiftKey);
				bResult = false;
			}
			else if (Enums.Key.Del === iCode && !oEvent.ctrlKey && !oEvent.shiftKey)
			{
				if (0 < this.list().length)
				{
					this.onDelete();
					bResult = false;
				}
			}
			else if (Enums.Key.Enter === iCode)
			{
				if (0 < this.list().length)
				{
					this.onEnter(this.itemSelected());
					bResult = false;
				}
			}
			else if (oEvent.ctrlKey && Enums.Key.a === iCode)
			{
				this.checkAll(!(this.checkAll() && !this.isIncompleteChecked()));
				bResult = false;
			}
		}
	
		return bResult;
	};
	
	CSelector.prototype.onDelete = function ()
	{
		this.fDeleteCallback.call(this, this.listCheckedOrSelected());
		this.itemSelected(null);
		this.listChecked(false);
	};
	
	/**
	 * @param {Object} oItem
	 */
	CSelector.prototype.onEnter = function (oItem)
	{
		var self = this;
		if (oItem && this.fBeforeSelectCallback)
		{
			this.fBeforeSelectCallback(oItem, function (bResult) {
				if (bResult)
				{
					self.itemSelected(oItem);
					self.fEnterCallback.call(this, oItem);
				}
			});
		}
		else
		{
			this.itemSelected(oItem);
			this.fEnterCallback.call(this, oItem);
		}
	};
	
	/**
	 * @param {Object} oItem
	 */
	CSelector.prototype.selectionFunc = function (oItem)
	{
		this.itemSelected(null);
		if (this.bResetCheckedOnClick)
		{
			this.listChecked(false);
		}
	
		this.itemSelected(oItem);
		this.fSelectCallback.call(this, oItem);
	};
	
	/**
	 * @param {Object} oItem
	 * @param {boolean=} bCheckBefore = true
	 */
	CSelector.prototype.onSelect = function (oItem, bCheckBefore)
	{
		bCheckBefore = Utils.isUnd(bCheckBefore) ? true : !!bCheckBefore;
		if (this.fBeforeSelectCallback && bCheckBefore)
		{
			var self = this;
			this.fBeforeSelectCallback(oItem, function (bResult) {
				if (bResult)
				{
					self.selectionFunc(oItem);
				}
			});
		}
		else
		{
			this.selectionFunc(oItem);
		}
	};
	
	/**
	 * @param {Object} oItem
	 */
	CSelector.prototype.onDblClick = function (oItem)
	{
		this.fDblClickCallback.call(this, oItem);
	};
	
	CSelector.prototype.koCheckAll = function ()
	{
		return ko.computed({
			'read': this.checkAll,
			'write': this.checkAll,
			'owner': this
		});
	};
	
	CSelector.prototype.koCheckAllIncomplete = function ()
	{
		return ko.computed({
			'read': this.isIncompleteChecked,
			'write': this.isIncompleteChecked,
			'owner': this
		});
	};
	
	/**
	 * @return {boolean}
	 */
	CSelector.prototype.scrollToSelected = function ()
	{
		if (!this.oListScope || !this.oScrollScope)
		{
			return false;
		}
	
		var
			iOffset = 20,
			oSelected = $(this.sSelectabelSelector, this.oScrollScope),
			oPos = oSelected.position(),
			iVisibleHeight = this.oListScope.height(),
			iSelectedHeight = oSelected.outerHeight()
		;
	
		if (oPos && (oPos.top < 0 || oPos.top + iSelectedHeight > iVisibleHeight))
		{
			if (oPos.top < 0)
			{
				this.oScrollScope.scrollTop(this.oScrollScope.scrollTop() + oPos.top - iOffset);
			}
			else
			{
				this.oScrollScope.scrollTop(this.oScrollScope.scrollTop() + oPos.top - iVisibleHeight + iSelectedHeight + iOffset);
			}
	
			return true;
		}
	
		return false;
	};
	
	(function ($) {
	 
	 /**
	  * @param {{name:string,resizeFunc:Function}} args
	  */
	 $.fn.splitter = function(args){
		args = args || {};
	
		return this.each(function() {
			var
				bIsMouseSplit = false,
				storageKey = args.name,
				startSplitMouse = function (e) {
					bIsMouseSplit = true;
					bar.addClass(opts['activeClass']);
	
					opts['_posSplit'] = -((rtl ? splitter._overallWidth - e[opts['eventPos']] : e[opts['eventPos']]) - panes.get(0)[opts['pxSplit']] );
					
					$('body')
						.attr({'unselectable': "on"})
						.addClass('unselectable');
	
					$(document)
						.bind('mousemove', doSplitMouse)
						.bind('mouseup', endSplitMouse);
				},
				doSplitMouse = function (e) {
					var newPos = (rtl ? splitter._overallWidth - e[opts['eventPos']] : e[opts['eventPos']]) + opts['_posSplit'];
					resplit(newPos);
					
					if (Utils.isFunc(args.resizeFunc))
					{
						args.resizeFunc();
					}
				},
				endSplitMouse = function endSplitMouse(e) {
					bar.removeClass(opts['activeClass']);
	
					$('body')
						.attr({'unselectable': 'off'})
						.removeClass('unselectable');
	
					// Store 'width' data
					if (storageKey)
					{
						App.Storage.setData(storageKey + 'ResizerWidth', panes.get(0)[opts['pxSplit']]);
					}
	
					$(document)
						.unbind('mousemove', doSplitMouse)
						.unbind('mouseup', endSplitMouse);
					
					if (Utils.isFunc(args.resizeFunc))
					{
						args.resizeFunc();
					}
				},
				resplit = function (newPosition) {
	
					// Constrain new splitbar position to fit pane size limits
					newPosition = window.Math.max(
						panes.get(0)._min, splitter._overallWidth - panes.get(1)._max,
						window.Math.min(newPosition, panes.get(0)._max, splitter._overallWidth - panes.get(1)._min)
					);
	
					panes.get(0).$.css(opts['split'], newPosition);
					panes.get(1).$.css(opts['split'], splitter._overallWidth - newPosition);
	
					if (!App.browser.ie8AndBelow)
					{
						panes.trigger('resize');
					}
				},
				dimSum = function (elem, dims) {
					// Opera returns -1 for missing min/max width, turn into 0
					var sum = 0;
					for (var i = 1; i < arguments.length; i++)
					{
						sum += window.Math.max(window.parseInt(elem.css(arguments[i]), 10) || 0, 0);
					}
					
					return sum;
				},
				vh = (args.splitHorizontal ? 'h' : args.splitVertical ? 'v' : args.type) || 'v',
				opts = $.extend({
					'activeClass': 'active',	// class name for active splitter
					'pxPerKey': 8,			// splitter px moved per keypress
					'tabIndex': 0,			// tab order indicator
					'accessKey': ''			// accessKey for splitbar
				},{
					v: {					// Vertical splitters:
						'keyLeft': 39, 'keyRight': 37,
						'type': 'v', 'eventPos': "pageX", 'origin': "left",
						'split': "width",  'pxSplit': "offsetWidth",  'side1': "Left", 'side2': "Right",
						'fixed': "height", 'pxFixed': "offsetHeight", 'side3': "Top",  'side4': "Bottom"
					},
					h: {					// Horizontal splitters:
						'keyTop': 40, 'keyBottom': 38,
						'type': 'h', 'eventPos': "pageY", 'origin': "top",
						'split': "height", 'pxSplit': "offsetHeight", 'side1': "Top",  'side2': "Bottom",
						'fixed': "width",  'pxFixed': "offsetWidth",  'side3': "Left", 'side4': "Right"
					}
				}[vh], args),
				
				splitter = $(this).css({'position': 'relative'}),
				panes = $(">*:not(css3pie)", splitter).each(function(){this.$ = $(this);}),
				bar = $('.resize_handler', panes.get(0))
					.attr({'unselectable': 'on'})
					.bind('mousedown', startSplitMouse),
				rtl = splitter.css('direction') === 'rtl'
			;
	
			panes.get(0)._paneName = opts['side1'];
			panes.get(1)._paneName = opts['side2'];
			
			panes.each(function(){
				this._min = opts['min' + this._paneName] || dimSum(this.$, 'min-' + opts['split']);
				this._max = opts['max' + this._paneName] || dimSum(this.$, 'max-' + opts['split']) || 9999;
				this._init = opts['size' + this._paneName] === true ?
					window.parseInt($.css(this, opts['split']), 10) : opts['size' + this._paneName];
			});
	
			// Determine initial position, get from cookie if specified
			var initPosition = 0;
			if (storageKey)
			{
				initPosition = App.Storage.getData(storageKey + 'ResizerWidth') || panes.get(0)._init;
			}
			else
			{
				initPosition = panes.get(0)._init;
			}
	
			if (!isNaN(panes.get(1)._init))	// recalc initial B size as an offset from the top or left side
			{
				initPosition = splitter[0][opts['pxSplit']] - panes.get(1)._init;
			}
			
			if (isNaN(initPosition))
			{
				initPosition = splitter[0][opts['pxSplit']];
				initPosition = window.Math.round(initPosition / panes.length);
			}
			
			// Resize event propagation and splitter sizing
			if (opts['resizeToWidth'] && !(App.browser.ie8AndBelow))
			{
				$(window).bind('resize', function(e) {
					if (e.target !== this)
					{
						return;
					}
					splitter.trigger('resize'); 
				});
			}
	
			var
				nSize = 0,
				oLastState = {},
				oLastStateReserve = {}
			;
			splitter.bind('resize', function (ev, size, command) {
				var tKey = ev.target.className + '_' + command;
	
				if(bIsMouseSplit)
				{
					oLastState = {};
				}
	
				// Custom events bubble in jQuery 1.3; don't get into a Yo Dawg
				if (ev.target !== this)
				{
					return;
				}
	
				// Determine new width/height of splitter container
				splitter._overallWidth = splitter[0][opts['pxSplit']];
	
				// Return if splitter isn't visible or content isn't there yet
				if (splitter._overallWidth <= 0)
				{
					return;
				}
	
				if (!(opts['sizeRight'] || opts['sizeBottom']))
				{
					nSize = panes.get(0)[opts['pxSplit']];
				}
				else
				{
					nSize = splitter._overallWidth - panes.get(1)[opts['pxSplit']];
				}
	
				if (isNaN(size))
				{
					size = nSize;
				}
				else if (command)
				{
					bIsMouseSplit = false;
	
					if (oLastState[tKey])
					{
						size = oLastState[tKey];
						oLastState[tKey] = null;
					}
					else
					{
						if (size === nSize)
						{
							oLastState[tKey] = null;
							size = oLastStateReserve[tKey];
						}
						else
						{
							oLastState[tKey] = oLastStateReserve[tKey] = nSize;
						}
	
						_.each(oLastState, function(num, key) {
							if (key !== tKey)
							{
								oLastState[key] = null;
							}
						});
					}
				}
	
				resplit(size);
				
			}).trigger('resize', [initPosition]);
		});
	};
	
	})(jQuery);
	
	/**
	 * @constructor
	 */
	function CApi()
	{
		
	}
	
	/**
	 * @param {string} sToAddresses
	 */
	CApi.prototype.openComposeMessage = function (sToAddresses)
	{
		App.Routing.setHash(App.Links.composeWithToField(sToAddresses));
	};
	
	/**
	 * @param {string} sLoading
	 */
	CApi.prototype.showLoading = function (sLoading)
	{
		App.Screens.showLoading(sLoading);
	};
	
	CApi.prototype.hideLoading = function ()
	{
		App.Screens.hideLoading();
	};
	
	/**
	 * @param {string} sReport
	 * @param {number=} iDelay
	 */
	CApi.prototype.showReport = function (sReport, iDelay)
	{
		App.Screens.showReport(sReport, iDelay);
	};
	
	/**
	 * @param {string} sError
	 * @param {boolean=} bHtml = false
	 * @param {boolean=} bNotHide = false
	 */
	CApi.prototype.showError = function (sError, bHtml, bNotHide)
	{
		App.Screens.showError(sError, bHtml, bNotHide);
	};
	CApi.prototype.hideError = function (sError, bHtml, bNotHide)
	{
		App.Screens.hideError();
	};
	
	/**
	 * @param {number} iErrorCode
	 * @param {string=} sDefaultError
	 */
	CApi.prototype.showErrorByCode = function (iErrorCode, sDefaultError)
	{
		switch (iErrorCode)
		{
			case Enums.Errors.AuthError:
				this.showError(Utils.i18n('WARNING/LOGIN_PASS_INCORRECT'));
				break;
			case Enums.Errors.DemoLimitations:
				this.showError(Utils.i18n('DEMO/WARNING_THIS_FEATURE_IS_DISABLED'));
				break;
			case Enums.Errors.Recaptcha:
				this.showError(Utils.i18n('WARNING/CAPTCHA_IS_INCORRECT'));
				break;
			case Enums.Errors.CanNotGetMessage:
				this.showError(Utils.i18n('MESSAGE/ERROR_MESSAGE_DELETED'));
				break;
			case Enums.Errors.CanNotChangePassword:
				this.showError(Utils.i18n('WARNING/UNABLE_CHANGE_PASSWORD'));
				break;
			case Enums.Errors.AccountOldPasswordNotCorrect:
				this.showError(Utils.i18n('WARNING/CURRENT_PASSWORD_NOT_CORRECT'));
				break;
			case Enums.Errors.FetcherIncServerNotAvailable:
				this.showError(Utils.i18n('WARNING/FETCHER_SAVE_ERROR'));
				break;
			case Enums.Errors.FetcherLoginNotCorrect:
				this.showError(Utils.i18n('WARNING/FETCHER_SAVE_ERROR'));
				break;
			case Enums.Errors.HelpdeskUserNotExists:
				this.showError(Utils.i18n('HELPDESK/ERROR_FORGOT_NO_ACCOUNT'));
				break;
			case Enums.Errors.MailServerError:
				this.showError(Utils.i18n('WARNING/CANT_CONNECT_TO_SERVER'));
				break;
			case Enums.Errors.DataTransferFailed:
				this.showError(Utils.i18n('WARNING/DATA_TRANSFER_FAILED'));
				break;
			case Enums.Errors.NotDisplayedError:
				break;
			default:
				if (sDefaultError && sDefaultError.length > 0)
				{
					this.showError(sDefaultError);
				}
				break;
		}
	};
	
	
	/**
	 * @param {string} sName
	 * @param {string} sHeaderTitle
	 * @param {string} sDocumentTitle
	 * @param {string} sTemplateName
	 * @param {Object} oViewModelClass
	 */
	AfterLogicApi.addScreenToHeader = function (sName, sHeaderTitle, sDocumentTitle, sTemplateName, oViewModelClass)
	{
		App.addScreenToHeader(sName, sHeaderTitle, sDocumentTitle, sTemplateName, oViewModelClass);
	};
	
	AfterLogicApi.aSettingsTabs = [];
	
	/**
	 * @param {Object} oViewModelClass
	 */
	AfterLogicApi.addSettingsTab = function (oViewModelClass)
	{
		if (oViewModelClass.TabName)
		{
			Enums.SettingsTab[oViewModelClass.TabName] = oViewModelClass.TabName;
			AfterLogicApi.aSettingsTabs.push(oViewModelClass);
		}
	};
	
	/**
	 * @return {Array}
	 */
	AfterLogicApi.getPluginsSettingsTabs = function ()
	{
		return AfterLogicApi.aSettingsTabs;
	};
	
	/**
	 * @param {string} sSettingName
	 * 
	 * @return {string}
	 */
	AfterLogicApi.getSetting = function (sSettingName)
	{
		return AppData.App[sSettingName];
	};
	
	AfterLogicApi.oPluginHooks = {};
	
	/**
	 * @param {string} sName
	 * @param {Function} fCallback
	 */
	AfterLogicApi.addPluginHook = function (sName, fCallback)
	{
		if (Utils.isFunc(fCallback))
		{
			if (!$.isArray(this.oPluginHooks[sName]))
			{
				this.oPluginHooks[sName] = [];
			}
			
			this.oPluginHooks[sName].push(fCallback);
		}
	};
	
	/**
	 * @param {string} sName
	 * @param {Array=} aArguments
	 */
	AfterLogicApi.runPluginHook = function (sName, aArguments)
	{
		if ($.isArray(this.oPluginHooks[sName]))
		{
			aArguments = aArguments || [];
			
			_.each(this.oPluginHooks[sName], function (fCallback) {
				fCallback.apply(null, aArguments);
			});
		}
	};
	
	/**
	 * @param {Object} oParameters
	 * @param {Function=} fResponseHandler
	 * @param {Object=} oContext
	 */
	AfterLogicApi.sendAjaxRequest = function (oParameters, fResponseHandler, oContext)
	{
		App.Ajax.send(oParameters, fResponseHandler, oContext);
	};
	
	/**
	 * @constructor
	 */
	function CStorage()
	{
		Data.init();
	}
	
	CStorage.prototype.setData = function (key, value)
	{
		Data.setVar(key, value);
	};
	
	CStorage.prototype.removeData = function (key)
	{
		Data.setVar(key, '');
	};
	
	CStorage.prototype.getData = function (key)
	{
		return Data.getVar(key);
	};
	
	CStorage.prototype.hasData = function (key)
	{
		return Data.hasVar(key);
	};
	/**
	 * @constructor
	 */
	function CPhone()
	{
		this.provider = null;
	//	this.PhoneWebrtc = null;
	//	this.PhoneFlash = null;
	
		this.phoneReport = ko.observable('');
		this.action = ko.observable('offline');
	
		this.timerValue = ko.observable('');
		/*this.action.subscribe(function(sAction) {
			switch(sAction)
			{
				case 'settings':
					break
				case 'incoming':
					break
				case 'outgoing':
					break
				default:
			}
		}, this);*/
	
		this.notShowErrorMore = ko.observable(false);
	
	//	this.voiceApp = App.voiceApp;
		this.voiceApp = ko.observable(false);
	
		this.reconnectInterval = 0;
		this.timerInterval = 0;
	}
	
	CPhone.prototype.init = function ()
	{
		var self = this;
	
		$.ajaxSettings.cache = true;
	
		this.provider = new CPhoneTwilio(function (bResult) {
				self.voiceApp(bResult);
			});
	
	//	if (true) //Twilio
	//	{
	//		this.provider = new CPhoneTwilio(function (bResult) {
	//			self.voiceApp(bResult);
	//		});
	//	}
	//	else if (App.browser.chrome)
	////	else if (false)
	//	{
	//		this.provider = new CPhoneWebrtc();
	//	}
	////	else if (true)
	//	else if (false)
	//	{
	//		this.provider = new CPhoneFlash();
	//	}
	
	//	App.desktopNotify('show', 'QQQ', 'Click here to answer.\r\nTo drop the call, click End in the web interface.', 'phone', this.qqq.bind(this));
	//	$('body').on('click', function() {
	////		window.Notification.requestPermission();
	////		window.webkitNotifications.requestPermission();
	////		App.desktopNotify('show', 'QQQ','wwwwww', 'phone');
	////		App.desktopNotify('hide');
	//	});
	};
	
	CPhone.prototype.log = function ()
	{
		if (window.console && window.console.log)
		{
			window.console.log.apply(window.console, arguments);
		}
	};
	
	CPhone.prototype.call = function (sPhoneNumber)
	{
		this.provider.call(sPhoneNumber);
	};
	
	CPhone.prototype.answer = function ()
	{
		this.provider.answer();
		this.hideAll();
	};
	
	CPhone.prototype.hangup = function ()
	{
		this.provider.hangup();
		this.hideAll();
	};
	
	CPhone.prototype.hideAll = function ()
	{
		var self = this;
	
		App.Screens.hidePopup(PhonePopup);
		App.desktopNotify('hide');
		this.timer('stop');
	
		setTimeout(function() {
			self.phoneReport('');
		}, 3000);
	};
	
	CPhone.prototype.reconnect = function (iSeconds, fnConnect, bShowError)
	{
		var self = this,
			iSecondsLeft
		;
	
		clearInterval(this.reconnectInterval);
	
		/*if(bShowError || !this.notShowErrorMore())
		{
			//this.showError(1);
			this.action('info');
		}*/
	
		if (arguments.length)
		{
			iSecondsLeft = iSeconds;
	
			this.reconnectInterval = setInterval(function() {
				if (iSecondsLeft > 0)
				{
					self.phoneReport(Utils.i18n('Reconnect in ' + iSecondsLeft + ' seconds'));
				}
				else if (iSecondsLeft <= 0)
				{
					self.phoneReport(Utils.i18n('Connecting...'));
					clearInterval(self.reconnectInterval);
					iSecondsLeft = iSeconds;
					fnConnect();
				}
	
				iSecondsLeft--;
			}, 1000);
		}
	};
	
	CPhone.prototype.timer = function (sAction)
	{
		var self = this,
			iSeconds = 0,
			iMinutes = 0,
			fAddNull = function (iItem) {
				var sItem = iItem.toString();
				return sItem.length === 1 ? sItem = '0' + sItem : sItem;
			}
		;
	
		if (sAction === 'start')
		{
			this.timerInterval = setInterval(function() {
				if(iSeconds === 60)
				{
					iSeconds = 0;
					iMinutes++;
				}
				self.phoneReport(Utils.i18n('passed time ' + fAddNull(iMinutes) + ':' + fAddNull(iSeconds)));
				iSeconds++;
			}, 1000);
		}
		else if (sAction === 'stop')
		{
			clearInterval(this.timerInterval);
		}
	};
	
	
	CPhone.prototype.showError = function (iErrCode)
	{
		// 1 - Voice messaging server is unavailable
	
		if (1 === Utils.pInt(iErrCode))
		{
			this.notShowErrorMore(true);
			App.Api.showError(Utils.i18n('PHONE/ERROR_SERVER_UNAVAILABLE'), false, true);
		}
	};
	
	CPhone.prototype.hideError = function ()
	{
		App.Api.hideError();
		this.notShowErrorMore(false);
	};
	
	CPhone.prototype.showPopup = function (oParameters)
	{
		App.Screens.showPopup(PhonePopup, [oParameters]);
	};
	
	CPhone.prototype.hidePopup = function ()
	{
		App.Screens.hidePopup(PhonePopup);
	};
	
	//CPhone.prototype.clearReport = function ()
	//{
	//	var self = this;
	//
	//	setTimeout(function() {
	//		self.phoneReport('');
	//	}, 3000);
	//};
	
	/**
	 * @constructor
	 */
	function CPhoneWebrtc()
	{
		this.phone = App.Phone;
		this.voiceApp = App.Phone.voiceApp;
		this.phoneReport = App.Phone.phoneReport;
		this.action = App.Phone.action;
	
		this.stack = ko.observable(null);
		this.registerSession = ko.observable(null);
		this.callSession = ko.observable(null);
	
		this.stackConf = ko.observable(null);
		this.registerConf = ko.observable(null);
		this.hangupConf = ko.observable(null);
	
		this.hasFatalError = ko.observable(false);
		this.isStarted = ko.observable(false);
	
		this.eventSessionBinded = this.eventSession.bind(this);
		this.createStackErrorBinded = this.createStackError.bind(this);
		this.createStackBinded = this.createStack.bind(this);
	
		//this.videoLocal = document.getElementById("video_local");
		//this.videoRemote = document.getElementById("video_remote");
		this.audioRemote = document.getElementById("audio_remote");
	
		this.interval = 0;
	
		this.setConfigs();
	
		this.init();
	}
	
	CPhoneWebrtc.prototype.init = function ()
	{
		var self = this;
	
		$.getScript("static/js/sipml.js", function(sData, sStatus, jqXHR)
		{
			if (sStatus === 'success')
			{
				self.voiceApp(true);
	
				// Supported values: info, warn, error, fatal.
				SIPml.setDebugLevel('fatal');
				SIPml.init(self.createStackBinded, self.createStackErrorBinded);
			}
		});
	};
	
	CPhoneWebrtc.prototype.setConfigs = function ()
	{
		this.stackConf({
			realm: AppData.User.VoiceRealm,
			impi: AppData.User.VoiceImpi,
			impu: 'sip:' + AppData.User.VoiceImpi + '@' + AppData.User.VoiceRealm,
			password: AppData.User.VoicePassword,
			enable_rtcweb_breaker: true,
			//enable_click2call: true,
			websocket_proxy_url: AppData.User.VoiceWebsocketProxyUrl,
			//outbound_proxy_url: AppData.User.VoiceOutboundProxyUrl,
			//ice_servers: [{ url: 'stun:stun.l.google.com:19302'}, { url:'turn:user@numb.viagenie.ca', credential:'myPassword'}],
			events_listener: {
				events: '*',
				listener: this.eventSessionBinded
			}
		});
	
		this.registerConf(
			{
				audio_remote: this.audioRemote,
				expires: 3600,
				events_listener: {
					events: '*',
					listener: this.eventSessionBinded
				},
				sip_caps: [
					{ name: '+g.oma.sip-im', value: null },
					{ name: '+audio', value: null },
					{ name: 'language', value: '\"en,fr\"' }
				]
			});
	
		this.hangupConf({
			events_listener: {
				events: '*',
				listener: this.eventSessionBinded
			}});
	};
	
	CPhoneWebrtc.prototype.createStackError = function ()
	{
		this.log('Failed to initialize the engine');
	};
	
	CPhoneWebrtc.prototype.log = function (sDesc)
	{
		if (window.console && window.console.log)
		{
			window.console.log('*************************************************** ' + sDesc);
		}
	};
	
	
	CPhoneWebrtc.prototype.createStack = function ()
	{
		this.stack(new SIPml.Stack(this.stackConf()));
	
		this.stack().start();
	};
	
	CPhoneWebrtc.prototype.register = function ()
	{
		this.registerSession(this.stack().newSession('register', this.registerConf()));
		this.registerSession().register();
	};
	
	/**
	 * @param {string} sPhone
	 */
	CPhoneWebrtc.prototype.call = function (sPhone)
	{
		if(!this.isStarted())
		{
			this.hasFatalError(false);
			this.createStack();
		}
		else
		{
			this.action('outgoing');
			this.callSession(this.stack().newSession('call-audio', this.registerConf()));
			this.callSession().call(sPhone);
	
			this.log(this.callSession()['getRemoteFriendlyName']());
		}
	};
	
	CPhoneWebrtc.prototype.answer = function ()
	{
		if(this.callSession())
		{
			this.callSession().accept(this.registerConf());
		}
	};
	
	CPhoneWebrtc.prototype.hangup = function ()
	{
		if (this.callSession())
		{
			this.callSession().hangup(this.hangupConf());
		}
	
		/*if (this.stack() && this.stack().o_stack.e_state)
		 {	//unregister
		 oRegisterSession = this.stack()['newSession']('register', {
		 expires: 0
		 });
		 oRegisterSession.register();
		 }
		 this.stack().stop();*/
	
	};
	
	/**
	 * @param {{newSession,type}} ev
	 */
	CPhoneWebrtc.prototype.eventSession = function (ev)
	{
		this.log(ev.type + ' (' + ev.description + ')');
	
		var sEvType = ev.type;
	
		// http://sipml5.org/docgen/symbols/SIPml.EventTarget.html
	
		switch (sEvType)
		{
			case 'starting':
				break;
			case 'started':
				this.phone.hideError();
				this.isStarted(true);
	
				this.register();
				break;
			case 'stopping':
			case 'stopped':
				this.isStarted(false);
				this.createStack();
				break;
			case 'failed_to_stop':
				break;
			case 'failed_to_start':
				this.isStarted(false);
	//			this.reconnect(10, this.createStack.bind(this), !this.hasFatalError());
				this.phone.reconnect(30, this.createStack.bind(this));
				break;
			case 'connecting':
				break;
			case 'connected':
				this.phoneReport(Utils.i18n('PHONE/CONNECTED'));
	
				if(ev.description === 'In call')
				{
					App.desktopNotify('hide');
				}
	
				break;
			case 'terminating':
				this.phoneReport(Utils.i18n('PHONE/CALL_TERMINATING'));
				_.delay(_.bind(function() { this.action(''); }, this), 1500);
				break;
			case 'terminated':
				this.phoneReport(Utils.i18n('PHONE/TERMINATED'));
				if(ev.description === 'Disconnected')
				{
					this.createStack();
				}
				break;
			case 'i_ao_request':
				this.phoneReport(Utils.i18n('PHONE/RINGING'));
	//			if(ev.description === 'Ringing') {
	//				var self = this;
	//				$('body').on('click', function() {
	//					console.log('dtmf');
	////					self.callSession().dtmf('#7002');
	////					self.callSession().dtmf('7002');
	////					self.callSession().dtmf('#');
	////					this.callSession().dtmf('*');
	//					self.callSession().dtmf('7');
	//					self.callSession().dtmf('0');
	//					self.callSession().dtmf('0');
	//					self.callSession().dtmf('2');
	//				})
	//			}
				break;
			case 'media_added':
				break;
			case 'media_removed':
				break;
			case 'i_request':
				break;
			case 'o_request':
				break;
			case 'sent_request':
				break;
			case 'cancelled_request':
				break;
			case 'i_new_call':
				this.callSession(ev.newSession);
	//			App.desktopNotify('show', this.callSession()['getRemoteFriendlyName']() + ' calling...', 'Click here to answer.\r\n To drop the call, click End in the web interface.', this.phone.answer);
				this.action('incoming');
				this.phone.showPopup({
					Action: Enums.PhoneAction.Incoming,
					PhoneNumber: this.callSession()['getRemoteFriendlyName']()
				});
				break;
			case 'i_new_message':
				break;
			case 'm_permission_requested':
				break;
			case 'm_permission_accepted':
				if(this.action() === 'incoming')
				{
					this.phoneReport(Utils.i18n('PHONE/INCOMING_CALL_FROM') + ' ' + this.callSession()['getRemoteFriendlyName']());
				}
				else
				{
					this.phoneReport(Utils.i18n('PHONE/CALL_IN_PROGRESS'));
				}
				break;
			case 'm_permission_refused':
				break;
			case 'transport_error':
				break;
			case 'global_error':
				break;
			case 'message_error':
				break;
			case 'webrtc_error':
				break;
		}
	};
	
	/**
	 * @constructor
	 */
	function CPhoneFlash()
	{
		this.flash = null;
		this.jqFlash = null;
	
		this.phone = App.Phone;
		this.voiceApp = App.Phone.voiceApp;
		this.phoneReport = App.Phone.phoneReport;
		this.action = App.Phone.action;
	
		this.voiceImpi = AppData.User.VoiceImpi;
		this.voicePassword = AppData.User.VoicePassword;
	//	this.voiceUrl = AppData.User.VoiceWebsocketProxyUrl;
	
		this.sessionid = ko.observable('');
		this.callState = ko.observable('');
		this.initStatus = ko.observable(false);
		this.connectStatus = ko.observable(false);
	
		this.init();
	}
	
	CPhoneFlash.prototype.init = function ()
	{
		var self = this;
	
		$.getScript("static/js/swfobject.js", function(sData, sStatus, jqXHR)
		{
			if (sStatus === 'success')
			{
				self.voiceApp(true);
	
				swfobject.embedSWF(
					"static/freeswitch.swf", //swf url
					"flash", //id
					"214", //width
					"137", //height
					"9.0.0", //required Flash player version
					"expressInstall.swf", //express install swf url
					{rtmp_url: 'rtmp://217.199.220.26/phone'}, //flashvars
					{allowScriptAccess: 'always', bgcolor: '#ece9e0'}, //params
					[], //attributes
					false //callback fn
				);
	
				self.callbacks();
			}
		});
	};
	
	CPhoneFlash.prototype.log = function (sDesc)
	{
		if (window.console && window.console.log)
		{
			window.console.log(sDesc);
		}
	};
	
	CPhoneFlash.prototype.showPrivacy = function ()
	{
	//	this.action(Enums.PhoneAction.Settings);
		this.phone.showPopup({
			Action: Enums.PhoneAction.Settings,
			Callback: this.launchFlash.bind(this)
		});
	
		var fake_flash = $("#fake_flash"),
			oOffset = fake_flash.offset(),
			iWidth = fake_flash.width()
		;
	
		this.jqFlash.css("left", oOffset.left + (iWidth/2) - 107);// 107 - initial width of freeswitch.swf divided in half
		this.jqFlash.css("top", oOffset.top);
		this.jqFlash.css("visibility", "visible");
		this.flash.showPrivacy();
	};
	
	CPhoneFlash.prototype.checkMic = function ()
	{
		return this.flash.isMuted();
	//	return true;
	};
	
	
	CPhoneFlash.prototype.login = function (sName, sPassword)
	{
		this.flash.login(sName, sPassword);
	};
	
	CPhoneFlash.prototype.newCall = function ()
	{
	//	$("#callout").data('account', account);
	};
	
	CPhoneFlash.prototype.call = function (sPhone)
	{
	//	$("#flash")[0].makeCall('sip:' + sPhone + '@217.199.220.26', '7003@217.199.220.26', []); // number@217.199.220.26, 7003@217.199.220.26 ,[]
		this.flash.makeCall('sip:7002@217.199.220.24', '7003@217.199.220.26', []);
	};
	
	CPhoneFlash.prototype.answer = function (uuid)
	{
		this.flash.answer(uuid);
	};
	
	CPhoneFlash.prototype.hangup = function (uuid)
	{
		this.flash.hangup(uuid);
	};
	
	CPhoneFlash.prototype.addCall = function (uuid, name, number, account)
	{
	
	};
	
	CPhoneFlash.prototype.launchFlash = function (uuid, name, number, account)
	{
		this.jqFlash.css("top", '-200px');
	};
	
	CPhoneFlash.prototype.callbacks = function ()
	{
		var self = this;
	
		window.onInit = function ()
		{
			self.log('**************** onInit');
	
			self.initStatus(true);
		};
	
		window.onConnected = function (sessionid)
		{
			self.log('**************** onConnected ' + '(' + sessionid + ')');
	
			self.connectStatus(true);
			self.sessionid(sessionid);
	
			self.jqFlash = $("#flash");
			self.flash = self.jqFlash[0];
	
			if (self.checkMic()) {
				self.showPrivacy();
			}
	
			self.login('7003@217.199.220.26', '7003voippassword');
	//		self.login('7003@217.199.220.24', '7003voippassword');
		};
	
		window.onDisconnected = function ()
		{
			self.log('**************** onDisconnected');
	
		};
	
		window.onEvent = function (data)
		{
			self.log('**************** onEvent ' + '(' + data + ')');
	
		};
	
		window.onLogin = function (status, user, domain)
		{
			self.log('**************** onLogin ' + '(' + status + ', ' + user + ', ' + domain + ')');
	//		$("#flash")[0].register('7003@217.199.220.26', user);
	//		$('#flash')[0].setMic(0);
	
	//		self.showPrivacy();
	//		self.call();
		};
	
		window.onLogout = function (user, domain)
		{
			self.log('**************** onLogout ' + '(' + user + ', ' + domain + ')');
	
		};
	
		window.onMakeCall = function (uuid, number, account)
		{
			self.log('**************** onMakeCall ' + '(' + uuid + ', ' + number + ', ' + account + ')');
	
		};
	
		window.onHangup = function (uuid, cause)
		{
			self.log('**************** onHangup ' + '(' + uuid + ', ' + cause + ')');
	
		};
	
		window.onIncomingCall = function (uuid, name, number, account, evt)
		{
			self.log('**************** onIncomingCall ' + '(' + uuid + ', ' + name + ', ' + number + ', ' + account + ', ' + evt + ')');
	
			self.addCall(uuid, name, number);
		};
	
		window.onDisplayUpdate = function (uuid, name, number)
		{
			self.log('**************** onDisplayUpdate ' + '(' + uuid + ', ' + name + ', ' + number + ')');
	
		};
	
		window.onCallState = function (uuid, state)
		{
			self.log('**************** onCallState ' + '(' + uuid + ', ' + state + ')');
	
			self.callState(state);
		};
	
		window.onDebug = function (message)
		{
			self.log('**************** onDebug ' + '(' + message + ')');
	
		};
	
		window.onAttach = function (uuid)
		{
			self.log('**************** onAttach ' + '(' + uuid + ')');
	
		};
	};
	
	
	/**
	 * @constructor
	 */
	function CPhoneTwilio(fCallback)
	{
		this.device = null;
		this.connection = null;
		
		this.phone = App.Phone;
		this.phoneReport = App.Phone.phoneReport;
	
	//	this.sessionId = ko.observable('');
	//	this.callState = ko.observable('');
	//	this.connectStatus = ko.observable(false);
	
		this.fCallback = fCallback;
		this.init();
	}
	
	CPhoneTwilio.prototype.init = function ()
	{
		App.Ajax.send( {'Action': 'GetTwilioToken'}, this.onTokenResponse, this);
	};
	
	CPhoneTwilio.prototype.onTokenResponse = function (oResult, oRequest)
	{
		var 
			self = this
		;
	
		if (oResult && oResult.Result)
		{
			$.ajaxSettings.cache = true;
			$.getScript(
				"//static.twilio.com/libs/twiliojs/1.1/twilio.min.js",
				function(sData, sStatus, jqXHR)
				{
					if (sStatus === 'success')
					{
						self.setupDevice(oResult.Result);
					}
				}
			);
		}
	};
	
	CPhoneTwilio.prototype.setupDevice = function (sToken)
	{	
		var 
			self = this
		;
	
	//	var interval = setInterval(function() {
	//		console.log(Twilio.Device.status());
	//	}, 1000);
		
		this.device = Twilio.Device;
		this.device.setup(sToken, {
	//		rtc: false,
	//		debug: true
		});
	
		self.phone.action('offline');
	
		// events
		this.device.ready(function (oDevice) {
			self.phone.log('**************** ready ', oDevice);
	
			self.fCallback(true);
			self.phone.action('standby');
		});
	
		this.device.offline(function (oDevice) {
			self.phone.log('**************** offline ', oDevice);
	
			self.phone.action('offline');
	//		self.phoneReport('Offline');
		});
		
		this.device.error(function (oError) {
			self.phone.log('**************** error ', oError);
	
	//		console.log(oError);
	//		App.Api.showError(oError['message'], false, true);
		});
		
		// This is triggered when a connection is opened (incoming||outgoing)
		this.device.connect(function (oConnection) {
			self.phone.log('**************** connect ', oConnection);
	
			self.phone.action('outgoing');
			self.phoneReport(Utils.i18n('Connected'));
			self.phone.timer('start');
		});
	
		this.device.disconnect(function (oConnection) {
			self.phone.log('**************** disconnect ', oConnection);
	
			self.phone.action('connection_end');
			self.phoneReport('Call ended');
			self.phone.hideAll();
		});
	
		this.device.incoming(function (oConnection) {
			self.phone.log('**************** incoming ', oConnection);
			
			self.phone.action('incoming');
			
			self.connection = oConnection;
			
			self.phoneReport(Utils.i18n('PHONE/INCOMING_CALL_FROM') + ' ' + oConnection.parameters.From);
			
			self.phone.showPopup({
				Action: Enums.PhoneAction.Incoming,
				PhoneNumber: oConnection.parameters.From
	//			Callback: function () {
	//				self.answer(oConnection, self);
	//			}
			});
		});
		
		// This is triggered when an incoming connection is canceled by the caller before it is accepted by the device.
		this.device.cancel( function (oConnection) {
			self.phone.log('**************** cancel ', oConnection);
	
			self.phone.hideAll();
		});
		
		// Register a handler function to be called when availability state changes for any client currently associated with your Twilio account.
		this.device.presence( function ( presenceEvent) {
			self.phone.log('**************** presence ', presenceEvent);
	
		});
	};
	
	CPhoneTwilio.prototype.call = function (sPhoneNumber)
	{
		var 
			params = {
				"PhoneNumber": sPhoneNumber,
				"Direction": 'outbound'
			},
			self = this
		;
	
		this.connection = this.device.connect(params);
	//	var interval = setInterval(function() {
	//		console.log(self.connection._status);
	//	}, 1000);
	
		// _.delay(function () {
	//		self.connection.disconnect();
	//		self.device.disconnectAll();
	//	}, 10000);
	};
	
	CPhoneTwilio.prototype.answer = function ()
	{
		this.phone.action('connected_in');
		this.phoneReport('Incoming: ' + this.connection.parameters.From);
		
		this.connection.accept();
	};
	
	CPhoneTwilio.prototype.hangup = function ()
	{
	//	if (this.phone.action === 'incoming') {
		if (this.connection.status() === 'pending') {
			this.connection.reject();
		} else {
			this.connection.disconnect();
	//		this.device.disconnectAll();
		}
		
	};
	
	/**
	 * @constructor
	 */
	function AlertPopup()
	{
		this.alertDesc = ko.observable('');
		this.closeCallback = null;
		this.title = ko.observable('');
		this.okButtonText = ko.observable(Utils.i18n('MAIN/BUTTON_OK'));
	}
	
	/**
	 * @param {string} sDesc
	 * @param {Function=} fCloseCallback = null
	 * @param {string=} sTitle = ''
	 * @param {string=} sOkButtonText = 'Ok'
	 */
	AlertPopup.prototype.onShow = function (sDesc, fCloseCallback, sTitle, sOkButtonText)
	{
		this.alertDesc(sDesc);
		this.closeCallback = fCloseCallback || null;
		this.title(sTitle || '');
		this.okButtonText(sOkButtonText || Utils.i18n('MAIN/BUTTON_OK'));
	};
	
	/**
	 * @return {string}
	 */
	AlertPopup.prototype.popupTemplate = function ()
	{
		return 'Popups_AlertPopupViewModel';
	};
	
	AlertPopup.prototype.onEnterHandler = function ()
	{
		this.close();
	};
	
	AlertPopup.prototype.close = function ()
	{
		if (Utils.isFunc(this.closeCallback))
		{
			this.closeCallback();
		}
		this.closeCommand();
	};
	
	/**
	 * @constructor
	 */
	function ConfirmPopup()
	{
		this.fConfirmCallback = null;
		this.confirmDesc = ko.observable('');
		this.title = ko.observable('');
		this.okButtonText = ko.observable(Utils.i18n('MAIN/BUTTON_OK'));
		this.cancelButtonText = ko.observable(Utils.i18n('MAIN/BUTTON_CANCEL'));
	}
	
	/**
	 * @param {string} sDesc
	 * @param {Function} fConfirmCallback
	 * @param {string=} sTitle = ''
	 * @param {string=} sOkButtonText = ''
	 * @param {string=} sCancelButtonText = ''
	 */
	ConfirmPopup.prototype.onShow = function (sDesc, fConfirmCallback, sTitle, sOkButtonText, sCancelButtonText)
	{
		this.title(sTitle || '');
		this.okButtonText(sOkButtonText || Utils.i18n('MAIN/BUTTON_OK'));
		this.cancelButtonText(sCancelButtonText || Utils.i18n('MAIN/BUTTON_CANCEL'));
		if (Utils.isFunc(fConfirmCallback))
		{
			this.fConfirmCallback = fConfirmCallback;
			this.confirmDesc(sDesc);
		}
	};
	
	/**
	 * @return {string}
	 */
	ConfirmPopup.prototype.popupTemplate = function ()
	{
		return 'Popups_ConfirmPopupViewModel';
	};
	
	ConfirmPopup.prototype.onEnterHandler = function ()
	{
		this.yesClick();
	};
	
	ConfirmPopup.prototype.yesClick = function ()
	{
		if (this.fConfirmCallback)
		{
			this.fConfirmCallback(true);
		}
	
		this.closeCommand();
	};
	
	ConfirmPopup.prototype.noClick = function ()
	{
		if (this.fConfirmCallback)
		{
			this.fConfirmCallback(false);
		}
	
		this.closeCommand();
	};
	
	
	
	
	
	/**
	 * @constructor
	 */
	function AccountCreatePopup()
	{
		this.fCallback = null;
		this.editedAccountId = AppData.Accounts.editedId;
	
		this.loading = ko.observable(false);
	
		this.friendlyName = ko.observable('');
		this.email = ko.observable('');
		this.incomingMailLogin = ko.observable('');
		this.incLoginFocused = ko.observable(false);
		this.incLoginFocused.subscribe(function () {
			if (this.incLoginFocused() && this.incomingMailLogin() === '')
			{
				this.incomingMailLogin(this.email());
			}
		}, this);
		this.incomingMailPassword = ko.observable('');
		this.incomingMailPort = ko.observable(143);
		this.incomingMailServer = ko.observable('');
		this.outgoingMailLogin = ko.observable('');
		this.outgoingMailPassword = ko.observable('');
		this.outgoingMailPort = ko.observable(25);
		this.outgoingMailServer = ko.observable('');
		this.outServerFocused = ko.observable(false);
		this.outServerFocused.subscribe(function () {
			if (this.outServerFocused() && this.outgoingMailServer() === '')
			{
				this.outgoingMailServer(this.incomingMailServer());
			}
		}, this);
		this.useSmtpAuthentication = ko.observable(true);
		this.friendlyNameFocus = ko.observable(false);
	}
	
	AccountCreatePopup.prototype.onShow = function ()
	{
		this.friendlyNameFocus(true);
		this.init();
	};
	
	/**
	 * @return {string}
	 */
	AccountCreatePopup.prototype.popupTemplate = function ()
	{
		return 'Popups_AccountCreatePopupViewModel';
	};
	
	AccountCreatePopup.prototype.init = function ()
	{
		this.friendlyName('');
		this.email('');
		this.incomingMailLogin('');
		this.incLoginFocused(false);
		this.incomingMailPassword('');
		this.incomingMailPort(143);
		this.incomingMailServer('');
		this.outgoingMailLogin('');
		this.outgoingMailPassword('');
		this.outgoingMailPort(25);
		this.outgoingMailServer('');
		this.outServerFocused(false);
		this.useSmtpAuthentication(true);
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	AccountCreatePopup.prototype.onResponseAddAccount = function (oData, oParameters)
	{
		this.loading(false);
	
		if (!oData.Result)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('WARNING/CREATING_ACCOUNT_ERROR'));
		}
		else
		{
			var
				oAccount = new CAccountModel(),
				iAccountId = parseInt(oData.Result, 10)
			;
			
			oAccount.init(iAccountId, oParameters.Email, oParameters.FriendlyName);
			oAccount.updateExtended(oParameters);
	
			AppData.Accounts.addAccount(oAccount);
			AppData.Accounts.changeEditedAccount(iAccountId);
			this.closeCommand();
			this.init();
		}
	};
	
	AccountCreatePopup.prototype.onSaveClick = function ()
	{
		var
			oParameters = {
				'Action': 'AccountCreate',
				'AccountID': this.editedAccountId(),
				'FriendlyName': this.friendlyName(),
				'Email': this.email(),
				'IncomingMailLogin': this.incomingMailLogin(),
				'IncomingMailPassword': this.incomingMailPassword(),
				'IncomingMailServer': this.incomingMailServer(),
				'IncomingMailPort': parseInt(this.incomingMailPort(), 10),
				'OutgoingMailServer': this.outgoingMailServer(),
				'OutgoingMailLogin': this.outgoingMailLogin(),
				'OutgoingMailPassword': this.outgoingMailPassword(),
				'OutgoingMailPort': parseInt(this.outgoingMailPort(), 10),
				'OutgoingMailAuth': this.useSmtpAuthentication() ? 2 : 0
			}
		;
	
		this.loading(true);
	
		App.Ajax.send(oParameters, this.onResponseAddAccount, this);
	};
	
	AccountCreatePopup.prototype.onCancelClick = function ()
	{
		this.closeCommand();
	};
	
	/**
	 * @constructor
	 */
	function FetcherAddPopup()
	{
		this.defaultAccountId = AppData.Accounts.defaultId;
	
		this.loading = ko.observable(false);
	
		this.incomingMailServer = ko.observable('');
		this.incomingMailPort = ko.observable(110);
		this.incomingMailLogin = ko.observable('');
		this.incomingMailPassword = ko.observable('');
	
		this.folderList = App.MailCache.folderList;
		this.options = ko.computed(function () {
			var aOptions = this.folderList().getOptions(undefined, true);
	
	//		console.log(aOptions);
	//
	//		aOptions.push({
	//			disable: false,
	//			displayName: "Qqq",
	//			id: "QQQ",
	//			name: "QQQ"
	//		});
	
			return aOptions;
		}, this);
	
		this.folder = ko.observable('');
	
		this.outgoingMailServer = ko.observable('');
		this.outgoingMailPort = ko.observable(25);
	
		this.leaveMessagesOnServer = ko.observable(false);
		this.useSmtpAuthentication = ko.observable(false);
	
		this.serverIsSelected = ko.observable(false);
		this.loginIsSelected = ko.observable(false);
		this.passwordIsSelected = ko.observable(false);
	
		this.defaultOptionsAfterRender = Utils.defaultOptionsAfterRender;
	}
	
	/**
	 * @return {string}
	 */
	FetcherAddPopup.prototype.popupTemplate = function ()
	{
		return 'Popups_FetcherAddPopupViewModel';
	};
	
	FetcherAddPopup.prototype.init = function ()
	{
		this.incomingMailServer('');
		this.incomingMailPort(110);
		this.incomingMailLogin('');
		this.incomingMailPassword('');
	
		this.folder('');
	
		this.outgoingMailServer('');
		this.outgoingMailPort(25);
	
		this.leaveMessagesOnServer(true);
	
	};
	
	FetcherAddPopup.prototype.onSaveClick = function ()
	{
		if (this.isEmptyRequiredFields())
		{
			App.Api.showErrorByCode(0, Utils.i18n('WARNING/FETCHER_CREATE_ERROR'));
		}
		else
		{
			var oParameters = {
				'Action': 'FetcherCreate',
				'AccountID': this.defaultAccountId(),
				'Folder': this.folder(),
				'IncomingMailServer': this.incomingMailServer(),
				'IncomingMailPort': parseInt(this.incomingMailPort(), 10),
				'IncomingMailLogin': this.incomingMailLogin(),
				'IncomingMailPassword': (this.incomingMailPassword() === '') ? '******' : this.incomingMailPassword(),
				'LeaveMessagesOnServer': this.leaveMessagesOnServer() ? 1 : 0
			};
	
			this.loading(true);
	
			App.Ajax.send(oParameters, this.onAddFetcherResponse, this);
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	FetcherAddPopup.prototype.onAddFetcherResponse = function (oData, oParameters)
	{
		this.loading(false);
	
		if (!oData.Result)
		{
	//		App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('WARNING/FETCHER_ADDING_ERROR'));
			App.Api.showErrorByCode(oData.ErrorCode);
		}
		else
		{
			App.populateFetchers();
	
			this.closeCommand();
		}
	};
	
	FetcherAddPopup.prototype.onCancelClick = function ()
	{
		this.closeCommand();
	};
	
	FetcherAddPopup.prototype.onShow = function ()
	{
		this.init();
	};
	
	FetcherAddPopup.prototype.isEmptyRequiredFields = function ()
	{
		switch ('')
		{
			case this.incomingMailServer():
				this.serverIsSelected(true);
				return true;
			case this.incomingMailLogin():
				this.loginIsSelected(true);
				return true;
			case this.incomingMailPassword():
				this.passwordIsSelected(true);
				return true;
			default: return false;
		}
	};
	
	
	
	
	
	/**
	 * @constructor
	 */
	function SystemFoldersPopup()
	{
		this.folders = ko.observable(null);
	
		this.options = ko.computed(function () {
			return this.folders() ? this.folders().getOptions(Utils.i18n('SETTINGS/ACCOUNT_FOLDERS_NO_USAGE_ASSIGNED')) : [];
		}, this);
	
		this.sSentFolderOld = '';
		this.sDraftFolderOld = '';
		this.sSpamFolderOld = '';
		this.sTrashFolderOld = '';
		
		this.sentFolderFullName = ko.observable('');
		this.draftsFolderFullName = ko.observable('');
		this.spamFolderFullName = ko.observable('');
		this.trashFolderFullName = ko.observable('');
	
		this.sentFolderFullName.subscribe(function (sValue) {
			if (this.folders())
			{
				this.folders().sentFolderFullName(sValue);
			}
		}, this);
	
		this.draftsFolderFullName.subscribe(function (sValue) {
			if (this.folders())
			{
				this.folders().draftsFolderFullName(sValue);
			}
		}, this);
	
		this.spamFolderFullName.subscribe(function (sValue) {
			if (this.folders())
			{
				this.folders().spamFolderFullName(sValue);
			}
		}, this);
		
		this.trashFolderFullName.subscribe(function (sValue) {
			if (this.folders())
			{
				this.folders().trashFolderFullName(sValue);
			}
		}, this);
	
		this.defaultOptionsAfterRender = Utils.defaultOptionsAfterRender;
		
		this.allowSpamFolderExtension = ko.computed(function () {
			var oAccount = AppData.Accounts.getEdited();
			return oAccount.extensionExists('AllowSpamFolderExtension');
		}, this);
	}
	
	SystemFoldersPopup.prototype.onShow = function ()
	{
		var oFolders = App.MailCache.editedFolderList();
	
		this.sSentFolderOld = oFolders.sentFolderFullName();
		this.sDraftFolderOld = oFolders.draftsFolderFullName();
		this.sSpamFolderOld = oFolders.spamFolderFullName();
		this.sTrashFolderOld = oFolders.trashFolderFullName();
	
		this.sentFolderFullName(this.sSentFolderOld);
		this.draftsFolderFullName(this.sDraftFolderOld);
		this.spamFolderFullName(this.sSpamFolderOld);
		this.trashFolderFullName(this.sTrashFolderOld);
		
		this.folders(oFolders);
	};
	
	/**
	 * @return {string}
	 */
	SystemFoldersPopup.prototype.popupTemplate = function ()
	{
		return 'Popups_FolderSystemPopupViewModel';
	};
	
	/**
	 * @param {Object} oData
	 */
	SystemFoldersPopup.prototype.onResponseSetupSystemFolders = function (oData)
	{
		if (oData && oData.Result !== false)
		{
			App.MailCache.getFolderList(AppData.Accounts.editedId());
		}
	};
	
	SystemFoldersPopup.prototype.onOKClick = function ()
	{
		var
			oFolders = this.folders(),
			oParameters = {
				'Action': 'SetupSystemFolders',
				'AccountID': AppData.Accounts.editedId(),
				'Sent': oFolders.sentFolderFullName(),
				'Drafts': oFolders.draftsFolderFullName(),
				'Trash': oFolders.trashFolderFullName(),
				'Spam': oFolders.spamFolderFullName()
			}
		;
		
		App.Ajax.send(oParameters, this.onResponseSetupSystemFolders, this);
		
		this.closeCommand();
	};
	
	SystemFoldersPopup.prototype.onCancelClick = function ()
	{
		var oFolders = this.folders();
	
		oFolders.sentFolderFullName(this.sSentFolderOld);
		oFolders.draftsFolderFullName(this.sDraftFolderOld);
		oFolders.spamFolderFullName(this.sSpamFolderOld);
		oFolders.trashFolderFullName(this.sTrashFolderOld);
		
		this.closeCommand();
	};
	
	/**
	 * @constructor
	 */
	function FolderCreatePopup()
	{
		this.folders = App.MailCache.editedFolderList;
	
		this.loading = ko.observable(false);
	
		this.options = ko.computed(function(){
			return this.folders().getOptions(Utils.i18n('SETTINGS/ACCOUNT_FOLDERS_NO_PARENT'), true, false, true);
		}, this);
	
		this.namespace = ko.computed(function(){
			return this.folders().sNamespaceFolder;
		}, this);
		this.parentFolder = ko.observable('');
		this.folderName = ko.observable('');
		this.folderNameFocus = ko.observable(false);
	
		this.defaultOptionsAfterRender = Utils.defaultOptionsAfterRender;
	}
	
	FolderCreatePopup.prototype.onShow = function ()
	{
		this.folderNameFocus(true);
	};
	
	/**
	 * @return {string}
	 */
	FolderCreatePopup.prototype.popupTemplate = function ()
	{
		return 'Popups_FolderCreatePopupViewModel';
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	FolderCreatePopup.prototype.onResponseFolderCreate = function (oData, oParameters)
	{
		this.loading(false);
	
		if (!oData.Result)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('SETTINGS/ACCOUNT_FOLDERS_CANT_CREATE_FOLDER'));
		}
		else
		{
			this.folderName('');
			this.parentFolder('');
			App.MailCache.getFolderList(AppData.Accounts.editedId());
			this.closeCommand();
		}
	};
	
	FolderCreatePopup.prototype.onOKClick = function ()
	{
		var
			parentFolder = (this.parentFolder() === '' ? this.namespace() : this.parentFolder()),
			oParameters = {
				'Action': 'FolderCreate',
				'AccountID': AppData.Accounts.editedId(),
				'FolderNameInUtf8': this.folderName(),
				'FolderParentFullNameRaw': parentFolder,
				'Delimiter': this.folders().delimiter()
			}
		;
	
		this.loading(true);
	
		App.Ajax.send(oParameters, this.onResponseFolderCreate, this);
	};
	
	FolderCreatePopup.prototype.onCancelClick = function ()
	{
		this.closeCommand();
	};
	
	/**
	 * @constructor
	 */
	function ChangePasswordPopup()
	{
		this.currentPassword = ko.observable('');
		this.newPassword = ko.observable('');
		this.confirmPassword = ko.observable('');
		
		this.isHelpdesk = ko.observable(false);
	}
	
	/**
	 * @param {boolean} bHelpdesk
	 */
	ChangePasswordPopup.prototype.onShow = function (bHelpdesk)
	{
		this.isHelpdesk(bHelpdesk);
		
		this.init();
	};
	
	/**
	 * @return {string}
	 */
	ChangePasswordPopup.prototype.popupTemplate = function ()
	{
		return 'Popups_ChangePasswordPopupViewModel';
	};
	
	ChangePasswordPopup.prototype.init = function ()
	{
		this.currentPassword('');
		this.newPassword('');
		this.confirmPassword('');
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	ChangePasswordPopup.prototype.onResponse = function (oData, oParameters)
	{
		if (oData.Result === false)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('SETTINGS/ACCOUNT_PROPERTIES_NEW_PASSWORD_UPDATE_ERROR'));
		}
		else
		{
			App.Api.showReport(Utils.i18n('SETTINGS/ACCOUNT_PROPERTIES_CHANGE_PASSWORD_SUCCESS'));
			this.closeCommand();
			this.init();
		}
	};
	
	ChangePasswordPopup.prototype.onOKClick = function ()
	{
		var oParameters = null;
		
		if (this.confirmPassword() !== this.newPassword())
		{
			App.Api.showError(Utils.i18n('WARNING/PASSWORDS_DO_NOT_MATCH'));
		}
		else
		{
			if (this.isHelpdesk())
			{
				oParameters = {
					'Action': 'HelpdeskUpdateUserPassword',
					'CurrentPassword': this.currentPassword(),
					'NewPassword': this.newPassword()
				};
				App.Ajax.sendExt(oParameters, this.onResponse, this);
			}
			else
			{
				oParameters = {
					'Action': 'UpdateAccountPassword',
					'AccountID': AppData.Accounts.editedId(),
					'CurrentIncomingMailPassword': this.currentPassword(),
					'NewIncomingMailPassword': this.newPassword()
				};
				App.Ajax.send(oParameters, this.onResponse, this);
			}
		}
	};
	
	ChangePasswordPopup.prototype.onCancelClick = function ()
	{
		this.closeCommand();
	};
	
	/**
	 * @constructor
	 */
	function FileStorageFolderCreatePopup()
	{
		this.fCallback = null;
		this.folderName = ko.observable('');
		this.folderNameFocus = ko.observable(false);
	}
	
	/**
	 * @param {Function} fCallback
	 */
	FileStorageFolderCreatePopup.prototype.onShow = function (fCallback)
	{
		this.folderNameFocus(true);
		if (Utils.isFunc(fCallback))
		{
			this.fCallback = fCallback;
		}
	};
	
	/**
	 * @return {string}
	 */
	FileStorageFolderCreatePopup.prototype.popupTemplate = function ()
	{
		return 'Popups_FileStorageFolderCreatePopupViewModel';
	};
	
	FileStorageFolderCreatePopup.prototype.onOKClick = function ()
	{
		if (this.fCallback)
		{
			this.fCallback(this.folderName());
			this.folderName('');
		}
		this.closeCommand();
	};
	
	FileStorageFolderCreatePopup.prototype.onCancelClick = function ()
	{
		this.closeCommand();
	};
	
	/**
	 * @constructor
	 */
	function FileStorageRenamePopup()
	{
		this.fCallback = null;
		this.item = ko.observable(null);
		this.name = ko.observable('');
		this.nameFocus = ko.observable(false);
		
	}
	
	/**
	 * @param {Object} oItem
	 * @param {Function} fCallback
	 */
	FileStorageRenamePopup.prototype.onShow = function (oItem, fCallback)
	{
		this.item = oItem;
		this.name = this.item.nameForEdit;
		this.nameFocus(true);
		if (Utils.isFunc(fCallback))
		{
			this.fCallback = fCallback;
		}
	};
	
	/**
	 * @return {string}
	 */
	FileStorageRenamePopup.prototype.popupTemplate = function ()
	{
		return 'Popups_FileStorageRenamePopupViewModel';
	};
	
	FileStorageRenamePopup.prototype.onOKClick = function ()
	{
		if (this.fCallback)
		{
			this.fCallback(this.item);
		}
		this.closeCommand();
	};
	
	/**
	 *
	 */
	FileStorageRenamePopup.prototype.onCancelClick = function ()
	{
		this.closeCommand();
	};
	
	/**
	 * @constructor
	 */
	function FileStorageSharePopup()
	{
		this.item = null;
		this.pub = ko.observable('');
		this.pubFocus = ko.observable(false);
	}
	
	/**
	 * @param {Object} oItem
	 */
	FileStorageSharePopup.prototype.onShow = function (oItem)
	{
		this.item = oItem;
		
		this.pub('');
			
		App.Ajax.send({
				'Action': 'FilesMin',
				'Account': AppData.Accounts.defaultId(),
				'Type': oItem.storageType(),
				'Path': oItem.path(),
				'Name': oItem.name(),
				'Size': oItem.size()
			}, this.onFilesMinResponse, this
		);
	
	
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	FileStorageSharePopup.prototype.onFilesMinResponse = function (oData, oParameters)
	{
		if (oData.Result)
		{
			var sUrl = AppData.App.ServerUseUrlRewrite ? 'share/' : '?/Min/Share/';
	
	                this.pub(Utils.getAppPath() + sUrl + oData.Result);
			this.pubFocus(true);
			this.item.shared(true);
		}
	};
	
	/**
	 * @return {string}
	 */
	FileStorageSharePopup.prototype.popupTemplate = function ()
	{
		return 'Popups_FileStorageSharePopupViewModel';
	};
	
	FileStorageSharePopup.prototype.onOKClick = function ()
	{
		this.closeCommand();
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	FileStorageSharePopup.prototype.onFilesMinDeleteResponse = function (oData, oParameters)
	{
		this.closeCommand();
	};
	
	FileStorageSharePopup.prototype.onCancelSharingClick = function ()
	{
		if (this.item)
		{
			App.Ajax.send({
					'Action': 'FilesMinDelete',
					'Account': AppData.Accounts.defaultId(),
					'Type': this.item.storageType(),
					'Path': this.item.path(),
					'Name': this.item.name()
				}, this.onFilesMinDeleteResponse, this);
			this.item.shared(false);
		}
	};
	
	/**
	 * @constructor
	 */
	function CalendarCreatePopup()
	{
		this.fCallback = null;
		
		this.calendarId = ko.observable(null);
		this.calendarName = ko.observable('');
		this.calendarDescription = ko.observable('');
		
		this.calendarNameFocus = ko.observable(false);
		this.calendarDescriptionFocus = ko.observable(false);
		
		this.colors = ko.observableArray([]);
		this.selectedColor = ko.observable(this.colors()[0]);
	}
	
	CalendarCreatePopup.prototype.clearFields = function ()
	{
		this.calendarName('');
		this.calendarDescription('');
		this.selectedColor(this.colors[0]);
		this.calendarId(null);
	};
	
	/**
	 * @param {Function} fCallback
	 * @param {Array} aColors
	 * @param {Object} oCalendar
	 */
	CalendarCreatePopup.prototype.onShow = function (fCallback, aColors, oCalendar)
	{
		this.clearFields();
		if (Utils.isFunc(fCallback))
		{
			this.fCallback = fCallback;
		}
		if (!Utils.isUnd(aColors))
		{
			this.colors(aColors);
			this.selectedColor(aColors[0]);		
		}
		if (!Utils.isUnd(oCalendar))
		{
			this.calendarName(oCalendar.name ? oCalendar.name() : '');
			this.calendarDescription(oCalendar.description ? oCalendar.description() : '');
			this.selectedColor(oCalendar.color ? oCalendar.color() : '');
			this.calendarId(oCalendar.id ? oCalendar.id : null);
		}
	};
	
	/**
	 * @return {string}
	 */
	CalendarCreatePopup.prototype.popupTemplate = function ()
	{
		return 'Popups_CalendarCreatePopupViewModel';
	};
	
	CalendarCreatePopup.prototype.onSaveClick = function ()
	{
		if (this.calendarName() === '')
		{
			App.Screens.showPopup(AlertPopup, [Utils.i18n('CALENDAR/WARNING_BLANK_CALENDAR_NAME')]);
		}
		else
		{
			if (this.fCallback)
			{
				this.fCallback(this.calendarName(), this.calendarDescription(), this.selectedColor(), this.calendarId());
				this.clearFields();
			}
			this.closeCommand();
		}
	};
	
	CalendarCreatePopup.prototype.onCancelClick = function ()
	{
		this.closeCommand();
	};
	/**
	 * @constructor
	 */
	function CalendarSharePopup()
	{
		this.defaultAccount = AppData.Accounts.getDefault();
	
		this.fCallback = null;
	
		this.calendarId = ko.observable(null);
		this.selectedColor = ko.observable('');
		this.calendarUrl = ko.observable('');
		this.exportUrl = ko.observable('');
		this.icsLink = ko.observable('');
		this.isPublic = ko.observable(false);
		this.shares = ko.observableArray([]);
		this.oldShares = ko.observableArray([]);
		this.owner = ko.observable('');
	
		this.recivedAnim = ko.observable(false).extend({'autoResetToFalse': 500});
		this.whomAnimate = ko.observable('');
	
		this.shareAutocompleteItem = ko.observable(null);
		this.shareAutocompleteItem.subscribe(function (oItem) {
			if (oItem) { this.setGlobal(oItem.email, this.newShareList()); }
		}, this);
	
		this.newShareList = ko.observableArray([]);
		this.newShare = ko.observable('');
		this.newShareFocus = ko.observable(false);
		this.newShareAccess = ko.observable(2);
		this.canAdd = ko.observable(false);
		this.aAccess = [
			{'value': Enums.CalendarAccess.Read, 'display': Utils.i18n('CALENDAR/CALENDAR_ACCESS_READ')},
			{'value': Enums.CalendarAccess.Write, 'display': Utils.i18n('CALENDAR/CALENDAR_ACCESS_WRITE')}
		];
	
		this.autocompleteCallbackBinded = _.bind(this.autocompleteCallback, this);
	}
	
	/**
	 * @param {Function} fCallback
	 * @param {Object} oCalendar
	 */
	CalendarSharePopup.prototype.onShow = function (fCallback, oCalendar)
	{
		if (Utils.isFunc(fCallback))
		{
			this.fCallback = fCallback;
		}
		if (!Utils.isUnd(oCalendar))
		{
			this.selectedColor(oCalendar.color());
			this.calendarId(oCalendar.id);
			this.calendarUrl(oCalendar.davUrl() + oCalendar.url());
			this.exportUrl(oCalendar.exportUrl());
			this.icsLink(oCalendar.davUrl() + oCalendar.url() + '?export');
			this.isPublic(oCalendar.isPublic());
			this.shares(oCalendar.shares().slice(0));
			this.oldShares(oCalendar.shares().slice(0));
			this.owner(oCalendar.owner());
		}
	};
	
	/**
	 * @return {string}
	 */
	CalendarSharePopup.prototype.popupTemplate = function ()
	{
		return 'Popups_CalendarSharePopupViewModel';
	};
	
	CalendarSharePopup.prototype.onSaveClick = function ()
	{
		if (this.fCallback)
		{
			this.addShare();
			this.fCallback(this.calendarId(), this.isPublic(), this.shares());
		}
		this.closePopup();
	};
	
	CalendarSharePopup.prototype.onCancelClick = function ()
	{
		this.shares(this.oldShares());
		this.closePopup();
	};
	
	CalendarSharePopup.prototype.closePopup = function ()
	{
		this.cleanAll();
	
		this.closeCommand();
	};
	
	CalendarSharePopup.prototype.cleanAll = function ()
	{
		this.newShare('');
		this.newShareAccess(2);
		this.shareAutocompleteItem(null);
		this.canAdd(false);
	};
	
	CalendarSharePopup.prototype.addShare = function ()
	{
		var sEmail = this.shareAutocompleteItem() ? this.shareAutocompleteItem().email : this.newShare();
	
		if (this.canAdd())
		{
			this.shares.push(
				{
					name: this.shareAutocompleteItem() ? this.shareAutocompleteItem().name : '',
					email: sEmail,
					access: this.newShareAccess()
				});
	
			this.cleanAll();
		}
		else
		{
			this.whomAnimate(sEmail);
			this.recivedAnim(true);
		}
	};
	
	/**
	 * @param {Object} oItem
	 */
	CalendarSharePopup.prototype.removeShare = function (oItem)
	{
		this.shares.remove(oItem);
	};
	
	/**
	 * @param {string} sTerm
	 * @param {Function} fResponse
	 */
	CalendarSharePopup.prototype.autocompleteCallback = function (sTerm, fResponse)
	{
		var oParameters = {
				'Action': 'ContactSuggestions',
				'Search': sTerm,
				'GlobalOnly': '1'
			}
		;
	
		this.shareAutocompleteItem(null);
	
		sTerm = Utils.trim(sTerm);
		if ('' !== sTerm)
		{
			App.Ajax.send(oParameters, function (oData) {
				var aList = [];
				if (oData && oData.Result && oData.Result && oData.Result.List)
				{
					aList = _.map(oData.Result.List, function (oItem) {
						/*return oItem && oItem.Email ? oItem.Email : '';*/
						/*return oItem && oItem.Email ?
							(oItem.Name && 0 < Utils.trim(oItem.Name).length ?
								'"' + oItem.Name + '" <' + oItem.Email + '>' : oItem.Email) : '';*/
						return oItem && oItem.Email && oItem.Email !== this.owner() ?
							(oItem.Name && 0 < Utils.trim(oItem.Name).length ?
							{value:'"' + oItem.Name + '" <' + oItem.Email + '>', name: oItem.Name, email: oItem.Email} : {value: oItem.Email, name: '', email: oItem.Email}) : null;
					}, this);
	
					aList = _.compact(aList);
	
					this.newShareList(aList);
	
					this.setGlobal(this.newShare(), aList);
				}
				fResponse(aList);
			}, this);
		}
		else
		{
			fResponse([]);
		}
	};
	
	/**
	 * @param {string} sText
	 * @param {Array} aList
	 */
	CalendarSharePopup.prototype.setGlobal = function (sText, aList)
	{
		var
			isInGlobal = _.any(aList, function (sItem) {
				return sItem.email === sText;
			}, this),
			isAlreadyAdded = _.any(this.shares(), function (sItem) {
				return sItem.email === sText;
			}, this)
		;
	
		this.canAdd(isInGlobal && !isAlreadyAdded);
	};
	/**
	 * @constructor
	 */
	function CalendarGetLinkPopup()
	{
		this.fCallback = null;
	
		this.calendarId = ko.observable(null);
		this.selectedColor = ko.observable('');
		this.calendarUrl = ko.observable('');
		this.exportUrl = ko.observable('');
		this.icsLink = ko.observable('');
		this.isPublic = ko.observable(false);
		this.pubUrl = ko.observable('');
	}
	
	/**
	 * @param {Function} fCallback
	 * @param {Object} oCalendar
	 */
	CalendarGetLinkPopup.prototype.onShow = function (fCallback, oCalendar)
	{
		if (Utils.isFunc(fCallback))
		{
			this.fCallback = fCallback;
		}
		if (!Utils.isUnd(oCalendar))
		{
			this.selectedColor(oCalendar.color());
			this.calendarId(oCalendar.id);
			this.calendarUrl(oCalendar.davUrl() + oCalendar.url());
			this.exportUrl(oCalendar.exportUrl());
			this.icsLink(oCalendar.davUrl() + oCalendar.url() + '?export');
			this.isPublic(oCalendar.isPublic());
			this.pubUrl(oCalendar.pubUrl());
			this.exportUrl(oCalendar.exportUrl());
		}
	};
	
	/**
	 * @return {string}
	 */
	CalendarGetLinkPopup.prototype.popupTemplate = function ()
	{
		return 'Popups_CalendarGetLinkPopupViewModel';
	};
	
	CalendarGetLinkPopup.prototype.onCancelClick = function ()
	{
		if (this.fCallback)
		{
			this.fCallback(this.calendarId(), this.isPublic());
		}
		this.closeCommand();
	};
	/**
	 * @constructor
	 */
	function CalendarCreateEventPopup()
	{
		this.defaultAccount = (AppData.Accounts) ? AppData.Accounts.getDefault() : null;
	
		this.modified = false;
		this.isPublic = bExtApp;
		this.isEditable = ko.observable(false);
		this.selectedCalendarIsShared = ko.observable(false);
		this.selectedCalendarIsEditable = ko.observable(false);
	
		this.callbackSave = null;
		this.callbackDelete = null;
		this.timeFormatMoment = 'HH:mm';
		this.dateFormatMoment = 'MM/DD/YYYY';
		this.dateFormatDatePicker = 'mm/dd/yy';
	
		this.calendarId = ko.observable(null);
		this.id = ko.observable(null);
		this.uid = ko.observable(null);
		this.recurrenceId = ko.observable(null);
		this.allEvents = ko.observable(Enums.CalendarEditRecurrenceEvent.AllEvents);
	
		this.isMyEvent = ko.observable(false);
	
		this.startDom = ko.observable(null);
		this.endDom = ko.observable(null);
		this.repeatEndDom = ko.observable(null);
	
		this.yearlyDate = ko.observable('');
		this.monthlyDate = ko.observable('');
	
		this.subject = ko.observable('');
		this.description = ko.observable('');
	
		this.startDate = ko.observable('');
		this.startTime = ko.observable('');
		this.startTime.subscribe(function () {
			this.selectStartDate();
		}, this);
		this.allDay = ko.observable(false);
		this.allDay.subscribe(function (arg) {
			if(!arg)
			{
				this.setActualTime();
			}
		}, this);
	
		this.endDate = ko.observable('');
		this.endTime = ko.observable('');
		this.endTime.subscribe(function () {
			this.selectEndDate();
		}, this);
	
		this.repeatEndDate = ko.observable('');
	
		this.isEvOneDay = ko.observable(true);
		this.isEvOneTime = ko.observable(true);
	
		this.isRepeat = ko.observable(false);
	
		this.location = ko.observable('');
	
		this.repeatPeriodOptions = ko.observableArray(this.getDisplayedPeriods());
		this.repeatWeekIntervalOptions = ko.observableArray([1, 2, 3, 4]);
		this.repeatMonthIntervalOptions = ko.observableArray(this.getDisplayedIntervals());
		this.alarmOptions = ko.observableArray(this.getDisplayedAlarms([5, 10, 15, 30, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720, 1080, 1440, 2880, 4320, 5760, 10080, 20160])); // available minutes array
		this.timeOptions = ko.observableArray(this.getDisplayedTimes((AppData.User.defaultTimeFormat() === Enums.TimeFormat.F24) ? 'HH:mm' : 'hh:mm A'));
		/*AppData.User.defaultTimeFormat.subscribe(function (iTimeFormat) {
			this.timeOptions(this.getDisplayedTimes((iTimeFormat === Enums.TimeFormat.F24) ? 'HH:mm' : 'hh:mm A'))
		}, this);*/
	
		this.displayedAlarms = ko.observableArray([]);
		this.displayedAlarms.subscribe(function (arg) {
			this.disableAlarms();
		}, this);
	
		this.excluded = ko.observable(false);
		this.repeatPeriod = ko.observable(0);
		this.repeatPeriod.subscribe(function (arg) {
			this.isRepeat(!!arg);
		}, this);
		this.repeatInterval = ko.observable(1);
		this.repeatEnd = ko.observable(0);
		this.repeatCount = ko.observable(null);
		this.repeatWeekNum = ko.observable(null);
	
		this.weekDays = ko.observable(false);
		this.weekMO = ko.observable(false);
		this.weekTU = ko.observable(false);
		this.weekWE = ko.observable(false);
		this.weekTH = ko.observable(false);
		this.weekFR = ko.observable(false);
		this.weekSA = ko.observable(false);
		this.weekSU = ko.observable(false);
	
		this.appointment = ko.observable(false);
		this.attendees = ko.observableArray([]);
		this.attenderStatus = ko.observable(0);
		this.owner = ko.observable('');
		this.ownerName = ko.observable('');
		this.ownerDisplay = ko.computed(function(){
			return (this.ownerName() !== '') ? this.ownerName() : this.owner();
		}, this);
	
		this.recivedAnim = ko.observable(false).extend({'autoResetToFalse': 500});
		this.whomAnimate = ko.observable('');
		this.guestAutocompleteItem = ko.observable(null);
		this.guestAutocomplete = ko.observable('');
		this.guestEmailFocus = ko.observable(false);
		this.guestAutocomplete.subscribe(function (sItem) {
			if (sItem === '')
			{
				this.guestAutocompleteItem(null);
			}
		}, this);
	
		this.condition = ko.observable('');
	
		this.autosizeTrigger = ko.observable(true);
	
		this.calendars = null;
		this.visibleCalendarList = ko.observable(false);
		this.calendarsList = ko.observableArray([]);
		this.calendarsList.subscribe(function () {
			if (this.calendars && this.calendars.count() > 1)
			{
				this.visibleCalendarList(true);
			}
			else
			{
				this.visibleCalendarList(false);
			}
		}, this);
		this.calendarColor = ko.observable('');
		this.selectedCalendar = ko.observable('');
		this.selectedCalendarName = ko.observable('');
		this.selectedCalendar.subscribe(function (sValue) {
			if (sValue)
			{
				var oCalendar = this.calendars.getCalendarById(sValue);
				
				this.selectedCalendarName(oCalendar.name());
				this.selectedCalendarIsShared(oCalendar.isShared);
				this.visibleCalendarList(oCalendar.isEditable());
				this.selectedCalendarIsEditable(oCalendar.isEditable());
				this.changeCalendarColor(sValue);
			}
		}, this);
		
		this.subjectFocus = ko.observable(false);
		this.subjectFocus.subscribe(function (sValue) {
	
		}, this);
		this.descriptionFocus = ko.observable(false);
		this.locationFocus = ko.observable(false);
	
		this.dateEdit = ko.observable(false);
		this.repeatEdit = ko.observable(false);
		this.guestsEdit = ko.observable(false);
		this.defaultOptionsAfterRender = Utils.defaultOptionsAfterRender;
		this.isEditForm = ko.computed(function(){
			return !!this.id();
		}, this);
	
		this.callbackAttendeeActionDecline = null;
	
		this.calendarAppointments = AppData.User.AllowCalendar && AppData.User.CalendarAppointments;
	
		this.allChanges = ko.computed(function() {
			this.subject();
			this.description();
			this.location();
			this.isRepeat();
			this.allDay();
			this.repeatPeriod();
			this.repeatInterval();
			this.repeatEnd();
			this.repeatCount();
			this.repeatWeekNum();
			this.startDate();
			this.startTime();
			this.endDate();
			this.repeatEndDate();
			this.displayedAlarms();
			this.weekDays();
			this.weekMO();
			this.weekTU();
			this.weekWE();
			this.weekTH();
			this.weekFR();
			this.weekSA();
			this.weekSU();
			this.attendees();
			this.selectedCalendar();
	
			this.modified = true;
		}, this);
	
	}
	
	/**
	 * @param {Object} oElement
	 * @param {Function} fSelect
	 */
	CalendarCreateEventPopup.prototype.createDatePickerObject = function (oElement, fSelect)
	{
		$(oElement).datepicker({
			showOtherMonths: true,
			selectOtherMonths: true,
			monthNames: Utils.getMonthNamesArray(),
			dayNamesMin: Utils.i18n('DATETIME/DAY_NAMES_MIN').split(' '),
			firstDay: AppData.User.CalendarWeekStartsOn,
			showOn: "both",
			buttonText: "",
			buttonImage: "skins/Default/images/calendar-icon.png",
			buttonImageOnly: true,
			dateFormat: this.dateFormatDatePicker,
			onSelect: fSelect
		});
	
		$(oElement).mousedown(function() {
			$('#ui-datepicker-div').toggle();
		});
	};
	
	
	CalendarCreateEventPopup.prototype.initializeDatePickers = function ()
	{
		this.createDatePickerObject(this.startDom(), this.selectStartDate.bind(this));
		this.createDatePickerObject(this.endDom(), this.selectEndDate.bind(this));
		this.createDatePickerObject(this.repeatEndDom(), Utils.emptyFunction());
	};
	
	/**
	 * @param {Object} oParameters
	 */
	CalendarCreateEventPopup.prototype.onShow = function (oParameters)
	{
		var
			oAccount = this.defaultAccount,
			owner = (oAccount) ? oAccount.email() : '',
			ownerName = (oAccount) ? oAccount.friendlyName() : ''
		;
	
		this.isMyEvent(owner === (oParameters.Owner || owner));
	
		this.callbackSave = oParameters.CallbackSave;
		this.callbackDelete = oParameters.CallbackDelete;
		this.callbackAttendeeActionDecline = oParameters.CallbackAttendeeActionDecline;
	
		this.timeFormatMoment = oParameters.TimeFormat;
		this.dateFormatMoment = Utils.getDateFormatForMoment(oParameters.DateFormat);
		this.dateFormatDatePicker = Utils.getDateFormatForDatePicker(oParameters.DateFormat);
		
		this.initializeDatePickers();
	
		this.startDate(oParameters.StartMoment.format(this.dateFormatMoment));
		this.startDom().datepicker("setDate", oParameters.StartMoment.toDate());
		this.startTime(oParameters.StartMoment.format(this.timeFormatMoment));
	
		this.endDate(oParameters.EndMoment ? oParameters.EndMoment.format(this.dateFormatMoment) : this.startDate());
		this.endDom().datepicker("setDate", oParameters.EndMoment ? oParameters.EndMoment.toDate() : oParameters.StartMoment.toDate());
		this.endTime(oParameters.EndMoment ? oParameters.EndMoment.format(this.timeFormatMoment) : this.startTime());
	
		this.allDay(oParameters.AllDay);
	
		this.calendars = oParameters.Calendars;
		if (this.calendars)
		{
			this.calendarsList(this.calendars.collection);
		}
		this.selectedCalendar(oParameters.SelectedCalendar);
		this.calendarId(this.selectedCalendar());
		this.editableSwitch(this.selectedCalendarIsShared(), this.selectedCalendarIsEditable(), this.isMyEvent());
	
		this.changeCalendarColor(this.selectedCalendar());
		
		// parameters for event editing only (not for creating)
		this.id(oParameters.ID || null);
		this.uid(oParameters.Uid || null);
		this.recurrenceId(oParameters.RecurrenceId || null);
		
		this.subject(oParameters.Subject || '');
		this.location(oParameters.Location || '');
		this.description(oParameters.Description || '');
		this.allEvents(oParameters.AllEvents || Enums.CalendarEditRecurrenceEvent.AllEvents);
	
		this.displayedAlarms(this.getDisplayedAlarms(oParameters.Alarms || []));
	
		this.appointment(oParameters.Appointment);
	
		this.attendees(oParameters.Attendees || []);
		this.setCurrentAttenderStatus(owner, oParameters.Attendees || []);
	
		this.owner(oParameters.Owner || owner);
		this.ownerName(oParameters.OwnerName || ownerName);
	/*	
		if (oParameters.OwnerName === '')
		{
			this.ownerName(oParameters.OwnerName);
		}
		else
		{
			this.ownerName(ownerName);
		}
	*/	
		this.guestAutocomplete('');
	
		this.excluded(oParameters.Excluded || false);
		this.repeatRuleParse(oParameters.RRule || null);
	
		if (this.id() === null) {
			this.subjectFocus(true);
		}
	
		this.selectStartDate();
		this.selectEndDate();
	
		this.autosizeTrigger.notifySubscribers(true);
		
		this.modified = false;
	};
	
	/**
	 * @return {string}
	 */
	CalendarCreateEventPopup.prototype.popupTemplate = function ()
	{
		return 'Popups_CalendarCreateEventPopupViewModel';
	};
	
	/**
	 * @param {string} sId
	 */
	CalendarCreateEventPopup.prototype.changeCalendarColor = function (sId)
	{
		if (Utils.isFunc(this.calendars.getCalendarById))
		{
			var oCalendar = this.calendars.getCalendarById(sId);
			if (oCalendar)
			{
				this.calendarColor('');
				this.calendarColor(oCalendar.color());
			}
		}
	};
	
	/**
	 * @param {string} sId
	 */
	CalendarCreateEventPopup.prototype.isVisibleCalendarListItem = function (sId)
	{
		var 
			bResult = false,
			oCalendar = this.calendars.getCalendarById(sId)
		;
		if (oCalendar)
		{
			bResult = (this.selectedCalendar() !== sId && oCalendar.isEditable());
		}
		return bResult;
	};
	
	CalendarCreateEventPopup.prototype.onSaveClick = function ()
	{
		if (this.subject() === '')
		{
			App.Screens.showPopup(AlertPopup, [Utils.i18n('CALENDAR/WARNING_EVENT_BLANK_SUBJECT'),
				_.bind(function () {
					this.subjectFocus(true);
				}, this)]);
		}
		else
		{
			if (this.callbackSave)
			{
				var
					iPeriod = this.repeatPeriod(),
					sDate = '',
					oDate = null,
					iInterval = 0,
					iWeekNum = 0,
					iEnd = 0,
					oEventData = {
						calendarId: this.calendarId(),
						newCalendarId: this.selectedCalendar(),
						id: this.id(),
						uid: this.uid(),
						recurrenceId: this.recurrenceId(),
						allEvents:  this.allEvents(),
						subject: this.subject(),
						title: Utils.getTitleForEvent(this.subject()),
						start: this.getDateFromStr(this.startDate(), this.startTime()),
						end: this.getDateFromStr(this.endDate(), this.endTime()),
						allDay: this.allDay(),
						location: this.location(),
						description: this.description(),
						alarms: this.getAlarmsArray(this.displayedAlarms()),
						attendees: this.attendees(),
						owner: this.owner(),
						modified: this.modified
					}
				;
	
				if (iPeriod)
				{
					sDate = this.repeatEndDom().datepicker('getDate');
					oDate = sDate ? this.getUnixTimestamp(sDate) : null;
	
					iInterval = this.repeatInterval();
					iWeekNum = this.repeatWeekNum();
					iEnd = this.repeatEnd();
	
					if (iPeriod === Enums.CalendarRepeatPeriod.Daily)
					{
						oEventData.rrule = {
							byDays: [],
							count: null,
							end: 2,
							interval: 1,
							period: iPeriod,
							until: oDate,
							weekNum: null
						};
					}
					else if (iPeriod === Enums.CalendarRepeatPeriod.Weekly)
					{
						oEventData.rrule = {
							byDays: this.getDays(),
							count: null,
							end: 0,
							interval: iInterval,
							period: iPeriod,
							until: null,
							weekNum: null
						};
					}
					else if (iPeriod === Enums.CalendarRepeatPeriod.Monthly)
					{
						oEventData.rrule = {
							byDays: [],
							count: null,
							end: 0,
							interval: 1,
							period: iPeriod,
							until: null,
							weekNum: null
						};
					}
					else if (iPeriod === Enums.CalendarRepeatPeriod.Yearly)
					{
						oEventData.rrule = {
							byDays: [],
							count: null,
							end: 0,
							interval: 1,
							period: iPeriod,
							until: null,
							weekNum: null
						};
					}
				}
	
				this.callbackSave(oEventData);
			}
	
			this.closePopup();
		}
	};
	
	CalendarCreateEventPopup.prototype.closePopup = function ()
	{
		this.hideAll();
		this.cleanAll();
	
		this.closeCommand();
	};
	
	CalendarCreateEventPopup.prototype.hideAll = function ()
	{
		this.dateEdit(false);
		this.repeatEdit(false);
		this.guestsEdit(false);
	};
	
	CalendarCreateEventPopup.prototype.cleanAll = function ()
	{
		this.repeatPeriod(0);
		this.repeatInterval(1);
	//	this.repeatUntil(null);
		this.repeatEnd(0);
		this.repeatCount(null);
		this.repeatWeekNum(null);
		this.weekDays(false);
		this.weekMO(false);
		this.weekTU(false);
		this.weekWE(false);
		this.weekTH(false);
		this.weekFR(false);
		this.weekSA(false);
		this.weekSU(false);
	
		this.attendees([]);
	};
	
	CalendarCreateEventPopup.prototype.onDeleteClick = function ()
	{
		if (this.callbackDelete)
		{
			var
				oEventData = {
					calendarId: this.selectedCalendar(),
					id: this.id(),
					uid: this.uid(),
					recurrenceId: this.recurrenceId(),
					allEvents:  this.allEvents(),
					subject: this.subject(),
					title: Utils.getTitleForEvent(this.subject()),
					start: this.getDateFromStr(this.startDate(), this.startTime()),
					end: this.getDateFromStr(this.endDate(), this.endTime()),
					allDay: this.allDay(),
					location: this.location(),
					description: this.description()
				}
			;
	
			this.callbackDelete(oEventData);
		}
		this.closePopup();
	};
	
	/**
	 * @param {Object} oModel
	 * @param {Object} oEv
	 */
	CalendarCreateEventPopup.prototype.showDates = function (oModel, oEv)
	{
		oEv.stopPropagation();
		this.dateEdit(!this.dateEdit());
	};
	
	CalendarCreateEventPopup.prototype.showGuests = function ()
	{
		if (this.attendees().length > 0)
		{
			var
				sConfirm = Utils.i18n('CALENDAR/CONFIRM_CLOSE_ATTENDEERS'),
				fAction = _.bind(function (bResult) {
					if (bResult)
					{
						this.guestsEdit(false);
						this.guestEmailFocus(false);
						this.attendees([]);
					}
				}, this)
			;
	
			App.Screens.showPopup(ConfirmPopup, [sConfirm, fAction]);
	
		}
		else
		{
			this.guestsEdit(!this.guestsEdit());
			this.guestEmailFocus(!this.guestEmailFocus());
		}
	};
	
	CalendarCreateEventPopup.prototype.onAddGuestClick = function ()
	{
		var
			oGuestAutocompleteItem = this.guestAutocompleteItem(),
			sGuestAutocomplete = this.guestAutocomplete(),
			oItem = oGuestAutocompleteItem || {name: '', email: sGuestAutocomplete},
			bIsInvited = _.any(this.attendees(), function (oEl) {
				return oEl.email === oItem.email;
			})
		;
	
		if (oItem.email === '')
		{
			App.Api.showErrorByCode(0, Utils.i18n('CALENDAR/EVENT_ERROR_ENTER_EMAIL'));
		}
		else if (oItem.email === this.owner())
		{
			this.recivedAnim(true);
		}
		else if (bIsInvited)
		{
			this.recivedAnim(true);
		}
	//	else if (!(/^([a-z0-9_\-]+\.)*[a-z0-9_\-]+@[a-z0-9_\-]+(\.[a-z0-9_\-]+)*\.[a-z]{2,6}$/).test(oItem.email))
	//	else if (!(/^([a-z0-9_\-]+\.)*[a-z0-9_\-]+@[a-z0-9_\-]+(\.[a-z0-9_\-]+)*/).test(oItem.email))
	//	{
	//		App.Api.showErrorByCode(0, Utils.i18n('CALENDAR/EVENT_ERROR_CORRECT_EMAIL'));
	//	}
		else
		{
			this.attendees.push(
				{
					status: 0,
					name: oItem.name,
					email: oItem.email
				}
			);
		}
	
		this.whomAnimate(oItem.email);
		this.guestAutocomplete('');
	};
	
	/**
	 * @param {Array} aMinutes
	 */
	CalendarCreateEventPopup.prototype.getDisplayedAlarms = function (aMinutes)
	{
		var
			alarm,
			sText,
			aDisplayedAlarms = []
		;
	
		_.each(aMinutes, function(iMinutes, iIdx)
		{
			alarm = this['alarm' + iMinutes] = ko.observable(iMinutes);
			alarm.subscribe(function() {
				//alarm observable value not actual
				this.disableAlarms();
			}, this);
	
			if (iMinutes > 0 && iMinutes < 60)
			{
				sText = (Utils.i18n('CALENDAR/ALARM_MINUTES_PLURAL', {
					'COUNT' :iMinutes
				}, null, iMinutes));
			}
			else if (iMinutes >= 60 && iMinutes < 1440)
			{
				sText = (Utils.i18n('CALENDAR/ALARM_HOURS_PLURAL', {
					'COUNT' :iMinutes/60
				}, null, iMinutes/60));
			}
			else if (iMinutes >= 1440 && iMinutes < 10080)
			{
				sText = (Utils.i18n('CALENDAR/ALARM_DAYS_PLURAL', {
					'COUNT' :iMinutes/1440
				}, null, iMinutes/1440));
			}
			else
			{
				sText = (Utils.i18n('CALENDAR/ALARM_WEEKS_PLURAL', {
					'COUNT' :iMinutes/10080
				}, null, iMinutes/10080));
			}
	
			aDisplayedAlarms.push({
				'value':iMinutes,
				'alarm': alarm,
				'text': sText,
				'isDisabled': false
			});
	
		}, this);
	
		return aDisplayedAlarms;
	};
	
	CalendarCreateEventPopup.prototype.getDisplayedPeriods = function ()
	{
		return [
			{
				label: Utils.i18n('CALENDAR/EVENT_REPEAT_NEVER'),
				value: 0
			},
			{
				label: Utils.i18n('CALENDAR/EVENT_REPEAT_DAILY'),
				value: 1
			},
			{
				label: Utils.i18n('CALENDAR/EVENT_REPEAT_WEEKLY'),
				value: 2
			},
			{
				label: Utils.i18n('CALENDAR/EVENT_REPEAT_MONTHLY'),
				value: 3
			},
			{
				label: Utils.i18n('CALENDAR/EVENT_REPEAT_YEARLY'),
				value: 4
			}
		];
	};
	
	CalendarCreateEventPopup.prototype.getDisplayedIntervals = function ()
	{
		var
			i = 1,
			aDisplayedIntervals = []
		;
	
		for (; i <= 30; i++ )
		{
			aDisplayedIntervals.push(
				{
					label: i + Utils.i18n('th'),
					value: i
				}
			);
		}
	
		return aDisplayedIntervals;
	};
	
	CalendarCreateEventPopup.prototype.getDisplayedTimes = function (sTimeFormatMoment)
	{
		var aDisplayedTimes = [];
	
		switch (sTimeFormatMoment)
		{
			case 'HH:mm':
				aDisplayedTimes = [{'value':'12:00','text':'12:00'},{'value':'12:30','text':'12:30'},{'value':'13:00','text':'13:00'},{'value':'13:30','text':'13:30'},{'value':'14:00','text':'14:00'},{'value':'14:30','text':'14:30'},{'value':'15:00','text':'15:00'},{'value':'15:30','text':'15:30'},{'value':'16:00','text':'16:00'},{'value':'16:30','text':'16:30'},{'value':'17:00','text':'17:00'},{'value':'17:30','text':'17:30'},{'value':'18:00','text':'18:00'},{'value':'18:30','text':'18:30'},{'value':'19:00','text':'19:00'},{'value':'19:30','text':'19:30'},{'value':'20:00','text':'20:00'},{'value':'20:30','text':'20:30'},{'value':'21:00','text':'21:00'},{'value':'21:30','text':'21:30'},{'value':'22:00','text':'22:00'},{'value':'22:30','text':'22:30'},{'value':'23:00','text':'23:00'},{'value':'23:30','text':'23:30'},{'value':'00:00','text':'00:00'},{'value':'00:30','text':'00:30'},{'value':'01:00','text':'01:00'},{'value':'01:30','text':'01:30'},{'value':'02:00','text':'02:00'},{'value':'02:30','text':'02:30'},{'value':'03:00','text':'03:00'},{'value':'03:30','text':'03:30'},{'value':'04:00','text':'04:00'},{'value':'04:30','text':'04:30'},{'value':'05:00','text':'05:00'},{'value':'05:30','text':'05:30'},{'value':'06:00','text':'06:00'},{'value':'06:30','text':'06:30'},{'value':'07:00','text':'07:00'},{'value':'07:30','text':'07:30'},{'value':'08:00','text':'08:00'},{'value':'08:30','text':'08:30'},{'value':'09:00','text':'09:00'},{'value':'09:30','text':'09:30'},{'value':'10:00','text':'10:00'},{'value':'10:30','text':'10:30'},{'value':'11:00','text':'11:00'},{'value':'11:30','text':'11:30'}];
	//			aDisplayedTimes = function() {
	//				var sStartTime = '12:00'
	//			};
				break;
			case 'hh:mm A':
	//			aDisplayedTimes = ['12:00 AM', '12:30 AM', '01:00 AM', '01:30 AM', '02:00 AM', '02:30 AM', '03:00 AM', '03:30 AM', '04:00 AM', '04:30 AM', '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00', '12:30', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'];
				aDisplayedTimes = [{'value':'12:00 AM','text':'12:00 AM'},{'value':'12:30 AM','text':'12:30 AM'},{'value':'01:00 AM','text':'01:00 AM'},{'value':'01:30 AM','text':'01:30 AM'},{'value':'02:00 AM','text':'02:00 AM'},{'value':'02:30 AM','text':'02:30 AM'},{'value':'03:00 AM','text':'03:00 AM'},{'value':'03:30 AM','text':'03:30 AM'},{'value':'04:00 AM','text':'04:00 AM'},{'value':'04:30 AM','text':'04:30 AM'},{'value':'05:00 AM','text':'05:00 AM'},{'value':'05:30 AM','text':'05:30 AM'},{'value':'06:00 AM','text':'06:00 AM'},{'value':'06:30 AM','text':'06:30 AM'},{'value':'07:00 AM','text':'07:00 AM'},{'value':'07:30 AM','text':'07:30 AM'},{'value':'08:00 AM','text':'08:00 AM'},{'value':'08:30 AM','text':'08:30 AM'},{'value':'09:00 AM','text':'09:00 AM'},{'value':'09:30 AM','text':'09:30 AM'},{'value':'10:00 AM','text':'10:00 AM'},{'value':'10:30 AM','text':'10:30 AM'},{'value':'11:00 AM','text':'11:00 AM'},{'value':'11:30 AM','text':'11:30 AM'},{'value':'12:00 PM','text':'12:00 PM'},{'value':'12:30 PM','text':'12:30 PM'},{'value':'01:00 PM','text':'01:00 PM'},{'value':'01:30 PM','text':'01:30 PM'},{'value':'02:00 PM','text':'02:00 PM'},{'value':'02:30 PM','text':'02:30 PM'},{'value':'03:00 PM','text':'03:00 PM'},{'value':'03:30 PM','text':'03:30 PM'},{'value':'04:00 PM','text':'04:00 PM'},{'value':'04:30 PM','text':'04:30 PM'},{'value':'05:00 PM','text':'05:00 PM'},{'value':'05:30 PM','text':'05:30 PM'},{'value':'06:00 PM','text':'06:00 PM'},{'value':'06:30 PM','text':'06:30 PM'},{'value':'07:00 PM','text':'07:00 PM'},{'value':'07:30 PM','text':'07:30 PM'},{'value':'08:00 PM','text':'08:00 PM'},{'value':'08:30 PM','text':'08:30 PM'},{'value':'09:00 PM','text':'09:00 PM'},{'value':'09:30 PM','text':'09:30 PM'},{'value':'10:00 PM','text':'10:00 PM'},{'value':'10:30 PM','text':'10:30 PM'},{'value':'11:00 PM','text':'11:00 PM'},{'value':'11:30 PM','text':'11:30 PM'}];
				break;
		}
	
		return aDisplayedTimes;
	};
	
	/**
	 * @param {Array} aDisplayedAlarms
	 */
	CalendarCreateEventPopup.prototype.getAlarmsArray = function (aDisplayedAlarms)
	{
		var aAlarms = [];
	
		_.each(aDisplayedAlarms, function(oAlarm, iIdx)
		{
			aAlarms.push(oAlarm.alarm());
		}, this);
	
		return _.sortBy(aAlarms, function(num){return -num;});
	};
	
	CalendarCreateEventPopup.prototype.addFirstAlarm = function ()
	{
		if(!this.displayedAlarms().length)
		{
			this.displayedAlarms(this.getDisplayedAlarms([this.alarmOptions()[0].value]));
		}
		else
		{
			var
				sConfirm = Utils.i18n('CALENDAR/CONFIRM_CLOSE_ALARMS'),
				fAction = _.bind(function (bResult) {
					if (bResult)
					{
						this.displayedAlarms.removeAll();
					}
				}, this)
			;
	
			App.Screens.showPopup(ConfirmPopup, [sConfirm, fAction]);
		}
	};
	
	CalendarCreateEventPopup.prototype.addAlarm = function ()
	{
		var
			oDisplayedAlarm,
			aSortedAlarms,
			iMinutes = 0
		;
	
		aSortedAlarms = _.sortBy(this.displayedAlarms(), function(oAlarm){return oAlarm.alarm();});
	
		_.each(aSortedAlarms, function(oAlarm) {
	
			var nAlarmMinutes = oAlarm.alarm();
	
			if (nAlarmMinutes !== 5 && iMinutes <= 5)
			{
				iMinutes = 5;
			}
			else if (nAlarmMinutes !== 10 && iMinutes <= 10)
			{
				iMinutes = 10;
			}
			else if (nAlarmMinutes !== 15 && iMinutes <= 15)
			{
				iMinutes = 15;
			}
			else if (nAlarmMinutes !== 30 && iMinutes <= 30)
			{
				iMinutes = 30;
			}
			else if (nAlarmMinutes !== 1440 && iMinutes <= 1440)
			{
				iMinutes = 1440;
			}
		});
	
		oDisplayedAlarm = this.getDisplayedAlarms([iMinutes])[0];
	
		this['alarm' + iMinutes] = ko.observable(iMinutes);
		this.displayedAlarms.push(oDisplayedAlarm);
	};
	
	/**
	 * @param {Object} oItem
	 */
	CalendarCreateEventPopup.prototype.removeAlarm = function (oItem)
	{
		this.displayedAlarms.remove(oItem);
	};
	
	/**
	 * @param {Object} oItem
	 */
	CalendarCreateEventPopup.prototype.removeGuest = function (oItem)
	{
		this.attendees.remove(oItem);
	};
	
	CalendarCreateEventPopup.prototype.disableAlarms = function ()
	{
		_.each(this.alarmOptions(), function(oAlarm, iIdx) {
	
			oAlarm.isDisabled = _.any(this.displayedAlarms(), function(oItem){
				return oItem.alarm() === oAlarm.value;
			});
	
		}, this);
	
		this.alarmOptions.valueHasMutated();
	};
	
	/**
	 * @param {string} sTerm
	 * @param {Function} fResponse
	 */
	CalendarCreateEventPopup.prototype.autocompleteCallback = function (sTerm, fResponse)
	{
		var oParameters = {
				'Action': 'ContactSuggestions',
				'Search': sTerm,
				'GlobalOnly': '0'
			}
		;
	
		this.guestAutocompleteItem(null);
	
		sTerm = Utils.trim(sTerm);
		if ('' !== sTerm)
		{
			App.Ajax.send(oParameters, function (oData) {
				var aList = [];
				if (oData && oData.Result && oData.Result && oData.Result.List)
				{
					aList = _.map(oData.Result.List, function (oItem) {
						/*return oItem && oItem.Email ? oItem.Email : '';*/
						return oItem && oItem.Email && oItem.Email !== this.owner() ?
							(oItem.Name && 0 < Utils.trim(oItem.Name).length ?
							{value:'"' + oItem.Name + '" <' + oItem.Email + '>', name: oItem.Name, email: oItem.Email} : {value: oItem.Email, name: '', email: oItem.Email}) : null;
					}, this);
	
					aList = _.compact(aList);
				}
				fResponse(aList);
	
			}, this);
		}
		else
		{
			fResponse([]);
		}
	};
	
	CalendarCreateEventPopup.prototype.repeatRuleParse = function (oRepeatRule)
	{
		var allEvents = this.allEvents();
	
		this.repeatEndDom().datepicker("option", "minDate", this.datepickerGetDate(this.endDom()));
	
		//new event
		/*if(!oRepeatRule && allEvents === Enums.CalendarEditRecurrenceEvent.AllEvents)
		{
			//event start date + 7days
			//sDate = moment(this.startDom().datepicker( "getDate" )).add('days', 7).format(this.dateFormatMoment);
	
			//this.repeatUntil(sDate);
		}
		//excluded event
		else if(!oRepeatRule && allEvents === Enums.CalendarEditRecurrenceEvent.OnlyThisInstance)
		{
	
		}
		//only this instance
		else if(oRepeatRule && allEvents === Enums.CalendarEditRecurrenceEvent.OnlyThisInstance)
		{
	
		}
		//all events in the series
		else*/ if(oRepeatRule && allEvents === Enums.CalendarEditRecurrenceEvent.AllEvents)
		{
			this.repeatPeriod(oRepeatRule.period);
			this.repeatInterval(oRepeatRule.interval);
			this.repeatEnd(oRepeatRule.end);
			this.repeatCount(oRepeatRule.count);
			this.repeatWeekNum(oRepeatRule.weekNum);
	
			if (oRepeatRule.until)
			{
				this.datepickerSetDate(this.repeatEndDom(), new Date(oRepeatRule.until * 1000));
			}
	
			if (oRepeatRule.byDays.length)
			{
				this.weekDays(true);
	
				_.each(oRepeatRule.byDays, function (sItem)
				{
					this['week' + sItem](true);
				}, this);
			}
		}
	};
	
	CalendarCreateEventPopup.prototype.getDays = function ()
	{
		var aDays = [];
	
		if (this.weekMO()) {aDays.push('MO');}
		if (this.weekTU()) {aDays.push('TU');}
		if (this.weekWE()) {aDays.push('WE');}
		if (this.weekTH()) {aDays.push('TH');}
		if (this.weekFR()) {aDays.push('FR');}
		if (this.weekSA()) {aDays.push('SA');}
		if (this.weekSU()) {aDays.push('SU');}
	
		return aDays;
	};
	
	CalendarCreateEventPopup.prototype.onMainPanelClick = function ()
	{
		if (this.dateEdit())
		{
			this.dateEdit(false);
		}
	};
	
	/**
	 * @param {Object} oEl
	 * @param {Object} oEv
	 */
	CalendarCreateEventPopup.prototype.onKeydown = function (oEl, oEv)
	{
		if(oEv.keyCode === Enums.Key.Enter)
		{
			oEv.preventDefault();
		}
	};
	
	/**
	 * @param {Object} oEl
	 * @param {Object} oEv
	 * @param {Function} oValueObserver
	 */
	CalendarCreateEventPopup.prototype.onKeyup = function (oEl, oEv, oValueObserver)
	{
		if((oEv.target.id === "event_subject" || oEv.target.id === "event_location") && oEv.keyCode === Enums.Key.Enter)
		{
			this.onSaveClick();
		}
	//	this.autosizeTrigger.notifySubscribers();
	};
	
	CalendarCreateEventPopup.prototype.onPaste = function (oEl, oEv, oValueObserver)
	{
		var sWithoutLineBreaks = oValueObserver().replace(/[\r\n\t]+/gm, ' ');
	
		oValueObserver(sWithoutLineBreaks);
	
	};
	
	CalendarCreateEventPopup.prototype.selectStartDate = function ()
	{
		if (this.startDate() && this.endDate())
		{
			var
				sDateFormat = this.dateFormatMoment,
				sTimeFormat = this.timeFormatMoment,
				oDate = this.datepickerGetDate(this.startDom()),
				oTimeDate = (moment(this.getDateFromStr(moment(oDate).format(sDateFormat), this.startTime()))).toDate(),
				oCompareDate = this.datepickerGetDate(this.endDom()),
				oCompareTimeDate = (moment(this.getDateFromStr(moment(oCompareDate).format(sDateFormat), this.endTime()))).toDate(),
				nTimeDate = this.getUnixTimestamp(oTimeDate),
				nCompareTimeDate = this.getUnixTimestamp(oCompareTimeDate),
				oMomentTimeDate = moment(oTimeDate),
				oMomentCompareTimeDate = moment(oCompareTimeDate),
				sDateLoc = oMomentTimeDate.format(sDateFormat),
				sTimeLoc = oMomentTimeDate.format(sTimeFormat),
				sCompareDateLoc = oMomentCompareTimeDate.format(sDateFormat),
				sCompareTimeLoc = oMomentCompareTimeDate.format(sTimeFormat)
			;
	
			this.isEvOneDay(sDateLoc === sCompareDateLoc);
			this.isEvOneTime(sTimeLoc === sCompareTimeLoc);
	
			if (nTimeDate > nCompareTimeDate)
			{
				this.datepickerSetDate(this.endDom(), oTimeDate);
				this.endDate(sDateLoc);
				this.endTime(sTimeLoc);
				this.isEvOneDay(true);
				this.isEvOneTime(true);
			}
	
			this.startDate(sDateLoc);
			this.startTime(sTimeLoc);
	
			this.yearlyDate(oMomentTimeDate.format(this.getPartOfDate(this.dateFormatMoment.slice(0,-5))));
			this.monthlyDate(oMomentTimeDate.format(this.getPartOfDate(this.dateFormatMoment.slice(0,2))));
		}
	};
	
	CalendarCreateEventPopup.prototype.selectEndDate = function ()
	{
		if (this.endDate() && this.startDate())
		{
			var
				sDateFormat = this.dateFormatMoment,
				sTimeFormat = this.timeFormatMoment,
				oDate = this.datepickerGetDate(this.endDom()),
				oTimeDate = (moment(this.getDateFromStr(moment(oDate).format(sDateFormat), this.endTime()))).toDate(),
				oCompareDate = this.datepickerGetDate(this.startDom()),
				oCompareTimeDate = (moment(this.getDateFromStr(moment(oCompareDate).format(sDateFormat), this.startTime()))).toDate(),
				nTimeDate = this.getUnixTimestamp(oTimeDate),
				nCompareTimeDate = this.getUnixTimestamp(oCompareTimeDate),
				oMomentTimeDate = moment(oTimeDate),
				oMomentCompareTimeDate = moment(oCompareTimeDate),
				sDateLoc = oMomentTimeDate.format(sDateFormat),
				sTimeLoc = oMomentTimeDate.format(sTimeFormat),
				sCompareDateLoc = oMomentCompareTimeDate.format(sDateFormat),
				sCompareTimeLoc = oMomentCompareTimeDate.format(sTimeFormat)
			;
	
			this.isEvOneDay(sDateLoc === sCompareDateLoc);
			this.isEvOneTime(sTimeLoc === sCompareTimeLoc);
	
			if(nTimeDate < nCompareTimeDate)
			{
				this.datepickerSetDate(this.startDom(), oTimeDate);
				this.startDate(sDateLoc);
				this.startTime(sTimeLoc);
				this.isEvOneDay(true);
				this.isEvOneTime(true);
			}
	
			this.endDate(sDateLoc);
			this.endTime(sTimeLoc);
	
			this.repeatEndDom().datepicker('option', 'minDate', oTimeDate);
	
			if (!this.isRepeat())
			{
				this.datepickerSetDate(this.repeatEndDom(), oMomentTimeDate.add('days', 7).toDate());
			}
		}
	};
	
	/**
	 * @param {Object} oDate
	 * @return {number}
	 */
	CalendarCreateEventPopup.prototype.getUnixTimestamp = function (oDate)
	{
		return Number(moment(oDate).format('X'));
	};
	
	/**
	 * @param {Object} oInput
	 * @return {Date}
	 */
	CalendarCreateEventPopup.prototype.datepickerGetDate = function (oInput)
	{
		return oInput.datepicker('getDate');
	};
	
	/**
	 * @param {Object} oInput
	 * @param {Object} oDate
	 */
	CalendarCreateEventPopup.prototype.datepickerSetDate = function (oInput, oDate)
	{
		oInput.datepicker('setDate', oDate);
	};
	
	/**
	 * @param {string} sDate
	 * @param {string} sTime
	 * @return {Date}
	 */
	CalendarCreateEventPopup.prototype.getDateFromStr = function (sDate, sTime)
	{
		return (moment(sDate + ' ' + sTime, this.dateFormatMoment + ' ' + this.timeFormatMoment)).toDate();
	};
	
	/**
	 * @param {string} sDateFormat
	 * @return {string}
	 */
	CalendarCreateEventPopup.prototype.getPartOfDate = function (sDateFormat)
	{
		var sMomentDateFormat = 'MM/DD';
	
			switch (sDateFormat)
			{
				case 'MM/DD':
					sMomentDateFormat = 'MM/DD';
					break;
				case 'DD/MM':
					sMomentDateFormat = 'DD/MM';
					break;
				case 'DD MMMM':
					sMomentDateFormat = 'DD MMMM';
					break;
				case 'DD':
					sMomentDateFormat = 'DD';
					break;
			}
	
		return sMomentDateFormat;
	};
	
	CalendarCreateEventPopup.prototype.setActualTime = function ()
	{
		var oMoment = moment();
	
		if (oMoment.minutes() > 30)
		{
			oMoment.minutes(60);
		}
		else
		{
			oMoment.minutes(30);
		}
		oMoment.seconds(0);
		oMoment.milliseconds(0);
	
		this.startTime(oMoment.format(this.timeFormatMoment));
		this.endTime(oMoment.add('minutes', 30).format(this.timeFormatMoment));
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CalendarCreateEventPopup.prototype.onProcessAppointmentResponse = function (oData, oParameters)
	{
		if (!oData.Result)
		{
			App.Api.showErrorByCode(0, Utils.i18n('WARNING/UNKNOWN_ERROR'));
		}
	};
	
	/**
	 * @param {number} iDecision
	 */
	CalendarCreateEventPopup.prototype.doProcessAppointment = function (iDecision)
	{
		var
			oParameters = {
				'Action': 'EventUpdateAppointment',
				'actionAppointment': iDecision,
				'calendarId': this.selectedCalendar(),
				'uid' : this.uid
			},
			aAttendees = this.attendees(),
			sEmail = this.defaultAccount ? this.defaultAccount.email() : '',
			oAttendee = _.find(this.attendees(), function(oAttendee){
				return oAttendee.email === sEmail; 
			}, this),
			oCalendar = this.calendars.getCalendarById(this.selectedCalendar())
		;
	
		if (oAttendee)
		{
			App.Ajax.send(oParameters, this.onProcessAppointmentResponse, this);
	
			oAttendee.status = iDecision;
			this.attendees([]);
			this.attendees(aAttendees);
			this.setCurrentAttenderStatus(oAttendee.email, this.attendees());
			if (iDecision === Enums.IcalConfigInt.Declined && oCalendar && 
					this.callbackAttendeeActionDecline && Utils.isFunc(this.callbackAttendeeActionDecline))
			{
				this.callbackAttendeeActionDecline(oCalendar,  this.id());
				this.closePopup();
			}
		}
	};
	
	/**
	 * @param {boolean} bShared
	 * @param {boolean} bEditable
	 * @param {boolean} bMyEvent
	 */
	CalendarCreateEventPopup.prototype.editableSwitch = function (bShared, bEditable, bMyEvent)
	{
		this.isEditable((!bShared && bEditable && bMyEvent) || (bShared && bEditable && !bMyEvent));
	};
	
	/**
	 * @param {string} sCurrentEmail
	 * @param {Array} aAttendees
	 */
	CalendarCreateEventPopup.prototype.setCurrentAttenderStatus = function (sCurrentEmail, aAttendees)
	{
		var oCurrentAttender = _.find(aAttendees, function(oAttender){ return oAttender.email === sCurrentEmail; });
	
		this.attenderStatus(oCurrentAttender ? oCurrentAttender.status : 0);
	};
	
	CalendarCreateEventPopup.prototype.getAttenderTextStatus = function (sStatus)
	{
		switch (sStatus)
		{
			case 0:
				sStatus="pending";
				break;
			case 1:
				sStatus="accepted";
				break;
			case 2:
				sStatus="declined";
				break;
			case 3:
				sStatus="tentative";
				break;
		}
		return sStatus;
	};
	/**
	 * @constructor
	 */
	function CalendarEditRecurrenceEventPopup()
	{
		this.fCallback = null;
		this.confirmDesc = Utils.i18n('CALENDAR/EDIT_RECURRENCE_CONFIRM_DESCRIPTION');
		this.onlyThisInstanceButtonText = ko.observable(Utils.i18n('CALENDAR/ONLY_THIS_INSTANCE'));
		this.allEventsButtonText = ko.observable(Utils.i18n('CALENDAR/ALL_EVENTS_IN_THE_SERIES'));
		this.cancelButtonText = ko.observable(Utils.i18n('MAIN/BUTTON_CANCEL'));
	}
	
	/**
	 * @param {Function} fCallback
	 */
	CalendarEditRecurrenceEventPopup.prototype.onShow = function (fCallback)
	{
		if (Utils.isFunc(fCallback))
		{
			this.fCallback = fCallback;
		}
	};
	
	/**
	 * @return {string}
	 */
	CalendarEditRecurrenceEventPopup.prototype.popupTemplate = function ()
	{
		return 'Popups_CalendarEditRecurrenceEventPopupViewModel';
	};
	
	CalendarEditRecurrenceEventPopup.prototype.onlyThisInstanceButtonClick = function ()
	{
		if (this.fCallback)
		{
			this.fCallback(Enums.CalendarEditRecurrenceEvent.OnlyThisInstance);
		}
	
		this.closeCommand();
	};
	
	CalendarEditRecurrenceEventPopup.prototype.allEventsButtonClick = function ()
	{
		if (this.fCallback)
		{
			this.fCallback(Enums.CalendarEditRecurrenceEvent.AllEvents);
		}
	
		this.closeCommand();
	};
	
	CalendarEditRecurrenceEventPopup.prototype.cancelButtonClick = function ()
	{
		if (this.fCallback)
		{
			this.fCallback(Enums.CalendarEditRecurrenceEvent.None);
		}
	
		this.closeCommand();
	};
	
	
	
	
	/**
	 * @constructor
	 */
	function PhonePopup()
	{
		this.phone = App.Phone;
		this.voiceApp = App.Phone.voiceApp;
		this.phoneReport = App.Phone.phoneReport;
	//	this.action = App.Phone.action;
		this.action = ko.observable('');
		this.phoneNumber = ko.observable('');
		this.callback = null;
	}
	
	/**
	 * @return {string}
	 */
	PhonePopup.prototype.popupTemplate = function ()
	{
		return 'Popups_PhonePopupViewModel';
	};
	
	PhonePopup.prototype.onShow = function (oParameters)
	{
		this.action(oParameters.Action || '');
		this.phoneNumber(oParameters.PhoneNumber || '');
		this.callback = oParameters.Callback || null;
	
		if (this.action() === Enums.PhoneAction.Incoming)
		{
			App.desktopNotify('show', this.phoneNumber() + ' calling...', 'Click here to answer.\r\n To drop the call, click End in the web interface.', false, this.phone.answer.bind(this.phone));
		}
	};
	
	PhonePopup.prototype.onCancelClick = function ()
	{
		this.phone.hidePopup();
	};
	
	PhonePopup.prototype.onOKClick = function ()
	{
		this.phone.hidePopup();
	
		if(this.callback)
		{
			this.callback();
		}
	};
	
	PhonePopup.prototype.answer = function ()
	{
		this.phone.answer();
	};
	
	PhonePopup.prototype.hangup = function ()
	{
		this.phone.hangup();
	};
	
	
	/**
	 * @constructor
	 */
	function CAppSettingsModel()
	{
		// allows to edit common settings and calendar settings
		this.AllowUsersChangeInterfaceSettings = true;
	
		// allows to delete accounts, allows to change account properties (name and password is always possible to change),
		// allows to manage special folders, allows to add new accounts
		this.AllowUsersChangeEmailSettings = true;
	
		// allows to add new accounts (if AllowUsersChangeEmailSettings === true)
		this.AllowUsersAddNewAccounts = true || this.AllowUsersChangeEmailSettings;
		
		this.SiteName = '';
	
		// list of available languages
		this.Languages = [
			{name: 'English', value: 'en'}
		];
	
		// list of available themes
		this.Themes = [
			'Default'
		];
	
		// list of available date formats
		this.DateFormats = [];
		
		this.DefaultLanguage = 'English';
	
		// maximum size of uploading attachment
		this.AttachmentSizeLimit = 10240000;
		this.ImageUploadSizeLimit = 10240000;
		
		this.AllowFirstCharacterSearch = false;
		this.AllowIdentities = false;
	
		this.AllowFetcher = false;
	
		// activate autosave
		this.AutoSave = true;
		this.AutoSaveIntervalSeconds = 60;
		this.IdleSessionTimeout = 0;
		
		// allows to insert an image to html-text in rich text editor
		this.AllowInsertImage = true;
		this.AllowBodySize = false;
		this.MaxBodySize = 600;
		this.MaxSubjectSize = 255;
	
		this.AllowPrefetch = true;
		this.MaxPrefetchBodiesSize = 50000;
	
		this.LoginFormType = Enums.LoginFormType.Email;
		this.LoginAtDomainValue = '';
	
		this.DemoWebMail = true;
		this.DemoWebMailLogin = '';
		this.DemoWebMailPassword = '';
		this.LoginDescription = '';
		this.GoogleAnalyticsAccount = '';
		this.ShowQuotaBar = false;
		this.ServerUseUrlRewrite = false;
	
		this.AllowLanguageOnLogin = false;
		this.FlagsLangSelect = false;
		
		this.CustomLoginUrl = '';
		this.CustomLogoutUrl = '';
	
		this.IosDetectOnLogin = '';
	
		this.UseReCaptcha = false;
		this.ReCaptchaPublicKey = '';
		this.DefaultLanguageShort = 'en';
	}
		
	/**
	 * Parses the application settings from the server.
	 * 
	 * @param {Object} oData
	 */
	CAppSettingsModel.prototype.parse = function (oData)
	{
		this.AllowUsersChangeInterfaceSettings = !!oData.AllowUsersChangeInterfaceSettings;
		this.AllowUsersChangeEmailSettings = !!oData.AllowUsersChangeEmailSettings;
		this.AllowUsersAddNewAccounts = Utils.isUnd(oData.AllowUsersAddNewAccounts) ? this.AllowUsersChangeEmailSettings : !!oData.AllowUsersAddNewAccounts;
		this.SiteName = oData.SiteName;
		this.Languages = oData.Languages;
		this.Themes = oData.Themes;
		this.DateFormats = oData.DateFormats;
		this.AttachmentSizeLimit = Utils.pInt(oData.AttachmentSizeLimit);
		this.ImageUploadSizeLimit = Utils.pInt(oData.ImageUploadSizeLimit);
		this.AllowFirstCharacterSearch = !!oData.AllowFirstCharacterSearch;
		this.AllowIdentities = !!oData.AllowIdentities;
		this.AutoSave = !!oData.AutoSave;
		this.IdleSessionTimeout = Utils.pInt(oData.IdleSessionTimeout);
		this.AllowInsertImage = !!oData.AllowInsertImage;
		this.AllowBodySize = !!oData.AllowBodySize;
		this.MaxBodySize = Utils.pInt(oData.MaxBodySize);
		this.MaxSubjectSize = Utils.pInt(oData.MaxSubjectSize);
		this.AllowPrefetch = !!oData.AllowPrefetch;
	
		this.AllowFetcher = !!oData.AllowFetcher;
	
		this.LoginFormType = Utils.pInt(oData.LoginFormType);
		this.LoginSignMeType = Utils.pInt(oData.LoginSignMeType);
		this.LoginAtDomainValue = oData.LoginAtDomainValue;
		
		this.DemoWebMail = !!oData.DemoWebMail;
		this.DemoWebMailLogin = oData.DemoWebMailLogin;
		this.DemoWebMailPassword = oData.DemoWebMailPassword;
		this.GoogleAnalyticsAccount = oData.GoogleAnalyticsAccount;
		this.ShowQuotaBar = !!oData.ShowQuotaBar;
		this.ServerUseUrlRewrite = !!oData.ServerUseUrlRewrite;
	
		this.AllowLanguageOnLogin = !!oData.AllowLanguageOnLogin;
		this.FlagsLangSelect = !!oData.FlagsLangSelect;
	
		this.DefaultLanguage = oData.DefaultLanguage;
		this.LoginDescription = oData.LoginDescription;
		
		this.CustomLoginUrl = oData.CustomLoginUrl;
		this.CustomLogoutUrl = oData.CustomLogoutUrl;
	
		this.IosDetectOnLogin = oData.IosDetectOnLogin;
	
		this.UseReCaptcha = oData.UseReCaptcha;
		this.ReCaptchaPublicKey = oData.ReCaptchaPublicKey;
		if (oData.DefaultLanguageShort !== '')
		{
			this.DefaultLanguageShort = oData.DefaultLanguageShort;
		}
	};
	
	/**
	 * @constructor
	 */
	function CUserSettingsModel()
	{
		this.IdUser = 1;
	
		// general settings that can be changed in the settings screen
		this.MailsPerPage = 20;
		this.ContactsPerPage = 20;
		this.iInterval = -1;
		this.autoCheckMailInterval = ko.observable(0);
		this.autoCheckMailInterval.subscribe(this.changeAutoCheckMailInterval, this);
		this.DefaultEditor = 1;
		this.Layout = Enums.MailboxLayout.Side;
		this.DefaultTheme = 'Default';
		this.DefaultLanguage = 'English';
		this.DefaultDateFormat = 'MM/DD/YYYY';
		this.defaultTimeFormat = ko.observable(0);
		this.ThreadsEnabled = true;
		this.useThreads = ko.observable(true);
	
		// allows the creation of messages
		this.AllowCompose = true;
	
		this.AllowReply = true;
		this.AllowForward = true;
		this.SaveMail = Enums.SaveMail.Checked;
	
		this.OutlookSyncEnable = true;
		this.MobileSyncEnable = true;
	
		this.ShowPersonalContacts = true;
		this.ShowGlobalContacts = false;
		
		this.IsFilesSupported = false;
		this.IsHelpdeskSupported = false;
		this.IsHelpdeskAgent = false;
		this.HelpdeskIframeUrl = '';
	
		// allows to go to contacts screen and edit their settings
		this.ShowContacts = this.ShowPersonalContacts || this.ShowGlobalContacts;
	
		this.LastLogin = 0;
		this.IsDemo = false;
	
		this.AllowVoice = false;
		this.VoiceRealm = '';
		this.VoiceWebsocketProxyUrl = '';
		this.VoiceOutboundProxyUrl = '';
		this.VoiceCallerID = '';
		this.VoiceImpi = '';
		this.VoiceImpu = '';
		this.VoicePassword = '';
		
		this.VoiceProvider = '';
	//	this.VoiceAccountSID = '';
	//	this.VoiceAuthToken = '';
	//	this.VoiceAppSID = '';
	
		// allows to go to calendar screen and edit its settings
		this.AllowCalendar = true;
	
		this.CalendarSharing = false;
		this.CalendarAppointments = false;
	
		// calendar settings that can be changed in the settings screen
		this.CalendarShowWeekEnds = false;
		this.CalendarShowWorkDay = false;
		this.CalendarWorkDayStarts = 0;
		this.CalendarWorkDayEnds = 0;
		this.CalendarWeekStartsOn = 0;
		this.CalendarDefaultTab = Enums.CalendarDefaultTab.Month;
		
		this.needToReloadCalendar = ko.observable(false);
	
		this.mobileSync = ko.observable(null);
		this.MobileSyncDemoPass = 'demo';
		this.outlookSync = ko.observable(null);
		this.OutlookSyncDemoPass = 'demo';
		
		this.AllowHelpdeskNotifications = false;
	}
	
	CUserSettingsModel.prototype.changeAutoCheckMailInterval = function ()
	{
		clearInterval(this.iInterval);
		if (!AppData.SingleMode && this.autoCheckMailInterval() > 0)
		{
			this.iInterval = setInterval(function () {
				App.MailCache.executeCheckMail();
			}, this.autoCheckMailInterval() * 60 * 1000);
		}
	};
	
	/**
	 * @return {boolean}
	 */
	CUserSettingsModel.prototype.getSaveMailInSentItems = function ()
	{
		var bSaveMailInSentItems = true;
		
		switch (this.SaveMail)
		{
			case Enums.SaveMail.Unchecked:
				bSaveMailInSentItems = false;
				break;
			case Enums.SaveMail.Checked:
			case Enums.SaveMail.Hidden:
				bSaveMailInSentItems = true;
				break;
		}
		
		return bSaveMailInSentItems;
	};
	
	/**
	 * @return {boolean}
	 */
	CUserSettingsModel.prototype.getUseSaveMailInSentItems = function ()
	{
		var bUseSaveMailInSentItems = false;
		
		switch (this.SaveMail)
		{
			case Enums.SaveMail.Unchecked:
			case Enums.SaveMail.Checked:
				bUseSaveMailInSentItems = true;
				break;
			case Enums.SaveMail.Hidden:
				bUseSaveMailInSentItems = false;
				break;
		}
		
		return bUseSaveMailInSentItems;
	};
	
	/**
	 * @param {AjaxUserSettingsResponse} oData
	 */
	CUserSettingsModel.prototype.parse = function (oData)
	{
		var oCalendar = null;
	
		if (oData !== null)
		{
			this.IdUser = Utils.pInt(oData.IdUser);
			this.MailsPerPage = Utils.pInt(oData.MailsPerPage);
			this.ContactsPerPage = Utils.pInt(oData.ContactsPerPage);
			this.autoCheckMailInterval(Utils.pInt(oData.AutoCheckMailInterval));
			this.DefaultEditor = Utils.pInt(oData.DefaultEditor);
			this.Layout = Utils.pInt(oData.Layout);
			this.DefaultTheme = oData.DefaultTheme.toString();
			this.DefaultLanguage = oData.DefaultLanguage.toString();
			this.DefaultDateFormat = oData.DefaultDateFormat.toString();
			this.defaultTimeFormat(Utils.pInt(oData.DefaultTimeFormat));
			this.ThreadsEnabled = !!oData.ThreadsEnabled;
			this.useThreads(!!oData.UseThreads);
			this.AllowCompose = !!oData.AllowCompose;
			this.AllowReply = !!oData.AllowReply;
			this.AllowForward = !!oData.AllowForward;
			this.SaveMail = Utils.pInt(oData.SaveMail);
			this.OutlookSyncEnable = !!oData.OutlookSyncEnable;
			this.MobileSyncEnable = !!oData.MobileSyncEnable;
			this.ShowPersonalContacts = !!oData.ShowPersonalContacts;
			this.ShowGlobalContacts = !!oData.ShowGlobalContacts;
			this.ShowContacts = this.ShowPersonalContacts || this.ShowGlobalContacts;
			
			this.IsFilesSupported = !!oData.IsFilesSupported;
			this.IsHelpdeskSupported = !!oData.IsHelpdeskSupported;
			this.IsHelpdeskAgent = !!oData.IsHelpdeskAgent;
			
			this.LastLogin = Utils.pInt(oData.LastLogin);
			this.AllowCalendar = !!oData.AllowCalendar;
	
			this.CalendarSharing = !!oData.CalendarSharing;
			this.CalendarAppointments = !!oData.CalendarAppointments;
			
			this.IsDemo = !!oData.IsDemo;
	
			this.AllowVoice = !!oData.AllowVoice;
			this.VoiceRealm = oData.VoiceRealm;
			this.VoiceWebsocketProxyUrl = oData.VoiceWebsocketProxyUrl;
			this.VoiceOutboundProxyUrl = oData.VoiceOutboundProxyUrl;
			this.VoiceCallerID = oData.VoiceCallerID;
			this.VoiceImpi = oData.VoiceImpi;
			this.VoiceImpu = oData.VoiceImpu;
			this.VoicePassword = oData.VoicePassword;
			
			this.VoiceProvider = oData.VoiceRealm;
	//		this.VoiceAccountSID = oData.VoiceRealm;
	//		this.VoiceAuthToken = oData.VoiceAuthToken;
	//		this.VoiceAppSID = oData.VoiceAppSID;
			
			
			
			this.AllowHelpdeskNotifications = oData.AllowHelpdeskNotifications;
	
			oCalendar = oData.Calendar;
			if (oCalendar)
			{
				this.CalendarShowWeekEnds = !!oCalendar.ShowWeekEnds;
				this.CalendarShowWorkDay = !!oCalendar.ShowWorkDay;
				this.CalendarWorkDayStarts = Utils.pInt(oCalendar.WorkDayStarts);
				this.CalendarWorkDayEnds = Utils.pInt(oCalendar.WorkDayEnds);
				this.CalendarWeekStartsOn = Utils.pInt(oCalendar.WeekStartsOn);
				this.CalendarDefaultTab = Utils.pInt(oCalendar.DefaultTab);
			}
		}
	};
	
	/**
	 * @param {number} iMailsPerPage
	 * @param {number} iContactsPerPage
	 * @param {number} iAutoCheckMailInterval
	 * @param {number} iDefaultEditor
	 * @param {number} iLayout
	 * @param {string} sDefaultTheme
	 * @param {string} sDefaultLanguage
	 * @param {string} sDefaultDateFormat
	 * @param {number} iDefaultTimeFormat
	 * @param {string} sUseThreads
	 */
	CUserSettingsModel.prototype.updateCommonSettings = function (iMailsPerPage, iContactsPerPage,
			iAutoCheckMailInterval, iDefaultEditor, iLayout, sDefaultTheme, sDefaultLanguage,
			sDefaultDateFormat, iDefaultTimeFormat, sUseThreads)
	{
		if (this.DefaultTheme !== sDefaultTheme || this.DefaultLanguage !== sDefaultLanguage || 
			this.DefaultDateFormat !== sDefaultDateFormat ||this.defaultTimeFormat() !== iDefaultTimeFormat)
		{
			this.needToReloadCalendar(true);
		}
		
		this.MailsPerPage = iMailsPerPage;
		this.ContactsPerPage = iContactsPerPage;
		this.autoCheckMailInterval(iAutoCheckMailInterval);
		this.DefaultEditor = iDefaultEditor;
		this.Layout = iLayout;
		this.DefaultTheme = sDefaultTheme;
		this.DefaultLanguage = sDefaultLanguage;
		this.DefaultDateFormat = sDefaultDateFormat;
		this.defaultTimeFormat(iDefaultTimeFormat);
		this.useThreads(sUseThreads === '1');
	};
	
	/**
	 * @param {boolean} bShowWeekEnds
	 * @param {boolean} bShowWorkDay
	 * @param {number} iWorkDayStarts
	 * @param {number} iWorkDayEnds
	 * @param {number} iWeekStartsOn
	 * @param {number} iDefaultTab
	 */
	CUserSettingsModel.prototype.updateCalendarSettings = function (bShowWeekEnds, bShowWorkDay,
			iWorkDayStarts, iWorkDayEnds, iWeekStartsOn, iDefaultTab)
	{
		if (this.CalendarShowWeekEnds !== bShowWeekEnds || this.CalendarShowWorkDay !== bShowWorkDay || 
			this.CalendarWorkDayStarts !== iWorkDayStarts ||this.CalendarWorkDayEnds !== iWorkDayEnds ||
			this.CalendarWeekStartsOn !== iWeekStartsOn ||this.CalendarDefaultTab !== iDefaultTab)
		{
			this.needToReloadCalendar(true);
		}
		
		this.CalendarShowWeekEnds = bShowWeekEnds;
		this.CalendarShowWorkDay = bShowWorkDay;
		this.CalendarWorkDayStarts = iWorkDayStarts;
		this.CalendarWorkDayEnds = iWorkDayEnds;
		this.CalendarWeekStartsOn = iWeekStartsOn;
		this.CalendarDefaultTab = iDefaultTab;
	};
	
	/**
	 * @param {boolean} bAllowHelpdeskNotifications
	 */
	CUserSettingsModel.prototype.updateHelpdeskSettings = function (bAllowHelpdeskNotifications)
	{
		this.AllowHelpdeskNotifications = bAllowHelpdeskNotifications;
	};
	
	/**
	 * @return {boolean}
	 */
	CUserSettingsModel.prototype.isNeedToReloadCalendar = function ()
	{
		var bNeedToReloadCalendar = this.needToReloadCalendar();
		
		this.needToReloadCalendar(false);
		
		return bNeedToReloadCalendar;
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CUserSettingsModel.prototype.onSyncSettingsResponse = function (oData, oParameters)
	{
		if (oData.Result)
		{
			this.mobileSync(oData.Result.Mobile);
			this.outlookSync(oData.Result.Outlook);
		}
		else
		{
			App.Api.showErrorByCode(oData.ErrorCode);
		}
	};
	
	CUserSettingsModel.prototype.requestSyncSettings = function ()
	{
		if (this.mobileSync() === null || this.outlookSync() === null)
		{
			App.Ajax.send({'Action': 'SyncSettings'}, this.onSyncSettingsResponse, this);
		}
	};
	
	/**
	 * @constructor
	 */
	function CAccountModel()
	{
		this.id = ko.observable(0);
		this.email = ko.observable('');
		
		this.extensions = ko.observableArray([]);
		this.fetchers = ko.observable(null);
		this.friendlyName = ko.observable('');
		this.incomingMailLogin = ko.observable('');
		this.incomingMailPort = ko.observable(143); 
		this.incomingMailServer = ko.observable('');
		this.isInternal = ko.observable(false);
		this.isLinked = ko.observable(false);
		this.isDefault = ko.observable(false);
		this.outgoingMailAuth = ko.observable(0);
		this.outgoingMailLogin = ko.observable('');
		this.outgoingMailPort = ko.observable(25);
		this.outgoingMailServer = ko.observable('');
		this.isExtended = ko.observable(false);
		this.signature = ko.observable(null);
		this.autoresponder = ko.observable(null);
		this.forward = ko.observable(null);
		this.filters = ko.observable(null);
	
		this.quota = ko.observable(0);
		this.usedSpace = ko.observable(0);
	
		this.fullEmail = ko.computed(function () {
			if (this.friendlyName() === '')
			{
				return this.email();
			}
			else
			{
				return this.friendlyName() + ' <' + this.email() + '>';
			}
		}, this);
		
		this.isCurrent = ko.observable(false);
		this.isEdited = ko.observable(false);
	}
	
	/**
	 * @param {number} iId
	 * @param {string} sEmail
	 * @param {string} sFriendlyName
	 */
	CAccountModel.prototype.init = function (iId, sEmail, sFriendlyName)
	{
		this.id(iId);
		this.email(sEmail);
		this.friendlyName(sFriendlyName);
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CAccountModel.prototype.onQuotaParamsResponse = function (oData, oParameters)
	{
		if (oData && oData.Result && _.isArray(oData.Result) && 2 === oData.Result.length)
		{
			this.quota(Utils.pInt(oData.Result[1]));
			this.usedSpace(Utils.pInt(oData.Result[0]));
	
			App.MailCache.quotaChangeTrigger(!App.MailCache.quotaChangeTrigger());
		}
	};
	
	CAccountModel.prototype.updateQuotaParams = function ()
	{
		var
			oParams = {
				'Action': 'Quota',
				'AccountID': this.id()
			}
		;
		
		if (AppData.App && AppData.App.ShowQuotaBar)
		{
			App.Ajax.send(oParams, this.onQuotaParamsResponse, this);
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {number} iDefaultId
	 */
	CAccountModel.prototype.parse = function (oData, iDefaultId)
	{
		var oSignature = new CSignatureModel();
		
		this.init(parseInt(oData.AccountID, 10), oData.Email.toString(), 
			oData.FriendlyName.toString());
		
		oSignature.parse(this.id(), oData.Signature);
		this.signature(oSignature);
		
		this.isCurrent(iDefaultId === this.id());
		this.isEdited(iDefaultId === this.id());
	};
	
	CAccountModel.prototype.requestExtensions = function ()
	{
		if (!this.extensionsRequested && App.Ajax)
		{
			var oTz = window.jstz ? window.jstz.determine() : null;
			App.Ajax.send({
				'AccountID': this.id(),
				'Action': 'IsAuth',
				'ClientTimeZone': oTz ? oTz.name() : ''
			}, this.onIsAuthResponse, this);
			this.extensionsRequested = true;
		}
	};
	
	/**
	 * @param {Object} oResult
	 * @param {Object} oRequest
	 */
	CAccountModel.prototype.onIsAuthResponse = function (oResult, oRequest)
	{
		var
			bResult = !!oResult.Result,
			aExtensions = bResult ? oResult.Result.Extensions : []
		;
		
		if (bResult)
		{
			this.setExtensions(aExtensions);
		}
	};
	
	/**
	 * @param {Array} aExtensions
	 */
	CAccountModel.prototype.setExtensions = function(aExtensions)
	{
		if (_.isArray(aExtensions))
		{
			this.extensions(aExtensions);
		}
	};
	
	/**
	 * @param {string} sExtension
	 * 
	 * return {boolean}
	 */
	CAccountModel.prototype.extensionExists = function(sExtension)
	{
		return (_.indexOf(this.extensions(), sExtension) === -1) ? false : true;
	};
	
	/**
	 * @param {?} ExtendedData
	 */
	CAccountModel.prototype.updateExtended = function (ExtendedData)
	{
		if (ExtendedData)
		{
			this.isExtended(true);
	
			if (ExtendedData.FriendlyName)
			{
				this.friendlyName(ExtendedData.FriendlyName);
			}
	
			if (ExtendedData.IncomingMailLogin)
			{
				this.incomingMailLogin(ExtendedData.IncomingMailLogin);
			}
			if (ExtendedData.IncomingMailPort)
			{
				this.incomingMailPort(ExtendedData.IncomingMailPort); 
			}		
			if (ExtendedData.IncomingMailServer)
			{
				this.incomingMailServer(ExtendedData.IncomingMailServer);
			}
			if (ExtendedData.IsInternal)
			{
				this.isInternal(ExtendedData.IsInternal);
			}
			if (ExtendedData.IsLinked)
			{
				this.isLinked(ExtendedData.IsLinked);
			}
			if (ExtendedData.IsDefault)
			{
				this.isDefault(ExtendedData.IsDefault);
			}
			if (ExtendedData.OutgoingMailAuth)
			{
				this.outgoingMailAuth(ExtendedData.OutgoingMailAuth);
			}
			if (ExtendedData.OutgoingMailLogin)
			{
				this.outgoingMailLogin(ExtendedData.OutgoingMailLogin);
			}
			if (ExtendedData.OutgoingMailPort)
			{
				this.outgoingMailPort(ExtendedData.OutgoingMailPort);
			}
			if (ExtendedData.OutgoingMailServer)
			{
				this.outgoingMailServer(ExtendedData.OutgoingMailServer);
			}
			this.setExtensions(ExtendedData.Extensions);
		}
	};
	
	CAccountModel.prototype.changeAccount = function()
	{
		AppData.Accounts.changeCurrentAccount(this.id());
	};
	
	/**
	 * @param {string} sEmail
	 * 
	 * return {?}
	 */
	CAccountModel.prototype.getFetcherByEmail = function(sEmail)
	{
		var aFetchers = this.fetchers() ? this.fetchers().collection() : [];
		
		return _.find(aFetchers, function (oFetcher) {
			return oFetcher.email() === sEmail;
		});
	};
	
	/**
	 * @constructor
	 */
	function CAccountListModel()
	{
		this.defaultId = ko.observable(0);
		this.currentId = ko.observable(0);
		this.editedId = ko.observable(0);
		
		this.currentId.subscribe(function(value) {
			var oCurrentAccount = this.getCurrent();
			oCurrentAccount.requestExtensions();
			
			// deferred execution to edited account has changed a bit later and did not make a second request 
			// of the folder list of the same account.
			_.defer(_.bind(function () {
				this.editedId(value);
			}, this));
		}, this);
	
		this.collection = ko.observableArray([]);
	}
	
	/**
	 * Changes current account. Sets hash to show new account data.
	 * 
	 * @param {number} iNewCurrentId
	 */
	CAccountListModel.prototype.changeCurrentAccount = function (iNewCurrentId)
	{
		var
			oCurrentAccount = this.getCurrent(),
			oNewCurrentAccount = this.getAccount(iNewCurrentId)
		;
	
		if (oNewCurrentAccount && this.currentId() !== iNewCurrentId)
		{
			oCurrentAccount.isCurrent(false);
			this.currentId(iNewCurrentId);
			oNewCurrentAccount.isCurrent(true);
			App.Routing.setHash(App.Links.inbox());
		}
	};
	
	/**
	 * Changes editable account.
	 * 
	 * @param {number} iNewEditedId
	 */
	CAccountListModel.prototype.changeEditedAccount = function (iNewEditedId)
	{
		var
			oEditedAccount = this.getEdited(),
			oNewEditedAccount = this.getAccount(iNewEditedId)
		;
		
		if (oNewEditedAccount && this.editedId() !== iNewEditedId)
		{
			oEditedAccount.isEdited(false);
			this.editedId(iNewEditedId);
			oNewEditedAccount.isEdited(true);
		}
	};
	
	/**
	 * Fills the collection of accounts. Checks for default account. If it is not listed, 
	 * then assigns a credit default the first account from the list.
	 *
	 * @param {number} iDefaultId
	 * @param {Array} aAccounts
	 */
	CAccountListModel.prototype.parse = function (iDefaultId, aAccounts)
	{
		var
			oAccount = null,
			bHasDefault = false
		;
	
		if (_.isArray(aAccounts))
		{
			this.collection(_.map(aAccounts, function (oRawAccount)
			{
				var oAcct = new CAccountModel();
				oAcct.parse(oRawAccount, iDefaultId);
				if (oAcct.id() === iDefaultId)
				{
					bHasDefault = true;
				}
				return oAcct;
			}));
		}
	
		if (!bHasDefault && this.collection.length > 0)
		{
			oAccount = this.collection()[0];
			iDefaultId = oAccount.id();
			bHasDefault = true;
		}
	
		if (bHasDefault)
		{
			this.defaultId(iDefaultId);
			this.currentId(iDefaultId);
			this.editedId(iDefaultId);
		}
	};
	
	/**
	 * @param {number} iId
	 * 
	 * @return {Object|undefined}
	 */
	CAccountListModel.prototype.getAccount = function (iId)
	{
		var oAccount = _.find(this.collection(), function (oAcct) {
			return oAcct.id() === iId;
		}, this);
		
		/**	@type {Object|undefined} */
		return oAccount;
	};
	
	/**
	 * @return {Object|undefined}
	 */
	CAccountListModel.prototype.getCurrent = function ()
	{
		var oAccount = _.find(this.collection(), function (oAcct) {
			return oAcct.id() === this.currentId();
		}, this);
	//console.log(oAccount.email());
		/**	@type {Object|undefined} */
		return oAccount;
	};
	
	/**
	 * @return {Object|undefined}
	 */
	CAccountListModel.prototype.getDefault = function ()
	{
		var oAccount = _.find(this.collection(), function (oAcct) {
			return oAcct.id() === this.defaultId();
		}, this);
		
		/**	@type {Object|undefined} */
		return oAccount;
	};
	
	/**
	 * @return {string}
	 */
	CAccountListModel.prototype.getEmail = function ()
	{
		var
			sEmail = '',
			oAccount = AppData.Accounts.getCurrent()
		;
		
		if (oAccount)
		{
			sEmail = oAccount.email();
		}
		
		return sEmail;
	};
	
	/**
	 * @return {Object|undefined}
	 */
	CAccountListModel.prototype.getEdited = function ()
	{
		var oAccount = _.find(this.collection(), function (oAcct) {
			return oAcct.id() === this.editedId();
		}, this);
		
		/**	@type {Object|undefined} */
		return oAccount;
	};
	
	/**
	 * @param {Object} oAccount
	 */
	CAccountListModel.prototype.addAccount = function (oAccount)
	{
		this.collection.push(oAccount);
	};
	
	/**
	 * @param {number} iId
	 */
	CAccountListModel.prototype.deleteAccount = function (iId)
	{
		if (this.currentId() === iId)
		{
			this.changeCurrentAccount(this.defaultId());
		}
		
		if (this.editedId() === iId)
		{
			this.changeEditedAccount(this.defaultId());
		}
		
		this.collection.remove(function (oAcct){return oAcct.id() === iId;});
	};
	
	/**
	 * @param {number} iId
	 * 
	 * @return {boolean}
	 */
	CAccountListModel.prototype.hasAccountWithId = function (iId)
	{
		var oAccount = _.find(this.collection(), function (oAcct) {
			return oAcct.id() === iId;
		}, this);
	
		return !!oAccount;
	};
	
	/**
	 * @constructor
	 */
	function CAddressModel()
	{
		this.sName = '';
		/** @type {string} */
		this.sEmail = '';
	}
	
	/**
	 * @param {Object} oData
	 */
	CAddressModel.prototype.parse = function (oData)
	{
		if (oData !== null)
		{
			this.sName = oData.DisplayName;
			if (typeof this.sName !== 'string')
			{
				this.sName = '';
			}
			this.sEmail = oData.Email;
			if (typeof this.sEmail !== 'string')
			{
				this.sEmail = '';
			}
		}
	};
	
	/**
	 * @return {string}
	 */
	CAddressModel.prototype.getEmail = function ()
	{
		return this.sEmail;
	};
	
	/**
	 * @return {string}
	 */
	CAddressModel.prototype.getName = function ()
	{
		return this.sName;
	};
	
	/**
	 * @return {string}
	 */
	CAddressModel.prototype.getDisplay = function ()
	{
		return (this.sName.length > 0) ? this.sName : this.sEmail;
	};
	
	/**
	 * @return {string}
	 */
	CAddressModel.prototype.getFull = function ()
	{
		var sFull = '';
		if (this.sEmail.length > 0)
		{
			if (this.sName.length > 0)
			{
				sFull = '"' + this.sName + '" <' + this.sEmail + '>';
			}
			else
			{
				sFull = this.sEmail;
			}
		}
		else
		{
			sFull = this.sName;
		}
		return sFull;
	};
	
	/**
	 * @constructor
	 */
	function CAddressListModel()
	{
		this.aCollection = [];
	}
	
	/**
	 * @param {Array} aData
	 */
	CAddressListModel.prototype.parse = function (aData)
	{
		this.aCollection = _.map(aData, function (oItem) {
			var oAddress = new CAddressModel();
			oAddress.parse(oItem);
			return oAddress;
		});
	};
	
	/**
	 * @param {Array} aCollection
	 */
	CAddressListModel.prototype.addCollection = function (aCollection)
	{
		_.each(aCollection, function (oAddress) {
			var oFoundAddress = _.find(this.aCollection, function (oThisAddress) {
				return oAddress.sEmail === oThisAddress.sEmail;
			});
			
			if (!oFoundAddress)
			{
				this.aCollection.push(oAddress);
			}
		}, this);
	};
	
	/**
	 * @param {Array} aCollection
	 */
	CAddressListModel.prototype.excludeCollection = function (aCollection)
	{
		_.each(aCollection, function (oAddress) {
			this.aCollection = _.filter(this.aCollection, function (oThisAddress) {
				return oAddress.sEmail !== oThisAddress.sEmail;
			});
		}, this);
	};
	
	/**
	 * @return {string}
	 */
	CAddressListModel.prototype.getFirstEmail = function ()
	{
		if (this.aCollection.length > 0)
		{
			return this.aCollection[0].getEmail();
		}
		
		return '';
	};
	
	/**
	 * @return {string}
	 */
	CAddressListModel.prototype.getFirstName = function ()
	{
		if (this.aCollection.length > 0)
		{
			return this.aCollection[0].getName();
		}
		
		return '';
	};
	
	/**
	 * @return {string}
	 */
	CAddressListModel.prototype.getDisplay = function ()
	{
		var aAddresses = _.map(this.aCollection, function (oAddress) {
			return oAddress.getDisplay();
		});
		
		return aAddresses.join(', ');
	};
	
	/**
	 * @return {string}
	 */
	CAddressListModel.prototype.getFull = function ()
	{
		var aAddresses = _.map(this.aCollection, function (oAddress) {
			return oAddress.getFull();
		});
		
		return aAddresses.join(', ');
	};
	
	
	/**
	 * @constructor
	 */
	function CDateModel()
	{
		this.oMoment = null;
	}
	
	/**
	 * @param {number} iTimeStampInUTC
	 */
	CDateModel.prototype.parse = function (iTimeStampInUTC)
	{
		this.oMoment = moment.unix(iTimeStampInUTC);
	};
	
	/**
	 * @param {number} iYear
	 * @param {number} iMonth
	 * @param {number} iDay
	 */
	CDateModel.prototype.setDate = function (iYear, iMonth, iDay)
	{
		this.oMoment = moment([iYear, iMonth, iDay]);
	};
	
	/**
	 * @return {string}
	 */
	CDateModel.prototype.getTimeFormat = function ()
	{
		return (AppData.User.defaultTimeFormat() === Enums.TimeFormat.F24) ?
			'HH:mm' : 'hh:mm A';
	};
	
	/**
	 * @return {string}
	 */
	CDateModel.prototype.getFullDate = function ()
	{
		return (this.oMoment) ? this.oMoment.format('ddd, MMM D, YYYY, ' + this.getTimeFormat()) : '';
	};
	
	/**
	 * @return {string}
	 */
	CDateModel.prototype.getMidDate = function ()
	{
		return this.getShortDate(true);
	};
	
	/**
	 * @param {boolean=} bTime = false
	 * 
	 * @return {string}
	 */
	CDateModel.prototype.getShortDate = function (bTime)
	{
		var
			sResult = '',
			oMomentNow = null
		;
	
		if (this.oMoment)
		{
			oMomentNow = moment();
	
			if (oMomentNow.format('L') === this.oMoment.format('L'))
			{
				sResult = this.oMoment.format(this.getTimeFormat());
			}
			else
			{
				if (oMomentNow.clone().subtract('days', 1).format('L') === this.oMoment.format('L'))
				{
					sResult = Utils.i18n('DATETIME/YESTERDAY');
				}
				else if (oMomentNow.year() === this.oMoment.year())
				{
					sResult = this.oMoment.format('MMM D');
				}
				else
				{
					sResult = this.oMoment.format('MMM D, YYYY');
				}
	
				if (Utils.isUnd(bTime) ? false : !!bTime)
				{
					sResult += ', ' + this.oMoment.format(this.getTimeFormat());
				}
			}
		}
	
		return sResult;
	};
	
	/**
	 * @return {string}
	 */
	CDateModel.prototype.getDate = function ()
	{
		return (this.oMoment) ? this.oMoment.format('ddd, MMM D, YYYY') : '';
	};
	
	/**
	 * @return {string}
	 */
	CDateModel.prototype.getTime = function ()
	{
		return (this.oMoment) ? this.oMoment.format(this.getTimeFormat()): '';
	};
	
	/**
	 * @param {string} iDate
	 * 
	 * @return {string}
	 */
	CDateModel.prototype.convertDate = function (iDate)
	{
		var sFormat = Utils.getDateFormatForMoment(AppData.User.DefaultDateFormat) + ' ' + this.getTimeFormat();
		
		return moment(iDate * 1000).format(sFormat);
	};
	
	
	/**
	 * @param {string=} sFolderName = ''
	 * @param {string=} sMessageUid = ''
	 * 
	 * @constructor
	 */
	function CAttachmentModel(sFolderName, sMessageUid)
	{
		this.folderName = ko.observable(sFolderName || '');
		this.messageUid = ko.observable(sMessageUid || '');
	
		this.tempName = ko.observable('');
		this.fileName = ko.observable('');
		this.extension = ko.computed(function () {
			var iDotPos = this.fileName().lastIndexOf('.');
			return this.fileName().substr(iDotPos + 1);
		}, this);
		this.mimePartIndex = ko.observable('');
		this.type = ko.observable('');
		this.size = ko.observable(0);
		this.friendlySize = ko.computed(function () {
			return Utils.friendlySize(this.size());
		}, this);
	
		this.downloadTitle = ko.computed(function () {
			return Utils.i18n('MESSAGE/ATTACHMENT_CLICK_TO_DOWNLOAD', {
				'FILENAME': this.fileName(),
				'SIZE': this.friendlySize()
			});
		}, this);
	
		this.cid = ko.observable('');
		this.inline = ko.observable(false);
		this.linked = ko.observable(false);
		this.thumb = ko.observable(false);
		this.hash = ko.observable('');
		this.accountId = ko.observable(0);
		this.download = ko.computed(function () {
			return Utils.getDownloadLinkByHash(this.accountId(), this.hash());
		}, this);
		this.viewLink = ko.computed(function () {
			return Utils.getViewLinkByHash(this.accountId(), this.hash());
		}, this);
		this.viewThumbnailLink = ko.computed(function () {
			var iId = this.accountId(), sHash = this.hash();
			return this.thumb() ? Utils.getViewThumbnailLinkByHash(iId, sHash) : '';
		}, this);
	
		this.uploadUid = ko.observable('');
		this.uploaded = ko.observable(false);
		this.uploadError = ko.observable(false);
		this.isMessageType = ko.computed(function () {
			return (this.type() === 'message/rfc822' && this.mimePartIndex() !== '');
		}, this);
		this.messagePart = ko.observable(null);
		this.visibleViewLink = ko.computed(function () {
			var bAllowedType = (-1 !== $.inArray(this.type(), aViewMimeTypes));
			return this.uploaded() && !this.uploadError() && (bAllowedType || this.isMessageType());
		}, this);
		this.visibleSpinner = ko.observable(false);
		this.statusText = ko.observable('');
		this.progressPercent = ko.observable(0);
		this.visibleProgress = ko.observable(false);
		
		this.uploadStarted = ko.observable(false);
		this.uploadStarted.subscribe(function () {
			if (this.uploadStarted())
			{
				this.uploaded(false);
				this.visibleProgress(true);
				this.progressPercent(20);
			}
			else
			{
				this.progressPercent(100);
				this.visibleProgress(false);
				this.uploaded(true);
			}
		}, this);
	}
	
	/**
	 * Parses attachment data from server.
	 *
	 * @param {AjaxAttachmenResponse} oData
	 * @param {number} iAccountId
	 */
	CAttachmentModel.prototype.parse = function (oData, iAccountId)
	{
		if (oData['@Object'] === 'Object/CApiMailAttachment')
		{
			if (oData.FileName)
			{
				this.fileName(oData.FileName.toString());
			}
			if (oData.TempName)
			{
				this.tempName(oData.TempName.toString());
			}
			else
			{
				this.tempName(this.fileName());
			}
			this.mimePartIndex(oData.MimePartIndex.toString());
			this.type(oData.MimeType.toString());
			this.size(parseInt(oData.EstimatedSize, 10));
	
			this.cid(oData.CID.toString());
			this.inline(!!oData.IsInline);
			this.linked(!!oData.IsLinked);
			this.thumb(!!oData.Thumb);
			this.hash(oData.Hash);
			this.accountId(iAccountId);
	
			this.uploadUid(this.hash());
			this.uploaded(true);
		}
	};
	
	/**
	 * Parses contact attachment data from server.
	 *
	 * @param {AjaxFileDataResponse} oData
	 * @param {number} iAccountId
	 */
	CAttachmentModel.prototype.parseFromContact = function (oData, iAccountId)
	{
		this.fileName(oData.Name.toString());
		this.tempName(oData.TempName ? oData.TempName.toString() : this.fileName());
		this.type(oData.MimeType.toString());
		this.size(parseInt(oData.Size, 10));
	
		this.hash(oData.Hash);
		this.accountId(iAccountId);
	
		this.uploadUid(this.hash());
		this.uploaded(true);
		
		this.uploadStarted(false);
	};
	
	CAttachmentModel.prototype.errorFromContact = function ()
	{
		this.uploaded(true);
		this.uploadError(true);
		this.uploadStarted(false);
		this.statusText(Utils.i18n('COMPOSE/UPLOAD_ERROR_UNKNOWN'));
	};
	
	/**
	 * Fills attachment data for upload.
	 *
	 * @param {string} sUid
	 * @param {Object} oFileData
	 */
	CAttachmentModel.prototype.onUploadSelect = function (sUid, oFileData)
	{
		this.fileName(oFileData['FileName']);
		this.type(oFileData['Type']);
		this.size(Utils.pInt(oFileData['Size']));
	
		this.uploadUid(sUid);
		this.uploaded(false);
		this.visibleSpinner(false);
		this.statusText('');
		this.progressPercent(0);
		this.visibleProgress(false);
	};
	
	/**
	 * Starts spinner and progress.
	 */
	CAttachmentModel.prototype.onUploadStart = function ()
	{
		this.visibleSpinner(true);
		this.visibleProgress(true);
	};
	
	/**
	 * Fills progress upload data.
	 *
	 * @param {number} iUploadedSize
	 * @param {number} iTotalSize
	 */
	CAttachmentModel.prototype.onUploadProgress = function (iUploadedSize, iTotalSize)
	{
		if (iTotalSize > 0)
		{
			this.progressPercent(Math.ceil(iUploadedSize / iTotalSize * 100));
			this.visibleProgress(true);
		}
	};
	
	/**
	 * Fills data when upload has completed.
	 *
	 * @param {string} sUid
	 * @param {boolean} bResponseReceived
	 * @param {{Error:string,AccountID:number,Result:{Attachment:AjaxUploadAttachmenResponse}}} oResult
	 */
	CAttachmentModel.prototype.onUploadComplete = function (sUid, bResponseReceived, oResult)
	{
		var
			bError = !bResponseReceived || !oResult || oResult.Error,
			sError = (oResult && oResult.Error === 'size') ?
				Utils.i18n('COMPOSE/UPLOAD_ERROR_SIZE') :
				Utils.i18n('COMPOSE/UPLOAD_ERROR_UNKNOWN')
		;
	
		if (!bError && !(oResult && oResult.AccountID))
		{
			bError = true;
		}
	
		this.visibleSpinner(false);
		this.progressPercent(0);
		this.visibleProgress(false);
	
		if (bError)
		{
			this.uploaded(true);
			this.uploadError(true);
			this.statusText(sError);
		}
		else
		{
			
			this.cid(sUid);
			this.tempName(oResult.Result.Attachment.TempName);
			this.uploadError(false);
			this.uploaded(true);
			this.statusText(Utils.i18n('COMPOSE/UPLOAD_COMPLETE'));
			this.type(oResult.Result.Attachment.MimeType);
			this.size(oResult.Result.Attachment.Size);
			this.hash(oResult.Result.Attachment.Hash);
			this.accountId(oResult.AccountID);
			setTimeout((function (self) {
				return function () {
					self.statusText('');
				};
			})(this), 3000);
		}
	};
	
	/**
	 * @param {AjaxDefaultResponse} oData
	 * @param {Object=} oParameters
	 */
	CAttachmentModel.prototype.onMessageResponse = function (oData, oParameters)
	{
		var
			oResult = oData.Result,
			oMessage = new CMessageModel()
		;
		
		if (oResult && this.oNewWindow)
		{
			oMessage.parse(oResult, oData.AccountID, false, true);
			this.messagePart(oMessage);
			this.messagePart().viewMessage(this.oNewWindow);
			this.oNewWindow = undefined;
		}
	};
	
	/**
	 * Starts viewing attachment on click.
	 */
	CAttachmentModel.prototype.viewAttachment = function ()
	{
		var
			oWin = null,
			sLoadingText = '<div style="margin: 30px; text-align: center; font: normal 14px Tahoma;">' + 
				Utils.i18n('MAIN/LOADING') + '</div>',
			sUrl = Utils.getAppPath() + this.viewLink()
		;
		
		if (this.isMessageType())
		{
			oWin = Utils.WindowOpener.open('', this.fileName());
			if (oWin)
			{
				if (this.messagePart())
				{
					this.messagePart().viewMessage(oWin);
				}
				else
				{
					var
						oParameters = {
							'Action': 'Message',
							'Folder': this.folderName(),
							'Uid': this.messageUid(),
							'Rfc822MimeIndex': this.mimePartIndex()
						}
					;
	
					$(oWin.document.body).html(sLoadingText);
					this.oNewWindow = oWin;
					App.Ajax.send(oParameters, this.onMessageResponse, this);
				}
				oWin.focus();
			}
		}
		else if (this.visibleViewLink() && this.viewLink().length > 0 && this.viewLink() !== '#')
		{
			sUrl = Utils.getAppPath() + this.viewLink();
			oWin = Utils.WindowOpener.open(sUrl, sUrl, false);
	
			if (oWin)
			{
				oWin.focus();
			}
		}
	};
	
	/**
	 * Starts downloading attachment on click.
	 */
	CAttachmentModel.prototype.downloadAttachment = function ()
	{
		if (this.download().length > 0 && this.download() !== '#')
		{
			App.downloadByUrl(this.download());
		}
	};
	
	/**
	 * @param {Object} oAttachment
	 * @param {*} oEvent
	 * @return {boolean}
	 */
	CAttachmentModel.prototype.eventDragStart = function (oAttachment, oEvent)
	{
		var oLocalEvent = oEvent.originalEvent || oEvent;
		if (oAttachment && oLocalEvent && oLocalEvent.dataTransfer && oLocalEvent.dataTransfer.setData)
		{
			oLocalEvent.dataTransfer.setData('DownloadURL', this.generateTransferDownloadUrl());
		}
	
		return true;
	};
	
	/**
	 * @return {string}
	 */
	CAttachmentModel.prototype.generateTransferDownloadUrl = function ()
	{
		var sLink = this.download();
		if ('http' !== sLink.substr(0, 4))
		{
			sLink = window.location.protocol + '//' + window.location.host + window.location.pathname + sLink;
		}
	
		return this.type() + ':' + this.fileName() + ':' + sLink;
	};
	
	/**
	 * @constructor
	 */
	function CFolderModel()
	{
		this.iAccountId = 0;
	
		this.account = ko.computed(function () {
			return AppData.Accounts.getAccount(this.iAccountId);
		}, this);
		
		this.level = ko.observable(0);
		this.name = ko.observable('');
		this.nameForEdit = ko.observable('');
		this.fullName = ko.observable('');
		this.fullNameHash = ko.observable();
		this.uidNext = ko.observable('');
		this.hash = ko.observable('');
		this.routingHash = ko.observable('');
		this.delimiter = ko.observable('');
		this.type = ko.observable(Enums.FolderTypes.User);
		this.showUnseenMessages = ko.computed(function () {
			return (this.type() !== Enums.FolderTypes.Drafts);
		}, this);
		this.withoutThreads = ko.computed(function () {
			return (this.type() === Enums.FolderTypes.Drafts || 
				this.type() === Enums.FolderTypes.Spam || this.type() === Enums.FolderTypes.Trash);
		}, this);
	
		this.messageCount = ko.observable(0);
		this.unseenMessageCount = ko.observable(0);
		this.messageCountToShow = ko.computed(function () {
			return (this.showUnseenMessages()) ? this.unseenMessageCount() : this.messageCount();
		}, this);
		this.enableEmptyFolder = ko.computed(function () {
			return (this.messageCount() > 0 &&
				(this.type() === Enums.FolderTypes.Spam || this.type() === Enums.FolderTypes.Trash));
		}, this);
		
		this.virtual = ko.observable(false);
		this.virtualEmpty = ko.computed(function () {
			return this.virtual() && this.messageCount() === 0;
		}, this);
		
		this.hasExtendedInfo = ko.observable(false);
	
		this.selectable = ko.observable(true);
		this.subscribed = ko.observable(true);
		this.existen = ko.observable(true);
		this.subfolders = ko.observableArray([]);
		this.isNamespace = ko.observable(false);
		
		this.isSubFolder = ko.computed(function () {
			return (this.level() > 0);
		}, this);
	
		this.selected = ko.observable(false);
		this.recivedAnim = ko.observable(false).extend({'autoResetToFalse': 500});
	
		this.hasSubscribedSubfolders = ko.computed(function () {
			return !!ko.utils.arrayFirst(this.subfolders(), function (oFolder) {
				return oFolder.subscribed();
			});
		}, this);
	
		this.isSystem = ko.computed(function () {
			return (this.type() !== Enums.FolderTypes.User ? true : false);
		}, this);
	
		this.visible = ko.computed(function () {
			var
				bSubScribed = this.subscribed(),
				bExisten = this.existen(),
				bSelectable = this.selectable(),
				bSubFolders = this.hasSubscribedSubfolders(),
				bSystem = this.isSystem()
			;
	
			return bSubScribed || bSystem || (bSubFolders && (!bExisten || !bSelectable));
	
		}, this);
	
		this.edited = ko.observable(false);
		
		this.edited.subscribe(function (value) {
			if (value === false)
			{
				this.nameForEdit(this.name());
			}
		}, this);
	
		this.canBeSelected = ko.computed(function () {
			var
				bExisten = this.existen(),
				bSelectable = this.selectable()
			;
	
			return bExisten && bSelectable;
		}, this);
		
		this.canSubscribe = ko.computed(function () {
			var
				oAccount = this.account(),
				bDisableManageSubscribe = false
			;
			
			if (oAccount)
			{
				bDisableManageSubscribe = oAccount.extensionExists('DisableManageSubscribe');
			}
			
			return (!this.isSystem() && this.canBeSelected() && !bDisableManageSubscribe);
		}, this);
	
		this.canDelete = ko.computed(function () {
			return (!this.isSystem() && this.hasExtendedInfo() && this.messageCount() === 0 && this.subfolders().length === 0);
		}, this);
	
		this.canRename = ko.computed(function () {
			return (!this.isSystem() && this.canBeSelected());
		}, this);
	
		this.usedAs = ko.computed(function () {
			var 
				result = ''
			;
			
			switch (this.type())
			{
				case Enums.FolderTypes.Inbox:
					result = Utils.i18n('SETTINGS/ACCOUNT_FOLDERS_USED_AS_INBOX');
					break;
				case Enums.FolderTypes.Sent:
					result = Utils.i18n('SETTINGS/ACCOUNT_FOLDERS_USED_AS_SENT');
					break;
				case Enums.FolderTypes.Drafts:
					result = Utils.i18n('SETTINGS/ACCOUNT_FOLDERS_USED_AS_DRAFTS');
					break;
				case Enums.FolderTypes.Trash:
					result = Utils.i18n('SETTINGS/ACCOUNT_FOLDERS_USED_AS_TRASH');
					break;
				case Enums.FolderTypes.Spam:
					result = Utils.i18n('SETTINGS/ACCOUNT_FOLDERS_USED_AS_SPAM');
					break;
				default:
					result =  '';
					break;
			}
			
		    return result;
		}, this);
	
		this.oMessages = {};
		
		this.oUids = {};
	
		this.aResponseHandlers = [];
		
		this.displayName = ko.computed(function () {
			var 
				result = this.name()
			;
			
			switch (this.type())
			{
				case Enums.FolderTypes.Inbox:
					result = Utils.i18n('MAIN/FOLDER_INBOX');
					break;
				case Enums.FolderTypes.Sent:
					result = Utils.i18n('MAIN/FOLDER_SENT');
					break;
				case Enums.FolderTypes.Drafts:
					result = Utils.i18n('MAIN/FOLDER_DRAFTS');
					break;
				case Enums.FolderTypes.Trash:
					result = Utils.i18n('MAIN/FOLDER_TRASH');
					break;
				case Enums.FolderTypes.Spam:
					result = Utils.i18n('MAIN/FOLDER_SPAM');
					break;
			}
			
		    return result;
		}, this);
		
		this.aRequestedUids = [];
		this.requestedLists = [];
		
		this.hasChanges = ko.observable(false);
		this.hasChanges.subscribe(function () {
			this.requestedLists = [];
		}, this);
	}
	
	/**
	 * @param {Object} oMessage
	 */
	CFolderModel.prototype.hideThreadMessages = function (oMessage)
	{
		_.each(oMessage.threadUids(), function (sThreadUid) {
			var oMess = this.oMessages[sThreadUid];
			if (oMess)
			{
				if (!oMess.deleted())
				{
					oMess.threadShowAnimation(false);
					oMess.threadHideAnimation(true);
				}
			}
		}, this);
	};
	
	/**
	 * @param {Object} oMessage
	 */
	CFolderModel.prototype.getThreadMessages = function (oMessage)
	{
		var
			aLoadedMessages = [],
			aUidsForLoad = [],
			aChangedThreadUids = [],
			iCount = 0,
			oLastMessage = null,
			iShowThrottle = 50
		;
		
		_.each(oMessage.threadUids(), function (sThreadUid) {
			if (iCount < oMessage.threadCountForLoad())
			{
				var oMess = this.oMessages[sThreadUid];
				if (oMess)
				{
					if (!oMess.deleted())
					{
						oMess.markAsThreadPart(iShowThrottle);
						aLoadedMessages.push(oMess);
						aChangedThreadUids.push(oMess.uid());
						iCount++;
						oLastMessage = oMess;
					}
				}
				else
				{
					aUidsForLoad.push(sThreadUid);
					aChangedThreadUids.push(sThreadUid);
					iCount++;
				}
			}
			else
			{
				aChangedThreadUids.push(sThreadUid);
			}
		}, this);
		
		if (!oMessage.threadLoading())
		{
			this.loadThreadMessages(aUidsForLoad);
		}
		
		oMessage.changeThreadUids(aChangedThreadUids, aLoadedMessages.length);
		
		if (oLastMessage && aLoadedMessages.length < oMessage.threadUids().length)
		{
			oLastMessage.showNextLoadingLink(_.bind(oMessage.increaseThreadCountForLoad, oMessage));
		}
		
		this.addThreadUidsToUidLists(oMessage.uid(), oMessage.threadUids());
		
		return aLoadedMessages;
	};
	
	CFolderModel.prototype.addThreadUidsToUidLists = function (sUid, aThreadUids)
	{
		_.each(this.oUids, function (oUidSearchList) {
			_.each(oUidSearchList, function (oUidList) {
				oUidList.addThreadUids(sUid, aThreadUids);
			});
		});
	};
	
	/**
	 * @param {Array} aUidsForLoad
	 */
	CFolderModel.prototype.loadThreadMessages = function (aUidsForLoad)
	{
		if (aUidsForLoad.length > 0)
		{
			var
				oParameters = {
					'Action': 'MessageListByUids',
					'Folder': this.fullName(),
					'Uids': aUidsForLoad
				}
			;
	
			App.Ajax.send(oParameters, this.onMessageListByUidsResponse, this);
		}
	};
	
	/**
	 * @param {Array} aUids
	 */
	CFolderModel.prototype.getUidsWithThread = function (aUids)
	{
		var
			aThreadUids = []
		;
		
		_.each(aUids, function (sUid) {
			var oMessage = this.oMessages[sUid];
			if (oMessage && !oMessage.threadOpened())
			{
				aThreadUids = _.union(aThreadUids, oMessage.threadUids());
			}
		}, this);
		
		return _.union(aUids, aThreadUids);
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CFolderModel.prototype.onMessageListByUidsResponse = function (oData, oParameters)
	{
		var oResult = oData.Result;
		
		if (oResult && oResult['@Object'] === 'Collection/MessageCollection')
		{
			_.each(oResult['@Collection'], function (oRawMessage) {
				var oMessage = new CMessageModel();
				oMessage.parse(oRawMessage, this.iAccountId, true, true);
				this.oMessages[oMessage.uid()] = oMessage;
			}, this);
			
			App.MailCache.showOpenedThreads(this.fullName());
		}
	};
	
	/**
	 * @param {Array} aUids
	 */
	CFolderModel.prototype.addRequestedUids = function (aUids)
	{
		this.aRequestedUids = _.union(this.aRequestedUids, aUids);
	};
	
	/**
	 * @param {string} sUid
	 */
	CFolderModel.prototype.hasUidBeenRequested = function (sUid)
	{
		return _.indexOf(this.aRequestedUids, sUid) !== -1;
	};
	
	/**
	 * @param {Object} oParams
	 */
	CFolderModel.prototype.hasListBeenRequested = function (oParams)
	{
		var
			aFindedParams = _.where(this.requestedLists, oParams),
			bHasParams = aFindedParams.length > 0
		;
		
		if (!bHasParams)
		{
			this.requestedLists.push(oParams);
		}
		return bHasParams;
	};
	
	/**
	 * @param {string} sUid
	 * @param {string} sReplyType
	 */
	CFolderModel.prototype.markMessageReplied = function (sUid, sReplyType)
	{
		var oMsg = this.oMessages[sUid];
		
		if (oMsg)
		{
			switch (sReplyType)
			{
				case Enums.ReplyType.Reply:
				case Enums.ReplyType.ReplyAll:
					oMsg.answered(true);
					break;
				case Enums.ReplyType.Forward:
					oMsg.forwarded(true);
					break;
			}
		}
	};
	
	CFolderModel.prototype.removeAllMessages = function ()
	{
		var oUidList = null;
		
		this.oMessages = {};
		this.oUids = {};
	
		this.messageCount(0);
		this.unseenMessageCount(0);
		
		oUidList = this.getUidList('', '');
		oUidList.resultCount(0);
	};
	
	CFolderModel.prototype.removeAllMessageListsFromCacheIfHasChanges = function ()
	{
		if (this.hasChanges())
		{
			this.oUids = {};
			this.requestedLists = [];
			this.hasChanges(false);
		}
	};
	
	CFolderModel.prototype.removeFlaggedMessageListsFromCache = function ()
	{
		_.each(this.oUids, function (oSearchUids, sSearch) {
			delete this.oUids[sSearch][Enums.FolderFilter.Flagged];
		}, this);
	};
	
	/**
	 * @param {string} sUidNext
	 * @param {string} sHash
	 * @param {number} iMsgCount
	 * @param {number} iMsgUnseenCount
	 */
	CFolderModel.prototype.setRelevantInformation = function (sUidNext, sHash, iMsgCount, iMsgUnseenCount)
	{
		var hasChanges = this.hasExtendedInfo() && (this.hash() !== sHash || this.unseenMessageCount() !== iMsgUnseenCount);
		
		this.uidNext(sUidNext);
		this.hash(sHash); // if different, either new messages were appeared, or some messages were deleted
		this.messageCount(iMsgCount);
		this.unseenMessageCount(iMsgUnseenCount);
		this.hasExtendedInfo(true);
		
		if (hasChanges)
		{
			this.markHasChanges();
		}
		
		return hasChanges;
	};
	
	CFolderModel.prototype.markHasChanges = function ()
	{
		this.hasChanges(true);
	};
	
	/**
	 * @param {number} iDiff
	 * @param {number} iUnseenDiff
	 */
	CFolderModel.prototype.addMessagesCountsDiff = function (iDiff, iUnseenDiff)
	{
		var
			iCount = this.messageCount() + iDiff,
			iUnseenCount = this.unseenMessageCount() + iUnseenDiff
		;
	
		if (iCount < 0)
		{
			iCount = 0;
		}
		this.messageCount(iCount);
	
		if (iUnseenCount < 0)
		{
			iUnseenCount = 0;
		}
		if (iUnseenCount > iCount)
		{
			iUnseenCount = iCount;
		}
		this.unseenMessageCount(iUnseenCount);
	};
	
	/**
	 * @param {Array} aUids
	 */
	CFolderModel.prototype.markDeletedByUids = function (aUids)
	{
		var
			iMinusDiff = 0,
			iUnseenMinusDiff = 0
		;
	
		_.each(aUids, function (sUid)
		{
			var oMessage = this.oMessages[sUid];
	
			if (oMessage)
			{
				iMinusDiff++;
				if (!oMessage.seen())
				{
					iUnseenMinusDiff++;
				}
				oMessage.deleted(true);
			}
	
		}, this);
	
		this.addMessagesCountsDiff(-iMinusDiff, -iUnseenMinusDiff);
		
		return {MinusDiff: iMinusDiff, UnseenMinusDiff: iUnseenMinusDiff};
	};
	
	/**
	 * @param {Array} aUids
	 */
	CFolderModel.prototype.revertDeleted = function (aUids)
	{
		var
			iPlusDiff = 0,
			iUnseenPlusDiff = 0
		;
	
		_.each(aUids, function (sUid)
		{
			var oMessage = this.oMessages[sUid];
	
			if (oMessage && oMessage.deleted())
			{
				iPlusDiff++;
				if (!oMessage.seen())
				{
					iUnseenPlusDiff++;
				}
				oMessage.deleted(false);
			}
	
		}, this);
	
		this.addMessagesCountsDiff(iPlusDiff, iUnseenPlusDiff);
	
		return {PlusDiff: iPlusDiff, UnseenPlusDiff: iUnseenPlusDiff};
	};
	
	/**
	 * @param {Array} aUids
	 */
	CFolderModel.prototype.commitDeleted = function (aUids)
	{
		_.each(this.oUids, function (oUidSearchList) {
			_.each(oUidSearchList, function (oUidList) {
				oUidList.deleteUids(aUids);
			});
		});
	};
	
	/**
	 * @param {string} sSearch
	 * @param {string} sFilters
	 */
	CFolderModel.prototype.getUidList = function (sSearch, sFilters)
	{
		var
			oUidList = null
		;
		
		if (this.oUids[sSearch] === undefined)
		{
			this.oUids[sSearch] = {};
		}
		
		if (this.oUids[sSearch][sFilters] === undefined)
		{
			oUidList = new CUidListModel();
			oUidList.search(sSearch);
			oUidList.filters(sFilters);
			this.oUids[sSearch][sFilters] = oUidList;
		}
		
		return this.oUids[sSearch][sFilters];
	};
	
	/**
	 * @param {Object} oResult
	 */
	CFolderModel.prototype.parse = function (oResult)
	{
		if (oResult['@Object'] === 'Object/Folder')
		{
			this.name(oResult.Name);
			this.nameForEdit(oResult.Name);
			this.fullName(oResult.FullNameRaw);
			this.fullNameHash(oResult.FullNameHash);
			this.routingHash(App.Routing.buildHashFromArray([Enums.Screens.Mailbox, this.fullName()]));
			this.delimiter(oResult.Delimiter);
			this.type(oResult.Type);
	
			this.subscribed(oResult.IsSubscribed);
			this.selectable(oResult.IsSelectable);
			this.existen(oResult.IsExisten);
			
			if (oResult.Extended)
			{
				this.setRelevantInformation(oResult.Extended.UidNext.toString(), oResult.Extended.Hash, 
					oResult.Extended.MessageCount, oResult.Extended.MessageUnseenCount);
			}
	
			return oResult.SubFolders;
		}
		
		return null;
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CFolderModel.prototype.onMessageResponse = function (oData, oParameters)
	{
		var
			oResult = oData.Result,
			oHand = null,
			sUid = oResult ? oResult.Uid.toString() : oParameters.Uid.toString(),
			oMessage = this.oMessages[sUid] ? this.oMessages[sUid] : new CMessageModel(),
			bSelected = oMessage.selected()
		;
	
		if (!oResult)
		{
	
			if (bSelected)
			{
				App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('WARNING/UNKNOWN_ERROR'));
			}
	
			oMessage = null;
		}
		else
		{
			oMessage.parse(oResult, oData.AccountID, oMessage.threadPart(), true);
			if (oMessage && oMessage.ical() && oMessage.ical().isReplyType() && App.CalendarCache)
			{
				App.CalendarCache.calendarChanged(true);
			}
			this.oMessages[sUid] = oMessage;
		}
	
		oHand = this.aResponseHandlers[sUid];
		if (oHand)
		{
			oHand.handler.call(oHand.context, oMessage, sUid);
			delete this.aResponseHandlers[sUid];
		}
	};
	
	/**
	 * @param {string} sUid
	 * @param {Function} fResponseHandler
	 * @param {Object} oContext
	 */
	CFolderModel.prototype.getCompletelyFilledMessage = function (sUid, fResponseHandler, oContext)
	{
		var
			oMessage = this.oMessages[sUid],
			oParameters = {
				'Action': 'Message',
				'Folder': this.fullName(),
				'Uid': sUid
			}
		;
	
		if (sUid.length > 0)
		{
			if (!oMessage || !oMessage.completelyFilled())
			{
				if (fResponseHandler && oContext)
				{
					this.aResponseHandlers[sUid] = {handler: fResponseHandler, context: oContext};
				}
				App.Ajax.send(oParameters, this.onMessageResponse, this);
			}
			else if (fResponseHandler && oContext)
			{
				fResponseHandler.call(oContext, oMessage, sUid);
			}
		}
	};
	
	/**
	 * @param {string} sUid
	 */
	CFolderModel.prototype.showExternalPictures = function (sUid)
	{
		var oMessage = this.oMessages[sUid];
	
		if (oMessage !== undefined)
		{
			oMessage.showExternalPictures();
		}
	};
	
	/**
	 * @param {string} sEmail
	 */
	CFolderModel.prototype.alwaysShowExternalPicturesForSender = function (sEmail)
	{
		_.each(this.oMessages, function (oMessage)
		{
			var aFrom = oMessage.oFrom.aCollection;
			if (aFrom.length > 0 && aFrom[0].sEmail === sEmail)
			{
				oMessage.alwaysShowExternalPicturesForSender();
			}
		}, this);
	};
	
	/**
	 * @param {string} sField
	 * @param {Array} aUids
	 * @param {boolean} bSetAction
	 */
	CFolderModel.prototype.executeGroupOperation = function (sField, aUids, bSetAction)
	{
		var iUnseenDiff = 0;
	
		_.each(this.oMessages, function (oMessage)
		{
			if (aUids.length > 0)
			{
				_.each(aUids, function (sUid)
				{
					if (oMessage && oMessage.uid() === sUid && oMessage[sField]() !== bSetAction)
					{
						oMessage[sField](bSetAction);
						iUnseenDiff++;
					}
				});
			}
			else
			{
				oMessage[sField](bSetAction);
			}
		});
	
		if (aUids.length === 0)
		{
			iUnseenDiff = (bSetAction) ? this.unseenMessageCount() : this.messageCount() - this.unseenMessageCount();
		}
	
		if (sField === 'seen' && iUnseenDiff > 0)
		{
			if (bSetAction)
			{
				this.addMessagesCountsDiff(0, -iUnseenDiff);
			}
			else
			{
				this.addMessagesCountsDiff(0, iUnseenDiff);
			}
		}
	};
	
	CFolderModel.prototype.emptyFolder = function ()
	{
		var
			sWarning = Utils.i18n('MAILBOX/CONFIRM_EMPTY_FOLDER'),
			fCallBack = _.bind(this.clearFolder, this)
		;
		
		if (this.enableEmptyFolder())
		{
			App.Screens.showPopup(ConfirmPopup, [sWarning, fCallBack]);
		}
	};
	
	/**
	 * @param {boolean} bOkAnswer
	 */
	CFolderModel.prototype.clearFolder = function (bOkAnswer)
	{
		var
			oParameters = {
				'Action': 'FolderClear',
				'Folder': this.fullName()
			}
		;
		
		if (this.enableEmptyFolder() && bOkAnswer)
		{
			App.Ajax.send(oParameters);
	
			this.removeAllMessages();
	
			App.MailCache.onClearFolder(this);
		}
	};
	
	CFolderModel.prototype.getNameWhithLevel = function ()
	{
		var iLevel = this.level();
		
		if (!this.isNamespace() && iLevel > 0)
		{
			iLevel--;
		}
		
		return Utils.strRepeat("\u00A0", iLevel * 3) + this.name();
	};
	
	
	/**
	 * @constructor
	 */
	function CFolderListModel()
	{
		this.iAccountId = 0;
		
		this.bInitialized = ko.observable(false);
		this.collection = ko.observableArray([]);
		this.options = ko.observableArray([]);
		this.sNamespace = '';
		this.sNamespaceFolder = '';
		this.oStarredFolder = null;
	
		this.oNamedCollection = {};
	
		var
			self = this,
			fSetSystemType = function (iType) {
				return function (oFolder) {
					if (oFolder)
					{
						oFolder.type(iType);
					}
				};
			},
			fFullNameHelper = function (fFolder) {
				return {
					'read': function () {
						this.collection();
						return fFolder() ? fFolder().fullName() : '';
					},
					'write': function (sValue) {
						fFolder(this.getFolderByFullName(sValue));
					},
					'owner': self
				};
			}
		;
	
		this.totalMessageCount = ko.computed(function (){
			return this.getRecursivelyMessageCount(this.collection());
		}, this);
	
		this.currentFolder = ko.observable(null);
	
		this.inboxFolder = ko.observable(null);
		this.sentFolder = ko.observable(null);
		this.draftsFolder = ko.observable(null);
		this.spamFolder = ko.observable(null);
		this.trashFolder = ko.observable(null);
	
		this.inboxFolder.subscribe(fSetSystemType(Enums.FolderTypes.User), this, 'beforeChange');
		this.sentFolder.subscribe(fSetSystemType(Enums.FolderTypes.User), this, 'beforeChange');
		this.draftsFolder.subscribe(fSetSystemType(Enums.FolderTypes.User), this, 'beforeChange');
		this.spamFolder.subscribe(fSetSystemType(Enums.FolderTypes.User), this, 'beforeChange');
		this.trashFolder.subscribe(fSetSystemType(Enums.FolderTypes.User), this, 'beforeChange');
		
		this.inboxFolder.subscribe(fSetSystemType(Enums.FolderTypes.Inbox));
		this.sentFolder.subscribe(fSetSystemType(Enums.FolderTypes.Sent));
		this.draftsFolder.subscribe(fSetSystemType(Enums.FolderTypes.Drafts));
		this.spamFolder.subscribe(fSetSystemType(Enums.FolderTypes.Spam));
		this.trashFolder.subscribe(fSetSystemType(Enums.FolderTypes.Trash));
		
		this.inboxFolderFullName = ko.computed(fFullNameHelper(this.inboxFolder));
		this.sentFolderFullName = ko.computed(fFullNameHelper(this.sentFolder));
		this.draftsFolderFullName = ko.computed(fFullNameHelper(this.draftsFolder));
		this.spamFolderFullName = ko.computed(fFullNameHelper(this.spamFolder));
		this.trashFolderFullName = ko.computed(fFullNameHelper(this.trashFolder));
		
		this.currentFolderFullName = ko.computed(fFullNameHelper(this.currentFolder));
		this.currentFolderType = ko.computed(function () {
			return this.currentFolder() ? this.currentFolder().type() : Enums.FolderTypes.User;
		}, this);
		
		this.delimiter = ko.computed(function (){
			return this.inboxFolder() ? this.inboxFolder().delimiter() : '';
		}, this);
	}
	
	/**
	 * @return {Array}
	 */
	CFolderListModel.prototype.getFoldersWithoutCountInfo = function ()
	{
		var aFolders = _.compact(_.map(this.oNamedCollection, function(oFolder, sFullName) {
			if (oFolder.canBeSelected() && !oFolder.hasExtendedInfo())
			{
				return sFullName;
			}
			
			return null;
		}));
		
		return aFolders;
	};
	
	/**
	 * @return {Array}
	 */
	CFolderListModel.prototype.getInboxAndCurrentFoldersArray = function ()
	{
		var aFolders = [this.inboxFolderFullName()];
		
		if (this.currentFolderType() !== Enums.FolderTypes.Inbox)
		{
			aFolders.push(this.currentFolderFullName());
		}
		
		return _.compact(aFolders);
	};
	
	/**
	 * @param {string} sFolderFullName
	 * @param {string} sFilters
	 */
	CFolderListModel.prototype.setCurrentFolder = function (sFolderFullName, sFilters)
	{
		var
			oFolder = this.getFolderByFullName(sFolderFullName)
		;
		
		if (oFolder === null)
		{
			oFolder = this.inboxFolder();
		}
		
		if (oFolder !== null)
		{
			if (this.currentFolder())
			{
				this.currentFolder().selected(false);
				if (this.oStarredFolder)
				{
					this.oStarredFolder.selected(false);
				}
			}
			
			this.currentFolder(oFolder);
			if (sFilters === Enums.FolderFilter.Flagged)
			{
				if (this.oStarredFolder)
				{
					this.oStarredFolder.selected(true);
				}
			}
			else
			{
				this.currentFolder().selected(true);
			}
		}
	};
	
	/**
	 * Returns a folder, found by the type.
	 * 
	 * @param {number} iType
	 * @return {CFolderModel|null}
	 *
	 */
	CFolderListModel.prototype.getFolderByType = function (iType)
	{
		switch (iType) 
		{
			case Enums.FolderTypes.Inbox:
				return this.inboxFolder();
			case Enums.FolderTypes.Sent:
				return this.sentFolder();
			case Enums.FolderTypes.Drafts:
				return this.draftsFolder();
			case Enums.FolderTypes.Trash:
				return this.trashFolder();
			case Enums.FolderTypes.Spam:
				return this.spamFolder();
		}
		
		return null;
	};
	
	/**
	 * Returns a folder, found by the full name.
	 * 
	 * @param {string} sFolderFullName
	 */
	CFolderListModel.prototype.getFolderByFullName = function (sFolderFullName)
	{
		var
			oFolder = this.oNamedCollection[sFolderFullName]
		;
		
		return oFolder ? oFolder : null;
	};
	
	/**
	 * Calls a recursive parsing of the folder tree.
	 * 
	 * @param {number} iAccountId
	 * @param {Object} oData
	 */
	CFolderListModel.prototype.parse = function (iAccountId, oData)
	{
		this.iAccountId = iAccountId;
		this.sNamespace = Utils.pExport(oData, 'Namespace', this.sNamespace);
		this.bInitialized(true);
	
		if (this.sNamespace.length > 0)
		{
			this.sNamespaceFolder = this.sNamespace.substring(0, this.sNamespace.length - 1);
		}
		else
		{
			this.sNamespaceFolder = this.sNamespace;
		}
		
		this.collection(this.parseRecursively(oData['@Collection']));
	//	this.createStarredFolder(0);
	//	if (this.oStarredFolder)
	//	{
	//		this.collection.unshift(this.oStarredFolder);
	//	}
	};
	
	/**
	 * Recursively parses the folder tree.
	 * 
	 * @param {Array} aRowCollection
	 * @param {number=} iLevel
	 */
	CFolderListModel.prototype.parseRecursively = function (aRowCollection, iLevel)
	{
		var
			aParsedCollection = [],
			iIndex = 0,
			iLen = 0,
			oFolder = null,
			oSubFolders = null,
			aSubfolders = [],
			bFolderIsNamespace = false,
			oAccount = AppData.Accounts.getAccount(this.iAccountId)
		;
	
		if (Utils.isUnd(iLevel))
		{
			iLevel = -1;
		}
	
		iLevel++;
		if (_.isArray(aRowCollection))
		{
			for (iLen = aRowCollection.length; iIndex < iLen; iIndex++)
			{
				oFolder = new CFolderModel();
				oFolder.iAccountId = this.iAccountId;
				oSubFolders = oFolder.parse(aRowCollection[iIndex]);
	
				bFolderIsNamespace = (this.sNamespace === oFolder.fullName() + oFolder.delimiter());
				oFolder.isNamespace(bFolderIsNamespace);
				if (oSubFolders !== null)
				{
					aSubfolders = this.parseRecursively(oSubFolders['@Collection'], iLevel);
					if (oFolder.type() === Enums.FolderTypes.Inbox)
					{
						this.createStarredFolder(iLevel + 1);
						if (this.oStarredFolder)
						{
							aSubfolders.unshift(this.oStarredFolder);
						}
					}
					oFolder.subfolders(aSubfolders);
				}
				oFolder.level(iLevel);
	
				this.oNamedCollection[oFolder.fullName()] = oFolder;
	
				switch (oFolder.type())
				{
					case Enums.FolderTypes.Inbox:
						this.inboxFolder(oFolder);
						break;
					case Enums.FolderTypes.Sent:
						this.sentFolder(oFolder);
						break;
					case Enums.FolderTypes.Drafts:
						this.draftsFolder(oFolder);
						break;
					case Enums.FolderTypes.Trash:
						this.trashFolder(oFolder);
						break;
					case Enums.FolderTypes.Spam:
						if (oAccount.extensionExists('AllowSpamFolderExtension'))
						{
							this.spamFolder(oFolder);
						}
						else
						{
							oFolder.type(Enums.FolderTypes.User);
						}
						break;
				}
	
				aParsedCollection.push(oFolder);
				
				if (oSubFolders === null && oFolder.type() === Enums.FolderTypes.Inbox)
				{
					this.createStarredFolder(iLevel);
					if (this.oStarredFolder)
					{
						aParsedCollection.push(this.oStarredFolder);
					}
				}
			}
		}
	
		return aParsedCollection;
	};
	
	CFolderListModel.prototype.createStarredFolder = function (iLevel)
	{
		var oStarredFolder = new CFolderModel();
		oStarredFolder.iAccountId = this.iAccountId;
		oStarredFolder.virtual(true);
		oStarredFolder.level(iLevel);
		oStarredFolder.fullName('filter:' + Enums.FolderFilter.Flagged);
		oStarredFolder.name(Utils.i18n('MAIN/FOLDER_STARRED'));
		oStarredFolder.type(Enums.FolderTypes.Starred);
		oStarredFolder.routingHash(App.Routing.buildHashFromArray([Enums.Screens.Mailbox, oStarredFolder.fullName()]));
		this.oStarredFolder = oStarredFolder;
	};
	
	/**
	 * @param {string} sFirstItem
	 * @param {boolean=} bEnableSystem = false
	 * @param {boolean=} bHideInbox = false
	 * @param {boolean=} bIgnoreCanBeSelected = false
	 */
	CFolderListModel.prototype.getOptions = function (sFirstItem, bEnableSystem, bHideInbox, bIgnoreCanBeSelected)
	{
		var
			sDeepPrefix = '\u00A0\u00A0\u00A0\u00A0',
			fGetOptionsFromCollection = function (aOrigCollection) {
	
				var
					iIndex = 0,
					iLen = 0,
					oItem = null,
					aResCollection = []
				;
				
				if (Utils.isUnd(bEnableSystem))
				{
					bEnableSystem = false;
				}
				
				if (Utils.isUnd(bHideInbox))
				{
					bHideInbox = false;
				}
				
				if (Utils.isUnd(bIgnoreCanBeSelected))
				{
					bIgnoreCanBeSelected = false;
				}
	
				for (iIndex = 0, iLen = aOrigCollection.length; iIndex < iLen; iIndex++)
				{
					oItem = aOrigCollection[iIndex];
					
					if (!oItem.virtual() && (oItem.type() !== Enums.FolderTypes.Inbox && bHideInbox || !bHideInbox))
					{
						aResCollection.push({
							'id': oItem.fullName(),
							'name': (new Array(oItem.level() + 1)).join(sDeepPrefix) + oItem.name(),
							'displayName': (new Array(oItem.level() + 1)).join(sDeepPrefix) + oItem.displayName(),
							'disable': ((oItem.isSystem() && !bEnableSystem) || (!bIgnoreCanBeSelected && !oItem.canBeSelected()))
						});
					}
					
					aResCollection = aResCollection.concat(fGetOptionsFromCollection(oItem.subfolders()));
				}
	
				return aResCollection;
			},
			aCollection = fGetOptionsFromCollection(this.collection())
		;
	
		if (!Utils.isUnd(sFirstItem))
		{
			aCollection.unshift({
				'id': '',
				'name': sFirstItem,
				'displayName': sFirstItem,
				'disable': false
			});
		}
		
		return aCollection;
	};
	
	/**
	 * @param {Array} aList
	 */
	CFolderListModel.prototype.getRecursivelyMessageCount = function (aList)
	{
		var
			iIndex = 0,
			iLen = 0,
			oItem = null,
			iCount = 0
		;
	
		for (iIndex = 0, iLen = aList.length; iIndex < iLen; iIndex++)
		{
			oItem = aList[iIndex];
			if (!oItem.virtual())
			{
				iCount += oItem.messageCount() + this.getRecursivelyMessageCount(oItem.subfolders());
			}
		}
	
		return iCount;	
	};
	
	/**
	 * @param {Object} oFolderToDelete
	 */
	CFolderListModel.prototype.deleteFolder = function (oFolderToDelete)
	{
		var
			fRemoveFolder = function (oFolder) {
				if (oFolderToDelete && oFolderToDelete.fullName() === oFolder.fullName())
				{
					return true;
				}
				oFolder.subfolders.remove(fRemoveFolder);
				return false;
			}
		;
	
		this.collection.remove(fRemoveFolder);
	};
	
	/**
	 * @constructor
	 */
	function CMessageModel()
	{
		this.accountId = ko.observable(0);
	
		this.folder = ko.observable('');
		this.uid = ko.observable('');
		this.subject = ko.observable('');
		this.emptySubject = ko.computed(function () {
			return (Utils.trim(this.subject()) === '');
		}, this);
		this.subjectForDisplay = ko.computed(function () {
			return this.emptySubject() ? Utils.i18n('MAILBOX/EMPTY_SUBJECT') : this.subject();
		}, this);
		this.messageId = ko.observable('');
		this.size = ko.observable(0);
		this.friendlySize = ko.computed(function () {
			return Utils.friendlySize(this.size());
		}, this);
		this.textSize = ko.observable(0);
		this.oDateModel = new CDateModel();
		this.fullDate = ko.observable('');
		this.oFrom = new CAddressListModel();
		this.fullFrom = ko.observable('');
		this.oTo = new CAddressListModel();
		this.to = ko.observable('');
		this.fromOrToText = ko.observable('');
		this.oCc = new CAddressListModel();
		this.cc = ko.observable('');
		this.oBcc = new CAddressListModel();
		this.bcc = ko.observable('');
		this.oSender = new CAddressListModel();
		this.oReplyTo = new CAddressListModel();
		
		this.seen = ko.observable(false);
		
		this.flagged = ko.observable(false);
		this.answered = ko.observable(false);
		this.forwarded = ko.observable(false);
		this.hasAttachments = ko.observable(false);
		
		this.threadsAllowed = ko.computed(function () {
			var
				oFolder = App.MailCache.getFolderByFullName(this.accountId(), this.folder()),
				bFolderWithoutThreads = oFolder && (oFolder.type() === Enums.FolderTypes.Drafts || 
					oFolder.type() === Enums.FolderTypes.Spam || oFolder.type() === Enums.FolderTypes.Trash)
			;
			
			return AppData.User.useThreads() && !bFolderWithoutThreads;
		}, this);
		
		this.threadPart = ko.observable(false);
		
		this.threadUids = ko.observableArray([]);
		this.threadCount = ko.computed(function () {
			return this.threadUids().length;
		}, this);
		this.threadOpened = ko.observable(false);
		this.threadLoading = ko.observable(false);
		this.threadLoadingVisible = ko.computed(function () {
			return this.threadsAllowed() && this.threadOpened() && this.threadLoading();
		}, this);
		this.threadCountVisible = ko.computed(function () {
			return this.threadsAllowed() && this.threadCount() > 0 && !this.threadLoading();
		}, this);
		this.threadCountForLoad = ko.observable(5);
		this.threadNextLoadingVisible = ko.observable(false);
		this.threadNextLoadingLinkVisible = ko.observable(false);
		this.threadFunctionLoadNext = null;
		this.threadShowAnimation = ko.observable(false);
		this.threadHideAnimation = ko.observable(false);
		
		this.importance = ko.observable(Enums.Importance.Normal);
		this.draftInfo = ko.observableArray([]);
		this.sensitivity = ko.observable(Enums.Sensivity.Nothing);
		this.hash = ko.observable('');
		this.download = ko.computed(function () {
			return (this.hash().length > 0) ? Utils.getDownloadLinkByHash(this.accountId(), this.hash()) : '';
		}, this);
	
		this.completelyFilled = ko.observable(false);
	
		this.checked = ko.observable(false);
		this.selected = ko.observable(false);
		this.deleted = ko.observable(false); // temporary removal until it was confirmation from the server to delete
	
		this.inReplyTo = ko.observable('');
		this.references = ko.observable('');
		this.readingConfirmation = ko.observable('');
		this.isPlain = ko.observable(false);
		this.text = ko.observable('');
		this.textBodyForNewWindow = ko.observable('');
		this.$text = null;
		this.rtl = ko.observable(false);
		this.hasExternals = ko.observable(false);
		this.isExternalsShown = ko.observable(false);
		this.isExternalsAlwaysShown = ko.observable(false);
		this.foundedCids = ko.observableArray([]);
		this.attachments = ko.observableArray([]);
		this.usesAttachmentString = false;
		this.safety = ko.observable(false);
		
		this.ical = ko.observable(null);
		this.vcard = ko.observable(null);
		
		this.domMessageForPrint = ko.observable(null);
		
		this.Custom = {};
	}
	
	/**
	 * @param {Object} oWin
	 */
	CMessageModel.prototype.viewMessage = function (oWin)
	{
		var
			oDomText = this.getDomText(Utils.getAppPath()),
			sHtml = ''
		;
		
		this.textBodyForNewWindow(oDomText.html());
		sHtml = $(this.domMessageForPrint()).html();
		
		if (oWin)
		{
			$(oWin.document.body).html(sHtml);
			oWin.focus();
			_.each(this.attachments(), function (oAttach) {
				var oLink = $(oWin.document.body).find("[data-hash='download-" + oAttach.hash() + "']");
				oLink.on('click', _.bind(oAttach.downloadAttachment, oAttach));
				
				oLink = $(oWin.document.body).find("[data-hash='view-" + oAttach.hash() + "']");
				oLink.on('click', _.bind(oAttach.viewAttachment, oAttach));
			}, this);
		}
	};
	
	/**
	 * Fields accountId, folder, oTo & oFrom should be filled.
	 */
	CMessageModel.prototype.fillFromOrToText = function ()
	{
		var oFolder = App.MailCache.getFolderByFullName(this.accountId(), this.folder());
		
		if (oFolder.type() === Enums.FolderTypes.Drafts || oFolder.type() === Enums.FolderTypes.Sent)
		{
			this.fromOrToText(this.oTo.getDisplay());
		}
		else
		{
			this.fromOrToText(this.oFrom.getDisplay());
		}
	};
	
	/**
	 * @param {Array} aChangedThreadUids
	 * @param {number} iLoadedMessagesCount
	 */
	CMessageModel.prototype.changeThreadUids = function (aChangedThreadUids, iLoadedMessagesCount)
	{
		this.threadUids(aChangedThreadUids);
		this.threadLoading(iLoadedMessagesCount < Math.min(this.threadUids().length, this.threadCountForLoad()));
	};
	
	/**
	 * @param {Function} fLoadNext
	 */
	CMessageModel.prototype.showNextLoadingLink = function (fLoadNext)
	{
		if (this.threadNextLoadingLinkVisible())
		{
			this.threadNextLoadingVisible(true);
			this.threadFunctionLoadNext = fLoadNext;
		}
	};
	
	CMessageModel.prototype.increaseThreadCountForLoad = function ()
	{
		this.threadCountForLoad(this.threadCountForLoad() + 5);
		App.MailCache.showOpenedThreads(this.folder());
	};
	
	CMessageModel.prototype.loadNextMessages = function ()
	{
		if (this.threadFunctionLoadNext)
		{
			this.threadFunctionLoadNext();
			this.threadNextLoadingLinkVisible(false);
			this.threadFunctionLoadNext = null;
		}
	};
	
	/**
	 * @param {number} iShowThrottle
	 */
	CMessageModel.prototype.markAsThreadPart = function (iShowThrottle)
	{
		var self = this;
		this.threadPart(true);
		this.threadUids([]);
		this.threadNextLoadingVisible(false);
		this.threadNextLoadingLinkVisible(true);
		this.threadFunctionLoadNext = null;
		this.threadHideAnimation(false);
		
		setTimeout(function () {
			self.threadShowAnimation(true);
		}, iShowThrottle);
	};
	
	/**
	 * @param {AjaxMessageResponse} oData
	 * @param {number} iAccountId
	 * @param {boolean} bThreadPart
	 * @param {boolean} bTrustThreadInfo
	 */
	CMessageModel.prototype.parse = function (oData, iAccountId, bThreadPart, bTrustThreadInfo)
	{
		var
			oIcal = null,
			oVcard = null
		;
		
		if (bTrustThreadInfo)
		{
			this.threadPart(bThreadPart);
		}
		
		if (oData['@Object'] === 'Object/MessageListItem')
		{
			this.seen(!!oData.IsSeen);
			this.flagged(!!oData.IsFlagged);
			this.answered(!!oData.IsAnswered);
			this.forwarded(!!oData.IsForwarded);
			
			if (oData.Custom)
			{
				this.Custom = oData.Custom;
			}
		}
		
		if (oData['@Object'] === 'Object/Message' || oData['@Object'] === 'Object/MessageListItem')
		{
			this.accountId(iAccountId);
	
			this.folder(oData.Folder);
			this.uid(oData.Uid.toString());
			this.subject(oData.Subject);
			this.messageId(oData.MessageId);
			this.size(oData.Size);
			this.textSize(oData.TextSize);
			this.oDateModel.parse(oData.TimeStampInUTC);
			this.oFrom.parse(oData.From);
			this.oTo.parse(oData.To);
			this.fillFromOrToText();
			this.oCc.parse(oData.Cc);
			this.oBcc.parse(oData.Bcc);
			this.oSender.parse(oData.Sender);
			this.oReplyTo.parse(oData.ReplyTo);
			
			this.fullDate(this.oDateModel.getFullDate());
			this.fullFrom(this.oFrom.getFull());
			this.to(this.oTo.getFull());
			this.cc(this.oCc.getFull());
			this.bcc(this.oBcc.getFull());
			
			this.hasAttachments(!!oData.HasAttachments);
			
			if (oData['@Object'] === 'Object/MessageListItem' && bTrustThreadInfo)
			{
				this.threadUids(_.map(oData.Threads, function (iUid) {
					return iUid.toString();
				}, this));
			}
			
			this.importance(oData.Priority);
			if (_.isArray(oData.DraftInfo))
			{
				this.draftInfo(oData.DraftInfo);
			}
			this.sensitivity(oData.Sensitivity);
			this.hash(oData.Hash);
	
			if (oData['@Object'] === 'Object/Message')
			{
				this.inReplyTo(oData.InReplyTo);
				this.references(oData.References);
				this.readingConfirmation(oData.ReadingConfirmation);
				if (oData.Html !== '')
				{
					this.text(oData.Html);
					this.isPlain(false);
				}
				else
				{
					this.text(oData.Plain !== '' ? '<div>' + oData.Plain + '</div>' : '');
					this.isPlain(true);
				}
				this.rtl(oData.Rtl);
				this.hasExternals(!!oData.HasExternals);
				this.foundedCids(oData.FoundedCIDs);
				this.parseAttachments(oData.Attachments, iAccountId);
				this.safety(oData.Safety);
				
				if (oData.ICAL !== null)
				{
					oIcal = new CIcalModel();
					oIcal.parse(oData.ICAL);
					this.ical(oIcal);
				}
				
				if (oData.VCARD !== null)
				{
					oVcard = new CVcardModel();
					oVcard.parse(oData.VCARD);
					this.vcard(oVcard);
				}
				
				this.completelyFilled(true);
			}
		}
	};
	
	/**
	 * @param {string=} sAppPath = ''
	 */
	CMessageModel.prototype.getDomText = function (sAppPath)
	{
		var $text = this.$text;
		
		sAppPath = sAppPath || '';
		
		if (this.$text === null || sAppPath !== '')
		{
			if (this.completelyFilled())
			{
				this.$text = $(this.text());
	
				this.showInlinePictures(sAppPath);
				if (this.safety() === true)
				{
					this.alwaysShowExternalPicturesForSender();
				}
				$text = this.$text;
			}
			else
			{
				$text = $('');
			}
		}
		
		//returns a clone, because it uses both in the parent window and the new
		return $text.clone();
	};
	
	/**
	 * Parses attachments.
	 *
	 * @param {Array} aData
	 * @param {number} iAccountId
	 */
	CMessageModel.prototype.parseAttachments = function (aData, iAccountId)
	{
		if (_.isArray(aData))
		{
			this.attachments(_.map(aData, function (oRawAttach) {
				var oAttachment = new CAttachmentModel(this.folder(), this.uid());
				oAttachment.parse(oRawAttach, iAccountId);
				return oAttachment;
			}, this));
		}
	};
	
	/**
	 * Parses an array of email addresses.
	 *
	 * @param {Array} aData
	 * @return {Array}
	 */
	CMessageModel.prototype.parseAddressArray = function (aData)
	{
		var
			aAddresses = []
		;
	
		if (_.isArray(aData))
		{
			aAddresses = _.map(aData, function (oRawAddress) {
				var oAddress = new CAddressModel();
				oAddress.parse(oRawAddress);
				return oAddress;
			});
		}
	
		return aAddresses;
	};
	
	/**
	 * Finds and returns the specified Attachment cid.
	 *
	 * @param {string} sCid
	 * @return {*}
	 */
	CMessageModel.prototype.findAttachmentByCid = function (sCid)
	{
		sCid = '<' + sCid + '>';
	
		return _.find(this.attachments(), function (oAttachment) {
			return oAttachment.cid() === sCid;
		});
	};
	
	/**
	 * Displays embedded images, which have cid on the list.
	 * 
	 * @param {string} sAppPath
	 */
	CMessageModel.prototype.showInlinePictures = function (sAppPath)
	{
		var self = this;
		
		if (this.foundedCids().length > 0)
		{
			$('[data-x-src-cid]', this.$text).each(function () {
				var
					sCid = $(this).attr('data-x-src-cid'),
					oAttachment = self.findAttachmentByCid(sCid)
				;
	
				if (oAttachment && oAttachment.viewLink().length > 0)
				{
					$(this).attr('src', sAppPath + oAttachment.viewLink());
				}
			});
	
			$('[data-x-style-cid]', this.$text).each(function () {
				var
					sStyle = '',
					sName = $(this).attr('data-x-style-cid-name'),
					sCid = $(this).attr('data-x-style-cid'),
					oAttachment = self.findAttachmentByCid(sCid)
				;
	
				if (oAttachment && oAttachment.viewLink().length > 0 && '' !== sName)
				{
					sStyle = Utils.trim($(this).attr('style'));
					sStyle = '' === sStyle ? '' : (';' === sStyle.substr(-1) ? sStyle + ' ' : sStyle + '; ');
					$(this).attr('style', sStyle + sName + ': url(\'' + oAttachment.viewLink() + '\')');
				}
			});
		}
	};
	
	/**
	 * Display external images.
	 */
	CMessageModel.prototype.showExternalPictures = function ()
	{
		$('[data-x-src]', this.$text).each(function () {
			$(this).attr('src', $(this).attr('data-x-src')).removeAttr('data-x-src');
		});
	
		$('[data-x-style-url]', this.$text).each(function () {
			var sStyle = Utils.trim($(this).attr('style'));
			sStyle = '' === sStyle ? '' : (';' === sStyle.substr(-1) ? sStyle + ' ' : sStyle + '; ');
			$(this).attr('style', sStyle + $(this).attr('data-x-style-url')).removeAttr('data-x-style-url');
		});
		
		this.isExternalsShown(true);
	};
	
	/**
	 * Sets a flag that external images are always displayed.
	 */
	CMessageModel.prototype.alwaysShowExternalPicturesForSender = function ()
	{
		if (this.completelyFilled())
		{
			this.isExternalsAlwaysShown(true);
			if (!this.isExternalsShown())
			{
				this.showExternalPictures();
			}
		}
	};
	
	CMessageModel.prototype.openThread = function ()
	{
		if (this.threadCountVisible())
		{
			var sFolder = this.folder();
	
			this.threadOpened(!this.threadOpened());
			if (this.threadOpened())
			{
				App.MailCache.showOpenedThreads(sFolder);
			}
			else
			{
				App.MailCache.hideThreads(this);
				setTimeout(function () {
					App.MailCache.showOpenedThreads(sFolder);
				}, 500);
			}
		}
	};
	
	
	/**
	 * @constructor
	 * 
	 * !!!Attention!!!
	 * It is not used underscore, because the collection may contain undefined-elements.
	 * They have their own importance. But all underscore-functions removes them automatically.
	 */
	function CUidListModel()
	{
		this.resultCount = ko.observable(-1);
		
		this.search = ko.observable('');
		this.filters = ko.observable('');
		
		this.collection = ko.observableArray([]);
		
		this.threadUids = {};
	}
	
	/**
	 * @param {string} sUid
	 * @param {Array} aThreadUids
	 */
	CUidListModel.prototype.addThreadUids = function (sUid, aThreadUids)
	{
		if (-1 !== _.indexOf(this.collection(), sUid))
		{
			this.threadUids[sUid] = aThreadUids;
		}
	};
	
	/**
	 * @param {Object} oResult
	 */
	CUidListModel.prototype.setUidsAndCount = function (oResult)
	{
		if (oResult['@Object'] === 'Collection/MessageCollection')
		{
			_.each(oResult.Uids, function (sUid, iIndex) {
				
				this.collection()[iIndex + oResult.Offset] = sUid.toString();
	
			}, this);
	
			this.resultCount(oResult.MessageResultCount);
		}
	};
	
	/**
	 * @param {number} iOffset
	 * @param {Object} oMessages
	 */
	CUidListModel.prototype.getUidsForOffset = function (iOffset, oMessages)
	{
		var
			iIndex = 0,
			iLen = this.collection().length,
			sUid = '',
			iExistsCount = 0,
			aUids = [],
			oMsg = null
		;
		
		for(; iIndex < iLen; iIndex++)
		{
			if (iIndex >= iOffset && iExistsCount < AppData.User.MailsPerPage) {
				sUid = this.collection()[iIndex];
				oMsg = oMessages[sUid];
	
				if (oMsg && !oMsg.deleted() || sUid === undefined)
				{
					iExistsCount++;
					if (sUid !== undefined)
					{
						aUids.push(sUid);
					}
				}
			}
		}
		
		return aUids;
	};
	
	/**
	 * @param {Array} aUids
	 */
	CUidListModel.prototype.deleteUids = function (aUids)
	{
		var
			iIndex = 0,
			iLen = this.collection().length,
			sUid = '',
			aNewCollection = [],
			iDiff = 0
		;
		
		for (; iIndex < iLen; iIndex++)
		{
			sUid = this.collection()[iIndex];
			if (_.indexOf(aUids, sUid) === -1)
			{
				aNewCollection.push(sUid);
			}
			else
			{
				iDiff++;
			}
		}
		
		this.collection(aNewCollection);
		this.resultCount(this.resultCount() - iDiff);
	};
	
	/**
	 * @constructor
	 */
	function CIcalModel()
	{
		this.uid = ko.observable('');
		this.uid.subscribe(function () {
			if (this.uid() !== '' && this.uid() !== '0')
			{
				App.CalendarCache.addIcal(this);
			}
		}, this);
		this.file = ko.observable('');
		
		this.type = ko.observable('');
		this.icalType = ko.observable('');
		this.icalConfig = ko.observable('');
		this.type.subscribe(function () {
			var
				aTypeParts = this.type().split('-'),
				sType = aTypeParts.shift(),
				sFoundType = _.find(Enums.IcalType, function (sIcalType) {
					return sType === sIcalType;
				}, this),
				sConfig = aTypeParts.join('-'),
				sFoundConfig = _.find(Enums.IcalConfig, function (sIcalConfig) {
					return sConfig === sIcalConfig;
				}, this)
			;
			
			if (sType !== sFoundType)
			{
				sType = Enums.IcalType.Save;
			}
			this.icalType(sType);
			
			if (sConfig !== sFoundConfig)
			{
				sConfig = Enums.IcalConfig.NeedsAction;
			}
			this.icalConfig(sConfig);
		}, this);
		
		this.isRequestType = ko.computed(function () {
			return this.icalType() === Enums.IcalType.Request;
		}, this);
		this.isCancelType = ko.computed(function () {
			return this.icalType() === Enums.IcalType.Cancel;
		}, this);
		this.cancelDecision = ko.observable('');
		this.isReplyType = ko.computed(function () {
			return this.icalType() === Enums.IcalType.Reply;
		}, this);
		this.replyDecision = ko.observable('');
		this.isSaveType = ko.computed(function () {
			return this.icalType() === Enums.IcalType.Save;
		}, this);
		this.isJustSaved = ko.observable(false);
		
		this.fillDecisions();
		
		this.isAccepted = ko.computed(function () {
			return this.icalConfig() === Enums.IcalConfig.Accepted;
		}, this);
		this.isDeclined = ko.computed(function () {
			return this.icalConfig() === Enums.IcalConfig.Declined;
		}, this);
		this.isTentative = ko.computed(function () {
			return this.icalConfig() === Enums.IcalConfig.Tentative;
		}, this);
		
		this.location = ko.observable('');
		this.description = ko.observable('');
		this.when = ko.observable('');
		
		this.calendarId = ko.observable('');
		this.calendars = App.CalendarCache.calendars;
	
		this.selectedCalendar = ko.observable('');
	
		this.chosenCalendarName = ko.computed(function () {
			var oFoundCal = null;
	
			if (this.calendarId() !== '') {
				oFoundCal = _.find(this.calendars(), function (oCal) {
					return oCal.id === this.calendarId();
				}, this);
			}
			
			return oFoundCal ? oFoundCal.name : '';
		}, this);
		
		this.calendarIsChosen = ko.computed(function () {
			return this.chosenCalendarName() !== '';
		}, this);
		
		this.visibleCalendarDropdown = ko.computed(function () {
			return !this.calendarIsChosen() && this.calendars().length > 1 && (this.isRequestType() || this.isSaveType());
		}, this);
		
		this.visibleCalendarName = ko.computed(function () {
			return this.calendarIsChosen();
		}, this);
		
		this.visibleFirstCalendarName = ko.computed(function () {
			return this.calendars().length === 1 && !this.calendarIsChosen();
		}, this);
		
		this.visibleCalendarRow = ko.computed(function () {
			return this.visibleCalendarDropdown() || this.visibleCalendarName() || this.visibleFirstCalendarName();
		}, this);
		
		// animation of buttons turns on with delay
		// so it does not trigger when placing initial values
		this.animation = ko.observable(false);
	}
	
	CIcalModel.prototype.fillDecisions = function ()
	{
		var
			oAccount = AppData.Accounts.getCurrent(),
			sSender = oAccount ? oAccount.email() : ''
		;
		
		this.cancelDecision(Utils.i18n('MESSAGE/APPOINTMENT_CANCELED', {'SENDER': sSender}));
		
		switch (this.icalConfig())
		{
			case Enums.IcalConfig.Accepted:
				this.replyDecision(Utils.i18n('MESSAGE/APPOINTMENT_ACCEPTED', {'SENDER': sSender}));
				break;
			case Enums.IcalConfig.Declined:
				this.replyDecision(Utils.i18n('MESSAGE/APPOINTMENT_DECLINED', {'SENDER': sSender}));
				break;
			case Enums.IcalConfig.Tentative:
				this.replyDecision(Utils.i18n('MESSAGE/APPOINTMENT_TENTATIVELY_ACCEPTED', {'SENDER': sSender}));
				break;
		}
	};
	
	/**
	 * @param {AjaxIcsResponse} oData
	 */
	CIcalModel.prototype.parse = function (oData)
	{
		if (oData && oData['@Object'] === 'Object/CApiMailIcs')
		{
			this.uid(oData.Uid.toString());
			this.file(oData.File);
			this.type(oData.Type);
			this.location(oData.Location);
			this.description(oData.Description.replace(/\r/g, '').replace(/\n/g,"<br />"));
			this.when(oData.When);
			this.calendarId(oData.CalendarId);
			this.selectedCalendar(oData.CalendarId);
		}
	};
	
	CIcalModel.prototype.acceptAppointment = function ()
	{
		this.calendarId(this.selectedCalendar());
		this.changeAndSaveConfig(Enums.IcalConfig.Accepted);
	};
	
	CIcalModel.prototype.tentativeAppointment = function ()
	{
		this.calendarId(this.selectedCalendar());
		this.changeAndSaveConfig(Enums.IcalConfig.Tentative);
	};
	
	CIcalModel.prototype.declineAppointment = function ()
	{
		this.calendarId('');
		this.selectedCalendar('');
		this.changeAndSaveConfig(Enums.IcalConfig.Declined);
	};
	
	/**
	 * @param {string} sConfig
	 */
	CIcalModel.prototype.changeAndSaveConfig = function (sConfig)
	{
		if (
			this.icalConfig() !== sConfig &&
			(sConfig !== Enums.IcalConfig.Declined || this.icalConfig() !== Enums.IcalConfig.NeedsAction)
		) 
		{
			App.CalendarCache.recivedAnim(true);
		}
		
		this.changeConfig(sConfig);
		this.doProcessAppointment();
	};
	
	/**
	 * @param {string} sConfig
	 */
	CIcalModel.prototype.changeConfig = function (sConfig)
	{
		this.type(this.icalType() + '-' + sConfig);
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CIcalModel.prototype.onProcessAppointmentResponse = function (oData, oParameters)
	{
		if (!oData.Result)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('WARNING/UNKNOWN_ERROR'));
		}
		else if (App.CalendarCache)
		{
			App.CalendarCache.calendarChanged(true);
		}
	};
	
	CIcalModel.prototype.doProcessAppointment = function ()
	{
		var
			oParameters = {
				'Action': 'ProcessAppointment',
				'AppointmentAction': this.icalConfig(),
				'CalendarId': this.selectedCalendar(),
				'File': this.file()
			}
		;
	
		App.Ajax.send(oParameters, this.onProcessAppointmentResponse, this);
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CIcalModel.prototype.onAddEventResponse = function (oData, oParameters)
	{
		if (!oData.Result)
		{
			App.Api.showErrorByCode(oData.ErrorCode);
		}
		else if (oData.Result.Uid)
		{
			this.uid(oData.Result.Uid);
		}
	};
	
	CIcalModel.prototype.addEvent = function ()
	{
		var
			oParameters = {
				'Action': 'SaveIcs',
				'CalendarId': this.selectedCalendar(),
				'File': this.file()
			}
		;
		
		App.Ajax.send(oParameters, this.onAddEventResponse, this);
		
		this.isJustSaved(true);
		this.calendarId(this.selectedCalendar());
		
		setTimeout(_.bind(function () {
			this.isJustSaved(false);
		}, this), 20000);
		
		App.CalendarCache.recivedAnim(true);
	};
	
	CIcalModel.prototype.onEventDelete = function ()
	{
		this.calendarId('');
		this.selectedCalendar('');
		this.changeConfig(Enums.IcalConfig.NeedsAction);
	};
	
	CIcalModel.prototype.onEventTentative = function ()
	{
		this.changeConfig(Enums.IcalConfig.Tentative);
	};
	
	CIcalModel.prototype.onEventAccept = function ()
	{
		this.changeConfig(Enums.IcalConfig.Accepted);
	};
	
	CIcalModel.prototype.firstCalendarName = function ()
	{
		return this.calendars()[0] ? this.calendars()[0].name : '';
	};
	
	/**
	 * @constructor
	 */
	function CVcardModel()
	{
		this.uid = ko.observable('');
		this.uid.subscribe(function () {
			if (this.uid() !== '' && this.uid() !== '0')
			{
				App.ContactsCache.addVcard(this);
			}
		}, this);
		this.file = ko.observable('');
		this.name = ko.observable('');
		this.email = ko.observable('');
		this.isExists = ko.observable(false);
		this.isJustSaved = ko.observable(false);
	}
	
	/**
	 * @param {AjaxVCardResponse} oData
	 */
	CVcardModel.prototype.parse = function (oData)
	{
		if (oData && oData['@Object'] === 'Object/CApiMailVcard')
		{
			this.uid(oData.Uid.toString());
			this.file(oData.File);
			this.name(oData.Name);
			this.email(oData.Email);
			this.isExists(oData.Exists);
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CVcardModel.prototype.onAddContactResponse = function (oData, oParameters)
	{
		if (oData && oData.Result && oData.Result.Uid)
		{
			this.uid(oData.Result.Uid);
		}
	};
	
	CVcardModel.prototype.addContact = function ()
	{
		var
			oParameters = {
				'Action': 'SaveVcf',
				'File': this.file()
			}
		;
		
		App.Ajax.send(oParameters, this.onAddContactResponse, this);
		
		this.isJustSaved(true);
		this.isExists(true);
		
		setTimeout(_.bind(function () {
			this.isJustSaved(false);
		}, this), 20000);
		
		App.ContactsCache.recivedAnim(true);
	};
	
	
	/**
	 * @constructor
	 */
	function CContactModel()
	{
		this.sEmailDefaultType = Enums.ContactEmailType.Personal;
		this.sPhoneDefaultType = Enums.ContactPhoneType.Mobile;
		this.sAddressDefaultType = Enums.ContactAddressType.Personal;
	
		this.voiceApp = App.Phone.voiceApp;
	
		this.idContact = ko.observable('');
		this.idUser = ko.observable('');
		this.global = ko.observable(false);
		this.itsMe = ko.observable(false);
	
		this.isNew = ko.observable(false);
		this.readOnly = ko.observable(false);
		this.edited = ko.observable(false);
		this.extented = ko.observable(false);
		this.personalCollapsed = ko.observable(false);
		this.businessCollapsed = ko.observable(false);
		this.otherCollapsed = ko.observable(false);
		this.groupsCollapsed = ko.observable(false);
	
		this.displayName = ko.observable('');
		this.firstName = ko.observable('');
		this.lastName = ko.observable('');
		this.nickName = ko.observable('');
	
		this.skype = ko.observable('');
		this.facebook = ko.observable('');
	
		this.displayNameFocused = ko.observable(false);
	
		this.primaryEmail = ko.observable(this.sEmailDefaultType);
		this.primaryPhone = ko.observable(this.sPhoneDefaultType);
		this.primaryAddress = ko.observable(this.sAddressDefaultType);
	
		this.mainPrimaryEmail = ko.computed({
			'read': this.primaryEmail,
			'write': function (mValue) {
				if (!Utils.isUnd(mValue) && 0 <= Utils.inArray(mValue, [Enums.ContactEmailType.Personal, Enums.ContactEmailType.Business, Enums.ContactEmailType.Other]))
				{
					this.primaryEmail(mValue);
				}
				else
				{
					this.primaryEmail(Enums.ContactEmailType.Personal);
				}
			},
			'owner': this
		});
	
		this.mainPrimaryPhone = ko.computed({
			'read': this.primaryPhone,
			'write': function (mValue) {
				if (!Utils.isUnd(mValue) && 0 <= Utils.inArray(mValue, [Enums.ContactPhoneType.Mobile, Enums.ContactPhoneType.Personal, Enums.ContactPhoneType.Business]))
				{
					this.primaryPhone(mValue);
				}
				else
				{
					this.primaryPhone(Enums.ContactPhoneType.Mobile);
				}
			},
			'owner': this
		});
		
		this.mainPrimaryAddress = ko.computed({
			'read': this.primaryAddress,
			'write': function (mValue) {
				if (!Utils.isUnd(mValue) && 0 <= Utils.inArray(mValue, [Enums.ContactAddressType.Personal, Enums.ContactAddressType.Business]))
				{
					this.primaryAddress(mValue);
				}
				else
				{
					this.primaryAddress(Enums.ContactAddressType.Personal);
				}
			},
			'owner': this
		});
	
		this.personalEmail = ko.observable('');
		this.personalStreetAddress = ko.observable('');
		this.personalCity = ko.observable('');
		this.personalState = ko.observable('');
		this.personalZipCode = ko.observable('');
		this.personalCountry = ko.observable('');
		this.personalWeb = ko.observable('');
		this.personalFax = ko.observable('');
		this.personalPhone = ko.observable('');
		this.personalMobile = ko.observable('');
	
		this.personalIsEmpty = ko.computed(function () {
			return '' === '' + this.personalEmail() +
				this.personalStreetAddress() +
				this.personalCity() +
				this.personalState() +
				this.personalZipCode() +
				this.personalCountry() +
				this.personalWeb() +
				this.personalFax() +
				this.personalPhone() +
				this.personalMobile()
			;
		}, this);
	
		this.businessEmail = ko.observable('');
		this.businessCompany = ko.observable('');
		this.businessDepartment = ko.observable('');
		this.businessJob = ko.observable('');
		this.businessOffice = ko.observable('');
		this.businessStreetAddress = ko.observable('');
		this.businessCity = ko.observable('');
		this.businessState = ko.observable('');
		this.businessZipCode = ko.observable('');
		this.businessCountry = ko.observable('');
		this.businessWeb = ko.observable('');
		this.businessFax = ko.observable('');
		this.businessPhone = ko.observable('');
	
		this.businessIsEmpty = ko.computed(function () {
			return '' === '' + this.businessEmail() +
				this.businessCompany() +
				this.businessDepartment() +
				this.businessJob() +
				this.businessOffice() +
				this.businessStreetAddress() +
				this.businessCity() +
				this.businessState() +
				this.businessZipCode() +
				this.businessCountry() +
				this.businessWeb() +
				this.businessFax() +
				this.businessPhone()
			;
		}, this);
	
		this.otherEmail = ko.observable('');
		this.otherBirthdayMonth = ko.observable('0');
		this.otherBirthdayDay = ko.observable('0');
		this.otherBirthdayYear = ko.observable('0');
		this.otherNotes = ko.observable('');
		this.etag = ko.observable('');
		
		this.birthdayIsEmpty = ko.computed(function () {
			var
				bMonthEmpty = '0' === this.otherBirthdayMonth(),
				bDayEmpty = '0' === this.otherBirthdayDay(),
				bYearEmpty = '0' === this.otherBirthdayYear()
			;
	
			return (bMonthEmpty || bDayEmpty || bYearEmpty);
		}, this);
		
		this.otherBirthday = ko.computed(function () {
			var
				sBirthday = '',
				iYear = Utils.pInt(this.otherBirthdayYear()),
				iMonth = Utils.pInt(this.otherBirthdayMonth()),
				iDay = Utils.pInt(this.otherBirthdayDay()),
				oDateModel = new CDateModel()
			;
			
			if (!this.birthdayIsEmpty())
			{
				oDateModel.setDate(iYear, 0 < iMonth ? iMonth - 1 : 0, iDay);
				sBirthday = oDateModel.getShortDate();
			}
			
			return sBirthday;
		}, this);
	
		this.otherIsEmpty = ko.computed(function () {
			return ('' === ('' + this.otherEmail() + this.otherNotes())) && this.birthdayIsEmpty();
		}, this);
	
		this.groups = ko.observableArray([]);
	
		this.groupsIsEmpty = ko.computed(function () {
			return 0 === this.groups().length;
		}, this);
	
		this.email = ko.computed({
			'read': function () {
				var sResult = '';
				switch (this.primaryEmail()) {
					case Enums.ContactEmailType.Personal:
						sResult = this.personalEmail();
						break;
					case Enums.ContactEmailType.Business:
						sResult = this.businessEmail();
						break;
					case Enums.ContactEmailType.Other:
						sResult = this.otherEmail();
						break;
				}
				return sResult;
			},
			'write': function (sEmail) {
				switch (this.primaryEmail()) {
					case Enums.ContactEmailType.Personal:
						this.personalEmail(sEmail);
						break;
					case Enums.ContactEmailType.Business:
						this.businessEmail(sEmail);
						break;
					case Enums.ContactEmailType.Other:
						this.otherEmail(sEmail);
						break;
					default:
						this.primaryEmail(this.sEmailDefaultType);
						this.email(sEmail);
						break;
				}
			},
			'owner': this
		});
	
		this.phone = ko.computed({
			'read': function () {
				var sResult = '';
				switch (this.primaryPhone()) {
					case Enums.ContactPhoneType.Mobile:
						sResult = this.personalMobile();
						break;
					case Enums.ContactPhoneType.Personal:
						sResult = this.personalPhone();
						break;
					case Enums.ContactPhoneType.Business:
						sResult = this.businessPhone();
						break;
				}
				return sResult;
			},
			'write': function (sPhone) {
				switch (this.primaryPhone()) {
					case Enums.ContactPhoneType.Mobile:
						this.personalMobile(sPhone);
						break;
					case Enums.ContactPhoneType.Personal:
						this.personalPhone(sPhone);
						break;
					case Enums.ContactPhoneType.Business:
						this.businessPhone(sPhone);
						break;
					default:
						this.primaryPhone(this.sEmailDefaultType);
						this.phone(sPhone);
						break;
				}
			},
			'owner': this
		});
		
		this.address = ko.computed({
			'read': function () {
				var sResult = '';
				switch (this.primaryAddress()) {
					case Enums.ContactAddressType.Personal:
						sResult = this.personalStreetAddress();
						break;
					case Enums.ContactAddressType.Business:
						sResult = this.businessStreetAddress();
						break;
				}
				return sResult;
			},
			'write': function (sAddress) {
				switch (this.primaryAddress()) {
					case Enums.ContactAddressType.Personal:
						this.personalStreetAddress(sAddress);
						break;
					case Enums.ContactAddressType.Business:
						this.businessStreetAddress(sAddress);
						break;
					default:
						this.primaryAddress(this.sEmailDefaultType);
						this.address(sAddress);
						break;
				}
			},
			'owner': this
		});
	
		this.emails = ko.computed(function () {
			var aList = [];
			
			if ('' !== this.personalEmail())
			{
				aList.push({'text': Utils.i18n('CONTACTS/OPTION_PERSONAL') + ': ' + this.personalEmail(), 'value': Enums.ContactEmailType.Personal});
			}
			if ('' !== this.businessEmail())
			{
				aList.push({'text': Utils.i18n('CONTACTS/OPTION_BUSINESS') + ': ' + this.businessEmail(), 'value': Enums.ContactEmailType.Business});
			}
			if ('' !== this.otherEmail())
			{
				aList.push({'text': Utils.i18n('CONTACTS/OPTION_OTHER') + ': ' + this.otherEmail(), 'value': Enums.ContactEmailType.Other});
			}
	
			return aList;
	
		}, this);
	
		this.phones = ko.computed(function () {
			var aList = [];
	
			if ('' !== this.personalMobile())
			{
				aList.push({'text': Utils.i18n('CONTACTS/LABEL_MOBILE') + ': ' + this.personalMobile(), 'value': Enums.ContactPhoneType.Mobile});
			}
			if ('' !== this.personalPhone())
			{
				aList.push({'text': Utils.i18n('CONTACTS/OPTION_PERSONAL') + ': ' + this.personalPhone(), 'value': Enums.ContactPhoneType.Personal});
			}
			if ('' !== this.businessPhone())
			{
				aList.push({'text': Utils.i18n('CONTACTS/OPTION_BUSINESS') + ': ' + this.businessPhone(), 'value': Enums.ContactPhoneType.Business});
			}
			return aList;
	
		}, this);
		
		this.addresses = ko.computed(function () {
			var aList = [];
	
			if ('' !== this.personalStreetAddress())
			{
				aList.push({'text': Utils.i18n('CONTACTS/OPTION_PERSONAL') + ': ' + this.personalStreetAddress(), 'value': Enums.ContactAddressType.Personal});
			}
			if ('' !== this.businessStreetAddress())
			{
				aList.push({'text': Utils.i18n('CONTACTS/OPTION_BUSINESS') + ': ' + this.businessStreetAddress(), 'value': Enums.ContactAddressType.Business});
			}
			return aList;
	
		}, this);
	
		this.hasEmails = ko.computed(function () {
			return 0 < this.emails().length;
		}, this);
	
		this.extented.subscribe(function (bValue) {
			if (bValue)
			{
				this.personalCollapsed(!this.personalIsEmpty());
				this.businessCollapsed(!this.businessIsEmpty());
				this.otherCollapsed(!this.otherIsEmpty());
				this.groupsCollapsed(!this.groupsIsEmpty());
			}
		}, this);
	
		this.birthdayMonthSelect = CContactModel.birthdayMonthSelect;
		this.birthdayYearSelect = CContactModel.birthdayYearSelect;
	
		this.birthdayDaySelect = ko.computed(function () {
	
			var
				iIndex = 1,
				iLen = Utils.pInt(Utils.daysInMonth(this.otherBirthdayMonth(), this.otherBirthdayYear())),
				sIndex = '',
				aList = [{'text': Utils.i18n('DATETIME/DAY'), 'value': '0'}]
			;
	
			for (; iIndex <= iLen; iIndex++)
			{
				sIndex = iIndex.toString();
				aList.push({'text': sIndex, 'value': sIndex});
			}
	
			return aList;
	
		}, this);
	
	
		for (var oDate = new Date(), sIndex = '', iIndex = oDate.getFullYear(), iLen = 2012 - 80; iIndex >= iLen; iIndex--)
		{
			sIndex = iIndex.toString();
			this.birthdayYearSelect.push(
				{'text': sIndex, 'value': sIndex}
			);
		}
	
		this.canBeSave = ko.computed(function () {
			return true;
		}, this);
		
		this.sendMailLink = ko.computed(function () {
			return this.getSendMailLink(this.email());
		}, this);
	
		this.sendMailToPersonalLink = ko.computed(function () {
			return this.getSendMailLink(this.personalEmail());
		}, this);
		
		this.sendMailToBusinessLink = ko.computed(function () {
			return this.getSendMailLink(this.businessEmail());
		}, this);
		
		this.sendMailToOtherLink = ko.computed(function () {
			return this.getSendMailLink(this.otherEmail());
		}, this);
	}
	
	CContactModel.birthdayMonths = Utils.getMonthNamesArray();
	
	CContactModel.birthdayMonthSelect = [
		{'text': Utils.i18n('DATETIME/MONTH'), value: '0'},
		{'text': CContactModel.birthdayMonths[0], value: '1'},
		{'text': CContactModel.birthdayMonths[1], value: '2'},
		{'text': CContactModel.birthdayMonths[2], value: '3'},
		{'text': CContactModel.birthdayMonths[3], value: '4'},
		{'text': CContactModel.birthdayMonths[4], value: '5'},
		{'text': CContactModel.birthdayMonths[5], value: '6'},
		{'text': CContactModel.birthdayMonths[6], value: '7'},
		{'text': CContactModel.birthdayMonths[7], value: '8'},
		{'text': CContactModel.birthdayMonths[8], value: '9'},
		{'text': CContactModel.birthdayMonths[9], value: '10'},
		{'text': CContactModel.birthdayMonths[10], value: '11'},
		{'text': CContactModel.birthdayMonths[11], value: '12'}
	];
	
	CContactModel.birthdayYearSelect = [
		{'text': Utils.i18n('DATETIME/YEAR'), 'value': '0'}
	];
	
	/**
	 * @param {string} sEmail
	 * @return {string}
	 */
	CContactModel.prototype.getSendMailLink = function (sEmail)
	{
		var
			sFullEmail = (sEmail),
			aLinkParts = App.Links.composeWithToField(sFullEmail),
			sLink = App.Routing.buildHashFromArray(aLinkParts)
		;
	
		return sLink;
	};
	
	CContactModel.prototype.clear = function ()
	{
		this.isNew(false);
		this.readOnly(false);
	
		this.idContact('');
		this.idUser('');
		this.global(false);
		this.itsMe(false);
	
		this.edited(false);
		this.extented(false);
		this.personalCollapsed(false);
		this.businessCollapsed(false);
		this.otherCollapsed(false);
		this.groupsCollapsed(false);
	
		this.displayName('');
		this.firstName('');
		this.lastName('');
		this.nickName('');
	
		this.skype('');
		this.facebook('');
	
		this.primaryEmail(this.sEmailDefaultType);
		this.primaryPhone(this.sPhoneDefaultType);
		this.primaryAddress(this.sAddressDefaultType);
	
		this.personalEmail('');
		this.personalStreetAddress('');
		this.personalCity('');
		this.personalState('');
		this.personalZipCode('');
		this.personalCountry('');
		this.personalWeb('');
		this.personalFax('');
		this.personalPhone('');
		this.personalMobile('');
	
		this.businessEmail('');
		this.businessCompany('');
		this.businessDepartment('');
		this.businessJob('');
		this.businessOffice('');
		this.businessStreetAddress('');
		this.businessCity('');
		this.businessState('');
		this.businessZipCode('');
		this.businessCountry('');
		this.businessWeb('');
		this.businessFax('');
		this.businessPhone('');
	
		this.otherEmail('');
		this.otherBirthdayMonth('0');
		this.otherBirthdayDay('0');
		this.otherBirthdayYear('0');
		this.otherNotes('');
	
		this.etag('');
	
		this.groups([]);
	};
	
	CContactModel.prototype.switchToNew = function ()
	{
		this.clear();
		this.edited(true);
		this.extented(false);
		this.isNew(true);
		this.displayNameFocused(true);
	};
	
	CContactModel.prototype.switchToView = function ()
	{
		this.edited(false);
		this.extented(false);
	};
	
	/**
	 * @return {Object}
	 */
	CContactModel.prototype.toObject = function ()
	{
		var oResult = {
			'ContactId': this.idContact(),
			'PrimaryEmail': this.primaryEmail(),
			'PrimaryPhone': this.primaryPhone(),
			'PrimaryAddress': this.primaryAddress(),
			'UseFriendlyName': '1',
			'Title': '',
			'FullName': this.displayName(),
			'FirstName': this.firstName(),
			'LastName': this.lastName(),
			'NickName': this.nickName(),
	
			'Global': this.global() ? '1' : '0',
			'ItsMe': this.itsMe() ? '1' : '0',
	
			'Skype': this.skype(),
			'Facebook': this.facebook(),
	
			'HomeEmail': this.personalEmail(),
			'HomeStreet': this.personalStreetAddress(),
			'HomeCity': this.personalCity(),
			'HomeState': this.personalState(),
			'HomeZip': this.personalZipCode(),
			'HomeCountry': this.personalCountry(),
			'HomeFax': this.personalFax(),
			'HomePhone': this.personalPhone(),
			'HomeMobile': this.personalMobile(),
			'HomeWeb': this.personalWeb(),
	
			'BusinessEmail': this.businessEmail(),
			'BusinessCompany': this.businessCompany(),
			'BusinessJobTitle': this.businessJob(),
			'BusinessDepartment': this.businessDepartment(),
			'BusinessOffice': this.businessOffice(),
			'BusinessStreet': this.businessStreetAddress(),
			'BusinessCity': this.businessCity(),
			'BusinessState': this.businessState(),
			'BusinessZip': this.businessZipCode(),
			'BusinessCountry': this.businessCountry(),
			'BusinessFax': this.businessFax(),
			'BusinessPhone': this.businessPhone(),
			'BusinessWeb': this.businessWeb(),
	
			'OtherEmail': this.otherEmail(),
			'Notes': this.otherNotes(),
			'ETag': this.etag(),
			'BirthdayDay': this.otherBirthdayDay(),
			'BirthdayMonth': this.otherBirthdayMonth(),
			'BirthdayYear': this.otherBirthdayYear(),
	
			'GroupsIds': this.groups()
		};
	
		return oResult;
	};
	
	/**
	 * @param {Object} oData
	 */
	CContactModel.prototype.parse = function (oData)
	{
		if (oData && 'Object/CContact' === oData['@Object'])
		{
			this.idContact(Utils.pExport(oData, 'IdContact', '').toString());
			this.idUser(Utils.pExport(oData, 'IdUser', '').toString());
	
			this.global(!!Utils.pExport(oData, 'Global', false));
			this.itsMe(!!Utils.pExport(oData, 'ItsMe', false));
			this.readOnly(!!Utils.pExport(oData, 'ReadOnly', false));
	
			this.displayName(Utils.pExport(oData, 'FullName', ''));
			this.firstName(Utils.pExport(oData, 'FirstName', ''));
			this.lastName(Utils.pExport(oData, 'LastName', ''));
			this.nickName(Utils.pExport(oData, 'NickName', ''));
	
			this.skype(Utils.pExport(oData, 'Skype', ''));
			this.facebook(Utils.pExport(oData, 'Facebook', ''));
	
			var iPrimaryEmail =	Utils.pInt(Utils.pExport(oData, 'PrimaryEmail', 0));
			switch (iPrimaryEmail)
			{
				case 1:
					iPrimaryEmail = Enums.ContactEmailType.Business;
					break;
				case 2:
					iPrimaryEmail = Enums.ContactEmailType.Other;
					break;
				default:
				case 0:
					iPrimaryEmail = Enums.ContactEmailType.Personal;
					break;
			}
			this.primaryEmail(iPrimaryEmail);
	
			var iPrimaryPhone =	Utils.pInt(Utils.pExport(oData, 'PrimaryPhone', 0));
			switch (iPrimaryPhone)
			{
				case 2:
					iPrimaryPhone = Enums.ContactPhoneType.Business;
					break;
				case 1:
					iPrimaryPhone = Enums.ContactPhoneType.Personal;
					break;
				default:
				case 0:
					iPrimaryPhone = Enums.ContactPhoneType.Mobile;
					break;
			}
			this.primaryPhone(iPrimaryPhone);
			
			var iPrimaryAddress =	Utils.pInt(Utils.pExport(oData, 'PrimaryAddress', 0));
			switch (iPrimaryAddress)
			{
				case 1:
					iPrimaryAddress = Enums.ContactAddressType.Business;
					break;
				default:
				case 0:
					iPrimaryAddress = Enums.ContactAddressType.Personal;
					break;
			}
			this.primaryAddress(iPrimaryAddress);
	
			this.personalEmail(Utils.pExport(oData, 'HomeEmail', ''));
			this.personalStreetAddress(Utils.pExport(oData, 'HomeStreet', ''));
			this.personalCity(Utils.pExport(oData, 'HomeCity', ''));
			this.personalState(Utils.pExport(oData, 'HomeState', ''));
			this.personalZipCode(Utils.pExport(oData, 'HomeZip', ''));
			this.personalCountry(Utils.pExport(oData, 'HomeCountry', ''));
			this.personalWeb(Utils.pExport(oData, 'HomeWeb', ''));
			this.personalFax(Utils.pExport(oData, 'HomeFax', ''));
			this.personalPhone(Utils.pExport(oData, 'HomePhone', ''));
			this.personalMobile(Utils.pExport(oData, 'HomeMobile', ''));
	
			this.businessEmail(Utils.pExport(oData, 'BusinessEmail', ''));
			this.businessCompany(Utils.pExport(oData, 'BusinessCompany', ''));
			this.businessDepartment(Utils.pExport(oData, 'BusinessDepartment', ''));
			this.businessJob(Utils.pExport(oData, 'BusinessJobTitle', ''));
			this.businessOffice(Utils.pExport(oData, 'BusinessOffice', ''));
			this.businessStreetAddress(Utils.pExport(oData, 'BusinessStreet', ''));
			this.businessCity(Utils.pExport(oData, 'BusinessCity', ''));
			this.businessState(Utils.pExport(oData, 'BusinessState', ''));
			this.businessZipCode(Utils.pExport(oData, 'BusinessZip', ''));
			this.businessCountry(Utils.pExport(oData, 'BusinessCountry', ''));
			this.businessWeb(Utils.pExport(oData, 'BusinessWeb', ''));
			this.businessFax(Utils.pExport(oData, 'BusinessFax', ''));
			this.businessPhone(Utils.pExport(oData, 'BusinessPhone', ''));
	
			this.otherEmail(Utils.pExport(oData, 'OtherEmail', ''));
			this.otherBirthdayMonth(Utils.pExport(oData, 'BirthdayMonth', '0').toString());
			this.otherBirthdayDay(Utils.pExport(oData, 'BirthdayDay', '0').toString());
			this.otherBirthdayYear(Utils.pExport(oData, 'BirthdayYear', '0').toString());
			this.otherNotes(Utils.pExport(oData, 'Notes', ''));
	
			this.etag(Utils.pExport(oData, 'ETag', ''));
	
			var aGroupsIds = Utils.pExport(oData, 'GroupsIds', []);
			if (_.isArray(aGroupsIds))
			{
				this.groups(aGroupsIds);
			}
		}
	};
	
	/**
	 * @param {string} sEmail
	 * @return {string}
	 */
	CContactModel.prototype.getFullEmail = function (sEmail)
	{
		var sFullEmail = sEmail;
		
		if (this.displayName() !== '')
		{
			if (sEmail !== '')
			{
				sFullEmail = '"' + this.displayName() + '" <' + sEmail + '>';
			}
			else
			{
				sFullEmail = this.displayName();
			}
		}
		
		return sFullEmail;
	};
	
	CContactModel.prototype.viewAllMails = function ()
	{
		App.MailCache.searchMessagesInInbox('email:' + this.email());
	};
	
	CContactModel.prototype.sendThisContact = function ()
	{
		App.Routing.goDirectly(App.Links.compose(), ['vcard', this]);
	};
	
	/**
	 * @param {?} mLink
	 * @return {boolean}
	 */
	CContactModel.prototype.isStrLink = function (mLink)
	{
		return (/^http/).test(mLink);
	};
	
	/**
	 * @param {string} sPhone
	 */
	CContactModel.prototype.onCallClick = function (sPhone)
	{
		App.Phone.call(Utils.getFormattedPhone(sPhone));
	};
	
	/**
	 * @constructor
	 */
	function CGroupModel()
	{
		this.isNew = ko.observable(false);
		this.readOnly = ko.observable(false);
	
		this.idGroup = ko.observable('');
		this.idUser = ko.observable('');
	
		this.name = ko.observable('');
		this.edited = ko.observable(false);
	
		this.nameFocused = ko.observable(false);
	
		this.canBeSave = ko.computed(function () {
			return '' !== this.name();
		}, this);
	
		this.newContactsInGroupCount = ko.observable(0);
	
		this.newContactsInGroupHint = ko.computed(function () {
			var iCount = this.newContactsInGroupCount();
			return this.isNew() && 0 < iCount ? Utils.i18n('CONTACTS/CONTACT_ADD_TO_NEW_HINT_PLURAL', {
				'COUNT' : iCount
			}, null, iCount) : '';
		}, this);
	}
	
	CGroupModel.prototype.clear = function ()
	{
		this.isNew(false);
	
		this.idGroup('');
		this.idUser('');
	
		this.name('');
		this.nameFocused(false);
		this.edited(false);
	};
	
	CGroupModel.prototype.switchToNew = function ()
	{
		this.clear();
		this.edited(true);
		this.isNew(true);
		this.nameFocused(true);
	};
	
	CGroupModel.prototype.switchToView = function ()
	{
		this.edited(false);
	};
	
	/**
	 * @return {Object}
	 */
	CGroupModel.prototype.toObject = function ()
	{
		return {
			'GroupId': this.idGroup(),
			'Name': this.name()
		};
	};
	
	
	
	/**
	 * @constructor
	 */
	function CContactListModel()
	{
		this.bIsGroup = false;
		this.bReadOnly = false;
		this.bItsMe = false;
		this.bGlobal = false;
		this.sId = '';
		this.sName = '';
		this.sEmail = '';
	
		this.deleted = ko.observable(false);
		this.checked = ko.observable(false);
		this.selected = ko.observable(false);
		this.recivedAnim = ko.observable(false).extend({'autoResetToFalse': 500});
	}
	
	/**
	 *
	 * @param {Object} oData
	 * @param {boolean=} bGlobal
	 */
	CContactListModel.prototype.parse = function (oData, bGlobal)
	{
		if (oData && 'Object/CContactListItem' === Utils.pExport(oData, '@Object', ''))
		{
			this.sId = oData.Id.toString();
			this.sName = oData.Name.toString();
			this.sEmail = oData.Email.toString();
	
			this.bIsGroup = !!oData.IsGroup;
			this.bReadOnly = !!oData.ReadOnly;
			this.bItsMe = !!oData.ItsMe;
			this.bGlobal = Utils.isUnd(bGlobal) ? false : !!bGlobal;
		}
	};
	
	/**
	 * @return {boolean}
	 */
	CContactListModel.prototype.IsGroup = function ()
	{
		return this.bIsGroup;
	};
	
	/**
	 * @return {boolean}
	 */
	CContactListModel.prototype.Global = function ()
	{
		return this.bGlobal;
	};
	
	/**
	 * @return {boolean}
	 */
	CContactListModel.prototype.ReadOnly = function ()
	{
		return this.bReadOnly;
	};
	
	/**
	 * @return {boolean}
	 */
	CContactListModel.prototype.ItsMe = function ()
	{
		return this.bItsMe;
	};
	
	/**
	 * @return {string}
	 */
	CContactListModel.prototype.Id = function ()
	{
		return this.sId;
	};
	
	/**
	 * @return {string}
	 */
	CContactListModel.prototype.Name = function ()
	{
		return this.sName;
	};
	
	/**
	 * @return {string}
	 */
	CContactListModel.prototype.Email = function ()
	{
		return this.sEmail;
	};
	
	/**
	 * @return {string}
	 */
	CContactListModel.prototype.EmailAndName = function ()
	{
		return this.sName && this.sEmail && 0 < this.sName.length && 0 < this.sEmail.length ? '"' + this.sName + '" <' + this.sEmail + '>' : this.sEmail;
	};
	
	
	/**
	 * @constructor
	 */
	function CCalendarModel()
	{
		this.id = 0;
		this.name = ko.observable('');
		this.description = ko.observable('');
		this.owner = ko.observable('');
		this.isDefault = false;
		this.isShared = false;
		this.isPublic = ko.observable(false);
		this.access = Enums.CalendarAccess.Write;
		this.url = ko.observable('');
		this.davUrl = ko.observable('');
		this.exportUrl = ko.observable('');
		this.pubUrl = ko.observable('');
		this.shares = ko.observableArray([]);
		this.events = [];
		this.hiddenEvents = [];
		
		this.color = ko.observable('');
		this.color.subscribe(function(){
			var 
				events = [],
				self = this
			;
			
			_.each(this.events, function (oEvent) {
				oEvent.backgroundColor = self.color();
				oEvent.borderColor = self.color();
				events.push(oEvent);
			});
			
			this.events = events;
			this.name.valueHasMutated();
	
		}, this);
		
		this.active = ko.observable(true);
		
		this.startDateTime = 0;
		this.endDateTime = 0;
	}
	
	/**
	 * @param {AjaxCalendarResponse} oData
	 */
	CCalendarModel.prototype.parse = function (oData)
	{
		this.id = oData.Id;
		this.name(oData.Name);
		this.description(oData.Description || '');
		this.owner(oData.Owner || '');
		var bActive = App.Storage.hasData(oData.Id) ? App.Storage.getData(oData.Id) : true;
		this.active(bActive);
		this.isDefault = oData.IsDefault;
		this.access = oData.Access;
		this.isShared = oData.Shared;
		this.isPublic(oData.IsPublic);
		this.color(oData.Color);
		this.url(oData.Url);
		this.davUrl(oData.ServerUrl);
		this.exportUrl(Utils.getAppPath() + '?/Raw/Calendars/0/' + oData.ExportHash);
		this.pubUrl(Utils.getAppPath() + '?calendar-pub=' + oData.PubHash);
		this.shares(oData.Shares || []);
		
		_.each(oData.Events, function (oEvent) {
			this.addEvent(oEvent);
		}, this);
	};
	
	/**
	 * @param {string} sId
	 * 
	 * @return {?}
	 */
	CCalendarModel.prototype.eventExists = function (sId)
	{
		return _.find(this.events, function(oEvent){ 
			return (sId === oEvent.id); 
		});
	};
	
	/**
	 * @param {Object} oEvent
	 */
	CCalendarModel.prototype.addEvent = function (oEvent)
	{
		if (oEvent && !this.eventExists(oEvent.id))
		{
			oEvent.backgroundColor = this.color();
			oEvent.borderColor = this.color();
			oEvent.title = Utils.getTitleForEvent(oEvent.subject);
	
			this.events.push(oEvent);
		}
	};
	
	/**
	 * @param {string} sId
	 */
	CCalendarModel.prototype.removeEvent = function (sId)
	{
		this.events = _.filter(this.events, function(oEvent){ 
			return oEvent.id !== sId;
		}, this);
	};
	
	/**
	 * @param {string} sUid
	 * @param {boolean} bSkipExcluded
	 */
	CCalendarModel.prototype.removeEventByUid = function (sUid, bSkipExcluded)
	{
		if (Utils.isUnd(bSkipExcluded))
		{
			bSkipExcluded = false;
		}
		
		this.events = _.filter(this.events, function(oEvent){ 
			return (oEvent.uid !== sUid && (!bSkipExcluded || !oEvent.excluded));
		}, this);
	};
	
	CCalendarModel.prototype.removeEvents = function ()
	{
		this.events = [];
	};
	
	/**
	 * @return {boolean}
	 */
	CCalendarModel.prototype.isEditable = function ()
	{
		return this.access !== Enums.CalendarAccess.Read;
	};
	/**
	 * @param {Object} oParameters
	 * @constructor
	 */
	function CCalendarListModel(oParameters)
	{
		this.parentOnCalendarActiveChange = oParameters.onCalendarActiveChange;
		
		this.defaultCal = ko.observable(null);
		this.currentCal = ko.observable(null);
		
		this.collection = ko.observableArray([]);
		this.collection.subscribe(function () {
			this.pickCurrentCalendar(this.defaultCal());
		}, this);
		this.count = ko.computed(function () {
			return this.collection().length;
		}, this);
		this.sharedCount = ko.computed(function () {
			var sharedCalendars = _.filter(this.collection(), 
				function(oItem){ return oItem.isShared; 
			});
			return sharedCalendars.length;
		}, this);
	}
	
	/**
	 * @param {Object} oPickCalendar
	 */
	CCalendarListModel.prototype.pickCurrentCalendar = function (oPickCalendar)
	{
		var
			oFirstActiveCal = _.find(this.collection(), function (oCalendar) {
				return oCalendar.active();
			}, this)
		;
		
		if (!this.currentCal() || !this.currentCal().active())
		{
			if (oPickCalendar && oPickCalendar.active())
			{
				this.currentCal(oPickCalendar);
			}
			else if (this.defaultCal() && (this.defaultCal().active() || !oFirstActiveCal))
			{
				this.currentCal(this.defaultCal());
			}
			else if (oFirstActiveCal)
			{
				this.currentCal(oFirstActiveCal);
			}
		}
	};
	
	/**
	 * @param {number} iCalendarId
	 */
	CCalendarListModel.prototype.hideOtherCalendars = function (iCalendarId)
	{
		_.each(this.collection(), function (oCalendar) {
			oCalendar.active(oCalendar.id === iCalendarId);
		}, this);
	};
	
	/**
	 * @param {string} sCalendarId
	 */
	CCalendarListModel.prototype.getCalendarById = function (sCalendarId)
	{
		var oCalendar = _.find(this.collection(), function(oCalendar) {
			return oCalendar.id === sCalendarId;
		}, this);
		
		return oCalendar;
	};
	
	/**
	 * @return {Array}
	 */
	CCalendarListModel.prototype.getEvents = function ()
	{
		var
			aEvents = []
		;
		
		_.each(this.collection(), function (oCalendar) {
			if (oCalendar.active())
			{
				aEvents = _.union(aEvents, oCalendar.events);
			}
		}, this);
	
		return aEvents;
	};
	
	/**
	 * @param {AjaxCalendarResponse} oCalendarData
	 * 
	 * @return {Object}
	 */
	CCalendarListModel.prototype.parseAndAddCalendar = function (oCalendarData)
	{
		var oCalendar = new CCalendarModel();
		
		oCalendar.parse(oCalendarData);
		oCalendar.active.subscribe(function (value) {
			this.parentOnCalendarActiveChange(oCalendar);
			var oPickCalendar = oCalendar.active() ? oCalendar : this.defaultCal();
			this.pickCurrentCalendar(oPickCalendar);
			App.Storage.setData(oCalendar.id, value);
		}, this);
		
		if (oCalendar.isDefault)
		{
			this.defaultCal(oCalendar);
		}
		
		var mIndex = this.calendarExists(oCalendar.id);
		if (mIndex || mIndex === 0)
		{
			this.collection.splice(mIndex, 1, oCalendar);
			
		}
		else
		{
			this.collection.push(oCalendar);
		}
		
		return oCalendar;
	};
	
	/**
	 * @param {string} sId
	 * 
	 * @return {?}
	 */
	CCalendarListModel.prototype.calendarExists = function (sId)
	{
		var iIndex = _.indexOf(_.map(this.collection(), function(oItem){return oItem.id;}), sId);
		
		return (iIndex < 0) ? false : iIndex;
	};
	
	/**
	 * @param {string} sId
	 */
	CCalendarListModel.prototype.removeCalendar = function (sId)
	{
		this.collection(_.filter(this.collection(), function(oCalendar) {
			return oCalendar.id !== sId;
		}, this));
	};
	
	
	CCalendarListModel.prototype.clearCollection = function ()
	{
		this.collection.removeAll();
	};
	
	CCalendarListModel.prototype.getColors = function ()
	{
		return _.map(this.collection(), function (oCalendar) {
			return oCalendar.color();
		}, this);
	};
	
	/**
	 * @constructor
	 */
	function CFileModel()
	{
		this.name = ko.observable('');
		this.nameForEdit = ko.observable('');
		this.displayName = ko.observable('');
		this.name.subscribe(function (value) {
			this.nameForEdit(value);
			this.displayName(value);
			this.value = value;
		}, this);
		this.extension = ko.computed(function () {
			if (this.name() !== null)
			{
				var iDotPos = this.name().lastIndexOf('.');
				return this.name().substr(iDotPos + 1);
			}
			return '';
		}, this);
		
		this.size = ko.observable(0);
		this.storageType = ko.observable(Enums.FileStorageType.Private);
		this.lastModified = ko.observable('');
		this.friendlySize = ko.computed(function () {
			return Utils.friendlySize(this.size());
		}, this);
		
		this.path = ko.observable('');
		this.hash = ko.observable('');
		this.download = ko.computed(function () {
			return Utils.getFilestorageDownloadLinkByHash(AppData.Accounts.currentId(), this.hash());
		}, this);
		this.view = ko.computed(function () {
			return Utils.getFilestorageViewLinkByHash(AppData.Accounts.currentId(), this.hash());
		}, this);
		
		this.selected = ko.observable(false);
		this.checked = ko.observable(false);
		this.isFolder = ko.observable(false);
		this.isViewable = ko.computed(function () {
			var 
				bResult = false,
				aViewableArray = [
					'JPEG', 'JPG', 'PNG', 'GIF', 'TXT', 'PDF'
				]
			;
			if (_.indexOf(aViewableArray, this.extension().toUpperCase()) >= 0)
			{
				bResult = true;
			}
			return bResult;
		}, this);
		this.edited = ko.observable(false);
		this.edited.subscribe(function (value) {
			if (value === false)
			{
				this.nameForEdit(this.name());
			}
		}, this);
		
		this.uploadUid = ko.observable(null);
		this.uploaded = ko.observable(true);
		this.progress = ko.observable(0);
		
		this.deleted = ko.observable(false); // temporary removal until it was confirmation from the server to delete
		this.recivedAnim = ko.observable(false).extend({'autoResetToFalse': 500});
		this.shared = ko.observable(false);
		this.owner = ko.observable('');
		
		this.ownerHeaderText = ko.computed(function () {
			return Utils.i18n('FILESTORAGE/OWNER_HEADER_EMAIL', {
				'OWNER': this.owner()
			});
		}, this);
		
		this.lastModifiedHeaderText = ko.computed(function () {
			return Utils.i18n('FILESTORAGE/OWNER_HEADER_LAST_MODIFIED_DATE_TEXT', {
				'LASTMODIFIED': this.lastModified()
			});
		}, this);
	}
	
	CFileModel.prototype.onDownloadClick = function ()
	{
		App.downloadByUrl(this.download());
	};
	
	CFileModel.prototype.onViewClick = function ()
	{
		var
			oWin = null,
			sUrl = Utils.getAppPath() + this.view()
		;
	
		oWin = Utils.WindowOpener.open(sUrl, sUrl, false);
	
		if (oWin)
		{
			oWin.focus();
		}
	};
	
	/**
	 * @param {CFileModel} oFile
	 * @param {*} oEvent
	 * @return {boolean}
	 */
	CFileModel.prototype.eventDragStart = function (oFile, oEvent)
	{
		var 
			oLocalEvent = oEvent.originalEvent || oEvent
		;
		
		if (oFile && oLocalEvent && oLocalEvent.dataTransfer && oLocalEvent.dataTransfer.setData)
		{
			oLocalEvent.dataTransfer.setData('DownloadURL', this.generateTransferDownloadUrl());
		}
	
		return true;
	};
	
	/**
	 * @return {string}
	 */
	CFileModel.prototype.generateTransferDownloadUrl = function ()
	{
		var sLink = this.download();
		if ('http' !== sLink.substr(0, 4))
		{
			sLink = window.location.protocol + '//' + window.location.host + window.location.pathname + sLink;
		}
	
		return this.storageType() + ':' + this.name() + ':' + sLink;
	};
	
	
	/**
	 * @constructor
	 */
	function CPostModel()
	{
		this.Id = null;
		this.IdThread = null;
		this.IdOwner = null;
		this.sFrom = '';
		this.sDate = '';
		this.iType = null;
		this.bSysType = false;
		this.bThreadOwner = null;
		this.sText = '';
		this.collapsed = ko.observable(false);
		
		this.attachments = ko.observableArray([]);
		
		this.allowDownloadAttachmentsLink = true;
	
		this.itsMe = ko.observable(false);
		this.canBeDeleted = this.itsMe;
	}
	
	/**
	 * @param {AjaxPostResponse} oData
	 */
	CPostModel.prototype.parse = function (oData)
	{
		this.Id = oData.IdHelpdeskPost;
		this.IdThread = oData.IdHelpdeskThread;
		this.IdOwner = oData.IdOwner;
		this.bThreadOwner = oData.IsThreadOwner;
		this.sFrom = Utils.isNonEmptyArray(oData.Owner) ? oData.Owner[1] || oData.Owner[0] || '' : '';
		this.sDate = CDateModel.prototype.convertDate(oData.Created);
		this.iType = oData.Type;
		this.bSysType = oData.SystemType;
		this.sText = oData.Text.toString();
	
		this.itsMe(oData.ItsMe);
	
		if (oData.Attachments)
		{
			var 
				iIndex = 0,
				iLen = 0,
				oObject = null,
				aList = []
			;
			
			for (iLen = oData.Attachments.length; iIndex < iLen; iIndex++)
			{
				if (oData.Attachments[iIndex] && 'Object/CHelpdeskAttachment' === Utils.pExport(oData.Attachments[iIndex], '@Object', ''))
				{
					oObject = new CHelpdeskAttachmentModel();
					oObject.parse(oData.Attachments[iIndex]);
	
					aList.push(oObject);
	
				}
			}
			
			this.attachments(aList);
		}
	};
	
	
	/**
	 * @constructor
	 */
	function CThreadListModel()
	{
		this.Id = null;
		this.ThreadHash = '';
		this.IdOwner = null;
		this.ItsMe = false;
		this.aOwner = [];
		this.sSubject = '';
		this.sEmail = '';
		this.sName = '';
		this.sFrom = '';
		this.sFromFull = '';
		this.sDate = '';
		this.state = ko.observable(0);
		this.unseen = ko.observable(false);
		this.postsCount = ko.observable(0);
	
		this.printableState = ko.computed(function () {
			var 
				sText = '',
				sLangSuffix = this.ItsMe ? '_FOR_CLIENT' : ''
			;
			
			switch (this.state())
			{
				case Enums.HelpdeskThreadStates.Pending:
					sText = Utils.i18n('HELPDESK/THREAD_STATE_PENDING' + sLangSuffix);
					break;
				case Enums.HelpdeskThreadStates.Resolved:
					sText = Utils.i18n('HELPDESK/THREAD_STATE_RESOLVED' + sLangSuffix);
					break;
				case Enums.HelpdeskThreadStates.Waiting:
					sText = Utils.i18n('HELPDESK/THREAD_STATE_WAITING' + sLangSuffix);
					break;
				case Enums.HelpdeskThreadStates.Answered:
					sText = Utils.i18n('HELPDESK/THREAD_STATE_ANSWERED' + sLangSuffix);
					break;
				case Enums.HelpdeskThreadStates.Deferred:
					sText = Utils.i18n('HELPDESK/THREAD_STATE_DEFERRED' + sLangSuffix);
					break;
			}
			
			return sText;
		}, this);
	
		this.deleted = ko.observable(false);
		this.checked = ko.observable(false);
		this.selected = ko.observable(false);
	}
	
	/**
	 * @param {Object} oData
	 */
	CThreadListModel.prototype.parse = function (oData)
	{
		this.Id = oData.IdHelpdeskThread;
		this.ThreadHash = oData.ThreadHash;
		this.IdOwner = oData.IdOwner;
		this.ItsMe = !!oData.ItsMe;
		this.sSubject = oData.Subject.toString();
		this.sDate = moment(oData.Updated * 1000).fromNow(false);
		this.aOwner = Utils.isNonEmptyArray(oData.Owner) ? oData.Owner : ['', ''];
		this.sEmail = this.aOwner[0] || '';
		this.sName = this.aOwner[1] || '';
		this.sFrom = this.sName || this.sEmail;
		this.sFromFull = Utils.trim('' === this.sName ? this.sEmail :
			(this.sName + ('' !== this.sEmail ? ' (' + this.sEmail  + ')' : '')));
		
		this.postsCount(oData.PostCount);
		this.state(oData.Type);
		this.unseen(!oData.IsRead);
	};
	
	/**
	 * @return {string}
	 */
	CThreadListModel.prototype.Name = function ()
	{
		return this.sName;
	};
	
	/**
	 * @return {string}
	 */
	CThreadListModel.prototype.Email = function ()
	{
		return this.sEmail;
	};
	
	
	/**
	 * @constructor
	 */
	function CHelpdeskAttachmentModel()
	{
		this.parentId = ko.observable(null);
	
		this.tempName = ko.observable('');
		this.fileName = ko.observable('');
		this.displayName = ko.observable('');
		
		this.extention = ko.computed(function () {
			var 
				sName = this.fileName(),
				iDotPos = sName.lastIndexOf('.')
			;
			this.displayName(sName.substr(0, iDotPos));
			
			return sName.substr(iDotPos + 1);
		}, this);
		
		this.type = ko.observable('');
		this.size = ko.observable(0);
		
		this.friendlySize = ko.computed(function () {
			return Utils.friendlySize(this.size());
		}, this);
	
		this.downloadTitle = ko.computed(function () {
			return Utils.i18n('MESSAGE/ATTACHMENT_CLICK_TO_DOWNLOAD', {
				'FILENAME': this.fileName(),
				'SIZE': this.friendlySize()
			});
		}, this);
	
		this.hash = ko.observable('');
		
		this.downloadLink = ko.computed(function () {
			return Utils.getDownloadLinkByHash(
				!bExtApp && AppData && AppData.Accounts ? AppData.Accounts.currentId() : 0,
				this.hash(),
				bExtApp,
				bExtApp && AppData ? AppData.TenantHash : ''
			);
		}, this);
		
		this.viewLink = ko.computed(function () {
			return Utils.getViewLinkByHash(
				!bExtApp && AppData && AppData.Accounts ? AppData.Accounts.currentId() : 0,
				this.hash(),
				bExtApp,
				bExtApp && AppData ? AppData.TenantHash : ''
			);
		}, this);
	
		this.uploadUID = ko.observable('');
		this.uploaded = ko.observable(false);
		this.uploadError = ko.observable(false);
	
		this.visibleViewLink = ko.computed(function () {
			var bAllowedType = (-1 !== $.inArray(this.type(), aViewMimeTypes));
			return this.uploaded() && !this.uploadError() && bAllowedType;
		}, this);
		
		this.visibleSpinner = ko.observable(false);
		this.statusText = ko.observable('');
		this.progressPercent = ko.observable(0);
		this.visibleProgress = ko.observable(false);
		
		this.uploadStarted = ko.observable(false);
		this.uploadStarted.subscribe(function () {
			if (this.uploadStarted())
			{
				this.uploaded(false);
				this.visibleProgress(true);
				this.progressPercent(20);
			}
			else
			{
				this.progressPercent(100);
				this.visibleProgress(false);
				this.uploaded(true);
			}
		}, this);
	}
	
	/**
	 * Parses attachment data from server.
	 *
	 * @param {AjaxAttachmenResponse} oData
	 */
	CHelpdeskAttachmentModel.prototype.parse = function (oData)
	{
		if (oData)
		{
			this.type(oData.MimeType.toString());
			this.fileName(oData.FileName.toString());
			this.size(Utils.pInt(oData.SizeInBytes));
			this.hash(oData.Hash);
			this.uploaded(true);
		}
	};
	
	
	/**
	 * Fills attachment data for upload.
	 *
	 * @param {string} sFileUID
	 * @param {Object} oFileData
	 */
	CHelpdeskAttachmentModel.prototype.onUploadSelect = function (sFileUID, oFileData)
	{
		this.fileName(oFileData['FileName']);
		this.type(oFileData['Type']);
		this.size(Utils.pInt(oFileData['Size']));
	
		this.uploadUID(sFileUID);
		this.uploaded(false);
		this.visibleSpinner(false);
		this.statusText('');
		this.progressPercent(0);
		this.visibleProgress(false);
	};
	
	/**
	 * Starts spinner and progress.
	 */
	CHelpdeskAttachmentModel.prototype.onUploadStart = function ()
	{
		this.visibleSpinner(true);
		this.visibleProgress(true);
	};
	
	/**
	 * Fills progress upload data.
	 *
	 * @param {number} iUploadedSize
	 * @param {number} iTotalSize
	 */
	CHelpdeskAttachmentModel.prototype.onUploadProgress = function (iUploadedSize, iTotalSize)
	{
		if (iTotalSize > 0)
		{
			this.progressPercent(Math.ceil(iUploadedSize / iTotalSize * 100));
			this.visibleProgress(true);
		}
	};
	
	/**
	 * Fills data when upload has completed.
	 *
	 * @param {string} sUid
	 * @param {boolean} bResponseReceived
	 * @param {{Error:string,Result:{HelpdeskFile:AjaxUploadAttachmenResponse}}} oResult
	 */
	CHelpdeskAttachmentModel.prototype.onUploadComplete = function (sUid, bResponseReceived, oResult)
	{
		var
			self = this,
			bError = !bResponseReceived || !oResult || oResult.Error || false,
			sError = (oResult && oResult.Error === 'size') ?
				Utils.i18n('COMPOSE/UPLOAD_ERROR_SIZE') :
				Utils.i18n('COMPOSE/UPLOAD_ERROR_UNKNOWN')
		;
	
		this.visibleSpinner(false);
		this.progressPercent(0);
		this.visibleProgress(false);
	
		if (bError)
		{
			this.uploaded(true);
			this.uploadError(true);
			this.statusText(sError);
		}
		else
		{
			this.tempName(oResult.Result.HelpdeskFile.TempName);
			this.uploadError(false);
			this.uploaded(true);
			this.type(oResult.Result.HelpdeskFile.MimeType);
			this.hash(oResult.Result.HelpdeskFile.Hash);
			this.statusText(Utils.i18n('COMPOSE/UPLOAD_COMPLETE'));
	
			window.setTimeout(function () {
				self.statusText('');
			}, 3000);
		}
	};
	
	/**
	 * Starts viewing attachment on click.
	 */
	CHelpdeskAttachmentModel.prototype.viewAttachment = function ()
	{
		var
			oWin = null,
			sUrl = ''
		;
		
		if (this.visibleViewLink() && this.viewLink().length > 0 && this.viewLink() !== '#')
		{
			sUrl = Utils.getAppPath() + this.viewLink();
			oWin = Utils.WindowOpener.open(sUrl, sUrl, false);
	
			if (oWin)
			{
				oWin.focus();
			}
		}
	};
	
	/**
	 * Starts downloading attachment on click.
	 */
	CHelpdeskAttachmentModel.prototype.downloadAttachment = function ()
	{
		if (this.downloadLink().length > 0 && this.downloadLink() !== '#')
		{
			App.downloadByUrl(this.downloadLink());
		}
	};
	
	
	/**
	 * @constructor
	 */
	function CSignatureModel()
	{
		this.iAccountId = 0;
	
		this.type = ko.observable(true);
		this.options = ko.observable(0);
		this.signature = ko.observable('');
		
	}
	
	/**
	 * Calls a recursive parsing of the folder tree.
	 * 
	 * @param {number} iAccountId
	 * @param {Object} oData
	 */
	CSignatureModel.prototype.parse = function (iAccountId, oData)
	{
		this.iAccountId = iAccountId;
		
	//	this.type(parseInt(oData.Type, 10) === 1 ? true : false);
		this.options(parseInt(oData.Options, 10));
		this.signature(oData.Signature);
	};
	
	/**
	 * @constructor
	 */
	function CAutoresponderModel()
	{
		this.iAccountId = 0;
	
		this.enable = false;
		this.subject = '';
		this.message = '';
	}
	
	/**
	 * @param {number} iAccountId
	 * @param {Object} oData
	 */
	CAutoresponderModel.prototype.parse = function (iAccountId, oData)
	{
		this.iAccountId = iAccountId;
	
		this.enable = !!oData.Enable;
		this.subject = Utils.pString(oData.Subject);
		this.message = Utils.pString(oData.Message);
	};
	
	/**
	 * @constructor
	 */
	function CFetcherModel()
	{
		this.idFetcher = ko.observable(0);
		this.idAccount = ko.observable(0);
		this.isEnabled = ko.observable(false);
		this.isLocked = ko.observable(false);
		this.email = ko.observable('');
		this.userName = ko.observable('');
		this.folder = ko.observable('');
		this.signature = ko.observable('');
		this.incomingMailServer = ko.observable('');
		this.incomingMailPort = ko.observable(0);
		this.incomingMailLogin = ko.observable('');
		this.leaveMessagesOnServer = ko.observable('');
		this.isOutgoingEnabled = ko.observable(false);
		this.outgoingMailServer = ko.observable('');
		this.outgoingMailPort = ko.observable(0);
		this.outgoingMailAuth = ko.observable(false);
		
		this.fullEmail = ko.computed(function () {
			if (this.userName() === '')
			{
				return this.email();
			}
			else
			{
				return this.userName() + ' <' + this.email() + '>';
			}
		}, this);
	}
	
	/**
	 * @constructor
	 */
	function CFetcherListModel()
	{
		this.idAccount = 0;
	
		this.collection = ko.observableArray([]);
	}
	
	/**
	 * @param {number} iAccountId
	 * @param {Array} aData
	 */
	CFetcherListModel.prototype.parse = function (iAccountId, aData)
	{
		this.idAccount = iAccountId;
	
		var
			aParsedCollection = [],
			iIndex = 0,
			iLen = 0,
			oFetcher = null,
			oData = null
		;
	
		if (_.isArray(aData))
		{
			for (iLen = aData.length; iIndex < iLen; iIndex++)
			{
				oData = aData[iIndex];
				oFetcher = new CFetcherModel();
	
				oFetcher.idFetcher(oData['IdFetcher']);
				oFetcher.idAccount(oData['IdAccount']);
				oFetcher.isEnabled(oData['IsEnabled']);
				oFetcher.isLocked(oData['IsLocked']);
				oFetcher.email(oData['Email']);
				oFetcher.userName(oData['Name']);
				oFetcher.folder(oData['Folder']);
				oFetcher.signature(oData['Signature']);
				oFetcher.incomingMailServer(oData['IncomingMailServer']);
				oFetcher.incomingMailPort(oData['IncomingMailPort']);
				oFetcher.incomingMailLogin(oData['IncomingMailLogin']);
				oFetcher.leaveMessagesOnServer(oData['LeaveMessagesOnServer']);
				oFetcher.isOutgoingEnabled(oData['IsOutgoingEnabled']);
				oFetcher.outgoingMailServer(oData['OutgoingMailServer']);
				oFetcher.outgoingMailPort(oData['OutgoingMailPort']);
				oFetcher.outgoingMailAuth(oData['OutgoingMailAuth']);
	
				aParsedCollection.push(oFetcher);
			}
		}
	
		this.collection(aParsedCollection);
	};
	
	/**
	 * @param {number} iFetcherId
	 */
	CFetcherListModel.prototype.getFetcher = function (iFetcherId)
	{
		var
			oFetcher = null,
			iIndex = 0,
			iLen = 0,
			collection = this.collection()
		;
	
		for (iLen = collection.length; iIndex < iLen; iIndex++)
		{
			if (collection[iIndex].idFetcher() === iFetcherId)
			{
				oFetcher = collection[iIndex];
			}
		}
	
		return oFetcher;
	};
	
	
	/**
	 * @constructor
	 */
	function CForwardModel()
	{
		this.iAccountId = 0;
	
		this.enable = false;
		this.email = '';
	}
	
	/**
	 * @param {number} iAccountId
	 * @param {Object} oData
	 */
	CForwardModel.prototype.parse = function (iAccountId, oData)
	{
		this.iAccountId = iAccountId;
	
		this.enable = !!oData.Enable;
		this.email = Utils.pString(oData.Email);
	};
	
	/**
	 * @constructor
	 */
	function CSieveFiltersModel()
	{
		this.iAccountId = 0;
		this.collection = ko.observableArray([]);
	}
	
	/**
	 * @param {number} iAccountId
	 * @param {Object} oData
	 */
	CSieveFiltersModel.prototype.parse = function (iAccountId, oData)
	{
		var 
			iIndex = 0,
			iLen = oData.length,
			oSieveFilter = null
		;
	
		this.iAccountId = iAccountId;
		
		if (_.isArray(oData))
		{
			for (iLen = oData.length; iIndex < iLen; iIndex++)
			{	
				oSieveFilter =  new CSieveFilterModel(iAccountId);
				oSieveFilter.parse(oData[iIndex]);
				this.collection.push(oSieveFilter);
			}
		}
	};
	
	/**
	 * @param {number} iAccountID
	 * @constructor
	 */
	function CSieveFilterModel(iAccountID)
	{
		this.iAccountId = iAccountID;
		
		this.enable = ko.observable(true);
		
		this.field = ko.observable(''); //map to Field
		this.condition = ko.observable('');
		this.filter = ko.observable('');
		this.action = ko.observable('');
		this.folder = ko.observable('');
	}
	
	/**
	 * @param {Object} oData
	 */
	CSieveFilterModel.prototype.parse = function (oData)
	{
		this.enable(!!oData.Enable);
	
		this.field(Utils.pInt(oData.Field));
		this.condition(Utils.pInt(oData.Condition));
		this.filter(Utils.pString(oData.Filter));
		this.action(Utils.pInt(oData.Action));
		this.folder(Utils.pString(oData.FolderFullName));
	};
	
	CSieveFilterModel.prototype.toString = function ()
	{
		var aState = [
			this.enable(),
			this.field(),
			this.condition(),
			this.filter(),
			this.action(),
			this.folder()
		];
		
		return aState.join(':');	
	};
	
	
	/**
	 * @constructor
	 */
	function CInformationViewModel()
	{
		this.loadingMessage = ko.observable('');
		this.loadingVisible = ko.observable(false);
		this.reportMessage = ko.observable('');
		this.reportVisible = ko.observable(false);
		this.iReportTimeout = NaN;
		this.errorMessage = ko.observable('');
		this.errorNotHide = ko.observable(false);
		this.errorVisible = ko.observable(false);
		this.iErrorTimeout = -1;
		this.isHtmlError = ko.observable(false);
	}
	
	/**
	 * @param {string} sMessage
	 */
	CInformationViewModel.prototype.showLoading = function (sMessage)
	{
		if (sMessage && sMessage !== '')
		{
			this.loadingMessage(sMessage);
		}
		else
		{
			this.loadingMessage(Utils.i18n('MAIN/LOADING'));
		}
		this.loadingVisible(true);
	}
	;
	
	CInformationViewModel.prototype.hideLoading = function ()
	{
		this.loadingVisible(false);
	};
	
	/**
	 * Displays a message. Starts a timer for hiding.
	 * 
	 * @param {string} sMessage
	 * @param {number} iDelay
	 */
	CInformationViewModel.prototype.showReport = function (sMessage, iDelay)
	{
		var self = this;
		
		iDelay = iDelay || 5000;
		
		if (sMessage && sMessage !== '')
		{
			this.reportMessage(sMessage);
			this.reportVisible(true);
			if (!isNaN(this.iReportTimeout))
			{
				clearTimeout(this.iReportTimeout);
			}
			this.iReportTimeout = setTimeout(function () {
				self.reportVisible(false);
			}, iDelay);
		}
		else
		{
			this.reportVisible(false);
		}
	};
	
	/**
	 * Displays an error message. Starts a timer for hiding.
	 * 
	 * @param {string} sMessage
	 * @param {boolean=} bHtml = false
	 * @param {boolean=} bNotHide = false
	 */
	CInformationViewModel.prototype.showError = function (sMessage, bHtml, bNotHide)
	{
		var self = this;
		
		if (sMessage && sMessage !== '')
		{
			this.errorNotHide(!!bNotHide);
			this.errorMessage(sMessage);
			this.errorVisible(true);
			this.isHtmlError(bHtml);
			clearTimeout(this.iErrorTimeout);
			if (!bNotHide)
			{
				this.iErrorTimeout = setTimeout(function () {
					self.errorVisible(false);
				}, 5000);
			}
		}
		else
		{
			this.errorVisible(false);
		}
	};
	
	CInformationViewModel.prototype.hideError = function (sMessage, bHtml, bNotHide)
	{
		this.errorVisible(false);
	};
	
	
	/**
	 * @constructor
	 */
	function CHeaderViewModel()
	{
		this.oPhone = new CPhoneViewModel();
		this.allowVoice = AppData.User.AllowVoice;
	
		this.currentAccountId = AppData.Accounts.currentId;
		this.currentAccountId.subscribe(function () {
			this.changeCurrentAccount();
		}, this);
		
		this.tabs = App.headerTabs;
	
		this.email = ko.observable('');
		this.accounts = AppData.Accounts.collection;
		
		this.currentTab = App.Screens.currentScreen;
	
		this.sMailboxHash = App.Routing.buildHashFromArray([Enums.Screens.Mailbox]);
		this.sSettingsHash = App.Routing.buildHashFromArray([Enums.Screens.Settings]);
		
		this.contactsRecivedAnim = App.ContactsCache.recivedAnim;
		this.calendarRecivedAnim = App.CalendarCache.recivedAnim;
	}
	
	CHeaderViewModel.prototype.gotoMailbox = function ()
	{
		App.Routing.setLastMailboxHash();
		
		return false;
	};
	
	CHeaderViewModel.prototype.onRoute = function ()
	{
		this.changeCurrentAccount();
	};
	
	CHeaderViewModel.prototype.changeCurrentAccount = function ()
	{
		this.email(AppData.Accounts.getEmail());
	};
	
	CHeaderViewModel.prototype.logout = function ()
	{
		App.logout();
	};
	
	
	/**
	 * @constructor
	 * @param {number} iCount
	 * @param {number} iPerPage
	 */
	function CPageSwitcherViewModel(iCount, iPerPage)
	{
		this.currentPage = ko.observable(1);
		this.count = ko.observable(iCount);
		this.perPage = ko.observable(iPerPage);
	
		this.pagesCount = ko.computed(function () {
			var iCount = Math.ceil(this.count() / this.perPage());
			return (iCount > 0) ? iCount : 1;
		}, this);
		
		this.firstPage = ko.computed(function () {
			var iValue = (this.currentPage() - 2);
			return (iValue > 0) ? iValue : 1;
		}, this);
	
		this.lastPage = ko.computed(function () {
			var iValue = this.firstPage() + 4;
			return (iValue <= this.pagesCount()) ? iValue : this.pagesCount();
		}, this);
	
		this.visibleFirst = ko.computed(function () {
			return (this.firstPage() > 1);
		}, this);
	
		this.visibleLast = ko.computed(function () {
			return (this.lastPage() < this.pagesCount());
		}, this);
	
		this.pages = ko.computed(function () {
			var
				iIndex = this.firstPage(),
				aPages = []
			;
	
			if (this.firstPage() < this.lastPage()) {
				for (; iIndex <= this.lastPage(); iIndex++) {
					aPages.push({
						number: iIndex,
						current: (iIndex === this.currentPage()),
						clickFunc: _.bind(this.clickPage, this)
					});
				}
			}
	
			return aPages;
		}, this);
	}
	
	CPageSwitcherViewModel.prototype.clear = function ()
	{
		this.currentPage(1);
		this.count(0);
	};
	
	/**
	 * @param {number} iCount
	 */
	CPageSwitcherViewModel.prototype.setCount = function (iCount)
	{
		this.count(iCount);
		if (this.currentPage() > this.pagesCount())
		{
			this.currentPage(this.pagesCount());
		}
	};
	
	/**
	 * @param {number} iPage
	 * @param {number} iPerPage
	 */
	CPageSwitcherViewModel.prototype.setPage = function (iPage, iPerPage)
	{
		this.perPage(iPerPage);
		if (iPage > this.pagesCount())
		{
			this.currentPage(this.pagesCount());
		}
		else
		{
			this.currentPage(iPage);
		}
	};
	
	/**
	 * @param {Object} oPage
	 */
	CPageSwitcherViewModel.prototype.clickPage = function (oPage)
	{
		var iPage = oPage.number;
		if (iPage < 1) {
			iPage = 1;
		}
		if (iPage > this.pagesCount()) {
			iPage = this.pagesCount();
		}
		this.currentPage(iPage);
	};
	
	CPageSwitcherViewModel.prototype.clickFirstPage = function ()
	{
		this.currentPage(1);
	};
	
	CPageSwitcherViewModel.prototype.clickPreviousPage = function ()
	{
		var iPrevPage = this.firstPage() - 1;
		if (iPrevPage < 1) {
			iPrevPage = 1;
		}
		this.currentPage(iPrevPage);
	};
	
	CPageSwitcherViewModel.prototype.clickNextPage = function ()
	{
		var iNextPage = this.lastPage() + 1;
		if (iNextPage > this.pagesCount()) {
			iNextPage = this.pagesCount();
		}
		this.currentPage(iNextPage);
	};
	
	CPageSwitcherViewModel.prototype.clickLastPage = function ()
	{
		this.currentPage(this.pagesCount());
	};
	
	/**
	 * @constructor
	 * @param {boolean} bAllowInsertImage
	 */
	function CHtmlEditorViewModel(bAllowInsertImage)
	{
		this.creaId = 'creaId' + Math.random().toString().replace('.', '');
		this.workareaDom = ko.observable();
		this.uploaderAreaDom = ko.observable();
		this.editorUploaderBodyDragOver = ko.observable(false);
		this.editorUploaderProgress = ko.observable(false);
		
		this.colorPickerDropdownDom = ko.observable();
		this.insertLinkDropdownDom = ko.observable();
		this.insertImageDropdownDom = ko.observable();
	
		this.isEnable = ko.observable(true);
	
		this.allowInsertImage = ko.observable(bAllowInsertImage && AppData.App.AllowInsertImage);
		this.lockFontSubscribing = ko.observable(false);
	
		this.aFonts = ['Arial', 'Arial Black', 'Courier New', 'Tahoma', 'Times New Roman', 'Verdana'];
		this.iDefaultFont = 'Tahoma';
		this.selectedFont = ko.observable(this.iDefaultFont);
		this.selectedFont.subscribe(function () {
			if (!this.lockFontSubscribing())
			{
				this.oCrea.fontName(this.selectedFont());
			}
		}, this);
	
		this.aSizes = [1, 2, 3, 4, 5, 6, 7];
		this.iDefaultSize = 3;
		this.selectedSize = ko.observable(this.iDefaultSize);
		this.selectedSize.subscribe(function () {
			if (!this.lockFontSubscribing())
			{
				this.oCrea.fontSize(this.selectedSize());
			}
		}, this);
	
		this.visibleInsertLinkPopup = ko.observable(false);
		this.linkForInsert = ko.observable('');
		this.linkFocused = ko.observable(false);
		this.visibleLinkPopup = ko.observable(false);
		this.linkPopupTop = ko.observable(0);
		this.linkPopupLeft = ko.observable(0);
		this.linkHref = ko.observable('');
		this.visibleLinkHref = ko.observable(false);
	
		this.visibleImagePopup = ko.observable(false);
		this.visibleImagePopup.subscribe(function () {
			this.onImageOut();
		}, this);
		this.imagePopupTop = ko.observable(0);
		this.imagePopupLeft = ko.observable(0);
		this.imageSelected = ko.observable(false);
		
		this.tooltipText = ko.observable('');
		this.tooltipPopupTop = ko.observable(0);
		this.tooltipPopupLeft = ko.observable(0);
	
		this.visibleInsertImagePopup = ko.observable(false);
		this.imageUploaderButton = ko.observable(null);
		this.uploadedImagePathes = ko.observableArray([]);
		this.imagePathFromWeb = ko.observable('');
	
		this.visibleFontColorPopup = ko.observable(false);
		this.oFontColorPicker = new CColorPickerViewModel(Utils.i18n('HTMLEDITOR/TEXT_COLOR_CAPTION'), this.setTextColorFromPopup, this);
		this.oBackColorPicker = new CColorPickerViewModel(Utils.i18n('HTMLEDITOR/BACKGROUND_COLOR_CAPTION'), this.setBackColorFromPopup, this);
	
		this.activitySource = ko.observable(1);
		this.inactive = ko.observable(false);
		this.inactive.subscribe(function () {
			var sText = this.removeAllTags(this.getText());
			
			if (this.inactive())
			{
				if (sText === '' || sText === '&nbsp;')
				{
					this.setText('<span style="color: #AAAAAA;">' + Utils.i18n('HTMLEDITOR/SIGNATURE_PLACEHOLDER') + '</span>');
				}
			}
			else
			{
				if (sText === Utils.i18n('HTMLEDITOR/SIGNATURE_PLACEHOLDER'))
				{
					this.setText('');
				}
			}
		}, this);
	}
	
	CHtmlEditorViewModel.prototype.init = function ()
	{
		$(document.body).on('click', _.bind(function () {
			this.closeAllPopups();
		}, this));
		
		$(this.colorPickerDropdownDom()).on('click', function (oEvent) {
			oEvent.stopPropagation();
		});
		
		$(this.insertLinkDropdownDom()).on('click', function (oEvent) {
			oEvent.stopPropagation();
		});
		
		$(this.insertImageDropdownDom()).on('click', function (oEvent) {
			oEvent.stopPropagation();
		});
		
		this.initEditorUploader();
	};
	
	/**
	 * @param {Object} $link
	 */
	CHtmlEditorViewModel.prototype.showLinkPopup = function ($link)
	{
		var
			$workarea = $(this.workareaDom()),
			oWorkareaPos = $workarea.position(),
			oPos = $link.position(),
			iHeight = $link.height()
		;
		
		this.linkHref($link.attr('href'));
		this.linkPopupLeft(Math.round(oPos.left + oWorkareaPos.left));
		this.linkPopupTop(Math.round(oPos.top + iHeight + oWorkareaPos.top));
	
		this.visibleLinkPopup(true);
	};
	
	CHtmlEditorViewModel.prototype.hideLinkPopup = function ()
	{
		this.visibleLinkPopup(false);
	};
	
	CHtmlEditorViewModel.prototype.showChangeLink = function ()
	{
		this.visibleLinkHref(true);
		this.hideLinkPopup();
	};
	
	CHtmlEditorViewModel.prototype.changeLink = function ()
	{
		this.oCrea.changeLink(this.linkHref());
		this.hideChangeLink();
	};
	
	CHtmlEditorViewModel.prototype.hideChangeLink = function ()
	{
		this.visibleLinkHref(false);
	};
	
	/**
	 * @param {jQuery} $image
	 */
	CHtmlEditorViewModel.prototype.showImagePopup = function ($image, oEvent)
	{
		var
			$workarea = $(this.workareaDom()),
			oWorkareaPos = $workarea.position(),
			oWorkareaOffset = $workarea.offset()
	//		oPos = $image.position(),
	//		iHeight = $image.height()
		;
		
		this.imagePopupLeft(Math.round(oEvent.pageX + oWorkareaPos.left - oWorkareaOffset.left));
		this.imagePopupTop(Math.round(oEvent.pageY + oWorkareaPos.top - oWorkareaOffset.top));
	
		this.visibleImagePopup(true);
	};
	
	CHtmlEditorViewModel.prototype.hideImagePopup = function ()
	{
		this.visibleImagePopup(false);
	};
	
	CHtmlEditorViewModel.prototype.resizeImage = function (sSize)
	{
		var oParams = {
			'width': 'auto'
		};
		
		switch (sSize)
		{
			case Enums.HtmlEditorImageSizes.Small:
			  oParams.width = '300px';
			  break;
			case Enums.HtmlEditorImageSizes.Medium:
			  oParams.width = '600px';
			  break;
			case Enums.HtmlEditorImageSizes.Large:
			  oParams.width = '1200px';
			  break;
			case Enums.HtmlEditorImageSizes.Original:
			  oParams.width = 'auto';
			  break;
		}
		
		this.oCrea.changeCurrentImage(oParams);
		
		this.visibleImagePopup(false);
	};
	
	CHtmlEditorViewModel.prototype.onImageOver = function (oEvent)
	{
		if (oEvent.target.nodeName === 'IMG' && !this.visibleImagePopup())
		{
			this.imageSelected(true);
			
			this.tooltipText(Utils.i18n('HTMLEDITOR/CLICK_TO_EDIT_IMAGE'));
			
			var 
				self = this,
				$workarea = $(this.workareaDom()),
				oWorkareaPos = $workarea.position(),
				oWorkareaOffset = $workarea.offset()
			;
			
			$workarea.bind('mousemove.image', function (oEvent) {
				self.tooltipPopupTop(Math.round(oEvent.pageY + oWorkareaPos.top - oWorkareaOffset.top));
				self.tooltipPopupLeft(Math.round(oEvent.pageX + oWorkareaPos.left - oWorkareaOffset.left));
			});
		}
		
		return true;
	};
	
	CHtmlEditorViewModel.prototype.onImageOut = function (oEvent)
	{
		if (this.imageSelected())
		{
			this.imageSelected(false);
			
			var $workarea = $(this.workareaDom());
			$workarea.unbind('mousemove.image');
		}
		
		return true;
	};
	
	/**
	 * @param {string} sText
	 * @param {string} sTabIndex
	 */
	CHtmlEditorViewModel.prototype.initCrea = function (sText, sTabIndex)
	{
		if (!this.oCrea)
		{
			this.init();
			this.oCrea = new Crea({
				'creaId': this.creaId,
				'tabindex': sTabIndex,
				'text': sText,
				'fontNameArray': this.aFonts,
				'defaultFontName': this.iDefaultFont,
				'defaultFontSize': this.iDefaultSize,
				'enableDrop': false,
				'onCursorMove': _.bind(this.setFontValuesFromText, this),
				'onFocus': _.bind(this.onCreaFocus, this),
				'onUrlIn': _.bind(this.showLinkPopup, this),
				'onUrlOut': _.bind(this.hideLinkPopup, this),
				'onImageSelect': _.bind(this.showImagePopup, this),
				'onImageBlur': _.bind(this.hideImagePopup, this),
				'onItemOver': _.bind(this.onImageOver, this),
				'onItemOut': _.bind(this.onImageOut, this)
			});
		}
		else
		{
			this.setText(sText);
			this.oCrea.setTabIndex(sTabIndex);
		}
	};
	
	CHtmlEditorViewModel.prototype.setFocus = function ()
	{
		if (this.oCrea)
		{
			this.oCrea.setFocus(false);
		}
	};
	
	/**
	 * @param {string} sSignatureContent
	 */
	CHtmlEditorViewModel.prototype.changeSignatureContent = function (sSignatureContent)
	{
		if (this.oCrea)
		{
			this.oCrea.changeSignatureContent(sSignatureContent);
		}
	};
	
	CHtmlEditorViewModel.prototype.setFontValuesFromText = function ()
	{
		this.lockFontSubscribing(true);
		this.selectedFont(this.oCrea.getFontName());
		this.selectedSize(this.oCrea.getFontSize());
		this.lockFontSubscribing(false);
	};
	
	/**
	 * @param {boolean=} bRemoveSignatureAnchor = false
	 */
	CHtmlEditorViewModel.prototype.getText = function (bRemoveSignatureAnchor)
	{
		if (this.oCrea)
		{
			return this.oCrea.getText(bRemoveSignatureAnchor);
		}
		
		return '';
	};
	
	/**
	 * @param {string} sText
	 */
	CHtmlEditorViewModel.prototype.setText = function (sText)
	{
		if (this.oCrea)
		{
			this.oCrea.setText(sText);
			this.inactive.valueHasMutated();
		}
	};
	
	/**
	 * @param {string} sText
	 */
	CHtmlEditorViewModel.prototype.removeAllTags = function (sText)
	{
		return sText.replace(/<style>.*<\/style>/g, '').replace(/<[^>]*>/g, '');
	};
	
	/**
	 * @param {koProperty} activitySource
	 */
	CHtmlEditorViewModel.prototype.setActivitySource = function (activitySource)
	{
		this.activitySource = activitySource;
		
		this.activitySource.subscribe(function () {
			this.inactive(Utils.pInt(this.activitySource()) === 0);
		}, this);
	
		this.inactive(Utils.pInt(this.activitySource()) === 0);
	};
	
	CHtmlEditorViewModel.prototype.onCreaFocus = function ()
	{
		if(this.isEnable() && this.oCrea)
		{
			this.oCrea.$editableArea.attr('contenteditable', true);
			this.closeAllPopups();
			this.activitySource(1);
		}
		else if (this.oCrea)
		{
			this.oCrea.$editableArea.attr('contenteditable', false);
		}
	};
	
	CHtmlEditorViewModel.prototype.closeAllPopups = function ()
	{
		this.visibleInsertLinkPopup(false);
		this.visibleInsertImagePopup(false);
		this.visibleFontColorPopup(false);
	};
	
	CHtmlEditorViewModel.prototype.insertLink = function ()
	{
		if (!this.visibleInsertLinkPopup())
		{
			this.linkForInsert(this.oCrea.getSelectedText());
			this.closeAllPopups();
			this.visibleInsertLinkPopup(true);
			this.linkFocused(true);
		}
	};
	
	/**
	 * @param {Object} oCurrentViewModel
	 * @param {Object} event
	 */
	CHtmlEditorViewModel.prototype.insertLinkFromPopup = function (oCurrentViewModel, event)
	{
		if (this.linkForInsert().length > 0)
		{
			this.oCrea.insertLink(this.linkForInsert());
		}
		this.closeInsertLinkPopup(oCurrentViewModel, event);
	};
	
	/**
	 * @param {Object} oCurrentViewModel
	 * @param {Object} event
	 */
	CHtmlEditorViewModel.prototype.closeInsertLinkPopup = function (oCurrentViewModel, event)
	{
		this.visibleInsertLinkPopup(false);
		if (event)
		{
			event.stopPropagation();
		}
	};
	
	CHtmlEditorViewModel.prototype.textColor = function ()
	{
		this.closeAllPopups();
		this.visibleFontColorPopup(true);
		this.oFontColorPicker.onShow();
		this.oBackColorPicker.onShow();
	};
	
	/**
	 * @param {string} sColor
	 * @return string
	 */
	CHtmlEditorViewModel.prototype.colorToHex = function (sColor)
	{
	    if (sColor.substr(0, 1) === '#')
		{
	        return sColor;
	    }
	
		/*jslint bitwise: true*/
	    var
			aDigits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(sColor),
			iRed = parseInt(aDigits[2], 10),
			iGreen = parseInt(aDigits[3], 10),
			iBlue = parseInt(aDigits[4], 10),
			iRgb = iBlue | (iGreen << 8) | (iRed << 16),
			sRgb = iRgb.toString(16)
		;
		/*jslint bitwise: false*/
	
		while (sRgb.length < 6)
		{
			sRgb = '0' + sRgb;
		}
	
	    return aDigits[1] + '#' + sRgb;
	};
	
	/**
	 * @param {string} sColor
	 */
	CHtmlEditorViewModel.prototype.setTextColorFromPopup = function (sColor)
	{
		this.oCrea.textColor(this.colorToHex(sColor));
		this.visibleFontColorPopup(false);
	};
	
	/**
	 * @param {string} sColor
	 */
	CHtmlEditorViewModel.prototype.setBackColorFromPopup = function (sColor)
	{
		this.oCrea.backgroundColor(this.colorToHex(sColor));
		this.visibleFontColorPopup(false);
	};
	
	CHtmlEditorViewModel.prototype.insertImage = function ()
	{
		if (this.allowInsertImage() && !this.visibleInsertImagePopup())
		{
			this.imagePathFromWeb('');
			this.closeAllPopups();
			this.visibleInsertImagePopup(true);
			this.initUploader();
		}
	
		return true;
	};
	
	/**
	 * @param {Object} oCurrentViewModel
	 * @param {Object} event
	 */
	CHtmlEditorViewModel.prototype.insertWebImageFromPopup = function (oCurrentViewModel, event)
	{
		if (this.allowInsertImage() && this.imagePathFromWeb().length > 0)
		{
			this.oCrea.insertImage(this.imagePathFromWeb());
		}
	
		this.closeInsertImagePopup(oCurrentViewModel, event);
	};
	
	CHtmlEditorViewModel.prototype.clearImages = function ()
	{
		this.uploadedImagePathes([]);
	};
	
	/**
	 * @param {string} sUid
	 * @param oAttachment
	 */
	CHtmlEditorViewModel.prototype.insertComputerImageFromPopup = function (sUid, oAttachment)
	{
		var
			sViewLink = Utils.getViewLinkByHash(AppData.Accounts.currentId(), oAttachment.Hash),
			bResult = false
		;
	
		if (this.allowInsertImage() && sViewLink.length > 0)
		{
			bResult = this.oCrea.insertImage(sViewLink);
			if (bResult)
			{
				$(this.oCrea.$editableArea)
					.find('img[src="' + sViewLink + '"]')
					.attr('data-x-src-cid', sUid)
				;
	
				oAttachment.CID = sUid;
				this.uploadedImagePathes.push(oAttachment);
			}
		}
	
		this.closeInsertImagePopup();
	};
	
	/**
	 * @param {?=} oCurrentViewModel
	 * @param {?=} event
	 */
	CHtmlEditorViewModel.prototype.closeInsertImagePopup = function (oCurrentViewModel, event)
	{
		this.visibleInsertImagePopup(false);
		if (event)
		{
			event.stopPropagation();
		}
	};
	
	/**
	 * Initializes file uploader.
	 */
	CHtmlEditorViewModel.prototype.initUploader = function ()
	{
		if (this.imageUploaderButton() && !this.oJua)
		{
			this.oJua = new Jua({
				'action': '?/Upload/Attachment/',
				'name': 'jua-uploader',
				'queueSize': 2,
				'clickElement': this.imageUploaderButton(),
				'disableMultiple': true,
				'disableAjaxUpload': false,
				'disableDragAndDrop': true,
				'hidden': {
					'Token': function () {
						return AppData.Token;
					},
					'AccountID': function () {
						return AppData.Accounts.currentId();
					}
				},
				'onSelect': _.bind(this.onFileUploadSelect, this),
				'onComplete': _.bind(this.onFileUploadComplete, this)
			});
		}
	};
	
	/**
	 * Initializes file uploader for editor.
	 */
	CHtmlEditorViewModel.prototype.initEditorUploader = function ()
	{
		if (this.uploaderAreaDom() && !this.editorUploader)
		{
			var
				fBodyDragEnter = AppData.App.AllowInsertImage ?
					_.bind(this.editorUploaderBodyDragOver, this, true) : function () {},
				fBodyDragOver = AppData.App.AllowInsertImage ?
					_.bind(this.editorUploaderBodyDragOver, this, false) : function () {}
			;
			this.editorUploader = new Jua({
				'queueSize': 1,
				'dragAndDropElement': this.uploaderAreaDom(),
				'disableMultiple': true,
				'disableAjaxUpload': false,
				'disableDragAndDrop': false,
				'onBodyDragEnter': fBodyDragEnter,
				'onBodyDragLeave': fBodyDragOver,
				'onSelect': _.bind(this.onEditorDrop, this)
			});
		}
	};
	
	CHtmlEditorViewModel.prototype.onEditorDrop = function (sUid, oData) {
		var 
			oReader = null,
			oFile = null,
			self = this,
			bCreaFocused = false,
			hash = Math.random().toString()
		;
		
		if (oData && oData.File.type)
		{
			if (AppData.App.AllowInsertImage && 0 === oData.File.type.indexOf('image/'))
			{
				oFile = oData.File;
				if (AppData.App.ImageUploadSizeLimit > 0 && oFile.size > AppData.App.ImageUploadSizeLimit)
				{
					App.Screens.showPopup(AlertPopup, [Utils.i18n('COMPOSE/UPLOAD_ERROR_SIZE')]);
				}
				else
				{
					oReader = new window.FileReader();
					bCreaFocused = this.oCrea.bFocused;
					if (!bCreaFocused)
					{
						this.oCrea.setFocus(true);
					}
					this.oCrea.insertHtml('<img id="' + oFile.name + '_' + hash + '" src="skins/Default/images/wait.gif" />');
					if (!bCreaFocused)
					{
						this.oCrea.fixFirefoxCursorBug();
					}
	
					oReader.onload = (function () {
						return function (oEvent) {
							self.oCrea.$editableArea.find('img[id="' + oFile.name + '_' + hash + '"]').attr('src', oEvent.target.result);
						};
					}());
	
					oReader.readAsDataURL(oFile);
				}	
			}
			else
			{
				App.Screens.showPopup(AlertPopup, [Utils.i18n('HTMLEDITOR/UPLOAD_ERROR_NOT_IMAGE')]);
			}
		}
		
		return false;
	};
	
	/**
	 * @param {Object} oFile
	 */
	CHtmlEditorViewModel.prototype.isFileImage = function (oFile)
	{
		if (typeof oFile.Type === 'string')
		{
			return (-1 !== oFile.Type.indexOf('image'));
		}
		else
		{
			var
				iDotPos = oFile.FileName.lastIndexOf('.'),
				sExt = oFile.FileName.substr(iDotPos + 1),
				aImageExt = ['jpg', 'jpeg', 'gif', 'tif', 'tiff', 'png']
			;
	
			return (-1 !== $.inArray(sExt, aImageExt));
		}
	};
	
	/**
	 * @param {string} sUid
	 * @param {Object} oFile
	 */
	CHtmlEditorViewModel.prototype.onFileUploadSelect = function (sUid, oFile)
	{
		if (!this.isFileImage(oFile))
		{
			App.Screens.showPopup(AlertPopup, [Utils.i18n('HTMLEDITOR/UPLOAD_ERROR_NOT_IMAGE')]);
			return false;
		}
		
		this.closeInsertImagePopup();
		return true;
	};
	
	/**
	 * @param {string} sUid
	 * @param {boolean} bResponseReceived
	 * @param {Object} oData
	 */
	CHtmlEditorViewModel.prototype.onFileUploadComplete = function (sUid, bResponseReceived, oData)
	{
		var sError = '';
		
		if (oData && oData.Result)
		{
			if (oData.Result.Error)
			{
				sError = oData.Result.Error === 'size' ?
					Utils.i18n('COMPOSE/UPLOAD_ERROR_SIZE') :
					Utils.i18n('COMPOSE/UPLOAD_ERROR_UNKNOWN');
	
				App.Screens.showPopup(AlertPopup, [sError]);
			}
			else
			{
				this.oCrea.setFocus(true);
				this.insertComputerImageFromPopup(sUid, oData.Result.Attachment);
			}
		}
		else
		{
			App.Screens.showPopup(AlertPopup, [Utils.i18n('COMPOSE/UPLOAD_ERROR_UNKNOWN')]);
		}
	};
	
	/**
	 * @param {boolean} bState
	 */
	CHtmlEditorViewModel.prototype.stateSwitcher = function (bState)
	{
		this.isEnable(bState);
	};
	/**
	 * @constructor
	 * @param {string} sCaption
	 * @param {Function} fPickHandler
	 * @param {Object} oPickContext
	 */
	function CColorPickerViewModel(sCaption, fPickHandler, oPickContext)
	{
		this.aGreyColors = ['rgb(0, 0, 0)', 'rgb(68, 68, 68)', 'rgb(102, 102, 102)', 'rgb(153, 153, 153)',
			'rgb(204, 204, 204)', 'rgb(238, 238, 238)', 'rgb(243, 243, 243)', 'rgb(255, 255, 255)'];
		
		this.aBrightColors = ['rgb(255, 0, 0)', 'rgb(255, 153, 0)', 'rgb(255, 255, 0)', 'rgb(0, 255, 0)', 
			'rgb(0, 255, 255)', 'rgb(0, 0, 255)', 'rgb(153, 0, 255)', 'rgb(255, 0, 255)'];
		
		this.aColorLines = [
			['rgb(244, 204, 204)', 'rgb(252, 229, 205)', 'rgb(255, 242, 204)', 'rgb(217, 234, 211)', 
					'rgb(208, 224, 227)', 'rgb(207, 226, 243)', 'rgb(217, 210, 233)', 'rgb(234, 209, 220)'],
			['rgb(234, 153, 153)', 'rgb(249, 203, 156)', 'rgb(255, 229, 153)', 'rgb(182, 215, 168)', 
					'rgb(162, 196, 201)', 'rgb(159, 197, 232)', 'rgb(180, 167, 214)', 'rgb(213, 166, 189)'],
			['rgb(224, 102, 102)', 'rgb(246, 178, 107)', 'rgb(255, 217, 102)', 'rgb(147, 196, 125)', 
					'rgb(118, 165, 175)', 'rgb(111, 168, 220)', 'rgb(142, 124, 195)', 'rgb(194, 123, 160)'],
			['rgb(204, 0, 0)', 'rgb(230, 145, 56)', 'rgb(241, 194, 50)', 'rgb(106, 168, 79)', 
					'rgb(69, 129, 142)', 'rgb(61, 133, 198)', 'rgb(103, 78, 167)', 'rgb(166, 77, 121)'],
			['rgb(153, 0, 0)', 'rgb(180, 95, 6)', 'rgb(191, 144, 0)', 'rgb(56, 118, 29)', 
					'rgb(19, 79, 92)', 'rgb(11, 83, 148)', 'rgb(53, 28, 117)', 'rgb(116, 27, 71)'],
			['rgb(102, 0, 0)', 'rgb(120, 63, 4)', 'rgb(127, 96, 0)', 'rgb(39, 78, 19)', 
					'rgb(12, 52, 61)', 'rgb(7, 55, 99)', 'rgb(32, 18, 77)', 'rgb(76, 17, 48)']
		];
		
		this.caption = sCaption;
		this.pickHandler = fPickHandler;
		this.pickContext = oPickContext;
		
		this.colorPickerDom = ko.observable(null);
	}
	
	CColorPickerViewModel.prototype.onShow = function ()
	{
		$(this.colorPickerDom()).find('span.color-item').on('click', (function (self)
		{
			return function ()
			{
				self.setColorFromPopup($(this).data('color'));
			};
		})(this));
	};
	
	/**
	 * @param {string} sColor
	 */
	CColorPickerViewModel.prototype.setColorFromPopup = function (sColor)
	{
		this.pickHandler.call(this.pickContext, sColor);
	};
	/**
	 * @constructor
	 */
	function CPhoneViewModel()
	{
		this.phone = App.Phone;
		this.provider = App.Phone.provider;
		this.phoneReport = App.Phone.phoneReport;
		this.action = App.Phone.action;
		this.action.subscribe(function(sAction) {
			if (sAction === 'connection_end') {
				var self = this;
				_.delay(function () {
					self.action('standby');
				}, 500);
			}
		}, this);
		
		this.state = ko.observable('offline');
		this.input = ko.observable('');
		this.inputFocus = ko.observable(false);
		this.inputFocus.subscribe(function(bFocus) {
			if(!bFocus)
			{
				var self = this;
				_.delay(function () {
					if (self.action() === 'active') {
							self.action('standby');
					}
				}, 200);
			}
		}, this);
	
		this.phoneAutocompleteItem = ko.observable(null);
		
	//	console.log(AppData.User);
	}
	
	CPhoneViewModel.prototype.hangup = function ()
	{
		this.action('');
		this.phone.hangup();
	};
	
	CPhoneViewModel.prototype.call = function ()
	{
		App.Phone.call(Utils.getFormattedPhone(this.input()));
	};
	
	CPhoneViewModel.prototype.answer = function ()
	{
		this.phone.answer();
	};
	
	CPhoneViewModel.prototype.end = function ()
	{
		this.action('');
		this.phone.reconnect();
	};
	
	CPhoneViewModel.prototype.multiAction = function ()
	{
		var 
			self = this
		;
	
		// offline, standby, active, dial, outgoing, connected_out, incoming, connected_in
	
		if (this.action() === 'standby') {
			this.action('active');
			
			_.delay(function () {
				self.inputFocus(true);
			}, 500);
			
		} else if (this.action() === 'active' && this.input().length > 0) {
			this.action('dial');
			this.call();
		} else if (this.action() === 'active' && this.input().length === 0) {
			this.action('standby');
		} else if (
			this.action() === 'connected_in' ||
			this.action() === 'connected_out' ||
			this.action() === 'outgoing' ||
			this.action() === 'incoming'
		)
		{
			this.hangup();
			this.input('');
		}
		
	};
	
	
	//CPhoneViewModel.prototype.autocompleteCallback = function (sTerm, fResponse)
	//{
	//	var oParameters = {
	//			'Action': 'ContactSuggestions',
	//			'Search': sTerm,
	//			'GlobalOnly': '0'
	//		}
	//		;
	//
	//	this.phoneAutocompleteItem(null);
	//
	//	sTerm = Utils.trim(sTerm);
	//	if ('' !== sTerm)
	//	{
	//		App.Ajax.send(oParameters, function (oData) {
	//			var aList = [];
	//			if (oData && oData.Result && oData.Result && oData.Result.List)
	//			{
	//				aList = _.map(oData.Result.List, function (oItem) {
	//					/*return oItem && oItem.Email ? oItem.Email : '';*/
	//					return oItem && oItem.Email && oItem.Email !== this.owner() ?
	//						(oItem.Name && 0 < Utils.trim(oItem.Name).length ?
	//						{value:'"' + oItem.Name + '" <' + oItem.Email + '>', name: oItem.Name, email: oItem.Email} : {value: oItem.Email, name: '', email: oItem.Email}) : null;
	//				}, this);
	//
	//				aList = _.compact(aList);
	//			}
	//			fResponse(aList);
	//
	//		}, this);
	//	}
	//	else
	//	{
	//		fResponse([]);
	//	}
	//};
	
	
	/**
	 * @constructor
	 */
	function CLoginViewModel()
	{
		this.email = ko.observable('');
		this.login = ko.observable('');
		this.password = ko.observable('');
		
		this.rtl = ko.observable(Utils.isRTL());
		
		this.loginDescription = ko.observable('');
	
		this.emailFocus = ko.observable(false);
		this.loginFocus = ko.observable(false);
		this.passwordFocus = ko.observable(false);
	
		this.loading = ko.observable(false);
	
		this.loginFocus.subscribe(function (bFocus) {
			if (bFocus && '' === this.login()) {
				this.login(this.email());
			}
		}, this);
	
		this.loginFormType = ko.observable(AppData.App.LoginFormType);
		this.loginAtDomainValue = ko.observable(AppData.App.LoginAtDomainValue);
		this.loginAtDomainValueWithAt = ko.computed(function () {
			var sV = this.loginAtDomainValue();
			return '' === sV ? '' : '@' + sV;
		}, this);
	
		this.emailVisible = ko.computed(function () {
			return Enums.LoginFormType.Login !== this.loginFormType();
		}, this);
		
		this.loginVisible = ko.computed(function () {
			return Enums.LoginFormType.Email !== this.loginFormType();
		}, this);
	
		this.signMeType = ko.observable(AppData.App.LoginSignMeType);
		
		this.signMe = ko.observable(Enums.LoginSignMeType.DefaultOn === this.signMeType());
		this.signMeType.subscribe(function () {
			this.signMe(Enums.LoginSignMeType.DefaultOn === this.signMeType());
		}, this);
	
		this.focusedField = '';
	
		this.aLanguages = AppData.App.Languages;
		this.currentLanguage = ko.observable(AppData.App.DefaultLanguage);
		
		this.allowLanguages = ko.observable(AppData.App.AllowLanguageOnLogin);
		this.viewLanguagesAsDropdown = ko.observable(!AppData.App.FlagsLangSelect);
		
		this.canBeLogin = ko.computed(function () {
	
			var
				iLoginType = this.loginFormType(),
				sEmail = this.email(),
				sLogin = this.login(),
				sPassword = this.password()
			;
	
			return (
				!this.loading() &&
				'' !== Utils.trim(sPassword) &&
				(
					(Enums.LoginFormType.Login === iLoginType && '' !== Utils.trim(sLogin)) ||
					(Enums.LoginFormType.Email === iLoginType && '' !== Utils.trim(sEmail))
				)
			);
		}, this);
	
		this.signInButtonText = ko.computed(function () {
			return this.loading() ? Utils.i18n('LOGIN/BUTTON_SIGNING_IN') : Utils.i18n('LOGIN/BUTTON_SIGN_IN');
		}, this);
	
		this.loginCommand = Utils.createCommand(this, this.signIn, this.canBeLogin);
	
		this.email(AppData.App.DemoWebMailLogin || '');
		this.password(AppData.App.DemoWebMailPassword || '');
		this.loginDescription(AppData.App.LoginDescription || '');
	}
	
	CLoginViewModel.prototype.__name = 'CLoginViewModel';
	
	CLoginViewModel.prototype.onShow = function ()
	{
		if (this.emailVisible())
		{
			this.emailFocus(true);
		}
		else
		{
			this.loginFocus(true);
		}
		
		$html.toggleClass('screen-login-langblock', !this.viewLanguagesAsDropdown());
		$html.toggleClass('screen-login-description', this.loginDescription() !== '');
	};
	
	CLoginViewModel.prototype.signIn = function ()
	{
		this.sendRequest();
	};
	
	/**
	 * @param {Object} oData
	 */
	CLoginViewModel.prototype.onResponse = function (oData)
	{
		if (false === oData.Result)
		{
			this.loading(false);
			
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('WARNING/LOGIN_PASS_INCORRECT'));
		}
		else
		{
			window.location.reload();
		}
	};
	
	CLoginViewModel.prototype.sendRequest = function ()
	{
		var
			oParameters = {
				'Action': 'Login',
				'Email': this.email(),
				'IncLogin': this.login(),
				'IncPassword': this.password(),
				'SignMe': this.signMe() ? '1' : '0'
			}
		;
		
		this.loading(true);
		App.Ajax.send(oParameters, this.onResponse, this);
	};
	
	/**
	 * @param {string} sLanguage
	 */
	CLoginViewModel.prototype.changeLanguage = function (sLanguage)
	{
		if (sLanguage && this.allowLanguages())
		{
			this.currentLanguage(sLanguage);
	
			App.Ajax.send({
				'Action': 'LoginLanguageUpdate',
				'Language': sLanguage
			}, function () {
				window.location.reload();
			}, this);
		}
	};
	
	
	/**
	 * @constructor
	 */
	function CFolderListViewModel()
	{
		this.foldersContainer = ko.observable(null);
		
		this.folderList = App.MailCache.folderList;
		
		this.manageFoldersHash = App.Routing.buildHashFromArray([Enums.Screens.Settings, 
			Enums.SettingsTab.EmailAccounts, 
			Enums.AccountSettingsTab.Folders]);
	
		this.quotaProc = ko.observable(-1);
		this.quotaDesc = ko.observable('');
	
		ko.computed(function () {
	
			if (!AppData.App.ShowQuotaBar)
			{
				return true;
			}
	
			App.MailCache.quotaChangeTrigger();
	
			var
				oAccount = AppData.Accounts.getCurrent(),
				iQuota = oAccount ? oAccount.quota() : 0,
				iUsed = oAccount ? oAccount.usedSpace() : 0,
				iProc = 0 < iQuota ? Math.ceil((iUsed / iQuota) * 100) : -1
			;
	
			iProc = 100 < iProc ? 100 : iProc;
			
			this.quotaProc(iProc);
			this.quotaDesc(-1 < iProc ?
				Utils.i18n('MAILBOX/QUOTA_TOOLTIP', {
					'PROC': iProc,
					'QUOTA': Utils.friendlySize(iQuota * 1024)
				}) : '');
	
			return true;
			
		}, this);
	}
	
	
	/**
	 * @constructor
	 */
	function CMessageListViewModel()
	{
		this.isFocused = ko.observable(false);
	
		this.messagesContainer = ko.observable(null);
	
		this.searchInput = ko.observable('');
		this.searchInputFrom = ko.observable('');
		this.searchInputTo = ko.observable('');
		this.searchInputSubject = ko.observable('');
		this.searchInputText = ko.observable('');
		this.searchSpan = ko.observable('');
		this.highlightTrigger = ko.observable('');
		this.bAdvancedSearch = ko.observable(false);
		
		this.currentMessage = App.MailCache.currentMessage;
		this.currentMessage.subscribe(function () {
			this.isFocused(false);
			this.selector.itemSelected(this.currentMessage());
		}, this);
	
		this.folderList = App.MailCache.folderList;
		this.folderList.subscribe(this.onFolderListSubscribe, this);
		this.folderFullName = ko.observable('');
		this.filters = ko.observable('');
	
		this.uidList = App.MailCache.uidList;
		this.uidList.subscribe(function () {
			if (this.uidList().searchCountSubscription)
			{
				this.uidList().searchCountSubscription.dispose();
				this.uidList().searchCountSubscription = undefined;
			}
			this.uidList().searchCountSubscription = this.uidList().resultCount.subscribe(function () {
				if (this.uidList().resultCount() >= 0)
				{
					this.oPageSwitcher.setCount(this.uidList().resultCount());
				}
			}, this);
			
			if (this.uidList().resultCount() >= 0)
			{
				this.oPageSwitcher.setCount(this.uidList().resultCount());
			}
		}, this);
		this.useThreads = ko.computed(function () {
			var
				oFolder = this.folderList().currentFolder(),
				bFolderWithoutThreads = oFolder && oFolder.withoutThreads(),
				bNotSearchOrFilters = this.uidList().search() === '' && this.uidList().filters() === ''
			;
			
			return AppData.User.useThreads() && !bFolderWithoutThreads && bNotSearchOrFilters;
		}, this);
	
		this.collection = App.MailCache.messages;
		this.search = ko.observable('');
	
		this.isEmptyList = ko.computed(function () {
			return this.collection().length === 0;
		}, this);
	
		this.isNotEmptyList = ko.computed(function () {
			return this.collection().length !== 0;
		}, this);
	
		this.isSearch = ko.computed(function () {
			return this.search().length > 0;
		}, this);
	
		this.isLoading = App.MailCache.messagesLoading;
	
		this.isError = App.MailCache.messagesLoadingError;
	
		this.visibleInfoLoading = ko.computed(function () {
			return !this.isSearch() && this.isLoading();
		}, this);
		this.visibleInfoSearchLoading = ko.computed(function () {
			return this.isSearch() && this.isLoading();
		}, this);
		this.visibleInfoSearchList = ko.computed(function () {
			return this.isSearch() && !this.isLoading() && !this.isEmptyList();
		}, this);
		this.visibleInfoMessageListEmpty = ko.computed(function () {
			return !this.isLoading() && !this.isSearch() && this.isEmptyList() && !this.isError();
		}, this);
		this.visibleInfoSearchEmpty = ko.computed(function () {
			return this.isSearch() && this.isEmptyList() && !this.isError() && !this.isLoading();
		}, this);
		this.visibleInfoMessageListError = ko.computed(function () {
			return !this.isSearch() && this.isError();
		}, this);
		this.visibleInfoSearchError = ko.computed(function () {
			return this.isSearch() && this.isError();
		}, this);
	
		this.searchText = ko.computed(function () {
	
			return Utils.i18n('MAILBOX/INFO_SEARCH_RESULT', {
				'SEARCH': this.search(),
				'FOLDER': this.folderList().currentFolder() ? this.folderList().currentFolder().displayName() : ''
			});
			
		}, this);
	
		this.collectionChecked = ko.computed(function () {
			
			var aChecked = _.filter(this.collection(), function (oMessage) {
				return !oMessage.deleted() && oMessage.checked();
			});
	
			if (aChecked.length === 0 && App.MailCache.currentMessage() && !App.MailCache.currentMessage().deleted())
			{
				aChecked = [App.MailCache.currentMessage()];
			}
	
			return aChecked;
		}, this);
	
		this.collectionCheckedUids = ko.computed(function () {
			return _.map(this.collectionChecked(), function (oMessage) {
				return oMessage.uid();
			});
		}, this);
	
		this.isEnableGroupOperations = ko.observable(false).extend({'throttle': 250});
	
		this.selector = new CSelector(
			this.collection,
			_.bind(this.routeForMessage, this),
			_.bind(this.onDeletePress, this),
			_.bind(this.onMessageDblClick, this),
			_.bind(this.onEnterPress, this)
		);
	
		ko.computed(function () {
			this.isEnableGroupOperations(0 < this.selector.listCheckedOrSelected().length);
		}, this);
	
		this.checkAll = this.selector.koCheckAll();
		this.checkAllIncomplite = this.selector.koCheckAllIncomplete();
	
		this.pageSwitcherLocked = ko.observable(false);
		this.oPageSwitcher = new CPageSwitcherViewModel(0, AppData.User.MailsPerPage);
		this.oPageSwitcher.currentPage.subscribe(function (iPage) {
			var
				sFolder = this.folderList().currentFolderFullName(),
				sUid = this.currentMessage() ? this.currentMessage().uid() : '',
				sSearch = this.search()
			;
			
			if (!this.pageSwitcherLocked())
			{
				this.changeRoutingForMessageList(sFolder, iPage, sUid, sSearch, this.filters());
			}
		}, this);
		
		// to the message list does not twitch
		if (App.browser.firefox || App.browser.ie)
		{
			this.listChangedThrottle = ko.observable(false).extend({'throttle': 10});
		}
		else
		{
			this.listChangedThrottle = ko.observable(false);
		}
		
		this.firstCompleteCollection = ko.observable(true);
		this.collection.subscribe(function () {
			if (this.collection().length > 0)
			{
				this.firstCompleteCollection(false);
			}
		}, this);
		this.currentAccountId = AppData.Accounts.currentId;
		this.listChanged = ko.computed(function () {
			return [
				this.firstCompleteCollection(),
				this.currentAccountId(),
				this.folderFullName(),
				this.filters(),
				this.search(),
				this.oPageSwitcher.currentPage()
			];
		}, this);
		
		this.listChanged.subscribe(function() {
			this.listChangedThrottle(!this.listChangedThrottle());
		}, this);
	}
	
	/**
	 * @param {string} sFolder
	 * @param {number} iPage
	 * @param {string} sUid
	 * @param {string} sSearch
	 * @param {string} sFilters
	 */
	CMessageListViewModel.prototype.changeRoutingForMessageList = function (sFolder, iPage, sUid, sSearch, sFilters)
	{
		App.Routing.setHash(App.Links.mailbox(sFolder, iPage, sUid, sSearch, sFilters));
	};
	
	/**
	 * @param {CMessageModel} oMessage
	 */
	CMessageListViewModel.prototype.onEnterPress = function (oMessage)
	{
		oMessage.openThread();
	};
	
	/**
	 * @param {CMessageModel} oMessage
	 */
	CMessageListViewModel.prototype.onMessageDblClick = function (oMessage)
	{
		var
			oFolder = this.folderList().getFolderByFullName(oMessage.folder())
		;
	
		if (oFolder.type() === Enums.FolderTypes.Drafts)
		{
			App.Routing.setHash(App.Links.composeFromMessage('drafts', oMessage.folder(), oMessage.uid()));
		}
		else
		{
			Utils.WindowOpener.openMessage(oMessage);
		}
	};
	
	CMessageListViewModel.prototype.onFolderListSubscribe = function ()
	{
		this.setCurrentFolder();
		this.requestMessageList();
	};
	
	/**
	 * @param {Array} aParams
	 */
	CMessageListViewModel.prototype.onRoute = function (aParams)
	{
		var oParams = App.Links.parseMailbox(aParams);
	
		this.pageSwitcherLocked(true);
		if (this.folderFullName() !== oParams.Folder || this.search() !== oParams.Search || this.filters() !== oParams.Filters)
		{
			this.oPageSwitcher.clear();
		}
		else
		{
			this.oPageSwitcher.setPage(oParams.Page, AppData.User.MailsPerPage);
		}
		this.pageSwitcherLocked(false);
		
		if (oParams.Page !== this.oPageSwitcher.currentPage())
		{
			App.Routing.replaceHash(App.Links.mailbox(oParams.Folder, this.oPageSwitcher.currentPage(), oParams.Uid, oParams.Search, oParams.Filters));
		}
	
		this.folderFullName(oParams.Folder);
		this.filters(oParams.Filters);
		this.search(oParams.Search);
		this.searchInput(this.search());
	//	this.searchSpan(this.search());
		this.searchSpan.notifySubscribers();
	
		this.setCurrentFolder();
		this.requestMessageList();
	};
	
	CMessageListViewModel.prototype.setCurrentFolder = function ()
	{
		this.folderList().setCurrentFolder(this.folderFullName(), this.filters());
	};
	
	CMessageListViewModel.prototype.requestMessageList = function ()
	{
		var
			sFullName = this.folderList().currentFolderFullName(),
			iPage = this.oPageSwitcher.currentPage()
		;
		
		if (sFullName.length > 0)
		{
			App.MailCache.changeCurrentMessageList(sFullName, iPage, this.search(), this.filters());
		}
	};
	
	CMessageListViewModel.prototype.calculateSearchStringFromAdvancedForm  = function ()
	{
		var
			sFrom = this.searchInputFrom(),
			sTo = this.searchInputTo(),
			sSubject = this.searchInputSubject(),
			sText = this.searchInputText(),
			aOutput = [],
			fEsc = function (sText) {
	
				sText = $.trim(sText).replace(/"/g, '\\"');
				
				if (-1 < sText.indexOf(' ') || -1 < sText.indexOf('"'))
				{
					sText = '"' + sText + '"';
				}
				
				return sText;
			}
		;
	
		if (sFrom !== '')
		{
			aOutput.push('from:' + fEsc(sFrom));
		}
	
		if (sTo !== '')
		{
			aOutput.push('to:' + fEsc(sTo));
		}
	
		if (sSubject !== '')
		{
			aOutput.push('subject:' + fEsc(sSubject));
		}
		
		if (sText !== '')
		{
			aOutput.push('text:' + fEsc(sText));
		}
	
		return aOutput.join(' ');
	};
	
	CMessageListViewModel.prototype.onSearchClick = function ()
	{
		var
			sFolder = this.folderList().currentFolderFullName(),
			sUid = this.currentMessage() ? this.currentMessage().uid() : '',
			iPage = 1,
			sSearch = this.searchInput()
		;
	
		if (this.bAdvancedSearch())
		{
			sSearch = this.calculateSearchStringFromAdvancedForm();
			this.searchInput(sSearch);
	
			this.bAdvancedSearch(false);
		}
	
		this.changeRoutingForMessageList(sFolder, iPage, sUid, sSearch, this.filters());
	
	//	this.highlightTrigger.notifySubscribers();
	};
	
	CMessageListViewModel.prototype.onRetryClick = function ()
	{
		this.requestMessageList();
	};
	
	CMessageListViewModel.prototype.onClearSearchClick = function ()
	{
		var
			sFolder = this.folderList().currentFolderFullName(),
			sUid = this.currentMessage() ? this.currentMessage().uid() : '',
			sSearch = '',
			iPage = 1
		;
		
		this.changeRoutingForMessageList(sFolder, iPage, sUid, sSearch, this.filters());
	};
	
	CMessageListViewModel.prototype.onStopSearchClick = function ()
	{
		this.onClearSearchClick();
	};
	
	/**
	 * @param {Object} oMessage
	 */
	CMessageListViewModel.prototype.routeForMessage = function (oMessage)
	{
		if (oMessage !== null)
		{
			var
				sFolder = this.folderList().currentFolderFullName(),
				iPage = this.oPageSwitcher.currentPage(),
				sUid = oMessage.uid(),
				sSearch = this.search()
			;
			
			if (sUid !== '')
			{
				this.changeRoutingForMessageList(sFolder, iPage, sUid, sSearch, this.filters());
			}
		}
	};
	
	/**
	 * @param {Object} $viewModel
	 */
	CMessageListViewModel.prototype.onApplyBindings = function ($viewModel)
	{
		var
			self = this,
			fStopPopagation = _.bind(function (oEvent) {
				if (oEvent && oEvent.stopPropagation)
				{
					oEvent.stopPropagation();
				}
			}, this)
		;
	
		$('.message_list', $viewModel)
	//		.on('click', '.message_sub_list .item', function ()
	//		{
	//			var oMessage = ko.dataFor(this);
	//			oMessage.openThread();
	//		})
			.on('click', '.message_sub_list .item .flag', function (oEvent)
			{
				self.onFlagClick(ko.dataFor(this));
				if (oEvent && oEvent.stopPropagation)
				{
					oEvent.stopPropagation();
				}
			})
			.on('dblclick', '.message_sub_list .item .flag', fStopPopagation)
			.on('click', '.message_sub_list .item .thread', fStopPopagation)
			.on('dblclick', '.message_sub_list .item .thread', fStopPopagation)
		;
	
		this.selector.initOnApplyBindings(
			'.message_sub_list .item',
			'.message_sub_list .selected.item',
			'.message_sub_list .item .custom_checkbox',
			$('.message_list', $viewModel),
			$('.message_list .scroll-inner', $viewModel)
		);
			
	};
	
	/**
	 * Puts / removes the message flag by clicking on it.
	 *
	 * @param {Object} oMessage
	 */
	CMessageListViewModel.prototype.onFlagClick = function (oMessage)
	{
		App.MailCache.executeGroupOperation('MessageSetFlagged', [oMessage.uid()], 'flagged', !oMessage.flagged());
	};
	
	/**
	 * Marks the selected messages read.
	 */
	CMessageListViewModel.prototype.executeMarkAsRead = function ()
	{
		App.MailCache.executeGroupOperation('MessageSetSeen', this.collectionCheckedUids(), 'seen', true);
	};
	
	/**
	 * Marks the selected messages unread.
	 */
	CMessageListViewModel.prototype.executeMarkAsUnread = function ()
	{
		App.MailCache.executeGroupOperation('MessageSetSeen', this.collectionCheckedUids(), 'seen', false);
	};
	
	/**
	 * Sets flag for messages.
	 */
	CMessageListViewModel.prototype.executeFlag = function ()
	{
		App.MailCache.executeGroupOperation('MessageSetFlagged', this.collectionCheckedUids(), 'flagged', true);
	};
	
	/**
	 * Removes flag for messages.
	 */
	CMessageListViewModel.prototype.executeUnflag = function ()
	{
		App.MailCache.executeGroupOperation('MessageSetFlagged', this.collectionCheckedUids(), 'flagged', false);
	};
	
	/**
	 * Marks Read all messages in a folder.
	 */
	CMessageListViewModel.prototype.executeMarkAllRead = function ()
	{
		App.MailCache.executeGroupOperation('MessageSetAllSeen', [], 'seen', true);
	};
	
	/**
	 * Moves the selected messages in the current folder in the specified.
	 * 
	 * @param {string} sToFolder
	 */
	CMessageListViewModel.prototype.executeMoveToFolder = function (sToFolder)
	{
		App.MailCache.moveMessagesToFolder(sToFolder, this.collectionCheckedUids());
	};
	
	/**
	 * Calls for the selected messages delete operation. Called from the keyboard.
	 * 
	 * @param {Array} aMessages
	 */
	CMessageListViewModel.prototype.onDeletePress = function (aMessages)
	{
		var aUids = _.map(aMessages, function (oMessage)
		{
			return oMessage.uid();
		});
	
		if (aUids.length > 0)
		{
			this.deleteMessages(aUids);
		}
	};
	
	/**
	 * Calls for the selected messages delete operation. Called by the mouse click on the delete button.
	 */
	CMessageListViewModel.prototype.executeDelete = function ()
	{
		this.deleteMessages(this.collectionCheckedUids());
	};
	
	/**
	 * Moves the specified messages in the current folder to the Trash or delete permanently 
	 * if the current folder is Trash or Spam.
	 * 
	 * @param {Array} aUids
	 */
	CMessageListViewModel.prototype.deleteMessages = function (aUids)
	{
		var
			sCurrFolder = this.folderList().currentFolderFullName(),
			oTrash = this.folderList().trashFolder(),
			bInTrash =(oTrash && sCurrFolder === oTrash.fullName()),
			oSpam = this.folderList().spamFolder(),
			bInSpam = (oSpam && sCurrFolder === oSpam.fullName()),
			sConfirm = Utils.i18n('MAILBOX/CONFIRM_MESSAGES_DELETE'),
			fDeleteMessages = function (bResult) {
				if (bResult)
				{
					App.MailCache.deleteMessages(aUids);
				}
			}
		;
	
		if (bInSpam)
		{
			App.MailCache.deleteMessages(aUids);
		}
		else if (bInTrash)
		{
			App.Screens.showPopup(ConfirmPopup, [sConfirm, fDeleteMessages]);
		}
		else if (oTrash)
		{
			App.MailCache.moveMessagesToFolder(oTrash.fullName(), this.collectionCheckedUids());
		}
	};
	
	/**
	 * Moves the selected messages from the current folder to the folder Spam.
	 */
	CMessageListViewModel.prototype.executeSpam = function ()
	{
		var sSpamFullName = this.folderList().spamFolderFullName();
	
		if (this.folderList().currentFolderFullName() !== sSpamFullName)
		{
			App.MailCache.moveMessagesToFolder(sSpamFullName, this.collectionCheckedUids());
		}
	};
	
	/**
	 * Moves the selected messages from the Spam folder to folder Inbox.
	 */
	CMessageListViewModel.prototype.executeNotSpam = function ()
	{
		var oInbox = this.folderList().inboxFolder();
	
		if (oInbox && this.folderList().currentFolderFullName() !== oInbox.fullName())
		{
			App.MailCache.moveMessagesToFolder(oInbox.fullName(), this.collectionCheckedUids());
		}
	};
	
	CMessageListViewModel.prototype.fillAdvancedSearch = function (bValue)
	{
		if (bValue)
		{
			this.searchInputFrom('');
			this.searchInputTo('');
			this.searchInputSubject('');
			this.searchInputText('');
			this.bAdvancedSearch(true);
		}
	};
	
	
	/**
	 * @constructor
	 */
	function CMessagePaneViewModel()
	{
		this.singleMode = ko.observable(AppData.SingleMode);
		this.isLoading = ko.observable(false);
	
		this.messages = App.MailCache.messages;
		this.messages.subscribe(this.onMessagesSubscribe, this);
		this.currentMessage = App.MailCache.currentMessage;
		this.currentMessage.subscribe(this.onCurrentMessageSubscribe, this);
		AppData.User.defaultTimeFormat.subscribe(this.onCurrentMessageSubscribe, this);
		
		this.isCurrentMessage = ko.computed(function () {
			return !!this.currentMessage();
		}, this);
		
		this.isCurrentMessageLoaded = ko.computed(function () {
			return this.isCurrentMessage() && !this.isLoading();
		}, this);
		
		this.visibleNoMessageSelectedText = ko.computed(function () {
			return this.messages().length > 0 && !this.isCurrentMessage();
		}, this);
	
		this.isEnableReply = this.isCurrentMessageLoaded;
		this.isEnableReplyAll = this.isCurrentMessageLoaded;
		this.isEnableForward = this.isCurrentMessageLoaded;
		this.isEnablePrint = this.isCurrentMessageLoaded;
		this.isEnableSave = this.isCurrentMessage;
	
		this.prevMessageCommand = Utils.createCommand(this, this.executePrevMessage);
		this.nextMessageCommand = Utils.createCommand(this, this.executeNextMessage);
		this.replyCommand = Utils.createCommand(this, this.executeReply, this.isEnableReply);
		this.replyAllCommand = Utils.createCommand(this, this.executeReplyAll, this.isEnableReplyAll);
		this.forwardCommand = Utils.createCommand(this, this.executeForward, this.isEnableForward);
		this.printCommand = Utils.createCommand(this, this.executePrint, this.isEnablePrint);
		this.saveCommand = Utils.createCommand(this, this.executeSave, this.isEnableSave);
	
		this.ical = ko.observable(null);
		this.vcard = ko.observable(null);
	
		this.visiblePicturesControl = ko.observable(false);
		this.visibleShowPicturesLink = ko.observable(false);
		this.visibleAppointmentInfo = ko.computed(function () {
			return this.ical() !== null;
		}, this);
		this.visibleVcardInfo = ko.computed(function () {
			return this.vcard() !== null;
		}, this);
		
		this.sensitivityText = ko.computed(function () {
			var sText = '';
			
			if (this.currentMessage())
			{
				switch (this.currentMessage().sensitivity())
				{
					case Enums.Sensivity.Confidential:
						sText = Utils.i18n('MESSAGE/SENSIVITY_CONFIDENTIAL');
						break;
					case Enums.Sensivity.Personal:
						sText = Utils.i18n('MESSAGE/SENSIVITY_PERSONAL');
						break;
					case Enums.Sensivity.Private:
						sText = Utils.i18n('MESSAGE/SENSIVITY_PRIVATE');
						break;
				}
			}
			
			return sText;
		}, this);
	
	
		this.visibleConfirmationControl = ko.computed(function () {
			return (this.currentMessage() && this.currentMessage().readingConfirmation() !== '');
		}, this);
	
		this.fakeHeader = ko.computed(function () {
			return !(this.visiblePicturesControl() || this.visibleConfirmationControl() || this.sensitivityText() !== '');
		}, this);
	
		this.isCurrentNotDraftOrSent = ko.computed(function () {
			var oCurrFolder = App.MailCache.folderList().currentFolder();
			return (oCurrFolder && oCurrFolder.fullName().length > 0 &&
				oCurrFolder.type() !== Enums.FolderTypes.Drafts &&
				oCurrFolder.type() !== Enums.FolderTypes.Sent);
		}, this);
	
		this.isCurrentNotDraftFolder = ko.computed(function () {
			var oCurrFolder = App.MailCache.folderList().currentFolder();
			return (oCurrFolder && oCurrFolder.fullName().length > 0 &&
				oCurrFolder.type() !== Enums.FolderTypes.Drafts);
		}, this);
		
		this.isVisibleReplyTool = this.isCurrentNotDraftOrSent;
		this.isVisibleForwardTool = this.isCurrentNotDraftFolder;
	
		this.uid = ko.observable('');
		this.subject = ko.observable('');
		this.from = ko.observable('');
		this.fullFrom = ko.observable('');
		this.to = ko.observable('');
		this.cc = ko.observable('');
		this.bcc = ko.observable('');
		this.allRecipients = ko.observable('');
		this.fullDate = ko.observable('');
		this.midDate = ko.observable('');
		
		this.fromEmail = ko.observable('');
		this.fromName = ko.observable('');
		this.fromExistsInContacts = ko.observable(false);
		this.fromContactInfoReceived = ko.observable(false);
		this.fromContact = ko.observable(new CContactModel());
		this.hasFromContact = ko.computed(function () {
			return this.fromContactInfoReceived() && this.fromExistsInContacts();
		}, this);
		this.shortFromToDisplay = ko.computed(function () {
			var sFrom = this.from();
			
			if (this.fromName() === '' && this.hasFromContact() && this.fromContact().displayName() !== '')
			{
				sFrom = this.fromContact().displayName();
			}
			
			return sFrom;
		}, this);
		
		this.visibleAddToContacts = ko.computed(function () {
			return this.isCurrentNotDraftOrSent() && this.fromContactInfoReceived() && !this.fromExistsInContacts();
		}, this);
	
		this.textBody = ko.observable('');
		this.textBodyForNewWindow = ko.observable('');
		this.domTextBody = ko.observable(null);
		this.rtlMessage = ko.observable(false);
		
		this.contentHasFocus = ko.observable(false);
	
		this.attachments = ko.observableArray([]);
		this.usesAttachmentString = true;
		this.attachmentsInString = ko.computed(function () {
			return _.map(this.attachments(), function (oAttachment) {
				return oAttachment.fileName();
			}, this).join(', ');
		}, this);
		this.notInlineAttachments = ko.computed(function () {
			return _.filter(this.attachments(), function (oAttach) {
				return !oAttach.linked();
			});
		}, this);
	
		this.detailsVisible = ko.observable(false);
	
		this.hasNotInlineAttachments = ko.computed(function () {
			return this.notInlineAttachments().length > 0;
		}, this);
		
		this.scrollToAttachment = ko.observable('.attachments');
		
		this.hasBodyText = ko.computed(function () {
			return this.textBody().length > 0;
		}, this);
	
		this.visibleAddMenu = ko.observable(false);
		
		this.replyText = ko.observable('');
		this.replyHtmlText = ko.computed(function () {
			return App.MessageSender.getHtmlFromText(this.replyText());		
		}, this);
		this.replyTextFocus = ko.observable(false);
		this.replyPaneVisible = ko.computed(function () {
			return this.currentMessage() && this.currentMessage().completelyFilled();
		}, this);
		this.replySendingStarted = ko.observable(false);
		this.replySavingStarted = ko.observable(false);
		this.replyDraftUid = ko.observable('');
		this.replyLoadingText = ko.computed(function () {
			if (this.replySendingStarted())
			{
				return Utils.i18n('COMPOSE/INFO_SENDING');
			}
			else if (this.replySavingStarted())
			{
				return Utils.i18n('COMPOSE/INFO_SAVING');
			}
			return '';
		}, this);
		
		this.domMessageHeader = ko.observable(null);
		this.domQuickReply = ko.observable(null);
		
		this.domMessageForPrint = ko.observable(null);
		
		// to have time to take action "Open full reply form" before the animation starts
		this.replyTextFocusThrottled = ko.observable(false).extend({'throttle': 50});
		
		this.replyTextFocus.subscribe(function () {
			this.replyTextFocusThrottled(this.replyTextFocus());
		}, this);
		
		this.isQuickReplyActive = ko.computed(function () {
			return this.replyText().length > 0 || this.replyTextFocusThrottled();
		}, this);
		
		$(document).on('keyup', $.proxy(function(ev) {
			if (App.Screens.currentScreen() === Enums.Screens.Mailbox && ev && ev.keyCode === Enums.Key.q && !Utils.inFocus()) {
				this.replyTextFocus(true);
			}
		}, this));
	
		this.viewAllMailsWithContactBinded = _.bind(this.viewAllMailsWithContact, this);
	
		this.jqPanelHelper = null;
	}
	
	CMessagePaneViewModel.prototype.resizeDblClick = function (oData, oEvent)
	{
		oEvent.preventDefault();
		if (oEvent.stopPropagation)
		{
			oEvent.stopPropagation();
		}
		else
		{
			oEvent.cancelBubble = true;
		}
		
		Utils.removeSelection();
		if (!this.jqPanelHelper)
		{
			this.jqPanelHelper = $('.MailLayout .panel_helper');
		}
		this.jqPanelHelper.trigger('resize', [295, 'min']);
	};
	
	CMessagePaneViewModel.prototype.notifySender = function ()
	{
		if (this.currentMessage() && this.currentMessage().readingConfirmation() !== '')
		{
			App.Ajax.send({
				'Action': 'MessageSendConfirmation',
				'Confirmation': this.currentMessage().readingConfirmation(),
				'Subject': Utils.i18n('MESSAGE/RETURN_RECEIPT_MAIL_SUBJECT'),
				'Text': Utils.i18n('MESSAGE/RETURN_RECEIPT_MAIL_TEXT', {
					'EMAIL': this.fullFrom(),
					'SUBJECT': this.subject()
				})
			});
			this.currentMessage().readingConfirmation('');
		}
	};
	
	CMessagePaneViewModel.prototype.viewAllMailsWithContact = function ()
	{
		if (AppData.SingleMode && window.opener && window.opener.App)
		{
			window.opener.App.MailCache.searchMessagesInCurrentFolder('email:' + this.fromEmail());
			window.opener.focus();
			window.close();
		}
		else
		{
			App.MailCache.searchMessagesInCurrentFolder('email:' + this.fromEmail());
		}
	};
	
	CMessagePaneViewModel.prototype.onMessagesSubscribe = function ()
	{
		if (!this.currentMessage() && this.uid().length > 0)
		{
			App.MailCache.setCurrentMessage(this.uid());
		}
	};
	
	/**
	 * @param {Object} oContact
	 */
	CMessagePaneViewModel.prototype.onFromContactResponse = function (oContact)
	{
		if (oContact)
		{
			this.fromContact(oContact);
			this.fromExistsInContacts(true);
		}
		else
		{
			this.fromContact(new CContactModel());
			this.fromExistsInContacts(false);
		}
		this.fromContactInfoReceived(true);
	};
	
	CMessagePaneViewModel.prototype.onCurrentMessageSubscribe = function ()
	{
		var
			oMessage = this.currentMessage(),
			sFullTo = '',
			sFullCc = '',
			sFullBcc = '',
			aRecipients = []
		;
	
		this.replyText('');
		this.replyDraftUid('');
	
		if (oMessage && this.uid() === oMessage.uid())
		{
			this.subject(oMessage.subject());
			this.from(oMessage.oFrom.getDisplay());
			this.fromEmail(oMessage.oFrom.getFirstEmail());
			this.fromName(oMessage.oFrom.getFirstName());
			this.fromContactInfoReceived(false);
	
			if (oMessage.completelyFilled() && this.fromEmail() && this.fromEmail() !== '')
			{
				App.ContactsCache.getContactByEmail(this.fromEmail(), this.onFromContactResponse, this);
			}
	
			this.fullFrom(oMessage.oFrom.getFull());
			this.to(oMessage.oTo.getFull());
			this.cc(oMessage.oCc.getFull());
			this.bcc(oMessage.oBcc.getFull());
	
			sFullTo = oMessage.oTo.getDisplay();
			sFullCc = oMessage.oCc.getDisplay();
			sFullBcc = oMessage.oBcc.getDisplay();
			if (sFullTo.length > 0)
			{
				aRecipients.push(sFullTo);
			}
			if (sFullCc.length > 0)
			{
				aRecipients.push(sFullCc);
			}
			if (sFullBcc.length > 0)
			{
				aRecipients.push(sFullBcc);
			}
			this.allRecipients(aRecipients.join(', '));
	
			this.midDate(oMessage.oDateModel.getMidDate());
			this.fullDate(oMessage.oDateModel.getFullDate());
	
			this.isLoading(oMessage.uid() !== '' && !oMessage.completelyFilled());
	
			this.setMessageBody(oMessage);
			this.rtlMessage(oMessage.rtl());
	
			this.attachments(oMessage.attachments());
	
			this.visiblePicturesControl(oMessage.hasExternals() && !oMessage.isExternalsAlwaysShown());
			this.visibleShowPicturesLink(!oMessage.isExternalsShown());
	
			// animation of buttons turns on with delay
			// so it does not trigger when placing initial values
			if (this.ical() !== null)
			{
				this.ical().animation(false);
			}
			this.ical(oMessage.ical());
			if (this.ical() !== null)
			{
				_.defer(_.bind(function () {
					this.ical().animation(true);
				}, this));
			}
			this.vcard(oMessage.vcard());
			
			if (!oMessage.completelyFilled())
			{
				if (this.singleMode())
				{
					oMessage.completelyFilledSingleModeSubscription = oMessage.completelyFilled.subscribe(this.onCurrentMessageSubscribe, this);
				}
				else
				{
					oMessage.completelyFilledSubscription = oMessage.completelyFilled.subscribe(this.onCurrentMessageSubscribe, this);
				}
			}
			else if (oMessage.completelyFilledSubscription)
			{
				oMessage.completelyFilledSubscription.dispose();
				oMessage.completelyFilledSubscription = undefined;
			}
			else if (oMessage.completelyFilledSingleModeSubscription)
			{
				oMessage.completelyFilledSingleModeSubscription.dispose();
				oMessage.completelyFilledSingleModeSubscription = undefined;
			}
		}
		else
		{
			this.isLoading(false);
			$(this.domTextBody()).empty();
			this.rtlMessage(false);
			
			// cannot use removeAll, because the attachments of messages are passed by reference 
			// and the call to removeAll removes attachments from message in the cache too.
			this.attachments([]);
			this.visiblePicturesControl(false);
			this.visibleShowPicturesLink(false);
			this.ical(null);
			this.vcard(null);
		}
	};
	
	/**
	 * @param {Object} oMessage
	 */
	CMessagePaneViewModel.prototype.setMessageBody = function (oMessage)
	{
		if (oMessage)
		{
			var
				sText = oMessage.text(),
				sLen = sText.length,
				sMaxLen = 5000000,
				$body = $(this.domTextBody())
			;
			
			this.textBody(sText);
			
			$body.empty();
			_.defer(_.bind(function () {
				if (oMessage.isPlain() || sLen > sMaxLen)
				{
					$body.html(sText);
				}
				else
				{
					$body.append(oMessage.getDomText());
					this.doHidingBlockquotes();
				}
			}, this));
		}
	};
	
	CMessagePaneViewModel.prototype.doHidingBlockquotes = function ()
	{
		var
			iMinHeightForHide = 120,
			iHiddenHeight = 80
		;
		
		$($('blockquote', $(this.domTextBody())).get().reverse()).each(function () {
			var
				$blockquote = $(this),
				$parentBlockquotes = $blockquote.parents('blockquote'),
				$switchButton = $('<span class="blockquote_toggle"></span>').html(Utils.i18n('MESSAGE/SHOW_QUOTED_TEXT')),
				bHidden = true
			;
			if ($parentBlockquotes.length === 0)
			{
				if ($blockquote.height() > iMinHeightForHide)
				{
					$blockquote
						.addClass('blockquote_before_toggle')
						.after($switchButton)
						.wrapInner('<div class="blockquote_content"></div>')
					;
					$switchButton.bind('click', function () {
						if (bHidden)
						{
							$blockquote.height('auto');
							$switchButton.html(Utils.i18n('MESSAGE/HIDE_QUOTED_TEXT'));
							bHidden = false;
						}
						else
						{
							$blockquote.height(iHiddenHeight);
							$switchButton.html(Utils.i18n('MESSAGE/SHOW_QUOTED_TEXT'));
							bHidden = true;
						}
						
						$blockquote.toggleClass('collapsed', bHidden);
					});
					
					$blockquote.height(iHiddenHeight).toggleClass('collapsed', bHidden);
				}
			}
		});
	};
	
	/**
	 * @param {Array} aParams
	 */
	CMessagePaneViewModel.prototype.onRoute = function (aParams)
	{
		var oParams = App.Links.parseMailbox(aParams);
		
		this.uid(oParams.Uid);
		App.MailCache.setCurrentMessage(this.uid());
		
		this.contentHasFocus(true);
	};
	
	CMessagePaneViewModel.prototype.showPictures = function ()
	{
		App.MailCache.showExternalPictures(false);
		this.visibleShowPicturesLink(false);
		this.setMessageBody(this.currentMessage());
	};
	
	CMessagePaneViewModel.prototype.alwaysShowPictures = function ()
	{
		var
			sEmail = this.currentMessage() ? this.currentMessage().oFrom.getFirstEmail() : ''
		;
	
		if (sEmail.length > 0)
		{
			App.Ajax.send({
				'Action': 'EmailSafety',
				'Email': sEmail
			});
		}
	
		App.MailCache.showExternalPictures(true);
		this.visiblePicturesControl(false);
		this.setMessageBody(this.currentMessage());
	};
	
	CMessagePaneViewModel.prototype.showDetails = function ()
	{
		this.detailsVisible(true);
	};
	
	CMessagePaneViewModel.prototype.hideDetails = function ()
	{
		this.detailsVisible(false);
	};
	
	CMessagePaneViewModel.prototype.openInNewWindow = function ()
	{
		var
			oCurrFolder = App.MailCache.folderList().currentFolder(),
			bDraftFolder = (oCurrFolder.type() === Enums.FolderTypes.Drafts)
		;
		
		Utils.WindowOpener.openMessage(this.currentMessage(), bDraftFolder);
	};
	
	CMessagePaneViewModel.prototype.addToContacts = function ()
	{
		App.ContactsCache.addToContacts(this.fromName(), this.fromEmail(), this.onAddToContactsResponse, this);
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CMessagePaneViewModel.prototype.onAddToContactsResponse = function (oResponse, oRequest)
	{
		if (oResponse.Result && oRequest.HomeEmail !== '' && oRequest.HomeEmail === this.fromEmail())
		{
			App.Api.showReport(Utils.i18n('CONTACTS/REPORT_CONTACT_SUCCESSFULLY_ADDED'));
			App.ContactsCache.clearInfoAboutEmail(this.fromEmail());
			App.ContactsCache.getContactByEmail(this.fromEmail(), this.onFromContactResponse, this);
		}
	};
	
	CMessagePaneViewModel.prototype.executePrevMessage = function ()
	{
	};
	
	CMessagePaneViewModel.prototype.executeNextMessage = function ()
	{
	};
	
	/**
	 * @param {string} sReplyType
	 */
	CMessagePaneViewModel.prototype.executeReplyOrForward = function (sReplyType)
	{
		if (this.currentMessage())
		{
			App.MessageSender.setReplyData(this.replyHtmlText(), this.replyDraftUid());
			this.replyText('');
			this.replyDraftUid('');
			App.Routing.setHash(App.Links.composeFromMessage(sReplyType, this.currentMessage().folder(), 
				this.currentMessage().uid()));
		}
	};
	
	CMessagePaneViewModel.prototype.executeReply = function ()
	{
		this.executeReplyOrForward(Enums.ReplyType.Reply);
	};
	
	CMessagePaneViewModel.prototype.executeReplyAll = function ()
	{
		this.executeReplyOrForward(Enums.ReplyType.ReplyAll);
	};
	
	CMessagePaneViewModel.prototype.executeForward = function ()
	{
		this.executeReplyOrForward(Enums.ReplyType.Forward);
	};
	
	CMessagePaneViewModel.prototype.executePrint = function ()
	{
		var
			oWin = Utils.WindowOpener.open('', this.subject() + '-print'),
			oDomText = this.currentMessage().getDomText(Utils.getAppPath()),
			sHtml = ''
		;
		
		this.textBodyForNewWindow(oDomText.html());
		sHtml = $(this.domMessageForPrint()).html();
		
		$(oWin.document.body).html(sHtml);
		oWin.print();
	};
	
	CMessagePaneViewModel.prototype.executeSave = function ()
	{
		if (this.currentMessage())
		{
			App.downloadByUrl(this.currentMessage().download());
		}
	};
	
	CMessagePaneViewModel.prototype.changeAddMenuVisibility = function ()
	{
		var bVisibility = !this.visibleAddMenu();
		this.visibleAddMenu(bVisibility);
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CMessagePaneViewModel.prototype.onMessageSendResponse = function (oResponse, oRequest)
	{
		var oResData = App.MessageSender.onMessageSendResponse(oResponse, oRequest);
		switch (oResData.Action)
		{
			case 'MessageSend':
				this.replySendingStarted(false);
				if (oResData.Result)
				{
					this.replyText('');
				}
				break;
			case 'MessageSave':
				this.replySavingStarted(false);
				if (oResData.Result)
				{
					this.replyDraftUid(oResData.NewUid);
				}
				break;
		}
	};
	
	CMessagePaneViewModel.prototype.sendReplyMessage = function ()
	{
		if (this.replyText() !== '')
		{
			this.replySendingStarted(true);
			App.MessageSender.sendReplyMessage('MessageSend', this.replyHtmlText(), this.replyDraftUid(), 
				this.onMessageSendResponse, this);
	
			this.replyTextFocus(false);
		}
	};
	
	CMessagePaneViewModel.prototype.saveReplyMessage = function ()
	{
		if (this.replyText() !== '')
		{
			this.replySavingStarted(true);
			App.MessageSender.sendReplyMessage('MessageSave', this.replyHtmlText(), this.replyDraftUid(), 
				this.onMessageSendResponse, this);
		}
	};
	
	/**
	 * @constructor
	 */
	function CMailViewModel()
	{
		this.folderList = App.MailCache.folderList;
		this.domFolderList = ko.observable(null);
	
		this.oFolderList = new CFolderListViewModel();
		this.oMessageList = new CMessageListViewModel();
		this.oMessagePane = new CMessagePaneViewModel();
	
		this.isEnableGroupOperations = this.oMessageList.isEnableGroupOperations;
		
		this.composeLink = ko.observable(App.Routing.buildHashFromArray(App.Links.compose()));
	
		this.checkMailCommand = Utils.createCommand(App.MailCache, App.MailCache.executeCheckMail);
		this.checkMailStarted = App.MailCache.checkMailStarted;
		this.markAsReadCommand = Utils.createCommand(this.oMessageList, this.oMessageList.executeMarkAsRead, this.isEnableGroupOperations);
		this.markAsUnreadCommand = Utils.createCommand(this.oMessageList, this.oMessageList.executeMarkAsUnread, this.isEnableGroupOperations);
		this.markAllReadCommand = Utils.createCommand(this.oMessageList, this.oMessageList.executeMarkAllRead);
		this.moveToFolderCommand = Utils.createCommand(this, Utils.emptyFunction, this.isEnableGroupOperations);
		this.deleteCommand = Utils.createCommand(this.oMessageList, this.oMessageList.executeDelete, this.isEnableGroupOperations);
		this.emptyTrashCommand = Utils.createCommand(App.MailCache, App.MailCache.executeEmptyTrash, this.oMessageList.isNotEmptyList);
		this.emptySpamCommand = Utils.createCommand(App.MailCache, App.MailCache.executeEmptySpam, this.oMessageList.isNotEmptyList);
		this.spamCommand = Utils.createCommand(this.oMessageList, this.oMessageList.executeSpam, this.isEnableGroupOperations);
		this.notSpamCommand = Utils.createCommand(this.oMessageList, this.oMessageList.executeNotSpam, this.isEnableGroupOperations);
	
		this.bVisibleComposeMessage = AppData.User.AllowCompose;
		
		this.isVisibleReplyTool = ko.computed(function () {
			return (this.folderList().currentFolder() &&
				this.folderList().currentFolderFullName().length > 0 &&
				this.folderList().currentFolderType() !== Enums.FolderTypes.Drafts &&
				this.folderList().currentFolderType() !== Enums.FolderTypes.Sent);
		}, this);
	
		this.isVisibleForwardTool = ko.computed(function () {
			return (this.folderList().currentFolder() &&
				this.folderList().currentFolderFullName().length > 0 &&
				this.folderList().currentFolderType() !== Enums.FolderTypes.Drafts);
		}, this);
	
		this.isSpamFolder = ko.computed(function () {
			return this.folderList().currentFolderType() === Enums.FolderTypes.Spam;
		}, this);
		
		this.allowedSpamAction = ko.computed(function () {
			var oAccount = AppData.Accounts.getCurrent();
			return oAccount.extensionExists('AllowSpamFolderExtension') && !this.isSpamFolder();
		}, this);
		
		this.allowedNotSpamAction = ko.computed(function () {
			var oAccount = AppData.Accounts.getCurrent();
			return oAccount.extensionExists('AllowSpamFolderExtension') && this.isSpamFolder();
		}, this);
		
		this.isTrashFolder = ko.computed(function () {
			return this.folderList().currentFolderType() === Enums.FolderTypes.Trash;
		}, this);
	
		this.jqPanelHelper = null;
	}
	
	/**
	 * @param {Object} oData
	 * @param {Object} oEvent
	 */
	CMailViewModel.prototype.resizeDblClick = function (oData, oEvent)
	{
		oEvent.preventDefault();
		if (oEvent.stopPropagation)
		{
			oEvent.stopPropagation();
		}
		else
		{
			oEvent.cancelBubble = true;
		}
	
		Utils.removeSelection();
		if (!this.jqPanelHelper)
		{
			this.jqPanelHelper = $('.MailLayout .panel_helper');
		}
		this.jqPanelHelper.trigger('resize', [600, 'max']);
	};
	
	/**
	 * @param {Array} aParams
	 */
	CMailViewModel.prototype.onRoute = function (aParams)
	{
		this.oMessageList.onRoute(aParams);
		this.oMessagePane.onRoute(aParams);
	};
	
	CMailViewModel.prototype.onShow = function ()
	{
		this.oMessageList.selector.useKeyboardKeys(true);
	};
	
	CMailViewModel.prototype.onHide = function ()
	{
		this.oMessageList.selector.useKeyboardKeys(false);
	};
	
	CMailViewModel.prototype.onApplyBindings = function ()
	{
		var self = this;
	
		this.oMessageList.onApplyBindings(this.$viewModel);
	
		$(this.domFolderList()).on('click', 'span.folder', function () {
			self.oMessageList.executeMoveToFolder($(this).data('folder'));
		});
	
		$(this.$viewModel).on('mousedown', 'a', function (oEvent) {
			if (oEvent && 3 !== oEvent['which'])
			{
				var sHref = $(this).attr('href');
				if (sHref && 'mailto:' === sHref.toString().toLowerCase().substr(0, 7))
				{
					App.Api.openComposeMessage(sHref.toString().substr(7));
					return false;
				}
			}
	
			return true;
		});
	
		var bFirstMessageFlag = false;
		$(document).on('keyup', function(ev) {
			var sKey = ev.keyCode,
				oList = self.oMessageList,
				oFirstMessage = oList.collection()[0],
				bListIsFocused = oList.isFocused(),
				bReplyTextFocus = self.oMessagePane.replyTextFocus()
			;
			
			if (ev && sKey === Enums.Key.s)
			{
				self.searchFocus();
			}
	
			else if (oFirstMessage)
			{
				var bFirstMessageSelected = oFirstMessage.selected();
				
				if (bListIsFocused && ev && sKey === Enums.Key.Down)
				{
					oList.isFocused(false);
					oList.selector.itemSelected(oFirstMessage);
					bFirstMessageFlag = true;
				}
				else if (!bListIsFocused && !bReplyTextFocus && bFirstMessageFlag && bFirstMessageSelected && ev && sKey === Enums.Key.Up)
				{
					oList.isFocused(true);
					oList.selector.itemSelected(false);
					bFirstMessageFlag = false;
				}
				else if (bFirstMessageSelected)
				{
					bFirstMessageFlag = true;
				}
				else if (!bFirstMessageSelected)
				{
					bFirstMessageFlag = false;
				}
			}
		});
	};
	
	/**
	 * @param {Array} aMessages
	 */
	CMailViewModel.prototype.getThreadUidsFromList = function (aMessages)
	{
		var aThreadUids = [];
		
		_.each(aMessages, function (oMessage) {
			if (oMessage.threadCount() > 0 && !oMessage.threadOpened())
			{
				aThreadUids = _.union(aThreadUids, oMessage.threadUids());
			}
		});
		
		return aThreadUids;
	};
	
	/**
	 * @param {Object} oMessage
	 */
	CMailViewModel.prototype.dragAndDropHelper = function (oMessage)
	{
		if (oMessage)
		{
			oMessage.checked(true);
		}
	
		var
			oSelected = this.oMessageList.selector.itemSelected(),
			oHelper = Utils.draggableMessages(),
			aCheckedOrSelected = this.oMessageList.selector.listCheckedOrSelected(),
			aThreadUids = this.getThreadUidsFromList(aCheckedOrSelected),
			aCheckedOrSelectedUids = _.map(aCheckedOrSelected, function (oItem) {
				return oItem.uid();
			}),
			aUids = _.union(aCheckedOrSelectedUids, aThreadUids),
			nCount = aUids.length
		;
		
		if (oSelected && !oSelected.checked())
		{
			oSelected.checked(true);
		}
	
		oHelper.data('p7-message-list-folder', this.folderList().currentFolderFullName());
		oHelper.data('p7-message-list-uids', aUids);
	
		$('.count-text', oHelper).text(Utils.i18n('MAILBOX/DRAG_TEXT_PLURAL', {
			'COUNT': nCount
		}, null, nCount));
	
		return oHelper;
	};
	
	/**
	 * @param {Object} oToFolder
	 * @param {Object} oEvent
	 * @param {Object} oUi
	 */
	CMailViewModel.prototype.messagesDrop = function (oToFolder, oEvent, oUi)
	{
		if (oToFolder)
		{
			var
				oHelper = oUi && oUi.helper ? oUi.helper : null,
				sFolder = oHelper ? oHelper.data('p7-message-list-folder') : '',
				aUids = oHelper ? oHelper.data('p7-message-list-uids') : null
			;
	
			if ('' !== sFolder && null !== aUids)
			{
				Utils.uiDropHelperAnim(oEvent, oUi);
				this.oMessageList.executeMoveToFolder(oToFolder.fullName());
			}
		}
	};
	
	CMailViewModel.prototype.searchFocus = function ()
	{
		if (this.oMessageList.selector.useKeyboardKeys() && !Utils.inFocus())
		{
			this.oMessageList.isFocused(true);
		}
	};
	
	/**
	 * @constructor
	 */
	function CComposeViewModel()
	{
		this.folderList = App.MailCache.folderList;
		this.folderList.subscribe(function () {
			this.getMessageOnRoute();
		}, this);
	
		this.singleMode = ko.observable(AppData.SingleMode);
		this.isDemo = ko.observable(AppData.User.IsDemo);
		
		this.sending = ko.observable(false);
		this.saving = ko.observable(false);
	
		this.oHtmlEditor = new CHtmlEditorViewModel(true);
	
		this.visibleBcc = ko.observable(false);
		this.visibleBcc.subscribe(function () {
			$html.toggleClass('screen-compose-bcc', this.visibleCc());
			this.computeHeight();
		}, this);
		this.visibleCc = ko.observable(false);
		this.visibleCc.subscribe(function () {
			$html.toggleClass('screen-compose-cc', this.visibleCc());
			this.computeHeight();
		}, this);
		this.visibleCounter = ko.observable(false);
	
		this.readingConfirmation = ko.observable(false);
		this.saveMailInSentItems = ko.observable(true);
		this.useSaveMailInSentItems = ko.observable(false);
	
		this.composeUploaderButton = ko.observable(null);
		this.composeUploaderDropPlace = ko.observable(null);
		this.composeUploaderBodyDragOver = ko.observable(false);
		this.composeUploaderDragOver = ko.observable(false);
		this.allowDragNDrop = ko.observable(false);
		this.uploaderBodyDragOver = ko.computed(function () {
			return this.allowDragNDrop() && this.composeUploaderBodyDragOver();
		}, this);
		this.uploaderDragOver = ko.computed(function () {
			return this.allowDragNDrop() && this.composeUploaderDragOver();
		}, this);
	
	//	this.composeUploaderBodyDragOver.subscribe(function (bV) {
	//		window.console.log(bV);
	//	});
	
		this.selectedImportance = ko.observable(Enums.Importance.Normal);
		this.selectedSensitivity = ko.observable(Enums.Sensivity.Nothing);
	
		this.senderList = ko.observableArray([]);
		this.visibleFrom = ko.computed(function () {
			return this.senderList().length > 1;
		}, this);
		this.selectedSender = ko.observable(0);
		this.selectedSender.subscribe(function () {
			this.changeSignature();
		}, this);
		this.senderAccountId = ko.observable(AppData.Accounts.currentId());
	
		this.toAddr = ko.observable('').extend({'reversible': true});
		this.ccAddr = ko.observable('').extend({'reversible': true});
		this.bccAddr = ko.observable('').extend({'reversible': true});
		this.subject = ko.observable('').extend({'reversible': true});
		this.counter = ko.observable(0);
		this.commitedTextBody = ko.observable('');
		this.textBody = ko.observable('');
		this.textBody.subscribe(function () {
			this.oHtmlEditor.setText(this.textBody());
			this.commitedTextBody(this.oHtmlEditor.getText());
		}, this);
	
		this.toAddrFocused = ko.observable(false);
		this.ccAddrFocused = ko.observable(false);
		this.bccAddrFocused = ko.observable(false);
		this.subjectFocused = ko.observable(false);
	
		this.draftUid = ko.observable('');
		this.draftInfo = ko.observableArray([]);
		this.routeType = ko.observable('');
		this.routeParams = ko.observableArray([]);
		this.inReplyTo = ko.observable('');
		this.references = ko.observable('');
	
		this.uploadAttachmentsTimer = -1;
		this.messageUploadAttachmentsStarted = ko.observable(false);
		this.messageUploadAttachmentsStarted.subscribe(function () {
			clearTimeout(this.uploadAttachmentsTimer);
			if (this.messageUploadAttachmentsStarted())
			{
				this.uploadAttachmentsTimer = setTimeout(function () {
					App.Api.showLoading(Utils.i18n('COMPOSE/INFO_ATTACHMENTS_LOADING'));
				}, 4000);
			}
			else
			{
				App.Api.hideLoading();
			}
		}, this);
		
		this.attachments = ko.observableArray([]);
		this.attachmentsChanged = ko.observable(false);
		this.attachments.subscribe(function () {
			this.computeHeight();
		}, this);
		this.notUploadedAttachments = ko.computed(function () {
			return _.filter(this.attachments(), function (oAttach) {
				return !oAttach.uploaded();
			});
		}, this);
	
		this.allAttachmentsUploaded = ko.computed(function () {
			return this.notUploadedAttachments().length === 0 && !this.messageUploadAttachmentsStarted();
		}, this);
	
		this.notInlineAttachments = ko.computed(function () {
			return _.filter(this.attachments(), function (oAttach) {
				return !oAttach.linked();
			});
		}, this);
		
		this.allowStartSending = ko.computed(function() {
			return !this.saving();
		}, this);
		this.allowStartSending.subscribe(function () {
			if (this.allowStartSending() && this.requiresPostponedSending())
			{
				App.MessageSender.sendPostponedMail(this.draftUid());
				this.requiresPostponedSending(false);
			}
		}, this);
		this.requiresPostponedSending = ko.observable(false);
	
		// file uploader
		this.oJua = null;
	
		this.isDraftsCleared = ko.observable(false);
		this.autoSaveTimer = ko.observable(-1);
	
		this.backToListCommand = Utils.createCommand(this, this.executeBackToList);
		this.sendCommand = Utils.createCommand(this, this.executeSend, this.isEnableSending);
		this.saveCommand = Utils.createCommand(this, this.executeSaveCommand, this.isEnableSaving);
	
		this.messageForm = ko.observable(null);
		this.messageFields = ko.observable(null);
		
		this.shown = ko.observable(false);
	
		this.editableArea = ko.observable(null);
	
		$(document).on('keydown', $.proxy(function(ev) {
	
			var bCtrlKey = ev.ctrlKey;
	
			if(bCtrlKey)
			{
				var bThisScreen = App.Screens.currentScreen() === Enums.Screens.Compose,
					oEditableArea = this.editableArea(),
					nKey = ev.keyCode,
					oEnumsKey = Enums.Key
				;
	
				if (!oEditableArea && this.oHtmlEditor.oCrea)
				{
					this.editableArea(this.oHtmlEditor.oCrea.$editableArea[0]);
				}
	
				if (bThisScreen && ev && bCtrlKey && nKey === oEnumsKey.s) {
					ev.preventDefault();
					ev.returnValue = false;
	
					if(this.isEnableSaving()) {
						this.saveCommand();
					}
				}
	//			else if (bThisScreen && ev && bCtrlKey && nKey === oEnumsKey.Enter && oEditableArea && document.activeElement === oEditableArea)
				else if (bThisScreen && ev && bCtrlKey && nKey === oEnumsKey.Enter && this.toAddr() !== '')
				{
					this.sendCommand();
				}
			}
		},this));
	}
	
	/**
	 * Determines if sending a message is allowed.
	 */
	CComposeViewModel.prototype.isEnableSending = function ()
	{
		var
			bRecipientIsEmpty = this.toAddr().length === 0 &&
				this.ccAddr().length === 0 &&
				this.bccAddr().length === 0,
			bFoldersLoaded = this.folderList().iAccountId !== 0
		;
		
		return bFoldersLoaded && !this.sending() && !bRecipientIsEmpty && this.allAttachmentsUploaded();
	};
	
	/**
	 * Determines if saving a message is allowed.
	 */
	CComposeViewModel.prototype.isEnableSaving = function ()
	{
		var bFoldersLoaded = this.folderList().iAccountId !== 0;
		
		return bFoldersLoaded && !this.sending() && !this.saving();
	};
	
	/**
	 * Executes after applying bindings.
	 */
	CComposeViewModel.prototype.onApplyBindings = function ()
	{
		this.initUploader();
	};
	
	CComposeViewModel.prototype.getMessageOnRoute = function ()
	{
		var
			aParams = this.routeParams(),
			sFolderName = '',
			sUid = ''
		;
	
		if (this.routeType() !== '' && aParams.length === 3)
		{
			sFolderName = aParams[1];
			sUid = aParams[2];
			App.MailCache.getMessage(sFolderName, sUid, this.onMessageResponse, this);
		}
	
		this.routeParams([]);
	};
	
	/**
	 * Executes if the view model shows. Requests a folder list from the server to know the full names
	 * of the folders Drafts and Sent Items.
	 */
	CComposeViewModel.prototype.onShow = function ()
	{
		this.useSaveMailInSentItems(AppData.User.getUseSaveMailInSentItems());
		this.saveMailInSentItems(AppData.User.getSaveMailInSentItems());
		
		this.oHtmlEditor.initCrea(this.textBody(), '7');
		this.oHtmlEditor.clearImages();
		this.commitedTextBody(this.oHtmlEditor.getText());
	
		this.shown(true);
		this.startAutosave();
		this.focusAfterFilling();
		
		$html.addClass('screen-compose');
	
		if (this.oJua)
		{
			this.oJua.setDragAndDropEnabledStatus(true);
		}
	};
	
	/**
	 * Executes if routing changed.
	 *
	 * @param {Array} aParams
	 */
	CComposeViewModel.prototype.onRoute = function (aParams)
	{
		var sSignature = '';
		
		this.changeSenderAccountId(AppData.Accounts.currentId());
		
		this.messageUploadAttachmentsStarted(false);
		this.draftUid('');
		this.draftInfo.removeAll();
		this.setDataFromMessage(new CMessageModel());
	
		this.isDraftsCleared(false);
	
		this.routeType((aParams.length > 0) ? aParams[0] : '');
		switch (this.routeType())
		{
			case Enums.ReplyType.Reply:
			case Enums.ReplyType.ReplyAll:
			case Enums.ReplyType.Forward:
			case 'drafts':
				this.routeParams(aParams);
				if (this.folderList().iAccountId !== 0)
				{
					this.getMessageOnRoute();
				}
				break;
			default:
				sSignature = App.MessageSender.getSignatureText(this.senderAccountId(), null);
				if (AppData.SingleMode && window.opener && window.opener.oMessageParametersFromCompose)
				{
					this.setMessageDataInSingleMode(window.opener.oMessageParametersFromCompose);
					window.opener.oMessageParametersFromCompose = undefined;
				}
				else if (sSignature !== '')
				{
					this.textBody('<br /><br />' + sSignature);
				}
				
				if (this.routeType() === 'to' && aParams.length === 2)
				{
					this.toAddr(aParams[1]);
				}
				
				if (this.routeType() === 'vcard' && aParams.length === 2)
				{
					this.addContactAsAttachment(aParams[1]);
				}
				
				if (this.routeType() === 'file' && aParams.length === 2)
				{
					this.addFilesAsAttachment(aParams[1]);
				}
				break;
		}
	
		this.visibleCc(this.ccAddr() !== '');
		this.visibleBcc(this.bccAddr() !== '');
		this.commit(this.oHtmlEditor.getText());
		
		this.focusAfterFilling();
	};
	
	CComposeViewModel.prototype.focusAfterFilling = function ()
	{
		if (this.toAddr().length === 0)
		{
			this.toAddrFocused(true);
		}
		else if (this.subject().length === 0)
		{
			this.subjectFocused(true);
		}
		else
		{
			this.oHtmlEditor.setFocus();
		}
	};
	
	/**
	 * Executes if view model was hidden.
	 */
	CComposeViewModel.prototype.onHide = function ()
	{
		this.shown(false);
		this.stopAutosave();
	
		this.oHtmlEditor.closeAllPopups();
		
		$html.removeClass('screen-compose');
	
		if (this.oJua)
		{
			this.oJua.setDragAndDropEnabledStatus(false);
		}
	};
	
	/**
	 * Stops autosave.
	 */
	CComposeViewModel.prototype.stopAutosave = function ()
	{
		window.clearInterval(this.autoSaveTimer());
	};
	
	/**
	 * Starts autosave.
	 */
	CComposeViewModel.prototype.startAutosave = function ()
	{
		if (this.shown())
		{
			var fSave = _.bind(this.executeSave, this, true);
			this.stopAutosave();
			if (AppData.App.AutoSave)
			{
				this.autoSaveTimer(window.setInterval(fSave, AppData.App.AutoSaveIntervalSeconds * 1000));
			}
		}
	};
	
	/**
	 * @param {string} sEmail
	 * @param {number} iAccountId
	 */
	CComposeViewModel.prototype.getFetcherByEmail = function (sEmail, iAccountId)
	{
		var oAccount = AppData.Accounts.getDefault();
		
		return (oAccount && iAccountId === oAccount.id()) ? oAccount.getFetcherByEmail(sEmail) : null;
	};
	
	/**
	 * @param {Object} oMessage
	 */
	CComposeViewModel.prototype.onMessageResponse = function (oMessage)
	{
		var oReplyData = null;
		
		if (oMessage === null)
		{
			this.setDataFromMessage(new CMessageModel());
		}
		else
		{
			switch (this.routeType())
			{
				case Enums.ReplyType.Reply:
				case Enums.ReplyType.ReplyAll:
				case Enums.ReplyType.Forward:
					var oFetcher = App.MessageSender.getFetcherByRecipients(oMessage.oTo.aCollection, oMessage.accountId());
					if (oFetcher)
					{
						this.selectedSender(oFetcher.idFetcher());
					}
					
					oReplyData = App.MessageSender.getReplyDataFromMessage(oMessage, this.routeType(), this.senderAccountId(), oFetcher);
					this.draftInfo(oReplyData.DraftInfo);
					this.draftUid(oReplyData.DraftUid);
					this.toAddr(oReplyData.To);
					this.ccAddr(oReplyData.Cc);
					this.subject(oReplyData.Subject);
					this.textBody(oReplyData.Text);
					this.attachments(oReplyData.Attachments);
					this.inReplyTo(oReplyData.InReplyTo);
					this.references(oReplyData.References);
					break;
				case 'drafts':
					this.draftUid(oMessage.uid());
					this.setDataFromMessage(oMessage);
					break;
			}
			this.routeType('');
		}
	
		if (this.attachments().length > 0)
		{
			this.requestAttachmentsTempName();
		}
		
		this.visibleCc(this.ccAddr() !== '');
		this.visibleBcc(this.bccAddr() !== '');
		this.commit(this.oHtmlEditor.getText());
		
		this.focusAfterFilling();
	};
	
	/**
	 * @param {number} iId
	 * @param {string=} sEmail
	 * @param {string=} sFetcherId
	 */
	CComposeViewModel.prototype.changeSenderAccountId = function (iId, sEmail, sFetcherId)
	{
		if (AppData.Accounts.hasAccountWithId(iId))
		{
			this.senderAccountId(iId);
		}
		else if (!AppData.Accounts.hasAccountWithId(this.senderAccountId()))
		{
			this.senderAccountId(AppData.Accounts.currentId());
		}
		
		this.fillSenderList(sEmail, sFetcherId);
	};
	
	/**
	 * @param {string=} sEmail
	 * @param {string=} sFetcherId
	 */
	CComposeViewModel.prototype.fillSenderList = function (sEmail, sFetcherId)
	{
		var
			aSenderList = [],
			oAccount = AppData.Accounts.getDefault(),
			aFetchers = []
		;
		
		if (oAccount && this.senderAccountId() === oAccount.id())
		{
			if (oAccount.fetchers())
			{
				aFetchers = oAccount.fetchers().collection();
				if (aFetchers.length > 0)
				{
					aSenderList.push({fullEmail: oAccount.fullEmail(), id: ''});
					_.each(aFetchers, function (oFetcher) {
						if (oFetcher.isOutgoingEnabled())
						{
							aSenderList.push({fullEmail: oFetcher.fullEmail(), id: oFetcher.idFetcher()});
						}
					}, this);
				}
			}
			else
			{
				oAccount.fetchers.subscribe(function () {
					this.fillSenderList(sEmail, sFetcherId);
				}, this);
			}
		}
		
		this.senderList(aSenderList);
		
		if (sEmail && sEmail !== '')
		{
			this.changeSelectedSenderByEmail(sEmail);
		}
		else if (sFetcherId && sFetcherId !== '')
		{
			this.selectedSender(sFetcherId);
		}
		else
		{
			this.selectedSender(0);
		}
	};
	
	/**
	 * @param {string} sEmail
	 */
	CComposeViewModel.prototype.changeSelectedSenderByEmail = function (sEmail)
	{
		var
			oAccount = AppData.Accounts.getDefault(),
			oFetcher = (oAccount && this.senderAccountId() === oAccount.id()) ? oAccount.getFetcherByEmail(sEmail) : null
		;
		
		if (oFetcher && oFetcher.idFetcher())
		{
			this.selectedSender(oFetcher.idFetcher());
		}
	};
	
	CComposeViewModel.prototype.changeSignature = function ()
	{
		var
			sSignature = '',
			oAccount = AppData.Accounts.getDefault(),
			aFetchers = [],
			oFetcher = null
		;
		
		if (oAccount && this.senderAccountId() === oAccount.id() && oAccount.fetchers())
		{
			aFetchers = oAccount.fetchers().collection();
			
			if (aFetchers.length > 0)
			{
				oFetcher = _.find(aFetchers, function (oFtchr) {
					return oFtchr.idFetcher() === Utils.pInt(this.selectedSender());
				}, this);
				
				if (oFetcher)
				{
					sSignature = oFetcher.signature();
				}
				else
				{
					sSignature = (oAccount.signature() && oAccount.signature().options()) ?
						oAccount.signature().signature() : '';
				}
				
				this.oHtmlEditor.changeSignatureContent(sSignature);
			}
		}
	};
	
	/**
	 * @param {Object} oMessage
	 */
	CComposeViewModel.prototype.setDataFromMessage = function (oMessage)
	{
		var sText = oMessage.getDomText().html();
		
		this.draftInfo(oMessage.draftInfo());
		this.inReplyTo(oMessage.inReplyTo());
		this.references(oMessage.references());
		this.toAddr(oMessage.oTo.getFull());
		this.ccAddr(oMessage.oCc.getFull());
		this.bccAddr(oMessage.oBcc.getFull());
		this.subject(oMessage.subject());
		this.attachments(oMessage.attachments());
		this.textBody(sText ? sText : oMessage.text());
		this.selectedImportance(oMessage.importance());
		this.selectedSensitivity(oMessage.sensitivity());
		this.readingConfirmation(oMessage.readingConfirmation());
		
		this.changeSenderAccountId(oMessage.accountId(), oMessage.oFrom.getFirstEmail());
	};

    CComposeViewModel.prototype.addBlobAsAttachment = function (blob, fileName)
    {
        var that = this,
            data = new FormData();

        data.append('jua-post-type', 'ajax');
        data.append('jua-uploader', blob, fileName);
        data.append('Token', AppData.Token);
        data.append('AccountID', AppData.Accounts.currentId());

        $.ajax({
            type: 'POST',
            url: 'index.php?/Upload/Attachment/',
            data: data,
            processData: false,
            contentType: false,
            success: function (response) {
                var oAttach = new CAttachmentModel();

                oAttach.fileName(decodeURIComponent(response.Result.Attachment.Name));
                oAttach.tempName(decodeURIComponent(response.Result.Attachment.TempName));
                oAttach.uploadUid(decodeURIComponent(response.Result.Attachment.TempName));
                oAttach.size(response.Result.Attachment.Size);
                oAttach.hash(response.Result.Attachment.Hash);
                oAttach.type(decodeURIComponent(response.Result.Attachment.MimeType));
                oAttach.accountId(AppData.Accounts.currentId());

                oAttach.uploaded(true);

                that.attachments.push(oAttach);
            }
        });
    };

    CComposeViewModel.prototype.addUrlAsAttachment = function (url, fileName)
    {
        var that = this,
            xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                CComposeViewModel.prototype.addBlobAsAttachment.call(that, this.response, fileName);
            }
        };

        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    };
	
	/**
	 * @param {Array} aFiles
	 */
	CComposeViewModel.prototype.addFilesAsAttachment = function (aFiles)
	{
		var
			oAttach = null,
			aHashes = [],
			oParameters = null
		;
		
		_.each(aFiles, function (oFile) {
			oAttach = new CAttachmentModel();
			oAttach.fileName(oFile.name());
			oAttach.hash(oFile.hash());
			oAttach.uploadStarted(true);
	
			this.attachments.push(oAttach);
	
			aHashes.push(oFile.hash());
		}, this);
		
		if (aHashes.length > 0)
		{
			oParameters = {
				'Action': 'FilesUpload',
				'Hashes': aHashes
			};
	
			this.messageUploadAttachmentsStarted(true);
			
			App.Ajax.send(oParameters, this.onFilesUpload, this);
		}
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CComposeViewModel.prototype.onFilesUpload = function (oResponse, oRequest)
	{
		var
			aResult = oResponse.Result,
			aHashes = oRequest.Hashes
		;
		
		this.messageUploadAttachmentsStarted(false);
		
		if ($.isArray(aResult))
		{
			_.each(aResult, function (oFileData) {
				var oAttachment = _.find(this.attachments(), function (oAttach) {
					return oAttach.hash() === oFileData.Hash;
				});
				
				if (oAttachment)
				{
					oAttachment.parseFromContact(oFileData, oResponse.AccountID);
					oAttachment.hash(oFileData.NewHash);
				}
			}, this);
		}
		else
		{
			_.each(aHashes, function (sHash) {
				var oAttachment = _.find(this.attachments(), function (oAttach) {
					return oAttach.hash() === sHash;
				});
				
				if (oAttachment)
				{
					oAttachment.errorFromContact();
				}
			}, this);
		}
	};
	
	/**
	 * @param {Object} oContact
	 */
	CComposeViewModel.prototype.addContactAsAttachment = function (oContact)
	{
		var
			oAttach = new CAttachmentModel(),
			oParameters = null
		;
		
		if (oContact)
		{
			oAttach.fileName('contact-' + oContact.idContact() + '.vcf');
			oAttach.uploadStarted(true);
	
			this.attachments.push(oAttach);
	
			oParameters = {
				'Action': 'ContactVCardUpload',
				'ContactId': oContact.idContact(),
				'Global': oContact.global() ? '1' : '0',
				'Name': oAttach.fileName()
			};
	
			this.messageUploadAttachmentsStarted(true);
			
			App.Ajax.send(oParameters, this.onContactVCardUpload, this);
		}
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CComposeViewModel.prototype.onContactVCardUpload = function (oResponse, oRequest)
	{
		var
			oResult = oResponse.Result,
			oAttach = null
		;
		
		this.messageUploadAttachmentsStarted(false);
		
		if (oResult)
		{
			oAttach = _.find(this.attachments(), function (oAttach) {
				return oAttach.fileName() === oResult.Name && oAttach.uploadStarted();
			});
			
			if (oAttach)
			{
				oAttach.parseFromContact(oResult, oResponse.AccountID);
			}
		}
		else
		{
			oAttach = _.find(this.attachments(), function (oAttach) {
				return oAttach.fileName() === oRequest.Name && oAttach.uploadStarted();
			});
			
			if (oAttach)
			{
				oAttach.errorFromContact();
			}
		}
	};
	
	CComposeViewModel.prototype.requestAttachmentsTempName = function ()
	{
		var
			aHash = _.map(this.attachments(), function (oAttach) {
				oAttach.uploadStarted(true);
				return oAttach.hash();
			}),
			oParameters = {
				'Action': 'MessageUploadAttachments',
				'Attachments': aHash
			}
		;
	
		if (aHash.length > 0)
		{
			this.messageUploadAttachmentsStarted(true);
			
			App.Ajax.send(oParameters, this.onMessageUploadAttachmentsResponse, this);
		}
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CComposeViewModel.prototype.onMessageUploadAttachmentsResponse = function (oResponse, oRequest)
	{
		this.messageUploadAttachmentsStarted(false);
		
		if (oResponse.Result)
		{
			_.each(oResponse.Result, _.bind(this.setAttachTepmNameByHash, this));
		}
	};
	
	/**
	 * @param {string} sHash
	 * @param {string} sTempName
	 */
	CComposeViewModel.prototype.setAttachTepmNameByHash = function (sHash, sTempName)
	{
		_.each(this.attachments(), function (oAttach) {
			if (oAttach.hash() === sHash)
			{
				oAttach.tempName(sTempName);
				oAttach.uploadStarted(false);
			}
		});
	};
	
	/**
	 * @param {Object} oParameters
	 */
	CComposeViewModel.prototype.setMessageDataInSingleMode = function (oParameters)
	{
		this.draftInfo(oParameters.draftInfo);
		this.draftUid(oParameters.draftUid);
		this.inReplyTo(oParameters.inReplyTo);
		this.references(oParameters.references);
		this.toAddr(oParameters.toAddr);
		this.ccAddr(oParameters.ccAddr);
		this.bccAddr(oParameters.bccAddr);
		this.subject(oParameters.subject);
		this.attachments(_.map(oParameters.attachments, function (oRawAttach)
		{
			var oAttach = new CAttachmentModel();
			oAttach.parse(oRawAttach, this.senderAccountId());
			return oAttach;
		}, this));
		this.textBody(oParameters.textBody);
		this.selectedImportance(oParameters.selectedImportance);
		this.selectedSensitivity(oParameters.selectedSensitivity);
		this.readingConfirmation(oParameters.readingConfirmation);
		
		this.changeSenderAccountId(oParameters.senderAccountId, '', oParameters.selectedSender);
	};
	
	CComposeViewModel.prototype.isEmpty = function ()
	{
		var
			sTo = Utils.trim(this.toAddr()),
			sCc = Utils.trim(this.ccAddr()),
			sBcc = Utils.trim(this.bccAddr()),
			sSubject = Utils.trim(this.subject()),
			sText = this.oHtmlEditor.getText(),
			sTextWithoutNodes = Utils.trim(sText
				.replace(/<br *\/{0,1}>/gi, '\n')
				.replace(/<[^>]*>/g, '')
				.replace(/&nbsp;/g, ' '))
		;
		
		return (sTo === '' && sCc === '' && sBcc === '' && sSubject === '' &&
			this.attachments().length === 0 && sTextWithoutNodes === '');
	};
	
	/**
	 * @param {string} sText
	 */
	CComposeViewModel.prototype.commit = function (sText)
	{
		this.toAddr.commit();
		this.ccAddr.commit();
		this.bccAddr.commit();
		this.subject.commit();
		this.commitedTextBody(sText);
		this.attachmentsChanged(false);
	};
	
	CComposeViewModel.prototype.isChanged = function ()
	{
		return this.toAddr.changed() || this.ccAddr.changed() || this.bccAddr.changed() || 
			this.subject.changed() || (this.commitedTextBody() !== this.oHtmlEditor.getText()) || 
			this.attachmentsChanged();
	};
	
	CComposeViewModel.prototype.executeBackToList = function ()
	{
		if (this.isChanged() && !this.isEmpty())
		{
			this.executeSave(true);
		}
		
		if (AppData.SingleMode)
		{
			window.close();
		}
		else
		{
			App.Routing.setPreviousHash();
		}
	};
	
	/**
	 * Creates new attachment for upload.
	 *
	 * @param {string} sUid
	 * @param {Object} oFileData
	 */
	CComposeViewModel.prototype.onFileUploadSelect = function (sUid, oFileData)
	{
		var
			oAttach,
			sWarning = Utils.i18n('COMPOSE/UPLOAD_ERROR_FILENAME_SIZE', {'FILENAME': oFileData.FileName})
		;
	
		if (AppData.App.AttachmentSizeLimit > 0 && oFileData.Size > AppData.App.AttachmentSizeLimit)
		{
			App.Screens.showPopup(AlertPopup, [sWarning]);
			return false;
		}
	
		oAttach = new CAttachmentModel();
		oAttach.onUploadSelect(sUid, oFileData);
		this.attachments.push(oAttach);
		this.attachmentsChanged(true);
	
		return true;
	};
	
	/**
	 * Returns attachment found by uid.
	 *
	 * @param {string} sUid
	 */
	CComposeViewModel.prototype.getAttachmentByUid = function (sUid)
	{
		return _.find(this.attachments(), function (oAttach) {
			return oAttach.uploadUid() === sUid;
		});
	};
	
	/**
	 * Finds attachment by uid. Calls it's function to start upload.
	 *
	 * @param {string} sUid
	 */
	CComposeViewModel.prototype.onFileUploadStart = function (sUid)
	{
		var oAttach = this.getAttachmentByUid(sUid);
	
		if (oAttach)
		{
			oAttach.onUploadStart();
		}
	};
	
	/**
	 * Finds attachment by uid. Calls it's function to progress upload.
	 *
	 * @param {string} sUid
	 * @param {number} iUploadedSize
	 * @param {number} iTotalSize
	 */
	CComposeViewModel.prototype.onFileUploadProgress = function (sUid, iUploadedSize, iTotalSize)
	{
		var oAttach = this.getAttachmentByUid(sUid);
	
		if (oAttach)
		{
			oAttach.onUploadProgress(iUploadedSize, iTotalSize);
		}
	};
	
	/**
	 * Finds attachment by uid. Calls it's function to complete upload.
	 *
	 * @param {string} sUid
	 * @param {boolean} bResponseReceived
	 * @param {Object} oResult
	 */
	CComposeViewModel.prototype.onFileUploadComplete = function (sUid, bResponseReceived, oResult)
	{
		var oAttach = this.getAttachmentByUid(sUid);
	
		if (oAttach)
		{
			oAttach.onUploadComplete(sUid, bResponseReceived, oResult);
		}
	};
	
	/**
	 * Finds attachment by uid. Calls it's function to cancel upload.
	 *
	 * @param {string} sUid
	 */
	CComposeViewModel.prototype.onAttachmentRemove = function (sUid)
	{
		var oAttach = this.getAttachmentByUid(sUid);
	
		if (this.oJua)
		{
			this.oJua.cancel(sUid);
		}
	
		this.attachments.remove(oAttach);
		this.attachmentsChanged(true);
	};
	
	/**
	 * Initializes file uploader.
	 */
	CComposeViewModel.prototype.initUploader = function ()
	{
		if (this.composeUploaderButton())
		{
			this.oJua = new Jua({
				'action': '?/Upload/Attachment/',
				'name': 'jua-uploader',
				'queueSize': 2,
				'clickElement': this.composeUploaderButton(),
				'dragAndDropElement': this.composeUploaderDropPlace(),
				'disableAjaxUpload': false,
				'disableFolderDragAndDrop': false,
				'disableDragAndDrop': false,
				'hidden': {
					'Token': function () {
						return AppData.Token;
					},
					'AccountID': function () {
						return AppData.Accounts.currentId();
					}
				},
				'onDragEnter': _.bind(this.composeUploaderDragOver, this, true),
				'onDragLeave': _.bind(this.composeUploaderDragOver, this, false),
				'onBodyDragEnter': _.bind(this.composeUploaderBodyDragOver, this, true),
				'onBodyDragLeave': _.bind(this.composeUploaderBodyDragOver, this, false),
				'onProgress': _.bind(this.onFileUploadProgress, this),
				'onSelect': _.bind(this.onFileUploadSelect, this),
				'onStart': _.bind(this.onFileUploadStart, this),
				'onComplete': _.bind(this.onFileUploadComplete, this)
			});
			
			this.allowDragNDrop(this.oJua.isDragAndDropSupported());
		}
	};
	
	/**
	 * @param {boolean} bRemoveSignatureAnchor
	 */
	CComposeViewModel.prototype.getSendSaveParameters = function (bRemoveSignatureAnchor)
	{
		var
			oAttachments = App.MessageSender.convertAttachmentsForSending(this.attachments())
		;
	
		_.each(this.oHtmlEditor.uploadedImagePathes(), function (oAttach) {
			oAttachments[oAttach.TempName] = [oAttach.Name, oAttach.CID, '1', '1'];
		});
	
		return {
			'AccountID': this.senderAccountId(),
			'FetcherID': this.selectedSender(),
			'DraftInfo': this.draftInfo(),
			'DraftUid': this.draftUid(),
			'To': this.toAddr(),
			'Cc': this.ccAddr(),
			'Bcc': this.bccAddr(),
			'Subject': this.subject(),
			'Text': this.oHtmlEditor.getText(bRemoveSignatureAnchor),
			'Importance': this.selectedImportance(),
			'Sensivity': this.selectedSensitivity(),
			'ReadingConfirmation': this.readingConfirmation() ? '1' : '0',
			'Attachments': oAttachments,
			'InReplyTo': this.inReplyTo(),
			'References': this.references()
		};
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CComposeViewModel.prototype.onMessageSendResponse = function (oResponse, oRequest)
	{
		var oResData = App.MessageSender.onMessageSendResponse(oResponse, oRequest);
		
		this.commit(oRequest.Text);
		
		switch (oResData.Action)
		{
			case 'MessageSave':
				if (oResData.Result)
				{
					if (oResData.NewUid)
					{
						this.draftUid(oResData.NewUid);
						this.startAutosave();
					}
				}
				this.saving(false);
				break;
			case 'MessageSend':
				if (oResData.Result)
				{
					App.MailCache.deletedDraftMessageUid(this.draftUid());
					this.executeBackToList();
				}
				this.sending(false);
				break;
		}
	};
	
	CComposeViewModel.prototype.verifyDataForSending = function ()
	{
		var
			aToIncorrect = Utils.getIncorrectEmailsFromAddressString(this.toAddr()),
			aCcIncorrect = Utils.getIncorrectEmailsFromAddressString(this.ccAddr()),
			aBccIncorrect = Utils.getIncorrectEmailsFromAddressString(this.bccAddr()),
			aIncorrect = _.union(aToIncorrect, aCcIncorrect, aBccIncorrect),
			sWarning = Utils.i18n('COMPOSE/WARNING_INPUT_CORRECT_EMAILS') + aIncorrect.join(', ')
		;
	
		if (aIncorrect.length > 0)
		{
			App.Screens.showPopup(AlertPopup, [sWarning]);
			return false;
		}
	
		return true;
	};
	
	CComposeViewModel.prototype.executeSend = function ()
	{
	
		if (this.isEnableSending() && this.verifyDataForSending())
		{
			this.stopAutosave();
			this.sending(true);
			this.requiresPostponedSending(!this.allowStartSending());
			App.MessageSender.send('MessageSend', this.getSendSaveParameters(true), this.saveMailInSentItems(),
				true, this.onMessageSendResponse, this, this.requiresPostponedSending());
		}
	};
	
	CComposeViewModel.prototype.executeSaveCommand = function ()
	{
		this.executeSave(false);
	};
	
	/**
	 * @param {boolean=} bAutosave = false
	 */
	CComposeViewModel.prototype.executeSave = function (bAutosave)
	{
		if (this.isEnableSaving())
		{
			this.stopAutosave();
			this.saving(true);
			App.MessageSender.send('MessageSave', this.getSendSaveParameters(false), this.saveMailInSentItems(),
				!bAutosave, this.onMessageSendResponse, this);
		}
	};
	
	/**
	 * Changes visibility of bcc field.
	 */
	CComposeViewModel.prototype.changeBccVisibility = function ()
	{
		this.visibleBcc(!this.visibleBcc());
		
		if (this.visibleBcc())
		{
			this.bccAddrFocused(true);
		}
		else
		{
			this.toAddrFocused(true);
		}
	};
	
	/**
	 * Changes visibility of bcc field.
	 */
	CComposeViewModel.prototype.changeCcVisibility = function ()
	{	
		this.visibleCc(!this.visibleCc());
		
		if (this.visibleCc())
		{
			this.ccAddrFocused(true);
		}
		else
		{
			this.toAddrFocused(true);
		}
	};
	
	CComposeViewModel.prototype.getMessageDataForSingleMode = function ()
	{
		var aAttachments = _.map(this.attachments(), function (oAttach)
		{
			return {
				'@Object': 'Object/CApiMailAttachment',
				'FileName': oAttach.fileName(),
				'TempName': oAttach.tempName(),
				'MimeType': oAttach.type(),
				'MimePartIndex': oAttach.mimePartIndex(),
				'EstimatedSize': oAttach.size(),
				'CID': oAttach.cid(),
				'IsInline': oAttach.inline(),
				'IsLinked': oAttach.linked(),
				'Hash': oAttach.hash()
			};
		});
		
		return {
			draftInfo: this.draftInfo(),
			draftUid: this.draftUid(),
			inReplyTo: this.inReplyTo(),
			references: this.references(),
			senderAccountId: this.senderAccountId(),
			selectedSender: this.selectedSender(),
			toAddr: this.toAddr(),
			ccAddr: this.ccAddr(),
			bccAddr: this.bccAddr(),
			subject: this.subject(),
			attachments: aAttachments,
			textBody: this.oHtmlEditor.getText(),
			selectedImportance: this.selectedImportance(),
			selectedSensitivity: this.selectedSensitivity(),
			readingConfirmation: this.readingConfirmation()
		};
	};
	
	CComposeViewModel.prototype.openInNewWindow = function ()
	{
		window.oMessageParametersFromCompose = this.getMessageDataForSingleMode();
		Utils.WindowOpener.openTab('#' + Enums.Screens.SingleCompose);
		this.commit(this.oHtmlEditor.getText());
		this.executeBackToList();
	};
	
	CComposeViewModel.prototype.computeHeight = function ()
	{
		var
			oMessageForm = this.messageForm(),
			oMessageFields = this.messageFields()
		;
	
		if (oMessageForm && oMessageFields)
		{
			_.defer(function () {
				var iMessageFields = $(oMessageFields).outerHeight();
	
				$(oMessageForm).css({
					'padding-top': iMessageFields,
					'margin-top': -iMessageFields
				});
			});
		}
	};
	
	/**
	 * @param {string} sTerm
	 * @param {Function} fResponse
	 */
	CComposeViewModel.prototype.autocompleteCallback = function (sTerm, fResponse)
	{
		var
			oParameters = {
				'Action': 'ContactSuggestions',
				'Search': sTerm
			}
		;
	
		sTerm = Utils.trim(sTerm);
		if ('' !== sTerm)
		{
			App.Ajax.send(oParameters, function (oResponse) {
				var aList = [];
				if (oResponse && oResponse.Result && oResponse.Result && oResponse.Result.List)
				{
					aList = _.map(oResponse.Result.List, function (oItem) {
						return oItem && oItem.Email ? 
							(oItem.Name && 0 < Utils.trim(oItem.Name).length ?
								'"' + oItem.Name + '" <' + oItem.Email + '>' : oItem.Email) : '';
					});
	
					aList = _.compact(aList);
				}
				fResponse(aList);
			}, this);
		}
		else
		{
			fResponse([]);
		}
	};
	
	
	/**
	 * @param {CContactsViewModel} oParent
	 * @constructor
	 */
	function CContactsImportViewModel(oParent)
	{
		this.oJua = null;
		this.oParent = oParent;
	
		this.visibility = ko.observable(false);
		this.importing = ko.observable(false);
	}
	
	CContactsImportViewModel.prototype.onFileImportStart = function ()
	{
		this.importing(true);
	};
	
	/**
	 * @param {string} sUid
	 * @param {boolean} bResult
	 * @param {Object} oData
	 */
	CContactsImportViewModel.prototype.onFileImportComplete = function (sUid, bResult, oData)
	{
		this.importing(false);
		this.oParent.requestContactList();
	
		if (bResult && oData && oData.Result)
		{
			var iImportedCount = Utils.pInt(oData.Result.ImportedCount);
	
			if (0 < iImportedCount)
			{
				App.Api.showReport(Utils.i18n('CONTACTS/CONTACT_IMPORT_HINT_PLURAL', {
					'NUM': iImportedCount
				}, null, iImportedCount));
			}
			else
			{
				App.Api.showError(Utils.i18n('WARNING/CONTACTS_IMPORT_NO_CONTACTS'));
			}
		}
		else
		{
			App.Api.showError(Utils.i18n('WARNING/CONTACTS_IMPORT_ERROR'));
		}
	};
	
	/**
	 * @param {Object} $oViewModel
	 */
	CContactsImportViewModel.prototype.onApplyBindings = function ($oViewModel)
	{
		this.oJua = new Jua({
			'action': '?/Upload/Contacts/',
			'name': 'jua-uploader',
			'queueSize': 1,
			'clickElement': $('#jue_import_button', $oViewModel),
			'disableAjaxUpload': false,
			'disableDragAndDrop': true,
			'disableMultiple': true,
			'hidden': {
				'Token': function () {
					return AppData.Token;
				},
				'AccountID': function () {
					return AppData.Accounts.currentId();
				}
			},
			'onStart': _.bind(this.onFileImportStart, this),
			'onComplete': _.bind(this.onFileImportComplete, this)
		});
	};
	
	
	/**
	 * @constructor
	 */
	function CContactsViewModel()
	{
		var self = this;
	
		this.loadingList = ko.observable(false);
		this.loadingViewPane = ko.observable(false);
		
		this.showPersonalContacts = ko.observable(false);
		this.showGlobalContacts = ko.observable(false);
	
		this.selectedGroupType = ko.observable(Enums.ContactsGroupListType.Personal);
	
		this.selectedGroupInList = ko.observable(null);
	
		this.selectedGroupInList.subscribe(function () {
			var oPrev = this.selectedGroupInList();
			if (oPrev)
			{
				oPrev.selected(false);
			}
		}, this, 'beforeChange');
	
		this.selectedGroupInList.subscribe(function (oGroup) {
			if (oGroup && this.showPersonalContacts())
			{
				oGroup.selected(true);
	
				this.selectedGroupType(Enums.ContactsGroupListType.SubGroup);
	
				this.requestContactList();
			}
		}, this);
	
		this.selectedGroup = ko.observable(null);
		this.selectedContact = ko.observable(null);
	
		this.oContactModel = new CContactModel();
		this.oGroupModel = new CGroupModel();
	
		this.oContactImportViewModel = new CContactsImportViewModel(this);
	
		this.selectedItem = ko.computed({
			'read': function () {
				return this.selectedContact() || this.selectedGroup() || null;
			},
			'write': function (oItem) {
				if (oItem instanceof CContactModel)
				{
					this.oContactImportViewModel.visibility(false);
					this.selectedGroup(null);
					this.selectedContact(oItem);
				}
				else if (oItem instanceof CGroupModel)
				{
					this.oContactImportViewModel.visibility(false);
					this.selectedContact(null);
					this.selectedGroup(oItem);
				}
				else
				{
					this.selectedGroup(null);
					this.selectedContact(null);
				}
	
				this.loadingViewPane(false);
			},
			'owner': this
		});
	
		this.sortOrder = ko.observable(true);
		this.sortType = ko.observable(Enums.ContactSortType.Name);
	
		this.collection = ko.observableArray([]);
		
		this.isSearchFocused = ko.observable(false);
		this.searchInput = ko.observable('');
		this.search = ko.observable('');
	
		this.groupFullCollection = ko.observableArray([]);
	
		this.selectedContact.subscribe(function (oContact) {
			if (oContact)
			{
				var aGroupsId = oContact.groups();
				_.each(this.groupFullCollection(), function (oItem) {
					oItem.checked(oItem && 0 <= Utils.inArray(oItem.Id(), aGroupsId));
				});
			}
		}, this);
	
		this.selectedGroupType.subscribe(function (iValue) {
	
			if (Enums.ContactsGroupListType.Personal === iValue && !this.showPersonalContacts() && this.showGlobalContacts())
			{
				this.selectedGroupType(Enums.ContactsGroupListType.Global);
			}
			else if (Enums.ContactsGroupListType.Global === iValue && !this.showGlobalContacts() && this.showPersonalContacts())
			{
				this.selectedGroupType(Enums.ContactsGroupListType.Personal);
			}
			else if (Enums.ContactsGroupListType.Personal === iValue || Enums.ContactsGroupListType.Global === iValue)
			{
				this.selectedGroupInList(null);
				this.selectedItem(null);
				this.selector.listCheckedOrSelected(false);
				this.requestContactList();
			}
		}, this);
	
		this.oPageSwitcher = new CPageSwitcherViewModel(0, AppData.User.ContactsPerPage);
		
		this.oPageSwitcher.currentPage.subscribe(function () {
			this.requestContactList();
		}, this);
	
		this.search.subscribe(function (sValue) {
			this.searchInput(sValue);
		}, this);
	
		this.searchSubmitCommand = Utils.createCommand(this, function () {
	
			this.oPageSwitcher.currentPage(1);
			this.search(this.searchInput());
	
			this.requestContactList();
		});
	
		this.selector = new CSelector(this.collection, function (oItem) {
			if (oItem)
			{
				self.requestContact(oItem);
			}
		}, _.bind(this.executeDelete, this), _.bind(this.onContactDblClick, this));
	
		this.checkAll = this.selector.koCheckAll();
		this.checkAllIncomplite = this.selector.koCheckAllIncomplete();
	
		this.newContactCommand = Utils.createCommand(this, this.executeNewContact);
		this.newGroupCommand = Utils.createCommand(this, this.executeNewGroup);
		this.addContactsCommand = Utils.createCommand(this, Utils.emptyFunction, this.isEnableAddContacts);
		this.deleteCommand = Utils.createCommand(this, this.executeDelete, this.isEnableDeleting);
		this.removeFromGroupCommand = Utils.createCommand(this, this.executeRemoveFromGroup, this.isEnableRemoveContactsFromGroup);
		this.importCommand = Utils.createCommand(this, this.executeImport);
		this.exportCommand = Utils.createCommand(this, this.executeExport);
		this.saveCommand = Utils.createCommand(this, this.executeSave, function () {
			var oItem = this.selectedItem();
			return oItem ? oItem.canBeSave() : false;
		});
		
		this.newMessageCommand = Utils.createCommand(this, function () {
			
			var 
				aList = this.selector.listCheckedOrSelected(),
				aText = []
			;
			
			if (_.isArray(aList) && 0 < aList.length)
			{
				aText = _.map(aList, function (oItem) {
					return oItem.EmailAndName();
				});
	
				aText = _.compact(aText);
				App.Api.openComposeMessage(aText.join(', '));
			}
	
		}, function () {
			return 0 < this.selector.listCheckedOrSelected().length;
		});
	
		this.selector.listCheckedOrSelected.subscribe(function (aList) {
			this.oGroupModel.newContactsInGroupCount(aList.length);
		}, this);
	
		this.isLoading = this.loadingList;
		this.isSearch = ko.computed(function () {
			return '' !== this.search();
		}, this);
		this.isEmptyList = ko.computed(function () {
			return 0 === this.collection().length;
		}, this);
		this.inGrooup = ko.computed(function () {
			return Enums.ContactsGroupListType.SubGroup === this.selectedGroupType();
		}, this);
	
		this.searchText = ko.computed(function () {
			return Utils.i18n('CONTACTS/INFO_SEARCH_RESULT', {
				'SEARCH': this.search()
			});
		}, this);
	}
	
	/**
	 * @param {Object} oData
	 */
	CContactsViewModel.prototype.executeSave = function (oData)
	{
		var
			oResult = {},
			aList = []
		;
	
		if (oData === this.selectedItem())
		{
			if (oData instanceof CContactModel && !oData.readOnly())
			{
				_.each(this.groupFullCollection(), function (oItem) {
					if (oItem && oItem.checked())
					{
						aList.push(oItem.Id());
					}
				});
	
				oData.groups(aList);
	
				oResult = oData.toObject();
				oResult.Action = oData.isNew() ? 'ContactCreate' : 'ContactUpdate';
	
				if (oData.edited())
				{
					oData.edited(false);
				}
	
				if (oData.isNew())
				{
					this.selectedItem(null);
				}
	
				App.Ajax.send(oResult, this.onResponse, this);
			}
			else if (oData instanceof CGroupModel && !oData.readOnly())
			{
				oResult = oData.toObject();
				oResult.Action = oData.isNew() ? 'GroupCreate' : 'GroupUpdate';
	
				if (oData.edited())
				{
					oData.edited(false);
				}
	
				if (oData.isNew())
				{
					this.selectedItem(null);
				}
	
				App.Ajax.send(oResult, this.onResponse, this);
			}
		}
	};
	
	CContactsViewModel.prototype.executeBackToList = function ()
	{
		App.Routing.setLastMailboxHash();
	};
	
	CContactsViewModel.prototype.executeNewContact = function ()
	{
		var oGr = this.selectedGroupInList();
		this.oContactModel.switchToNew();
		this.oContactModel.groups(oGr ? [oGr.Id()] : []);
		this.selectedItem(this.oContactModel);
		this.selector.itemSelected(null);
	};
	
	CContactsViewModel.prototype.executeNewGroup = function ()
	{
		this.oGroupModel.switchToNew();
		this.selectedItem(this.oGroupModel);
		this.selector.itemSelected(null);
	};
	
	CContactsViewModel.prototype.executeDelete = function ()
	{
		var
			self = this,
			oMainContact = this.selectedContact(),
			aChecked = this.selector.listCheckedOrSelected(),
			aContactsId = _.map(aChecked, function (oItem) {
				return oItem.ReadOnly() ? '' : oItem.Id();
			})
		;
	
		aContactsId = _.compact(aContactsId);
	
		if (0 < aContactsId.length)
		{
			_.each(aChecked, function (oContact) {
				if (oContact)
				{
					App.ContactsCache.clearInfoAboutEmail(oContact.Email());
	
					if (oMainContact && !oContact.IsGroup() && !oContact.ReadOnly() && !oMainContact.readOnly() && oMainContact.idContact() === oContact.Id())
					{
						oMainContact = null;
						this.selectedContact(null);
					}
				}
			}, this);
	
			_.each(this.collection(), function (oContact) {
				if (-1 < Utils.inArray(oContact, aChecked))
				{
					oContact.deleted(true);
				}
			});
	
			_.delay(function () {
				self.collection.remove(function (oItem) {
					return oItem.deleted();
				});
			}, 500);
	
			App.Ajax.send({
				'Action': 'ContactDelete',
				'ContactsId': aContactsId.join(',')
			}, this.onResponse, this);
			
			App.ContactsCache.markVcardsNonexistent(aContactsId);
		}
	};
	
	CContactsViewModel.prototype.executeRemoveFromGroup = function ()
	{
		var
			self = this,
			oGroup = this.selectedGroupInList(),
			aChecked = this.selector.listCheckedOrSelected(),
			aContactsId = _.map(aChecked, function (oItem) {
				return oItem.ReadOnly() ? '' : oItem.Id();
			})
		;
	
		aContactsId = _.compact(aContactsId);
	
		if (oGroup && 0 < aContactsId.length)
		{
			_.each(this.collection(), function (oContact) {
				if (-1 < Utils.inArray(oContact, aChecked))
				{
					oContact.deleted(true);
				}
			});
	
			_.delay(function () {
				self.collection.remove(function (oItem) {
					return oItem.deleted();
				});
			}, 500);
	
			App.Ajax.send({
				'Action': 'RemoveContactsFromGroup',
				'GroupId': oGroup.Id(),
				'ContactsId': aContactsId.join(',')
			}, this.onResponse, this);
		}
	};
	
	CContactsViewModel.prototype.executeImport = function ()
	{
		this.selectedItem(null);
		this.oContactImportViewModel.visibility(true);
		this.selector.itemSelected(null);
		this.selectedGroupType(Enums.ContactsGroupListType.Personal);
	};
	
	CContactsViewModel.prototype.executeExport = function ()
	{
		App.downloadByUrl(Utils.getExportContactsLink());
	};
	
	CContactsViewModel.prototype.executeCancel = function ()
	{
		var
			oData = this.selectedItem()
		;
	
		if (oData)
		{
			if (oData instanceof CContactModel && !oData.readOnly())
			{
				if (oData.isNew())
				{
					this.selectedItem(null);
				}
				else if (oData.edited())
				{
					oData.edited(false);
				}
			}
			else if (oData instanceof CGroupModel && !oData.readOnly())
			{
				if (oData.isNew())
				{
					this.selectedItem(null);
				}
				else if (oData.edited())
				{
					oData.edited(false);
				}
			}
		}
	
		this.oContactImportViewModel.visibility(false);
	};
	
	/**
	 * @param {Object} oGroup
	 * @param {Array} aContactIds
	 * @param {boolean} bGlobal
	 */
	CContactsViewModel.prototype.executeAddContactsToGroup = function (oGroup, aContactIds, bGlobal)
	{
		if (oGroup && _.isArray(aContactIds) && 0 < aContactIds.length)
		{
			oGroup.recivedAnim(true);
	
			App.Ajax.send({
				'Action': 'AddContactsToGroup',
				'Global': bGlobal ? '1' : '0',
				'GroupId': oGroup.Id(),
				'ContactsId': aContactIds.join(',')
			}, this.onResponse, this);
		}
	};
	
	/**
	 * @param {number} iGroupId
	 * @param {Array} aContactIds
	 * @param {boolean} bGlobal
	 */
	CContactsViewModel.prototype.executeAddContactsToGroupId = function (iGroupId, aContactIds, bGlobal)
	{
		if (iGroupId && _.isArray(aContactIds) && 0 < aContactIds.length)
		{
			App.Ajax.send({
				'Action': 'AddContactsToGroup',
				'Global': bGlobal ? '1' : '0',
				'GroupId': iGroupId,
				'ContactsId': aContactIds.join(',')
			}, this.onResponse, this);
		}
	};
	
	/**
	 * @param {Object} oGroup
	 */
	CContactsViewModel.prototype.executeAddSelectedContactsToGroup = function (oGroup)
	{
		var
			bGlobal = false,
			aList = this.selector.listCheckedOrSelected(),
			aContactIds = []
		;
	
		if (oGroup && _.isArray(aList) && 0 < aList.length)
		{
			_.each(aList, function (oItem) {
				if (oItem && !oItem.IsGroup())
				{
					bGlobal = oItem.Global();
					aContactIds.push(oItem.Id());
				}
			}, this);
		}
	
		this.executeAddContactsToGroup(oGroup, aContactIds, bGlobal);
	};
	
	/**
	 * @param {Object} oContact
	 */
	CContactsViewModel.prototype.groupsInContactView = function (oContact)
	{
		var
			aResult = [],
			aGroupIds = []
		;
	
		if (oContact && !oContact.groupsIsEmpty())
		{
			aGroupIds = oContact.groups();
			aResult = _.filter(this.groupFullCollection(), function (oItem) {
				return 0 <= Utils.inArray(oItem.Id(), aGroupIds);
			});
		}
	
		return aResult;
	};
	
	CContactsViewModel.prototype.isEnableAddContacts = function ()
	{
		return 0 < this.selector.listCheckedOrSelected().length;
	};
	
	CContactsViewModel.prototype.isEnableRemoveContactsFromGroup = function ()
	{
		return 0 < this.selector.listCheckedOrSelected().length;
	};
	
	CContactsViewModel.prototype.isEnableDeleting = function ()
	{
		return 0 < this.selector.listCheckedOrSelected().length;
	};
	
	CContactsViewModel.prototype.onShow = function ()
	{
		this.selector.useKeyboardKeys(true);
	
		this.oPageSwitcher.perPage(AppData.User.ContactsPerPage);
		this.oPageSwitcher.currentPage(1);
	
		this.requestContactList();
	};
	
	CContactsViewModel.prototype.onHide = function ()
	{
		this.selector.listCheckedOrSelected(false);
		this.selector.useKeyboardKeys(false);
		this.selectedItem(null);
	};
	
	CContactsViewModel.prototype.onApplyBindings = function ()
	{
		this.selector.initOnApplyBindings(
			'.contact_sub_list .item',
			'.contact_sub_list .selected.item',
			'.contact_sub_list .item .custom_checkbox',
			$('.contact_list', this.$viewModel),
			$('.contact_list .scroll-inner', this.$viewModel)
		);
	
		var self = this;
	
		this.$viewModel.on('click', '.content .item.add_to .dropdown_helper .item', function () {
	
			if ($(this).hasClass('new-group'))
			{
				self.executeNewGroup();
			}
			else
			{
				self.executeAddSelectedContactsToGroup(ko.dataFor(this));
			}
		});
	
		this.showPersonalContacts(!!AppData.User.ShowPersonalContacts);
		this.showGlobalContacts(!!AppData.User.ShowGlobalContacts);
		
		this.selectedGroupType.valueHasMutated();
		
		this.oContactImportViewModel.onApplyBindings(this.$viewModel);
		this.requestGroupFullList();
	
		var bFirstContactFlag = false;
		
		$(document).on('keyup', function(ev) {
			var nKey = ev.keyCode,
				oFirstContact = self.collection()[0],
				bListIsFocused = self.isSearchFocused()
			;
	
			if (ev && nKey === Enums.Key.s)
			{
				self.searchFocus();
			}
	
			else if (oFirstContact)
			{
				var bFirstContactSelected = oFirstContact.selected();
	
				if (oFirstContact && bListIsFocused && ev && nKey === Enums.Key.Down)
				{
					self.isSearchFocused(false);
					self.selector.itemSelected(oFirstContact);
					bFirstContactFlag = true;
				}
				else if (!bListIsFocused && bFirstContactFlag && bFirstContactSelected && ev && nKey === Enums.Key.Up)
				{
					self.isSearchFocused(true);
					self.selector.itemSelected(false);
					bFirstContactFlag = false;
				}
				else if (bFirstContactSelected) {
					bFirstContactFlag = true;
				}
				else if (!bFirstContactSelected) {
					bFirstContactFlag = false;
				}
			}
	
		});
	};
	
	CContactsViewModel.prototype.requestContactList = function ()
	{
		this.loadingList(true);
	
		App.Ajax.send({
			'Action': (Enums.ContactsGroupListType.Global === this.selectedGroupType()) ? 'GlobalContactList' : 'ContactList',
			'Offset': (this.oPageSwitcher.currentPage() - 1) * AppData.User.ContactsPerPage,
			'Limit': AppData.User.ContactsPerPage,
			'SortField': this.sortType(),
			'SortOrder': this.sortOrder() ? '1' : '0',
			'Search': this.search(),
			'GroupId': this.selectedGroupInList() ? this.selectedGroupInList().Id() : ''
		}, this.onResponse, this);
	};
	
	CContactsViewModel.prototype.requestGroupFullList = function ()
	{
		App.Ajax.send({
			'Action': 'GroupFullList'
		}, this.onResponse, this);
	};
	
	/**
	 * @param {Object} oItem
	 */
	CContactsViewModel.prototype.requestContact = function (oItem)
	{
		this.loadingViewPane(true);
	
		if (oItem)
		{
			App.Ajax.send({
				'Action': oItem.Global() ? 'GlobalContact' : 'Contact',
				'ContactId': oItem.Id()
			}, this.onResponse, this);
		}
	};
	
	/**
	 * @param {string} sItemId
	 * @param {boolean} bGlobal
	 */
	CContactsViewModel.prototype.requestContactById = function (sItemId, bGlobal)
	{
		this.loadingViewPane(true);
	
		if (sItemId)
		{
			App.Ajax.send({
				'Action': bGlobal ? 'GlobalContact' : 'Contact',
				'ContactId': sItemId
			}, this.onResponse, this);
		}
	};
	
	/**
	 * @param {Object} oData
	 */
	CContactsViewModel.prototype.viewGroup = function (oData)
	{
		if (oData && oData.IsGroup())
		{
			var
				oGroup = _.find(this.groupFullCollection(), function (oItem) {
					return oItem && oData && oItem === oData;
				})
			;
	
			if (oGroup)
			{
				this.oGroupModel.clear();
				this.oGroupModel
					.idGroup(oGroup.Id())
					.name(oGroup.Name())
				;
	
				this.oPageSwitcher.currentPage(1);
	
				this.selectedGroupInList(oGroup);
				this.selectedItem(this.oGroupModel);
				this.selector.itemSelected(null);
				this.selector.listCheckedOrSelected(false);
			}
		}
	};
	
	/**
	 * @param {Object} oGroup
	 */
	CContactsViewModel.prototype.deleteGroup = function (oGroup)
	{
		if (oGroup)
		{
			App.Ajax.send({
				'Action': 'GroupDelete',
				'GroupId': oGroup.idGroup()
			}, this.onResponse, this);
	
			this.selectedGroupType(Enums.ContactsGroupListType.Personal);
	
			this.groupFullCollection.remove(function (oItem) {
				return oItem && oItem.Id() === oGroup.idGroup();
			});
		}
	};
	
	/**
	 * @param {Object} oGroup
	 */
	CContactsViewModel.prototype.mailGroup = function (oGroup)
	{
		if (oGroup)
		{
			App.Ajax.send({
				'Action': 'ContactList',
				'Offset': 0,
				'Limit': 99,
				'SortField': Enums.ContactSortType.Email,
				'SortOrder': true ? '1' : '0',
				'GroupId': oGroup.idGroup()
			}, function (oData) {
	
				if (oData && oData['Result'] && oData['Result']['List'])
				{
					var
						iIndex = 0,
						iLen = 0,
						aText = [],
						oObject = null,
						aList = [],
						aResultList = oData['Result']['List']
					;
	
					for (iLen = aResultList.length; iIndex < iLen; iIndex++)
					{
						if (aResultList[iIndex] && 'Object/CContactListItem' === Utils.pExport(aResultList[iIndex], '@Object', ''))
						{
							oObject = new CContactListModel();
							oObject.parse(aResultList[iIndex]);
	
							aList.push(oObject);
						}
					}
	
					aText = _.map(aList, function (oItem) {
						return oItem.EmailAndName();
					});
	
					aText = _.compact(aText);
					App.Api.openComposeMessage(aText.join(', '));
				}
				
			}, this);
		}
	};
	
	/**
	 * @param {Object} oResult
	 * @param {Object} oRequest
	 */
	CContactsViewModel.prototype.onResponse = function (oResult, oRequest)
	{
		var
			iIndex = 0,
			iLen = 0,
			aList = [],
			bGlobal = false,
			oSelected  = null,
			oSubSelected  = null,
			aChecked = [],
			aCheckedIds = [],
			oObject = null
		;
	
		if (oResult && oResult.Action && oResult.Result)
		{
			if (0 <= Utils.inArray(oResult.Action, ['Contact', 'GlobalContact']) && 'Object/CContact' === Utils.pExport(oResult.Result, '@Object', ''))
			{
				oObject = new CContactModel();
				oObject.parse(oResult.Result);
	
				oSelected = this.selector.itemSelected();
				if (oSelected && oSelected.Id() === oObject.idContact())
				{
					this.selectedItem(oObject);
				}
			}
			else if (0 <= Utils.inArray(oResult.Action, ['ContactList', 'GlobalContactList']) && oResult.Result && _.isArray(oResult.Result.List))
			{
				bGlobal = 'GlobalContactList' === oResult.Action;
				for (iLen = oResult.Result.List.length; iIndex < iLen; iIndex++)
				{
					if (oResult.Result.List[iIndex] && 'Object/CContactListItem' === Utils.pExport(oResult.Result.List[iIndex], '@Object', ''))
					{
						oObject = new CContactListModel();
						oObject.parse(oResult.Result.List[iIndex], bGlobal);
	
						aList.push(oObject);
					}
				}
	
				aChecked = this.selector.listChecked();
				aCheckedIds = (aChecked && 0 < aChecked.length) ? _.map(aChecked, function (oItem) {
					return oItem.Id();
				}) : [];
	
				oSelected = this.selector.itemSelected();
				if (oSelected)
				{
					oSubSelected = _.find(aList, function (oItem) {
						return oSelected.Id() === oItem.Id();
					});
				}
	
				if (aCheckedIds && 0 < aCheckedIds.length)
				{
					_.each(aList, function (oItem) {
						oItem.checked(-1 < Utils.inArray(oItem.Id(), aCheckedIds));
					});
				}
	
				this.collection(aList);
				this.loadingList(false);
				this.oPageSwitcher.setCount(Utils.pInt(oResult.Result.ContactCount));
	
				if (oSubSelected)
				{
					this.selector.itemSelected(oSubSelected);
				}
			}
			else if (0 <= Utils.inArray(oResult.Action, ['ContactCreate', 'ContactUpdate', 'GroupCreate', 'GroupUpdate']))
			{
				if ('GroupCreate' === oResult.Action && oResult.Result.IdGroup)
				{
					aCheckedIds = _.map(this.selector.listChecked(), function (oItem) {
						return oItem.Id();
					});
	
					this.executeAddContactsToGroupId(
						oResult.Result.IdGroup,
						aCheckedIds,
						Enums.ContactsGroupListType.Global === this.selectedGroupType()
					);
	
					this.selectedItem(null);
					this.selector.itemSelected(null);
	
					App.Api.showReport(Utils.i18n('CONTACTS/REPORT_GROUP_SUCCESSFULLY_ADDED'));
				}
				else if ('ContactCreate' === oResult.Action && oResult.Result.IdContact)
				{
					App.Api.showReport(Utils.i18n('CONTACTS/REPORT_CONTACT_SUCCESSFULLY_ADDED'));
				}
	
				this.requestContactList();
	
				if (0 <= Utils.inArray(oResult.Action, ['GroupCreate', 'GroupUpdate']))
				{
					this.requestGroupFullList();
				}
			}
			else if (0 <= Utils.inArray(oResult.Action, ['ContactDelete', 'AddContactsToGroup', 'RemoveContactsFromGroup']))
			{
				this.requestContactList();
			}
			else if (0 <= Utils.inArray(oResult.Action, ['GroupDelete']))
			{
				this.requestGroupFullList();
			}
			else if ('GroupFullList' === oResult.Action)
			{
				oSelected = _.find(this.groupFullCollection(), function (oItem) {
					return oItem.selected();
				});
	
				this.groupFullCollection(aList);
	
				for (iLen = oResult.Result.length; iIndex < iLen; iIndex++)
				{
					if (oResult.Result[iIndex] && 'Object/CContactListItem' === Utils.pExport(oResult.Result[iIndex], '@Object', ''))
					{
						oObject = new CContactListModel();
						oObject.parse(oResult.Result[iIndex]);
	
						if (oObject.IsGroup())
						{
							if (oSelected && oSelected.Id() === oObject.Id())
							{
								this.selectedGroupInList(oObject);
							}
	
							aList.push(oObject);
						}
					}
				}
	
				this.groupFullCollection(aList);
			}
		}
	};
	
	/**
	 * @param {Object} oContact
	 */
	CContactsViewModel.prototype.dragAndDropHelper = function (oContact)
	{
		if (oContact)
		{
			oContact.checked(true);
		}
	
		var
			oSelected = this.selector.itemSelected(),
			oHelper = Utils.draggableMessages(),
			nCount = this.selector.listCheckedOrSelected().length,
			aUids = 0 < nCount ? _.map(this.selector.listCheckedOrSelected(), function (oItem) {
				return oItem.Id();
			}) : []
		;
	
		if (oSelected && !oSelected.checked())
		{
			oSelected.checked(true);
		}
	
		oHelper.data('p7-contatcs-type', this.selectedGroupType());
		oHelper.data('p7-contatcs-uids', aUids);
		
		$('.count-text', oHelper).text(Utils.i18n('CONTACTS/DRAG_TEXT_PLURAL', {
			'COUNT': nCount
		}, null, nCount));
	
		return oHelper;
	};
	
	/**
	 * @param {Object} oToGroup
	 * @param {Object} oEvent
	 * @param {Object} oUi
	 */
	CContactsViewModel.prototype.contactsDrop = function (oToGroup, oEvent, oUi)
	{
		if (oToGroup)
		{
			var
				oHelper = oUi && oUi.helper ? oUi.helper : null,
				iType = oHelper ? oHelper.data('p7-contatcs-type') : null,
				aUids = oHelper ? oHelper.data('p7-contatcs-uids') : null
			;
	
			if (null !== iType && null !== aUids)
			{
				Utils.uiDropHelperAnim(oEvent, oUi);
				this.executeAddContactsToGroup(oToGroup, aUids, Enums.ContactsGroupListType.Global === iType);
			}
		}
	};
	
	CContactsViewModel.prototype.searchFocus = function ()
	{
		if (this.selector.useKeyboardKeys() && !Utils.inFocus())
		{
			this.isSearchFocused(true);
		}
	};
	
	CContactsViewModel.prototype.onContactDblClick = function ()
	{
		var oContact = this.selectedContact();
		if (oContact)
		{
			App.Api.openComposeMessage(oContact.email());
		}
	};
	
	CContactsViewModel.prototype.onClearSearchClick = function ()
	{
		// initiation empty search
		this.search('');
		this.searchSubmitCommand();
	};
	
	
	/**
	 * @constructor
	 */
	function CSettingsViewModel()
	{
		this.aTabs = [];
		if (AppData.App.AllowUsersChangeInterfaceSettings)
		{
			this.aTabs.push(new CCommonSettingsViewModel());
		}
		this.aTabs.push(new CEmailAccountsSettingsViewModel());
		if (AppData.App.AllowUsersChangeInterfaceSettings && AppData.User.AllowCalendar)
		{
			this.aTabs.push(new CCalendarSettingsViewModel());
		}
		if (AppData.User.MobileSyncEnable)
		{
			this.aTabs.push(new CMobileSyncSettingsViewModel());
		}
		if (AppData.User.OutlookSyncEnable)
		{
			this.aTabs.push(new COutLookSyncSettingsViewModel());
		}
		if (AppData.User.IsHelpdeskSupported)
		{
			this.aTabs.push(new CHelpdeskSettingsViewModel());
		}
		
		if (AfterLogicApi && AfterLogicApi.getPluginsSettingsTabs)
		{
			_.each(AfterLogicApi.getPluginsSettingsTabs(), _.bind(function (ViewModelClass) {
				this.aTabs.push(new ViewModelClass());
			}, this));
		}
	
		this.tab = ko.observable(Enums.SettingsTab.Common);
	
		this.allowFolderListOrder = ko.computed(function () {
			var oAccount = AppData.Accounts.getEdited();
			return !oAccount.extensionExists('DisableFoldersManualSort');
		}, this);
		
		this.folderListOrderUpdateDebounce = _.debounce(_.bind(this.folderListOrderUpdate, this), 5000);
	}
	
	/**
	 * @param {Array} aParams
	 */
	CSettingsViewModel.prototype.onHide = function (aParams)
	{
		var
			oCurrentViewModel = null,
			sTab = this.tab()
		;
	
		this.confirmSaving(sTab);
		oCurrentViewModel = this.getCurrentViewModel();
		if (oCurrentViewModel && Utils.isFunc(oCurrentViewModel.onHide))
		{
			oCurrentViewModel.onHide(aParams);
		}
		
		$html.removeClass('non-adjustable');
	};
	
	/**
	 * @param {Array} aParams
	 */
	CSettingsViewModel.prototype.onShow = function (aParams)
	{
		var
			oCurrentViewModel = null,
			sTab = this.tab()
		;
	
		this.confirmSaving(sTab);
		oCurrentViewModel = this.getCurrentViewModel();
		if (oCurrentViewModel && Utils.isFunc(oCurrentViewModel.onShow))
		{
			oCurrentViewModel.onShow(aParams);
		}
		
		$html.addClass('non-adjustable');
	};
	
	/**
	 * @param {string} sTab
	 */
	CSettingsViewModel.prototype.viewTab = function (sTab)
	{
		var
			oCommonTabModel = this.getViewModel(Enums.SettingsTab.Common),
			sDefaultTab = (!!oCommonTabModel) ? Enums.SettingsTab.Common : Enums.SettingsTab.EmailAccounts,
			oNewTab = this.getViewModel(sTab),
			bExistingTab = (-1 === Utils.inArray(sTab, Enums.SettingsTab))
		;
		
		sTab = (oNewTab && bExistingTab) ? sTab : sDefaultTab;
		
		this.tab(sTab);
	};
	
	/**
	 * @param {Array} aParams
	 */
	CSettingsViewModel.prototype.onRoute = function (aParams)
	{
		var
			oCurrentViewModel = null,
			sTab = this.tab()
		;
	
		if (_.isArray(aParams) && aParams.length > 0)
		{
			sTab = aParams[0];
		}
		
		oCurrentViewModel = this.getCurrentViewModel();
		if (oCurrentViewModel && Utils.isFunc(oCurrentViewModel.onHide))
		{
			oCurrentViewModel.onHide(aParams);
		}
	
		this.confirmSaving(this.tab());
		this.viewTab(sTab);
	
		oCurrentViewModel = this.getCurrentViewModel();
		if (oCurrentViewModel && Utils.isFunc(oCurrentViewModel.onRoute))
		{
			oCurrentViewModel.onRoute(aParams);
		}
	};
	
	/**
	 * @param {string} sTab
	 */
	CSettingsViewModel.prototype.confirmSaving = function (sTab)
	{
		var oCurrentViewModel = this.getViewModel(sTab),
			sConfirm = Utils.i18n('SETTINGS/CONFIRM_SETTINGS_SAVE'),
			fAction = _.bind(function (bResult) {
				if (oCurrentViewModel)
				{
					if (bResult)
					{
						if (oCurrentViewModel.onSaveClick)
						{
							oCurrentViewModel.onSaveClick();
						}
					}
					else
					{
						if (oCurrentViewModel.init)
						{
							oCurrentViewModel.init();
						}
					}
				}
			}, this);
	
		if (oCurrentViewModel && Utils.isFunc(oCurrentViewModel.isChanged) && oCurrentViewModel.isChanged())
		{
			App.Screens.showPopup(ConfirmPopup, [sConfirm, fAction]);
		}
	};
	
	/**
	 * @param {string} sTab
	 * 
	 * @return {*}
	 */
	CSettingsViewModel.prototype.getViewModel = function (sTab)
	{
		return _.find(this.aTabs, function (oTabModel) {
			return oTabModel.TabName === sTab;
		});
	};
	
	/**
	 * @return Object
	 */
	CSettingsViewModel.prototype.getCurrentViewModel = function ()
	{
		return this.getViewModel(this.tab());
	};
	
	/**
	 * @param {string} sTab
	 */
	CSettingsViewModel.prototype.showTab = function (sTab)
	{
		App.Routing.setHash([Enums.Screens.Settings, sTab]);
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CSettingsViewModel.prototype.onResponseFolderDelete = function (oData, oParameters)
	{
		if (!oData.Result)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('SETTINGS/ERROR_SETTINGS_SAVING_FAILED'));
		}
		else
		{
			App.MailCache.getFolderList(AppData.Accounts.editedId());
		}
	};
	
	/**
	 * @param {Object} oFolderToDelete
	 * @param {{remove:Function}} koCollection
	 * @param {boolean} bOkAnswer
	 */
	CSettingsViewModel.prototype.deleteFolder = function (oFolderToDelete, koCollection, bOkAnswer)
	{
		var
			oParameters = {
				'Action': 'FolderDelete',
				'AccountID': AppData.Accounts.editedId(),
				'Folder': oFolderToDelete.fullName()
			}
		;
		
		if (bOkAnswer && koCollection && oFolderToDelete)
		{
			koCollection.remove(function (oFolder) {
				if (oFolderToDelete.fullName() === oFolder.fullName())
				{
					return true;
				}
				return false;
			});
			
			App.Ajax.send(oParameters, this.onResponseFolderDelete, this);
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CSettingsViewModel.prototype.onResponseFolderSubscribe = function (oData, oParameters)
	{
		if (!oData.Result)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('SETTINGS/ERROR_SETTINGS_SAVING_FAILED'));
		}
		else
		{
			App.MailCache.getFolderList(AppData.Accounts.editedId());
		}
	};
	
	/**
	 * @param {Object} oFolder
	 */
	CSettingsViewModel.prototype.onSubscribeFolderClick = function (oFolder)
	{
		var
			oParameters = {
				'Action': 'FolderSubscribe',
				'AccountID': AppData.Accounts.editedId(),
				'Folder': oFolder.fullName(),
				'SetAction': oFolder.subscribed() ? 0 : 1
			}
		;
	
		if (oFolder && oFolder.canSubscribe())
		{
			oFolder.subscribed(!oFolder.subscribed());
			App.Ajax.send(oParameters, this.onResponseFolderSubscribe, this);
		}
	};
	
	/**
	 * @param {Object} oFolder
	 * @param {Object} parent
	 */
	CSettingsViewModel.prototype.onDeleteFolderClick = function (oFolder, parent)
	{
		var
			sWarning = Utils.i18n('SETTINGS/ACCOUNT_FOLDERS_CONFIRMATION_DELETE'),
			collection = this.getCollectionFromParent(parent),
			fCallBack = _.bind(this.deleteFolder, this, oFolder, collection),
			oEmailAccountsViewModel = this.getViewModel(Enums.SettingsTab.EmailAccounts)
		;
		
		if (oFolder && oFolder.canDelete())
		{
			App.Screens.showPopup(ConfirmPopup, [sWarning, fCallBack]);
		}
		else if (oEmailAccountsViewModel)
		{
			oEmailAccountsViewModel.oAccountFolders.highlighted(true);
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CSettingsViewModel.prototype.onResponseFolderRename = function (oData, oParameters)
	{
		if (!oData.Result)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('SETTINGS/ERROR_SETTINGS_SAVING_FAILED'));
		}
		else
		{
			App.MailCache.getFolderList(AppData.Accounts.editedId());
		}
	};
	
	/**
	 * @param {Object} oFolder
	 */
	CSettingsViewModel.prototype.folderEditOnEnter = function (oFolder)
	{
		var
			oParameters = {
				'Action': 'FolderRename',
				'AccountID': AppData.Accounts.editedId(),
				'PrevFolderFullNameRaw': oFolder.fullName(),
				'NewFolderNameInUtf8': oFolder.nameForEdit()
			}
		;
		
		App.Ajax.send(oParameters, this.onResponseFolderRename, this);
		oFolder.name(oFolder.nameForEdit());
		oFolder.edited(false);
	};
	
	/**
	 * @param {Object} oFolder
	 */
	CSettingsViewModel.prototype.folderEditOnEsc = function (oFolder)
	{
		oFolder.edited(false);
	};
	
	/**
	 * @param {Object} parent
	 *
	 * @return {Function}
	 */
	CSettingsViewModel.prototype.getCollectionFromParent = function (parent)
	{
		return (parent.subfolders) ? parent.subfolders : parent.collection;
	};
	
	/**
	 * @param {Object} oFolder
	 * @param {number} iIndex
	 * @param {Object} parent
	 * 
	 * @return boolean
	 */
	CSettingsViewModel.prototype.canMoveFolderUp = function (oFolder, iIndex, parent)
	{
		var
			collection = this.getCollectionFromParent(parent),
			oPrevFolder = collection()[iIndex - 1],
			oPrevFolderFullName = ''
		;
		
		if (iIndex > 0 && oPrevFolder)
		{
			oPrevFolderFullName = collection()[iIndex - 1].fullName();
		}
	
		return (iIndex !== 0 && oFolder &&
			oFolder.fullName() !== App.MailCache.editedFolderList().inboxFolderFullName() &&
			App.MailCache.editedFolderList().inboxFolderFullName() !== oPrevFolderFullName);
	};
	
	/**
	 * @param {Object} oFolder
	 * @param {number} iIndex
	 * @param {Object} parent
	 * 
	 * @return boolean
	 */
	CSettingsViewModel.prototype.canMoveFolderDown = function (oFolder, iIndex, parent)
	{
		var collection = this.getCollectionFromParent(parent);
	
		return (iIndex !== collection().length - 1 &&
			oFolder.fullName() !== App.MailCache.editedFolderList().inboxFolderFullName());
	};
	
	/**
	 * @param {Object} oFolder
	 * @param {number} iIndex
	 * @param {Object} parent
	 */
	CSettingsViewModel.prototype.moveFolderUp = function (oFolder, iIndex, parent)
	{
		var 
			collection = this.getCollectionFromParent(parent)
		;
	
		if (this.canMoveFolderUp(oFolder, iIndex, parent) && collection)
		{
			collection.splice(iIndex, 1);
			collection.splice(iIndex - 1, 0, oFolder);
			this.folderListOrderUpdateDebounce();
		}
	};
	
	/**
	 * @param {Object} oFolder
	 * @param {number} iIndex
	 * @param {Object} parent
	 */
	CSettingsViewModel.prototype.moveFolderDown = function (oFolder, iIndex, parent)
	{
		var 
			collection = this.getCollectionFromParent(parent)
		;
		
		if (this.canMoveFolderDown(oFolder, iIndex, parent) && collection)
		{
			collection.splice(iIndex, 1);
			collection.splice(iIndex + 1, 0, oFolder);
			this.folderListOrderUpdateDebounce();
		}
	};
	
	CSettingsViewModel.prototype.folderListOrderUpdate = function ()
	{
		var
			options = App.MailCache.editedFolderList().getOptions(),
			aFolderList = _.map(options, function (oItem) {
				return (oItem && oItem.id)? oItem.id : null;
			}),
			oParameters = {
				'Action': 'FolderListOrderUpdate',
				'AccountID': AppData.Accounts.editedId(),
				'FolderList': _.compact(aFolderList)
			}
		;
	
		App.Ajax.send(oParameters, this.onResponseFolderListOrderUpdate, this);
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CSettingsViewModel.prototype.onResponseFolderListOrderUpdate = function (oData, oParameters)
	{
		if (!oData.Result)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('SETTINGS/ERROR_SETTINGS_SAVING_FAILED'));
		}
		else
		{
			App.MailCache.getFolderList(AppData.Accounts.editedId());
		}
	};
	
	
	
	/**
	 * @constructor
	 */
	function CCommonSettingsViewModel()
	{
		this.aSkins = AppData.App.Themes;
		this.selectedSkin = ko.observable(AppData.User.DefaultTheme);
	
		this.layout = ko.observable(AppData.User.Layout);
	
		this.aLanguages = AppData.App.Languages;
		this.selectedLanguage = ko.observable(AppData.User.DefaultLanguage);
	
		this.loading = ko.observable(false);
	
		this.rangeOfNumbers = [10, 20, 30, 50, 75, 100, 150, 200];
		
		this.messagesPerPageValues = ko.observableArray(this.rangeOfNumbers);
		this.messagesPerPage = ko.observable(this.rangeOfNumbers[0]);
		this.setMessagesPerPage(AppData.User.MailsPerPage);
		
		this.contactsPerPageValues = ko.observableArray(this.rangeOfNumbers);
		this.contactsPerPage = ko.observable(this.rangeOfNumbers[0]);
		this.setContactsPerPage(AppData.User.ContactsPerPage);
		
		this.autocheckmailInterval = ko.observable(AppData.User.autoCheckMailInterval());
		this.richText = ko.observable(AppData.User.DefaultEditor);
	
		this.timeFormat = ko.observable(AppData.User.defaultTimeFormat());
		this.aDateFormats = Utils.getDateFormatsForSelector();
		this.dateFormat = ko.observable(AppData.User.DefaultDateFormat);
	
		this.useThreads = ko.observable(AppData.User.useThreads());
		
		this.bAllowContacts = AppData.User.ShowContacts;
		this.bAllowCalendar = AppData.User.AllowCalendar;
		this.bAllowThreads = AppData.User.ThreadsEnabled;
		
		this.firstState = this.getState();
	}
	
	CCommonSettingsViewModel.prototype.TemplateName = 'Settings_CommonSettingsViewModel';
	
	CCommonSettingsViewModel.prototype.TabName = Enums.SettingsTab.Common;
	
	CCommonSettingsViewModel.prototype.TabTitle = Utils.i18n('SETTINGS/TAB_COMMON');
	
	/**
	 * @param {number} iMpp
	 */
	CCommonSettingsViewModel.prototype.setMessagesPerPage = function (iMpp)
	{
		var aValues = this.rangeOfNumbers;
		
		if (-1 === _.indexOf(aValues, iMpp))
		{
			aValues = _.sortBy(_.union(aValues, [iMpp]), function (oVal) {
				return oVal;
			}, this) ;
		}
		this.messagesPerPageValues(aValues);
		
		this.messagesPerPage(iMpp);
	};
	
	/**
	 * @param {number} iCpp
	 */
	CCommonSettingsViewModel.prototype.setContactsPerPage = function (iCpp)
	{
		var aValues = this.rangeOfNumbers;
		
		if (-1 === _.indexOf(aValues, iCpp))
		{
			aValues = _.sortBy(_.union(aValues, [iCpp]), function (oVal) {
				return oVal;
			}, this) ;
		}
		this.contactsPerPageValues(aValues);
		
		this.contactsPerPage(iCpp);
	};
	
	CCommonSettingsViewModel.prototype.init = function ()
	{
		this.selectedSkin(AppData.User.DefaultTheme);
		this.layout(AppData.User.Layout);
		this.selectedLanguage(AppData.User.DefaultLanguage);
		this.setMessagesPerPage(AppData.User.MailsPerPage);
		this.setContactsPerPage(AppData.User.ContactsPerPage);
		this.autocheckmailInterval(AppData.User.autoCheckMailInterval());
		this.richText(AppData.User.DefaultEditor);
		this.timeFormat(AppData.User.defaultTimeFormat());
		this.dateFormat(AppData.User.DefaultDateFormat);
		this.useThreads(AppData.User.useThreads());
	};
	
	CCommonSettingsViewModel.prototype.getState = function ()
	{
		var sState = [
			this.selectedSkin(),
			this.layout(), 
			this.selectedLanguage(),
			this.messagesPerPage(), 
			this.contactsPerPage(),
			this.autocheckmailInterval(),
			this.richText(),
			this.timeFormat(),
			this.dateFormat(),
			this.useThreads()
		];
		return sState.join(':');
	};
	
	CCommonSettingsViewModel.prototype.updateFirstState = function ()
	{
		this.firstState = this.getState();
	};
	
	CCommonSettingsViewModel.prototype.isChanged = function ()
	{
		if (this.firstState && this.getState() !== this.firstState)
		{
			return true;
		}
		else
		{
			return false;
		}
	};
	
	/**
	 * Parses the response from the server. If the settings are normally stored, then updates them. 
	 * Otherwise an error message.
	 * 
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CCommonSettingsViewModel.prototype.onResponse = function (oData, oParameters)
	{
		var bNeedReload = false;
	
		this.loading(false);
	
		if (oData.Result === false)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('SETTINGS/ERROR_SETTINGS_SAVING_FAILED'));
		}
		else
		{
			App.CalendarCache.calendarSettingsChanged(true);
	
			bNeedReload = (oParameters.DefaultTheme !== AppData.User.DefaultTheme ||
				oParameters.DefaultLanguage !== AppData.User.DefaultLanguage);
			
			if (bNeedReload)
			{
				window.location.reload();
			}
			else
			{
				this.setMessagesPerPage(oParameters.MailsPerPage);
				this.setContactsPerPage(oParameters.ContactsPerPage);
				
				AppData.User.updateCommonSettings(oParameters.MailsPerPage, oParameters.ContactsPerPage,
					oParameters.AutoCheckMailInterval, oParameters.DefaultEditor, oParameters.Layout,
					oParameters.DefaultTheme, oParameters.DefaultLanguage, oParameters.DefaultDateFormat,
					oParameters.DefaultTimeFormat, oParameters.UseThreads);
	
				App.Api.showReport(Utils.i18n('SETTINGS/COMMON_REPORT_UPDATED_SUCCESSFULLY'));
			}
		}
	};
	
	/**
	 * Sends a request to the server to save the settings.
	 */
	CCommonSettingsViewModel.prototype.onSaveClick = function ()
	{
		var
			oParameters = {
				'Action': 'UpdateUserSettings',
				'MailsPerPage': parseInt(this.messagesPerPage(), 10),
				'ContactsPerPage': parseInt(this.contactsPerPage(), 10),
				'AutoCheckMailInterval': parseInt(this.autocheckmailInterval(), 10),
				'DefaultEditor': parseInt(this.richText(), 10),
				'Layout': parseInt(this.layout(), 10),
				'DefaultTheme': this.selectedSkin(),
				'DefaultLanguage': this.selectedLanguage(),
				'DefaultDateFormat': this.dateFormat(),
				'DefaultTimeFormat': parseInt(this.timeFormat(), 10),
				'UseThreads': this.useThreads() ? '1' : '0'
			}
		;
	
		this.loading(true);
		this.updateFirstState();
		App.Ajax.send(oParameters, this.onResponse, this);
	};
	
	/**
	 * @constructor
	 */
	function CEmailAccountsSettingsViewModel()
	{
		this.accounts = AppData.Accounts.collection;
	
		this.currentAccountId = AppData.Accounts.currentId;
		this.editedAccountId = AppData.Accounts.editedId;
		this.defaultAccountId = AppData.Accounts.defaultId;
		this.defaultAccount = AppData.Accounts.getDefault(); //in future may be internal
	
		this.isAllowFetcher = !!AppData.App.AllowFetcher;
	
		this.oAccountProperties = new CAccountPropertiesViewModel(this);
		this.oAccountSignature = new CAccountSignatureViewModel(this);
		this.oAccountFilters = new CAccountFiltersViewModel(this);
		this.oAccountAutoresponder = new CAccountAutoresponderViewModel(this);
		this.oAccountForward = new CAccountForwardViewModel(this);
		this.oAccountFolders = new CAccountFoldersViewModel(this);
	
		this.oFetcherIncoming = new CFetcherIncomingViewModel(this);
		this.oFetcherOutgoing = new CFetcherOutgoingViewModel(this);
		this.oFetcherSignature = new CFetcherSignatureViewModel(this);
	
		this.fetcher = ko.observable(null);
		this.fetchers = ko.observable(null);
		this.firstFetcher = ko.observable(null);
		this.editedFetcherId = ko.observable(null);
	
		this.defaultAccount.fetchers.subscribe(function(oList) {
	
			if(!oList)
			{
				this.changeAccount(this.defaultAccountId());
			}
			else
			{
				var oFetchers = this.defaultAccount.fetchers(),
					oFirstFetcher = oFetchers.collection()[0],
					nFetcherId = oFirstFetcher.idFetcher(),
					isFetcherTAb = this.isFetcherTab(this.tab())
				;
	
				this.fetchers(oFetchers);
				this.firstFetcher(oFirstFetcher);
				if(this.editedFetcherId() && isFetcherTAb)
				{
					this.onChangeFetcher(this.editedFetcherId());
				}
				else if (isFetcherTAb)
				{
					this.editedFetcherId(nFetcherId);
					this.onChangeFetcher(nFetcherId);
				}
			}
		}, this);
	
		this.tab = ko.observable(Enums.AccountSettingsTab.Properties);
	
		this.allowUsersAddNewAccounts = AppData.App.AllowUsersAddNewAccounts;
		
		this.allowUsersChangeInterfaceSettings = AppData.App.AllowUsersChangeInterfaceSettings;
		
		this.allowAutoresponderExtension = ko.observable(false);
		this.allowForwardExtension = ko.observable(false);
		this.allowSieveFiltersExtension = ko.observable(false);
	
		this.changeAccount(this.editedAccountId());
	
	}
	
	CEmailAccountsSettingsViewModel.prototype.TemplateName = 'Settings_EmailAccountsSettingsViewModel';
	
	CEmailAccountsSettingsViewModel.prototype.TabName = Enums.SettingsTab.EmailAccounts;
	
	CEmailAccountsSettingsViewModel.prototype.TabTitle = Utils.i18n('SETTINGS/TAB_EMAIL_ACCOUNTS');
	
	/*CEmailAccountsSettingsViewModel.prototype.onShow = function ()
	{
	
	};*/
	
	CEmailAccountsSettingsViewModel.prototype.isChanged = function ()
	{
		return false;
	};
	
	/**
	 * @param {Array} aParams
	 */
	CEmailAccountsSettingsViewModel.prototype.onRoute = function (aParams)
	{
		var oAccount = AppData.Accounts.getEdited();
	
		if (oAccount)
		{
			if (_.isArray(aParams) && aParams.length > 1)
			{
				this.tab(aParams[1]);
			}
	
			this.confirmSaving(Enums.AccountSettingsTab.Properties);
			this.viewCurrentTab(aParams);
		}
	
		App.populateFetchers();
	};
	
	/**
	 * @param {string} sTab
	 * @param {boolean=} bAccountChange
	 * @param {?CAccountModel=} oAccount
	 */
	CEmailAccountsSettingsViewModel.prototype.confirmSaving = function (sTab, bAccountChange, oAccount)
	{
		var oCurrentViewModel = this.getViewModel(sTab),
			oParameters = {},
			sConfirm = Utils.i18n('SETTINGS/CONFIRM_SETTINGS_SAVE'),
			fAction = _.bind(function (bResult) {
				if (oCurrentViewModel)
				{
					if (bResult)
					{
						if (oCurrentViewModel.onSaveClick)
						{
							oCurrentViewModel.saveData(oParameters);
						}
					}
					else
					{
						oCurrentViewModel.updateFirstState();
					}
				}
			}, this);
	
		bAccountChange = Utils.isUnd(bAccountChange) ? false : bAccountChange;
		oAccount = Utils.isUnd(oAccount) ? null : oAccount;
		
		if (!bAccountChange && oCurrentViewModel && Utils.isFunc(oCurrentViewModel.isChanged) && oCurrentViewModel.isChanged())
		{
			oParameters = oCurrentViewModel.prepareParameters();
			App.Screens.showPopup(ConfirmPopup, [sConfirm, fAction]);
		}
	};
	
	/**
	 * @param {Array} aParams
	 */
	CEmailAccountsSettingsViewModel.prototype.onHide = function (aParams)
	{
		this.confirmSaving(this.tab());
	};
	
	/**
	 * @param {Array=} aParams
	 */
	CEmailAccountsSettingsViewModel.prototype.viewCurrentTab = function (aParams)
	{
		var
			oAccount = AppData.Accounts.getEdited(),
			oCurrentViewModel = null,
			isTabAllowed = this.isTabAllowed(this.tab(), oAccount)
		;
	
		if (oAccount)
		{
			if (isTabAllowed)
			{
				oCurrentViewModel = this.getCurrentViewModel();
	
				if (oCurrentViewModel)
				{
					if (Utils.isFunc(oCurrentViewModel.onHide))
					{
						oCurrentViewModel.onHide(aParams);
					}
					if (Utils.isFunc(oCurrentViewModel.onShow))
					{
						oCurrentViewModel.onShow(aParams, oAccount);
					}
				}
			}
			else
			{
				this.tab(Enums.AccountSettingsTab.Properties);
				App.Routing.replaceHash([Enums.Screens.Settings, Enums.SettingsTab.EmailAccounts, Enums.AccountSettingsTab.Properties]);
				this.editedFetcherId(null);
			}
		}
	};
	
	CEmailAccountsSettingsViewModel.prototype.getViewModel = function (sTab)
	{
		switch (sTab) 
		{
			case Enums.AccountSettingsTab.Folders:
				return this.oAccountFolders;
			case Enums.AccountSettingsTab.Filters:
				return this.oAccountFilters;
			case Enums.AccountSettingsTab.Forward:
				return this.oAccountForward;
			case Enums.AccountSettingsTab.Signature:
				return this.oAccountSignature;
			case Enums.AccountSettingsTab.Autoresponder:
				return this.oAccountAutoresponder;
			case Enums.AccountSettingsTab.FetcherInc:
				return this.oFetcherIncoming;
			case Enums.AccountSettingsTab.FetcherOut:
				return this.oFetcherOutgoing;
			case Enums.AccountSettingsTab.FetcherSig:
				return this.oFetcherSignature;
			default:
			case Enums.AccountSettingsTab.Properties:
				return this.oAccountProperties;
		}
	};
	
	CEmailAccountsSettingsViewModel.prototype.getCurrentViewModel = function ()
	{
		return this.getViewModel(this.tab());
	};
	
	CEmailAccountsSettingsViewModel.prototype.isTabAllowed = function (sTab, oAccount)
	{
		if (
			-1 === Utils.inArray(sTab, [
					Enums.AccountSettingsTab.Properties, Enums.AccountSettingsTab.Signature, Enums.AccountSettingsTab.Filters,
					Enums.AccountSettingsTab.Autoresponder, Enums.AccountSettingsTab.Forward, Enums.AccountSettingsTab.Folders,
					Enums.AccountSettingsTab.FetcherInc, Enums.AccountSettingsTab.FetcherOut, Enums.AccountSettingsTab.FetcherSig
				]) ||
			sTab === Enums.AccountSettingsTab.Filters && !oAccount.extensionExists('AllowSieveFiltersExtension') ||
			sTab === Enums.AccountSettingsTab.Forward && !oAccount.extensionExists('AllowForwardExtension') ||
			sTab === Enums.AccountSettingsTab.Autoresponder && !oAccount.extensionExists('AllowAutoresponderExtension')
		)
		{
			return false;
		}
	
		return true;
	};
	
	/**
	 * @param {string} sTab
	 */
	CEmailAccountsSettingsViewModel.prototype.onTabClick = function (sTab)
	{
		App.Routing.setHash([Enums.Screens.Settings, Enums.SettingsTab.EmailAccounts, sTab]);
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CEmailAccountsSettingsViewModel.prototype.onResponseAccountDelete = function (oData, oParameters)
	{
		if (!oData.Result)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('SETTINGS/ERROR_SETTINGS_SAVING_FAILED'));
		}
		else
		{
			AppData.Accounts.deleteAccount(oParameters.AccountIDToDelete);
			
			if (this.defaultAccountId() === oParameters.AccountIDToDelete)
			{
				App.Routing.setHash([]);
				window.location.reload();
			}
		}
	};
	
	CEmailAccountsSettingsViewModel.prototype.deleteAccount = function (iAccountId, bOkAnswer)
	{
		var
			oParameters = {
				'Action': 'AccountDelete',
				'AccountIDToDelete': iAccountId
			}
		;
		
		if (bOkAnswer)
		{
			App.Ajax.send(oParameters, this.onResponseAccountDelete, this);
		}
	};
		
	/**
	 * @param {number} iAccountId
	 */
	CEmailAccountsSettingsViewModel.prototype.onAccountDelete = function (iAccountId)
	{
		var
			sWarning = '',
			fCallBack = _.bind(this.deleteAccount, this, iAccountId),
			oAccount = AppData.Accounts.getAccount(iAccountId),
			sTitle = oAccount.email()
		;
		if (this.allowUsersChangeInterfaceSettings)
		{
			if (this.defaultAccountId() === iAccountId) {
				if (this.accounts().length === 1) {
					sWarning = Utils.i18n('SETTINGS/ACCOUNTS_CONFIRMATION_SINGLE_DEFAULT_DELETE');
				} else {
					sWarning = Utils.i18n('SETTINGS/ACCOUNTS_CONFIRMATION_DEFAULT_DELETE');
				}
			} else {
				sWarning = Utils.i18n('SETTINGS/ACCOUNTS_CONFIRMATION_DELETE');
			}
	
			App.Screens.showPopup(ConfirmPopup, [sWarning, fCallBack, sTitle]);
		}
	};
	
	CEmailAccountsSettingsViewModel.prototype.onEditedAccountDelete = function ()
	{
		var
			sWarning = '',
			fCallBack = _.bind(this.deleteAccount, this, this.editedAccountId()),
			oAccount = AppData.Accounts.getEdited(),
			sTitle = oAccount.email()
		;
	
		if (this.allowUsersChangeInterfaceSettings)
		{
			if (this.editedAccountId() === this.defaultAccountId()) {
				if (this.accounts().length === 1) {
					sWarning = Utils.i18n('SETTINGS/ACCOUNTS_CONFIRMATION_SINGLE_DEFAULT_DELETE');
				} else {
					sWarning = Utils.i18n('SETTINGS/ACCOUNTS_CONFIRMATION_DEFAULT_DELETE');
				}
			} else {
				sWarning = Utils.i18n('SETTINGS/ACCOUNTS_CONFIRMATION_DELETE');
			}
	
			App.Screens.showPopup(ConfirmPopup, [sWarning, fCallBack, sTitle]);
		}
	};
	
	/**
	 * 
	 */
	CEmailAccountsSettingsViewModel.prototype.onAccountAdd = function ()
	{
		App.Screens.showPopup(AccountCreatePopup, []);
	};
	
	/**
	 * @param {number} iAccountId
	 */
	CEmailAccountsSettingsViewModel.prototype.changeAccount = function (iAccountId)
	{
		var
			oAccount = null,
			oParameters = {
				'Action': 'AccountSettings',
				'AccountID': iAccountId
			}
		;
	
		if(this.isFetcherTab(this.tab())) {
			this.onTabClick(Enums.AccountSettingsTab.Properties);
		}
	
		this.confirmSaving(this.tab());
	
		oAccount = AppData.Accounts.getAccount(iAccountId);
		if (!Utils.isUnd(oAccount) && oAccount.isExtended())
		{
			this.populate(oAccount);
		}
		else
		{
			App.Ajax.send(oParameters, this.onAccountSettingsResponse, this);
		}
	
		this.editedFetcherId(null);
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CEmailAccountsSettingsViewModel.prototype.onAccountSettingsResponse = function (oData, oParameters)
	{
		if (!oData.Result)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('SETTINGS/ERROR_SETTINGS_SAVING_FAILED'));
		}
		else
		{
			var oAccount = AppData.Accounts.getAccount(oParameters.AccountID);
			if (!Utils.isUnd(oAccount))
			{
				oAccount.updateExtended(oData.Result);
				this.populate(oAccount);
			}	
		}
	};
	
	/**
	 * @param {Object} oAccount
	 */
	CEmailAccountsSettingsViewModel.prototype.populate = function (oAccount)
	{
		this.allowAutoresponderExtension(oAccount.extensionExists('AllowAutoresponderExtension'));
		this.allowForwardExtension(oAccount.extensionExists('AllowForwardExtension'));
		this.allowSieveFiltersExtension(oAccount.extensionExists('AllowSieveFiltersExtension'));
	
		AppData.Accounts.changeEditedAccount(oAccount.id());
		this.viewCurrentTab();
	};
	
	CEmailAccountsSettingsViewModel.prototype.onFetcherAdd = function (oModel, oEv)
	{
		oEv.stopPropagation();
		App.Screens.showPopup(FetcherAddPopup, []);
	};
	CEmailAccountsSettingsViewModel.prototype.fetcherDelete = function (nFetcherId, bOkAnswer)
	{
		var oParameters = {
			'Action': 'FetcherDelete',
			'FetcherID': nFetcherId
		};
	
		if (bOkAnswer)
		{
			App.Ajax.send(oParameters, this.onFetcherDeleteResponse, this);
		}
	};
	
	CEmailAccountsSettingsViewModel.prototype.onFetcherDelete = function (oData)
	{
		var
			sWarning = Utils.i18n('WARNING/FETCHER_DELETE_WARNING'),
			fCallBack = _.bind(this.fetcherDelete, this, oData.idFetcher()),
			sTitle = oData.incomingMailServer()
		;
	
		App.Screens.showPopup(ConfirmPopup, [sWarning, fCallBack, sTitle]);
	};
	
	CEmailAccountsSettingsViewModel.prototype.onFetcherDeleteResponse = function (oData, oParameters)
	{
		if (!oData.Result)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('WARNING/FETCHER_DELETING_ERROR'));
		}
		else
		{
			App.populateFetchers();
			this.editedFetcherId(null);
		}
	};
	
	CEmailAccountsSettingsViewModel.prototype.onChangeFetcher = function (nFetcherId)
	{
		var oFetcher = this.defaultAccount.fetchers().getFetcher(nFetcherId);
	//	var oFetcher = this.fetchers().getFetcher(nFetcherId);
	
		this.fetcher(oFetcher);
	
		if(!this.isFetcherTab(this.tab())) {
			this.onTabClick(Enums.AccountSettingsTab.FetcherInc);
		}
	
		this.confirmSaving(this.tab());
	
		this.oFetcherIncoming.populate(oFetcher);
		this.oFetcherOutgoing.populate(oFetcher);
		this.oFetcherSignature.populate(oFetcher);
	
		this.editedFetcherId(oFetcher.idFetcher());
	};
	
	CEmailAccountsSettingsViewModel.prototype.isFetcherTab = function (sTab)
	{
		switch (sTab)
		{
			case Enums.AccountSettingsTab.FetcherInc:
				return true;
			case Enums.AccountSettingsTab.FetcherOut:
				return true;
			case Enums.AccountSettingsTab.FetcherSig:
				return true;
			default: return false;
		}
	};
	
	/**
	 * @constructor
	 */
	function CCalendarSettingsViewModel()
	{
		this.showWeekends = ko.observable(AppData.User.CalendarShowWeekEnds);
	
		this.loading = ko.observable(false);
	
		this.availableTimes = ko.observableArray([
			{text: '00:00', value: '0'},
			{text: '01:00', value: '1'},
			{text: '02:00', value: '2'},
			{text: '03:00', value: '3'},
			{text: '04:00', value: '4'},
			{text: '05:00', value: '5'},
			{text: '06:00', value: '6'},
			{text: '07:00', value: '7'},
			{text: '08:00', value: '8'},
			{text: '09:00', value: '9'},
			{text: '10:00', value: '10'},
			{text: '11:00', value: '11'},
			{text: '12:00', value: '12'},
			{text: '13:00', value: '13'},
			{text: '14:00', value: '14'},
			{text: '15:00', value: '15'},
			{text: '16:00', value: '16'},
			{text: '17:00', value: '17'},
			{text: '18:00', value: '18'},
			{text: '19:00', value: '19'},
			{text: '20:00', value: '20'},
			{text: '21:00', value: '21'},
			{text: '22:00', value: '22'},
			{text: '23:00', value: '23'},
			{text: '24:00', value: '24'}
		]);
		this.selectedWorkdayStarts = ko.observable(AppData.User.CalendarWorkDayStarts);
		this.selectedWorkdayEnds = ko.observable(AppData.User.CalendarWorkDayEnds);
		
		this.showWorkday = ko.observable(AppData.User.CalendarShowWorkDay);
		this.weekStartsOn = ko.observable(AppData.User.CalendarWeekStartsOn);
		this.defaultTab = ko.observable(AppData.User.CalendarDefaultTab);
		
		this.firstState = this.getState();
	}
	
	CCalendarSettingsViewModel.prototype.TemplateName = 'Settings_CalendarSettingsViewModel';
	
	CCalendarSettingsViewModel.prototype.TabName = Enums.SettingsTab.Calendar;
	
	CCalendarSettingsViewModel.prototype.TabTitle = Utils.i18n('SETTINGS/TAB_CALENDAR');
	
	CCalendarSettingsViewModel.prototype.init = function()
	{
		this.showWeekends(AppData.User.CalendarShowWeekEnds);
		this.selectedWorkdayStarts(AppData.User.CalendarWorkDayStarts);
		this.selectedWorkdayEnds(AppData.User.CalendarWorkDayEnds);
		this.showWorkday(AppData.User.CalendarShowWorkDay);
		this.weekStartsOn(AppData.User.CalendarWeekStartsOn);
		this.defaultTab(AppData.User.CalendarDefaultTab);
	};
	
	CCalendarSettingsViewModel.prototype.getState = function()
	{
		var sState = [
			this.showWeekends(),
			this.selectedWorkdayStarts(),
			this.selectedWorkdayEnds(),
			this.showWorkday(),
			this.weekStartsOn(),
			this.defaultTab()
		];
		return sState.join(':');
	};
	
	CCalendarSettingsViewModel.prototype.updateFirstState = function()
	{
		this.firstState = this.getState();
	};
	
	CCalendarSettingsViewModel.prototype.isChanged = function()
	{
		if (this.firstState && this.getState() !== this.firstState)
		{
			return true;
		}
		else
		{
			return false;
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CCalendarSettingsViewModel.prototype.onResponse = function (oData, oParameters)
	{
		this.loading(false);
	
		if (oData.Result === false)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('SETTINGS/ERROR_CALENDAR_SETTINGS_SAVING_FAILED'));
		}
		else
		{
			App.CalendarCache.calendarSettingsChanged(true);
			
			AppData.User.updateCalendarSettings(oParameters.ShowWeekEnds, oParameters.ShowWorkDay, 
				oParameters.WorkDayStarts, oParameters.WorkDayEnds, oParameters.WeekStartsOn, oParameters.DefaultTab);
	
			App.Api.showReport(Utils.i18n('SETTINGS/COMMON_REPORT_UPDATED_SUCCESSFULLY'));
		}
	};
	
	CCalendarSettingsViewModel.prototype.onSaveClick = function ()
	{
		var
			oParameters = {
				'Action': 'UpdateUserSettings',
				'ShowWeekEnds': this.showWeekends() ? 1 : 0,
				'ShowWorkDay': this.showWorkday() ? 1 : 0,
				'WorkDayStarts': parseInt(this.selectedWorkdayStarts(), 10),
				'WorkDayEnds': parseInt(this.selectedWorkdayEnds(), 10),
				'WeekStartsOn': parseInt(this.weekStartsOn(), 10),
				'DefaultTab': parseInt(this.defaultTab(), 10)
			}
		;
	
		this.loading(true);
		this.updateFirstState();
		App.Ajax.send(oParameters, this.onResponse, this);
	};
	
	
	/**
	 * @constructor
	 */
	function CMobileSyncSettingsViewModel()
	{
		this.mobileSync = AppData.User.mobileSync;
		this.mobileSync.subscribe(this.onMobileSyncSubscribe, this);
		
		this.enableDav = ko.observable(false);
		
		this.davLogin = ko.observable('');
		this.davServer = ko.observable('');
		
		this.davCalendars = ko.observable([]);
		this.visibleCalendars = ko.computed(function () {
			return this.davCalendars().length > 0;
		}, this);
		
		this.davPersonalContactsUrl = ko.observable('');
		this.davCollectedAddressesUrl = ko.observable('');
		this.davGlobalAddressBookUrl = ko.observable('');
		
		this.bVisiblePersonalContacts = AppData.User.ShowPersonalContacts;
		this.bVisibleGlobalContacts = AppData.User.ShowGlobalContacts;
		this.bVisibleContacts = AppData.User.ShowContacts;
		this.bVisibleCalendar = AppData.User.AllowCalendar;
		this.bVisibleFiles = AppData.User.IsFilesSupported;
		this.bVisibleIosLink = ((navigator.platform.indexOf('iPhone') !== -1) ||
			(navigator.platform.indexOf('iPod') !== -1) ||
			(navigator.platform.indexOf('iPad') !== -1));
		
		this.visibleDavViaUrls = ko.computed(function () {
			return this.visibleCalendars() || this.bVisibleContacts;
		}, this);
	
		this.password = ko.observable(AppData.User.IsDemo ? AppData.User.MobileSyncDemoPass : 
			Utils.i18n('SETTINGS/MOBILE_DAVSYNC_PASSWORD_VALUE'));
		
		this.bChanged = false;
	}
	
	CMobileSyncSettingsViewModel.prototype.TemplateName = 'Settings_MobileSyncSettingsViewModel';
	
	CMobileSyncSettingsViewModel.prototype.TabName = Enums.SettingsTab.MobileSync;
	
	CMobileSyncSettingsViewModel.prototype.TabTitle = Utils.i18n('SETTINGS/TAB_MOBILE_SYNC');
	
	CMobileSyncSettingsViewModel.prototype.onRoute = function ()
	{
		AppData.User.requestSyncSettings();
	};
	
	CMobileSyncSettingsViewModel.prototype.onMobileSyncSubscribe = function ()
	{
		this.enableDav(AppData.User.MobileSyncEnable && this.mobileSync() && this.mobileSync()['EnableDav']);
		
		if (this.enableDav())
		{
			this.davLogin(this.mobileSync()['Dav']['Login']);
			this.davServer(this.mobileSync()['Dav']['Server']);
	
			this.davCalendars(this.mobileSync()['Dav']['Calendars']);
			
			this.davPersonalContactsUrl(this.mobileSync()['Dav']['PersonalContactsUrl']);
			this.davCollectedAddressesUrl(this.mobileSync()['Dav']['CollectedAddressesUrl']);
			this.davGlobalAddressBookUrl(this.mobileSync()['Dav']['GlobalAddressBookUrl']);
		}
	};
	
	
	/**
	 * @constructor
	 */
	function COutLookSyncSettingsViewModel()
	{
		this.outlookSync = AppData.User.outlookSync;
		this.outlookSync.subscribe(this.onOutlookSyncSubscribe, this);
		
		this.visibleOutlookSync = ko.observable(false);
		
		this.login = ko.observable('');
		this.server = ko.observable('');
		this.password = ko.observable(AppData.User.IsDemo ? AppData.User.OutlookSyncDemoPass : 
			Utils.i18n('SETTINGS/OUTLOOKSYNC_PASSWORD_VALUE'));
		
		this.bChanged = false;
	}
	
	COutLookSyncSettingsViewModel.prototype.TemplateName = 'Settings_OutLookSyncSettingsViewModel';
	
	COutLookSyncSettingsViewModel.prototype.TabName = Enums.SettingsTab.OutLookSync;
	
	COutLookSyncSettingsViewModel.prototype.TabTitle = Utils.i18n('SETTINGS/TAB_OUTLOOK_SYNC');
	
	COutLookSyncSettingsViewModel.prototype.onRoute = function ()
	{
		AppData.User.requestSyncSettings();
	};
	
	COutLookSyncSettingsViewModel.prototype.onOutlookSyncSubscribe = function ()
	{
		if (AppData.User.OutlookSyncEnable)
		{
			this.visibleOutlookSync(true);
	
			if (this.outlookSync())
			{
				this.login(this.outlookSync()['Login']);
				this.server(this.outlookSync()['Server']);
			}
		}
	};
	
	
	/**
	 * @param {?=} oParent
	 *
	 * @constructor
	 */ 
	function CAccountPropertiesViewModel(oParent)
	{
		this.allowUsersChangeInterfaceSettings = AppData.App.AllowUsersChangeInterfaceSettings;
		this.allowUsersChangeEmailSettings =  AppData.App.AllowUsersChangeEmailSettings;
		
		this.account = ko.observable(null);
	
		this.isInternal = ko.observable(true);
		this.isLinked = ko.observable(true);
		this.isDefault = ko.observable(false);
		this.friendlyName = ko.observable('');
		this.email = ko.observable('');
		this.incomingMailLogin = ko.observable('');
		this.incomingMailPassword = ko.observable('');
		this.incomingMailPort = ko.observable(0);
		this.incomingMailServer = ko.observable('');
		this.outgoingMailLogin = ko.observable('');
		this.outgoingMailPassword = ko.observable('');
		this.outgoingMailPort = ko.observable(0);
		this.outgoingMailServer = ko.observable('');
	
		this.loading = ko.observable(false);
	//	this.buttonTextTrigger = ko.observable(false);
	
		this.allowChangePassword = ko.observable(false);
		this.useSmtpAuthentication = ko.observable(false);
		
		this.incLoginFocused = ko.observable(false);
		this.incLoginFocused.subscribe(function () {
			if (this.incLoginFocused() && this.incomingMailLogin() === '')
			{
				this.incomingMailLogin(this.email());
			}
		}, this);
	
		this.outServerFocused = ko.observable(false);
		this.outServerFocused.subscribe(function () {
			if (this.outServerFocused() && this.outgoingMailServer() === '')
			{
				this.outgoingMailServer(this.incomingMailServer());
			}
		}, this);
	
		this.account.subscribe(function (oAccount) {
			this.populate(oAccount);
		}, this);
		
		this.firstState = null;
	}
	
	CAccountPropertiesViewModel.prototype.getState = function ()
	{
		var aState = [
			this.friendlyName(),
			this.email(),
			this.incomingMailLogin(),
			this.incomingMailPort(),
			this.incomingMailServer(),
			this.outgoingMailLogin(),
			this.outgoingMailPort(),
			this.outgoingMailServer(),
			this.useSmtpAuthentication()
		];
	
		return aState.join(':');
	};
	
	CAccountPropertiesViewModel.prototype.updateFirstState = function()
	{
		this.firstState = this.getState();
	};
	
	CAccountPropertiesViewModel.prototype.isChanged = function()
	{
		if (this.firstState && this.getState() !== this.firstState)
		{
			return true;
		}
		else
		{
			return false;
		}
	};
	
	/**
	 * @param {Object} oAccount
	 */
	CAccountPropertiesViewModel.prototype.populate = function (oAccount)
	{
		if (oAccount)
		{	
			this.allowChangePassword(oAccount.extensionExists('AllowChangePasswordExtension'));
	//		this.allowChangePassword(true);
	
			this.isInternal(oAccount.isInternal());
			this.isLinked(oAccount.isLinked());
			this.isDefault(oAccount.isDefault());
			this.useSmtpAuthentication(Utils.pInt(oAccount.outgoingMailAuth()) === 2 ? true : false);
			this.friendlyName(oAccount.friendlyName());
			this.email(oAccount.email());
			this.incomingMailLogin(oAccount.incomingMailLogin());
			this.incomingMailServer(oAccount.incomingMailServer());
			this.incomingMailPort(oAccount.incomingMailPort());
			this.outgoingMailServer(oAccount.outgoingMailServer());
			this.outgoingMailLogin(oAccount.outgoingMailLogin());
			this.outgoingMailPort(oAccount.outgoingMailPort());
	
			this.updateFirstState();
		}
		else
		{
			this.allowChangePassword(false);
	
			this.isLinked(true);
			this.useSmtpAuthentication(true);
			this.friendlyName('');
			this.email('');
			this.incomingMailLogin('');
			this.incomingMailServer('');
			this.incomingMailPort(143);
			this.outgoingMailServer('');
			this.outgoingMailLogin('');
			this.outgoingMailPort(25);
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CAccountPropertiesViewModel.prototype.onResponse = function (oData, oParameters)
	{
		this.loading(false);
	//	this.buttonTextTrigger(false);
	
		if (!oData.Result)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('SETTINGS/ERROR_SETTINGS_SAVING_FAILED'));
		}
		else
		{
			var
				iAccountId = Utils.pInt(oData.AccountID),
				oAccount = 0 < iAccountId ? AppData.Accounts.getAccount(iAccountId) : null
			;
	
			if (oAccount)
			{
				oAccount.updateExtended(oParameters);
				App.Api.showReport(Utils.i18n('SETTINGS/COMMON_REPORT_UPDATED_SUCCESSFULLY'));
			}
		}
	};
	
	/**
	 * @return Object
	 */
	CAccountPropertiesViewModel.prototype.prepareParameters = function ()
	{
		var
			oParameters = {
				'Action': 'UpdateAccountSettings',
				'AccountID': this.account().id(),
				'FriendlyName': this.friendlyName(),
				'Email': this.email(),
				'IncomingMailLogin': this.incomingMailLogin(),
				'IncomingMailServer': this.incomingMailServer(),
				'IncomingMailPort': Utils.pInt(this.incomingMailPort()),
				'OutgoingMailServer': this.outgoingMailServer(),
				'OutgoingMailLogin': this.outgoingMailLogin(),
				'OutgoingMailPort': Utils.pInt(this.outgoingMailPort()),
				'OutgoingMailAuth': this.useSmtpAuthentication() ? 2 : 0
			}
		;
		
		return oParameters;
	};
	
	/**
	 * @param {Object} oParameters
	 */
	CAccountPropertiesViewModel.prototype.saveData = function (oParameters)
	{
		this.updateFirstState();
		App.Ajax.send(oParameters, this.onResponse, this);
	};
	
	/**
	 * Sends a request to the server to save the settings.
	 */
	CAccountPropertiesViewModel.prototype.onSaveClick = function ()
	{
		if (this.account())
		{
			this.loading(true);
			//this.buttonTextTrigger(true);
	
			this.saveData(this.prepareParameters());
		}
	};
	
	CAccountPropertiesViewModel.prototype.onChangePasswordClick = function ()
	{
		App.Screens.showPopup(ChangePasswordPopup, [false]);
	};
	
	/**
	 * @param {Object} oParams
	 * @param {Object} oAccount
	 */
	CAccountPropertiesViewModel.prototype.onShow = function (oParams, oAccount)
	{
		this.account(oAccount);
	};
	
	/**
	 * @param {?=} oParent
	 *
	 * @constructor
	 */ 
	function CAccountFoldersViewModel(oParent)
	{
		this.parent = oParent;
	
		this.highlighted = ko.observable(false).extend({'autoResetToFalse': 500});
	
		this.collection = ko.observableArray(App.MailCache.editedFolderList().collection());
	
		this.totalMessageCount = ko.computed(function () {
			return App.MailCache.editedFolderList().totalMessageCount();
		}, this);
		
		this.enableButtons = ko.computed(function (){
			return App.MailCache.editedFolderList().bInitialized();
		}, this);
		
		App.MailCache.editedFolderList.subscribe(function(value){
			this.collection(value.collection());
		}, this);
		
		this.addNewFolderCommand = Utils.createCommand(this, this.onAddNewFolderClick, this.enableButtons);
		this.systemFoldersCommand = Utils.createCommand(this, this.onSystemFoldersClick, this.enableButtons);
		
		this.showMovedWithMouseItem = ko.computed(function () {
			var oAccount = AppData.Accounts.getEdited();
			return !bMobileDevice && !oAccount.extensionExists('DisableFoldersManualSort');
		}, this);
	}
	
	/**
	 * @return {boolean}
	 */
	CAccountFoldersViewModel.prototype.isChanged = function ()
	{
		return false;
	};
	
	CAccountFoldersViewModel.prototype.onAddNewFolderClick = function ()
	{
		App.Screens.showPopup(FolderCreatePopup);
	};
	
	CAccountFoldersViewModel.prototype.onSystemFoldersClick = function ()
	{
		App.Screens.showPopup(SystemFoldersPopup);
	};
	/**
	 * @param {?=} oParent
	 *
	 * @constructor
	 */ 
	function CAccountSignatureViewModel(oParent)
	{
		this.parent = oParent;
	
		this.account = ko.observable(null);
	
		this.type = ko.observable(false);
		this.options = ko.observable(0);
		this.signature = ko.observable('');
	
		this.loading = ko.observable(false);
	
		this.account.subscribe(function () {
			this.getSignature();
		}, this);
		
		this.oHtmlEditor = new CHtmlEditorViewModel(false);
	
		this.isEnabled = ko.observable(true);
		this.isEnabled.subscribe(function (bState) {
			this.oHtmlEditor.stateSwitcher(bState);
		}, this);
	
		this.signature.subscribe(function () {
			this.oHtmlEditor.setText(this.signature());
		}, this);
		
		AppData.Accounts.editedId.subscribe(function () {
			this.account(AppData.Accounts.getEdited());
		}, this);
		
		this.getSignature();
		
		this.firstState = null;
	}
	
	CAccountSignatureViewModel.prototype.getState = function ()
	{
		var aState = [
			this.type(),
			this.options(),
			this.oHtmlEditor.getText()
		];
		return aState.join(':');
	};
	
	CAccountSignatureViewModel.prototype.updateFirstState = function ()
	{
		this.firstState = this.getState();
	};
	
	CAccountSignatureViewModel.prototype.isChanged = function ()
	{
		if (this.firstState && this.getState() !== this.firstState)
		{
			return true;
		}
		else
		{
			return false;
		}
	};
		
	CAccountSignatureViewModel.prototype.getSignature = function ()
	{
		if (this.account())
		{
			if (this.account().signature() !== null)
			{
				this.type(this.account().signature().type());
				this.options(this.account().signature().options());
				this.signature(this.account().signature().signature());
			}
			else
			{
				var
					oParameters = {
						'Action': 'AccountSignature',
						'AccountID': this.account().id()
					}
				;
				
				App.Ajax.send(oParameters, this.onSignatureResponse, this);
			}
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CAccountSignatureViewModel.prototype.onSignatureResponse = function (oData, oParameters)
	{
		var
			oSignature = null,
			iAccountId = parseInt(oData.AccountID, 10)
		;
		
		if (!oData.Result)
		{
			App.Api.showErrorByCode(oData.ErrorCode);
		}
		else
		{
			if (this.account() && iAccountId === this.account().id())
			{
				oSignature = new CSignatureModel();
				oSignature.parse(iAccountId, oData.Result);
	
				this.account().signature(oSignature);
	
				this.type(this.account().signature().type());
				this.options(this.account().signature().options());
				this.signature(this.account().signature().signature());
			}
		}
	};
	
	CAccountSignatureViewModel.prototype.prepareParameters = function ()
	{
		var
			oParameters = {
				'Action': 'UpdateAccountSignature',
				'AccountID': this.account().id(),
				'Type': this.type() ? 1 : 0,
				'Options': this.options(),
				'Signature': this.signature()
			}
		;
		
		return oParameters;
	};
	
	/**
	 * @param {Object} oParameters
	 */
	CAccountSignatureViewModel.prototype.saveData = function (oParameters)
	{
		this.updateFirstState();
		App.Ajax.send(oParameters, this.onResponse, this);
	};
	
	CAccountSignatureViewModel.prototype.onSaveClick = function ()
	{
		if (this.account())
		{
			this.loading(true);
	
			this.signature(this.oHtmlEditor.getText());
			
			this.account().signature().type(this.type());
			this.account().signature().options(this.options());
			this.account().signature().signature(this.signature());
			
			this.saveData(this.prepareParameters());
		}
	};
	
	/**
	 * Parses the response from the server. If the settings are normally stored, then updates them. 
	 * Otherwise an error message.
	 * 
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CAccountSignatureViewModel.prototype.onResponse = function (oData, oParameters)
	{
		this.loading(false);
	
		if (oData.Result)
		{
			App.Api.showReport(Utils.i18n('SETTINGS/COMMON_REPORT_UPDATED_SUCCESSFULLY'));
		}
		else
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('SETTINGS/ERROR_SETTINGS_SAVING_FAILED'));
		}
	};
	
	/**
	 * @param {Array} aParams
	 * @param {Object} oAccount
	 */
	CAccountSignatureViewModel.prototype.onShow = function (aParams, oAccount)
	{
		this.account(oAccount);
	
		this.oHtmlEditor.initCrea(this.signature(), '');
		this.oHtmlEditor.setActivitySource(this.options);
		this.updateFirstState();
	};
	
	
	/**
	 * @param {?=} oParent
	 *
	 * @constructor
	 */
	function CAccountForwardViewModel(oParent)
	{
		this.account = ko.observable(null);
		this.available = ko.observable(false);
		this.loading = ko.observable(false);
	
		this.enable = ko.observable(false);
		this.email = ko.observable('');
	
		this.available = ko.computed(function () {
			var oAccount = this.account();
			return oAccount && oAccount.forward();
		}, this);
	
		this.account.subscribe(function () {
			this.getForward();
		}, this);
		
		this.firstState = null;
	}
	
	CAccountForwardViewModel.prototype.getState = function ()
	{
		var aState = [
			this.enable(),
			this.email()
		];
		
		return aState.join(':');
	};
	
	CAccountForwardViewModel.prototype.updateFirstState = function ()
	{
		this.firstState = this.getState();
	};
	
	CAccountForwardViewModel.prototype.isChanged = function()
	{
		if (this.firstState && this.getState() !== this.firstState)
		{
			return true;
		}
		else
		{
			return false;
		}
	};
	
	/**
	 * @param {Object} oResult
	 * @param {Object} oRequest
	 */
	CAccountForwardViewModel.prototype.onResponse = function (oResult, oRequest)
	{
		this.loading(false);
	
		if (oRequest && oRequest.Action)
		{
			if ('GetForward' === oRequest.Action)
			{
				if (oResult && oResult.Result && oResult.AccountID && this.account())
				{
					var
						oAccount = null,
						oForward = new CForwardModel(),
						iAccountId = Utils.pInt(oResult.AccountID)
					;
	
					if (iAccountId)
					{
						oAccount = AppData.Accounts.getAccount(iAccountId);
						if (oAccount)
						{
							oForward.parse(iAccountId, oResult.Result);
							oAccount.forward(oForward);
							
							this.enable(oAccount.forward().enable);
							this.email(oAccount.forward().email);
							
							this.updateFirstState();
	
							if (iAccountId === this.account().id())
							{
								this.account.valueHasMutated();
							}
						}
					}
				}
			}
			else if ('UpdateForward' === oRequest.Action)
			{
				if (oResult && oResult.Result)
				{
					App.Api.showReport(Utils.i18n('SETTINGS/ACCOUNT_FORWARD_SUCCESS_REPORT'));
				}
				else
				{
					App.Api.showErrorByCode(oResult.ErrorCode, Utils.i18n('SETTINGS/ERROR_SETTINGS_SAVING_FAILED'));
				}
			}
		}
		else
		{
			App.Api.showError(Utils.i18n('WARNING/UNKNOWN_ERROR'));
		}
	};
	
	CAccountForwardViewModel.prototype.prepareParameters = function ()
	{
		var
			oParameters = {
				'Action': 'UpdateForward',
				'AccountID': this.account().id(),
				'Enable': this.enable() ? '1' : '0',
				'Email': this.email()
			}
		;
		return oParameters;
	};
	
	/**
	 * @param {Object} oParameters
	 */
	CAccountForwardViewModel.prototype.saveData = function (oParameters)
	{
		this.updateFirstState();
		App.Ajax.send(oParameters, this.onResponse, this);
	};
	
	CAccountForwardViewModel.prototype.onSaveClick = function ()
	{
		if (this.account())
		{
			var
				oForward = this.account().forward()
			;
	
			if (oForward)
			{
				oForward.enable = this.enable();
				oForward.email = this.email();
			}
	
			this.loading(true);
			this.saveData(this.prepareParameters());
		}
	};
	
	CAccountForwardViewModel.prototype.getForward = function()
	{
		if (this.account())
		{
			if (this.account().forward() !== null)
			{
				this.enable(this.account().forward().enable);
				this.email(this.account().forward().email);
				this.firstState = this.getState();
			}
			else
			{
				var
					oParameters = {
						'Action': 'GetForward',
						'AccountID': this.account().id()
					}
				;
	
				this.loading(true);
				this.updateFirstState();
				App.Ajax.send(oParameters, this.onResponse, this);
			}
		}
	};
	
	/**
	 * @param {Array} aParams
	 * @param {Object} oAccount
	 */
	CAccountForwardViewModel.prototype.onShow = function (aParams, oAccount)
	{
		this.account(oAccount);
	};
	
	/**
	 * @param {?=} oParent
	 *
	 * @constructor
	 */ 
	function CAccountAutoresponderViewModel(oParent)
	{
		this.account = ko.observable(null);
		this.available = ko.observable(false);
		this.loading = ko.observable(false);
	
		this.enable = ko.observable(false);
		this.subject = ko.observable('');
		this.message = ko.observable('');
	
		this.available = ko.computed(function () {
			var oAccount = this.account();
			return oAccount && oAccount.autoresponder();
		}, this);
	
		this.account.subscribe(function () {
			this.getAutoresponder();
		}, this);
		
		this.firstState = null;
	}
	
	CAccountAutoresponderViewModel.prototype.getState = function ()
	{
		var aState = [
			this.enable(),
			this.subject(),
			this.message()	
		];
		
		return aState.join(':');
	};
	
	CAccountAutoresponderViewModel.prototype.updateFirstState = function ()
	{
		this.firstState = this.getState();
	};
	
	CAccountAutoresponderViewModel.prototype.isChanged = function()
	{
		if (this.firstState && this.getState() !== this.firstState)
		{
			return true;
		}
		else
		{
			return false;
		}
	};
	
	/**
	 * @param {Object} oResult
	 * @param {Object} oRequest
	 */
	CAccountAutoresponderViewModel.prototype.onResponse = function (oResult, oRequest)
	{
		this.loading(false);
	
		if (oRequest && oRequest.Action)
		{
			if ('GetAutoresponder' === oRequest.Action)
			{
				if (oResult && oResult.Result && oResult.AccountID && this.account())
				{
					var
						oAccount = null,
						oAutoresponder = new CAutoresponderModel(),
						iAccountId = Utils.pInt(oResult.AccountID)
					;
	
					if (iAccountId)
					{
						oAccount = AppData.Accounts.getAccount(iAccountId);
						if (oAccount)
						{
							oAutoresponder.parse(iAccountId, oResult.Result);
							oAccount.autoresponder(oAutoresponder);
	
							if (iAccountId === this.account().id())
							{
								this.account.valueHasMutated();
							}
						}
					}
				}
			}
			else if ('UpdateAutoresponder' === oRequest.Action)
			{
				if (oResult && oResult.Result)
				{
					App.Api.showReport(Utils.i18n('SETTINGS/ACCOUNT_AUTORESPONDER_SUCCESS_REPORT'));
				}
				else
				{
					App.Api.showErrorByCode(oResult.ErrorCode, Utils.i18n('SETTINGS/ERROR_SETTINGS_SAVING_FAILED'));
				}
			}
		}
		else
		{
			App.Api.showError(Utils.i18n('WARNING/UNKNOWN_ERROR'));
		}
	};
	
	CAccountAutoresponderViewModel.prototype.prepareParameters = function ()
	{
		var
			oParameters = {
				'Action': 'UpdateAutoresponder',
				'AccountID': this.account().id(),
				'Enable': this.enable() ? '1' : '0',
				'Subject': this.subject(),
				'Message': this.message()
			}
		;
		
		return oParameters;
	};
	
	/**
	 * @param {Object} oParameters
	 */
	CAccountAutoresponderViewModel.prototype.saveData = function (oParameters)
	{
		this.updateFirstState();
		App.Ajax.send(oParameters, this.onResponse, this);
	};
	
	CAccountAutoresponderViewModel.prototype.onSaveClick = function ()
	{
		if (this.account())
		{
			var
				oAutoresponder = this.account().autoresponder()
			;
	
			if (oAutoresponder)
			{
				oAutoresponder.enable = this.enable();
				oAutoresponder.subject = this.subject();
				oAutoresponder.message = this.message();
			}
	
			this.loading(true);
			
			this.saveData(this.prepareParameters());
		}
	};
	
	CAccountAutoresponderViewModel.prototype.getAutoresponder = function()
	{
		if (this.account())
		{
			if (this.account().autoresponder() !== null)
			{
				this.enable(this.account().autoresponder().enable);
				this.subject(this.account().autoresponder().subject);
				this.message(this.account().autoresponder().message);
				
				this.updateFirstState();
			}
			else
			{
				var
					oParameters = {
						'Action': 'GetAutoresponder',
						'AccountID': this.account().id()
					}
				;
	
				this.loading(true);
				App.Ajax.send(oParameters, this.onResponse, this);
			}
		}
	};
	
	/**
	 * @param {Array} aParams
	 * @param {Object} oAccount
	 */
	CAccountAutoresponderViewModel.prototype.onShow = function (aParams, oAccount)
	{
		this.account(oAccount);
	};
	
	
	/**
	 * @param {?=} oParent
	 * 
	 * @constructor
	 */
	function CAccountFiltersViewModel(oParent)
	{
		this.account = ko.observable(null);
		
		this.folderList = ko.observable(App.MailCache.editedFolderList());
		
		App.MailCache.editedFolderList.subscribe(function(list) {
			this.folderList(list);
		}, this);
	
		this.foldersOptions = ko.computed(function () {
			return this.folderList() ? this.folderList().getOptions(Utils.i18n('SETTINGS/ACCOUNT_FOLDERS_NOT_SELECTED'), true, true) : [];
		}, this);
		
		this.available = ko.observable(false);
		this.loading = ko.observable(false);
		this.collection = ko.observableArray([]);
	
		this.available = ko.computed(function () {
			var oAccount = this.account();
			return !!(oAccount && oAccount.filters());
		}, this);
	
		this.account.subscribe(function () {
			this.getFilters();
		}, this);
		
		this.fieldOptions = [
			{'text': Utils.i18n('SETTINGS/ACCOUNT_FILTERS_FIELD_FROM'), 'value': 0},
			{'text': Utils.i18n('SETTINGS/ACCOUNT_FILTERS_FIELD_TO'), 'value': 1},
			{'text': Utils.i18n('SETTINGS/ACCOUNT_FILTERS_FIELD_SUBJECT'), 'value': 2}
		];
	
		this.conditionOptions = [
			{'text': Utils.i18n('SETTINGS/ACCOUNT_FILTERS_COND_CONTAIN_SUBSTR'), 'value': 0},
			{'text': Utils.i18n('SETTINGS/ACCOUNT_FILTERS_COND_EQUAL_TO'), 'value': 1},
			{'text': Utils.i18n('SETTINGS/ACCOUNT_FILTERS_COND_NOT_CONTAIN_SUBSTR'), 'value': 2}
		];
	
		this.actionOptions = [
			{'text': Utils.i18n('SETTINGS/ACCOUNT_FILTERS_ACTION_MOVE'), 'value': 3},
			{'text': Utils.i18n('SETTINGS/ACCOUNT_FILTERS_ACTION_DELETE'), 'value': 1}
		];
		
		this.phaseArray = [''];
		
		_.each(Utils.i18n('SETTINGS/ACCOUNT_FILTERS_PHRASE').split(/\s/), function(item) {
			var index = this.phaseArray.length - 1;
			if (item.substr(0,1) === '%' || this.phaseArray[index].substr(-1,1) === '%') {
				this.phaseArray.push(item);
			} else {
				this.phaseArray[index] += ' ' + item;
			}
		}, this);
		
		this.firstState = null;
	}
	
	CAccountFiltersViewModel.prototype.getState = function ()
	{
		var sResult = ':',		
			aState = _.map(this.collection(), function(value){ 
			return value.toString(); 
		}, this);
		if (aState.length > 0)
		{
			sResult = aState.join(':');
		}
		return sResult;
	};
	
	CAccountFiltersViewModel.prototype.updateFirstState = function ()
	{
		this.firstState = this.getState();
	};
	
	CAccountFiltersViewModel.prototype.isChanged = function()
	{
		if (this.firstState && this.getState() !== this.firstState)
		{
			return true;
		}
		else
		{
			return false;
		}
	};
	
	/**
	 * @param {Object} oResult
	 * @param {Object} oRequest
	 */
	CAccountFiltersViewModel.prototype.onResponse = function (oResult, oRequest)
	{
		this.loading(false);
		if (oRequest && oRequest.Action)
		{
			if ('GetSieveFilters' === oRequest.Action)
			{
	
				if (oResult && oResult.Result && oResult.AccountID && this.account())
				{
					var
						oAccount = null,
						oSieveFilters = new CSieveFiltersModel(),
						iAccountId = Utils.pInt(oResult.AccountID)
					;
	
					if (iAccountId)
					{
						oAccount = AppData.Accounts.getAccount(iAccountId);
						if (oAccount)
						{
							oSieveFilters.parse(iAccountId, oResult.Result);
							oAccount.filters(oSieveFilters);
							
							if (iAccountId === this.account().id())
							{
								this.account.valueHasMutated();
							}
						}
					}
				}
			}
			else if ('UpdateSieveFilters' === oRequest.Action)
			{
				if (oResult && oResult.Result)
				{
					App.Api.showReport(Utils.i18n('SETTINGS/ACCOUNT_FILTERS_SUCCESS_REPORT'));
				}
				else
				{
					App.Api.showError(Utils.i18n('SETTINGS/ERROR_SETTINGS_SAVING_FAILED'));
				}
			}
		}
		else
		{
			App.Api.showError(Utils.i18n('WARNING/UNKNOWN_ERROR'));
		}
	};
	
	CAccountFiltersViewModel.prototype.prepareParameters = function ()
	{
		var
			aFilters =_.map(this.collection(), function (oItem) {
				return {
					'Enable': oItem.enable() ? '1' : '0',
					'Field': oItem.field(),
					'Filter': oItem.filter(),
					'Condition': oItem.condition(),
					'Action': oItem.action(),
					'FolderFullName': oItem.folder()
				};
			}),
			oParameters = {
				'Action': 'UpdateSieveFilters',
				'AccountID': this.account().id(),
				'Filters': aFilters
			}
		;
		
		return oParameters;
	};
	
	/**
	 * @param {Object} oParameters
	 */
	CAccountFiltersViewModel.prototype.saveData = function (oParameters)
	{
		this.updateFirstState();
		App.Ajax.send(oParameters, this.onResponse, this);
	};
	
	CAccountFiltersViewModel.prototype.onSaveClick = function ()
	{
		if (this.account())
		{
			this.loading(true);
			this.saveData(this.prepareParameters());
		}
	};
	
	CAccountFiltersViewModel.prototype.getFilters = function()
	{
		if (this.account())
		{
			if (this.account().filters() !== null)
			{
				this.collection(this.account().filters().collection());
				this.updateFirstState();
			}
			else
			{
				var
					oParameters = {
						'Action': 'GetSieveFilters',
						'AccountID': this.account().id()
					}
				;
	
				this.loading(true);
				App.Ajax.send(oParameters, this.onResponse, this);
			}
		}
	};
	
	/**
	 * @param {Array} aParams
	 * @param {Object} oAccount
	 */
	CAccountFiltersViewModel.prototype.onShow = function (aParams, oAccount)
	{
		this.account(oAccount);
	};
	
	/**
	 * @param {Object} oFilterToDelete
	 */
	CAccountFiltersViewModel.prototype.deleteFilter = function (oFilterToDelete)
	{
		this.collection.remove(oFilterToDelete);
	};
	
	CAccountFiltersViewModel.prototype.addFilter = function ()
	{
		if (this.account())
		{
			var oSieveFilter =  new CSieveFilterModel(this.account().id());
			this.collection.push(oSieveFilter);
		}
	};
	
	/**
	 * @param {string} sPart
	 * @param {string} sPrefix
	 * 
	 * @return {string}
	 */
	CAccountFiltersViewModel.prototype.displayFilterPart = function (sPart, sPrefix)
	{
		var sTemplate = '';
		if (sPart === '%FIELD%')
		{
			sTemplate = 'Field';
		}
		else if (sPart === '%CONDITION%')
		{
			sTemplate = 'Condition';
		}
		else if (sPart === '%STRING%')
		{
			sTemplate = 'String';
		}
		else if (sPart === '%ACTION%')
		{
			sTemplate = 'Action';
		}
		else if (sPart === '%FOLDER%')
		{
			sTemplate = 'Folder';
		}
		else if (sPart.substr(0, 9) === '%DEPENDED')
		{
			sTemplate = 'DependedText';
		}
		else
		{
			sTemplate = 'Text';
		}
	
		return sPrefix + sTemplate;
	};
	
	/**
	 * @param {string} sText
	 */
	CAccountFiltersViewModel.prototype.getDependedText = function (sText)
	{	
		sText = Utils.pString(sText);
		
		if (sText) {
			sText = sText.replace(/%/g, '').split('=')[1] || '';
		}
		
		return sText;
	};
	
	/**
	 * @param {string} sText
	 * @param {Object} oParent
	 */
	CAccountFiltersViewModel.prototype.getDependedField = function (sText, oParent)
	{	
		sText = Utils.pString(sText);
		
		if (sText)
		{
			sText = sText.replace(/[=](.*)/g, '').split('-')[1] || '';
			sText = sText.toLowerCase();
		}
	
		return Utils.isUnd(oParent[sText]) ? false : oParent[sText]();
	};
	
	
	/**
	 * @constructor
	 */
	function CFetcherIncomingViewModel(oParent)
	{
		this.defaultAccountId = AppData.Accounts.defaultId;
		this.folderList = App.MailCache.folderList;
	
		this.loading = ko.observable(false);
	
		this.fetcher = ko.observable(null);
	
		this.idFetcher = ko.observable(null);
	
		this.isEnabled = ko.observable(true);
	
		this.incomingMailServer = ko.observable('');
		this.incomingMailPort = ko.observable(110);
		this.incomingMailLogin = ko.observable('');
		this.incomingMailPassword = ko.observable('');
	
		this.folder = ko.observable('');
	
		this.options = ko.computed(function(){
			return this.folderList().getOptions(undefined, true); //.getOptions(Utils.i18n('SETTINGS/ACCOUNT_FOLDERS_NO_PARENT'), true);
		}, this);
	
		this.leaveMessagesOnServer = ko.observable(false);
	
		this.folderList.subscribe(function () {
			this.folder((this.fetcher()) ? this.fetcher().folder() : '');
		}, this);
	
		this.serverIsSelected = ko.observable(false);
		this.loginIsSelected = ko.observable(false);
		this.passwordIsSelected = ko.observable(false);
	
		this.defaultOptionsAfterRender = Utils.defaultOptionsAfterRender;
	}
	
	CFetcherIncomingViewModel.prototype.onSaveClick = function ()
	{
		if (this.isEmptyRequiredFields())
		{
			App.Api.showErrorByCode(0, Utils.i18n('WARNING/FETCHER_CREATE_ERROR'));
		}
		else
		{
			var oParameters = {
				'Action': "FetcherUpdate",
				'AccountID': this.defaultAccountId(),
				'FetcherID': this.idFetcher(),
				'IsEnabled': this.isEnabled() ? 1 : 0,
				'Folder': this.folder(),
	//			'IncomingMailServer': this.incomingMailServer(),
	//			'IncomingMailPort': parseInt(this.incomingMailPort(), 10),
	//			'IncomingMailLogin': this.incomingMailLogin(),
				'IncomingMailPassword': (this.incomingMailPassword() === '') ? '******' : this.incomingMailPassword(),
				'LeaveMessagesOnServer': this.leaveMessagesOnServer() ? 1 : 0
			};
	
			this.loading(true);
	
			App.Ajax.send(oParameters, this.onSaveFetcherResponse, this);
		}
	};
	CFetcherIncomingViewModel.prototype.onSaveFetcherResponse = function (oData, oParameters)
	{
		this.loading(false);
	
		if (!oData.Result)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('WARNING/UNKNOWN_ERROR'));
		}
		else
		{
			App.populateFetchers();
			App.Api.showReport(Utils.i18n('SETTINGS/ACCOUNT_FETCHER_SUCCESSFULLY_SAVED'));
		}
	};
	
	CFetcherIncomingViewModel.prototype.populate = function (oFetcher)
	{
		if (oFetcher)
		{
			this.fetcher(oFetcher);
	
			this.idFetcher(oFetcher.idFetcher());
	
			this.isEnabled(oFetcher.isEnabled());
	
			this.folder(oFetcher.folder());
			this.incomingMailServer(oFetcher.incomingMailServer());
			this.incomingMailPort(oFetcher.incomingMailPort());
			this.incomingMailLogin(oFetcher.incomingMailLogin());
			this.incomingMailPassword('******');
			this.leaveMessagesOnServer(oFetcher.leaveMessagesOnServer());
		}
	};
	CFetcherIncomingViewModel.prototype.isEmptyRequiredFields = function ()
	{
		switch ('')
		{
			case this.incomingMailServer():
				this.serverIsSelected(true);
				return true;
			case this.incomingMailLogin():
				this.loginIsSelected(true);
				return true;
			case this.incomingMailPassword():
				this.passwordIsSelected(true);
				return true;
			default: return false;
		}
	};
	
	/**
	 * @constructor
	 */
	function CFetcherOutgoingViewModel(oParent)
	{
		this.defaultAccountId = AppData.Accounts.defaultId;
	
		this.loading = ko.observable(false);
	
	//	this.incomingIsEnabled = oParent.oFetcherIncoming.isEnabled;
	
		this.fetcher = ko.observable(null);
	
		this.idFetcher = ko.observable(null);
	
		this.isEnabled = ko.observable(true);
	//	this.incomingIsEnabled.subscribe(function (bState) {
	//		this.isEnabled(bState)
	//	}, this);
	
		this.email = ko.observable('');
		this.userName = ko.observable('');
		this.isOutgoingEnabled = ko.observable(false);
	
		this.outgoingMailServer = ko.observable('');
		this.outgoingMailPort = ko.observable(25);
		this.outgoingMailAuth = ko.observable(false);
	
		this.serverIsSelected = ko.observable(false);
	}
	
	CFetcherOutgoingViewModel.prototype.onSaveClick = function ()
	{
		if (this.outgoingMailAuth() && this.isEmptyRequiredFields())
		{
			App.Api.showErrorByCode(0, Utils.i18n('WARNING/FETCHER_CREATE_ERROR'));
		}
		else
		{
			var oParameters = {
				'Action': "FetcherUpdate",
				'AccountID': this.defaultAccountId(),
				'FetcherID': this.idFetcher(),
				'Email': this.email(),
				'Name': this.userName(),
				'IsOutgoingEnabled': this.isOutgoingEnabled() ? 1 : 0,
				'OutgoingMailServer': this.outgoingMailServer(),
				'OutgoingMailPort': parseInt(this.outgoingMailPort(), 10),
				'OutgoingMailAuth': this.outgoingMailAuth() ? 1 : 0
			};
	
			this.loading(true);
	
			App.Ajax.send(oParameters, this.onSaveFetcherResponse, this);
		}
	};
	CFetcherOutgoingViewModel.prototype.onSaveFetcherResponse = function (oData, oParameters)
	{
		this.loading(false);
	
		if (!oData.Result)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('WARNING/UNKNOWN_ERROR'));
		}
		else
		{
			App.populateFetchers();
			App.Api.showReport(Utils.i18n('SETTINGS/ACCOUNT_FETCHER_SUCCESSFULLY_SAVED'));
		}
	};
	
	CFetcherOutgoingViewModel.prototype.populate = function (oFetcher)
	{
		if (oFetcher)
		{
			this.fetcher(oFetcher);
	
			this.idFetcher(oFetcher.idFetcher());
	
			this.isEnabled(oFetcher.isEnabled());
	
			this.email(oFetcher.email());
			this.userName(oFetcher.userName());
			this.isOutgoingEnabled(oFetcher.isOutgoingEnabled());
	
			this.outgoingMailServer(oFetcher.outgoingMailServer());
			this.outgoingMailPort(oFetcher.outgoingMailPort());
			this.outgoingMailAuth(oFetcher.outgoingMailAuth());
		}
	};
	CFetcherOutgoingViewModel.prototype.isEmptyRequiredFields = function ()
	{
		if (this.isOutgoingEnabled())
		{
			if ('' === this.outgoingMailServer())
			{
				this.serverIsSelected(true);
				return true;
			}
		}
	
		return false;
	};
	/**
	 * @param {?=} oParent
	 *
	 * @constructor
	 */
	function CFetcherSignatureViewModel(oParent)
	{
		this.defaultAccountId = AppData.Accounts.defaultId;
	
		this.idFetcher = ko.observable(null);
	
		this.fetcher = ko.observable(null);
	
		this.signature = ko.observable('');
	
		this.loading = ko.observable(false);
	
		this.type = ko.observable(false);
		this.options = ko.observable(0);
	
		this.oHtmlEditor = new CHtmlEditorViewModel(false);
	
		this.isEnabled = oParent.oFetcherIncoming.isEnabled;
		this.isEnabled.subscribe(function (bState) {
			this.oHtmlEditor.stateSwitcher(bState);
		}, this);
	
		this.signature.subscribe(function () {
			this.oHtmlEditor.setText(this.signature());
		}, this);
	
		this.firstState = null;
	}
	
	CFetcherSignatureViewModel.prototype.onSaveClick = function ()
	{
		var oParameters = {
			'Action': "FetcherUpdate",
			'AccountID': this.defaultAccountId(),
			'FetcherID': this.idFetcher(),
			'Signature': this.oHtmlEditor.getText()
		};
	
		this.loading(true);
	
		App.Ajax.send(oParameters, this.onSaveFetcherResponse, this);
	};
	CFetcherSignatureViewModel.prototype.onSaveFetcherResponse = function (oData, oParameters)
	{
		this.loading(false);
	
		if (oData.Result)
		{
			App.Api.showReport(Utils.i18n('SETTINGS/COMMON_REPORT_UPDATED_SUCCESSFULLY'));
		}
		else
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('SETTINGS/ERROR_SETTINGS_SAVING_FAILED'));
		}
	};
	
	CFetcherSignatureViewModel.prototype.populate = function (oFetcher)
	{
		if (oFetcher)
		{
			this.fetcher(oFetcher);
			this.idFetcher(oFetcher.idFetcher());
	//		this.isEnabled(oFetcher.isEnabled());
			this.signature(oFetcher.signature());
		}
	};
	CFetcherSignatureViewModel.prototype.getState = function ()
	{
		var aState = [
			this.type(),
			this.options(),
			this.oHtmlEditor.getText()
		];
		return aState.join(':');
	};
	CFetcherSignatureViewModel.prototype.updateFirstState = function ()
	{
		this.firstState = this.getState();
	};
	CFetcherSignatureViewModel.prototype.onShow = function (aParams, oAccount)
	{
		this.oHtmlEditor.initCrea(this.signature(), '');
		this.oHtmlEditor.setActivitySource(this.options);
		this.updateFirstState();
	};
	
	
	/**
	 * @constructor
	 */
	function CHelpdeskSettingsViewModel()
	{
		this.allowNotifications = ko.observable(AppData.User.AllowHelpdeskNotifications);
	
		this.loading = ko.observable(false);
	}
	
	CHelpdeskSettingsViewModel.prototype.TemplateName = 'Settings_HelpdeskSettingsViewModel';
	
	CHelpdeskSettingsViewModel.prototype.TabName = Enums.SettingsTab.Helpdesk;
	
	CHelpdeskSettingsViewModel.prototype.TabTitle = Utils.i18n('SETTINGS/TAB_HELPDESK');
	
	CHelpdeskSettingsViewModel.prototype.onShow = function ()
	{
		this.allowNotifications(AppData.User.AllowHelpdeskNotifications);
	};
	
	/**
	 * Parses the response from the server. If the settings are normally stored, then updates them. 
	 * Otherwise an error message.
	 * 
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CHelpdeskSettingsViewModel.prototype.onResponse = function (oData, oParameters)
	{
		this.loading(false);
	
		if (oData.Result === false)
		{
			App.Api.showErrorByCode(oData.ErrorCode, Utils.i18n('SETTINGS/ERROR_SETTINGS_SAVING_FAILED'));
		}
		else
		{
			AppData.User.updateHelpdeskSettings(this.allowNotifications());
			App.Api.showReport(Utils.i18n('SETTINGS/COMMON_REPORT_UPDATED_SUCCESSFULLY'));
		}
	};
	
	/**
	 * Sends a request to the server to save the settings.
	 */
	CHelpdeskSettingsViewModel.prototype.onSaveClick = function ()
	{
		var
			oParameters = {
				'Action': 'UpdateHelpdeskUserSettings',
				'AllowHelpdeskNotifications': this.allowNotifications() ? '1' : '0'
			}
		;
	
		this.loading(true);
		App.Ajax.send(oParameters, this.onResponse, this);
	};
	
	
	/**
	 * @constructor
	 */
	function CCalendarViewModel()
	{
		this.aDayNames = Utils.i18n('DATETIME/DAY_NAMES').split(' ');
		this.correctedDayNames = ko.observable(this.aDayNames);
		
		var self = this;
		
		this.isPublic = bExtApp;
		
		this.publicCalendarId = (this.isPublic) ? AppData.CalendarPubParams.Id : '';
		this.publicCalendarName = ko.observable('');
	
		this.timeFormatGrid = (AppData.User.defaultTimeFormat() === Enums.TimeFormat.F24) ? 'HH:mm' : 'hh:mm TT';
		this.timeFormatMoment = (AppData.User.defaultTimeFormat() === Enums.TimeFormat.F24) ? 'HH:mm' : 'hh:mm A';
		this.dateFormat = AppData.User.DefaultDateFormat;
		
		this.dateTitle = ko.observable('');
		this.dateTitleHelper = ko.observableArray(Utils.i18n('DATETIME/MONTH_NAMES').split(' '));
		this.selectedView = ko.observable('');
		this.visibleWeekdayHeader = ko.computed(function () {
			return this.selectedView() === 'month';
		}, this);
		this.selectedView.subscribe(function () {
			this.resize();
		}, this);
		
		this.$calendarGrid = null;
		this.calendarGridDom = ko.observable(null);
		
		this.$datePicker = null;
		this.datePickerDom = ko.observable(null);
	
		this.calendars = new CCalendarListModel({
			onCalendarActiveChange: _.bind(function (oCalendar) {
				var sAction = oCalendar.active() ? 'addEventSource' : 'removeEventSource';
				
				this.$calendarGrid.fullCalendar(sAction, {'events': oCalendar.events});
				
				this.refreshDatePicker();
			}, this)
		});
	
		this.colors = ['#f09650', '#f68987', '#6fd0ce', '#8fbce2', '#b9a4f5', '#f68dcf', '#d88adc', '#4afdb4', '#9da1ff', '#5cc9c9', '#77ca71', '#aec9c9'];
		
		this.busyDays = ko.observableArray([]);
		
		this.$inlineEditedEvent = null;
		this.inlineEditedEventText = null;
		this.checkStarted = ko.observable(false);
		
		this.loaded = false;
		
		this.startDateTime = 0;
		this.endDateTime = 0;
		
		this.needsToReload = false;
		
		this.calendarListClick = function (oItem) {
			oItem.active(!oItem.active());
		};
		this.currentCalendarDropdown = ko.observable(false);
		this.currentCalendarDropdownOffset = ko.observable(0);
		this.calendarDropdownToggle = function (bValue, oElement) {
			if (oElement && bValue)
			{
				var
					position = oElement.position(),
					height = oElement.outerHeight()
				;
	
				self.currentCalendarDropdownOffset(parseInt(position.top, 10) + height);
			}
	
			self.currentCalendarDropdown(bValue);
		};
		
		this.dayNamesResizeBinding = _.throttle(_.bind(this.resize, this), 50);
	
		this.customscrollTop = ko.observable(0);
		this.fullcalendarOptions = {
	//		ignoreTimezone: false,
			header: false,
			editable: !this.isPublic,
			selectable: !this.isPublic,
			allDayText: Utils.i18n('CALENDAR/TITLE_ALLDAY'),
			dayNames: this.aDayNames,
			isRTL: Utils.isRTL(),
			firstHour : 8,
			columnFormat: {
				month: 'dddd', // Monday
				week: 'dddd d', // Monday 7
				day: 'dddd d' // Monday 7
			},
			
			select: _.bind(this.createEventFromGrid, this),
			eventClick: _.bind(this.openEditEventForm, this),
			eventDragStop: _.bind(this.refreshDatePicker, this),
			eventResizeStop: _.bind(this.refreshDatePicker, this),
			eventDrop: _.bind(this.moveEvent, this),
			eventResize: _.bind(this.resizeEvent, this),
			viewRender: _.bind(this.displayViewCallback, this)
		};
		this.revertFunction = null;
		
		this.calendarSharing = AppData.User.AllowCalendar && AppData.User.CalendarSharing;
	}
	
	CCalendarViewModel.prototype.initFullCalendar = function ()
	{
		this.$calendarGrid.fullCalendar(this.fullcalendarOptions);
	};
	
	CCalendarViewModel.prototype.applyCalendarSettings = function ()
	{
		this.timeFormatGrid = (AppData.User.defaultTimeFormat() === Enums.TimeFormat.F24) ? 'HH:mm' : 'hh:mm TT';
		this.timeFormatMoment = (AppData.User.defaultTimeFormat() === Enums.TimeFormat.F24) ? 'HH:mm' : 'hh:mm A';
		this.dateFormat = AppData.User.DefaultDateFormat;
	
		this.calendarGridDom().removeClass("fc-show-weekends");
		if (AppData.User.CalendarShowWeekEnds)
		{
			this.calendarGridDom().addClass("fc-show-weekends");
		}
	
		this.fullcalendarOptions.timeFormat = this.timeFormatGrid + '{ - ' + this.timeFormatGrid + '}';
		this.fullcalendarOptions.axisFormat = this.timeFormatGrid;
		this.fullcalendarOptions.firstDay = AppData.User.CalendarWeekStartsOn;
		
		switch (AppData.User.CalendarDefaultTab)
		{
			case Enums.CalendarDefaultTab.Day:
				this.displayDayView();
				break;
			case Enums.CalendarDefaultTab.Week:
				this.displayWeekView();
				break;
			case Enums.CalendarDefaultTab.Month:
				this.displayMonthView();
				break;
		}
		
		this.applyFirstDay();
		this.fullcalendarOptions.defaultView = this.selectedView();
	
		this.$calendarGrid.fullCalendar('destroy');
		this.$calendarGrid.fullCalendar(this.fullcalendarOptions);
	};
	
	CCalendarViewModel.prototype.applyFirstDay = function ()
	{
		var
			aDayNames = [],
			sFirstDay = '',
			sLastDay = ''
		;
		
		_.each(this.aDayNames, function (sDayName) {
			aDayNames.push(sDayName);
		});
		
		switch (AppData.User.CalendarWeekStartsOn)
		{
			case 1:
				sLastDay = aDayNames.shift();
				aDayNames.push(sLastDay);
				break;
			case 6:
				sFirstDay = aDayNames.pop();
				aDayNames.unshift(sFirstDay);
				break;
		}
		
		this.correctedDayNames(aDayNames);
		
		this.$datePicker.datepicker('option', 'firstDay', AppData.User.CalendarWeekStartsOn);
	};
	
	CCalendarViewModel.prototype.initDatePicker = function ()
	{
		this.$datePicker.datepicker({
			showOtherMonths: true,
			selectOtherMonths: true,
			monthNames: Utils.getMonthNamesArray(),
			dayNamesMin: Utils.i18n('DATETIME/DAY_NAMES_MIN').split(' '),
			onChangeMonthYear: _.bind(this.changeMonthYearFromDatePicker, this),
			onSelect: _.bind(this.selectDateFromDatePicker, this),
			beforeShowDay: _.bind(this.getDayDescription, this)
		});
	};
	
	CCalendarViewModel.prototype.onApplyBindings = function ()
	{
		this.$calendarGrid = $(this.calendarGridDom());
		this.$datePicker = $(this.datePickerDom());
		
		this.initFullCalendar();
		this.initDatePicker();
		
		this.applyCalendarSettings();
		
		this.highlightWeekInDayPicker();
		
		_.delay(_.bind(this.initResizing, this), 300);
	};
	
	CCalendarViewModel.prototype.onShow = function ()
	{
		if (App.CalendarCache && App.CalendarCache.calendarSettingsChanged())
		{
			this.applyCalendarSettings();
			this.reloadAll();
		}
		else if (App.CalendarCache && App.CalendarCache.calendarChanged())
		{
			App.CalendarCache.calendarChanged(false);
			this.reloadAll();
		}
		else if (!this.loaded)
		{
			this.getCalendars();	
		}
	};
	
	/**
	 * @param {Object} oView
	 * @param {Object} oElement
	 */
	CCalendarViewModel.prototype.displayViewCallback = function (oView, oElement)
	{
		var 
			count = 0,
			prevDate = null,
			constDate = "01/01/2001 "
		;
		
		if (oView.name !== 'month' && AppData.User.CalendarShowWorkDay)
		{
			$('.fc-agenda-slots tr').each(function() {
				var $tds = $(this).find('td');
				if($tds.length !== 0) {
					var newClass = '.fc-slot' + count;
					$(newClass + ' th').each(function() {
						var 
							theValue = $(this).eq(0).text(),
							theDate = (theValue !== '') ? Date.parse(constDate + theValue) : null,
							rangeTimeFrom = Date.parse(constDate + AppData.User.CalendarWorkDayStarts + ":00"),
							rangeTimeTo = Date.parse(constDate + AppData.User.CalendarWorkDayEnds + ":00")
						;
						
						if (theDate)
						{
							prevDate = theDate;
						}
						else
						{
							theDate = prevDate;
						}
	
						if(theDate < rangeTimeFrom || theDate >= rangeTimeTo){
							$tds.addClass("fc-non-working-time");
						}
					});
					count++;
				}
			});	
		}
		
		this.activateCustomScrollInDayAndWeekView();
	};
	
	CCalendarViewModel.prototype.collectBusyDays = function ()
	{
		var 
			aBusyDays = [],
			aEvents = this.calendars.getEvents()
		;
	
		_.each(aEvents, function (oEvent) {
			var
				oStart = moment(oEvent.start),
				oEnd = oEvent.end ? moment(oEvent.end) : null,
				iDaysDiff = oEnd ? oEnd.diff(oStart, 'days') : 0,
				iIndex = 0
			;
	
			for (; iIndex <= iDaysDiff; iIndex++)
			{
				aBusyDays.push(oStart.clone().add('days', iIndex).toDate());
			}
		}, this);
	
		this.busyDays(aBusyDays);
	};
	
	CCalendarViewModel.prototype.refreshDatePicker = function ()
	{
		_.defer(_.bind(function () {
			this.collectBusyDays();
			this.$datePicker.datepicker('refresh');
			this.highlightWeekInDayPicker();
		}, this));
	};
	
	/**
	 * @param {Object} oDate
	 */
	CCalendarViewModel.prototype.getDayDescription = function (oDate)
	{
		var
			bSelectable = true,
			oFindedBusyDay = _.find(this.busyDays(), function (oBusyDay) {
				return oBusyDay.getDate() === oDate.getDate() && oBusyDay.getMonth() === oDate.getMonth() &&
					oBusyDay.getYear() === oDate.getYear();
			}, this),
			sDayClass = oFindedBusyDay ? 'day_with_events' : '',
			sDayTitle = ''
		;
		
		return [bSelectable, sDayClass, sDayTitle];
	};
	
	CCalendarViewModel.prototype.initResizing = function ()
	{
		var fResize = _.throttle(_.bind(this.resize, this), 50);
	
		$(window).bind('resize', function (e) {
			if (e.target !== this)
			{
				return;
			}
	
			fResize();
		});
	
		fResize();
	};
	
	CCalendarViewModel.prototype.resize = function ()
	{
		var oParent = this.$calendarGrid.parent();
		if (oParent)
		{
			this.$calendarGrid.fullCalendar('option', 'height', oParent.height());
		}
		this.dayNamesResize();
	};
	
	CCalendarViewModel.prototype.dayNamesResize = function ()
	{
		if (this.selectedView() === 'month')
		{
			var
				oDayNamesHeaderItem = $('div.weekday-header-item'),
				oFirstWeek = $('tr.fc-first td.fc-day'),
				oFirstWeekWidth = $(oFirstWeek[0]).width(),
				iIndex = 0
			;
			
			if (oDayNamesHeaderItem.length === 7 && oFirstWeek.length === 7 && oFirstWeekWidth !== 0)
			{
				for(; iIndex < 7; iIndex++)
				{
					$(oDayNamesHeaderItem[iIndex]).width(oFirstWeekWidth);
				}
			}
		}
	};
	
	/**
	 * @param {number} iYear
	 * @param {number} iMonth
	 * @param {Object} oInst
	 */
	CCalendarViewModel.prototype.changeMonthYearFromDatePicker = function (iYear, iMonth, oInst)
	{
		var oDate = this.$calendarGrid.fullCalendar('getDate');
		// Date object in javascript and fullcalendar use numbers 0,1,2...11 for monthes
		// datepiker uses numbers 1,2,3...12 for monthes
		this.$calendarGrid.fullCalendar('gotoDate', iYear, iMonth - 1, oDate.getDate());
		this.changeDate();
	};
	
	/**
	 * @param {string} sDate
	 * @param {Object} oInst
	 */
	CCalendarViewModel.prototype.selectDateFromDatePicker = function (sDate, oInst)
	{
		var oDate = new Date(sDate);
		this.$calendarGrid.fullCalendar('gotoDate', oDate.getFullYear(), oDate.getMonth(), oDate.getDate());
		this.changeDate();
		
		_.defer(_.bind(this.highlightWeekInDayPicker, this));
	};
	
	CCalendarViewModel.prototype.highlightWeekInDayPicker = function ()
	{
		var
			$currentDay = this.$datePicker.find('td.ui-datepicker-current-day'),
			$currentWeek = $currentDay.parent(),
			$currentMonth = this.$datePicker.find('table.ui-datepicker-calendar'),
			oView = this.$calendarGrid.fullCalendar('getView')
		;
		
		switch (oView.name)
		{
			case 'agendaDay':
				$currentMonth.addClass('highlight_day').removeClass('highlight_week');
				break;
			case 'agendaWeek':
				$currentMonth.removeClass('highlight_day').addClass('highlight_week');
				break;
			default:
				$currentMonth.removeClass('highlight_day').removeClass('highlight_week');
				break;
		}
		
		$currentWeek.addClass('current_week');
	};
	
	CCalendarViewModel.prototype.changeDate = function ()
	{
		var
			oMoment = moment(this.$calendarGrid.fullCalendar('getDate')),
			oView = this.$calendarGrid.fullCalendar('getView'),
			sTitle = oMoment.format('MMMM YYYY'),
			oStartMoment = oView.start ? moment(oView.start) : null,
			oEndMoment = oView.end ? moment(oView.end).add('days', -1) : null,
			aCalendarIds = _.map(this.calendars.collection(), function (oCalendar){
				return oCalendar.id;
			}, this)
		;
	
		if (aCalendarIds.length > 0)
		{
			this.getEvents(aCalendarIds);
		}
		
		switch (oView.name)
		{
			case 'agendaDay':
				sTitle = oMoment.format('MMMM D, YYYY');
				break;
			case 'agendaWeek':
				if (oStartMoment && oEndMoment)
				{
					sTitle = oStartMoment.format('MMMM D, YYYY') + ' - ' + oEndMoment.format('MMMM D, YYYY');
				}
				break;
		}
		
		this.dateTitle(sTitle);
		this.selectedView(oView.name);
	};
	
	CCalendarViewModel.prototype.changeDateInDatePicker = function ()
	{
		this.$datePicker.datepicker('setDate', this.$calendarGrid.fullCalendar('getDate'));
		this.highlightWeekInDayPicker();
	};
	
	CCalendarViewModel.prototype.activateCustomScrollInDayAndWeekView = function ()
	{
		var aWeekGridInner = $('table.fc-agenda-slots').parent().parent();
	
		aWeekGridInner.each(function() {
	
			var
				oWeekGridInner = $(this),
				oWeekGrid = $(this).parent()
			;
	
			if (!oWeekGrid.hasClass('scroll-wrap'))
			{
				oWeekGrid.attr('data-bind', 'customScrollbar: {x: false, relativeToInner: true}');
				oWeekGridInner.css({'overflow': 'hidden'}).addClass('scroll-inner');
	
				ko.applyBindings({}, oWeekGrid[0]);
			}
		});
	};
	
	/**
	 * @param {string} sCmd
	 * @param {string=} sParam = ''
	 */
	CCalendarViewModel.prototype.execCommand = function (sCmd, sParam)
	{
		if (sParam)
		{
			this.$calendarGrid.fullCalendar(sCmd, sParam);
		}
		else
		{
			this.$calendarGrid.fullCalendar(sCmd);
		}
		
		this.changeDate();
		this.changeDateInDatePicker();
	};
	
	CCalendarViewModel.prototype.displayToday = function ()
	{
		this.execCommand('today');
	};
	
	CCalendarViewModel.prototype.displayPrev = function ()
	{
		this.execCommand('prev');
	};
	
	CCalendarViewModel.prototype.displayNext = function ()
	{
		this.execCommand('next');
	};
	
	CCalendarViewModel.prototype.displayDayView = function ()
	{
		this.execCommand('changeView', 'agendaDay');
	};
	
	CCalendarViewModel.prototype.displayWeekView = function ()
	{
		this.execCommand('changeView', 'agendaWeek');
	};
	
	CCalendarViewModel.prototype.displayMonthView = function ()
	{
		this.execCommand('changeView', 'month');
	};
	
	CCalendarViewModel.prototype.reloadAll = function ()
	{
		this.startDateTime = 0;
		this.endDateTime = 0;
		this.needsToReload = true;
		
		this.getCalendars();
	};
	
	CCalendarViewModel.prototype.getCalendars = function ()
	{
		this.checkStarted(true);
		App.Ajax.abortRequestByActionName('CalendarList');
		App.Ajax.sendExt({
				'Action': 'CalendarList',
				'IsPublic': this.isPublic ? 1 : 0,
				'PublicCalendarId': this.publicCalendarId
			}, this.onCalendarsResponse, this
		);
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CCalendarViewModel.prototype.onCalendarsResponse = function (oData, oParameters)
	{
		var
			aCalendarIds = [],
			oCalendar = null
		;
		if (oData.Result)
		{
			this.loaded = true;
	
			//sets default calendar aways fist in list
			oData.Result = _.sortBy(oData.Result, function(oItem){ return oItem.Id !== "Default"; });
	
			_.each(oData.Result, function (oCalendarData) {
				oCalendar = this.calendars.parseAndAddCalendar(oCalendarData);
				if (oCalendar)
				{
					if (this.isPublic)
					{
						App.setTitle(oCalendar.name());
						this.publicCalendarName(oCalendar.name());
					}
					aCalendarIds.push(oCalendar.id);
				}
			}, this);
			
			if (aCalendarIds.length === 0 && this.isPublic)
			{
				App.setTitle(Utils.i18n('CALENDAR/NO_CALENDAR_FOUND'));
				App.Api.showErrorByCode(0, Utils.i18n('CALENDAR/NO_CALENDAR_FOUND'));
			}
	
			this.getEvents(aCalendarIds);
		}
		this.checkStarted(false);
	};
	
	/**
	 * @param {Array} aCalendarIds
	 */
	CCalendarViewModel.prototype.getEvents = function (aCalendarIds)
	{
		var 
			bNeedsToLoad = false,
			oView = this.$calendarGrid.fullCalendar('getView'),
			iStart = oView && oView['visStart'] && oView['visStart']['getTime'] ? oView['visStart']['getTime']() / 1000 : 0,
			iEnd = oView && oView['visEnd'] && oView['visEnd']['getTime'] ? oView['visEnd']['getTime']() / 1000 : 0
		;
		if (this.startDateTime === 0 && this.endDateTime === 0)
		{
			this.startDateTime = iStart;
			this.endDateTime = iEnd;
			bNeedsToLoad = true;
		}
		else if (iStart < this.startDateTime && iEnd > this.endDateTime)
		{
			this.startDateTime = iStart;
			this.endDateTime = iEnd;
			bNeedsToLoad = true;
		}
		else if (iStart < this.startDateTime)
		{
			iEnd= this.startDateTime;
			this.startDateTime = iStart;
			bNeedsToLoad = true;
		}
		else if (iEnd > this.endDateTime)
		{
			iStart = this.endDateTime;
			this.endDateTime = iEnd;
			bNeedsToLoad = true;
		}
	
		if (aCalendarIds.length > 0 && bNeedsToLoad)
		{
			this.checkStarted(true);
			if (aCalendarIds.length > 1)
			{
				this.$calendarGrid.find('.fc-view div').first().css('visibility', 'hidden');
			}
			App.Ajax.abortRequestByActionName('EventList');
			App.Ajax.sendExt({
				'CalendarIds': JSON.stringify(aCalendarIds),
				'Start': iStart,
				'End': iEnd,
				'IsPublic': this.isPublic ? 1 : 0,
				'Action': 'EventList'
			}, this.onEventsResponse, this);
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CCalendarViewModel.prototype.onEventsResponse = function (oData, oParameters)
	{
		if (oData.Result)
		{
			if (this.needsToReload)
			{
				this.$calendarGrid.fullCalendar('removeEvents');
			}
			_.each(this.calendars.collection(), function (oCalendar){
				if (oCalendar)
				{
					this.$calendarGrid.fullCalendar('removeEventSource', {'events': oCalendar.events});
					if (this.needsToReload)
					{
						oCalendar.removeEvents();
					}
				}
			}, this);
			this.needsToReload = false;
			
			_.each(oData.Result, function (oEventData) {
				var oCalendar = this.calendars.getCalendarById(oEventData.calendarId);			
				if (oCalendar)
				{
					oCalendar.addEvent(oEventData);
				}
			}, this);
			
			_.each(this.calendars.collection(), function (oCalendar, iIndex, aCollection) {
				if (oCalendar && oCalendar.active())
				{
					this.$calendarGrid.fullCalendar('addEventSource',  {'events': oCalendar.events});
				}
			}, this);	
			
			this.refreshDatePicker();
		}
		
		this.$calendarGrid.css('visibility', '');
		this.$calendarGrid.find('.fc-view div').first().css('visibility', '');
		this.checkStarted(false);
	};
	
	
	CCalendarViewModel.prototype.getUnusedColor = function ()
	{
		var colors = _.difference(this.colors, this.calendars.getColors());
		
		if (colors.length > 0)
		{
			return colors[0];
		}
		return this.colors[0];
	};
	
	CCalendarViewModel.prototype.openCreateCalendarForm = function ()
	{
		if (!this.isPublic)
		{
			var oCalendar = new CCalendarModel();
			oCalendar.color(this.getUnusedColor());
			App.Screens.showPopup(CalendarCreatePopup, [_.bind(this.createCalendar, this), this.colors, oCalendar]);
		}
	};
	
	/**
	 * @param {string} sName
	 * @param {string} sDescription
	 * @param {string} sColor
	 */
	CCalendarViewModel.prototype.createCalendar = function (sName, sDescription, sColor)
	{
		if (!this.isPublic)
		{
			App.Ajax.send({
					'Name': sName,
					'Description': sDescription,
					'Color': sColor,
					'Action': 'CalendarCreate'
				}, this.onCalendarCreateResponse, this
			);
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CCalendarViewModel.prototype.onCalendarCreateResponse = function (oData, oParameters)
	{
		if (oData.Result)
		{
			this.calendars.parseAndAddCalendar(/** @type {AjaxCalendarResponse} */{
				Id: oData.Result,
				Name: oParameters.Name,
				Description: oParameters.Description,
				Active: true,
				isDefault: false,
				Color: oParameters.Color,
				Events: []
			});
		}
	};
	
	/**
	 * @param {Object} oCalendar
	 */
	CCalendarViewModel.prototype.openUpdateCalendarForm = function (oCalendar)
	{
		if (!this.isPublic)
		{
			App.Screens.showPopup(CalendarCreatePopup, [_.bind(this.updateCalendar, this), this.colors, oCalendar]);
		}
	};
	
	/**
	 * @param {string} sName
	 * @param {string} sDescription
	 * @param {string} sColor
	 * @param {string} sId
	 */
	CCalendarViewModel.prototype.updateCalendar = function (sName, sDescription, sColor, sId)
	{
		if (!this.isPublic)
		{
			App.Ajax.send({
					'Name': sName,
					'Description': sDescription,
					'Color': sColor,
					'Id': sId,
					'Action': 'CalendarUpdate'
				}, this.onCalendarUpdateResponse, this
			);
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CCalendarViewModel.prototype.onCalendarUpdateResponse = function (oData, oParameters)
	{
		var
			oCalendar = null,
			aEvents = []
		;
		if (oData.Result)
		{
			oCalendar = this.calendars.getCalendarById(oParameters.Id);
			if (oCalendar)
			{
				aEvents = oCalendar.events;
				
				oCalendar.name(oParameters.Name);
				oCalendar.description(oParameters.Description);
				oCalendar.color(oParameters.Color);
				
				this.$calendarGrid.fullCalendar('removeEventSource', {'events': aEvents});
				this.$calendarGrid.fullCalendar('addEventSource',  {'events': oCalendar.events});
			}
		}
	};
	
	/**
	 * @param {string} sColor
	 * @param {string} sId
	 */
	CCalendarViewModel.prototype.updateCalendarColor = function (sColor, sId)
	{
		if (!this.isPublic)
		{
			App.Ajax.send({
					'Color': sColor,
					'Id': sId,
					'Action': 'CalendarUpdateColor'
				}, this.onCalendarUpdateColorResponse, this
			);
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CCalendarViewModel.prototype.onCalendarUpdateColorResponse = function (oData, oParameters)
	{
		var
			oCalendar = null,
			aEvents = []
		;
		if (oData.Result)
		{
			oCalendar = this.calendars.getCalendarById(oParameters.Id);
			if (oCalendar)
			{
				aEvents = oCalendar.events; 
		
				oCalendar.color(oParameters.Color);
				
				this.$calendarGrid.fullCalendar('removeEventSource', {'events': aEvents});
				this.$calendarGrid.fullCalendar('addEventSource',  {'events': oCalendar.events});
			}
		}
	};
	
	/**
	 * @param {Object} oCalendar
	 */
	CCalendarViewModel.prototype.openGetLinkCalendarForm = function (oCalendar)
	{
		if (!this.isPublic)
		{
			App.Screens.showPopup(CalendarGetLinkPopup, [_.bind(this.publicCalendar, this), oCalendar]);
		}
	};
	
	/**
	 * @param {Object} oCalendar
	 */
	CCalendarViewModel.prototype.openShareCalendarForm = function (oCalendar)
	{
		if (!this.isPublic)
		{
			App.Screens.showPopup(CalendarSharePopup, [_.bind(this.shareCalendar, this), oCalendar]);
		}
	};
	
	/**
	 * @param {string} sId
	 * @param {boolean} bIsPublic
	 * @param {Array} aShares
	 */
	CCalendarViewModel.prototype.shareCalendar = function (sId, bIsPublic, aShares)
	{
		if (!this.isPublic)
		{
			App.Ajax.send({
					'Action': 'CalendarShareUpdate',
					'Id': sId,
					'IsPublic': bIsPublic ? 1 : 0,
					'Shares': JSON.stringify(aShares)			
				}, this.onCalendarShareUpdateResponse, this
			);
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CCalendarViewModel.prototype.onCalendarShareUpdateResponse = function (oData, oParameters)
	{
		if (oData.Result)
		{
			var	oCalendar = this.calendars.getCalendarById(oParameters.Id);
			if (oCalendar)
			{
				oCalendar.shares(JSON.parse(oParameters.Shares));
			}
		}
	};
	
	/**
	 * @param {string} sId
	 * @param {boolean} bIsPublic
	 */
	CCalendarViewModel.prototype.publicCalendar = function (sId, bIsPublic)
	{
		if (!this.isPublic)
		{
			App.Ajax.send({
					'Action': 'CalendarPublicUpdate',
					'Id': sId,
					'IsPublic': bIsPublic ? 1 : 0
				}, this.onCalendarPublicUpdateResponse, this
			);
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CCalendarViewModel.prototype.onCalendarPublicUpdateResponse = function (oData, oParameters)
	{
		if (oData.Result)
		{
			var	oCalendar = this.calendars.getCalendarById(oParameters.Id);
			if (oCalendar)
			{
				oCalendar.isPublic(oParameters.IsPublic);
			}
		}
	};
	
	/**
	 * @param {string} sId
	 */
	CCalendarViewModel.prototype.deleteCalendar = function (sId)
	{
		var
			oCalendar = this.calendars.getCalendarById(sId),
			sConfirm = oCalendar ? Utils.i18n('CALENDAR/CONFIRM_REMOVE_CALENDAR', {'CALENDARNAME': oCalendar.name()}) : '',
			fRemove = _.bind(function (bRemove) {
				if (bRemove)
				{
					App.Ajax.send({
							'Id': sId,
							'Action': 'CalendarDelete'
						}, this.onCalendarDeleteResponse, this
					);
				}
			}, this)
		;
		
		if (!this.isPublic && oCalendar)
		{
			App.Screens.showPopup(ConfirmPopup, [sConfirm, fRemove]);
		}	
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CCalendarViewModel.prototype.onCalendarDeleteResponse = function (oData, oParameters)
	{
		if (oData.Result)
		{
			var oCalendar = this.calendars.getCalendarById(oParameters.Id);
			if (oCalendar && !oCalendar.isDefault)
			{
				if (this.calendars.currentCal().id === oCalendar.id)
				{
					this.calendars.currentCal(null);
				}
				this.calendars.removeCalendar(oCalendar.id);
				this.$calendarGrid.fullCalendar('removeEventSource', {'events': oCalendar.events});
			}
		}
	};
	
	CCalendarViewModel.prototype.createNewEventInCurrentCalendar = function ()
	{
		this.createNewEventToday(this.calendars.currentCal());
	};
	
	/**
	 * @param {string} sCalendarId
	 */
	CCalendarViewModel.prototype.createNewEventInCalendar = function (sCalendarId)
	{
		this.createNewEventToday(this.calendars.getCalendarById(sCalendarId));
	};
	
	/**
	 * @param {Object} oSelectedCalendar
	 */
	CCalendarViewModel.prototype.createNewEventToday = function (oSelectedCalendar)
	{
		var oMoment = moment();
		
		if (oMoment.minutes() > 30)
		{
			oMoment.add('minutes', 60 - oMoment.minutes());
		}
		else
		{
			oMoment.minutes(30);
		}
		oMoment.seconds(0);
		oMoment.milliseconds(0);
		
		this.openCreateEventForm(oSelectedCalendar, oMoment, oMoment.clone().add('minutes', 30), false);
	};
	
	/**
	 * @param {Object} oEventData
	 */
	CCalendarViewModel.prototype.getParametersFromEventData = function (oEventData)
	{
		var	
			aParameters = {
				id: oEventData.id,
				uid: oEventData.uid,
				calendarId: oEventData.calendarId,
				newCalendarId: !Utils.isUnd(oEventData.newCalendarId) ? oEventData.newCalendarId : oEventData.calendarId,
				subject: oEventData.subject,
				allDay: oEventData.allDay ? 1 : 0,
				location: oEventData.location,
				description: oEventData.description,
				alarms: oEventData.alarms ? JSON.stringify(oEventData.alarms) : '[]',
				attendees: oEventData.attendees ? JSON.stringify(oEventData.attendees) : '[]',
				owner: oEventData.owner,
				recurrenceId: oEventData.recurrenceId,
				excluded: oEventData.excluded,
				allEvents: oEventData.allEvents,
				modified: oEventData.modified ? 1 : 0
			}
		;
	
		
		if (oEventData.rrule)
		{
			aParameters.rrule = JSON.stringify(oEventData.rrule);
		}
	
		aParameters.start = oEventData.start;
		aParameters.end = oEventData.end;
	
		aParameters.startTimestamp = aParameters.start.getTime() / 1000;
		aParameters.endTimestamp = aParameters.end ? aParameters.end.getTime() / 1000 : aParameters.startTimestamp;
		
		return aParameters;
	};
	
	/**
	 * @param {Array} aParameters
	 */
	CCalendarViewModel.prototype.getEventDataFromParameters = function (aParameters)
	{
		var	oEventData = aParameters;
		
		oEventData.alarms = aParameters.alarms ? JSON.parse(aParameters.alarms) : [];
		oEventData.attendees = aParameters.attendees ? JSON.parse(aParameters.attendees) : [];
	
		if(aParameters.rrule)
		{
			oEventData.rrule = JSON.parse(aParameters.rrule);
		}
	
		return oEventData;
	};
	
	/**
	 * @param {Object} oStart
	 * @param {Object} oEnd
	 * @param {boolean} bAllDay
	 */
	CCalendarViewModel.prototype.createEventFromGrid = function (oStart, oEnd, bAllDay)
	{
		this.openCreateEventForm(this.calendars.currentCal(), moment(oStart), moment(oEnd), bAllDay);
	};
	
	/**
	 * @param {Object} oSelectedCalendar
	 * @param {Object} oStartMoment
	 * @param {Object} oEndMoment
	 * @param {boolean} bAllDay
	 */
	CCalendarViewModel.prototype.openCreateEventForm = function (oSelectedCalendar, oStartMoment, oEndMoment, bAllDay)
	{
		if (!this.isPublic)
		{
			App.Screens.showPopup(CalendarCreateEventPopup, [{
				CallbackSave: _.bind(this.createEvent, this),
				CallbackDelete: _.bind(this.deleteEvent, this),
				Calendars: this.calendars,
				SelectedCalendar: oSelectedCalendar.id,
				StartMoment: oStartMoment,
				EndMoment: oEndMoment,
				AllDay: bAllDay,
				TimeFormat: this.timeFormatMoment,
				DateFormat: this.dateFormat,
				CallbackAttendeeActionDecline: _.bind(this.attendeeActionDecline, this),
				Owner: oSelectedCalendar.owner()
			}]);
		}
	};
	
	/**
	 * @param {Object} oEventData
	 */
	CCalendarViewModel.prototype.createEvent = function (oEventData)
	{
		var 
			aParameters = this.getParametersFromEventData(oEventData),
			oView = this.$calendarGrid.fullCalendar('getView'),
			iStart = oView && oView['visStart'] && oView['visStart']['getTime'] ? oView['visStart']['getTime']() / 1000 : 0,
			iEnd = oView && oView['visEnd'] && oView['visEnd']['getTime'] ? oView['visEnd']['getTime']() / 1000 : 0
		;
	
		if (!this.isPublic)
		{
			aParameters.calendarId = oEventData.newCalendarId;
			aParameters.selectStart = iStart;
			aParameters.selectEnd = iEnd;
			aParameters.Action = 'EventCreate';
			App.Ajax.send(aParameters, this.onEventActionResponse, this);
		}
	};
	
	/**
	 * @param {Object} oEventData
	 */
	CCalendarViewModel.prototype.openEditEventForm = function (oEventData)
	{
		var
			/**
			 * @param {number} iResult
			 */
			fCallback = _.bind(function (iResult) {
				var oEventParams = {
						CallbackSave: _.bind(this.updateEvent, this),
						CallbackDelete: _.bind(this.deleteEvent, this),
						ID: oEventData.id,
						Uid: oEventData.uid,
						RecurrenceId: oEventData.recurrenceId,
						Calendars: this.calendars,
						SelectedCalendar: oEventData.calendarId,
						AllDay: oEventData.allDay,
						Location: oEventData.location,
						Description: oEventData.description,
						Subject: oEventData.subject,
						Alarms: oEventData.alarms,
						Attendees: oEventData.attendees,
						RRule: oEventData.rrule ? oEventData.rrule : null,
						Excluded: oEventData.excluded ? oEventData.excluded : false,
						Owner: oEventData.owner,
						Appointment: oEventData.appointment,
						OwnerName: oEventData.ownerName,
						TimeFormat: this.timeFormatMoment,
						DateFormat: this.dateFormat,
						AllEvents: iResult,
						CallbackAttendeeActionDecline: _.bind(this.attendeeActionDecline, this)
					}
				;
				if (iResult !== Enums.CalendarEditRecurrenceEvent.None)
				{
					if (iResult === Enums.CalendarEditRecurrenceEvent.AllEvents && oEventData.rrule)
					{
						oEventParams.StartMoment = moment(oEventData.rrule.startBase * 1000);
						oEventParams.EndMoment = moment(oEventData.rrule.endBase * 1000);
	
					}
					else
					{
						oEventParams.StartMoment = moment(oEventData.start);
						oEventParams.EndMoment = moment(oEventData.end);
					}
					App.Screens.showPopup(CalendarCreateEventPopup, [oEventParams]);
				}
			}, this)
		;
		
		if (oEventData.rrule)
		{
			if (oEventData.excluded)
			{
				fCallback(Enums.CalendarEditRecurrenceEvent.OnlyThisInstance);
			}
			else
			{
				App.Screens.showPopup(CalendarEditRecurrenceEventPopup, [fCallback]);
			}
		}
		else
		{
			fCallback(Enums.CalendarEditRecurrenceEvent.AllEvents);
		}
	};
	
	/**
	 * @param {string} sAction
	 * @param {Object} oParameters
	 * @param {Function=} fRevertFunc = undefined
	 */
	CCalendarViewModel.prototype.eventAction = function (sAction, oParameters, fRevertFunc)
	{
		var oCalendar = this.calendars.getCalendarById(oParameters.calendarId);
		
		if (oCalendar.access === Enums.CalendarAccess.Read)
		{
			if (fRevertFunc)
			{
				fRevertFunc();		
			}
		}
		else
		{
			if (!this.isPublic)
			{
				if (fRevertFunc)
				{
					this.revertFunction = fRevertFunc;
				}
				
				oParameters.Action = sAction;
				App.Ajax.send(
					oParameters,
					this.onEventActionResponse, this
				);
			}
		}
	};
	
	/**
	 * @param {Object} oEventData
	 */
	CCalendarViewModel.prototype.updateEvent = function (oEventData)
	{
		var 
			oParameters = this.getParametersFromEventData(oEventData),
			oView = this.$calendarGrid.fullCalendar('getView'),
			iStart = oView && oView['visStart'] && oView['visStart']['getTime'] ? oView['visStart']['getTime']() / 1000 : 0,
			iEnd = oView && oView['visEnd'] && oView['visEnd']['getTime'] ? oView['visEnd']['getTime']() / 1000 : 0
		;
		
		oParameters.selectStart = iStart;
		oParameters.selectEnd = iEnd;
		if (oEventData.modified)
		{
			this.eventAction('EventUpdate', oParameters);
		}
	};
	
	/**
	 * @param {Object} oEventData
	 * @param {number} dayDelta
	 * @param {number} minuteDelta
	 * @param {boolean} allDay
	 * @param {Function} revertFunc
	 */
	CCalendarViewModel.prototype.moveEvent = function (oEventData, dayDelta, minuteDelta, allDay, revertFunc)
	{
		oEventData.dayDelta = dayDelta ? dayDelta : 0;
		oEventData.minuteDelta = minuteDelta ? minuteDelta : 0;
		var 
			oParameters = this.getParametersFromEventData(oEventData),
			oView = this.$calendarGrid.fullCalendar('getView'),
			iStart = oView && oView['visStart'] && oView['visStart']['getTime'] ? oView['visStart']['getTime']() / 1000 : 0,
			iEnd = oView && oView['visEnd'] && oView['visEnd']['getTime'] ? oView['visEnd']['getTime']() / 1000 : 0,
			iNewStart = oParameters.startTimestamp,
			iAllEvStart,
			iAllEvEnd,
	
	//		sConfirm = Utils.i18n('With drag-n-drop you can change the date of this single instance only. To alter the entire series, open the event and change its date.'),
			fConfirm = _.bind(function (bConfirm) {
				if (bConfirm)
				{
					oParameters.allEvents = Enums.CalendarEditRecurrenceEvent.OnlyThisInstance;
					this.eventAction('EventUpdate', oParameters, revertFunc);
				}
				else if (revertFunc)
				{
					revertFunc();
				}
			}, this)
		;
	
		oParameters.selectStart = iStart;
		oParameters.selectEnd = iEnd;
		if (!this.isPublic)
		{
			if (oParameters.rrule)
			{
				revertFunc(false);
	/*			
				iAllEvStart = JSON.parse(oParameters.rrule).startBase;
				iAllEvEnd = JSON.parse(oParameters.rrule).until;
	
				if (iAllEvStart <= iNewStart && iNewStart <= iAllEvEnd)
				{
					if (oParameters.excluded)
					{
						oParameters.allEvents = Enums.CalendarEditRecurrenceEvent.OnlyThisInstance;
						this.eventAction('EventUpdate', oParameters, revertFunc);
					}
					else
					{
						App.Screens.showPopup(ConfirmPopup, [sConfirm, fConfirm, '', 'Update this instance']);
					}
				}
				else 
				{
					revertFunc(false);
				}
	*/				
			}
			else
			{
				oParameters.allEvents = Enums.CalendarEditRecurrenceEvent.AllEvents;
				this.eventAction('EventUpdate', oParameters, revertFunc);
			}
		}	
		
	};
	
	/**
	 * @param {Object} oEventData
	 * @param {number} dayDelta, 
	 * @param {number} minuteDelta, 
	 * @param {Function} revertFunc
	 */
	CCalendarViewModel.prototype.resizeEvent = function (oEventData, dayDelta, minuteDelta, revertFunc)
	{
		var 
			oParameters = this.getParametersFromEventData(oEventData),
			oView = this.$calendarGrid.fullCalendar('getView'),
			iStart = oView && oView['visStart'] && oView['visStart']['getTime'] ? oView['visStart']['getTime']() / 1000 : 0,
			iEnd = oView && oView['visEnd'] && oView['visEnd']['getTime'] ? oView['visEnd']['getTime']() / 1000 : 0,
			/**
			 * @param {number} iResult
			 */
			fCallback = _.bind(function (iResult) {
				if (iResult !== Enums.CalendarEditRecurrenceEvent.None)
				{
	//				if (iResult === Enums.CalendarEditRecurrenceEvent.AllEvents)
	//				{
	//
	//				}
					oParameters.allEvents = iResult;
					this.eventAction('EventUpdate', oParameters, revertFunc);
				}
				else
				{
					revertFunc();
				}
			}, this)
		;
		
		oParameters.selectStart = iStart;
		oParameters.selectEnd = iEnd;
		if (oEventData.rrule)
		{
			if (oParameters.excluded)
			{
				fCallback(Enums.CalendarEditRecurrenceEvent.OnlyThisInstance);
			}
			else
			{
				App.Screens.showPopup(CalendarEditRecurrenceEventPopup, [fCallback]);
			}
		}
		else
		{
			fCallback(Enums.CalendarEditRecurrenceEvent.AllEvents);
		}
	};
	
	/**
	 * @param {Object} oEventData
	 */
	CCalendarViewModel.prototype.deleteEvent = function (oEventData)
	{
		var oParameters = this.getParametersFromEventData(oEventData);
	
		this.eventAction('EventDelete', oParameters);
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CCalendarViewModel.prototype.onEventActionResponse = function (oData, oParameters)
	{
		var oCalendar = this.calendars.getCalendarById(oParameters.calendarId);
		
		if(oData.Result && !Utils.isUnd(oCalendar))
		{
			if (oParameters.Action === 'EventUpdate' || oParameters.Action === 'EventCreate')
			{
				this.customscrollTop(parseInt($('.calendar .scroll-inner').scrollTop(), 10));
				this.$calendarGrid.fullCalendar('removeEventSource', {'events': oCalendar.events});
				if(oParameters.rrule && oParameters.allEvents === Enums.CalendarEditRecurrenceEvent.AllEvents)
				{
					oCalendar.removeEventByUid(oParameters.uid, true);
				}
				else
				{
					oCalendar.removeEvent(oParameters.id);
				}
				
				if (oParameters.newCalendarId && oParameters.newCalendarId !== oParameters.calendarId)
				{
					this.$calendarGrid.fullCalendar('addEventSource', {'events': oCalendar.events});
					oCalendar = this.calendars.getCalendarById(oParameters.newCalendarId);			
					this.$calendarGrid.fullCalendar('removeEventSource', {'events': oCalendar.events});
				}
				_.each(oData.Result, function (oEventData) {
						oCalendar.addEvent(oEventData);
				}, this);
				
				if (!oCalendar.active())
				{
					oCalendar.active(true);
				}
				else
				{
					this.$calendarGrid.fullCalendar('addEventSource', {'events': oCalendar.events});
				}
				this.refreshDatePicker();
				
				this.customscrollTop.valueHasMutated();
			}
			else if (oParameters.Action === 'EventDelete')
			{
				this.$calendarGrid.fullCalendar('removeEventSource', {'events': oCalendar.events});
				if(oParameters.allEvents === Enums.CalendarEditRecurrenceEvent.OnlyThisInstance)
				{
					oCalendar.removeEvent(oParameters.id);
				}
				else
				{
					oCalendar.removeEventByUid(oParameters.uid);
				}
				this.$calendarGrid.fullCalendar('addEventSource', {'events': oCalendar.events});
				this.refreshDatePicker();
			}
			else if (oParameters.Action === 'EventBase')
			{
				var oEventData = oData.Result;
				App.Screens.showPopup(CalendarCreateEventPopup, [{
					CallbackSave: _.bind(this.updateEvent, this),
					CallbackDelete: _.bind(this.deleteEvent, this),
					ID: oEventData.id,
					Uid: oEventData.uid,
					RecurrenceId: oEventData.recurrenceId,
					Calendars: this.calendars,
					SelectedCalendar: oEventData.calendarId,
					StartMoment: moment(oEventData.start * 1000),
					EndMoment: moment(oEventData.end * 1000),
					AllDay: oEventData.allDay,
					Location: oEventData.location,
					Description: oEventData.description,
					Subject: oEventData.subject,
					Alarms: oEventData.alarms,
					Attendees: oEventData.attendees,
					RRule: oEventData.rrule ? oEventData.rrule : null,
					Excluded: oEventData.excluded ? oEventData.excluded : false,
					Owner: oEventData.owner,
					Appointment: oEventData.appointment,
					TimeFormat: this.timeFormatMoment,
					DateFormat: this.dateFormat,
					AllEvents: Enums.CalendarEditRecurrenceEvent.AllEvents
				}]);
			}
		}
		else
		{
			if (this.revertFunction)
			{
				this.revertFunction();
			}
		}
		this.revertFunction = null;
	};
	
	/**
	 * @param {Object} oCalendar
	 * @param {string} sId
	 */
	CCalendarViewModel.prototype.attendeeActionDecline = function (oCalendar, sId)
	{
		this.$calendarGrid.fullCalendar('removeEventSource', {'events': oCalendar.events});
		oCalendar.removeEvent(sId);
		this.$calendarGrid.fullCalendar('addEventSource', {'events': oCalendar.events});
		this.refreshDatePicker();
	};
	/**
	* @constructor
	*/
	function CFileStorageViewModel()
	{
		this.groups = ko.observableArray();
		this.folders = ko.observableArray();
		this.files = ko.observableArray();
		this.uploadingFiles = ko.observableArray();
		
		this.storageType = ko.observable(Enums.FileStorageType.Private);
		
		this.aPath = ko.observableArray();
		this.iPathIndex = ko.observable(-1);
	
		this.path = ko.computed(function () {
			var aPath = _.map(this.aPath(), function (oItem) {
	                        return oItem.name();
	                });
	                return aPath.join('/');
		}, this);
		
		this.dropPath = ko.observable('');
		this.path.subscribe(function (value) {
			this.dropPath(value);
		}, this);
		
		this.rootPath = ko.computed(function () {
			var rootPath = Utils.i18n('FILESTORAGE/TAB_PRIVATE_FILES');
			if (this.storageType() === Enums.FileStorageType.Corporate)
			{
				rootPath = Utils.i18n('FILESTORAGE/TAB_CORPORATE_FILES');
			}
			return rootPath;
		}, this);
		
		this.collection = ko.computed(function () {
			var files = _.union(this.files(), this.getUploadingFiles());
	
			files.sort(function(left, right) { 
				return left.name() === right.name() ? 0 : (left.name() < right.name() ? -1 : 1); 
			});
			
			return _.union(this.folders(), files);
		}, this);
		
		this.columnCount = ko.observable(1);
		
		this.selector = new CSelector(this.collection, null,
			_.bind(this.onItemDelete, this), _.bind(this.onItemDblClick, this), _.bind(this.onEnter, this), this.columnCount, true, true, true);
			
		this.storageType.subscribe(function () {
			this.selector.listCheckedAndSelected(false);
		}, this);
	
		this.searchPattern = ko.observable('');
		this.isSearchFocused = ko.observable(false);
	
		this.renameCommand = Utils.createCommand(this, this.executeRename, function () {
			return (1 === this.selector.listCheckedAndSelected().length);
		});
		this.deleteCommand = Utils.createCommand(this, this.executeDelete, function () {
			var items = this.selector.listCheckedAndSelected();
			return (0 < items.length);
		});
		this.downloadCommand = Utils.createCommand(this, this.executeDownload, function () {
			var items = this.selector.listCheckedAndSelected();
			return (1 === items.length && !items[0].isFolder());
		});
		this.shareCommand = Utils.createCommand(this, this.executeShare, function () {
			var items = this.selector.listCheckedAndSelected();
			return (1 === items.length && !items[0].isFolder());
		});
		this.sendCommand = Utils.createCommand(this, this.executeSend, function () {
			var
				aItems = this.selector.listCheckedAndSelected(),
				aFileItems = _.filter(aItems, function (oItem) {
					return !oItem.isFolder();
				}, this)
			;
			return (aFileItems.length > 0);
		});
		
		this.uploaderButton = ko.observable(null);
		this.uploaderArea = ko.observable(null);
		this.bDragActive = ko.observable(false);//.extend({'throttle': 1});
	//	this.bDragActive.subscribe(function () {
	//		if (this.searchPattern() !== '')
	//		{
	//			window.console.log('bDragActive=false');
	//			this.bDragActive(false);
	//		}
	//	}, this);
	
		this.bDragActiveComp = ko.computed(function () {
			var bDrag = this.bDragActive();
			return bDrag && this.searchPattern() === '';
		}, this);
		
		this.uploadError = ko.observable(false);
		
		this.quota = ko.observable(0);
		this.used = ko.observable(0);
		this.quotaDesc = ko.observable('');
		this.quotaProc = ko.observable(-1);
		
		ko.computed(function () {
			
			if (!AppData.App.ShowQuotaBar)
			{
				return true;
			}
	
			var
				iQuota = this.quota(),
				iUsed = this.used(),
				iProc = 0 < iQuota ? Math.ceil((iUsed / iQuota) * 100) : -1;
	
			iProc = 100 < iProc ? 100 : iProc;
			
			this.quotaProc(iProc);
			this.quotaDesc(-1 < iProc ?
				Utils.i18n('MAILBOX/QUOTA_TOOLTIP', {
					'PROC': iProc,
					'QUOTA': Utils.friendlySize(iQuota)
				}) : '');
	
			return true;
			
		}, this);
		
		this.dragover = ko.observable(false);
		
		this.loading = ko.observable(false);
		this.fileListInfoText = ko.computed(function () {
			var infoText = '';
			if (!this.loading())
	/*		{
				infoText = Utils.i18n('FILESTORAGE/INFO_LOADING');
			}
			else
	*/			
			{
				if (this.collection().length === 0)
				{
					if (this.searchPattern() !== '')
					{
						infoText = Utils.i18n('FILESTORAGE/INFO_NO_ITEMS_FOUND');
					}
					else
					{
						if (this.path() === '')
						{
							infoText = Utils.i18n('FILESTORAGE/INFO_FILESTORAGE_IS_EMTY');
						}
						else
						{
							infoText = Utils.i18n('FILESTORAGE/INFO_FOLDER_IS_EMPY');
						}
					}
				}
			}
			return infoText;
		}, this);
		
		this.dragAndDropHelperBinded = _.bind(this.dragAndDropHelper, this);
		this.lastPath =  ko.observable(null);
	}
	
	/**
	 * @param {Object} $viewModel
	 */
	CFileStorageViewModel.prototype.onApplyBindings = function ($viewModel)
	{
		var self = this;
		this.selector.initOnApplyBindings(
			'.items_sub_list .item',
			'.items_sub_list .selected.item',
			'.items_sub_list .item .custom_checkbox',
			$('.panel.files .items_list', $viewModel),
			$('.panel.files .items_list .scroll-inner', $viewModel)
		);
			
		this.initUploader();
		
		$(document).on('keyup', function(ev) {
			if (ev && ev.keyCode === Enums.Key.s && self.selector.useKeyboardKeys() && !Utils.inFocus()) {
				self.isSearchFocused(true);
			}
		});	
	};
	
	/**
	 * Initializes file uploader.
	 */
	CFileStorageViewModel.prototype.initUploader = function ()
	{
		var self = this;
		
		if (this.uploaderButton() && this.uploaderArea())
		{
			this.oJua = new Jua({
				'action': '?/Upload/File/',
				'name': 'jua-uploader',
				'queueSize': 2,
				'clickElement': this.uploaderButton(),
				'dragAndDropElement': this.uploaderArea(),
				'disableAjaxUpload': false,
				'disableFolderDragAndDrop': false,
				'disableDragAndDrop': false,
				'hidden': {
					'Token': function () {
						return AppData.Token;
					},
					'AccountID': function () {
						return AppData.Accounts.currentId();
					},
					'AdditionalData':  function (oFile) {
						return JSON.stringify({
							'Type': self.storageType(),
							'SubPath': oFile && !Utils.isUnd(oFile['Folder']) ? oFile['Folder'] : '',
							'Path': self.dropPath()
						});
					}
				},
				'onProgress': _.bind(this.onFileUploadProgress, this),
				'onSelect': _.bind(this.onFileUploadSelect, this),
				'onStart': _.bind(this.onFileUploadStart, this),
				'onDrop': _.bind(this.onDrop, this),
				'onComplete': _.bind(this.onFileUploadComplete, this),
				'onBodyDragEnter': _.bind(this.bDragActive, this, true),
				'onBodyDragLeave': _.bind(this.bDragActive, this, false)
			});
		}
	};
	
	/**
	 * Creates new attachment for upload.
	 *
	 * @param {string} sUid
	 * @param {Object} oFileData
	 */
	CFileStorageViewModel.prototype.onFileUploadSelect = function (sUid, oFileData)
	{
		if (this.searchPattern() === '')
		{
			var 
				oFile = new CFileModel(),
				sFileName = oFileData.FileName,
				sFileNameExt = Utils.getFileExtension(sFileName),
				sFileNameWoExt = Utils.getFileNameWithoutExtension(sFileName),
				iIndex = 0,
				oAccount = AppData.Accounts.getDefault(),
				oDate = new Date(),
				oDateModel = new CDateModel()
			;
	
			oDateModel.parse(oDate.getTime() /1000);
			if (sFileNameExt !== '')
			{
				sFileNameExt = '.' + sFileNameExt;
			}
	
			while (!Utils.isUnd(this.getFileByName(sFileName)))
			{
				sFileName = sFileNameWoExt + '_' + iIndex + sFileNameExt;
				iIndex++;
			}
			oFile.name(sFileName).size(oFileData.Size).owner(oAccount.email()).lastModified(oDateModel.getShortDate()).path(this.path()).storageType(this.storageType()).uploadUid(sUid).uploaded(false).progress(0);
			this.uploadingFiles.push(oFile);
		}
	};
	
	/**
	 * Finds attachment by uid. Calls it's function to start upload.
	 *
	 * @param {string} sUid
	 */
	CFileStorageViewModel.prototype.onFileUploadStart = function (sUid)
	{
	};
	
	/**
	 * Finds attachment by uid. Calls it's function to progress upload.
	 *
	 * @param {string} sUid
	 * @param {number} iUploadedSize
	 * @param {number} iTotalSize
	 */
	CFileStorageViewModel.prototype.onFileUploadProgress = function (sUid, iUploadedSize, iTotalSize)
	{
		if (this.searchPattern() === '')
		{
			var oFile = this.getUploadFileByUid(sUid);
			if (iTotalSize > 0 && oFile)
			{
				oFile.progress(Math.ceil(iUploadedSize / iTotalSize * 100));
			}
		}
	};
	
	/**
	 * Finds attachment by uid. Calls it's function to complete upload.
	 *
	 * @param {string} sUid
	 * @param {boolean} bResponseReceived
	 * @param {Object} oResult
	 */
	CFileStorageViewModel.prototype.onFileUploadComplete = function (sUid, bResponseReceived, oResult)
	{
		if (this.searchPattern() === '')
		{
			var
				bError = !bResponseReceived || !oResult || !oResult.Result || oResult.Result.Error,
				sError = (oResult && oResult.Result && oResult.Result.Error === 'size') ?
					Utils.i18n('COMPOSE/UPLOAD_ERROR_SIZE') :
					Utils.i18n('COMPOSE/UPLOAD_ERROR_UNKNOWN'),
				oFile = this.getUploadFileByUid(sUid);
	
			if (oFile)
			{
				oFile.progress(0);
				oFile.uploaded(true);
			}
	
			this.deleteUploadFileByUid(sUid);
			if (bError)
			{
				this.uploadError(true);
				if (oResult)
				{
					App.Api.showErrorByCode(oResult.ErrorCode, sError);
				}
			}
			else
			{
				this.files.push(oFile);
				if (this.uploadingFiles().length === 0)
				{
					App.Api.showReport(Utils.i18n('COMPOSE/UPLOAD_COMPLETE'));
				}
			}
	
			this.getFiles(this.storageType(), this.getPathByIndex(this.iPathIndex()), this.searchPattern(), false);
		}
	};
	
	/**
	 * @param {Object} oFile
	 * @param {Object} oEvent
	 */
	CFileStorageViewModel.prototype.onDrop = function (oFile, oEvent)
	{
		if (oEvent && oEvent.target && this.searchPattern() === '')
		{
			var oFolder = ko.dataFor(oEvent.target);
			if (oFolder && oFolder instanceof CFileModel && oFolder.isFolder())
			{
				this.dropPath(this.path() + '/' + oFolder.name());
			}
		}
		else
		{
			App.Api.showReport(Utils.i18n('FILESTORAGE/INFO_CANNOT_UPLOAD_SEARCH_RESULT'));
		}
	};
	
	/**
	 * @param {Object} oFolder
	 * @param {Object} oEvent
	 * @param {Object} oUi
	 */
	CFileStorageViewModel.prototype.filesDrop = function (oFolder, oEvent, oUi)
	{
		if (oFolder)
		{
			var sToPath = oFolder.name() !== '' ? oFolder.path() + '/' + oFolder.name() : oFolder.path();
			
			if (this.path() !== sToPath && this.storageType() === oFolder.storageType() || this.storageType() !== oFolder.storageType())
			{
				oFolder.recivedAnim(true);
				Utils.uiDropHelperAnim(oEvent, oUi);
	
				var
					self = this,
					sAction = oEvent.ctrlKey ? 'FilesCopy' : 'FilesMove',
					aChecked = this.selector.listCheckedAndSelected(),
					aItems = _.map(aChecked, function (oItem) {
						if (!oEvent.ctrlKey)
						{
							if (!oItem.isFolder())
							{
								self.deleteFileByName(oItem.name());
							}
							else
							{
								self.deleteFolderByName(oItem.name());
							}
						}
						return {
							'Name':  oItem.name(),
							'IsFolder': oItem.isFolder()
						};
					})
				;
					
				App.Ajax.send({
						'Action': sAction,
						'FromType': this.storageType(),
						'ToType': oFolder.storageType(),
						'FromPath': this.path(),
						'ToPath': sToPath,
						'Files': JSON.stringify(aItems)
					}, this.onFilesMoveResponse, this
				);
			}
	/*
			else
			{
				// TODO
			}
	*/
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CFileStorageViewModel.prototype.onFilesMoveResponse = function (oData, oParameters)
	{
	//	this.getFiles(this.storageType(), this.getPathByIndex(this.iPathIndex()), this.searchPattern());
		this.getQuota(this.storageType());
	};
	
	/**
	 * @param {Object} oFile
	 */
	CFileStorageViewModel.prototype.dragAndDropHelper = function (oFile)
	{
		if (oFile)
		{
			oFile.checked(true);
		}
	
		var
			oHelper = Utils.draggableMessages(),
			nCount = this.selector.listCheckedAndSelected().length;
		
		$('.count-text', oHelper).text(Utils.i18n('FILESTORAGE/DRAG_TEXT_PLURAL', {
			'COUNT': nCount
		}, null, nCount));
	
		return oHelper;
	};
	
	CFileStorageViewModel.prototype.onItemDelete = function ()
	{
		this.executeDelete();
	};
	
	/**
	 * @param {{isFolder:Function,path:Function,name:Function,isViewable:Function,onViewClick:Function,onDownloadClick:Function}} oItem
	 */
	CFileStorageViewModel.prototype.onEnter = function (oItem)
	{
		this.onItemDblClick(oItem);
	};
	
	/**
	 * @param {{isFolder:Function,path:Function,name:Function,isViewable:Function,onViewClick:Function,onDownloadClick:Function}} oItem
	 */
	CFileStorageViewModel.prototype.onItemDblClick = function (oItem)
	{
		if (oItem)
		{
			if (oItem.isFolder())
			{
				this.aPath(this.getCollectionFromPath(oItem.path()));
				this.getFiles(this.storageType(), oItem.name());
			}
			else
			{
				if (oItem.isViewable())
				{
					oItem.onViewClick();
				}
				else
				{
					oItem.onDownloadClick();
				}
			}
		}
	};
	
	/**
	 * @param {AjaxDefaultResponse} oData
	 * @param {Object} oParameters
	 */
	CFileStorageViewModel.prototype.onFilesResponse = function (oData, oParameters)
	{
		if (oData.Result)
		{
			var 
				oDateModel = new CDateModel(),
				aFolderList = [],
				aFileList = [];
	
			if (oData.Result.Quota)
			{
				this.quota(oData.Result.Quota[0] + oData.Result.Quota[1]);
				this.used(oData.Result.Quota[0]);
			}
	
			_.each(oData.Result.Items, function (oValue) {
				var oItem = new CFileModel();
				if (oValue['IsFolder'])
				{
					oItem.name(oValue['Name']).isFolder(true).path(oValue['Path']).storageType(oValue['Type']);
					aFolderList.push(oItem);
				}
				else
				{
					oDateModel.parse(oValue['LastModified']);
					oItem
						.name(oValue['Name'])
						.size(oValue['Size'])
						.lastModified(oDateModel.getShortDate())
						.owner(oValue['Owner'])
						.path(oValue['Path'])
						.hash(oValue['Hash'])
						.shared(oValue['Shared'])
						.storageType(oValue['Type'])
					;
					
					aFileList.push(oItem);
				}
			}, this);
			
			if (oParameters.Type === this.storageType())
			{
				this.folders(aFolderList);
				this.files(aFileList);
			}
			this.loading(false);
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CFileStorageViewModel.prototype.onQuotaResponse = function (oData, oParameters)
	{
		if (oData.Result && oData.Result.Quota)
		{
			this.quota(oData.Result.Quota[0] + oData.Result.Quota[1]);
			this.used(oData.Result.Quota[0]);
		}
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CFileStorageViewModel.prototype.onFilesDeleteResponse = function (oData, oParameters)
	{
		this.getFiles(this.storageType(), this.getPathByIndex(this.iPathIndex()), this.searchPattern());
	};
	
	CFileStorageViewModel.prototype.executeRename = function ()
	{
		
		var
			fCallBack = _.bind(this.renameItem, this),
			aChecked = this.selector.listCheckedAndSelected()
		;
		
		if (aChecked[0])
		{
			App.Screens.showPopup(FileStorageRenamePopup, [aChecked[0], fCallBack]);
		}
	};
	
	CFileStorageViewModel.prototype.executeDownload = function ()
	{
		var aChecked = this.selector.listCheckedAndSelected();
		if (aChecked[0] && !aChecked[0].isFolder())
		{
			aChecked[0].onDownloadClick();
		}
	};
	
	CFileStorageViewModel.prototype.executeShare = function ()
	{
		var aChecked = this.selector.listCheckedAndSelected();
		if (aChecked[0])
		{
			App.Screens.showPopup(FileStorageSharePopup, [aChecked[0]]);
		}
	};
	
	CFileStorageViewModel.prototype.executeSend = function ()
	{
		var
			aItems = this.selector.listCheckedAndSelected(),
			aFileItems = _.filter(aItems, function (oItem) {
				return !oItem.isFolder();
			}, this)
		;
		
		if (aFileItems.length > 0)
		{
			App.Routing.goDirectly(App.Links.compose(), ['file', aFileItems]);
		}
	};
	
	/**
	 * @param {Object} oItem
	 */
	CFileStorageViewModel.prototype.onShareIconClick = function (oItem)
	{
		if (oItem)
		{
			App.Screens.showPopup(FileStorageSharePopup, [oItem]);
		}
	};
	
	/**
	 * @param {Object} oItem
	 */
	CFileStorageViewModel.prototype.renameItem = function (oItem)
	{
		App.Ajax.send({
				'Action': 'FilesRename',
				'Type': this.storageType(),
				'Path': oItem.path(),
				'Name': oItem.name(),
				'NewName': oItem.nameForEdit()
			}, this.onFilesRenameResponse, this
		);
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CFileStorageViewModel.prototype.onFilesRenameResponse = function (oData, oParameters)
	{
		this.getFiles(this.storageType(), this.getPathByIndex(this.iPathIndex()), this.searchPattern());
	};
	
	
	CFileStorageViewModel.prototype.executeDelete = function ()
	{
		var
			aChecked = this.selector.listCheckedAndSelected(),
			sWarning = Utils.i18n('FILESTORAGE/CONFIRMATION_DELETE'),
			fCallBack = _.bind(this.deleteItems, this, aChecked);
		
		if (aChecked && aChecked.length > 0)
		{
			App.Screens.showPopup(ConfirmPopup, [sWarning, fCallBack]);
		}
	};
	
	CFileStorageViewModel.prototype.onShow = function ()
	{
		this.getGroups();
		this.getFiles(this.storageType(), this.getPathByIndex(this.iPathIndex()));
		this.selector.useKeyboardKeys(true);
	
		if (this.oJua)
		{
			this.oJua.setDragAndDropEnabledStatus(true);
		}
	};
	
	CFileStorageViewModel.prototype.onHide = function ()
	{
		this.selector.useKeyboardKeys(false);
		if (this.oJua)
		{
			this.oJua.setDragAndDropEnabledStatus(false);
		}
	};
	
	/**
	 * @param {number} iType
	 */
	CFileStorageViewModel.prototype.getQuota = function (iType)
	{
		App.Ajax.send({
				'Action': 'FilesQuota',
				'Type': iType
			}, this.onQuotaResponse, this
		);
	};
	
	CFileStorageViewModel.prototype.getGroups = function ()
	{
		var oFolder = null;
		
		this.groups.removeAll();
		
		oFolder = new CFileModel();
		oFolder.storageType(Enums.FileStorageType.Private).displayName(Utils.i18n('FILESTORAGE/TAB_PRIVATE_FILES')).isFolder(true);
		this.groups.push(oFolder);
	
		oFolder = new CFileModel();
		oFolder.storageType(Enums.FileStorageType.Corporate).displayName(Utils.i18n('FILESTORAGE/TAB_CORPORATE_FILES')).isFolder(true);
		this.groups.push(oFolder);
	};
	
	/**
	 * @param {number} iType
	 * @param {string=} sPath = ''
	 * @param {string=} sPattern = ''
	 * @param {boolean=} bLoading = true
	 */
	CFileStorageViewModel.prototype.getFiles = function (iType, sPath, sPattern, bLoading)
	{
		this.lastPath(this.path());
		if (Utils.isUnd(bLoading) || !Utils.isUnd(bLoading) && bLoading)
		{
			this.loading(true);
		}
		
		
		sPattern = Utils.isUnd(sPattern) ? '' : Utils.pString(sPattern);
	        
		this.storageType(iType);
		this.searchPattern(sPattern);
		var oFolder = new CFileModel();
		if (Utils.isUnd(sPath) || sPath === '')
		{
			this.aPath.removeAll();
			oFolder.displayName(this.rootPath());
		}
		else
		{
			oFolder.name(sPath);
		}
		oFolder.path(this.getFullPathByIndex(this.aPath().length)).storageType(iType).isFolder(true);
		
		this.aPath.push(oFolder);
		
		this.iPathIndex(this.aPath().length - 1);
		
		if (this.lastPath() !== this.path())
		{
			this.folders([]);
			this.files([]);
		}
		
		App.Ajax.send({
				'Action': 'Files',
				'Type': iType,
				'Path': this.path(),
				'Pattern': this.searchPattern()
			}, this.onFilesResponse, this
		);
	};
	
	/**
	 * @param {Array} aChecked
	 * @param {boolean} bOkAnswer
	 */
	CFileStorageViewModel.prototype.deleteItems = function (aChecked, bOkAnswer)
	{
		if (bOkAnswer && 0 < aChecked.length)
		{
			var
				aItems = _.map(aChecked, function (oItem) {
					oItem.deleted(true);
					return {
						'Path': oItem.path(),  
						'Name': oItem.name()
					};
				});
			
			App.Ajax.send({
					'Action': 'FilesDelete',
					'Type': this.storageType(),
					'Path': this.path(),
					'Items': JSON.stringify(aItems)		
				}, this.onFilesDeleteResponse, this
			);
		}		
	};
	
	/**
	 * @param {number} iIndex
	 * 
	 * @return {string}
	 */
	CFileStorageViewModel.prototype.getPathByIndex = function (iIndex)
	{
		var 
			oItem = this.aPath()[iIndex],
			sPath = '';
		this.aPath(this.aPath().slice(0, iIndex));
		if (oItem)
		{
			sPath = oItem.name();
		}
		return sPath;
	};
	
	/**
	 * @param {number} iIndex
	 * 
	 * @return {string}
	 */
	CFileStorageViewModel.prototype.getFullPathByIndex = function (iIndex)
	{
		var 
			aPath = _.map(this.aPath().slice(0, iIndex), function (oItem){
				return oItem.name();
			});
		
	    return aPath.join('/');
	};
	
	/**
	 * @param {string} sPath
	 * 
	 * @return {Array}
	 */
	CFileStorageViewModel.prototype.getCollectionFromPath = function (sPath)
	{
		var 
			aColl = [],
			aPath = [],
			oFolder = null;
		
		if (sPath !== '')
		{
			aPath = sPath.split('/');
			var 
				aItemPath = [], 
				sItemPath = '', 
				aItemPathTmp = [],
				sDisplayName = ''
			;
			_.each(aPath, function (sName){
				sDisplayName = sName;
				if (sName === '')
				{
					sDisplayName = this.rootPath();
				}
				aItemPath.push(sName);
				aItemPathTmp = aItemPath.slice(0, -1);
				sItemPath = aItemPathTmp.join('/');
				oFolder = new CFileModel();
				oFolder.name(sName).displayName(sDisplayName).isFolder(true).path(sItemPath).storageType(this.storageType());
				aColl.push(oFolder);
			}, this);
		}
		else
		{
			oFolder = new CFileModel();
			oFolder.displayName(this.rootPath()).isFolder(true).storageType(this.storageType());
			aColl.push(oFolder);
		}
		
		return aColl;
	};
	
	/**
	 * @param {string} sName
	 * 
	 * @return {?}
	 */
	CFileStorageViewModel.prototype.getFileByName = function (sName)
	{
		return _.find(this.files(), function(oItem){return oItem.name() === sName;});	
	};
	
	/**
	 * @param {string} sName
	 */
	CFileStorageViewModel.prototype.deleteFileByName = function (sName)
	{
		var files = _.filter(this.files(), function (oItem) {
			return oItem.name() !== sName;
		});
		this.files(files);
	};
	
	/**
	 * @param {string} sName
	 */
	CFileStorageViewModel.prototype.deleteFolderByName = function (sName)
	{
		var folders = _.filter(this.folders(), function (oItem) {
			return oItem.name() !== sName;
		});
		this.folders(folders);
	};
	
	/**
	 * @param {string} sUid
	 * 
	 * @return {?}
	 */
	CFileStorageViewModel.prototype.getUploadFileByUid = function (sUid)
	{
		return _.find(this.uploadingFiles(), function(oItem){
			return oItem.uploadUid() === sUid;
		});	
	};
	
	/**
	 * @param {string} sUid
	 */
	CFileStorageViewModel.prototype.deleteUploadFileByUid = function (sUid)
	{
		var uploadingFiles = _.filter(this.uploadingFiles(), function (oItem) {
			return oItem.uploadUid() !== sUid;
		});
		this.uploadingFiles(uploadingFiles);
	};
	
	/**
	 * @return {Array}
	 */
	CFileStorageViewModel.prototype.getUploadingFiles = function ()
	{
		var 
			aResult = [],
			uploadingFiles = this.uploadingFiles(),
			self = this;
	        
		if (!Utils.isUnd(uploadingFiles))
		{
			aResult = _.filter(uploadingFiles, function(oItem){
				return oItem.path() === self.path() && oItem.storageType() === self.storageType();
			});	
		}
		return aResult;
	};
	
	/**
	 * @param {string} sUid
	 */
	CFileStorageViewModel.prototype.onCancelUpload = function (sUid)
	{
		if (this.oJua)
		{
			this.oJua.cancel(sUid);
		}
		this.deleteUploadFileByUid(sUid);
	};
	
	/**
	 * @param {Object} oData
	 * @param {Object} oParameters
	 */
	CFileStorageViewModel.prototype.onCreateFolderResponse = function (oData, oParameters)
	{
		this.getFiles(this.storageType(), this.getPathByIndex(this.iPathIndex()));
	};
	
	/**
	 * @param {string} sFolderName
	 */
	CFileStorageViewModel.prototype.createFolder = function (sFolderName)
	{
		App.Ajax.send({
				'Action': 'FilesFolderCreate',
				'Type': this.storageType(),
				'Path': this.path(),
				'FolderName': sFolderName
			}, this.onCreateFolderResponse, this
		);
			
	};
	
	CFileStorageViewModel.prototype.onCreateFolderClick = function ()
	{
		var fCallBack = _.bind(this.createFolder, this);
	
		App.Screens.showPopup(FileStorageFolderCreatePopup, [fCallBack]);
	};
	
	CFileStorageViewModel.prototype.onSearch = function ()
	{
		this.getFiles(this.storageType(), this.getPathByIndex(this.iPathIndex()), this.searchPattern());
	};
	
	CFileStorageViewModel.prototype.clearSearch = function ()
	{
		this.getFiles(this.storageType(), this.getPathByIndex(this.iPathIndex()));
	};
	/**
	 * @constructor
	 */
	function CHelpdeskViewModel()
	{
		var 
			self = this,
			fChangeStateHelper = function(state) {
				return function () {
					self.executeChangeState(state);
					self.isQuickReplyHidden(!self.bAgent);
					
					if (state === Enums.HelpdeskThreadStates.Resolved)
					{
						self.selectedItem(null);
					}
				};
			}
		;
		
		//use different ajax functions for different application
		this.bRtl = Utils.isRTL();
	//	console.log(Utils.isRTL());
		this.bExtApp = bExtApp;
		this.sendFunc = this.bExtApp ? 'sendExt' : 'send';
		this.bAgent = AppData.User.IsHelpdeskAgent;
		this.singleMode = AppData.SingleMode;
	
		this.externalUrl = ko.observable(AppData.HelpdeskIframeUrl);
		
		this.loadingList = ko.observable(true);
		this.loadingViewPane = ko.observable(false);
		this.loadingMoreMessages = ko.observable(false);
		
		this.threads = ko.observableArray([]);
		this.posts = ko.observableArray([]);
		
		this.selectedItem = ko.observable(null);
		this.selectedItem.subscribe(function () {
			
			this.subject(this.selectedItem() ? (this.bExtApp ?
				this.selectedItem().sSubject : this.selectedItem().sFromFull) : '');
	
			this.internalNote(false);
				
			if (!this.bExtApp && this.selectedItem())
			{
				App.ContactsCache.getContactByEmail(this.selectedItem().sEmail, this.onOwnerContactResponse, this);
			}
		}, this);
		
		this.listFilter = ko.observable(this.bAgent ? Enums.HelpdeskFilters.Open : Enums.HelpdeskFilters.All);
		this.listFilter.subscribe(function () {
			this.requestThreadsList();
	//		this.selector.itemSelected(null);
	//		this.selectedItem(null);
		}, this);
		this.prevListFilter = ko.observable('');
		
		this.hasMorePosts = ko.computed(function () {
			var oItem = this.selectedItem();
			return oItem && oItem.postsCount() > this.posts().length;
		}, this);
		
		//list selector
		this.selector = new CSelector(
			this.threads,
			_.bind(this.onItemClick, this),
			_.bind(this.onItemDelete, this),
			_.bind(this.onItemDblClick, this),
			null, null, false, false, false, true
		);
	
		this.checkStarted = ko.observable(false);
		
		this.checkAll = this.selector.koCheckAll();
		this.checkAllIncomplite = this.selector.koCheckAllIncomplete();
		
		this.ThreadsPerPage = 10;
		//TODO use own PerPage param
		this.oPageSwitcher = new CPageSwitcherViewModel(0, this.ThreadsPerPage);
		
		this.oPageSwitcher.currentPage.subscribe(function () {
			this.requestThreadsList();
		}, this);
		
		//search
		this.isSearchFocused = ko.observable(false);
		this.searchPattern = ko.observable('');
		this.search = ko.observable('');
		
		this.search.subscribe(function (sValue) {
			this.searchPattern(sValue);
		}, this);
		
		this.searchText = ko.computed(function () {
			return Utils.i18n('HELPDESK/INFO_SEARCH_RESULT', {
				'SEARCH': this.search()
			});
		}, this);
	
		this.searchSubmitCommand = Utils.createCommand(this, function () {
	
			this.oPageSwitcher.currentPage(1);
			this.search(this.searchPattern());
	
			this.requestThreadsList();
		});
	
		//commands
		this.deleteCommand = Utils.createCommand(this, this.executeDelete, this.isEnableListActions);
	
		this.openNewWindowCommand = Utils.createCommand(this, this.executeOpenNewWindow, this.isEnableListActions);
	
		this.checkCommand = Utils.createCommand(this, function () {
			this.requestThreadsList();
			this.requestPosts();
		});
		
		this.closeCommand = Utils.createCommand(this, fChangeStateHelper(Enums.HelpdeskThreadStates.Resolved), this.isEnableListActions);
		this.waitCommand = Utils.createCommand(this, fChangeStateHelper(Enums.HelpdeskThreadStates.Waiting), this.isEnableListActions);
		this.pendingCommand = Utils.createCommand(this, fChangeStateHelper(Enums.HelpdeskThreadStates.Pending), this.isEnableListActions);
		this.deferCommand = Utils.createCommand(this, fChangeStateHelper(Enums.HelpdeskThreadStates.Deferred), this.isEnableListActions);
		this.answerCommand = Utils.createCommand(this, fChangeStateHelper(Enums.HelpdeskThreadStates.Answered), this.isEnableListActions);
		
		this.postCommand = Utils.createCommand(this, this.executePostCreate, function () {
			return !!this.selectedItem() && 
				this.posts().length > 0 && 
				this.replyText().length > 0 &&
				this.allAttachmentsUploaded();
		});
		
		this.visibleNewThread = ko.observable(false);
		this.newThreadText = ko.observable('');
		this.newThreadCreating = ko.observable(false);
		this.createThreadCommand = Utils.createCommand(this, this.executeThreadCreate, function () {
			return this.visibleNewThread() && this.newThreadText().length > 0 && !this.newThreadCreating();
		});
		this.createThreadButtonText = ko.computed(function () {
			return this.newThreadCreating() ?
				Utils.i18n('HELPDESK/BUTTON_SENDING') :
				Utils.i18n('HELPDESK/BUTTON_CREATE');
		}, this);
		
		this.showThreadsByOwnerCommand = Utils.createCommand(this, this.executeShowThreadsByOwner);
		
		this.commandGetOlderPosts = function () {
			var 
				aList = this.posts(),
				iPostId  = aList[0] ? aList[0].Id : 0
			;
			
			this.requestPosts(null, iPostId);
		};
	
		this.externalContentUrl = ko.observable('');
	
		if (AppData.HelpdeskIframeUrl)
		{
			if (this.bAgent)
			{
				this.externalContentUrl = ko.computed(function () {
	
					var
						sEmail = '',
						oSelected = this.selectedItem()
					;
	
					if (oSelected)
					{
						sEmail = oSelected.Email();
					}
	
					if (sEmail)
					{
						return AppData.HelpdeskIframeUrl.replace(/\[EMAIL\]/g, sEmail);
					}
	
					return '';
	
				}, this);
			}
			else if (AppData.User.Email)
			{
				this.externalContentUrl = ko.computed(function () {
					return AppData.HelpdeskIframeUrl.replace(/\[EMAIL\]/g, AppData.User.Email);
				}, this);
			}
		}
	
		// view pane
		var bUserDetails = App.Storage.hasData('HelpdeskUserDetails') ? App.Storage.getData('HelpdeskUserDetails') : true;
		this.clientDetailsVisible = ko.observable(bUserDetails);
		this.clientDetailsVisible.subscribe(function (value) {
			App.Storage.setData('HelpdeskUserDetails', value);
		}, this);
		
		this.subject = ko.observable('');
		this.ownerExistsInContacts = ko.observable(false);
		this.ownerContactInfoReceived = ko.observable(false);
		this.ownerContact = ko.observable(!this.bExtApp ? new CContactModel() : null);
		this.hasOwnerContact = ko.computed(function () {
			return !this.singleMode && this.ownerContactInfoReceived() && this.ownerExistsInContacts();
		}, this);
		this.visibleAddToContacts = ko.computed(function () {
			return !this.singleMode && this.ownerContactInfoReceived() && !this.ownerExistsInContacts();
		}, this);
		this.viewAllMailsWithContactBinded = _.bind(this.viewAllMailsWithContact, this);
		
		this.uploadedFiles = ko.observableArray([]);
		this.allAttachmentsUploaded = ko.computed(function () {
			var
				aNotUploadedFiles = _.filter(this.uploadedFiles(), function (oFile) {
					return !oFile.uploaded();
				})
			;
			
			return aNotUploadedFiles.length === 0;
		}, this);
		this.uploaderButton = ko.observable(null);
		this.uploaderButtonCompose = ko.observable(null);
		this.uploaderArea = ko.observable(null);
		this.bDragActive = ko.observable(false);//.extend({'throttle': 1});
	
		this.internalNote = ko.observable(false);
		
		this.isQuickReplyHidden = ko.observable(!this.bAgent);
		this.domQuickReply = ko.observable(null);
		this.replySendingStarted = ko.observable(false);
		this.replyPaneVisible = ko.observable(true);
		this.replyText = ko.observable('');
		this.replyTextFocus = ko.observable(false);
		this.isQuickReplyActive = ko.observable(false);
		this.replyTextFocus.subscribe(function () {
			if (this.replyTextFocus())
			{
				this.isQuickReplyActive(true);
			}
		}, this);
		this.isQuickReplyActive.subscribe(function () {
			if (this.isQuickReplyActive())
			{
				this.replyTextFocus(true);
			}
		}, this);
		this.isEmptyQuickReplyPane = ko.computed(function () {
			return this.replyText().length === 0 &&
				!this.internalNote() && 
				this.uploadedFiles().length === 0;
		}, this);
	
		// view pane //
		
		this.isSearch = ko.computed(function () {
			return '' !== this.search();
		}, this);
	
		this.isEmptyList = ko.computed(function () {
			return 0 === this.threads().length;
		}, this);
	
		if (this.bAgent)
		{
			this.dynamicEmptyListInfo = ko.computed(function () {
				return this.isEmptyList() && this.isSearch() ?
					Utils.i18n('HELPDESK/INFO_SEARCH_EMPTY') : Utils.i18n('HELPDESK/INFO_EMPTY_OPEN_THREAD_LIST_AGENT');
			}, this);
		}
		else
		{
			this.dynamicEmptyListInfo = ko.computed(function () {
				return this.isEmptyList() && this.isSearch() ?
					Utils.i18n('HELPDESK/INFO_SEARCH_EMPTY') : Utils.i18n('HELPDESK/INFO_EMPTY_THREAD_LIST');
			}, this);
		}
	
		this.simplePreviewPane = ko.computed(function () {
			var oItem = this.selectedItem();
			return oItem ? oItem.ItsMe : !this.bAgent;
		}, this);
	
		this.allowInternalNote = ko.computed(function () {
			return !this.simplePreviewPane();
		}, this);
	
		this.scrollToTopTrigger = ko.observable(false);
		this.scrollToBottomTrigger = ko.observable(false);
		
		this.allowDownloadAttachmentsLink = false;
		
		this.newThreadButtonWidth = ko.observable(0);
	}
	
	CHelpdeskViewModel.prototype.clearQuickReply = function ()
	{
		this.replyText('');
		this.replyTextFocus(false);
		this.internalNote(false);
		this.uploadedFiles([]);
		this.isQuickReplyActive(false);
	};
	
	/**
	 * @param {Object} oContact
	 */
	CHelpdeskViewModel.prototype.onOwnerContactResponse = function (oContact)
	{
		if (oContact)
		{
			this.ownerContact(oContact);
			this.ownerExistsInContacts(true);
		}
		else
		{
			this.ownerContact(new CContactModel());
			this.ownerExistsInContacts(false);
		}
		
		this.ownerContactInfoReceived(true);
	};
	
	CHelpdeskViewModel.prototype.updateOpenerWindow = function ()
	{
		if (this.singleMode && window.opener && window.opener.App)
		{
			window.opener.App.updateHelpdesk();
		}
	};
	
	/**
	 * @param {Object} oPost
	 */
	CHelpdeskViewModel.prototype.deletePost = function (oPost)
	{
		if (oPost && oPost.itsMe())
		{
			var
				self = this,
				fAction = function (bResult) {
					if (bResult)
					{
						App.Ajax[self.sendFunc]({
							'Action': 'HelpdeskPostDelete',
							'PostId': oPost.Id,
							'ThreadId': oPost.IdThread,
							'IsExt': self.bExtApp ? 1 : 0
						}, self.onHelpdeskPostDeleteResponse, self);
					}
				}
			;
	
			App.Screens.showPopup(ConfirmPopup, [Utils.i18n('HELPDESK/CONFIRM_DELETE_THIS_POST'), fAction]);
		}
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CHelpdeskViewModel.prototype.onHelpdeskPostDeleteResponse = function (oResponse, oRequest)
	{
		if (oResponse.Result === false)
		{
			App.Api.showErrorByCode(oResponse.ErrorCode, Utils.i18n('HELPDESK/ERROR_COULDNT_DELETE_POST'));
		}
		else
		{
			App.Api.showReport(Utils.i18n('HELPDESK/REPORT_POST_HAS_BEEN_DELETED'));
		}
	
		this.requestPosts();
		this.updateOpenerWindow();
	};
	
	CHelpdeskViewModel.prototype.addToContacts = function ()
	{
		if (this.selectedItem())
		{
			App.ContactsCache.addToContacts('', this.selectedItem().sEmail, this.onAddToContactsResponse, this);
		}
	};
	
	CHelpdeskViewModel.prototype.iHaveMoreToSay = function ()
	{
		var self = this;
		this.isQuickReplyHidden(false);
		_.delay(function () {
			self.replyTextFocus(true);
		}, 300);
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CHelpdeskViewModel.prototype.onAddToContactsResponse = function (oResponse, oRequest)
	{
		if (oResponse.Result && this.selectedItem() && oRequest.HomeEmail !== '' && oRequest.HomeEmail === this.selectedItem().sEmail)
		{
			App.Api.showReport(Utils.i18n('CONTACTS/REPORT_CONTACT_SUCCESSFULLY_ADDED'));
			App.ContactsCache.clearInfoAboutEmail(this.selectedItem().sEmail);
			App.ContactsCache.getContactByEmail(this.selectedItem().sEmail, this.onOwnerContactResponse, this);
		}
	};
	
	CHelpdeskViewModel.prototype.viewAllMailsWithContact = function ()
	{
		if (this.selectedItem() && this.selectedItem().sEmail)
		{
			App.MailCache.searchMessagesInCurrentFolder('email:' + this.selectedItem().sEmail);
		}
	};
	
	CHelpdeskViewModel.prototype.scrollPostsToBottom = function ()
	{
		this.scrollToBottomTrigger(!this.scrollToBottomTrigger());
	};
	
	CHelpdeskViewModel.prototype.scrollPostsToTop = function ()
	{
		this.scrollToTopTrigger(!this.scrollToTopTrigger());
	};
	
	CHelpdeskViewModel.prototype.showClientDetails = function ()
	{
		this.clientDetailsVisible(true);
	};
	
	CHelpdeskViewModel.prototype.hideClientDetails = function ()
	{
		this.clientDetailsVisible(false);
	};
	
	/**
	 * @param {Object} $viewModel
	 */
	CHelpdeskViewModel.prototype.onApplyBindings = function ($viewModel)
	{
		this.selector.initOnApplyBindings(
			'.items_sub_list .item',
			'.items_sub_list .selected.item',
			'.items_sub_list .item .custom_checkbox',
			$('.items_list', $viewModel),
			$('.items_list .scroll-inner', $viewModel)
		);
		
		this.initUploader();
		
		$(this.domQuickReply()).on('click', _.bind(function (oEvent) {
			this.isQuickReplyActive(true);
			oEvent.stopPropagation();
		}, this));
		$(document.body).on('click', _.bind(function () {
			if (this.isEmptyQuickReplyPane())
			{
				this.isQuickReplyActive(false);
			}
		}, this));
		
		if (App.registerHelpdeskUpdateFunction)
		{
			App.registerHelpdeskUpdateFunction(_.bind(this.checkCommand, this));
		}
	};
	
	CHelpdeskViewModel.prototype.onShow = function ()
	{
		this.selector.useKeyboardKeys(true);
		
		this.oPageSwitcher.perPage(this.ThreadsPerPage);
		this.oPageSwitcher.currentPage(1);
		
		this.requestThreadsList();
	};
	
	CHelpdeskViewModel.prototype.onHide = function ()
	{
		this.selector.useKeyboardKeys(false);
		this.selectedItem(null);
	};
	
	CHelpdeskViewModel.prototype.requestThreadsList = function ()
	{	
	//	this.threads([]);
		this.loadingList(true);
		this.checkStarted(true);
	
		App.Ajax[this.sendFunc]({
			'Action': 'HelpdeskThreadsList',
			'IsExt': this.bExtApp ? 1 : 0,
			'Offset': (this.oPageSwitcher.currentPage() - 1) * this.ThreadsPerPage,
			'Limit': this.ThreadsPerPage,
			'Filter': this.listFilter(),
			'Search': this.search()
		}, this.onHelpdeskThreadsListResponse, this);
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CHelpdeskViewModel.prototype.onHelpdeskThreadsListResponse = function (oResponse, oRequest)
	{
		var
			iIndex = 0,
			iLen = 0,
			oSelectedItem = this.selectedItem(),
			sSelectedId = oSelectedItem ? Utils.pString(oSelectedItem.Id) : '',
			aList = [],
			oObject = null,
			oThreadForSelect = null,
			aThreadList = (oResponse.Result && _.isArray(oResponse.Result.List)) ? oResponse.Result.List : []
		;
	
		if (oResponse.Result === false)
		{
			App.Api.showErrorByCode(oResponse.ErrorCode);
		}
		else
		{
			for (iLen = aThreadList.length; iIndex < iLen; iIndex++)
			{
				if (aThreadList[iIndex] && 'Object/CHelpdeskThread' === Utils.pExport(aThreadList[iIndex], '@Object', ''))
				{
					oObject = new CThreadListModel();
					oObject.parse(aThreadList[iIndex]);
					oObject.OwnerIsMe = Utils.pString(oObject.IdOwner);
	
					if (sSelectedId === Utils.pString(oObject.Id))
					{
						oSelectedItem.postsCount(oObject.postsCount());
						
						oObject.selected(true);
						this.selector.itemSelected(oObject);
					}
	
					aList.push(oObject);
				}
			}
			
			this.loadingList(false);
			this.checkStarted(false);
	
			this.threads(aList);
	
			this.oPageSwitcher.setCount(Utils.pInt(oResponse.Result.ItemsCount));
			
			if (AppData.HelpdeskThreadId)
			{
				oThreadForSelect = _.find(aList, function (oThreadItem) {
					return oThreadItem.Id === AppData.HelpdeskThreadId;
				}, this);
	
				if (oThreadForSelect)
				{
					oThreadForSelect = /** @type {Object} */ oThreadForSelect;
					this.onItemSelect(oThreadForSelect);
				}
			}
		}
	};
	
	/**
	 * @param {Object=} oItem = undefined
	 * @param {number=} iStartFromId = 0
	 */
	CHelpdeskViewModel.prototype.requestPosts = function (oItem, iStartFromId)
	{
		var 
			oSelectedThread = this.selectedItem(),
			iId = oItem ? oItem.Id : (oSelectedThread ? oSelectedThread.Id : 0),
			iFromId = iStartFromId ? iStartFromId : 0,
			oParameters = {}
		;
	
		if (iId)
		{
			oParameters = {
				'Action': 'HelpdeskThreadPosts',
				'IsExt': this.bExtApp ? 1 : 0,
				'ThreadId': iId,
				'StartFromId': iFromId,
				'Limit': 5
			};
			
			if (iFromId)
			{
				this.loadingMoreMessages(true);
			}
	//		else
	//		{
	//			this.posts([]);
	//			this.loadingViewPane(true);
	//		}
			
			App.Ajax[this.sendFunc](oParameters, this.onHelpdeskThreadPostsResponse, this);
		}
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CHelpdeskViewModel.prototype.onHelpdeskThreadPostsResponse = function (oResponse, oRequest)
	{
		var
			self = this,
			bScrollToBottom = false,
			iIndex = 0,
			iLen = 0,
			aList = [],
			oObject = null,
			aPostList = (oResponse.Result && _.isArray(oResponse.Result.List)) ? oResponse.Result.List : []
		;
	
		if (oResponse.Result === false)
		{
			App.Api.showErrorByCode(oResponse.ErrorCode);
		}
		else
		{	
			if (this.selectedItem() && oResponse.Result.ThreadId === this.selectedItem().Id)
			{
				this.selectedItem().postsCount(Utils.pInt(oResponse.Result.ItemsCount));
				
				for (iLen = aPostList.length; iIndex < iLen; iIndex++)
				{
					if (aPostList[iIndex] && 'Object/CHelpdeskPost' === Utils.pExport(aPostList[iIndex], '@Object', ''))
					{
						oObject = new CPostModel();
						oObject.parse(aPostList[iIndex]);
	
						aList.push(oObject);
						
					}
				}
				
				if (oResponse.Result.StartFromId)
				{
					var 
						aPosts = this.posts(),
						startFromId = oResponse.Result.StartFromId
					;
	
					for (iLen = aPosts.length, iIndex = 0; iIndex < iLen; iIndex++)
					{
						if (aPosts.Id === startFromId)
						{
							break;
						}
					}
	
					aList = _.union(_.first(aPosts, iIndex).reverse(), aList);
					this.loadingMoreMessages(false);
				}
				else
				{
					bScrollToBottom = true;
				}
				
				if (this.selectedItem().unseen())
				{
					this.executeThreadSeen(this.selectedItem().Id);
				}
			}
			
	//		this.loadingViewPane(false);
			this.posts(aList.reverse());
	
			if (bScrollToBottom)
			{
				self.scrollPostsToBottom();
				
				_.delay(function () {
					self.scrollPostsToBottom();
				}, 10);
	
				_.delay(function () {
					self.scrollPostsToBottom();
				}, 100);
			}
			else
			{
				self.scrollPostsToTop();
			}
		}
	};
	
	/**
	 * @param {Object} oItem
	 */
	CHelpdeskViewModel.prototype.onItemClick = function (oItem)
	{
		var bSame = App.Routing.setHash([Enums.Screens.Helpdesk, oItem.ThreadHash]);
		
		if (bSame)
		{
			this.onItemSelect(oItem);
		}
	};
	
	/**
	 * @param {Array} aParams
	 */
	CHelpdeskViewModel.prototype.onRoute = function (aParams)
	{
		var
			sThreadHash = aParams[0],
			oItem = _.find(this.threads(), function (oThread) {
				return oThread.ThreadHash === sThreadHash;
			})
		;
		
		if (oItem)
		{
			oItem = /** @type {Object} */ oItem;
			this.onItemSelect(oItem);
		}
		else if (this.threads().length === 0 && this.loadingList() && this.threadSubscription === undefined && !AppData.SingleMode)
		{
			this.threadSubscription = this.threads.subscribe(function () {
				this.onRoute(aParams);
				this.threadSubscription.dispose();
				this.threadSubscription = undefined;
			}, this);
		}
		else if (sThreadHash)
		{
			App.Ajax[this.sendFunc]({
				'Action': 'HelpdeskGetThreadByHash',
				'IsExt': this.bExtApp ? 1 : 0,
				'ThreadHash': sThreadHash
			}, this.onHelpdeskGetThreadByHashResponse, this);
		}
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CHelpdeskViewModel.prototype.onHelpdeskGetThreadByHashResponse = function (oResponse, oRequest)
	{
		var oItem = new CThreadListModel();
		if (oResponse.Result)
		{
			oItem.parse(oResponse.Result);
			oItem.OwnerIsMe = Utils.pString(oItem.IdOwner);
			this.onItemSelect(oItem);
		}
	};
	
	/**
	 * @param {Object} oItem
	 */
	CHelpdeskViewModel.prototype.onItemSelect = function (oItem)
	{
		//store current selection
		var oSelectedItem = this.selectedItem();
		this.visibleNewThread(false);
		
		//clear and set previos selection
		this.selector.listCheckedAndSelected(false);
		this.selector.itemSelected(oSelectedItem);
	
		if (this.selectedItem() === null || this.selectedItem().Id !== oItem.Id)
		{
			if (this.uploadedFiles().length > 0 || this.replyText().length > 0)
			{
				var 
					sConfirm = Utils.i18n('HELPDESK/CONFIRM_CANCEL_REPLY'),
					fAction = _.bind(function (bResult) {
						if (bResult)
						{
							this.clearQuickReply();
							
							this.selector.itemSelected(oItem);
							this.selectedItem(oItem);
							this.visibleNewThread(false);
	
							this.isQuickReplyHidden(oItem.ItsMe || !this.bAgent);
							this.requestPosts(oItem);
						}
						else
						{
							this.replyTextFocus(true);
							this.isQuickReplyHidden(false);
							
							this.selector.itemSelected(oSelectedItem);
							this.selectedItem(oSelectedItem);
						}
					}, this)
				;
			
				App.Screens.showPopup(ConfirmPopup, [sConfirm, fAction]);
				
			}
			else
			{
				this.clearQuickReply();
				
				this.selector.itemSelected(oItem);
				this.selectedItem(oItem);
				
				this.isQuickReplyHidden(oItem.ItsMe || !this.bAgent);
				this.requestPosts(oItem);
			}
		}
	};
	
	CHelpdeskViewModel.prototype.onItemDelete = function ()
	{
		this.executeDelete();
	};
	
	/**
	 * @param {{isViewable:Function,onViewClick:Function,onDownloadClick:Function}} oItem
	 */
	CHelpdeskViewModel.prototype.onEnter = function (oItem)
	{
		this.onItemDblClick(oItem);
	};
	
	/**
	 * @param {{isViewable:Function,onViewClick:Function,onDownloadClick:Function}} oItem
	 */
	CHelpdeskViewModel.prototype.onItemDblClick = function (oItem)
	{
		if (oItem)
		{
			if (oItem.isViewable())
			{
				oItem.onViewClick();
			}
			else
			{
				oItem.onDownloadClick();
			}
		}
	};
	
	CHelpdeskViewModel.prototype.openNewThread = function ()
	{	
		if (this.uploadedFiles().length > 0 || this.replyText().length > 0)
		{
			var 
				sConfirm = Utils.i18n('HELPDESK/CONFIRM_CANCEL_REPLY'),
				fAction = _.bind(function (bResult) {
					if (bResult)
					{
						this.clearQuickReply();
						this.visibleNewThread(true);
					}
					else
					{
						this.visibleNewThread(false);
					}
				}, this)
			;
			
			App.Screens.showPopup(ConfirmPopup, [sConfirm, fAction]);
		}
		else
		{
			this.selector.itemSelected(null);
			this.selectedItem(null);
			this.visibleNewThread(true);
		}
	};
	
	CHelpdeskViewModel.prototype.cancelNewThread = function ()
	{
		if (this.uploadedFiles().length > 0 || this.newThreadText().length > 0)
		{
			var
				sConfirm = Utils.i18n('HELPDESK/CONFIRM_CANCEL_REPLY'),
				fAction = _.bind(function (bResult) {
					if (bResult)
					{
						this.newThreadText('');
						this.uploadedFiles([]);
						this.visibleNewThread(false);
					}
				}, this)
			;
	
			App.Screens.showPopup(ConfirmPopup, [sConfirm, fAction]);
		}
		else
		{
			this.newThreadText('');
			this.uploadedFiles([]);
			this.visibleNewThread(false);
			
			this.selector.itemSelected(null);
			this.selectedItem(null);
		}
	};
	
	CHelpdeskViewModel.prototype.onSearch = function ()
	{
		this.requestThreadsList(); // TODO on error action
	};
	
	CHelpdeskViewModel.prototype.clearSearch = function ()
	{
		this.requestThreadsList(); // TODO on error action
	};
	
	CHelpdeskViewModel.prototype.isEnableListActions = function ()
	{
		return !!this.selectedItem();
	};
	
	CHelpdeskViewModel.prototype.executeDelete = function ()
	{
		var
			self = this,
			oSelectedItem = this.selectedItem()
		;
	
		if (oSelectedItem)
		{
			_.each(this.threads(), function (oItem) {
				if (oItem === oSelectedItem)
				{
					oItem.deleted(true);
				}
			});
	
			_.delay(function () {
				self.threads.remove(function (oItem) {
					return oItem.deleted();
				});
			}, 500);
	
			this.selectedItem(null);
	
			App.Ajax[this.sendFunc]({
				'Action': 'HelpdeskThreadDelete',
				'IsExt': this.bExtApp ? 1 : 0,
				'ThreadId': oSelectedItem.Id
			}, this.onHelpdeskThreadDeleteResponse, this);
		}
	};
	
	CHelpdeskViewModel.prototype.executeOpenNewWindow = function ()
	{
		var sUrl = App.Routing.buildHashFromArray([Enums.Screens.SingleHelpdesk, this.selectedItem().ThreadHash]);
		
		Utils.WindowOpener.openTab(sUrl);
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CHelpdeskViewModel.prototype.onHelpdeskThreadDeleteResponse = function (oResponse, oRequest)
	{
		this.requestThreadsList();
		this.updateOpenerWindow();
	};
	
	/**
	 * @param {number} iState
	 */
	CHelpdeskViewModel.prototype.executeChangeState = function (iState)
	{
		var oSelectedItem = this.selectedItem();
		
		if (iState === undefined)
		{
			return;
		}
	
		//TODO can't delete thread with id = 0
		if (oSelectedItem)
		{
			oSelectedItem.state(iState);
			
			App.Ajax[this.sendFunc]({
				'Action': 'HelpdeskThreadChangeState',
				'IsExt': this.bExtApp ? 1 : 0,
				'ThreadId': oSelectedItem.Id,
				'Type': oSelectedItem.state()
			}, this.onHelpdeskThreadChangeStateResponse, this);
		}
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CHelpdeskViewModel.prototype.onHelpdeskThreadChangeStateResponse = function (oResponse, oRequest)
	{
		this.requestThreadsList();
		this.updateOpenerWindow();
	};
	
	/**
	 * @param {number} iId
	 */
	CHelpdeskViewModel.prototype.executeThreadSeen = function (iId)
	{
		if (iId === undefined)
		{
			return;
		}
	
		App.Ajax[this.sendFunc]({
			'Action': 'HelpdeskThreadSeen',
			'IsExt': this.bExtApp ? 1 : 0,
			'ThreadId': iId
		}, this.onHelpdeskThreadSeenResponse, this);
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CHelpdeskViewModel.prototype.onHelpdeskThreadSeenResponse = function (oResponse, oRequest)
	{
		var
			iIndex = 0,
			iLen = 0,
			aThreads = [],
			iSeachId = 0
		;
	
		if (oRequest.ThreadId)
		{
			aThreads = this.threads();
			iSeachId = this.selectedItem() ? this.selectedItem().Id : 0;
	
			if (0 < iSeachId)
			{
				for (iLen = aThreads.length; iIndex < iLen; iIndex++)
				{
					if (iSeachId === oRequest.ThreadId)
					{
						this.selectedItem().unseen(false);
						break;
					}
				}
			}
		}
		
		this.updateOpenerWindow();
	};
	
	CHelpdeskViewModel.prototype.executeThreadCreate = function ()
	{
		var
			sNewThreadSubject = '',
			iFirstSpacePos = -1
		;
		
		if (this.visibleNewThread())
		{
			sNewThreadSubject = Utils.trim(this.newThreadText().replace(/[\n\r]/, ' '));
			iFirstSpacePos = sNewThreadSubject.indexOf(' ', 40);
			if (iFirstSpacePos >= 0)
			{
				sNewThreadSubject = sNewThreadSubject.substring(0, iFirstSpacePos);
			}
	
			this.newThreadCreating(true);
	
			this.sendHelpdeskPostCreate(0, sNewThreadSubject, this.newThreadText(), this.onThreadCreateResponse);
		}
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CHelpdeskViewModel.prototype.onThreadCreateResponse = function (oResponse, oRequest)
	{
		this.newThreadCreating(false);
		
		if (oResponse.Result && oRequest)
		{
			App.Api.showReport(Utils.i18n('HELPDESK/REPORT_THREAD_SUCCESSFULLY_CREATED'));
	
			this.posts([]);
			this.uploadedFiles([]);
			this.newThreadText('');
			this.visibleNewThread(false);
		}
	
		this.requestThreadsList();
		this.updateOpenerWindow();
	};
	
	CHelpdeskViewModel.prototype.executePostCreate = function ()
	{
		if (this.selectedItem())
		{
			this.replySendingStarted(true);
			
			this.sendHelpdeskPostCreate(this.selectedItem().Id, '', this.replyText(), this.onPostCreateResponse);
		} 
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CHelpdeskViewModel.prototype.onPostCreateResponse = function (oResponse, oRequest)
	{
		this.replySendingStarted(false);
		
		if (oResponse.Result && oRequest)
		{
			App.Api.showReport(Utils.i18n('HELPDESK/REPORT_POST_SUCCESSFULLY_ADDED'));
	
			this.clearQuickReply();
	
			this.requestPosts();
		}
	
		this.requestThreadsList();
		this.updateOpenerWindow();
	};
	
	/**
	 * @param {number} iThreadId
	 * @param {string} sSubject
	 * @param {string} sText
	 * @param {Function} fResponseHandler
	 */
	CHelpdeskViewModel.prototype.sendHelpdeskPostCreate = function (iThreadId, sSubject, sText, fResponseHandler)
	{
		var
			aAttachments = {},
			oParameters = {}
		;
		
		_.each(this.uploadedFiles(), function (oItem) {
			aAttachments[oItem.tempName()] = oItem.hash();
		});
		
		oParameters = {
			'Action': 'HelpdeskPostCreate',
			'IsExt': this.bExtApp ? 1 : 0,
			'ThreadId': iThreadId,
			'IsInternal': this.internalNote() ? 1 : 0,
			'Subject': sSubject,
			'Text': sText,
			'Attachments': aAttachments
		};
	
		App.Ajax[this.sendFunc](oParameters, fResponseHandler, this);
	};
	
	CHelpdeskViewModel.prototype.executeShowThreadsByOwner = function ()
	{
		this.search('owner:' + this.selectedItem().aOwner[0]);
		
		this.prevListFilter(this.listFilter());
		this.listFilter(Enums.HelpdeskFilters.All);
	};
	
	CHelpdeskViewModel.prototype.onClearSearchClick = function ()
	{
		// initiation empty search
		this.search('');
		if (this.prevListFilter() !== '') {
			this.listFilter(this.prevListFilter());
			this.prevListFilter('');
		}
		this.searchSubmitCommand();
	};
	
	/**
	 * Initializes file uploader.
	 */
	CHelpdeskViewModel.prototype.initUploader = function ()
	{
		this.oJua = this.createJuaObject(this.uploaderButton());
		this.oJuaCompose = this.createJuaObject(this.uploaderButtonCompose());
	};
	
	/**
	 * @param {Object} oButton
	 */
	CHelpdeskViewModel.prototype.createJuaObject = function (oButton)
	{
		if (oButton)
		{
			return new Jua({
				'action': '?/Upload/HelpdeskFile/',
				'name': 'jua-uploader',
				'queueSize': 2,
				'clickElement': oButton,
				'dragAndDropElement': oButton,
				'disableAjaxUpload': false,
				'disableFolderDragAndDrop': false,
				'disableDragAndDrop': false,
				'hidden': {
					'IsExt': this.bExtApp ? '1' : '0',
					'Token': AppData.Token,
					'TenantHash': this.bExtApp && AppData ? AppData.TenantHash : '',
					'AccountID': this.bExtApp ? 0 : AppData.Accounts.currentId()
				},
				'onProgress': _.bind(this.onFileUploadProgress, this),
				'onSelect': _.bind(this.onFileUploadSelect, this),
				'onStart': _.bind(this.onFileUploadStart, this),
				'onComplete': _.bind(this.onFileUploadComplete, this),
				'onBodyDragEnter': _.bind(this.bDragActive, this, true),
				'onBodyDragLeave': _.bind(this.bDragActive, this, false)
			});
		}
		else
		{
			return null;
		}
	};
	
	/**
	 * @param {string} sFileUID
	 */
	CHelpdeskViewModel.prototype.onCancelUpload = function (sFileUID)
	{
		var oAttach = this.getUploadedFileByUID(sFileUID);
	
		if (this.oJua)
		{
			this.oJua.cancel(sFileUID);
		}
	
		this.uploadedFiles.remove(oAttach);
	};
	
	/**
	 * @param {string} sFileUID
	 */
	CHelpdeskViewModel.prototype.getUploadedFileByUID = function (sFileUID)
	{
		return _.find(this.uploadedFiles(), function (oAttach) {
			return oAttach.uploadUID() === sFileUID;
		});
	};
	
	/**
	 * @param {string} sFileUID
	 * @param {Object} oFileData
	 */
	CHelpdeskViewModel.prototype.onFileUploadSelect = function (sFileUID, oFileData)
	{	
		var
			oAttach,
			sWarningSize = Utils.i18n('COMPOSE/UPLOAD_ERROR_FILENAME_SIZE', {
				'FILENAME': oFileData.FileName
			}),
			sWarningCountLimit = Utils.i18n('HELPDESK/ERROR_UPLOAD_FILES_COUNT'),
			sButtonCountLimit = Utils.i18n('MAIN/BUTTON_CLOSE'),
			iAttachCount = this.uploadedFiles().length
		;
		
		if (iAttachCount >= 5)
		{
			App.Screens.showPopup(AlertPopup, [sWarningCountLimit, null, '', sButtonCountLimit]);
			return false;
		}
		
		if (AppData.App && AppData.App.AttachmentSizeLimit > 0 && oFileData.Size > AppData.App.AttachmentSizeLimit)
		{
			App.Screens.showPopup(AlertPopup, [sWarningSize]);
			return false;
		}
	
		oAttach = new CHelpdeskAttachmentModel();
		
		oAttach.onUploadSelect(sFileUID, oFileData);
		
		this.uploadedFiles.push(oAttach);
		
		return true;
	};
	
	/**
	 * @param {string} sFileUID
	 * @param {number} iUploadedSize
	 * @param {number} iTotalSize
	 */
	CHelpdeskViewModel.prototype.onFileUploadProgress = function (sFileUID, iUploadedSize, iTotalSize)
	{
		var oAttach = this.getUploadedFileByUID(sFileUID);
		
		if (oAttach)
		{
			oAttach.onUploadProgress(iUploadedSize, iTotalSize);
		}
	};
	
	/**
	 * @param {string} sFileUID
	 * @param {boolean} bResult
	 * @param {Object} oResult
	 */
	CHelpdeskViewModel.prototype.onFileUploadStart = function (sFileUID, bResult, oResult)
	{	
		var oAttach = this.getUploadedFileByUID(sFileUID);
		
		if (oAttach)
		{
			oAttach.onUploadStart();
		}
	};
	
	/**
	 * @param {string} sFileUID
	 * @param {boolean} bResult
	 * @param {Object} oResult
	 */
	CHelpdeskViewModel.prototype.onFileUploadComplete = function (sFileUID, bResult, oResult)
	{	
		var oAttach = this.getUploadedFileByUID(sFileUID);
		
		if (oAttach)
		{
			oAttach.onUploadComplete(sFileUID, bResult, oResult);
		}
	};	
	
	/**
	 * @constructor
	 */
	function CScreens()
	{
		this.oScreens = {};
	
		this.currentScreen = ko.observable('');
	
		this.popupVisibility = ko.observable(false);
		
		this.informationScreen = ko.observable(null);
		
		this.popups = [];
	}
	
	CScreens.prototype.initScreens = function () {};
	CScreens.prototype.initLayout = function () {};
	
	CScreens.prototype.init = function ()
	{
		this.initScreens();
		
		this.initLayout();
		
		$('#pSevenContent').addClass('single_mode');
		
		_.defer(function () {
			if (!AppData.SingleMode)
			{
				$('#pSevenContent').removeClass('single_mode');
			}
		});
		
		this.informationScreen(this.showNormalScreen(Enums.Screens.Information));
	};
	
	/**
	 * @param {string} sScreen
	 * @param {?=} mParams
	 */
	CScreens.prototype.showCurrentScreen = function (sScreen, mParams)
	{
		if (this.currentScreen() !== sScreen)
		{
			this.hideCurrentScreen();
			this.currentScreen(sScreen);
		}
	
		this.showNormalScreen(sScreen, mParams);
	};
	
	CScreens.prototype.hideCurrentScreen = function ()
	{
		if (this.currentScreen().length > 0)
		{
			this.hideScreen(this.currentScreen());
		}
	};
	
	/**
	 * @param {string} sScreen
	 */
	CScreens.prototype.hideScreen = function (sScreen)
	{
		var
			sScreenId = sScreen,
			oScreen = this.oScreens[sScreenId]
		;
	
		if (typeof oScreen !== 'undefined' && oScreen.bInitialized)
		{
			oScreen.Model.hideViewModel();
		}
	};
	
	/**
	 * @param {string} sScreen
	 * @param {?=} mParams
	 * 
	 * @return Object
	 */
	CScreens.prototype.showNormalScreen = function (sScreen, mParams)
	{
		var
			sScreenId = sScreen,
			oScreen = this.oScreens[sScreenId]
		;
	
		if (oScreen)
		{
			oScreen.bInitialized = (typeof oScreen.bInitialized !== 'boolean') ? false : oScreen.bInitialized;
			if (!oScreen.bInitialized)
			{
				oScreen.Model = this.initViewModel(oScreen.Model, oScreen.TemplateName);
				oScreen.bInitialized = true;
			}
	
			oScreen.Model.showViewModel(mParams);
		}
		
		return oScreen ? oScreen.Model : null;
	};
	
	/**
	 * @param {?} CViewModel
	 * @param {string} sTemplateId
	 * 
	 * @return {Object}
	 */
	CScreens.prototype.initViewModel = function (CViewModel, sTemplateId)
	{
		var
			oViewModel = null,
			$viewModel = null
		;
	
		oViewModel = new CViewModel();
	
		$viewModel = $('div[data-view-model="' + sTemplateId + '"]')
			.attr('data-bind', 'template: {name: \'' + sTemplateId + '\'}')
			.hide();
	
		oViewModel.$viewModel = $viewModel;
		oViewModel.bShown = false;
		oViewModel.showViewModel = function (mParams)
		{
			this.$viewModel.show();
			if (typeof this.onRoute === 'function')
			{
				this.onRoute(mParams);
			}
			if (!this.bShown)
			{
				if (typeof this.onShow === 'function')
				{
					this.onShow(mParams);
				}
				if (AfterLogicApi.runPluginHook)
				{
					if (this.__name)
					{
						AfterLogicApi.runPluginHook('view-model-on-show', [this.__name, this]);
					}
				}
				
				this.bShown = true;
			}
		};
		oViewModel.hideViewModel = function ()
		{
			this.$viewModel.hide();
			if (typeof this.onHide === 'function')
			{
				this.onHide();
			}
			this.bShown = false;
		};
		ko.applyBindings(oViewModel, $viewModel[0]);
	
		if (typeof oViewModel.onApplyBindings === 'function')
		{
			oViewModel.onApplyBindings($viewModel);
		}
	
		return oViewModel;
	};
	
	/**
	 * @param {?} CPopupViewModel
	 * @param {Array=} aParameters
	 */
	CScreens.prototype.showPopup = function (CPopupViewModel, aParameters)
	{
		if (CPopupViewModel)
		{
			if (!CPopupViewModel.__builded)
			{
				var
					oViewModelDom = null,
					oViewModel = new CPopupViewModel(),
					sTemplate = oViewModel.popupTemplate ? oViewModel.popupTemplate() : ''
				;
	
				if ('' !== sTemplate)
				{
					oViewModelDom = $('div[data-view-model="' + sTemplate + '"]')
						.attr('data-bind', 'template: {name: \'' + sTemplate + '\'}')
						.removeClass('visible').hide();
	
					if (oViewModelDom && 1 === oViewModelDom.length)
					{
						oViewModel.visibility = ko.observable(false);
	
						CPopupViewModel.__builded = true;
						CPopupViewModel.__vm = oViewModel;
	
						oViewModel.$viewModel = oViewModelDom;
						CPopupViewModel.__dom = oViewModelDom;
	
						oViewModel.showViewModel = Utils.createCommand(oViewModel, function () {
							if (App && App.Screens)
							{
								App.Screens.showPopup(CPopupViewModel);
							}
						});
	
						oViewModel.closeCommand = Utils.createCommand(oViewModel, function () {
							if (App && App.Screens)
							{
								App.Screens.hidePopup(CPopupViewModel);
							}
						});
						
						ko.applyBindings(oViewModel, oViewModelDom[0]);
	
						Utils.delegateRun(oViewModel, 'onApplyBindings', [oViewModelDom]);
					}
				}
			}
	
			if (CPopupViewModel.__vm && CPopupViewModel.__dom)
			{
				CPopupViewModel.__dom.show();
				_.delay(function() {
					CPopupViewModel.__dom.addClass('visible');
				}, 50);
				CPopupViewModel.__vm.visibility(true);
	
				Utils.delegateRun(CPopupViewModel.__vm, 'onShow', aParameters);
				this.popupVisibility(true);
				
				this.popups.push(CPopupViewModel);
				
				this.keyupPopupBinded = _.bind(this.keyupPopup, this, CPopupViewModel.__vm);
				$(document).on('keyup', this.keyupPopupBinded);
			}
		}
	};
	
	/**
	 * @param {Object} oViewModel
	 * @param {Object} oEvent
	 */
	CScreens.prototype.keyupPopup = function (oViewModel, oEvent)
	{
		if (oEvent)
		{
			var iKeyCode = window.parseInt(oEvent.keyCode, 10);
			
			// Esc
			if (27 === iKeyCode)
			{
				oViewModel.closeCommand();
			}
	
			// Enter or Space
			if ((13 === iKeyCode || 32 === iKeyCode) && oViewModel.onEnterHandler)
			{
				oViewModel.onEnterHandler();
			}
		}
	};
	
	/**
	 * @param {?} CPopupViewModel
	 */
	CScreens.prototype.hidePopup = function (CPopupViewModel)
	{
		if (CPopupViewModel && CPopupViewModel.__vm && CPopupViewModel.__dom)
		{
			if (this.keyupPopupBinded)
			{
				$(document).off('keyup', this.keyupPopupBinded);
				this.keyupPopupBinded = undefined;
			}
			CPopupViewModel.__dom.removeClass('visible').hide();
	
			CPopupViewModel.__vm.visibility(false);
	
			Utils.delegateRun(CPopupViewModel.__vm, 'onHide');
			this.popupVisibility(false);
			
			this.popups = _.without(this.popups, CPopupViewModel);
		}
	};
	
	CScreens.prototype.hideAllPopup = function ()
	{
		_.each(this.popups, function (oPopup) {
			this.hidePopup(oPopup);
		}, this);
	};
	
	/**
	 * @param {string} sMessage
	 */
	CScreens.prototype.showLoading = function (sMessage)
	{
		if (this.informationScreen())
		{
			this.informationScreen().showLoading(sMessage);
		}
	};
	
	CScreens.prototype.hideLoading = function ()
	{
		if (this.informationScreen())
		{
			this.informationScreen().hideLoading();
		}
	};
	
	/**
	 * @param {string} sMessage
	 * @param {number} iDelay
	 */
	CScreens.prototype.showReport = function (sMessage, iDelay)
	{
		if (this.informationScreen())
		{
			this.informationScreen().showReport(sMessage, iDelay);
		}
	};
	
	/**
	 * @param {string} sMessage
	 * @param {boolean=} bHtml = false
	 * @param {boolean=} bNotHide = false
	 */
	CScreens.prototype.showError = function (sMessage, bHtml, bNotHide)
	{
		if (this.informationScreen())
		{
			this.informationScreen().showError(sMessage, bHtml, bNotHide);
		}
	};
	CScreens.prototype.hideError = function (sMessage, bHtml, bNotHide)
	{
		if (this.informationScreen())
		{
			this.informationScreen().hideError();
		}
	};
	CScreens.prototype.initScreens = function ()
	{
		this.oScreens[Enums.Screens.Information] = {
			'Model': CInformationViewModel,
			'TemplateName': 'Common_InformationViewModel'
		};
	
		this.oScreens[Enums.Screens.Login] = {
			'Model': CLoginViewModel,
			'TemplateName': 'Login_LoginViewModel'
		};
		this.oScreens[Enums.Screens.Header] = {
			'Model': CHeaderViewModel,
			'TemplateName': 'Common_HeaderViewModel'
		};
		this.oScreens[Enums.Screens.Mailbox] = {
			'Model': CMailViewModel,
			'TemplateName': 'Mail_LayoutSidePane_MailViewModel'
		};
		this.oScreens[Enums.Screens.BottomMailbox] = {
			'Model': CMailViewModel,
			'TemplateName': 'Mail_LayoutBottomPane_MailViewModel'
		};
		this.oScreens[Enums.Screens.SingleMessageView] = {
			'Model': CMessagePaneViewModel,
			'TemplateName': 'Mail_LayoutSidePane_MessagePaneViewModel'
		};
		this.oScreens[Enums.Screens.Compose] = {
			'Model': CComposeViewModel,
			'TemplateName': 'Mail_ComposeViewModel'
		};
		this.oScreens[Enums.Screens.SingleCompose] = {
			'Model': CComposeViewModel,
			'TemplateName': 'Mail_ComposeViewModel'
		};
		this.oScreens[Enums.Screens.Settings] = {
			'Model': CSettingsViewModel,
			'TemplateName': 'Settings_SettingsViewModel'
		};
		this.oScreens[Enums.Screens.SingleHelpdesk] = {
			'Model': CHelpdeskViewModel,
			'TemplateName': 'Helpdesk_ViewThreadInNewWindow'
		};
	};
	
	CScreens.prototype.initLayout = function ()
	{
		$('#pSevenContent').append($('#Layout').html());
	};
	
	/**
	 * @constructor
	 */
	function CMailCache()
	{
		this.currentAccountId = AppData.Accounts.currentId;
	
		this.currentAccountId.subscribe(function (iAccountID) {
			var
				oAccount = AppData.Accounts.getAccount(iAccountID),
				oFolderList = this.oFolderListItems[iAccountID],
				oParameters = {
					'Action': 'FolderList',
					'AccountID': iAccountID
				}
			;
			
			if (oAccount)
			{
				_.delay(_.bind(oAccount.updateQuotaParams, oAccount), 5000);
				
				this.messagesLoading(true);
				
				if (oFolderList)
				{
					this.folderList(oFolderList);
				}
				else
				{
					this.folderList(new CFolderListModel());
					this.messages([]);
					this.currentMessage(null);
					App.Ajax.send(oParameters, this.onFolderListResponse, this);
				}
			}
		}, this);
		
		this.editedAccountId = AppData.Accounts.editedId;
		this.editedAccountId.subscribe(function (value) {
			var
				oFolderList = this.oFolderListItems[value],
				oParameters = {}
			;
			if (oFolderList)
			{
				this.editedFolderList(oFolderList);
			}
			else if (this.currentAccountId() !== value)
			{
				this.editedFolderList(new CFolderListModel());
				oParameters = {
					'Action': 'FolderList',
					'AccountID': value
				};
				App.Ajax.send(oParameters, this.onFolderListResponse, this);
			}
		}, this);
		
		this.oFolderListItems = {};
	
		this.quotaChangeTrigger = ko.observable(false);
		
		this.checkMailStarted = ko.observable(false);
		
		this.folderList = ko.observable(new CFolderListModel());
	
		this.editedFolderList = ko.observable(new CFolderListModel());
	
		this.newMessagesCount = ko.computed(function () {
			var
				oInbox = this.folderList().inboxFolder()
			;
			return oInbox ? oInbox.unseenMessageCount() : 0;
		}, this);
	
		this.messages = ko.observableArray([]);
		
		this.uidList = ko.observable(new CUidListModel());
		this.page = ko.observable(1);
		
		this.messagesLoading = ko.observable(true);
		this.messagesLoadingError = ko.observable(false);
		
		this.currentMessage = ko.observable(null);
		this.currentMessage.subscribe(function () {
			if (this.currentMessage())
			{
				AfterLogicApi.runPluginHook('view-message', 
					[AppData.Accounts.currentId(), this.currentMessage().folder(), this.currentMessage().uid()]);
			}
		}, this);
	
		this.deletedDraftMessageUid = ko.observable('');
		
		this.aResponseHandlers = [];
		
		AppData.User.useThreads.subscribe(function () {
			_.each(this.oFolderListItems, function (oFolderList) {
				_.each(oFolderList.collection(), function (oFolder) {
					oFolder.markHasChanges();
					oFolder.removeAllMessageListsFromCacheIfHasChanges();
				}, this);
			}, this);
			this.messages([]);
		}, this);
	}
	
	/**
	 * @public
	 */
	CMailCache.prototype.init = function ()
	{
		var oMailCache = null;
		
		if (AppData.SingleMode && window.opener)
		{
			oMailCache = window.opener.App.MailCache;
			
			this.oFolderListItems = oMailCache.oFolderListItems;
			
			if (window.name)
			{
				this.currentAccountId(Utils.pInt(window.name));
			}
		}
		
		this.currentAccountId.valueHasMutated();
	};
	
	CMailCache.prototype.getCurrentFolder = function ()
	{
		return this.folderList().currentFolder();
	};
	
	/**
	 * @param {number} iAccountId
	 * @param {string} sFolderFullName
	 */
	CMailCache.prototype.getFolderByFullName = function (iAccountId, sFolderFullName)
	{
		var
			oFolderList = this.oFolderListItems[iAccountId]
		;
		
		if (oFolderList)
		{
			return oFolderList.getFolderByFullName(sFolderFullName);
		}
		
		return null;
	};
	
	/**
	 * @param {number=} iAccountID
	 */
	CMailCache.prototype.getFolderList = function (iAccountID)
	{
		var oParameters = {'Action': 'FolderList'};
		if (!Utils.isUnd(iAccountID))
		{
			oParameters['AccountID'] = iAccountID;
		}
		App.Ajax.send(oParameters, this.onFolderListResponse, this);
	};
	
	/**
	 * @param {number} iAccountId
	 * @param {string} sFullName
	 * @param {string} sUid
	 * @param {string} sReplyType
	 */
	CMailCache.prototype.markMessageReplied = function (iAccountId, sFullName, sUid, sReplyType)
	{
		var
			oFolderList = this.oFolderListItems[iAccountId],
			oFolder = null
		;
		
		if (oFolderList)
		{
			oFolder = oFolderList.getFolderByFullName(sFullName);
			if (oFolder)
			{
				oFolder.markMessageReplied(sUid, sReplyType);
			}
		}
	};
	
	/**
	 * @param {number} iAccountId
	 * @param {string} sFullName
	 * @param {number} iCount
	 * @param {number} iUnseenCount
	 * @param {string} sUidNext
	 * @param {string} sHash
	 */
	CMailCache.prototype.setFolderCounts = function (iAccountId, sFullName, iCount, iUnseenCount, sUidNext, sHash)
	{
		var
			oFolderList = this.oFolderListItems[iAccountId],
			oFolder = null,
			bFolderHasChanges = false,
			bCheckMailStarted = false
		;
		
		if (oFolderList)
		{
			oFolder = oFolderList.getFolderByFullName(sFullName);
			if (oFolder)
			{
				bFolderHasChanges = oFolder.setRelevantInformation(sUidNext, sHash, iCount, iUnseenCount);
				if (bFolderHasChanges && oFolder.selected())
				{
					bCheckMailStarted = true;
					this.startCheckMail();
				}
			}
		}
		
		return bCheckMailStarted;
	};
	
	/**
	 * @param {Object} oMessage
	 */
	CMailCache.prototype.hideThreads = function (oMessage)
	{
		if (AppData.User.useThreads() && oMessage.folder() === this.folderList().currentFolderFullName() && !oMessage.threadOpened())
		{
			this.folderList().currentFolder().hideThreadMessages(oMessage);
		}
	};
	
	/**
	 * @param {string} sFolderFullName
	 */
	CMailCache.prototype.showOpenedThreads = function (sFolderFullName)
	{
		this.messages(this.getMessagesWithThreads(sFolderFullName, this.uidList(), this.messages()));
	};
	
	/**
	 * @param {string} sFolderFullName
	 * @param {Object} oUidList
	 * @param {Array} aOrigMessages
	 */
	CMailCache.prototype.getMessagesWithThreads = function (sFolderFullName, oUidList, aOrigMessages)
	{
		var
			oCurrFolder = this.folderList().currentFolder(),
			bFolderWithoutThreads = oCurrFolder && oCurrFolder.withoutThreads(),
			bNotSearchOrFilters = oUidList.search() === '' && oUidList.filters() === ''
		;
		
		if (sFolderFullName === oCurrFolder.fullName() && AppData.User.useThreads() && !bFolderWithoutThreads && bNotSearchOrFilters)
		{
			var
				aMessages = _.filter(aOrigMessages, function (oMess) {
					return !oMess.threadPart();
				}, this),
				aExtMessages = []
			;
	
			_.each(aMessages, function (oMess) {
				var aThreadMessages = [];
				
				aExtMessages.push(oMess);
				
				if (oMess.threadOpened())
				{
					aThreadMessages = this.folderList().currentFolder().getThreadMessages(oMess);
					aExtMessages = _.union(aExtMessages, aThreadMessages);
				}
			}, this);
			
			return aExtMessages;
		}
		
		return aOrigMessages;
	};
	
	/**
	 * @param {Object} oUidList
	 * @param {number} iOffset
	 * @param {Object} oMessages
	 * @param {boolean} bFillMessages
	 */
	CMailCache.prototype.setMessagesFromUidList = function (oUidList, iOffset, oMessages, bFillMessages)
	{
		var
			aUids = oUidList.getUidsForOffset(iOffset, oMessages),
			aMessages = _.map(aUids, function (sUid) {
				return oMessages[sUid];
			}, this),
			iMessagesCount = aMessages.length
		;
		
		if (bFillMessages)
		{
			this.messages(this.getMessagesWithThreads(this.folderList().currentFolderFullName(), oUidList, aMessages));
	
			if ((iOffset + iMessagesCount < oUidList.resultCount()) &&
				(iMessagesCount < AppData.User.MailsPerPage))
			{
				this.messagesLoading(true);
			}
	
			if (this.currentMessage() && (this.currentMessage().deleted() ||
				this.currentMessage().folder() !== this.folderList().currentFolderFullName()))
			{
				this.currentMessage(null);
			}
		}
	
		return aUids;
	};
	
	CMailCache.prototype.startCheckMail = function ()
	{
		var
			sFolder = this.folderList().currentFolderFullName(),
			iPage = this.page(),
			sSearch = this.uidList().search()
		;
		
		if (sFolder !== '')
		{
			this.requestCurrentMessageList(sFolder, iPage, sSearch, '', false);
		}
	};
	
	CMailCache.prototype.executeCheckMail = function ()
	{
		var
			oFolderList = this.folderList(),
			aFolders = oFolderList ? oFolderList.getInboxAndCurrentFoldersArray() : [],
			oParameters = {
				'Action': 'FolderCounts',
				'Folders': aFolders,
				'AccountID': oFolderList ? oFolderList.iAccountId : 0
			}
		;
		
		if (!this.checkMailStarted() && aFolders.length > 0)
		{
			this.checkMailStarted(true);
			App.Ajax.send(oParameters, this.onFolderCountsResponse, this);
		}
	};
	
	/**
	 * @param {string} sFolder
	 * @param {number} iPage
	 * @param {string} sSearch
	 * @param {string=} sFilter
	 */
	CMailCache.prototype.changeCurrentMessageList = function (sFolder, iPage, sSearch, sFilter)
	{
		this.requestCurrentMessageList(sFolder, iPage, sSearch, sFilter, true);
	};
	
	/**
	 * @param {string} sFolder
	 * @param {number} iPage
	 * @param {string} sSearch
	 * @param {string=} sFilter
	 * @param {boolean=} bFillMessages
	 */
	CMailCache.prototype.requestCurrentMessageList = function (sFolder, iPage, sSearch, sFilter, bFillMessages)
	{
		var
			oRequestData = this.requestMessageList(sFolder, iPage, sSearch, sFilter || '', true, (bFillMessages || false))
		;
	
		this.uidList(oRequestData.UidList);
		this.page(iPage);
	
		this.messagesLoading(oRequestData.DataExpected);
		this.messagesLoadingError(false);
	
		App.Prefetcher.start();
	};
	
	/**
	 * @param {string} sFolder
	 * @param {number} iPage
	 * @param {string} sSearch
	 * @param {string} sFilters
	 * @param {boolean} bCurrent
	 * @param {boolean} bFillMessages
	 */
	CMailCache.prototype.requestMessageList = function (sFolder, iPage, sSearch, sFilters, bCurrent, bFillMessages)
	{
		var
			oFolderList = this.oFolderListItems[this.currentAccountId()],
			oFolder = (oFolderList) ? oFolderList.getFolderByFullName(sFolder) : null,
			bFolderWithoutThreads = oFolder && oFolder.withoutThreads(),
			bUseThreads = AppData.User.useThreads() && !bFolderWithoutThreads && sSearch === '' && sFilters === '',
			oUidList = (oFolder) ? oFolder.getUidList(sSearch, sFilters) : null,
			iOffset = (iPage - 1) * AppData.User.MailsPerPage,
			aUids = (oUidList) ? this.setMessagesFromUidList(oUidList, iOffset, oFolder.oMessages, bFillMessages) : [],
			oParameters = {
				'Action': 'MessageList',
				'Folder': sFolder,
				'Offset': iOffset,
				'Limit': AppData.User.MailsPerPage,
				'Search': sSearch,
				'Filters': sFilters,
				'UseThreads': bUseThreads ? '1' : '0'
			},
			bStartRequest = false,
			bDataExpected = false,
			fCallBack = bCurrent ? this.onCurrentMessageListResponse : this.onMessageListResponse
		;
		
		if (oUidList)
		{
			bDataExpected = 
				(oUidList.resultCount() === -1) ||
				((iOffset + aUids.length < oUidList.resultCount()) && (aUids.length < AppData.User.MailsPerPage))
			;
			bStartRequest = oFolder.hasChanges() || bDataExpected;
		}
		
		if (bStartRequest)
		{
			App.Ajax.send(oParameters, fCallBack, this);
		}
		
		return {UidList: oUidList, RequestStarted: bStartRequest, DataExpected: bDataExpected};
	};
	
	CMailCache.prototype.executeEmptyTrash = function ()
	{
		var oFolder = this.folderList().trashFolder();
		if (oFolder)
		{
			oFolder.emptyFolder();
		}
	};
	
	CMailCache.prototype.executeEmptySpam = function ()
	{
		var oFolder = this.folderList().spamFolder();
		if (oFolder)
		{
			oFolder.emptyFolder();
		}
	};
	
	/**
	 * @param {Object} oFolder
	 */
	CMailCache.prototype.onClearFolder = function (oFolder)
	{
		if (oFolder && oFolder.selected())
		{
			this.messages.removeAll();
			this.currentMessage(null);
			var oUidList = (oFolder) ? oFolder.getUidList(this.uidList().search(), this.uidList().filters()) : null;
			if (oUidList)
			{
				this.uidList(oUidList);
			}
			else
			{
				this.uidList(new CUidListModel());
			}
			
			// FolderCounts-request aborted during folder cleaning, not to get the wrong information.
			// So here indicates that chekmail is over.
			this.checkMailStarted(false);
		}
	};
	
	/**
	 * @param {string} sToFolderFullName
	 * @param {Array} aUids
	 * @param {boolean} bAnimateRecive
	 */
	CMailCache.prototype.moveMessagesToFolder = function (sToFolderFullName, aUids, bAnimateRecive)
	{
		if (aUids.length > 0)
		{
			var
				oCurrFolder = this.folderList().currentFolder(),
				aExtUids = oCurrFolder.getUidsWithThread(aUids),
				oToFolder = this.folderList().getFolderByFullName(sToFolderFullName),
				oParameters = {
					'Action': 'MessageMove',
					'Folder': oCurrFolder ? oCurrFolder.fullName() : '',
					'ToFolder': sToFolderFullName,
					'Uids': aExtUids.join(',')
				},
				oDiffs = null
			;
	
			if (oCurrFolder)
			{
				oDiffs = oCurrFolder.markDeletedByUids(aExtUids);
				oToFolder.addMessagesCountsDiff(oDiffs.MinusDiff, oDiffs.UnseenMinusDiff);
	
				if (Utils.isUnd(bAnimateRecive) ? true : !!bAnimateRecive)
				{
					oToFolder.recivedAnim(true);
				}
	
				this.excludeDeletedMessages();
	
				oToFolder.markHasChanges();
	
				App.Ajax.send(oParameters, this.onMoveMessagesResponse, this);
				
				if (oToFolder && oToFolder.type() === Enums.FolderTypes.Trash)
				{
					AfterLogicApi.runPluginHook('move-messages-to-trash', 
						[AppData.Accounts.currentId(), oParameters.Folder, aExtUids]);
				}
				
				if (oToFolder && oToFolder.type() === Enums.FolderTypes.Spam)
				{
					AfterLogicApi.runPluginHook('move-messages-to-spam', 
						[AppData.Accounts.currentId(), oParameters.Folder, aExtUids]);
				}
			}
		}
	};
	
	CMailCache.prototype.excludeDeletedMessages = function ()
	{
		_.delay(_.bind(function () {
			
			var
				oCurrFolder = this.folderList().currentFolder(),
				iOffset = (this.page() - 1) * AppData.User.MailsPerPage
			;
			
			this.setMessagesFromUidList(this.uidList(), iOffset, oCurrFolder.oMessages, true);
			
		}, this), 500);
	};
	
	/**
	 * @param {string} sFolderFullName
	 */
	CMailCache.prototype.removeMessagesFromCacheForFolder = function (sFolderFullName)
	{
		var
			oFolder = this.folderList().getFolderByFullName(sFolderFullName),
			sCurrFolderFullName = this.folderList().currentFolderFullName()
		;
		if (oFolder)
		{
			oFolder.markHasChanges();
			if (sFolderFullName === sCurrFolderFullName)
			{
				this.requestCurrentMessageList(sCurrFolderFullName, this.page(), this.uidList().search(), '', true);
			}
		}
	};
	
	/**
	 * @param {Array} aUids
	 */
	CMailCache.prototype.deleteMessages = function (aUids)
	{
		var
			oCurrFolder = this.folderList().currentFolder()
		;
	
		if (oCurrFolder)
		{
			this.deleteMessagesFromFolder(oCurrFolder, aUids);
		}
	};
	
	/**
	 * @param {Object} oFolder
	 * @param {Array} aUids
	 */
	CMailCache.prototype.deleteMessagesFromFolder = function (oFolder, aUids)
	{
		var
			aExtUids = oFolder.getUidsWithThread(aUids),
			oParameters = {
				'Action': 'MessageDelete',
				'Folder': oFolder.fullName(),
				'Uids': aExtUids.join(',')
			}
		;
	
		oFolder.markDeletedByUids(aExtUids);
	
		this.excludeDeletedMessages();
	
		App.Ajax.send(oParameters, this.onMoveMessagesResponse, this);
		
		AfterLogicApi.runPluginHook('delete-messages', 
			[AppData.Accounts.currentId(), oParameters.Folder, aExtUids]);
	};
	
	/**
	 * @param {boolean} bAlwaysForSender
	 */
	CMailCache.prototype.showExternalPictures = function (bAlwaysForSender)
	{
		var
			aFrom = [],
			oFolder = null
		;
			
		if (this.currentMessage())
		{
			aFrom = this.currentMessage().oFrom.aCollection;
			oFolder = this.folderList().getFolderByFullName(this.currentMessage().folder());
	
			if (bAlwaysForSender && aFrom.length > 0)
			{
				oFolder.alwaysShowExternalPicturesForSender(aFrom[0].sEmail);
			}
			else
			{
				oFolder.showExternalPictures(this.currentMessage().uid());
			}
		}
	};
	
	/**
	 * @param {string|null} sUid
	 */
	CMailCache.prototype.setCurrentMessage = function (sUid)
	{
		var
			oCurrFolder = this.folderList().currentFolder(),
			oMessage = oCurrFolder && sUid ? oCurrFolder.oMessages[sUid] : null
		;
	
		if (oMessage && !oMessage.deleted())
		{
			this.currentMessage(oMessage);
			if (!this.currentMessage().seen())
			{
				this.executeGroupOperation('MessageSetSeen', [this.currentMessage().uid()], 'seen', true);
			}
			oCurrFolder.getCompletelyFilledMessage(sUid, this.onCurrentMessageResponse, this);
		}
		else
		{
			this.currentMessage(null);
		}
	};
	
	/**
	 * @param {Object} oMessage
	 * @param {string} sUid
	 */
	CMailCache.prototype.onCurrentMessageResponse = function (oMessage, sUid)
	{
		var sCurrentUid = this.currentMessage() ? this.currentMessage().uid() : '';
		
		if (oMessage === null && sCurrentUid === sUid)
		{
			this.currentMessage(null);
		}
	};
	
	/**
	 * @param {string} sFullName
	 * @param {string} sUid
	 * @param {Function} fResponseHandler
	 * @param {Object} oContext
	 */
	CMailCache.prototype.getMessage = function (sFullName, sUid, fResponseHandler, oContext)
	{
		var
			oFolder = this.folderList().getFolderByFullName(sFullName)
		;
		
		if (oFolder)
		{
			oFolder.getCompletelyFilledMessage(sUid, fResponseHandler, oContext);
		}
	};
	
	/**
	 * @param {string} sAction
	 * @param {Array} aUids
	 * @param {string} sField
	 * @param {boolean} bSetAction
	 */
	CMailCache.prototype.executeGroupOperation = function (sAction, aUids, sField, bSetAction)
	{
		var
			oCurrFolder = this.folderList().currentFolder(),
			oParameters = {
				'Action': sAction,
				'Folder': oCurrFolder ? oCurrFolder.fullName() : '',
				'Uids': aUids.join(','),
				'SetAction': bSetAction ? 1 : 0
			},
			iOffset = (this.page() - 1) * AppData.User.MailsPerPage,
			iUidsCount = aUids.length,
			iStarredCount = this.folderList().oStarredFolder ? this.folderList().oStarredFolder.messageCount() : 0,
			oStarredUidList = oCurrFolder.getUidList('', Enums.FolderFilter.Flagged)
		;
	
		if (oCurrFolder)
		{
			App.Ajax.send(oParameters);
	
			oCurrFolder.executeGroupOperation(sField, aUids, bSetAction);
			
			if (oCurrFolder.type() === Enums.FolderTypes.Inbox && sField === Enums.FolderFilter.Flagged)
			{
				if (this.uidList().filters() !== '')
				{
					if (!bSetAction)
					{
						this.uidList().deleteUids(aUids);
						if (this.folderList().oStarredFolder)
						{
							this.folderList().oStarredFolder.messageCount(oStarredUidList.resultCount());
						}
					}
				}
				else
				{
					oCurrFolder.removeFlaggedMessageListsFromCache();
					if (this.uidList().search() === '' && this.folderList().oStarredFolder)
					{
						if (bSetAction)
						{
							this.folderList().oStarredFolder.messageCount(iStarredCount + iUidsCount);
						}
						else
						{
							this.folderList().oStarredFolder.messageCount((iStarredCount - iUidsCount > 0) ? iStarredCount - iUidsCount : 0);
						}
					}
				}
			}
			
			this.setMessagesFromUidList(this.uidList(), iOffset, oCurrFolder.oMessages, true);
		}
	};
	
	/**
	 * private
	 */
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CMailCache.prototype.onFolderListResponse = function (oResponse, oRequest)
	{
		var
			oFolderList = new CFolderListModel(),
			iAccountId = parseInt(oResponse.AccountID, 10),
			oFolderListOld = this.oFolderListItems[iAccountId],
			fMergeFolderList = function (collection) {
				var
					iIndex = 0,
					iLen = 0,
					oItem = null,
					oFolder
				;
	
				for (iIndex = 0, iLen = collection.length; iIndex < iLen; iIndex++)
				{
					oItem = collection[iIndex];
					oFolder = oFolderList.getFolderByFullName(oItem.fullName());
					if (oFolder)
					{
						oFolder.messageCount(oItem.messageCount());
						oFolder.hasExtendedInfo(oItem.hasExtendedInfo());
					}
					fMergeFolderList(oItem.subfolders());
				}
			}
		;		
	
		if (oResponse.Result === false)
		{
			App.Api.showErrorByCode(oResponse.ErrorCode);
			
			if (oRequest.AccountID === this.currentAccountId() && this.messages().length === 0)
			{
				this.messagesLoading(false);
				this.messagesLoadingError(true);
			}
		}
		else
		{
			oFolderList.parse(iAccountId, oResponse.Result);
			this.oFolderListItems[iAccountId] = oFolderList;
	
			setTimeout(_.bind(this.getAllFolderCounts, this, iAccountId), 2000);
			if (oFolderListOld)
			{
				fMergeFolderList(oFolderListOld.collection());
			}
	
			if (this.currentAccountId() === iAccountId)
			{
				this.folderList(oFolderList);
			}
			if (this.editedAccountId() === iAccountId)
			{
				this.editedFolderList(oFolderList);
			}
		}
	};
	
	/**
	 * @param {Object} oFolderList
	 */
	CMailCache.prototype.setCurrentFolderList = function (oFolderList)
	{
		var iAccountId = oFolderList.iAccountId;
		
		if (iAccountId === this.currentAccountId() && iAccountId !== this.folderList().iAccountId)
		{
			this.folderList(oFolderList);
		}
	};
	
	/**
	 * @param {number} iAccountId
	 */
	CMailCache.prototype.getAllFolderCounts = function (iAccountId)
	{
		var
			oFolderList = this.oFolderListItems[iAccountId],
			aFolders = oFolderList ? oFolderList.getFoldersWithoutCountInfo() : [],
			oParameters = {
				'Action': 'FolderCounts',
				'Folders': aFolders,
				'AccountID': iAccountId
			}
		;
		
		if (aFolders.length > 0)
		{
			App.Ajax.send(oParameters, this.onFolderCountsResponse, this);
		}
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CMailCache.prototype.onFolderCountsResponse = function (oResponse, oRequest)
	{
		var bCheckMailStarted = false;
		
		if (oResponse.Result === false)
		{
			App.Api.showErrorByCode(oResponse.ErrorCode);
		}
		else
		{
			_.each(oResponse.Result, function(aData, sFullName) {
				if (_.isArray(aData) && aData.length > 3)
				{
					var
						iCount = aData[0],
						iUnseenCount = aData[1],
						sUidNext = aData[2],
						sHash = aData[3]
					;
					bCheckMailStarted = bCheckMailStarted || this.setFolderCounts(oResponse.AccountID, sFullName, iCount, iUnseenCount, sUidNext, sHash);
				}
			}, this);
			
			if (oResponse.AccountID !== this.currentAccountId())
			{
				this.checkMailStarted(false);
			}
		}
		
		this.checkMailStarted(bCheckMailStarted);
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CMailCache.prototype.onCurrentMessageListResponse = function (oResponse, oRequest)
	{
		if (!oResponse.Result)
		{
			App.Api.showErrorByCode(oResponse.ErrorCode);
			if (this.messagesLoading() === true && oResponse.ErrorCode !== Enums.Errors.NotDisplayedError)
			{
				this.messagesLoadingError(true);
			}
			this.messagesLoading(false);
			this.checkMailStarted(false);
		}
		else
		{
			this.messagesLoadingError(false);
			this.parseMessageList(oResponse, oRequest);
	
			if (this.deletedDraftMessageUid() !== '')
			{
				var
					iDeletedDraftMessageUid = this.deletedDraftMessageUid(),
					bIsMessageInList = _.find(oResponse.Result['@Collection'],
						function(oRawMessage)
							{
								return oRawMessage.Uid === iDeletedDraftMessageUid;
							}
						)
					;
	
				if(!bIsMessageInList)
				{
					this.setCurrentMessage(null);
					this.deletedDraftMessageUid('');
				}
			}
		}
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CMailCache.prototype.onMessageListResponse = function (oResponse, oRequest)
	{
		if (oResponse && oResponse.Result)
		{
			this.parseMessageList(oResponse, oRequest);
		}
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CMailCache.prototype.parseMessageList = function (oResponse, oRequest)
	{
		var
			oResult = oResponse.Result,
			oFolderList = this.oFolderListItems[oResponse.AccountID],
			oFolder = null,
			oUidList = null,
			bTrustThreadInfo = (oRequest.UseThreads === '1'),
			bHasFolderChanges = false,
			bCurrentFolder = false,
			bCurrentList = false,
			bCurrentPage = false,
			aNewFolderMessages = []
		;
		
		if (oResult !== false && oResult['@Object'] === 'Collection/MessageCollection')
		{
			oFolder = oFolderList.getFolderByFullName(oResult.FolderName);
			
			// perform before getUidList, because in case of a mismatch the uid list will be pre-cleaned
			oFolder.setRelevantInformation(oResult.UidNext.toString(), oResult.FolderHash, 
				oResult.MessageCount, oResult.MessageUnseenCount);
			bHasFolderChanges = oFolder.hasChanges();
			oFolder.removeAllMessageListsFromCacheIfHasChanges();
			
			oUidList = oFolder.getUidList(oResult.Search, oResult.Filters);
			oUidList.setUidsAndCount(oResult);
			_.each(oResult['@Collection'], function (oRawMessage) {
				var oFolderMessage = oFolder.oMessages[oRawMessage.Uid.toString()];
				
				if (!oFolderMessage)
				{
					oFolderMessage = new CMessageModel();
				}
				oFolderMessage.parse(oRawMessage, oResponse.AccountID, false, bTrustThreadInfo);
				
				oFolder.oMessages[oFolderMessage.uid()] = oFolderMessage;
				aNewFolderMessages.push(oFolderMessage);
			}, this);
			
			AfterLogicApi.runPluginHook('response-custom-messages', 
				[oResponse.AccountID, oFolder.fullName(), aNewFolderMessages]);
	
			bCurrentFolder = this.currentAccountId() === oResponse.AccountID &&
					this.folderList().currentFolderFullName() === oResult.FolderName;
			bCurrentList = bCurrentFolder &&
					this.uidList().search() === oUidList.search() &&
					this.uidList().filters() === oUidList.filters();
			bCurrentPage = this.page() === ((oResult.Offset / AppData.User.MailsPerPage) + 1);
			if (bCurrentList)
			{
				this.uidList(oUidList);
				if (bCurrentPage)
				{
					this.setMessagesFromUidList(oUidList, oResult.Offset, oFolder.oMessages, true);
					this.messagesLoading(false);
					this.checkMailStarted(false);
				}
			}
			
			if (bHasFolderChanges && bCurrentFolder && (!bCurrentList || !bCurrentPage))
			{
				this.requestCurrentMessageList(this.folderList().currentFolderFullName(), this.page(), this.uidList().search(), '', false);
			}
			
			if (oFolder.type() === Enums.FolderTypes.Inbox &&
				oUidList.filters() === Enums.FolderFilter.Flagged &&
				oUidList.search() === '' &&
				this.folderList().oStarredFolder)
			{
				this.folderList().oStarredFolder.messageCount(oUidList.resultCount());
			}
		}
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CMailCache.prototype.onMoveMessagesResponse = function (oResponse, oRequest)
	{
		var
			oResult = oResponse.Result,
			oFolder = this.folderList().getFolderByFullName(oRequest.Folder),
			oToFolder = this.folderList().getFolderByFullName(oRequest.ToFolder),
			bToFolderTrash = (oToFolder && (oToFolder.type() === Enums.FolderTypes.Trash)),
			bToFolderSpam = (oToFolder && (oToFolder.type() === Enums.FolderTypes.Spam)),
			oDiffs = null,
			sConfirm = bToFolderTrash ? Utils.i18n('MAILBOX/CONFIRM_MESSAGES_DELETE_WITHOUT_TRASH') :
				Utils.i18n('MAILBOX/CONFIRM_MESSAGES_MARK_SPAM_WITHOUT_SPAM'),
			fDeleteMessages = _.bind(function (bResult) {
				if (bResult && oFolder)
				{
					this.deleteMessagesFromFolder(oFolder, oRequest.Uids.split(','));
				}
			}, this),
			oCurrFolder = this.folderList().currentFolder(),
			sCurrFolderFullName = oCurrFolder.fullName()
		;
		
		if (oResult === false)
		{
			oDiffs = oFolder.revertDeleted(oRequest.Uids.split(','));
			if (oToFolder)
			{
				oToFolder.addMessagesCountsDiff(-oDiffs.PlusDiff, -oDiffs.UnseenPlusDiff);
				if (oResponse.ErrorCode === Enums.Errors.ImapQuota && (bToFolderTrash || bToFolderSpam))
				{
					App.Screens.showPopup(ConfirmPopup, [sConfirm, fDeleteMessages]);
				}
				else
				{
					App.Api.showErrorByCode(oResponse.ErrorCode, Utils.i18n('MAILBOX/ERROR_MOVING_MESSAGES'));
				}
			}
			else
			{
				App.Api.showErrorByCode(oResponse.ErrorCode, Utils.i18n('MAILBOX/ERROR_DELETING_MESSAGES'));
			}
		}
		else
		{
			oFolder.commitDeleted(oRequest.Uids.split(','));
		}
		
		if (sCurrFolderFullName === oFolder.fullName() || oToFolder && sCurrFolderFullName === oToFolder.fullName())
		{
			oCurrFolder.markHasChanges();
			this.requestCurrentMessageList(sCurrFolderFullName, this.page(), this.uidList().search(), '', false);
		}
		else if (sCurrFolderFullName !== oFolder.fullName())
		{
			App.Prefetcher.startFolderPrefetch(oFolder);
		}
		else if (oToFolder && sCurrFolderFullName !== oToFolder.fullName())
		{
			App.Prefetcher.startFolderPrefetch(oToFolder);
		}
	};
	
	/**
	 * @param {string} sSearch
	 */
	CMailCache.prototype.searchMessagesInCurrentFolder = function (sSearch)
	{
		var
			sFolder = this.folderList().currentFolderFullName() || 'INBOX',
			sUid = this.currentMessage() ? this.currentMessage().uid() : '',
			sFilters = this.uidList().filters()
		;
		
		App.Routing.setHash(App.Links.mailbox(sFolder, 1, sUid, sSearch, sFilters));
	};
	
	/**
	 * @param {string} sSearch
	 */
	CMailCache.prototype.searchMessagesInInbox = function (sSearch)
	{
		App.Routing.setHash(App.Links.mailbox(this.folderList().inboxFolderFullName(), 1, '', sSearch, ''));
	};
	
	
	/**
	 * @constructor
	 */
	function CContactsCache()
	{
		this.contacts = {};
		this.responseHandlers = {};
		
		this.vcardAttachments = [];
		
		this.recivedAnim = ko.observable(false).extend({'autoResetToFalse': 500});
	}
	
	/**
	 * @param {string} sEmail
	 */
	CContactsCache.prototype.clearInfoAboutEmail = function (sEmail)
	{
		this.contacts[sEmail] = undefined;
	};
	
	/**
	 * @param {string} sEmail
	 * @param {Function} fResponseHandler
	 * @param {Object} oResponseContext
	 */
	CContactsCache.prototype.getContactByEmail = function (sEmail, fResponseHandler, oResponseContext)
	{
		if (AppData.User.ShowContacts)
		{
			var
				oContact = this.contacts[sEmail],
				oParameters = {
					'Action': 'ContactByEmail',
					'Email': sEmail
				}
			;
	
			if (oContact !== undefined)
			{
				fResponseHandler.apply(oResponseContext, [oContact]);
			}
			else
			{
				this.responseHandlers[sEmail] = {
					Handler: fResponseHandler,
					Context: oResponseContext
				};
				App.Ajax.send(oParameters, this.onContactByEmailResponse, this);
			}
		}
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CContactsCache.prototype.onContactByEmailResponse = function (oResponse, oRequest)
	{
		var
			oContact = null,
			oResponseData = this.responseHandlers[oRequest.Email]
		;
		
		if (oResponse.Result)
		{
			oContact = new CContactModel();
			oContact.parse(oResponse.Result);
		}
		
		this.contacts[oRequest.Email] = oContact;
		
		if (oResponseData)
		{
			oResponseData.Handler.apply(oResponseData.Context, [oContact]);
			this.responseHandlers[oRequest.Email] = undefined;
		}
	};
	
	/**
	 * @param {Object} oVcard
	 */
	CContactsCache.prototype.addVcard = function (oVcard)
	{
		this.vcardAttachments.push(oVcard);
	};
	
	/**
	 * @param {Array} aUids
	 */
	CContactsCache.prototype.markVcardsNonexistent = function (aUids)
	{
		_.each(this.vcardAttachments, function (oVcard) {
			if (-1 !== _.indexOf(aUids, oVcard.uid()))
			{
				oVcard.isExists(false);
			}
		});
	};
	
	/**
	 * @param {string} sName
	 * @param {string} sEmail
	 * @param {Function} fContactCreateResponse
	 * @param {Object} oContactCreateContext
	 */
	CContactsCache.prototype.addToContacts = function (sName, sEmail, fContactCreateResponse, oContactCreateContext)
	{
		var
			oParameters = {
				'Action': 'ContactCreate',
				'PrimaryEmail': 'Home',
				'UseFriendlyName': '1',
				'FullName': sName,
				'HomeEmail': sEmail
			}
		;
	
		App.Ajax.send(oParameters, fContactCreateResponse, oContactCreateContext);
		
		App.ContactsCache.recivedAnim(true);
	};
	
	
	/**
	 * @constructor
	 */
	function CCalendarCache()
	{
		this.calendars = ko.observableArray([]);
		this.calendarsLoadingStarted = ko.observable(false);
		
		this.icalAttachments = [];
		
		this.recivedAnim = ko.observable(false).extend({'autoResetToFalse': 500});
		
		this.calendarSettingsChanged = ko.observable(false);
		this.calendarChanged = ko.observable(false);
	}
	
	/**
	 * @param {Object} oIcal
	 */
	CCalendarCache.prototype.addIcal = function (oIcal)
	{
		this.icalAttachments.push(oIcal);
		if (this.calendars().length === 0)
		{
			this.requestCalendarList();
		}
	};
	
	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CCalendarCache.prototype.onCalendarListResponse = function (oResponse, oRequest)
	{
		var
			oResult = oResponse.Result,
			oUserCalendars = oResult ? oResult : null
		;
		
		if (oUserCalendars)
		{
			this.calendars(_.map(oUserCalendars, function (oCalendar) {
				return {'name': oCalendar.Name, 'id': oCalendar.Id};
			}));
		}
		
		this.calendarsLoadingStarted(false);
	};
	
	CCalendarCache.prototype.requestCalendarList = function ()
	{
		if (!this.calendarsLoadingStarted())
		{
			App.Ajax.send({'Action': 'CalendarList'}, this.onCalendarListResponse, this);
			
			this.calendarsLoadingStarted(true);
		}
	};
	
	/**
	 * @param {string} sUid
	 */
	CCalendarCache.prototype.markIcalNonexistent = function (sUid)
	{
		_.each(this.icalAttachments, function (oIcal) {
			if (sUid === oIcal.uid())
			{
				oIcal.onEventDelete();
			}
		});
	};
	
	/**
	 * @param {string} sUid
	 */
	CCalendarCache.prototype.markIcalTentative = function (sUid)
	{
		_.each(this.icalAttachments, function (oIcal) {
			if (sUid === oIcal.uid())
			{
				oIcal.onEventTentative();
			}
		});
	};
	
	/**
	 * @param {string} sUid
	 */
	CCalendarCache.prototype.markIcalAccepted = function (sUid)
	{
		_.each(this.icalAttachments, function (oIcal) {
			if (sUid === oIcal.uid())
			{
				oIcal.onEventAccept();
			}
		});
	};
	
	
	/**
	 * @constructor
	 */
	function CApp()
	{
		this.browser = new CBrowser();
		
		this.headerTabs = ko.observableArray([]);
		this.screensTitle = {};
		
		this.Ajax = new CAjax();
		this.Routing = new CRouting();
		this.Screens = new CScreens();
		this.Links = new CLinkBuilder();
		this.Api = new CApi();
		this.MessageSender = new CMessageSender();
		this.Prefetcher = new CPrefetcher();
		this.MailCache = null;
		this.ContactsCache = new CContactsCache();
		this.CalendarCache = new CCalendarCache();
		this.Storage = new CStorage();
		this.Phone = new CPhone();
	
		this.$downloadIframe = null;
	
		this.currentScreen = this.Screens.currentScreen;
		this.currentScreen.subscribe(this.setTitle, this);
		this.focused = ko.observable(true);
		this.focused.subscribe(this.setTitle, this);
	
		this.init();
		
		this.newMessagesCount = this.MailCache.newMessagesCount;
		this.newMessagesCount.subscribe(this.setTitle, this);
		
		this.currentMessage = this.MailCache.currentMessage;
		this.currentMessage.subscribe(this.setTitle, this);
	
		this.notification = null;
	
		this.initHeaderInfo();
	}
	
	// proto
	CApp.prototype.init = function ()
	{
		var
			oRawUserSettings = /** @type {Object} */ AppData['User'],
			oUserSettings = new CUserSettingsModel(),
			aRawAccounts = AppData['Accounts'],
			oAccounts = new CAccountListModel(),
			oRawAppSettings = /** @type {Object} */ AppData['App'],
			oAppSettings = new CAppSettingsModel()
		;
	
		oUserSettings.parse(oRawUserSettings);
		AppData.User = oUserSettings;
	
		aRawAccounts = /** @type {Array} */ aRawAccounts;
		oAccounts.parse(Utils.pInt(AppData['Default']), aRawAccounts);
		AppData.Accounts = oAccounts;
	
		oAppSettings.parse(oRawAppSettings);
		AppData.App = oAppSettings;
	
		this.MailCache = new CMailCache();
	
		this.useGoogleAnalytics();
		
		this.collectScreensData();
	};
	
	CApp.prototype.collectScreensData = function ()
	{
		if (AppData.User.ShowContacts)
		{
			this.addScreenToHeader('contacts', Utils.i18n('HEADER/CONTACTS'), Utils.i18n('TITLE/CONTACTS'), 
				'Contacts_ContactsViewModel', CContactsViewModel, this.ContactsCache.recivedAnim);
		}
		if (AppData.User.AllowCalendar)
		{
			this.addScreenToHeader('calendar', Utils.i18n('HEADER/CALENDAR'), Utils.i18n('TITLE/CALENDAR'), 
				'Calendar_CalendarViewModel', CCalendarViewModel, this.CalendarCache.recivedAnim);
		}
		if (AppData.User.IsFilesSupported)
		{
			this.addScreenToHeader('files', Utils.i18n('HEADER/FILESTORAGE'), Utils.i18n('TITLE/FILESTORAGE'), 'FileStorage_FileStorageViewModel', CFileStorageViewModel);
		}
		if (AppData.User.IsHelpdeskSupported)
		{
			this.addScreenToHeader('helpdesk', Utils.i18n('HEADER/HELPDESK'), Utils.i18n('TITLE/HELPDESK'), 'Helpdesk_HelpdeskViewModel', CHelpdeskViewModel);
		}
	};
	
	/**
	 * @param {Function} fHelpdeskUpdate
	 */
	CApp.prototype.registerHelpdeskUpdateFunction = function (fHelpdeskUpdate)
	{
		this.fHelpdeskUpdate = fHelpdeskUpdate;
	};
	
	CApp.prototype.updateHelpdesk = function ()
	{
		if (this.fHelpdeskUpdate)
		{
			this.fHelpdeskUpdate();
		}
	};
	
	CApp.prototype.useGoogleAnalytics = function ()
	{
		var
			ga = null,
			s = null
		;
		
		if (AppData.App.GoogleAnalyticsAccount && 0 < AppData.App.GoogleAnalyticsAccount.length)
		{
			window._gaq = window._gaq || [];
			window._gaq.push(['_setAccount', AppData.App.GoogleAnalyticsAccount]);
			window._gaq.push(['_trackPageview']);
	
			ga = document.createElement('script');
			ga.type = 'text/javascript';
			ga.async = true;
			ga.src = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(ga, s);
		}
	};
	
	CApp.prototype.tokenProblem = function ()
	{
		var
			sReloadFunc= 'window.location.reload(); return false;',
			sHtmlError = Utils.i18n('WARNING/TOKEN_PROBLEM_HTML', {'RELOAD_FUNC': sReloadFunc})
		;
		
		AppData.Auth = false;
		App.Api.showError(sHtmlError, true, true);
	};
	
	/**
	 * @param {number=} iLastErrorCode
	 */
	CApp.prototype.logout = function (iLastErrorCode)
	{
		var oParameters = {'Action': 'Logout'};
		
		if (iLastErrorCode)
		{
			oParameters.LastErrorCode = iLastErrorCode;
		}
		
		App.Ajax.send(oParameters, this.onLogout, this);
	};
	
	CApp.prototype.authProblem = function ()
	{
		this.logout(Enums.Errors.AuthError);
	};
	
	CApp.prototype.onLogout = function ()
	{
		Utils.WindowOpener.closeAll();
		
		App.Routing.finalize();
		
		if (AppData.App.CustomLogoutUrl !== '')
		{
			window.location.href = AppData.App.CustomLogoutUrl;
		}
		else
		{
			window.location.reload();
		}
	};
	
	CApp.prototype.run = function ()
	{
		Utils.log('run', AppData);
		
		this.Screens.init();
	
		if (bIsIosDevice && AppData && AppData['Auth'] && AppData.App.IosDetectOnLogin)
		{
			window.location.href = '?ios';
		}
		else if (AppData && AppData['Auth'])
		{
			AppData.SingleMode = this.Routing.isSingleMode();
			this.MailCache.init();
			
			if (AppData.HelpdeskRedirect && this.Routing.currentScreen !== Enums.Screens.Helpdesk)
			{
				this.Routing.setHash([Enums.Screens.Helpdesk]);
			}
			
			this.Routing.init(Enums.Screens.Mailbox);
	
			if (!AppData.SingleMode)
			{
				this.doFirstRequests();
			}
		}
		else if (AppData && AppData.App.CustomLoginUrl !== '')
		{
			window.location.href = AppData.App.CustomLoginUrl;
		}
		else
		{
			this.Screens.showCurrentScreen(Enums.Screens.Login);
			if (AppData && AppData['LastErrorCode'] === Enums.Errors.AuthError)
			{
				this.Api.showError(Utils.i18n('WARNING/AUTH_PROBLEM'), false, true);
			}
		}
	
		if (AppData.User.AllowVoice && !AppData.SingleMode)
		{
			this.Phone.init();
		}
	};
	
	/**
	 * @param {string} sName
	 * @param {string} sHeaderTitle
	 * @param {string} sDocumentTitle
	 * @param {string} sTemplateName
	 * @param {Object} oViewModelClass
	 * @param {Object=} koRecivedAnim = undefined
	 */
	CApp.prototype.addScreenToHeader = function (sName, sHeaderTitle, sDocumentTitle, sTemplateName, 
											oViewModelClass, koRecivedAnim)
	{
		Enums.Screens[sName] = sName;
		this.Screens.oScreens[Enums.Screens[sName]] = {
			'Model': oViewModelClass,
			'TemplateName': sTemplateName
		};
		this.headerTabs.push({
			'name': Enums.Screens[sName],
			'title': sHeaderTitle,
			'hash': this.Routing.buildHashFromArray([Enums.Screens[sName]]),
			'koRecivedAnim': koRecivedAnim
		});
		this.screensTitle[Enums.Screens[sName]] = sDocumentTitle;
	};
	
	CApp.prototype.doFirstRequests = function ()
	{
		window.setTimeout(function () {
			App.Ajax.send({'Action': 'DoServerInitializations'});
		}, 30000);
	};
	
	CApp.prototype.populateFetchers = function ()
	{
		var oParameters = {
				'Action': 'FetcherList',
				'AccountID': AppData.Accounts.defaultId() //TODO AppData.Accounts.internalId()
			};
	
		App.Ajax.send(oParameters, onFetcherListResponse, this);
		/*if (AppData.App.AllowFetcher)
		{
			App.Ajax.send(oParameters, onFetcherListResponse, this);
		}*/
	
		function onFetcherListResponse (oData, oParameters)
		{
			var oFetcherList = new CFetcherListModel(),
				iFetcherAccountId = parseInt(oData.AccountID, 10),
				aCollection = AppData.Accounts.collection(),
				nLen = aCollection.length,
				iIdx = 0
			;
	
			if (oData.Result.length)
			{
				oFetcherList.parse(iFetcherAccountId, oData.Result);
	
				for (; iIdx < nLen; iIdx++) {
					if(oData.AccountID === aCollection[iIdx].id())
					{
						aCollection[iIdx].fetchers(oFetcherList);
					}
				}
			}
			else
			{
				for (; iIdx < nLen; iIdx++) {
					if(oData.AccountID === aCollection[iIdx].id())
					{
						aCollection[iIdx].fetchers(null);
					}
				}
			}
		}
	};
	
	/**
	 * Downloads by url through iframe.
	 *
	 * @param {string} sUrl
	 */
	CApp.prototype.downloadByUrl = function (sUrl)
	{
		var
			bAndroid = navigator.userAgent.toLowerCase().indexOf('android') > -1
		;
		
		if (bAndroid)
		{
			window.open(sUrl);
		}
		else
		{
			if (this.$downloadIframe === null)
			{
				this.$downloadIframe = $('<iframe style="display: none;"></iframe>').appendTo(document.body);
			}
	
			this.$downloadIframe.attr('src', sUrl);
		}
	};
	
	CApp.prototype.initHeaderInfo = function ()
	{
		if (this.browser.ie)
		{
			$(document)
				.bind('focusin', _.bind(this.onFocus, this))
				.bind('focusout', _.bind(this.onBlur, this))
			;
		}
		else
		{
			$(window)
				.bind('focus', _.bind(this.onFocus, this))
				.bind('blur', _.bind(this.onBlur, this))
			;
		}
	};
	
	CApp.prototype.onFocus = function ()
	{
		this.focused(true);
	};
	
	CApp.prototype.onBlur = function ()
	{
		this.focused(false);
	};
	
	/**
	 * @param {string=} sTitle
	 */
	CApp.prototype.setTitle = function (sTitle)
	{
		var
			sNewMessagesCount = this.newMessagesCount(),
			bNotChange = AppData.SingleMode && !this.focused()
		;
		
		sTitle = sTitle || '';
		
		if (!bNotChange)
		{
			if (this.focused() || sNewMessagesCount === 0)
			{
				sTitle = this.getTitleByScreen();
			}
			else
			{
				sTitle = Utils.i18n('TITLE/HAS_UNSEEN_MESSAGES_PLURAL', {'COUNT': sNewMessagesCount}, null, sNewMessagesCount) + ' - ' + AppData.Accounts.getEmail();
			}
	
			document.title = '.';
			document.title = sTitle;
		}
	};
	
	CApp.prototype.getTitleByScreen = function ()
	{
		var
			sTitle = '',
			sSubject = ''
		;
		
		try
		{
			if (this.MailCache.currentMessage())
			{
				sSubject = this.MailCache.currentMessage().subject();
			}
		}
		catch (oError) {}
		
		switch (this.currentScreen())
		{
			case Enums.Screens.Login:
				sTitle = Utils.i18n('TITLE/LOGIN', null, '');
				break;
			case Enums.Screens.Mailbox:
			case Enums.Screens.BottomMailbox:
				sTitle = AppData.Accounts.getEmail() + ' - ' + Utils.i18n('TITLE/MAILBOX');
				break;
			case Enums.Screens.Compose:
			case Enums.Screens.SingleCompose:
				sTitle = AppData.Accounts.getEmail() + ' - ' + Utils.i18n('TITLE/COMPOSE');
				break;
			case Enums.Screens.SingleMessageView:
				sTitle = AppData.Accounts.getEmail() + ' - ' + Utils.i18n('TITLE/VIEW_MESSAGE');
				if (sSubject)
				{
					sTitle = sSubject + ' - ' + sTitle;
				}
				break;
			default:
				if (this.screensTitle[this.currentScreen()])
				{
					sTitle = this.screensTitle[this.currentScreen()];
				}
				break;
		}
		
		if (sTitle === '')
		{
			sTitle = AppData.App.SiteName;
		}
		else
		{
			sTitle += ' - ' + AppData.App.SiteName;
		}
	
		return sTitle;
	};
	
	/**
	 * @param {string} sAction
	 * @param {string=} sTitle
	 * @param {string=} sBody
	 * @param {string=} sIcon
	 * @param {Function=} fnCallback
	 * @param {number=} iTimeout
	 */
	CApp.prototype.desktopNotify = function (sAction, sTitle, sBody, sIcon, fnCallback, iTimeout)
	{
		Utils.desktopNotify(sAction, sTitle, sBody, sIcon, fnCallback, iTimeout);
	};
	
	App = new CApp();
	window.App = App;
	$(function () {
		App.run();
	}, 0);
	
	window.AfterLogicApi = AfterLogicApi;
	
	// export
	window.Enums = Enums;
	
	$html.removeClass('no-js').addClass('js');
	
	if ($html.hasClass('pdf'))
	{
		aViewMimeTypes.push('application/pdf');
		aViewMimeTypes.push('application/x-pdf');
	}
	
}(jQuery, window, ko, crossroads, hasher));
