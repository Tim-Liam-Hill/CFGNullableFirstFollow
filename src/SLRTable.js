const Lang = require("./NullableFollowFirst.js"); //Can't think of a better name
const FSA = require("./FSA.js");


const ACTIONS = Object.freeze({ 
    GO: "go", 
    SHIFT: "shift",
    REDUCE: "reduce",
    ACCEPT: "accept"
}); 

/*
    This class takes in a CFG (not a string, an object), calculates First, Nullable, Follow and
    creates an SLR table to be used for a parse/compiler 
*/
class SLRTable{

    #cfg = null;
    #nullable = null;
    #first = null; 
    #follow = null;
    #nfa = null; 
    #dfa = null; 
    #state_count = 0;
    #slr_table = null;
    #accept_cfg_mapping;
    static EOS_symbol = "$$$"; //TODO: is there a programmatic way to generate this?
                                //how do we ensure we don't run into issues when a grammar
                                //can potentially generate a token equivalent to this EOS_symbol
    
    /*
        Changing things up a bit.
        This class will take in the string that represents a cfg because it makes things a whole lot 
        more convenient to do it this way. It makes it easier to create a new cfg that has a new start state
        added while keeping things still working with the other code I have written so far (that needs to be
        cleaned up I will admit).
    */
    constructor(cfg_string){
        let initial_cfg = new Lang.CFG(cfg_string);
        
        //Need to add a new start state. For now, let's just keep it simple:
        //Keep concattenating existing start state symbol to itself until we have something unique 
        let new_start_symbol = initial_cfg.start_symbol;
        
        //TODO: WRITE TESTS TO TRY AND BREAK THE BELOW.
        do{
            new_start_symbol = new_start_symbol + initial_cfg.start_symbol;
        }while(initial_cfg.non_terminals.includes(new_start_symbol) || initial_cfg.terminals.includes(new_start_symbol));

        console.log("New Start symbol for cfg generated to be: ", new_start_symbol);

        //create a new cfg with a new production at the beginning. Easier to do this with string
        //Surprisingly (maintains order better)
        let cfg_string_2 = new_start_symbol+":="+initial_cfg.start_symbol+"\n"+cfg_string;
        this.#cfg = new Lang.CFG(cfg_string_2);
        this.#cfg.print();

        this.#nullable = new Lang.Nullable(this.#cfg);
        this.#first = new Lang.First(this.#cfg, this.#nullable);
        this.#follow = new Lang.Follow(this.#cfg, this.#nullable, this.#first);

        this.#createInitialNFA();
        
        this.#nfa = new FSA.FSA(this.#nfa);
        this.#dfa = this.#nfa.convert();

        //Now we do something interesting:
        //Create a new CFG (I know) so we can add the production
        // S^^:=S^ $
        //Where S^^ is new start state, S^ is old start state and $ is EOS_symbol
        //We only do this since we need a follow set for that grammar to create the SLR
        //table
        let cfg_string_3 = new_start_symbol + initial_cfg.start_symbol +":=" +new_start_symbol+" "+SLRTable.EOS_symbol+"\n"+cfg_string_2;
        let final_cfg = new Lang.CFG(cfg_string_3);
        let nullable2 = new Lang.Nullable(final_cfg);
        let first2 = new Lang.First(final_cfg, nullable2);
        let final_follow = new Lang.Follow(final_cfg, nullable2, first2);
        final_follow.print();
        console.log("_)(_()_(_");
        this.#follow = final_follow;
        this.#createSLRTable();
        
    }
    
    /*
        For each production, create a portion of the larger NFA for the CGF.
        Basically:
        for each production:
            create N + 1 states where N is number of symbols on RHS 
            transition for each state is next symbol on RHS 
            final state in each mini-nfa is an accept state 
        Essentially need to store this data in the form that class FSA requires, 
        
        TODO: how do we know the start symbol?? Do we need additional info for this?
        Probably. That info doesn't really belong in the CFG does it?? We could 
        technically calculate it/store it there. 

        TODO: Writeup full algorithm nicely and make code cleaner. 
    */
    #createInitialNFA(){
        
        
        let prod_number_dict = {}; //This dictionary will be used to cross reference 
        //which state_counts have been assigned to each non-terminal production which is used 
        //to add the epsilon transitions after initial NFA has been created. There should be a key 
        //for each non-terminal
        //TODO: explain the above better
        //TODO: need to keep track of which NFA states are accept states for mini-nfa's that map to 
        //productions 
        const prods = this.#cfg.getProductions();
        this.#nfa = {};
        this.#nfa["states"] = {};
        this.#nfa["accept"] = [];
        let accept_cfg_mapping = {};

