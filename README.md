# CFGNullableFirstFollow

A helper program that, given a Context Free Grammar, calculates the Nullable, First and Follow sets for each non-terminal.

## Input format

The input should be a Context free grammar in which:

* Each production is on a new line
* The left and right hand sides of the production are separated by ':='
* each distinct terminal/non-terminal is separated by a space (if a space is part of your CFG then add in a nonterminal that represents a space)
* A null production has an empty RHS

Example:

T := R

T := a T c

R :=

R := b R

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
