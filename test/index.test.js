const imports = require("../src/NullableFollowFirst.js")

//CFG Test ------------------------------------------------------------------

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

// First tests ---------------------------------------------------------------------------------

test('Simple First case', () => {
    const grammar = "T:=R\nT:=a T c\nR:=\nR:=b R";
    const cfg = new imports.CFG(grammar);
    const nullable = new imports.Nullable(cfg);
    const first = new imports.First(cfg,nullable);
    expect({"T": ["a","b"], "R":["b"]}).toMatchObject(first.getFirst());
});


//Need to test cyclic grammars

