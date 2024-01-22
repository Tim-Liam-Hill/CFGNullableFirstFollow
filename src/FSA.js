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
     * @returns The equivalent DFA 
     */
    convert(){
        let ans = {};
        
        const new_start = this.#epsilonClosure(this.#start);
        let stack = [new_start];

        while(stack.length !== 0){
            let curr_states = stack.pop(); //its an array of at least length 1 containings strings that are names of States
            let new_transitions = JSON.parse(JSON.stringify(this.#alphabet)); //make a deep clone
            //console.log(curr_states); 

            for(let state of curr_states){ //state is one of the states of the NFA comprising a new state 'curr_states' 

                for(let symbol in this.#states[state]){ //Iterates through each symbol that this state has transitions on.

                    let states_to_add = this.#getReachableStates(this.#states[state][symbol], state, symbol);
                    //console.log("For state: ", state, " and symbol: ", symbol, " new transitions are ", states_to_add)
                    
                    //There is an issue somewhere here, we are adding states individually that should be 
                    //concatenated together I believe
                    
                    if(! new_transitions[symbol].includes(states_to_add.join("-")))
                        new_transitions[symbol].push(states_to_add.join("-"));
                    
                }
            }

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
            }
            //console.log("After processing ", curr_states.join(","), " stack is ", stack)
            //console.log("------------------------------------") 
            //console.log()


            //console.log("New Transitions for state: ", curr_states, " are: ",  new_transitions)
            ans[curr_states.join("-")] = new_transitions;
            //console.log(ans)
            
        }
        
        //need to remove all epsilonn transitions
        ans = this.#removeEpsilonTransitions(ans)
        //console.log(ans)
        let new_accept = this.#calculateAcceptStates(ans)

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
        var closure = []
        var stack = [state]

        let i = 0;
        
        while( stack.length !== 0 && i < 10){
            var next_state = stack.pop(); 
            closure.push(next_state);
            
            if(this.#states[next_state][""] !== undefined){
                if(typeof(this.#states[next_state][""]) === "string" && !closure.includes(this.#states[next_state][""])){ //only one "" transition
                    stack.push(this.#states[next_state][""])
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
        let ans = []

        if(typeof(states) === "string"){
            ans.push(states)
        }
        else{
            ans = states;
        }
        
        if(symbol === "") //state can reach itself on epsilon transition
            ans.push(state)

        let temp = []
        for(let s of ans){
            let closure = this.#epsilonClosure(s)
            for(let i of closure){
                if(!ans.includes(i) && !temp.includes(i)){ //I don't like the 'of' and 'in' iteration methods in java. They are too easy to confuse
                    temp.push(i) 
                }
            }
        }

        while(temp.length != 0)
            ans.push(temp.pop())

        return ans.sort();
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

    getStates(){
        return this.#states;
    }

    getAccept(){
        return this.#accept;
    }

    getStart(){
        return this.#start;
    }

}

module.exports = {
    FSA: FSA
}


