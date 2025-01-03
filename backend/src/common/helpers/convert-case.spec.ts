import { camelToSnakeCase, camelToSnakeCaseObject, snakeToCamelCase, snakeToCamelCaseObject } from './convert-case';

const camelCaseObject = {
  exampleCase: 'exampleValue',
  exampleArray: [1, 2, 3],
  exampleObjectArray: [
    { exampleChildCase: 'exampleValue 1' },
    { exampleChildCase: 'exampleValue 2' },
    { exampleChildCase: 'exampleValue 3' }
  ],
  exampleObject: {
    exampleChildOne: 'exampleValue 1',
    exampleChildTwo: 'exampleValue 2',
    exampleThird: {
      exampleGrandChild: 'exampleValue',
      exampleGrandArray: [
        { exampleItem: 'exampleValue' }
      ]
    }
  }
};

const snakeCaseObject = {
  example_case: 'exampleValue',
  example_array: [1, 2, 3],
  example_object_array: [
    { example_child_case: 'exampleValue 1' },
    { example_child_case: 'exampleValue 2' },
    { example_child_case: 'exampleValue 3' }
  ],
  example_object: {
    example_child_one: 'exampleValue 1',
    example_child_two: 'exampleValue 2',
    example_third: {
      example_grand_child: 'exampleValue',
      example_grand_array: [
        { example_item: 'exampleValue' }
      ]
    }
  }
};

describe('Convert Case Helper', () => {
  describe('camelToSnakeCase()', () => {
    it('camelCase → snake_case', () => {
      expect(camelToSnakeCase('exampleCase')).toBe('example_case');
    });
  });
  
  describe('camelToSnakeCaseObject()', () => {
    it('camelCase → snake_case オブジェクト', () => {
      expect(camelToSnakeCaseObject(camelCaseObject)).toEqual(snakeCaseObject);
    });
  });
  
  describe('snakeToCamelCase()', () => {
    it('snake_case → camelCase', () => {
      expect(snakeToCamelCase('example_case')).toBe('exampleCase');
    });
  });
  
  describe('snakeToCamelCaseObject()', () => {
    it('snake_case → camelCase オブジェクト', () => {
      expect(snakeToCamelCaseObject(snakeCaseObject)).toEqual(camelCaseObject);
    });
  });
});
