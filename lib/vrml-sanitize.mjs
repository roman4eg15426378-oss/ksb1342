/**
 * Базис и др. экспортёры часто пишут DEF/USE с дефисом (panel-12).
 * В VRML 2.0 идентификатор не может содержать '-' — лексер three.js падает.
 * Заменяем только имена после DEF / USE, не трогая числа и coordIndex.
 */

/** Символы, запрещённые внутри идентификатора в лексере THREE.VRMLLoader */
const BAD_IN_ID = /[\0-\x20\x22\x27\x23\x2b\x2c\x2d\x2e\x5b\x5d\x5c\x7b\x7d]/;

function isLexerSafeId(name) {
	if (!name || /^[0-9]/.test(name)) return false;
	return !BAD_IN_ID.test(name);
}

function toSafeBase(name) {
	let s = '';
	for (const ch of name) {
		const c = ch.charCodeAt(0);
		if ((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || ch === '_') {
			s += ch;
		} else {
			s += '_';
		}
	}
	s = s.replace(/_+/g, '_').replace(/^_|_$/g, '');
	if (!s || /^[0-9]/.test(s)) s = 'id_' + (s || 'x');
	return s;
}

/**
 * @param {string} text
 * @returns {string}
 */
export function sanitizeVrmlForThreeLoader(text) {
	const defRe = /\bDEF\s+(\S+)/g;
	const useRe = /\bUSE\s+(\S+)/g;
	const order = [];
	const uniq = new Set();
	for (const re of [defRe, useRe]) {
		re.lastIndex = 0;
		let m;
		while ((m = re.exec(text)) !== null) {
			const n = m[1];
			if (!uniq.has(n)) {
				uniq.add(n);
				order.push(n);
			}
		}
	}

	const map = new Map();
	const usedOut = new Set();
	for (const n of order) {
		if (isLexerSafeId(n)) continue;
		let base = toSafeBase(n);
		let out = base;
		let k = 0;
		while (usedOut.has(out)) {
			out = base + '_' + ++k;
		}
		usedOut.add(out);
		map.set(n, out);
	}

	if (map.size === 0) return text;

	text = text.replace(/\bDEF\s+(\S+)/g, (_, n) => `DEF ${map.get(n) ?? n}`);
	text = text.replace(/\bUSE\s+(\S+)/g, (_, n) => `USE ${map.get(n) ?? n}`);
	return text;
}
