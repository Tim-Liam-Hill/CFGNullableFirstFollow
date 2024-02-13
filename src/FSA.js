//general class that describes some NFA
//note that DFA's are technically, NFAs so I understand a single class
//describing both 

class FSA{

    #states = {}
    #start = ""
    #accept = []
    #alphabet = []

    /**
     * 
     * @param {*} dict A json object describing the start and accepts states along with all other states and their transitions. 
     */
    constructor(dict){
        //TODO: implement checks like: at least one state, has start and end states 
        //All States are defined (ie: no transition to non-existent state)
        //For now, doing this quick and dirty
        //TODO: implement class variable for the separator (symbol that will be used 
        //to join state names together.) then make sure no sates have this symbol in their 
        //name
        this.#states = dict.states;
        this.#accept = dict.accept; //TODO: maybe let the accept be a single string as well instead of just an array?
                                    //Since we already have that whole vibe going on. 
        this.#start = dict.start;
        this.#alphabet = this.#calculateAlphabet();

    }

    /**
     * Algorithm:
     * - Get start state epsilon closure
     * - Push this on a stack. 
     * - While stack not empty:
     * -- pop off element
     * -- for each state in this set of states, determine set of states that can be reached 
     *    for each relevent symbol 
     * -- push each of these new states onto stack IFF they have not been processed 
     * - calculate new accepts: if name includes an accept state bamn we good. 
     * 
     * @returns The equivalent DFA 
     */
    convert(){
        let ans = {};
        
        const new_start = this.#epsilonClosure(this.#start);
        let stack = [new_start];

        while(stack.length !== 0){
            let curr_states = stack.pop(); //curr states = array of state names from the NFA that will make up a new state in the DFA
            let new_transitions = JSON.parse(JSON.stringify(this.#alphabet)); //make a deep clone of alphabet
       
            for(let state of curr_states){ //for each of the comprising NFA substates that make up this single DFA state
                                           //we need to determine the transitions. Each substate adds a portion eg:
                                           //if state 0 is a substate of the new state 0-1-2 and 0 has a transition 
                                           //0 -> 5 on symbol ! then 0-1-2 we add the epsilon transition states 
                                           //to a new transition for state 0-1-2 (and keep adding to this for every substate)
                                           //we iterate through. TODO: explain this better. 
                                           
                for(let symbol in this.#states[state]){ //Iterates through each symbol that this state (one of the substates of the new state) has transitions on.

                    let states_to_add = this.#getReachableStates(this.#states[state][symbol], state, symbol);
                    //console.log("For state: ", state, " and symbol: ", symbol, " new transitions are ", states_to_add)
                    
                    for(let dest_state of states_to_add){
                        if(! new_transitions[symbol].includes(dest_state)){
                            new_transitions[symbol].push(dest_state); 
                        }
                    }
                }
            }

            //console.log("After iterating all substates of ", curr_states, " new transitions for this state will be ", new_transitions);

            for(let symbol in new_transitions){//make sure the list of states are sorted, then push them onto stack
                new_transitions[symbol] = new_transitions[symbol].sort();

                if(ans[new_transitions[symbol].join("-")] === undefined){ //don't process the same new state twice
                    //Check if is already on stack, can't use 'includes' to check if array is part of an array
                    //So this is a bit stinky but it works.
                    let in_stack = false;
                    for(let i of stack){
                        if(i.join("-") === new_transitions[symbol].join("-"))
                            in_stack = true;
                    }
                    if(!in_stack && !new_transitions[symbol].length == 0) // extra check to make sure we don't push empty state on.
                        stack.push(new_transitions[symbol]);
                }
                new_transitions[symbol] = [new_transitions[symbol].sort().join("-")]; //Now that we are done with all of our checks, we join the set of states
            }

            console.log("New Transitions for state: ", curr_states, " are: ",  new_transitions)
            ans[curr_states.join("-")] = new_transitions;
            //console.log(ans);
            
        }
        
        //need to remove all epsilonn transitions
        ans = this.#removeEpsilonTransitions(ans);
        //console.log(ans)
        let new_accept = this.#calculateAcceptStates(ans);

        return new FSA({"start": new_start.join("-"), "states": ans, "accept": new_accept})
    }

    /**
     * Creates a list containing the powerset of the given set. Algorithm:
     * - Add '' to array ans
     * - for element in set:
     * - choose a string in ans and add element+string to temp array
     * - after for loop, add all elements of temp to ans
     * @param {*} state_names A list of each state (name only) in the State Machine  
     */
    #getPowerSet(state_names){
        //I don't actually need to do this for the algorithm I intend on following.
        //The first algorithm I ever learnt used an approach that requires a powerset, then
        //simpliefies resulting DFA
        //Why not just build from start state outwards?? 
    }

    /**
     * 
     * @param {*} state the name (string) of the state for which to construct the closure
     * @returns an array representing epsilon closure
     */
    #epsilonClosure(state){
        var closure = [];
        var stack = [state];

        let i = 0;
        
        while( stack.length !== 0 && i < 10){
            var next_state = stack.pop(); 
            closure.push(next_state);
            
            if(this.#states[next_state][""] !== undefined){
                if(typeof(this.#states[next_state][""]) === "string" && !closure.includes(this.#states[next_state][""])){ //only one "" transition
                    stack.push(this.#states[next_state][""]);
                }
                else { // multiple "" transitions 
                    for(let s of this.#states[next_state][""])
                        if(! closure.includes(s))
                            stack.push(s);
                }
            }
        }

        return closure.sort();
    }

    /**
     * Determines Union of input set and all epsilon closures for each element of the set
     * @param {*} states an arrray of state names for which we calculate epsilon closure
     */
    #getReachableStates(states, state, symbol){

        let ans = [];

        if(typeof(states) === "string"){
            ans.push(states); 
        }
        else{
            //ans = states; //THIS WAS AN ISSUE: was not making a deep copy to if I made changes to ans it would impact states, which refers to original NFA object
            ans = JSON.parse(JSON.stringify(states)); //There is likely a better way of cloning, but this makes me feel like a Javascript developer/hacker
        }
        
        if(symbol === "") //state can reach itself on epsilon transition
            ans.push(state);
        //Below we get list of elements from potential epsilon closure after transitioning on 
        //Symbol in a separate array to add to the answer
        let temp = []
        for(let s of ans){
            let closure = this.#epsilonClosure(s);
            for(let i of closure){
                if(!ans.includes(i) && !temp.includes(i)){ //I don't like the 'of' and 'in' iteration methods in Javascript. They are too easy to confuse
                    temp.push(i);                          //Only add states that aren't already included in the 
                }
            }
        }

        while(temp.length != 0)
            ans.push(temp.pop());

        return ans.sort(); //names matter so ensuring elements are sorted means the name of the state is always consistent
    }

    #calculateAlphabet(){
        let symbols = {}
        for(let state in this.#states){
            for(let symbol in this.#states[state]){

                symbols[symbol] = []
            }
        }
        return symbols
    }

    #removeEpsilonTransitions(states){
        for(let state in states){
            delete states[state]['']
        }
        return states
    }

    #calculateAcceptStates(states){
        
        let accept_states = [];
        for(let state in states){
            let arr = state.split('-');
            for(let a of this.#accept){
 
                if(arr.includes(a) && ! accept_states.includes(state))
                    accept_states.push(state)
            }
        }
        return accept_states;
    }

    show(){
        console.log("Start State: ", this.#start);
        console.log("Accept States: ", this.#accept);
        console.log("Alphabet: ", this.#alphabet);
        console.log("Transitions: ", this.#states);
    }

    /**
     * 
     * TODO: do these get functions return references or copies?
     * Since they return references there is no point making these variables 
     * private (since they can actually be change outside of this class)
     * THIS NEEDS TO BE REWORKED.
     */
    getStates(){
        return this.#states;
    }

    getAccept(){
        return this.#accept;
    }

    getStart(){
        return this.#start;
    }

    getAlphabet(){
        return this.#alphabet;
    }

}

module.exports = {
    FSA: FSA
}


