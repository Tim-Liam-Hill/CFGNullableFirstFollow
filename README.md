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
* unit tests
* Incorporate with other tools (NFA to DFA converter)
* LOGGING!!!!

Tests:

* Empty file
* Empty lines in file
