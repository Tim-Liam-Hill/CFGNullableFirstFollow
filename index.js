import {CFG} from "./src/NullableFollowFirst.js"
import fs from 'fs'

if(process.argv.length != 3){
    console.log("Incorrect number of input arguments. Usage: node index.js <file_path>");
    process.exit(1)
}

const file_path = process.argv[2] ;
const input = fs.readFileSync(file_path).toString();

console.log(input);

let prods = input.replace(/\r/g,"").split("\n"); //need to replace the \r since end of lines is \r\n on current VSCode.
console.log(prods);

const cfg = new CFG(input);