        for(let non_terminal in prods){
            
            for(let prod of this.#cfg.getProductions()[non_terminal] ){

                //add prod_number to the dict (don't increment here, we increment later)
                if(prod_number_dict[non_terminal] === undefined){
                    prod_number_dict[non_terminal] = [this.#state_count.toString()];
                }
                else{
                    prod_number_dict[non_terminal].push(this.#state_count.toString());
                }

                let symbols = prod.split(Lang.CFG.RHS_separator);
                for(let symbol of symbols){
                    
                    this.#nfa["states"][this.#state_count.toString()] = {};
                    this.#nfa["states"][this.#state_count.toString()][symbol] = [(this.#state_count + 1).toString() ];
                     
                    this.#state_count += 1;
                }
                this.#nfa["states"][this.#state_count.toString()] = {}; //need to add the accept state at the end of each mini nfa 
                this.#nfa["accept"].push(this.#state_count.toString());
                accept_cfg_mapping[this.#state_count.toString()] = {non_terminal, prod};
                this.#state_count += 1; //need to increment again! Otherwise we will add transitions to the previous accept state
            }
        }

        this.#nfa["start"] = prod_number_dict[this.#cfg.getStartSymbol()][0];
        this.#addNFAEpsilonTransitions(prod_number_dict);
        this.#accept_cfg_mapping = accept_cfg_mapping;
    }

    /*
        Anytime there is a transition on a Non-terminal for any state, there must be epsilon transitions to every other state
        which is the start state for some production for which that non-terminal is on the LHS. 
    */
    #addNFAEpsilonTransitions(prod_number_dict){
        
        //So at this point we are correct with prod_number_dict and the mini nfa's created 
        //so the error is coming in below

        for(let nfa_state in this.#nfa.states){ //for every state

            for(let transition_symbol in this.#nfa.states[nfa_state]){ //we loop through every symbol for which this state has valid transition

                if( this.#cfg.getNonTerminals().includes(transition_symbol) ){ //if that symbol is a nonTerminal then we need 
                                                                               //to add epsilon transition to the other states that define 
                                                                               //the mini chains for productions for which that non-terminal is on the RHS

                    if(this.#nfa.states[nfa_state][""] === undefined){//first check if there are already epsilon transitions so we don't override them by creating empty arr 
                        this.#nfa.states[nfa_state][""] = [];
                    }
   
                    for(let state_num of prod_number_dict[transition_symbol] ){
                        this.#nfa.states[nfa_state][""].push(state_num);
                    }
                }
            }
        }
    }

    /**
     * To build the SLR Table:
     * 1) Need a big 2D table: x axis DFA states y axis symbols in the alphabet
     * 2) for each state:
     *      2.1) For each terminal that that DFA state transitions on, add a shift action at [state][nonterminal] = shift (next_state)
     *      2.2) For each non-terminal that that DFA state transitions on, add a go action at [state][nonterminal] = shift (next_state)
    *  3) Add reduce rules somehow
    * Make sure we don't over-ride any previous rules (if we do it means ambiguous grammar/not SLR parsable)
    */
    #createSLRTable(){
        this.#dfa.show();
        this.#slr_table = {};

        for(let state in this.#dfa.getStates()){
            this.#slr_table[state] = JSON.parse(JSON.stringify(this.#dfa.getAlphabet()));
            this.#slr_table[state][SLRTable.EOS_symbol] = []; //The EOS symbol is not part of the alphabet
                                                                //for the above DFA
            
            for(let symb in this.#dfa.getStates()[state]){
                if(this.#dfa.getStates()[state][symb][0] != ''){//For our DFA, the empty string represents a transition to the error state, so valid transitions are ones that don't go to this state
                    console.log("State: ", state, " has transitions for symbol ", symb, " , adding to SLR table");
                    
                    if(this.#slr_table[state][symb].length != 0){
                        console.error("Conflict in SR table for ", state, " symbol ", symb);
                        throw "Grammar Error";
                    }

                    if(this.#cfg.getNonTerminals().includes(symb)){
                        console.log("Transition on non-terminal ", symb, " adding go");
                        this.#slr_table[state][symb] = [ACTIONS.GO, this.#dfa.getStates()[state][symb][0]];
                    }
                    else{
                        console.log("Transition on terminal ", symb, " adding shift");
                        this.#slr_table[state][symb] = [ACTIONS.SHIFT, this.#dfa.getStates()[state][symb][0]];
                    }
                }
            }
        }

                    //need to create a temporary new CFG that reflects an additional rule S -> S $ 
            //Then use this to calculate a new follow which we use for the addition of reduce 
            //rules. 


        for(let state in this.#dfa.getStates()){
            //We need to know:
            //1) Which sub-states (if any) in the dfa state are accept states in the nfa (easy)
            //2) Which production rules in the CFG these accept states map to (slightly harder)

            console.log("Checking for reduce rules for DFA state ", state);
            const sub_states = state.split("-");
            let accepts = [];
            for(let s of sub_states){
                if(this.#nfa.getAccept().includes(s))
                    accepts.push(s);
            }

            console.log("DFA state ", state, " contains following accept states ", accepts);

            for(let accept_state of accepts){
                console.log("Accept state ", accept_state, " corresponds to production ", this.#accept_cfg_mapping[accept_state]);
                let follow_symbols_N = this.#follow.getFollow()[this.#accept_cfg_mapping[accept_state].non_terminal];
                for(let accept_symbol of follow_symbols_N){

                    if(this.#slr_table[state][accept_symbol].length != 0){
                        console.error("Conflict in SLR table for ", state, " symbol ", accept_symbol);
                        throw "Grammar Error";
                    }

                    this.#slr_table[state][accept_symbol] = [ACTIONS.REDUCE, this.#accept_cfg_mapping[accept_state]];
                }
            }

        }
        
        console.log(JSON.stringify(this.#slr_table));
    }

    /*
        Use the SLR table to parse the given input and create the corresponding AST
    */
    buildAST(input){

    }

}

module.exports = {
    SLRTable: SLRTable,
    Actions: ACTIONS
}
