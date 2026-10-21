export type NodeType = 
// STATEMENTS
| "Program" 
| "VarDeclaration"

// EXPRESSIONS 
| "AssignmentExpr"

// LITERALS
| "Property"
| "ObjectLiteral"
| "NumericLiteral" 
| "Identifier" 
| "BinaryExpr" 


// stmt goes for statement --> acts like an abstract class
// does not return a value (statement)
export interface Stmt {
    kind: NodeType
}

export interface Expr extends Stmt {}

export interface Program extends Stmt {
    kind: "Program",
    body: Stmt[];
}

// let x; // x is undefined
export interface VarDeclaration extends Stmt {
    kind: "VarDeclaration",
    constant: boolean,
    identifier: string,
    value?: Expr
}

// expressions do return values
export interface BinaryExpr extends Expr {
    kind: "BinaryExpr"
    left: Expr,
    right: Expr,
    operator: string;
}

export interface Identifier extends Expr {
    kind: "Identifier",
    symbol: string;
}

export interface NumericLiteral extends Expr {
    kind: "NumericLiteral",
    value: number;
}

export interface AssignmentExpr extends Expr {
    kind: "AssignmentExpr",
    assigne: Expr,
    value: Expr
}

export interface Property extends Expr {
    kind: "Property",
    key: string,
    value?: Expr,
}

export interface ObjectLiteral extends Expr {
    type: "ObjectLiteral";
    properties: Property[]
}