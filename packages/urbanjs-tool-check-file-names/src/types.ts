export const TYPE_TOOL_CHECK_FILE_NAMES = Symbol('TYPE_TOOL_CHECK_FILE_NAMES');

export type CheckFileNamesConfig = {
  upperCase?: string | string[];
  upperCaseFirst?: string | string[];
  lowerCase?: string | string[];
  sentenceCase?: string | string[];
  titleCase?: string | string[];
  camelCase?: string | string[];
  pascalCase?: string | string[];
  snakeCase?: string | string[];
  paramCase?: string | string[];
  dotCase?: string | string[];
  pathCase?: string | string[];
  constantCase?: string | string[];
};
