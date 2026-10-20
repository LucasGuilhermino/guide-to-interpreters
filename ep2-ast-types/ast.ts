export type NodeType = "Program" | "NumericLiteral" | "Identifier" | "BinaryExpr" | "CallExpr" | "UnaryExpr" | "FunctionDeclaration";

// stmt goes for statement --> acts like an abstract class
// does not return a value (statement)
export interface Stmt {
    kind: NodeType
}

export interface Program extends Stmt {
    kind: "Program",
    body: Stmt[];
}

export interface Expr extends Stmt {}

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