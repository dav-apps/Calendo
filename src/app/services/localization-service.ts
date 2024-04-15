import { Injectable } from "@angular/core"
import * as locales from "src/locales/locales"

@Injectable()
export class LocalizationService {
	locale = locales.enUS

	constructor() {
		this.locale = this.getLocale(navigator.language)
	}

	getLocale(language?: string) {
		if (language == null) return locales.enUS

		const locale = language.toLowerCase()

		if (locale.startsWith("en")) {
			if (locale == "en-gb") return locales.enGB
			if (locale == "en-nz") return locales.enNZ
			if (locale == "en-il") return locales.enIL
			if (locale == "en-ie") return locales.enIE
			if (locale == "en-ca") return locales.enCA
			if (locale == "en-au") return locales.enAU
			return locales.enUS
		} else if (locale.startsWith("de")) {
			if (locale == "de-at") return locales.deAT
			if (locale == "de-ch") return locales.deCH
			return locales.deDE
		}

		return locales.enUS
	}
}
