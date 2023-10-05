const { isJSON } = require("../../common");


class AssertError extends Error {
	constructor({name, code, message}){
		super(message);
		this.name = name;
		this.code = code;
	}
	prependMessage(message){
		this.message = message + this.message;
		return this;
	}
	toString(){
		return `${this.name}${this.code ? ` [${this.code}] :` : ''}\n${this.stack}`; 
	}
}

function assert(truthy = null, message = null, opts = {}) {
	if (arguments.length == 2){ 
		if ( isJSON(message) ){ opts = message; message = null }
	}
	else if(arguments.length == 1){
		if ( isJSON(truthy) ){ opts = truthy; truthy = null }	
	}

	Object.assign(this, opts);
	


	if (truthy === false) throw new AssertError({name: this.name, code: code || this.code, message});

	this.eq = function(a, b, message, code){
		if ( a != b ) throw new AssertError({name: this.name, code: code || this.code, message});
	}
	this.stEq = function(a, b, message, code){
		if ( a !== b ) throw new AssertError({name: this.name, code: code || this.code, message});
	}
	this.ne = function(a, b, message, code){
		if ( a == b ) throw new AssertError({name: this.name, code: code || this.code, message});
	}
	this.stNe = function(a, b, message, code){
		if ( a === b ) throw new AssertError({name: this.name, code: code || this.code, message});
	}
	this.iterEq = function(a, b, message, code){
		if (a instanceof Array || b instanceof Array){
			let arr = a instanceof Array ? a : b, check = a instanceof Array ? b : a;
			if (check instanceof Array && arr.length != check.length){
				throw new AssertError({name: this.name, code: code || this.code, message}) 
			}

			arr.forEach( (e,i)=> {
				if(check instanceof Array) {
					if(e != check[i]){
						throw new AssertError({name: this.name, code: code || this.code, message}) 
					} 
				} else {
					if (e != check ){
						throw new AssertError({name: this.name, code: code || this.code, message}) 
					}
				}
			});
		} else { 
			this.eq(a, b, message) 
		}
	}
	this.iterStEq = function(a, b, message, code){
		if (a instanceof Array || b instanceof Array){
			let arr = a instanceof Array ? a : b, check = a instanceof Array ? b : a;
			if (check instanceof Array && arr.length != check.length){
				throw new AssertError({name: this.name, code: code || this.code, message}) 
			}

			arr.forEach( (e,i)=> {
				if(check instanceof Array) {
					if(e !== check[i]){
						throw new AssertError({name: this.name, code: code || this.code, message}) 
					} 
				} else {
					if (e !== check ){
						throw new AssertError({name: this.name, code: code || this.code, message}) 
					}
				}
			});
		} else { 
			this.stEq(a, b, message) 
		}
	}
	this.iterNe = function(a,b, message, code){
		try {
			this.iterEq(a,b,message);
			throw new AssertError({name: this.name, code: code || this.code, message}) 
		} catch (error) {}
	}
	this.iterStNe = function(a,b, message, code){
		try {
			this.iterStEq(a,b,message);
			throw new AssertError({name: this.name, code: code || this.code, message}) 
		} catch (error) {}
	}
	this.throws = function(f, message, code){
		try {
			f();
			throw new AssertError({name: this.name, code: code || this.code, message}) 
		} catch (error) {}
	}
	this.notThrows = function(f, message, code){
		try {
			f();
		} catch (error) {
			throw new AssertError({name: this.name, code: code || this.code, message});
		}
	}
	return this;
}
assert.ValidationAssert = assert({name: 'OAModelValidationError'});
assert.ParsingAssert = assert({name: 'OAModelParsingError'});
// let assert = function(truthy, message, opts){
// 	opts = opts || {};
// 	Object.assign(this, opts);
// 	if (!truthy) throw new AssertError({name: this.name, code: this.code, message});
// }

// assert.OModelValidation = function(truthy, message){
// 	return 
// }

module.exports = { assert, AssertError };