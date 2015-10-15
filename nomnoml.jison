%lex
%%

\s*\|\s*                          return '|'
(\\(\[|\]|\|)|[^\]\[|;\n])+       return 'IDENT'
"["                               return '['
\s*\]                             return ']'
[ ]*(\;|\n)+[ ]*                  return 'SEP'
<<EOF>>                           return 'EOF'
.                                 return 'INVALID'

/lex

%start root

%% /* ------------------------------------------------- */

root
    : compartment EOF      { return $1 };

slot
  : IDENT                  {$$ = $1.trim().replace(/\\(\[|\]|\|)/g, '$'+'1');}
  | class                  {$$ = $1;}
  | association            {$$ = $1;};

compartment
  : slot                   {$$ = [$1];}
  | compartment SEP slot   {$$ = $1.concat($3);};

parts
  : compartment            {$$ = [$1];}
  | parts '|' compartment  {$$ = $1.concat([$3]);}
  | parts '|'              {$$ = $1.concat([[]]);};

association
  : class IDENT class      {
           var t = $2.trim().replace(/\\(\[|\]|\|)/g, '$'+'1').match('^(.*?)([<:o+]*-/?-*[:o+>]*)(.*)$');
           $$ = {assoc:t[2], start:$1, end:$3, startLabel:t[1].trim(), endLabel:t[3].trim()};
  };

class
  : '[' parts ']'          {
           var type = 'CLASS';
           var id = $2[0][0];
           var typeMatch = $2[0][0].match('<([a-z]*)>(.*)');
           if (typeMatch) {
               type = typeMatch[1].toUpperCase();
               id = typeMatch[2].trim();
           }
           $2[0][0] = id;
           $$ = {type:type, id:id, parts:$2};
  };