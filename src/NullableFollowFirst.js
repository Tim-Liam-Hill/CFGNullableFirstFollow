
//Putting these 3 into the same file since they are all related and it seems overkill  
//put them into separate files.

class CFG{

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

        if(str.length == 0){
            return;
        }

        let prods = str.replace(/\r/g,"").split("\n"); //need to replace the \r since end of lines is \r\n on current VSCode.
        
        for(let prod of prods){

            if(prod.length == 0) //Handles the case where multiple newlines separate productions
                continue;
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

class Nullable{

    #nullable = {}

    //algorithm:
    //I want to do this recursively (since that's just natural to do)
    //So we have an outer loop that will iterate through every non_terminal 
    // (since otherwise we can't guarantee every non_terminal is included in calculations)
    // for each of these non_terminals check:
    // 1) if contains '' in any RHS (if so then done)
    // 2) if no '' in RHS then check each RHS rule individually 
    // -- From symbols left to right, check if terminal and if not, if non_terminal is nullable 
    // -- if all RHS terminals are nullable non_terminals then we are also nullable 
    constructor(cfg){
        let non_terminals = cfg.getNonTerminals();

        for(let non_terminal of non_terminals){
            this.#recursiveNullable(non_terminal, cfg);
        }
    }

    //TODO:
    //What about the case when we have loops within our CFG?
    //Could this loop infinitely? Let's see:
    /**
        Let's take the below grammar:
        A:=BB
        B:=A
        B:=C 
        B:=cd
        C:=e
        C:=

        In the above, A B and C are nullable. How will our algorithm handle this?
        1) Start processing A, set nullable(A) = false. It doesn't have explicit empty string rule, so we 
        need to check each non_terminal
        2) See B, start processing B
        3) B hasn't been seen before, so set nullable(B) = false 
        4) B has no explicit empty string so cheack each RHS 
        5) See A but we have set nullable(A) = false so carry on 
        6)

        I think it's fine in general. This is a type of depth first search, and the first thing
        we check is explicit nullable. So for each symbol, even if an earlier non_terminal was 
        temporarily not nullable (which is incorrect), that rule could not have had an explicit nullable
        rule. BUT!!!!! Consider:

        A:=BB
        A:=C
        B:=A
        C:=e
        C:=

        What happens here?
        1) Start A, set nullable(A) = false. No explicit empty string so check each rhs 
        2) See B, set nullable(B) = false. See A but nullable(A) = false so we think nullable  
        B is false 
        3)Back to A, process C and eventually realise C is nullable and hence, A is nullable 

        So here, unless we reprocess B it will mistakenly be considered not nullable. For this 
        reason, we check every non_terminal if nullable(non_terminal) != true (remember the 
            outer loop calling the recursive function will eventuall lead to B being re-processed,
            so it will be corrected).
     */
    #recursiveNullable(non_terminal, cfg){
        //check if we have already processed, since this could have already been processed 

        if(this.#nullable[non_terminal] === undefined || !this.#nullable[non_terminal]){
            this.#nullable[non_terminal] = false; //Initially, all non_terminals start as not nullable 
                                                 //and we only update non_terminal once we know for certain it is nullable

            //Do we have a '' on RHS? 
            if(cfg.getProductions()[non_terminal].includes('')){
                this.#nullable[non_terminal] = true;
                return;
            }

            //No explicit empty string, check all RHS
            let arr_RHS = cfg.getProductions()[non_terminal];

            for(let rhs of arr_RHS){

                if(this.#isRHSNullable(rhs, cfg)){
                    this.#nullable[non_terminal] = true;
                    return;
                }
            }

        }
    }

    //Pulled out into a separate function since recursive function was getting messy.
    #isRHSNullable(rhs, cfg){

        let symbols = rhs.split(CFG.RHS_separator); //I knew making the separators class variables would come in handy

        for(let symbol of symbols){
            if(cfg.getTerminals().includes(symbol)){
                return false; //if this rhs contains a terminal then it cannot be nullable
            }

            //Dealing with a non_terminal. First, has it been procssed yet? if not, 
            //process it 
            if(this.#nullable[symbol] === undefined){
                this.#recursiveNullable(symbol, cfg);
            }

            if(!this.#nullable[symbol]){ //this non_terminal is not_nullable so we can break out
                return false;
            }
        }

        return true;
    }

