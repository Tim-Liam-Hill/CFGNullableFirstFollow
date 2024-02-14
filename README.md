# CFGNullableFirstFollow

A helper program that, given a Context Free Grammar, calculates the Nullable, First and Follow sets for each non-terminal.

This project has now evolved a bit: It includes code copied over from my NFAtoDFA converter. The idea is to create a SLR table for a given CFG, because that is very useful for the programming language I am creating.

Yes, I could have used ANTLR or something similar but I wanted to do this myself for fun. Yay.

## Input format

The input should be a Context free grammar in which:

* Each production is on a new line
* The left and right hand sides of the production are separated by ':='
* each distinct terminal/non-terminal is separated by a space (if a space is part of your CFG then add in a nonterminal that represents a space)
* A null production has an empty RHS
* No spaces between := and LHS/RHS
* First line LHS symbol is start symbol and only appears on LHS of production once

Example:

T:=R

T:=a T c

R:=

R:=b R

While it isn't necessary to have non-terminals be uppercase and terminals lowercase, it helps to have some sort of visual distinction between the two.

## Output

The 3 sets describing the nullable, first and follow for each non-terminal.

## TODO

* better names for files and classes
* unit tests - add one for CFG start symbol.
* Decide on limits/structure that initial CFG file has to adhere to.
* Incorporate with other tools (NFA to DFA converter) ✔
* LOGGING!!!!
* Linter
* Maybe make the logic a bit clearer at places (aka: come back a few months after this is done and see how to make it read better. Iteration could definitely be a bit better).

For the SLR table:

* how do we want it to determine first state?

The first state for the nfa should correlate to the start state of the CFG, so maybe we need to add some extra info into how we code our CFG. The simplest way to do this is to just assume the LHS symbol of the first line of the input file is the start symbol and take things from there.

* Fix the private variable aspect of FSA and related classes

There isn't really a point to having private variables with get methods in the FSA class if we are returning references. This will lead to bugs if any other code alters the returned object. Either change the getters somehow or just remove the getters entirely and treat these classes more as structs.
