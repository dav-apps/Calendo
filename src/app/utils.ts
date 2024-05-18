import { Theme } from "./types"
import { lightThemeKey, darkThemeKey } from "./constants"

export function convertStringToTheme(value: string): Theme {
	switch (value) {
		case lightThemeKey:
			return Theme.Light
		case darkThemeKey:
			return Theme.Dark
		default:
			return Theme.System
	}
}

export function bytesToGigabytesText(bytes: number, rounding: number): string {
	if (bytes == 0) return "0"

	let gb = Math.round(bytes / 1000000000).toFixed(rounding)
	return gb == "0.0" ? "0" : gb
}

export function randomNumber(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}
