/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env browser, amd*/
/*global URL*/
/**
 * @name orion.xhr
 * @namespace Provides a promise-based API to {@link XMLHttpRequest}.
 */
define([
	'orion/Deferred',
	'orion/xsrfUtils',
	'orion/URL-shim', // no exports, must come last
], function(Deferred, xsrfUtils) {
	/**
	 * @name orion.xhr.Result
	 * @class Wraps an XHR response or failure.
	 * @property {Object} args Arguments passed to the {@link orion.xhr.xhr} call.
	 * @property {Object|ArrayBuffer|Blob|Document|String} response The <code>response</code> object returned by the XMLHttpRequest.
	 * It is typed according to the <code>responseType</code> passed to the XHR call (by default it is a {@link String}).
	 * @property {String} [responseText] The <code>response</code> returned by the XMLHttpRequest, if it is a {@link String}.
	 * If the <code>response</code> is not a String, this property is <code>null</code>.
	 * @property {Number} status The HTTP status code returned by the XMLHttpRequest.
	 * @property {String} url The URL that the XHR request was made to.
	 * @property {XMLHttpRequest} xhr The underlying XMLHttpRequest object.
	 * @property {String|Error} error <i>Optional</i>. If a timeout occurred or an error was thrown while performing the
	 * XMLHttpRequest, this field contains information about the error.
	 */

	/**
	 * @param {String} url
	 * @param {Object} options
	 * @param {XMLHttpRequest} xhr
	 * @param {String|Error} [error]
	 */
	function makeResult(message,data,error) {
		var responseText = typeof data === 'string' ? data : null;
		var status;
		try {
			status = data.status;
		} catch (e) {
			status = 0;
		}
		var result = {
			args: message.options,
			response: data,
			responseText: responseText,
			status: status,
			url: message.url,
			xhr: {
				response: data,
				status:202,
				getResponseHeader: function(){}
			}
		};
		if (typeof error !== 'undefined') { //$NON-NLS-0$
			result.error = error;
		}
		return result;
	}

	function makeMessage(method,url,options) {
		var message = {
			options: options,
			method: method,
			url: url
		};
		return message;
	}

	function isSameOrigin(url) {
		return new URL(location.href).origin === new URL(url, location.href).origin;
	}

	/**
	 * Wrapper for {@link XMLHttpRequest} that returns a promise.
	 * @name xhr
	 * @function
	 * @memberOf orion.xhr
	 * @param {String} method One of 'GET', 'POST', 'PUT', 'DELETE'.
	 * @param {String} url The URL to request.
	 * @param {Object} [options]
	 * @param {Object|ArrayBuffer|Blob|Document} [options.data] The raw data to send as the request body. (Only allowed for POST and PUT).
	 * @param {Object} [options.headers] A map of header names and values to set on the request.
	 * @param {Boolean} [options.log=false] If <code>true</code>, failed requests will be logged to the JavaScript console.
	 * @param {String} [options.responseType=''] Determines the type of the response object returned. Value must be one of the following:
	 * <ul><li><code>'arraybuffer'</code>
	 * <li><code>'blob'</code>
	 * <li><code>'document'</code>
	 * <li><code>'json'</code>
	 * <li><code>'text'</code>
	 * <li><code>''</code> (same as <code>'text'</code>)</ul>
	 * @param {Number} [options.timeout=0] Timeout in milliseconds. Defaults to 0 (no timeout).
	 * @returns {Deferred} A deferred for the result. The deferred will resolve on 2xx, 3xx status codes or reject on 4xx, 5xx status codes.
	 * In both cases a {@link orion.xhr.Result} is provided to the listener.
	 */
	// TODO: upload progress, user/password
	function _xhr(method, url, options/*, XMLHttpRequestImpl */) {
		options = options || {};
		// message
		var message = (arguments.length > 3 && arguments[3]) ? arguments[3] : makeMessage(method,url,options); //$NON-NLS-0$
		var d = new Deferred();
		var ipc = nodereq('electron').ipcRenderer;
		var headers = options.headers || {};
		if (isSameOrigin(url)) {
			xsrfUtils.setNonceHeader(headers);
		}
		var log = options.log || false;
		if (typeof headers['X-Requested-With'] === 'undefined') { //$NON-NLS-1$ //$NON-NLS-0$
			headers['X-Requested-With'] = 'XMLHttpRequest'; //$NON-NLS-1$ //$NON-NLS-0$
		}
	
		try {
			var returnURL = url + '-' + method;
			console.log(returnURL);
			ipc.send(method, message);
			ipc.on(returnURL, function(event, data) {
				console.log(data);
				var result = makeResult(message,data);
				d.resolve(result);
			});

			// var timeoutId = setTimeout(function() {
			// 	d.reject(makeResult(message, null, 'Timeout exceeded')); //$NON-NLS-0$
			// }, options.timeout);
			// d.promise.then(clearTimeout.bind(null, timeoutId), clearTimeout.bind(null, timeoutId));
		} catch (e) {
			d.reject(makeResult(message, null, e));
		}

		return d.promise;
	}
	return _xhr;
});