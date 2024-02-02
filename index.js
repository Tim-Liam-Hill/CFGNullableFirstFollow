const imports = require("./src/NullableFollowFirst.js")
const SLR = require("./src/SLRTable.js")
const fs = require('fs')

if(process.argv.length != 3){
    console.log("Incorrect number of input arguments. Usage: node index.js <file_path>");
    process.exit(1)
}

const file_path = process.argv[2] ;
const input = fs.readFileSync(file_path).toString();

const cfg = new imports.CFG(input);
cfg.print();
const nullable = new imports.Nullable(cfg);
nullable.print();

const first = new imports.First(cfg, nullable);
first.print();

const follow = new imports.Follow(cfg, nullable, first);
follow.print();

console.log();
const slr = new SLR.SLRTable(cfg);

//Best thing to do here is to take some small example grammars and by hand construct the resulting 
//SLR table (using the tools that already exist to calculate nullable, first, follow)
//Then let's ensure that the resultant table can parse the language as expected
//Use these as base test cases for the SLR parser.
//Languages that I can think of:
/*

1) The language of well-balanced paranthesis
S^:=S
S:=(S) S
S:=

The above is definitely ambiguous but does it work?
can it generate:
() -> yes 
()()() -> yes
((()()))(()) -> yes 

Is the above actually ambiguous?? -> I don't think so 


Below shouldn't be ambiguous
S^:=S
S:=(Inner) Outer
S:=
Inner:=S 
Outer:=S




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

