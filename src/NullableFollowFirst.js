
//Putting these 3 into the same file since they are all related and it seems overkill  
//put them into separate files.

class CFG{

    productions = {};
    terminals = [];
    non_terminals = [];
    start_symbol = null;
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
            if(this.start_symbol === null){
                this.start_symbol = arr[0];
            }

            if(! this.non_terminals.includes(arr[0])){ //check if we have added this non_terminal yet
                this.productions[arr[0]] = [];         //if not, add an empty entry for it in the dict
                this.non_terminals.push(arr[0]);       //and add it to list of terminals
            }
            this.productions[arr[0]].push(arr[1]);
        }

        //Now we can calculate the non_terminals (technically a more efficient way of doing this but we don't need 
        //huge performance here)
        //the jist is for each production, we get each RHS. Split string to get individual symbols
        //add to terminals IFF not '' and not in non_terminals (and not already in terminals)

        for(let non_terminal in this.productions){ //the joy of iterating through dictionaries
            for(let rhs of this.productions[non_terminal]){
                let symbols = rhs.split(CFG.RHS_separator);

                for(let symbol of symbols){
                    if(symbol !== ""  && !this.non_terminals.includes(symbol) && !this.terminals.includes(symbol)){

                        this.terminals.push(symbol);
                    }
                }
            }
        }

    }

    getProductions(){
        return this.productions;
    }

    getTerminals(){
        return this.terminals;
    }
    
    getNonTerminals(){
        return this.non_terminals;
    }

    getStartSymbol(){
        return this.start_symbol;
    }

    print(){
        console.log("Producions: ", this.productions);
        console.log("Non-Terminals: ", this.non_terminals);
        console.log("Terminals: ", this.terminals);
        console.log("Start Symbol: ", this.start_symbol);
    }

    deepCopy(){
        let n = new CFG("");
        n.non_terminals = JSON.parse(JSON.stringify(this.non_terminals));
        n.terminals = JSON.parse(JSON.stringify(this.terminals));
        n.productions = JSON.parse(JSON.stringify(this.productions));
        n.start_symbol = JSON.parse(JSON.stringify(this.start_symbol));

        return n;

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
        console.log("First: ", this.#first);
    }
}

class Follow{
    #follow = {};

    /*
        The constructor handles iterating through each production. Algorithm is:

        1. Make a copy of current follow set 
        2. do while prev != current 
        - For each RHS production, iterate through each symbol
        - if symbol is terminal, skip 
        - if symbol is non_terminal
        -- Get following symbol  
        -- if terminal, add it to the follow[non_terminal] 
        -- if non_terminal, add follow[non_terminal] to follow[symbol]
        --- if this non_terminal is nullable, continue to next symbol otherwise break 
        - if we have case where non_terminal is at end OR a non_terminal is followed by one or more 
        consecutive nullable non_terminals, the follow for that non_terminal contains all elements in 
        follow of symbol on LHS of production
    */
    constructor(cfg, nullable, first){
        if(nullable == undefined){
            nullable = new Nullable(cfg);
        }

        if(first == undefined){
            first = new First(cfg);
        }

        //For the sake of calculating follow, we need to add the rule:
        // S:= <starting_non_terminal> $ 
        // TODO: how will we ensure that the symbol we have isn't already a valid symbol?
        // I think the onus should be on the user to ensure the grammar has all necessary symbols
        //and productions (since it becomes non-trivial to write a program that creates the new start 
        //symbol unless we start restricting symbols for the grammar, which is not something I want to 
        //do). Other programs that use this as a dependency can handle the replacement of the start
        //symbol since the context of the follow doesn't necessarily mean we are building a compiler
        //(although why else would you need to know the follow for a CFG?)

        let non_terminals = cfg.getNonTerminals();

        //First initialize follow
        let prev_follow = {};
        for(let non_terminal of non_terminals){
            this.#follow[non_terminal] = [];
        }

        do{
            prev_follow = JSON.parse(JSON.stringify(this.#follow));
            for(let non_terminal of non_terminals){
                this.#recursiveFollow(non_terminal, cfg, nullable, first);
            }
            //console.log("FOLLOW: ", this.#follow);
            //console.log("PREV_FOLLOW: ", prev_follow);
        }
        while(!this.#prevEqualsFollow(prev_follow));

    }


    #recursiveFollow(non_terminal, cfg, nullable, first){

        //console.log();
        //console.log("Recursive Follow for non_terminal: ", non_terminal, " --------------");

        let prods = cfg.getProductions()[non_terminal];

        for(let rhs of prods){
            let rhs_arr = rhs.split(CFG.RHS_separator); 
            //console.log("Checking prod ", rhs_arr, " for non_terminal ", non_terminal);

            for(let index in rhs_arr){
                if(cfg.getNonTerminals().includes(rhs_arr[index])){ //only carry on for non_terminals{
                    this.#iterateRHSFromIndex(non_terminal, index, rhs_arr, cfg, nullable, first);
                }
            }
        }

    }

    //Helper method for the recursiveFollow function
    //Its just cleaner to pull this out into its own function 
    #iterateRHSFromIndex(non_terminal, index, rhs_arr, cfg, nullable, first){
        
        //need to check for case where non_terminal at end of RHS OR all the non_terminals 
        //to the right of a non_terminal are nullable
        //console.log("Symbol at index ", index, " is a non_terminal, iterating through rest array");
        let all_null_till_end = true; 
        //somehow index became a string along the way???? 
        for(let k = parseInt(index) +1; k < rhs_arr.length; k = k +1){

            if(cfg.getTerminals().includes(rhs_arr[k])){
                //console.log("Symbol at index ", k, "terminal, adding to follow of ", rhs_arr[index]);
                if(!this.#follow[rhs_arr[index]].includes(rhs_arr[k])){
                    this.#follow[rhs_arr[index]].push(rhs_arr[k]);
                }
                all_null_till_end = false; 
                break; //encountered a terminal so no need to look further. 
            }
            else{ //everything in the trailing non_terminal's follow get's added to current non_terminal's 
                    //follow. Break if not nullable
                console.log(rhs_arr[k]);
                for(let add_symbol of first.getFirst()[rhs_arr[k]]){
                    if(! this.#follow[rhs_arr[index]].includes(add_symbol)){
                        this.#follow[rhs_arr[index]].push(add_symbol);
                    }
                }

                if(! nullable.getNullable()[rhs_arr[k]]){
                    all_null_till_end = false;
                    break;
                }

            }
        }

        if(all_null_till_end){
            //console.log("Index ", index, " is either at end or followed by everything nullable");
            for(let add_symb of this.#follow[non_terminal]){
                if(! this.#follow[rhs_arr[index]].includes(add_symb)){
                    this.#follow[rhs_arr[index]].push(add_symb);
                }
            }
        }
            
    }

    #prevEqualsFollow(prev_follow){

        for(let non_terminal in this.#follow){
            let prev = prev_follow[non_terminal].sort();
            let curr = this.#follow[non_terminal].sort();

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

    print(){
        console.log("Follow: ", this.#follow);
    }

    getFollow(){
        return this.#follow;
    }

}

module.exports = {
    CFG: CFG, 
    Nullable: Nullable,
    First: First,
    Follow: Follow
}

