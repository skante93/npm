
// const assert = function(opts){
// 	return {
// 		equal: function(a, b, opts){

// 		},
		
// 	}
// }
// process.exit(0);

const OAPIModelParse = require('.');

const personStruct = {
	type: "object",
	required: ['id', "name"],
	properties: {
		id: { type: "integer" },
		birthAt: { type: "string", format: "date" },
		name: "string",
	}
}

var parser = OAPIModelParse(personStruct);
console.log(parser.parse({id: "45", name: "John DOE" }));

personStruct.properties.friends = {
	type: "array",
	items:{
		oneOf: [
			{ type: "integer" },
			{ $ref: '#/components/schemas/Person' }
		]
	}
}

const rootSpec = {
	components: {
		schemas: {
			Person: personStruct,
		}
	}
}

var models = [
	{
		anyOf: [
			{ $ref : '#/components/schemas/Person' },
			{
				type: "object",
				required: ['address'],
				properties: {
					address: {type: "string", minLength: 5, maxLength: 7, uppercase: true }
				}
			}
		]
	}
]

// var parser = OAPIModelParse(models[0], rootSpec);
// console.log(parser.parse({id: "45", name: "John DOE", friends: [{id: 53, name: "Jane DOE"}, 88] }));
// console.log(parser.parse({id: "45", name: "John DOE", address: "totot", friends: [{id: 53, name: "Jane DOE"}, 88] }));