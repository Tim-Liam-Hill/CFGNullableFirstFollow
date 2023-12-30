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