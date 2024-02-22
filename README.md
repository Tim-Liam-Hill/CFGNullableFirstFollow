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
* First line must always be start symbol production.

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

* rename resultant DFA states

It is convenient to have DFA states be comprised of all the NFA substates that make up this state, but once all calculations are complete and there are no conflicts it is best to rename these states since the DFA states have very long names, making the resultant table far larger than needed. This only really matters if the table is going to be printed out and used elsewhere but it is still a nice thing to do in my opinion.

* Throw better errors, put error message in the exception, don't log it to console
* Have a way of specifying regex for non-terminals in the cfg file itself (similar to [how the python implementation seems to do it](https://github.com/python/cpython/blob/main/Grammar/python.gram)). This can be incorporated into a lexer of sorts.

What we could do is have certain lines with a different separator (eg: instead of ":=" use ":>" and these lines are interpreted as RHS is non-terminal and LHS is regex expression for the valid values of that non-terminal). Will likely need to build my own Regex engine to handle that (which is fine since I wanted to do that anyway, but in c++. Can do it in both languages I suppose?)

#### Lexical Analysis

A nice idea would be to add onto this tool by allowing for lexical analysis. That is to say: allow a user to map a regular expression to a non-terminal in the CFG. That way, you can input a CFG, regular expressions for the terminals and an example string to see if said string is a valid program given the definitions provided.

Will likely only get to this later: the lexer for my programming language is very simple so I haven't needed to create a generalized lexer generator.

If we build this we could actually solve some problems for the SLR table parser and convert it to work on tokens (ie a token class) and not strings.

* regex engine

We are basically halfway there since we have the NFA/DFA converter, so that will probably be what I do next. I might want to do it in a different language though (to spice things up)
