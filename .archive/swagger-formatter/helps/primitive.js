
const { isJSON, isMultipartyFile } = require('../../common');
const { assert: { ValidationAssert, ParsingAssert } } = require('./assert');



let PrimitiveType = function(opts){
	ValidationAssert.ne (opts, null, 'cannot be null');
	
	if (typeof opts === "string"){
		this.type = opts;
		this.required = false;
	} else {
		ValidationAssert.eq (isJSON(opts), true, 'expected a type object or a string');	
		ValidationAssert.stEq (typeof opts.type, 'string', 'type objects must have a [string] field "type"');	
		Object.assign(this, {required: false}, opts);
		ValidationAssert.stEq (typeof this.required, 'boolean', 'required field must be a boolean');
	}
	
	ValidationAssert.eq( PrimitiveType.AcceptedList.includes(this.type), true, `primitive type must be one of "${PrimitiveType.AcceptedList.join('", "')}"` );

	this.validate();
}

PrimitiveType.AcceptedList = [ "string", "integer", "number", "boolean" ]

PrimitiveType.prototype.validate = function(){
	switch(this.type){
		case 'string':
			return this.validateString();
		case 'integer':
		case 'number':
			return this.validateNumber();
		case 'boolean':
			// return this.validateBoolean();
			break;
	}
}

PrimitiveType.prototype.parse = function(x){

	if (x == null){
		if (this.default) return this.default;
		ParsingAssert.stEq( this.required, false, 'required' );
		return null;
	}
	
	switch(this.type){
		case 'string':
			return this.parseString(x);
		case 'integer':
		case 'number':
			return this.parseNumber(x);
		case 'boolean':
			return this.parseBoolean(x);
	}
}

PrimitiveType.prototype.validateString = function(){
	if(this.minLength){
		ValidationAssert.stEq(typeof this.minLength, 'number', 'Field "minLength" must be an integer');
	}
	if(this.maxLength){
		ValidationAssert.stEq(typeof this.maxLength, 'number', 'Field "maxLength" must be an integer');
	}
	if(this.minLength && this.maxLength){
		ValidationAssert.stEq(this.minLength < this.maxLength, true, 'Field "minLength" must be < to "maxLength"');
	}

	if(this.pattern){
		ValidationAssert.stEq(  typeof this.pattern, 'string', 'Field "pattern" must be a valid regex')
		ValidationAssert.notThrows(()=>{ new RegExp(this.pattern) }, 'Field "pattern" must be a valid regex');
		this.default && ValidationAssert.stEq( new RegExp(this.pattern).test(this.default), 'Field "pattern" negates "default"' );
	}
	if (this.enum) {
		ValidationAssert.stEq(this.enum instanceof Array, true, 'Field "enum" an array');
		this.minLength && this.enum.map((e,i)=>ValidationAssert.stEq(e.length >= minLength, true, `Field enum[${i}] shorter than minLength (${this.minLength})`));
		this.maxLength && this.enum.map((e,i)=>ValidationAssert.stEq(e.length <= minLength, true, `Field enum[${i}] longer than maxLength (${this.maxLength})`));
		this.default && ValidationAssert.stEq( this.enum.indexOf(this.default) >= 0, true, 'Field "enum" negates "default"' );
		this.pattern && ValidationAssert.stEq( ! this.enum.map((e,i) => new RegExp(this.pattern).test(e)).includes(false), 'Field "enum"\'s items do not all match "pattern"' );
	}

	if (this.format) {
		ValidationAssert.stEq( typeof this.format, 'string', 'Field "format" must be string' );
		let fmt = ['date', 'date-time', 'password', 'byte', 'binary']
		ValidationAssert.stEq( fmt.indexOf(this.format) >=0, true, `Field "format" must be among: "${fmt.join('", "')}"` )

		// TODO check default, enum, when this.format is date or date-time
	}

	if(this.uppercase != null){
		ValidationAssert.eq(typeof this.uppercase, 'boolean', 'Field "uppercase" must be boolean');
	}
	if(this.lowercase != null){
		ValidationAssert.eq(typeof this.lowercase, 'boolean', 'Field "lowercase" must be boolean');
		this.uppercase != null && ValidationAssert.ne( this.uppercase, this.lowercase, 'Fields "uppercase" and "lowercase" cannot be identical')
	}
}

