
/**
 * @typedef { Object } argFormat
 * @property { string } name
 * @property { 'string'|'number'|'boolean'|'path' } type
 * @property { string } short
 * @property { string } long
 * @property { boolean } isPositional
 * @property { boolean } multipe
 * @property { boolean } required
 * @property { string } enum 
 */

/**
 * @param { argFormat } arg
 */
const validateArg = (arg)=>{
	// TODO
	return arg;
}

/**
 *   
 * @param { argFormat[] } formats 
 * @param { string[] } args 
 */

const main = function(formats, args = process.argv.slice(2), verbose = false) {
	formats = formats.map(validateArg);

	let posList = formats.filter(e => e.isPositional === true);

	let result = {};

	for (var i=0; i<args.length; i++){
		
		// Long flag
		if (args[i].startsWith('-')) {
			
			let flag = args[i].replace(/^\-\-?/, ''), k, val;
			if (flag.includes('=')){
				[k, val] = flag.split('=');
			} else {
				k = flag; val = args[i+1] && !args[i+1].startsWith('-') ? args[++i] : null;
			}

			let fmt = formats.find(e => e[args[i].startsWith('--') ? 'long' : 'short'] == k);
			if (!fmt) { verbose && console.warn(`Argument "${k}" not expected`); continue; }
			if (!val && fmt.type != 'boolean') continue;

			if (fmt.type === 'boolean'){
				val = !val ? true : val === 'true';
			}

			if (fmt.multipe === true){
				result[ fmt.name ] = result[ fmt.name ] || [];
				result[ fmt.name ].push( val );
			} else {
				result[ fmt.name ] = val;
			}
		}
		// Posiional
		else {
			let fmt = posList.shift();
			if (!fmt) { verbose && console.warn(`No remaining positional argument for "${k}"`); continue; }
			result[ fmt.name ] = args[i];
		}
	}
	return result;
}

main()

module.exports = main;
