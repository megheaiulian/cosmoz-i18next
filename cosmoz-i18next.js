/*global Cosmoz, i18n, Polymer */

if (typeof Cosmoz === 'undefined') {
	var Cosmoz = {};
}

(function () {

	"use strict";

	var translationElements = [];

	Cosmoz.TranslatableBehavior = {
		properties: {
			t: {
				type: Object,
				value: function () {
					return {};
				}
			}
		},

		_argumentsToObject: function (args, skipnum) {
			var argsArray = Array.prototype.slice.call(args, skipnum);
			return this._arrayToObject(argsArray);
		},
		_arrayToObject: function (array) {
			var ctx = this,
				object = {};

			array.forEach(function (item, index) {
				if (object.count === undefined && typeof item === "number") {
					object.count = item;
				}
				// Don't send the 't' kicker to i18n for arguments
				if (item !== ctx.t) {
					object[index] = item;
				}
			});
			return object;
		},

		_ensureInitialized: function () {
			if (!i18n.isInitialized()) {
				// default i18n init, to ensure translate function will return something
				// even when there is no <i18next> element in the page.
				i18n.init({lng: 'en', resStore: { en: {}}, fallbackLng: false});
			}
		},

		_: function (key) {
			this._ensureInitialized();

			var args = this._argumentsToObject(arguments, 1);
			// Don't make i18next fetch more translations
			delete args.count;
			return i18n.t(key, args);
		},
		ready: function () {
			translationElements.push(this);
		},
		detached: function () {
			var i = translationElements.indexOf(this);
			if (i >= 0) {
				translationElements.splice(i, 1);
			}
		},
		ngettext: function (singular, plural, n) {
			this._ensureInitialized();

			var
				args = this._argumentsToObject(arguments, 2),
				key = singular;

			if (i18n.pluralExtensions.needsPlural(i18n.lng(), n)) {
				args.defaultValue = plural;
				key = i18n.options.ns.defaultNs + i18n.options.nsseparator + singular + i18n.options.pluralSuffix;
				delete args.count;
			} else {
				args.defaultValue = singular;
				delete args.count;
			}
			return i18n.t(key, args);
		},

		pgettext: function (context, key) {
			this._ensureInitialized();

			var args = this._argumentsToObject(arguments, 2);
			args.context = context;
			// Don't make i18next fetch more translations
			delete args.count;
			return i18n.t(key, args);
		},
		npgettext: function (context, singular, plural) {
			this._ensureInitialized();

			var args = this._argumentsToObject(arguments, 3);
			args.context = context;
			args.defaultValue = plural;
			return i18n.t(singular, args);
		}
	};

	Polymer({
		is: 'cosmoz-i18next',
		properties: {
			domain: {
				type: String,
				value: "messages"
			},
			interpolationPrefix: {
				type: String,
				value: '__'
			},
			interpolationSuffix: {
				type: String,
				value: '__'
			},
			language: {
				type: String,
				value: "en"
			},
			namespace: {
				type: String,
				value: 'translation'
			},
			translations: {
				type: Object,
				observer: '_setTranslations'
			},
			keySeparator: {
				type: String,
				value: '.'
			},
			nsSeparator: {
				type: String,
				value: ':'
			}
		},
		_setTranslations: function () {
			i18n.addResources(this.language, this.namespace, this.translations);
			translationElements.forEach(function (element) {
				element.t = {};
			});
		},
		ready: function () {
			i18n.init({
				interpolationPrefix: this.interpolationPrefix,
				interpolationSuffix: this.interpolationSuffix,
				keyseparator: this.keySeparator,
				lng: this.language,
				nsseparator: this.nsSeparator,
				resStore: {},
				fallbackLng: false
			});
		}
	});
}());