import {CFG, Nullable} from "./src/NullableFollowFirst.js"
import fs from 'fs'

if(process.argv.length != 3){
    console.log("Incorrect number of input arguments. Usage: node index.js <file_path>");
    process.exit(1)
}

const file_path = process.argv[2] ;
const input = fs.readFileSync(file_path).toString();

const cfg = new CFG(input);
cfg.print();
const nullable = new Nullable(cfg);
nullable.print();

