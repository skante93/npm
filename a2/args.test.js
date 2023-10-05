
const ArgsParser = require('./args');

// const tests = [
// 	()=>{
// 		const args = [
// 			{name: "surname", flag: "--sname", short: '-s', type: 'string'}
// 		];
// 		const parser = new ArgsParser(args);
// 		try {
// 			const r1 = parser.parse(["--sname", "ZERO"]);			
// 			// console.log(r1);
// 			assert.equal(r1.args.surname, 'ZERO');

// 			const r2 = parser.parse(["--sname=ZERO"]);			
// 			// console.log(r2);
// 			assert.equal(r2.args.surname, 'ZERO');

// 			const r3 = parser.parse(["-s=ZERO"]);			
// 			// console.log(r2);
// 			assert.equal(r3.args.surname, 'ZERO');

// 			const r4 = parser.parse(["-s", "ZERO"]);			
// 			// console.log(r2);
// 			assert.equal(r4.args.surname, 'ZERO');

// 			const r5 = parser.parse(["-s", "ZERO", "--sname=ONE"]);			
// 			// console.log(r2);
// 			assert.equal(r5.args.surname, 'ONE');

// 			assert.throws(() => { parser.parse(["--not-supported=ONE"]) }, {message:/^invalid option/});
// 			assert.throws(() => { parser.parse(["family-tree", "--sname", "DOE"]) }, {message:/^invalid subcommand family-tree/});
// 		} catch (error) {
// 			console.log(error);			
// 		}
// 	},
// 	()=>{
// 		const args = [
// 			{name: "kin", flag: "--kin", short: 'k', type: 'string', array: true}
// 		];
// 		const parser = new ArgsParser(args);
// 		let argv = ["--kin", "Dad", "-k", "Mom", "-k", "Bro"];
// 		try {
// 			const response = parser.parse(argv);			
// 			// console.log(response);
// 			assert.deepStrictEqual(response.args.kin, ["Dad", "Mom", "Bro"]);
			
// 		} catch (error) {
// 			console.log(error);			
// 		}
// 	},
// 	()=>{
// 		const args = [
// 			{
// 				name: "sort",
// 				subCommands: [
// 					{name: "ascending", type: "boolean", flag: "asc", short: "-a"}
// 				]
// 			},
// 			{
// 				name: "append",
// 				subCommands: [
// 					{name: "item", type: "string", short: "-i"},
// 					{name: "id", type: "integer", flag: "id"},
// 				]
// 			},
// 		];
// 		const parser = new ArgsParser(args);
// 		try {
// 			const r1 = parser.parse(["sort", "--asc"]);			
// 			// console.log(r1.subCommand);
// 			assert.equal(!!r1.subCommand.sort, true)
// 			assert.equal(!!r1.subCommand.sort.args.ascending, true)

// 			const r2 = parser.parse(["sort"]);			
// 			assert.equal(!!r2.subCommand.sort, true)
// 			assert.equal(!!r2.subCommand.sort.args.ascending, false)

// 			const r3 = parser.parse(["sort", "--asc=false"]);			
// 			assert.equal(!!r3.subCommand.sort, true)
// 			assert.equal(!!r3.subCommand.sort.args.ascending, false)
// 		} catch (error) {
// 			console.log(error);			
// 		}
// 	},
// 	()=>{},
// 	()=>{},
// 	()=>{},
// 	()=>{}
// ]

// tests.forEach(f => f());

describe('Test suite', ()=>{

	describe('Testing: ')
	let a = 0;
	console.log('[0]:', a);
	a=1
	it('yay!', done=>{
		console.log('[1]:', a);
		a=2;
		done();
	})
	console.log('[2]:', a);

})