PrimitiveType.prototype.parseString = function(x){

	if (this.format === "binary"){
		ParsingAssert.eq( isMultipartyFile(x), true );
		return x;
	}

	// if (!x) { ParsingAssert.stNe( this.required, false); return null };

	ParsingAssert.eq( typeof x === 'string', true, `expected string but got ${typeof x}` );

	if(this.minLength){
		ParsingAssert.eq( x.length >= this.minLength, true, `should have at least ${this.minLength} characters` );
	}
	if(this.maxLength){
		ParsingAssert.eq( x.length <= this.maxLength, true, `should have at most ${this.maxLength} characters`);
	}
	if(this.pattern){
		ParsingAssert.eq( new RegExp(this.pattern).test(x), true, `wrong format, must validate against the following regex ${this.pattern}`);
	}
	
	if (this.enum) {
		ParsingAssert.eq( this.enum.indexOf(x) >= 0, true, `wrong value, must be one of : "${this.enum.join('", "')}"` );
	}

	if (this.format === 'date' || this.format === 'date-time'){
		x = new Date( /\d/.test(x) ? parseInt(x) : x);
		ParsingAssert.eq( !isNaN(x), true, `not a valid ${this.format}`);
		return x;
	}
	
	if (this.uppercase === true) return x.toUpperCase();

	if (this.lowercase === true) return x.toLowerCase();

	return x;
}

PrimitiveType.prototype.validateNumber = function(){
	if(this.min != null){
		ValidationAssert.stEq(typeof this.min, 'number', 'Field "min" must be a number');
	}
	
	if(this.max != null){
		ValidationAssert.stEq(typeof this.max, 'number', 'Field "max" must be a number');
	}
	
	if(this.max != null && this.min != null){
		ValidationAssert.stEq(this.max > this.min, true, 'Field "min" must be < than "max"');
	}
	
	if(this.exclusiveMinimum != null){
		ValidationAssert.stEq(typeof this.exclusiveMinimum, 'boolean', 'Field "exclusiveMinimum" must be a number');
	}

	if(this.exclusiveMaximum != null){
		ValidationAssert.stEq(typeof this.exclusiveMaximum, 'boolean', 'Field "exclusiveMaximum" must be a number');
	}

	if (this.format){
		ValidationAssert.stEq(typeof this.format, 'string', 'Field "format" must be a string');
		let types = this.type == 'integer' ? ['int32', 'int64'] : ['float', 'double']
		ValidationAssert.stEq(types.indexOf(this.format) >= 0, true, `Field "format" must be one of : "${types.join('", "')}"`);
	}
}

PrimitiveType.prototype.parseNumber = function(x){

	if (x == null) { ParsingAssert.stEq( this.required, false, 'required'); return null };

	ParsingAssert.stEq( typeof x === 'number' || typeof x === "string", true, `expected ${this.type === 'integer' ? 'an integer' : 'a number'} but got "${typeof x}"` );
	x = this.type === 'integer' ? parseInt(x) : parseFloat(x);

	if(this.min != null){
		ParsingAssert.stEq( x > this.min || (x == this.min && !this.exclusiveMinimum), true, `range error, must be ${this.exclusiveMinimum ? '>' : '>='} ${this.min}` );
	}
	
	if(this.max != null){
		ParsingAssert.stEq( x < this.max || (x == this.max && !this.exclusiveMaximum), true, `range error, must be ${this.exclusiveMaximum ? '<' : '<='} ${this.max}` );
	}
	return x;
}


PrimitiveType.prototype.parseBoolean = function(x){
	if (x == null) { ParsingAssert.stEq( this.required === false); return null };

	x = x === 'true' ? true : x === 'false' ? false : x; 
	ParsingAssert.stEq( typeof x === 'boolean', `expected a boolean but got ${typeof x}` );
	return x;
}

module.exports = PrimitiveType;