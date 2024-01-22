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

