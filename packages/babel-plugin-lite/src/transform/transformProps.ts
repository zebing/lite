import { NodePath } from '@babel/traverse';
import {
  nullLiteral,
  JSXAttribute,
  JSXSpreadAttribute,
  objectProperty,
  ObjectProperty,
  identifier,
  JSXExpressionContainer,
  StringLiteral,
  Expression,
  SpreadElement,
  spreadElement,
  objectExpression,
} from '@babel/types';
import { State } from '../types';
import { getTagLiteral } from '../utils';
import transformChildren from './transformChildren';
import transformJSXElement from './transformJSXElement';
import transformJSXRoot from './transformJSXRoot';
import Render from '../render';

export default function transformProps(
  path: NodePath<JSXAttribute | JSXSpreadAttribute>[],
  state: State,
  render: Render,
) {
  if (!path.length) {
    return objectExpression([]);
  }

  const properties: (ObjectProperty | SpreadElement)[] = [];

  path.forEach((attribute) => {
    // JSXAttribute
    if (attribute.isJSXAttribute()) {
      const nameLiteral = attribute.get('name').getSource();
      const value = attribute.get('value');

      if (
        value.isJSXElement() // JSXElement <div child=<div></div>></div>
        || value.isJSXFragment() // JSXFragment <div child=<></>></div>
      ) {
        const subRender = new Render({
          nodePath: value,
          state,
        });
        transformJSXRoot(value, state, subRender);
        const renderFunctionDeclaration = render.hoist(
          subRender.generateFunctionDeclaration()
        );
        properties.push(objectProperty(
          identifier(nameLiteral),
          renderFunctionDeclaration,
        ));

        // JSXExpressionContainer
        // {expression}
      } else if (value.isJSXExpressionContainer()) {
        const expression = value.get('expression');

        if (
          expression.isJSXElement() // JSXElement <div child={<div></div>}></div>
          || expression.isJSXFragment() // JSXFragment <div child={<></>}></div>
        ) {
          const subRender = new Render({
            nodePath: value,
            state,
          });
          transformJSXRoot(expression, state, subRender);
          const renderFunctionDeclaration = render.hoist(
            subRender.generateFunctionDeclaration()
          );
          properties.push(objectProperty(
            identifier(nameLiteral),
            renderFunctionDeclaration,
          ));

        } else if (expression.isExpression()) {
          properties.push(objectProperty(
            identifier(nameLiteral),
            expression.node,
          ));
        }
        
        // StringLiteral
      } else if (value.isStringLiteral()) {
        properties.push(objectProperty(
          identifier(nameLiteral),
          value.node,
        ));
      }

      // JSXSpreadAttribute
    } else {
      properties.push(spreadElement((attribute.node as JSXSpreadAttribute).argument));
    }
  });


  return objectExpression(properties);
}