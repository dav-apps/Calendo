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
