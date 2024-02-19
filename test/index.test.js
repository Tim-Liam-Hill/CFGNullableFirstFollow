const imports = require("../src/NullableFollowFirst.js")
const SLR = require("../src/SLRTable.js");

//CFG Test ------------------------------------------------------------------
//TODO: add tests for start symbol 
test('Simple Context Free Grammar with epsilon transitions', () => {
    const grammar = "T:=R\nT:=a T c\nR:=\nR:=b R";
    const cfg = new imports.CFG(grammar);
    expect(["T","R"].sort()).toEqual(cfg.getNonTerminals().sort());
    expect(["a","b","c"].sort()).toEqual(cfg.getTerminals().sort());
    expect({"T":["R","a T c"], "R":["","b R"]}).toMatchObject(cfg.getProductions());

});


test('Grammar with no non-terminals', () => {
    const grammar = "T:=R\nR:=\nR:=T";
    const cfg = new imports.CFG(grammar);
    expect(["T","R"].sort()).toEqual(cfg.getNonTerminals().sort());
    expect([]).toEqual(cfg.getTerminals().sort());
    expect({"T":["R"], "R":["","T"]}).toMatchObject(cfg.getProductions());

});


test('Longer test with non-length 1 terminals and non-terminals', () => {
    const grammar = "Boolean:=Boolean or Boolean\nBoolean:=Boolean and Boolean\nBoolean:=not Boolean\nBoolean:=true\nBoolean:=false";
    const cfg = new imports.CFG(grammar);
    expect(["Boolean"].sort()).toEqual(cfg.getNonTerminals().sort());
    expect(["true","false","and","or","not"].sort()).toEqual(cfg.getTerminals().sort());
    expect({"Boolean":["Boolean or Boolean","Boolean and Boolean","not Boolean","true","false"]}).toMatchObject(cfg.getProductions());
});

test('Empty String', () => {
    const grammar = "";
    const cfg = new imports.CFG(grammar);
    expect([]).toEqual(cfg.getNonTerminals().sort());
    expect([]).toEqual(cfg.getTerminals().sort());
    expect({}).toMatchObject(cfg.getProductions());

});

test('Multiple newlines', () => {
    const grammar = "T:=R\n\n\nT:=a T c\nR:=\nR:=b R"
    const cfg = new imports.CFG(grammar);
    expect(["T","R"].sort()).toEqual(cfg.getNonTerminals().sort());
    expect(["a","b","c"].sort()).toEqual(cfg.getTerminals().sort());
    expect({"T":["R","a T c"], "R":["","b R"]}).toMatchObject(cfg.getProductions());

});

//Nullable Tests -------------------------------------------------------------------------------

test('Simple Nullable case', () => {
    const grammar = "T:=R\nT:=a T c\nR:=\nR:=b R";
    const cfg = new imports.CFG(grammar);
    const nullable = new imports.Nullable(cfg);
    expect({"T":true, "R":true}).toMatchObject(nullable.getNullable());
});

test('Case where rules reference each other and nullable', () => {
    const grammar = "A:=BB\nA:=C\nB:=A\nC:=w\nC:=";
    const cfg = new imports.CFG(grammar);
    const nullable = new imports.Nullable(cfg);
    expect({"A":true, "B":true, "C":true}).toMatchObject(nullable.getNullable());
});


test('Case where rules reference each other and not nullable', () => {
    const grammar = "A:=BB\nA:=C\nB:=A\nC:=w\nC:=h";
    const cfg = new imports.CFG(grammar);
    const nullable = new imports.Nullable(cfg);
    expect({"A":false, "B":false, "C":false}).toMatchObject(nullable.getNullable());
});

test('Empty Grammar', () => {
    const grammar = "";
    const cfg = new imports.CFG(grammar);
    const nullable = new imports.Nullable(cfg);
    expect({}).toMatchObject(nullable.getNullable());
});

/*
A:=B
A:=
B:=C
C:=A
*/
test('Cyclical grammar 1', () => {
    const grammar = "A:=B\nA:=\nB:=C\nC:=A";
    const cfg = new imports.CFG(grammar);
    const nullable = new imports.Nullable(cfg);
    expect({"A": true, "B":true, "C": true}).toMatchObject(nullable.getNullable());
});