    isNullable(non_terminal){
        return this.#nullable[non_terminal];
    }

    getNullable(){
        return this.#nullable;
    }

    print(){
        console.log("Nullable: ", this.#nullable);
    }
}

class First{
    #first = {}

    //Algorithm:
    //For each non-terminal:
    //  For each production in that non-terminal:
    //      set symbol = first_symbol
    //      if terminal:
    //          add this symbol to first;
    //              break
    //      else if non-terminal:
    //          add_first = First(non_terminal)
    //          add non_first to our first
    //          if nullable(non_terminal)
    //              don't break.
    //          else break
    //Repeat until no more changes
    // - we didn't have to do this for Nullable since we could directly check for the existence
    // of the empty string first and correctly know from the start if symbol is nullable.
    constructor(cfg, nullable){ //Can't overload constructor so this is the next best thing.
        if(nullable === undefined){
            nullable = new Nullable(cfg);
        }

        const non_terminals = cfg.getNonTerminals();
        let prev_first = {}

        for(let non_terminal of non_terminals){
            prev_first[non_terminal] = [];
            this.#recursiveFirst(non_terminal,cfg,nullable);
        }

        while(! this.#prevEqualsFirst(prev_first)){
            prev_first = JSON.parse(JSON.stringify(this.#first));
            for(let non_terminal of non_terminals){
                this.#recursiveFirst(non_terminal,cfg,nullable);
            }
        }

        //sorting the firsts for each non_terminal to make testing possible 
        for(let non_terminal of non_terminals){
            this.#first[non_terminal] = this.#first[non_terminal].sort()
        }
    }

    #prevEqualsFirst(prev_first){

        for(let non_terminal in this.#first){
            let prev = prev_first[non_terminal].sort();
            let curr = this.#first[non_terminal].sort();

            if(prev.length  != curr.length){
                return false;
            }

            for(let i in prev){
                if(prev[i] != curr[i]){
                    return false;
                }
            }

        }

        return true;
    }

    //if first[non_terminal] is undefined we know that we haven't checked it yet.
    //BUT: how do we ensure that we don't leave out things if we have cyclic rules?
    //
    #recursiveFirst(non_terminal, cfg, nullable){
        let prods = cfg.getProductions()[non_terminal];

        if(this.#first[non_terminal] === undefined) //this is how we keep track of what non_terminals we have seen before
            this.#first[non_terminal] = []; //and avoid infinite loops, similarly to how it was done for nullable

        for(let prod of prods){

            let symbols = prod.split(CFG.RHS_separator);
            for(let symbol of symbols){

                if(symbol == ""){ //nothing to do for epsilon transitions. 
                    break;
                }

                if(cfg.getTerminals().includes(symbol)){

                    if(!this.#first[non_terminal].includes(symbol)){
                        this.#first[non_terminal].push(symbol);
                    }

                    break;
                }
                else{
                    //need to check if non_terminal has been processed yet.
                    if(this.#first[symbol] === undefined){
                        this.#recursiveFirst(symbol,cfg,nullable);
                    }

                    for(let add_firsts of this.#first[symbol]){
                        if(! this.#first[non_terminal].includes(add_firsts)){
                            this.#first[non_terminal].push(add_firsts);
                        }
                    }

                    if(!nullable.getNullable()[symbol]){
                        break;
                    }
                }
            }
        }
    }

    getFirst(){
        return this.#first;
    }

    print(){
        console.log(this.#first);
    }
}


module.exports = {
    CFG: CFG, 
    Nullable: Nullable,
    First: First
}

