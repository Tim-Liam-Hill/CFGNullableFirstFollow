const imports = require("../src/NullableFollowFirst.js")

//CFG Test ------------------------------------------------------------------

test('Simple Context Free Grammar with epsilon transitions', () => {
    const grammar = "T:=R\nT:=a T c\nR:=\nR:=b R";
    const cfg = new imports.CFG(grammar);
    expect(["T","R"].sort()).toEqual(cfg.getNonTerminals().sort());
    expect(["a","b","c"].sort()).toEqual(cfg.getTerminals().sort());
    expect({"T":["R","a T c"], "R":["","b R"]}).toMatchObject(cfg.getProductions());

});

/*
test('Grammar with no non-terminals', () => {
    const grammar = "T:=R\nR:=\nR:=b R";
    const cfg = new CFG(grammar);


});

test('Longer test with non-length 1 terminals and non-terminals', () => {
    const grammar = "T:=R\nT:=a T c\nR:=\nR:=b R";
    const cfg = new CFG(grammar);
});

test('Empty String', () => {
    const grammar = "T:=R\nT:=a T c\nR:=\nR:=b R";
    const cfg = new CFG(grammar);
});

test('Multiple newlines', () => {
    const grammar = "T:=R\n\n\nT:=a T c\nR:=\nR:=b R"
    const cfg = new CFG(grammar);
});*/