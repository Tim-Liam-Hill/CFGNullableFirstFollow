const Lang = require("./NullableFollowFirst.js"); //Can't think of a better name
const FSA = require("./FSA.js");

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

    constructor(cfg_){
        this.#cfg = cfg_;
        this.#nullable = new Lang.Nullable(cfg_);
        this.#first = new Lang.First(cfg_, this.#nullable);
        this.#follow = new Lang.Follow(cfg_, this.#nullable, this.#first);

        this.#createInitialNFA();
        
        this.#nfa = new FSA.FSA(this.#nfa);
        this.#dfa = this.#nfa.convert();
        this.#nfa.show();
        this.#dfa.show();
        
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
                this.#state_count += 1; //need to increment again! Otherwise we will add transitions to the previous accept state
            }
        }

        this.#nfa["start"] = prod_number_dict[this.#cfg.getStartSymbol()][0];
        this.#addNFAEpsilonTransitions(prod_number_dict);
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

    #createSLRTable(){
        
    }
}

module.exports = {
    SLRTable: SLRTable
}
