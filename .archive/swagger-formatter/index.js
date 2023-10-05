
const { isJSON, isMultipartyFile } = require('../common');
const PrimitiveType = require('./helps/primitive');
const { assert: { ValidationAssert, ParsingAssert }, AssertError } = require('./helps/assert');

const resolveDocPath = (path, rootSpec)=>{	
	let segments = path.replace(/^#\//, '').split('/').filter(e=>e);
	let o = rootSpec;
	try {
		segments.forEach(p=>{ o = o[p]; });		
	} catch (error) {
		throw new AssertError({name: 'SchemaPathError', message: `schema "${path}" not found`})
	}
	return o;
}

const GenericTypeConstrutor = (opts, rootSpec)=>{
	// o = o || {};
	// console.log('  +', {opts});
	
	if ( opts instanceof PrimitiveType || opts instanceof MixedType || opts instanceof ArrayType || opts instanceof ObjectType) return opts;
	if (typeof opts === 'string') return new PrimitiveType(opts);
	if (isJSON(opts)) {
		if(opts.type === 'array') return new ArrayType(opts, rootSpec);
		else if(opts.type === 'object') return new ObjectType(opts, rootSpec);
		else if (opts.type) return new PrimitiveType(opts);
		else if(opts.oneOf || opts.anyOf || opts.allOf) return new MixedType(opts, rootSpec);
		else if (opts.schema) return GenericTypeConstrutor(opts.schema, rootSpec);
		else if (opts.$ref) {
			if (Schema.list.find(s=>s.id == opts.$ref)){
				return Schema.list.find(s=>s.id == opts.$ref);
			} 
			return new Schema({id: opts.$ref, opts: resolveDocPath(opts.$ref, rootSpec) }, rootSpec);
		};
	}
	throw new Error(`Connot find type of "${ isJSON(opts) ? JSON.stringify(opts, null, 2) : opts}"`);
}

let MixedType = function(opts, rootSpec){
	ValidationAssert.eq( isJSON(opts), true );

	// console.log({opts});
	ValidationAssert.eq( ['oneOf', 'anyOf', 'allOf'].map(e=> e in opts).includes(true), true );

	for (var [a,b] of [['oneOf', 'anyOf'],['oneOf', 'allOf'],['anyOf', 'allOf']]) {
		// console.log(`opts["${a}"]:`, opts[a], ` | opts["${b}"]:`, opts[b]); //process.exit(0)
		ValidationAssert.eq( opts[a] != null && opts[b] != null, false, `Mixed type can\'t have both fields "${a}" and "${b}"` );
	}
	for (var a of ['oneOf', 'anyOf', 'allOf']) {
		if (!opts[a]) continue; 
		this.mix = a;
		ValidationAssert.eq( opts[a] instanceof Array, true, `Mxed type field "${a}" must be a non empty array`);
		ValidationAssert.eq( opts[a].length > 0, true, `Mxed type field "${a}" must be a non empty array`);
		Object.assign(this, {required: false}, opts);
		this[a] = opts[a].map( (t, i) => {
			try {
				return GenericTypeConstrutor(t, rootSpec)
			} catch(err) {
				err.message = `${a}[${i}]: ` + err.message;
				throw err;
			}
		})
	}
	// this.validate();
}

MixedType.prototype.validate = function(){
	for (var t of this[this.mix]) t.validate();
}

MixedType.prototype.parse = function(x){

	if (x == null) { ParsingAssert.stEq( this.required, false); return {} };

	var res = this[this.mix].map(t => {
		try {
			return (t instanceof Schema ? t.model : t).parse(x);
		} catch (error) {
			return error;			
		}
	});
	let nInvalid = res.filter(r => r instanceof Error).length, nValid = res.length - nInvalid;

	// console.log(res); process.exit(0);

	ParsingAssert.stNe(nInvalid, res.length, `not valid against any ${this.mix} schemas`);			

	switch(this.mix){
		case 'oneOf':		
			ParsingAssert.eq(nValid, 1, `should validate only against one of the ${this.mix} schemas`);
			return res.find(r=>!(r instanceof Error));
			break;
		case 'anyOf':
			// return res.find(r=>!(r instanceof Error));
			break;
		case 'allOf':
			ParsingAssert.eq(nInvalid, 0, `should validate against all of the ${this.mix} schemas`);
			// return Object.assign(...res);
			break;
	}

	res = res.filter(r=> !(r instanceof Error));
	return Object.assign(...res);
}

let ArrayType = function(opts, rootSpec){
	ValidationAssert.eq( isJSON(opts), true );

	ValidationAssert.eq( !!opts.items, true, 'Field "items" is required' );
	ValidationAssert.eq( isJSON(opts.items), true, 'Field "items" must be an object' );

	Object.assign(this, {required: false}, opts);
	try{
		this.items = GenericTypeConstrutor(opts.items, rootSpec);
	} catch (err) {
		// return console.log('# 110', err);
		throw err.prependMessage(`items: `);
	}

	// this.validate();
}

ArrayType.prototype.validate = function(){
	this.items.validate();
}

ArrayType.prototype.parse = function(x){
	if (x == null) { ParsingAssert.eq( this.required, false); return [] };
	if (typeof x === "string"){
		try { x = JSON.parse(x); } catch (error) {
			try { x = JSON.parse(`[${x}]`); } catch (error) { 
				throw new Error('not a valid array');
			}
		}
	} 
	ParsingAssert.eq( x instanceof Array, true, `expected an array but got ${typeof x}`);

	var f = (item, i) => {
		try {
			return (this.items instanceof Schema ? this.items.model : this.items).parse(item);			
		} catch (err) {
			// console.log('# 137', err);
			throw err.prependMessage(`at index ${i}: `);
		}
	}
	return x.map(f);
}

let ObjectType = function(opts, rootSpec){
	ValidationAssert.eq( isJSON(opts), true );

	Object.assign(this, {required: [], properties: {} }, opts);
	ValidationAssert.eq( isJSON(this.properties), true );

	for (var k in this.properties){
		try {
			this.properties[k] = GenericTypeConstrutor(this.properties[k], rootSpec);
		} catch (error) {
			// console.log('# 156', error);
			throw error.prependMessage(`object property "${k}": `);
		}
	}
	// this.validate();
}

ObjectType.prototype.validate = function(){
	for (var k in this.properties){
		this.properties[k].validate();
	}
}

ObjectType.prototype.parse = function(x){

	if (x == null) { ParsingAssert.eq( this.required, false); return {} };

	if (typeof x === "string"){
		try { x = JSON.parse(x); } catch (error) {
			throw new Error('not a valid JSON');
		}
	} 

	ParsingAssert.eq( isJSON(x), true );

	var res = {};

	for (var k in this.properties){
		res[k] = (this.properties[k] instanceof Schema ? this.properties[k].model : this.properties[k]).parse(x[k]);
		ParsingAssert.eq( this.required.indexOf(k)>=0 && res[k] == null, false , `property "${k}" is required`);
	}
	return res;
}

let Schema = function({id, opts}, rootSpec){
	this.id = id;
	Schema.list.push(this);

	this.model = GenericTypeConstrutor(opts, rootSpec)
}

Schema.list = [];


let Model = function(opts, rootSpec = {}, schemas){
	// console.log({opts}, '\n\n\n', {rootSpec}); process.exit(0);
	if (!schemas){
		if (rootSpec && rootSpec.components && rootSpec.components.schemas){
			for (var k in rootSpec.components.schemas){
				let ref = `#/components/schemas/${k}`;
				new Schema({id: ref, opts: resolveDocPath(ref, rootSpec) }, rootSpec);
			}
		}
	}

	// console.log(Schema.list[0].model.properties.friends.items.oneOf[1].model.properties.friends.items.oneOf[1]);
	// process.exit(0);

	let model = GenericTypeConstrutor(opts, rootSpec);
	
	ValidationAssert.eq ( model instanceof PrimitiveType, false, 'Model cannot be a primitive type' );
	return model;
}

module.exports =  Model;