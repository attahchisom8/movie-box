/**
 * THis utility ensures that users theme configuration and contrasts
 * abide by standard WCAG accessibility ratios
 */

/**
 * hexToNormalizedRAGB - Converts a hex string like "#54e281" into normalized
 * rgb codes
 * @param hexStr: hexadecimal color code
 * 
 * Return: a tuple of relative rgb color code
 */

type RGB = [number, number, number];
type Dict = Record<string, number>; // or {[key: string]: number};

export const hexToNormalizedRGB = (hexStr: string | null): RGB | null =>  {
	const hexDec: Dict = {'0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
		'6': 6, '7': 7, '8': 8, '9': 9, 'a': 10, 'b': 11, 'c': 12, 'd': 13,
		'e': 14, 'f': 15,
	};

	if (!hexStr || !hexStr.startsWith("#"))
		return null;

	hexStr = hexStr.substring(1, hexStr.length).toLowerCase();
	const len = hexStr.length;

	if ((len < 6 && len !== 3) || (len > 6))
		return null;

	for (const char of hexStr) {
		if (!hexDec.hasOwnProperty(char)) {
			return null;
		}
	}

	if (len === 3) {
		hexStr = hexStr[0] + hexStr[0] + hexStr[1] + hexStr[1] + hexStr[2] + hexStr[2];
	}

	const [r, g, b] = [hexStr.substring(0, 2), hexStr.substring(2, 4),
		hexStr.substring(4, 6)
	];

	const R = (hexDec[r[0]] * 16 + hexDec[r[1]]) / 255;
	const G = (hexDec[g[0]] * 16 + hexDec[g[1]]) / 255;
	const B = (hexDec[b[0]] * 16 + hexDec[b[1]]) / 255;

	return [Number(R.toFixed(4)), Number(G.toFixed(4)), Number(B.toFixed(4))];

}

/*const colorHex = '#aabe4d';
console.log(hexToRelativeRGB(colorHex));*/

/**
 * linearizeColorChannel - linearizes a normalized color chaneel using
 * gamma expansion critrtia
 */

export const linearizeColorChannel = (channel: number): number => {
	return channel <= 0.04045 ?
	(channel / 12.92) : Math.pow((channel + 0.055) / 1.055, 2.4);
}

/**
 * getRelativeLuminace - get relative RGB luminance using stanmdard weighted
 * Values
 */

export const getRelativeRGB = (normalizedRGB: RGB): number => {
	const [Rrl, Grl, Brl] = normalizedRGB?.map(linearizeColorChannel);
	return 0.2126 * Rrl + 0.7152 * Grl + 0.0722 * Brl;
}


/**
 * getConstrastRatio - get constast ratio based on two color values
 * in hex
 * @param textcolor: color o the UI text
 * @param backgroundColor: The background color of the UI
 * 
 * Return: tHE constrast ratio of both color or null
 */

export const getConstrastRatio = (
	textColor: string,
	backgroundColor: string
): number | null => {
	const relRGB_txc = hexToNormalizedRGB(textColor);
	const relRGB_bgc = hexToNormalizedRGB(backgroundColor);

	if (!relRGB_bgc || !relRGB_txc)
		return null;

	const relL1 = getRelativeRGB(relRGB_txc);
	const relL2 = getRelativeRGB(relRGB_bgc);

	const L1 = Math.max(relL1, relL2);
	const L2 = Math.min(relL1, relL2);

	const ratio = Number(((L1 + 0.05) / (L2 + 0.05)).toFixed(1));
	// console.log(`L1 : L2 --> ${L1} : ${L2}, CR: ${ratio}`);

	return ratio;
}


/**
 * isCAGcompliant - checks if a contrast comply to standard wcag
 * constrast rules
 */

export const isWCAGcompliant = (
	textColor: string,
	backgroundColor: string,
	isLargeText: boolean = false,
	level: 'AA' | 'AAA' = 'AA'
): boolean => {
	const ratio = getConstrastRatio(textColor, backgroundColor);
	if (!ratio)
		return false;

	const targetRatio = level === 'AAA' ? (isLargeText ? 4.5 : 7.0)
	: (isLargeText ? 3.0 : 4.5);

	return ratio >= targetRatio;
}

const textColor = "#00FF00";
const backgroundColor = "#FF0000";
const ratio = getConstrastRatio(textColor, backgroundColor);
const passedAA = isWCAGcompliant(textColor, backgroundColor);

console.log(`contrast ratio: ${ratio?.toFixed(0)} : 1`);
console.log(`passed WCAG AA Complianmt test: ${passedAA}`);
