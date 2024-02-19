const imports = require("./src/NullableFollowFirst.js");
const SLR = require("./src/SLRTable.js");
const fs = require('fs');
const logger = require('./src/logger.js');

if(process.argv.length < 3){
    console.log("Incorrect number of input arguments. Usage: node index.js <file_path>");
    process.exit(1);
}

const file_path = process.argv[2] ;
const input = fs.readFileSync(file_path).toString();

/*
const c = new imports.CFG(input);
const n = new imports.Nullable(c);
const first = new imports.First(c,n);
const follow = new imports.Follow(c,n,first);
c.print();
n.print();
first.print();
follow.print();
*/

const slr = new SLR.SLRTable(input);
const tokens = ["a","a","b","b","b","c","c"];
slr.validate(tokens);
let tree = slr.buildAST(tokens);
tree.print();

//Best thing to do here is to take some small example grammars and by hand construct the resulting 
//SLR table (using the tools that already exist to calculate nullable, first, follow)
//Then let's ensure that the resultant table can parse the language as expected
//Use these as base test cases for the SLR parser.
//Languages that I can think of:
/*

1) The language of well-balanced paranthesis
S^:=S $
S:=(S) S
S:=


2) Language Expression
S:=Exp
Exp → Exp+Exp2
Exp → Exp-Exp2
Exp → Exp2
Exp2 → Exp2*Exp3
Exp2 → Exp2/Exp3
Exp2 → Exp3
Exp3 → num
Exp3 → (Exp)

*/

//CHANGES TO MAKE:
//Constructor for SLR table must add a new start rule to the CFG??
//-we know that we can concat all terminals and non_terminals together to get unique name for start state
//or just randomly generate it? 
// Then we need to do the same for the end symbol
//Add a rule to CFG from new start to old start and update start state
//Then in the SLR table construction make a deep copy then alter that CFG and calculate follow etc


