
//Putting these 3 into the same file since they are all related and it seems overkill  
//put them into separate files.

export class CFG{

    #productions = {}
    #terminals = []
    #non_terminals = []

    //passing the string that represents the CFG 
    //turns it into a CFG in the form
    /* dict{
        Non-terminal: [[RHS1], [RHS2], ...]
        }
    */
   // Also stores list of terminals and non-terminals

    constructor(str){
        let prods = input.replace(/\r/g,"").split("\n"); //need to replace the \r since end of lines is \r\n on current VSCode.

    }



    print(){

    }

}

export class Nullable{

    constructor(CFG){

    }

}


