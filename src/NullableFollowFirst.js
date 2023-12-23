
//Putting these 3 into the same file since they are all related and it seems overkill  
//put them into separate files.

export class CFG{

    #productions = {}
    #terminals = []
    #non_terminals = []
    static prod_separator = ":="; //symbol that separates the LHS from RHS of production
    static RHS_separator = " "; //symbol that separates all symbols on RHS of production

    //passing the string that represents the CFG 
    //turns it into a CFG in the form
    /* dict{
        Non-terminal: [RHS1, RHS2, ...]
        }
    */
   // Also stores list of terminals and non-terminals

    constructor(str){
        let prods = str.replace(/\r/g,"").split("\n"); //need to replace the \r since end of lines is \r\n on current VSCode.
        
        for(let prod of prods){
            
            let arr = prod.split(CFG.prod_separator);

            if(! this.#non_terminals.includes(arr[0])){ //check if we have added this non_terminal yet
                this.#productions[arr[0]] = [];         //if not, add an empty entry for it in the dict
                this.#non_terminals.push(arr[0]);       //and add it to list of terminals
            }
            this.#productions[arr[0]].push(arr[1]);
        }

        //Now we can calculate the non_terminals (technically a more efficient way of doing this but we don't need 
        //huge performance here)
        //the jist is for each production, we get each RHS. Split string to get individual symbols
        //add to terminals IFF not '' and not in non_terminals (and not already in terminals)

        for(let non_terminal in this.#productions){ //the joy of iterating through dictionaries
            for(let rhs of this.#productions[non_terminal]){
                let symbols = rhs.split(CFG.RHS_separator);

                for(let symbol of symbols){
                    if(symbol !== ""  && !this.#non_terminals.includes(symbol) && !this.#terminals.includes(symbol)){

                        let temp = this.#non_terminals;
                        console.log(symbol);
                        console.log(typeof(symbol));
                        console.log(this.#non_terminals.includes(symbol));
                        console.log(temp.includes(symbol));
                        this.#terminals.push(symbol);
                    }
                }
            }
        }

    }

    getProductions(){
        return this.#productions;
    }

    getTerminals(){
        return this.#terminals;
    }
    
    getNonTerminals(){
        return this.#non_terminals;
    }

    print(){
        console.log("Producions: ", this.#productions);
        console.log("Non-Terminals: ", this.#non_terminals);
        console.log("Terminals: ", this.#terminals);
    }

}

export class Nullable{

    constructor(CFG){

    }

}