/*
A:=B
B:=C
C:=A
C:=
*/
test('Cyclical grammar 1', () => {
    const grammar = "A:=B\n\nB:=C\nC:=A\nC:=";
    const cfg = new imports.CFG(grammar);
    const nullable = new imports.Nullable(cfg);
    expect({"A": true, "B":true, "C": true}).toMatchObject(nullable.getNullable());
});

// First tests ---------------------------------------------------------------------------------

test('Simple First case', () => {
    const grammar = "T:=R\nT:=a T c\nR:=\nR:=b R";
    const cfg = new imports.CFG(grammar);
    const nullable = new imports.Nullable(cfg);
    const first = new imports.First(cfg,nullable);
    expect({"T": ["a","b"], "R":["b"]}).toMatchObject(first.getFirst());
});


//Need to test cyclic grammars
/*
A:=B
B:=A
A:=axe
B:=dolphin
B:=C wizard
C:= 
C:=scary
*/
test('Cyclical grammar 1', () => {
    const grammar = "A:=B\nB:=A\nA:=axe\nB:=dolphin\nB:=C wizard\nC:=\nC:=scary";
    const cfg = new imports.CFG(grammar);
    const nullable = new imports.Nullable(cfg);
    const first = new imports.First(cfg,nullable);
    expect({"A": ["axe","dolphin","scary","wizard"], "B": ["axe","dolphin","scary","wizard"], "C": ["scary"]}).toMatchObject(first.getFirst());
});

/*
A:=B
A:=axe
B:=C
B:=banana
C:=A
C:=scary
*/
test('Cyclical gramar 2', () => {
    const grammar = "A:=B\nA:=axe\nB:=C\nB:=banana\nC:=A\nC:=scary";
    const cfg = new imports.CFG(grammar);
    const nullable = new imports.Nullable(cfg);
    const first = new imports.First(cfg,nullable);
    expect({"A": ["axe","banana","scary"], "B": ["axe","banana","scary"], "C": ["axe","banana","scary"]}).toMatchObject(first.getFirst());
});

//Follow Tests -------------------------------------------------------------------------------

/*
T:=R
T:=a T c
R:=
R:=b R
*/

test('Simple Context Free Grammar with epsilon transitions', () => {
    const grammar = "T:=R\nT:=a T c\nR:=\nR:=b R";
    const cfg = new imports.CFG(grammar);
    const nullable = new imports.Nullable(cfg);
    const first = new imports.First(cfg, nullable);
    const follow = new imports.Follow(cfg, nullable, first);
    expect({"T": ["c"], "R": ["c"]}).toMatchObject(follow.getFollow());
});

/*
A:=x G H F s T
A:=Z x
A:=w 
G:=T r t 
H:=
H:=m
F:=Z
T:=fin
Z:=bees
*/

test('More complex grammar: multiple non_terminals in one rule', () => {
    const grammar = "A:=x G H F s T\nA:=Z x\nA:=w\nG:=T r t\nH:=\nH:=m\nF:=Z\nT:=fin\nZ:=bees";
    const cfg = new imports.CFG(grammar);
    const nullable = new imports.Nullable(cfg);
    const first = new imports.First(cfg, nullable);
    const follow = new imports.Follow(cfg, nullable, first);
    expect({"A": [], "G": ["bees","m"], "H": ["bees"], "F":["s"], "T":["r"], "Z":["s","x"]}).toMatchObject(follow.getFollow());
});


//SLR Tests -------------------------------------------------------------------------------
//Not sure how best to test the SLR table
//My thinking is that I should test whether or not the resultant SLR table 
//can correctly parse input languages for certain grammars, but I likely should test 
//the actual contents of the SLR table itself. 

test('Simple Context Free Grammar with epsilon transitions', () => {
    const grammar = "T:=R\nT:=a T c\nR:=\nR:=b R";
    const tokens = ["a","a","b","b","b","c","c"];
    const slr_table = new SLR.SLRTable(grammar);



});
