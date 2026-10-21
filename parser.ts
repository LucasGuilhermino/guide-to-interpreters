import { Stmt, Program, Expr, BinaryExpr, NumericLiteral, Identifier, VarDeclaration, AssignmentExpr, Property, ObjectLiteral} from "./ast.ts";
import { tokenize, Token, TokenType } from "./lexer.ts";

export default class Parser {
    private tokens: Token[] = [];

    private not_eof(): boolean {
        return this.tokens[0].type != TokenType.EOF;
    }

    private at() {
        return this.tokens[0] as Token;
    }

    private eat() {
        const prev = this.tokens.shift() as Token;
        return prev;
    }

    private expect(type: TokenType, err: any){
        const prev = this.tokens.shift() as Token;
        if(!prev || prev.type != type){
            console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
            Deno.exit(1);
        }

        return prev;
    }

    public produceAST(sourceCode: string): Program {
        this.tokens = tokenize(sourceCode);
        const program: Program = {
            kind: "Program",
            body: []
        };

        // Parse until end of file
        while(this.not_eof()){
            program.body.push(this.parse_stmt());
        }

        return program;

    }

    private parse_stmt (): Stmt {
        // skip to parse_expr
        switch(this.at().type){
            case TokenType.Let:
            case TokenType.Const:
                return this.parse_var_declaration();
            default:
                return this.parse_expr();

        }
    }

    // LET IDENT;
    // (CONST | LET ) IDENT = EXPR;  
    private parse_var_declaration(): Stmt {
        const isConstant = this.eat().type == TokenType.Const;
        const identifier = this.expect(TokenType.Identifier, "Expected identifier name folloowing let | const keywords. ").value;

        if (this.at().type == TokenType.Semicolon){
            this.eat(); // expect semicolon
            if (isConstant) 
                throw "Must assign value to constant expression. No value provided.";

            return {kind: "VarDeclaration", identifier, constant: false, value: undefined} as VarDeclaration;

        }

        this.expect(TokenType.Equals, "Expected equals token following identifier in var declaration");
        const declaration = {kind: "VarDeclaration", identifier, value: this.parse_expr(), constant: isConstant} as VarDeclaration;

        this.expect(TokenType.Semicolon, "Variable declaration statment must end with semicolon");


        return declaration;

    }

    private parse_expr(): Expr {
        return this.parse_assignment_expr();
    }

    private parse_assignment_expr(): Expr {
        const left = this.parse_object_expr() // switch this out with objectExpr

        if (this.at().type == TokenType.Equals){
            this.eat() // advance past equals
            const value = this.parse_assignment_expr(); // allow chaining
            return {value, assigne: left, kind: "AssignmentExpr"} as AssignmentExpr;
        }

        return left;

    }

    private parse_object_expr(): Expr {
        // {Prop[]}

        if (this.at().type !== TokenType.OpenBracket) {
            return this.parse_additive_expr();
        }

        this.eat(); // advances past open Bracket
        const properties = new Array<Property>();

        while (this.not_eof() && this.at().type != TokenType.CloseBracket){

            // {key: val, key2: val}
            const key = this.expect(TokenType.Identifier, "Object literal key expected").value;

            // Allows shorthand key: pair -> { key, }
            if ((this.at().type == TokenType.Comma)){
                this.eat(); // advance past commma
                properties.push({key, kind: "Property", value: undefined} as Property);
                continue;
            } // Allows shorthand key -> { key } 
            else if (this.at().type == TokenType.CloseBracket) {
                properties.push({key, kind: "Property", value: undefined});
                continue;
            }

            // { key: val }
            this.expect(TokenType.Colon, "Missing colob following identifier in ObjectExpr")
            const value = this.parse_expr();

            properties.push({kind: "Property", value, key});
            if (this.at().type != TokenType.CloseBracket) {
                this.expect(TokenType.Comma, "Expected comma or closing bracket following property.");
            }


            // {key}


        }

        this.expect(TokenType.CloseBracket, "Object literal missing closing Bracket.")
        return {kind: "ObjectLiteral", properties} as ObjectLiteral;
    }

    // 45 * 3 - 5
    private parse_additive_expr(): Expr {
        let left = this.parse_multiplicative_expr();

        while (this.at().value == "+" || this.at().value == "-"){
            const operator = this.eat().value;
            const right = this.parse_multiplicative_expr();
            left = {
                kind: "BinaryExpr",
                left, right, operator,
            } as BinaryExpr;
        }

        return left;

    }

        private parse_multiplicative_expr(): Expr {
        let left = this.parse_primary_expr();

        while (this.at().value == "/" || this.at().value == "*" || this.at().value == "%"){
            const operator = this.eat().value;
            const right = this.parse_primary_expr();
            left = {
                kind: "BinaryExpr",
                left, right, operator,
            } as BinaryExpr;
        }

        return left;

    }

    //Orders of Prescidence: AssignmentExpr, MemberExpr, FunctionCall, LogicalExpr, ComparisonExpr, AdditiveExpr, MultiplicitaveExpr, PrimaryExpr
    private parse_primary_expr(): Expr {
        const tk = this.at().type;

        switch(tk) {
            case TokenType.Identifier:
                return {kind: "Identifier", symbol: this.eat().value} as Identifier;
            case TokenType.Number:
                return {kind: "NumericLiteral", value: parseFloat(this.eat().value)} as NumericLiteral;
            case TokenType.OpenParen: {
                this.eat(); //eat the opening paren;
                const value = this.parse_expr();
                this.expect(TokenType.CloseParen, "unexpected token found inside parenthesised expression. Expected closing parenthesis."); // eat closing paren;
                return value;
            }      
            default:
                console.error("Unexpected token found during parsing!", this.at());
                Deno.exit(1);
        }
    }
}